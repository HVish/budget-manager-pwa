import ky from 'ky';

let _getToken: (() => Promise<string>) | null = null;

export function setTokenGetter(fn: () => Promise<string>) {
  _getToken = fn;
}

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_ORIGIN,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (_getToken) {
          const token = await _getToken();
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});
