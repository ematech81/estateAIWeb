import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | EstateAI',
  description: 'The terms that govern your use of EstateAI.',
};

const CONTENT = `
Welcome to EstateAI. These Terms of Service ("Terms") govern your access to and use of the EstateAI website, applications, and related services (together, the "Service"), operated by EstateAI ("EstateAI," "we," "us," or "our"). By creating an account, browsing listings, or otherwise using the Service, you agree to these Terms. If you do not agree, please do not use the Service.

## 1. What EstateAI Is

EstateAI is a technology platform that helps real estate agents, agencies, and property owners ("Agents") list properties, and helps prospective buyers, renters, and tenants ("Seekers") discover them — with AI-assisted tools to help structure listing descriptions into a consistent, searchable format.

EstateAI is **not** a licensed real estate broker, agent, appraiser, or financial advisor, and we are not a party to any transaction between an Agent and a Seeker. We do not handle payments between users, do not hold funds in escrow, and do not arrange or conduct property inspections. Any agreement to rent, buy, or lease a property is made directly between the Agent and the Seeker, entirely outside the Service, and at their own risk.

## 2. Accounts

- You must be at least 18 years old to register an account.
- You agree to provide accurate, current information when registering and to keep it up to date.
- You are responsible for maintaining the confidentiality of your password and for all activity under your account.
- Seekers do not need an account to browse listings or contact an Agent through a listing's contact form; an account is required to create and manage listings.
- You may delete your account at any time from your account settings. Deleting your account permanently removes your account, your listings, and the performance statistics for your listings — this cannot be undone.

## 3. Listings

If you list a property on EstateAI:

- You are solely responsible for the accuracy, legality, and completeness of your listing, including price, availability, and property details.
- Our AI-assisted listing tool extracts structured details only from the text you provide — it does not invent facts, but it also does not verify them. Review every AI-generated draft carefully before publishing.
- You must have the legal right to list the property and to use any photos or media you upload.
- A "Verified" badge on your profile reflects that we verified your identity or business — it is not a guarantee about the accuracy of any specific listing, and Seekers should independently verify listing details before relying on them.
- We may remove a listing or suspend an account that we reasonably believe violates these Terms, applicable law, or is fraudulent, misleading, or abusive.

## 4. Acceptable Use

You agree not to:

- Post false, fraudulent, or misleading listings, or impersonate another person or business.
- Scrape, harvest, or bulk-extract data from the Service.
- Use contact information obtained through the Service (including contact details revealed through a listing) for unsolicited marketing or any purpose other than responding to that specific inquiry.
- Attempt to interfere with, disrupt, or gain unauthorized access to the Service or its underlying systems.
- Use the Service for any unlawful purpose.

## 5. Content You Submit

You retain ownership of the listings, photos, and other content you submit. By submitting content, you grant EstateAI a non-exclusive, worldwide, royalty-free license to host, display, and distribute that content as part of operating the Service (for example, showing your listing to Seekers and in search results). You represent that you have the rights necessary to grant this license.

## 6. Disclaimers

The Service, and all listings and content on it, are provided "as is" and "as available," without warranties of any kind, express or implied. We do not warrant that any listing is accurate, current, or that any property is actually available. We are not responsible for the conduct — online or offline — of any user, Agent, or Seeker.

## 7. Limitation of Liability

To the fullest extent permitted by law, EstateAI and its team will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue, arising from your use of the Service or any transaction between users, even if we have been advised of the possibility of such damages.

## 8. Termination

We may suspend or terminate your access to the Service at any time, with or without notice, if we believe you have violated these Terms. You may stop using the Service and delete your account at any time.

## 9. Changes to These Terms

We may update these Terms from time to time. If we make material changes, we will update the "Last updated" date above. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.

## 10. Governing Law

These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law principles, except where applicable local law requires otherwise for users outside Nigeria.

## 11. Contact

Questions about these Terms? Email us at [info@techsphereapp.com](mailto:info@techsphereapp.com).
`;

export default function TermsPage() {
  return <LegalPageLayout title="Terms of Service" lastUpdated="August 19, 2026" content={CONTENT} />;
}
