"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { whatsappHref } from "@/lib/site";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Product Range", href: "/product-range" },
  { label: "Specifications", href: "/specifications" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-[#f5f1ea] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" onClick={closeMenu}>
          <Image
            src="/images/site/nexchair-logo.png"
            alt="NexChair"
            width={110}
            height={28}
            style={{ height: "28px", width: "auto" }}
            priority
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-medium transition hover:text-[#0E3159]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href={whatsappHref}
            className="rounded-full border border-black px-4 py-2 text-sm"
          >
            WhatsApp
          </a>

          <Link
            href="/contact"
            className="rounded-full bg-[#F26919] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#d95e15]"
          >
            Request a quote
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 md:hidden"
        >
          <span className="text-lg">
            {menuOpen ? "×" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-black/10 px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-sm hover:bg-black/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4">
            <a
              href={whatsappHref}
              className="rounded-full border border-black px-4 py-3 text-center text-sm"
            >
              WhatsApp
            </a>

            <Link
              href="/contact"
              onClick={closeMenu}
              className="rounded-full bg-[#c44e18] px-4 py-3 text-center text-sm text-white"
            >
              Request a quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}