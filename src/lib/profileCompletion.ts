import type { UserProfile } from './api';

// name/email are always present (required at registration); phone/
// businessName/primaryLocation are the self-editable fields an agent can
// still fill in. A simple filled/total ratio — not role-aware (e.g.
// businessName counts against a plain individual agent too), which is a
// known simplification, not a hidden one.
const FIELDS: (keyof UserProfile)[] = ['name', 'email', 'phone', 'businessName', 'primaryLocation'];

export function profileCompletionPercent(user: UserProfile): number {
  const filled = FIELDS.filter((field) => !!user[field]).length;
  return Math.round((filled / FIELDS.length) * 100);
}
