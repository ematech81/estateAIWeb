import { ReactNode } from 'react';
import { AgentSidebar } from './AgentSidebar';

// Wraps every authenticated agent page (dashboard, listing wizard, leads,
// profile) with the persistent sidebar/mobile-nav shell and the matching
// content offset (ml-64 to clear the fixed desktop sidebar, pb-20 to clear
// the fixed mobile bottom tab bar).
//
// flex-col (not the bare `flex` row default) matters here: the desktop
// sidebar is `position: fixed`, so it's removed from normal flow at every
// breakpoint and never actually participates as a flex item. But
// AgentSidebar's mobile top bar is `position: sticky`, which DOES
// participate in flow — on mobile that made it a flex-ROW sibling of
// <main>, squeezing both into two narrow side-by-side columns instead of
// stacking the header above the content. flex-col stacks them correctly on
// mobile and is a no-op on desktop (main is the only in-flow child there).
export function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <AgentSidebar />
      <main className="flex-1 pb-20 md:ml-64 md:pb-0">{children}</main>
    </div>
  );
}
