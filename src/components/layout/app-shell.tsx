import { Outlet } from 'react-router';
import { BottomNav } from './bottom-nav';

export default function AppShell() {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
