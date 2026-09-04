import ReactMarkdown from 'react-markdown';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Shared shell for Terms/Privacy/Refund Policy — reuses the same
// .markdown-body typography the blog already renders posts with, so long-
// form legal text gets consistent heading/list/paragraph styling for free.
export function LegalPageLayout({
  title,
  lastUpdated,
  content,
}: {
  title: string;
  lastUpdated: string;
  content: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container-app flex-grow py-stack-lg">
        <div className="mx-auto max-w-2xl">
          <h1 className="headline-lg mb-2 text-trust-blue-900">{title}</h1>
          <p className="label-md mb-stack-lg text-on-surface-variant">Last updated: {lastUpdated}</p>

          <div className="markdown-body">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
