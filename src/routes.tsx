import { Routes, Route, Navigate } from "react-router";
import { AuthGuard } from "@/features/auth/auth-guard";
import AppShell from "@/components/layout/app-shell";
import CallbackPage from "@/features/auth/callback-page";
import LoginPage from "@/features/auth/login-page";
import DashboardPage from "@/features/dashboard/page";
import WalletsPage from "@/features/wallets/page";
import WalletDetailPage from "@/features/wallets/wallet-detail-page";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
