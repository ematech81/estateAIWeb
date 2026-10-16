import { redirect } from 'next/navigation';

// The old "Leads" screen is now "Performance" (views and contact stats) —
// keep this route so existing bookmarks and links still land somewhere useful.
export default function AgentLeadsRedirectPage() {
  redirect('/agent/performance');
}
