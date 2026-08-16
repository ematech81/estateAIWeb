import { ReactNode } from 'react';
import { AgentSidebar } from './AgentSidebar';

// Wraps every authenticated agent page (dashboard, listing wizard, leads,
// profile) with the persistent sidebar/mobile-nav shell and the matching
// content offset (ml-64 to clear the fixed desktop sidebar, pb-20 to clear
// the fixed mobile bottom tab bar).
export function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AgentSidebar />
      <main className="flex-1 pb-20 md:ml-64 md:pb-0">{children}</main>
    </div>
  );
}
