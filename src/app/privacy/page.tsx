import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | EstateAI',
  description: 'What EstateAI collects, how it is used, and your choices.',
};

const CONTENT = `
This Privacy Policy explains what personal information EstateAI ("we," "us," or "our") collects, how we use it, and your rights regarding it. It applies to everyone who uses the EstateAI website and applications (the "Service").

## 1. Information We Collect

**Account information.** When you register, we collect your email address, password (stored as a one-way cryptographic hash — we never store or can see your actual password), full name, role (agent, agency, or owner), and optionally your phone number, business name, and primary location.

**Listing information.** If you create a listing, we store the property details you provide (title, description, price, location, specifications, amenities) and any photos you upload.

**Listing activity.** If you browse listings as a Seeker, you don't need an account and we don't collect your name or contact details. We record when a listing's page is opened, when "Contact the Agent" is clicked, and when an Agent's contact details are shown. These are tied to a random anonymous identifier stored in your browser (not to you personally) and are used to show Agents how their listings are performing. Agents' name, email, and phone number are shown to Seekers who choose to view them.

**What we do not collect.** We do not run third-party advertising trackers, ad pixels, or general-purpose analytics scripts. We do not sell your personal information to anyone.

## 2. How We Use Your Information

- To operate the Service: creating your account, publishing your listings, connecting Seekers with Agents.
- To process AI-assisted listing extraction: when you use the AI-assisted listing tool, the text you provide is sent to our AI provider (OpenAI) solely to extract structured listing fields from it. It is not used to train third-party models.
- To send transactional email: account verification, password reset, and similar account-related messages, sent through our email provider (Brevo). We do not send marketing email unless you separately opt in to a feature that requests it.
- To host uploaded photos, via our media storage provider (Cloudinary).
- To store your data securely, via our database provider (MongoDB Atlas).

## 3. Third Parties We Rely On

We use the following service providers to operate EstateAI. Each only receives the data necessary to perform its function for us, and none are permitted to use your data for their own purposes:

- **OpenAI** — processes listing description text you submit, to extract structured details.
- **Cloudinary** — stores and serves photos you upload.
- **Brevo** — delivers transactional emails (password reset, email verification) on our behalf.
- **MongoDB Atlas** — hosts our database.

## 4. Cookies and Local Storage

We do not use tracking cookies. To keep you signed in, we store your session token in your browser's local storage (or session storage, if you don't select "remember me") — this is used only to authenticate your requests to our own servers, not to track you across other sites.

## 5. Your Choices and Rights

- **Access and update.** You can view and update your profile information at any time from your account settings.
- **Delete your account.** You can permanently delete your account from your account settings. This immediately and permanently removes your account, your listings, and the performance statistics for your listings. This action cannot be undone.
- **Change your password.** Available from your account settings, or via the "forgot password" flow if you're signed out.

## 6. Data Security

Passwords are hashed (never stored in plain text). Password-reset links and email-verification codes are single-use and time-limited, and are stored only as a hash, so they can't be reconstructed from our database. We use industry-standard practices to protect your data, but no system is perfectly secure, and we cannot guarantee absolute security.

## 7. International Users

EstateAI is based in Nigeria and primarily governed by Nigerian data protection law (the Nigeria Data Protection Act). As we expand to support agents and listings outside Nigeria, other countries' data protection laws (such as the GDPR for users in the UK/EU) may also apply to you; we are working toward full compliance as that expansion happens.

## 8. Children's Privacy

The Service is not directed to anyone under 18, and we do not knowingly collect personal information from children.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. If we make material changes, we will update the "Last updated" date above.

## 10. Contact

Questions about this policy or your data? Email us at [info@techsphereapp.com](mailto:info@techsphereapp.com).
`;

export default function PrivacyPage() {
  return <LegalPageLayout title="Privacy Policy" lastUpdated="August 19, 2026" content={CONTENT} />;
}
