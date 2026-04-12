import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { usePopstateViewTransitions } from '@/lib/navigation';
import { AuthGuard } from '@/features/auth/auth-guard';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
import AppShell from '@/components/layout/app-shell';
import CallbackPage from '@/features/auth/callback-page';
import LoginPage from '@/features/auth/login-page';
import DashboardPage from '@/features/dashboard/page';
import WalletsPage from '@/features/wallets/page';
import TransactionsPage from '@/features/transactions/page';
import BudgetsPage from '@/features/budgets/page';
import WalletDetailPage from '@/features/wallets/wallet-detail-page';
const SettingsPage = lazy(() => import('@/features/settings/page'));
const CreateWalletPage = lazy(() => import('@/features/wallets/create-wallet-page'));
const EditWalletPage = lazy(() => import('@/features/wallets/edit-wallet-page'));
const CreateTransactionPage = lazy(() => import('@/features/transactions/create-transaction-page'));
const CreateBudgetPage = lazy(() => import('@/features/budgets/create-budget-page'));
const EditBudgetPage = lazy(() => import('@/features/budgets/edit-budget-page'));
const CategoriesPage = lazy(() => import('@/features/categories/page'));

export default function AppRoutes() {
  usePopstateViewTransitions();

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
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
      </Route>

      {/* Full-screen routes: no bottom nav */}
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
        <Route path="/profile" element={<SettingsPage />} />
        <Route path="/wallets/:id" element={<WalletDetailPage />} />
        <Route path="/wallets/new" element={<CreateWalletPage />} />
        <Route path="/wallets/:id/edit" element={<EditWalletPage />} />
        <Route path="/transactions/new" element={<CreateTransactionPage />} />
        <Route path="/budgets/new" element={<CreateBudgetPage />} />
        <Route path="/budgets/:id/edit" element={<EditBudgetPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
