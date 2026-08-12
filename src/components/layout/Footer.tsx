// Nav links (Terms/Privacy/Help/etc.) don't have pages yet — inert
// placeholders, same as Header's nav. Swap in real hrefs as they're built.
export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border-gray-200 bg-surface-gray-50">
      <div className="container-app flex flex-col items-center justify-between gap-stack-md py-stack-lg md:flex-row">
        <div className="headline-md flex items-center gap-2 text-primary">
          <span
            className="material-symbols-outlined text-growth-emerald-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            real_estate_agent
          </span>
          EstateAI
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {['Terms of Service', 'Privacy Policy', 'Help Center'].map((label) => (
            <span
              key={label}
              className="label-md cursor-default text-on-surface-variant transition-colors hover:text-secondary"
            >
              {label}
            </span>
          ))}
        </nav>

        <div className="label-md text-center text-on-surface md:text-right">
          © {new Date().getFullYear()} EstateAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
