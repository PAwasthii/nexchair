import Link from "next/link";

const navLinks = [
  { label: "Product Range", href: "/product-range" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#171717] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="text-xl font-bold">
              Nex<span className="text-[#c44e18]">Chair</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm text-gray-400">
              Seating engineered for the long day.
            </p>
          </div>

          <nav className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            {navLinks.map((link) => (
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

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 NexChair. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
