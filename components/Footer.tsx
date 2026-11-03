import Link from "next/link";

const shop = [
  { label: "Ergonomic task", href: "/product-range?category=ergonomic-task" },
  { label: "Executive", href: "/product-range?category=executive" },
  { label: "Gaming & streaming", href: "/product-range?category=gaming-streaming" },
  { label: "Visitor & training", href: "/product-range?category=visitor-training" },
];

const company = [
  { label: "About", href: "/about" },
  { label: "Specifications", href: "/product-range" },
  { label: "Bulk orders", href: "/contact" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0E3159] px-6 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold">
              Nex<span className="text-[#F26919]">Chair</span>
            </Link>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Office seating with the full specification sheet up front — for
              teams, offices and home setups.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Shop
            </p>

            <nav className="mt-4 flex flex-col gap-3">
              {shop.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Company
            </p>

            <nav className="mt-4 flex flex-col gap-3">
              {company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Get in touch */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Get in touch
            </p>

            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p>[Phone number]</p>
              <p>[Email address]</p>
              <p>[Address line]</p>
              <p>[City, State]</p>
              <Link
                href="https://wa.me/"
                className="mt-2 inline-block transition hover:text-white"
              >
                WhatsApp us
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 NexChair</span>

          <div className="flex gap-4">
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Terms</span>
            <span className="cursor-default">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
