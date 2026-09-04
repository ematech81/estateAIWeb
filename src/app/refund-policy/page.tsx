import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Refund Policy | EstateAI',
  description: "EstateAI's refund policy.",
};

const CONTENT = `
## Currently, EstateAI is free to use

Creating an account, listing a property, browsing listings, and contacting agents are all free on EstateAI today. There are no paid subscriptions, listing fees, or other charges at this time — so there is nothing to refund.

## When paid plans launch

We plan to introduce paid subscription plans for agents and agencies in the future. Before any paid plan goes live, this page will be replaced with a complete Refund Policy covering:

- Which plans and charges are eligible for a refund, and any applicable time window
- How to request a refund, and how long it takes to process
- What happens to your account and listings if a subscription is cancelled or refunded
- How disputed or failed payments are handled

You will be able to review the finalized Refund Policy before subscribing to any paid plan.

## Contact

Questions in the meantime? Email us at [info@techsphereapp.com](mailto:info@techsphereapp.com).
`;

export default function RefundPolicyPage() {
  return <LegalPageLayout title="Refund Policy" lastUpdated="August 19, 2026" content={CONTENT} />;
}
