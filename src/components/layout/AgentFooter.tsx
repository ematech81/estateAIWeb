// Lighter-weight footer for the authenticated agent area — distinct from
// the marketing Footer (no logo, smaller type). Links don't have pages yet,
// same "inert placeholder" convention as Header/Footer.
export function AgentFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border-gray-200 bg-surface-container-low">
      <div className="container-app flex flex-col items-center justify-between gap-stack-md py-stack-md md:flex-row">
        <div className="label-sm text-on-surface-variant">
          © {new Date().getFullYear()} EstateAI Global Marketplace. All rights reserved.
        </div>
        <nav className="flex flex-wrap justify-center gap-stack-md">
          {['Terms of Service', 'Privacy Policy', 'Help Center', 'API Documentation'].map((label) => (
            <span
              key={label}
              className="label-sm cursor-default text-on-surface-variant transition-colors hover:text-primary"
            >
              {label}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
