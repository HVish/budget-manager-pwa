import { Outlet } from "react-router";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";

export default function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
