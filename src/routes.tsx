import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { AuthGuard } from '@/features/auth/auth-guard';
import AppShell from '@/components/layout/app-shell';
import CallbackPage from '@/features/auth/callback-page';
import LoginPage from '@/features/auth/login-page';
import DashboardPage from '@/features/dashboard/page';
import WalletsPage from '@/features/wallets/page';
import WalletDetailPage from '@/features/wallets/wallet-detail-page';

const CreateWalletPage = lazy(() => import('@/features/wallets/create-wallet-page'));
const EditWalletPage = lazy(() => import('@/features/wallets/edit-wallet-page'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />

      {/* AppShell routes: include bottom nav */}
      <Route
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="/wallets/:id" element={<WalletDetailPage />} />
      </Route>

      {/* Modal-style routes: full-screen, no bottom nav, lazy loaded */}
      <Route
        element={
          <AuthGuard>
            <Suspense
              fallback={
                <div className="bg-background flex h-dvh items-center justify-center">
                  <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </AuthGuard>
        }
      >
        <Route path="/wallets/new" element={<CreateWalletPage />} />
        <Route path="/wallets/:id/edit" element={<EditWalletPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
