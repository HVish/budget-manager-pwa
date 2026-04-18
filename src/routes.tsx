import { lazy, Suspense, type ComponentType } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { usePopstateViewTransitions } from '@/lib/navigation';
import { AuthGuard } from '@/features/auth/auth-guard';
import {
  FormPageSkeleton,
  DetailPageSkeleton,
  ListPageSkeleton,
} from '@/components/layout/page-skeleton';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

/** Wraps a lazy component in its own Suspense boundary so the skeleton
 *  renders synchronously via flushSync during view transitions — a fresh
 *  Suspense always shows its fallback, unlike a shared one that keeps
 *  the previous page visible. */
function lazyPage(importFn: () => Promise<{ default: ComponentType }>, Fallback: ComponentType) {
  const LazyComponent = lazy(importFn);
  return function LazyPage() {
    return (
      <Suspense fallback={<Fallback />}>
        <LazyComponent />
      </Suspense>
    );
  };
}

import AppShell from '@/components/layout/app-shell';
import CallbackPage from '@/features/auth/callback-page';
import LoginPage from '@/features/auth/login-page';
import DashboardPage from '@/features/dashboard/page';
import WalletsPage from '@/features/wallets/page';
import TransactionsPage from '@/features/transactions/page';
import BudgetsPage from '@/features/budgets/page';
import WalletDetailPage from '@/features/wallets/wallet-detail-page';

const SettingsPage = lazyPage(() => import('@/features/settings/page'), ListPageSkeleton);
const CreateWalletPage = lazyPage(
  () => import('@/features/wallets/create-wallet-page'),
  FormPageSkeleton,
);
const EditWalletPage = lazyPage(
  () => import('@/features/wallets/edit-wallet-page'),
  FormPageSkeleton,
);
const TransactionDetailPage = lazyPage(
  () => import('@/features/transactions/transaction-detail-page'),
  DetailPageSkeleton,
);
const EditTransactionPage = lazyPage(
  () => import('@/features/transactions/edit-transaction-page'),
  FormPageSkeleton,
);
const CreateTransactionPage = lazyPage(
  () => import('@/features/transactions/create-transaction-page'),
  FormPageSkeleton,
);
const CreateBudgetPage = lazyPage(
  () => import('@/features/budgets/create-budget-page'),
  FormPageSkeleton,
);
const EditBudgetPage = lazyPage(
  () => import('@/features/budgets/edit-budget-page'),
  FormPageSkeleton,
);
const CategoriesPage = lazyPage(() => import('@/features/categories/page'), ListPageSkeleton);

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

      {/* Full-screen routes: each lazy route has its own Suspense skeleton */}
      <Route
        element={
          <AuthGuard>
            <Outlet />
          </AuthGuard>
        }
      >
        <Route path="/profile" element={<SettingsPage />} />
        <Route path="/wallets/:id" element={<WalletDetailPage />} />
        <Route path="/wallets/new" element={<CreateWalletPage />} />
        <Route path="/wallets/:id/edit" element={<EditWalletPage />} />
        <Route path="/transactions/:id" element={<TransactionDetailPage />} />
        <Route path="/transactions/:id/edit" element={<EditTransactionPage />} />
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
