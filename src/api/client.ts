import ky from 'ky';

let _getToken: (() => Promise<string>) | null = null;
let _refreshToken: (() => Promise<string>) | null = null;
let _logout: (() => void) | null = null;
let _logoutCalled = false;

export function setTokenGetter(fn: (() => Promise<string>) | null) {
  _getToken = fn;
}

export function setTokenRefresher(fn: (() => Promise<string>) | null) {
  _refreshToken = fn;
}

export function setLogout(fn: (() => void) | null) {
  _logout = fn;
  _logoutCalled = false;
}

function safeLogout() {
  if (_logoutCalled) return;
  _logoutCalled = true;
  _logout?.();
}

let _refreshPromise: Promise<string> | null = null;

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_ORIGIN,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (_getToken) {
          try {
            const token = await _getToken();
            request.headers.set('Authorization', `Bearer ${token}`);
          } catch {
            safeLogout();
            throw new Error('Token acquisition failed');
          }
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401 || !_refreshToken) return;

        // Don't retry if we already retried this request
        if (request.headers.has('X-Auth-Retry')) return;

        try {
          // Deduplicate concurrent refresh calls into a single request
          if (!_refreshPromise) {
            _refreshPromise = _refreshToken().finally(() => {
              _refreshPromise = null;
            });
          }
          const freshToken = await _refreshPromise;

          request.headers.set('Authorization', `Bearer ${freshToken}`);
          request.headers.set('X-Auth-Retry', '1');
          return api(request);
        } catch {
          safeLogout();
        }
      },
    ],
  },
});
