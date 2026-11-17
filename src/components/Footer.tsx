import Link from "next/link";
import { Compass, Users, ShoppingCart, Heart } from "lucide-react";

const exploreLinks = [
  { href: "/mood-board", label: "Mood Board", icon: Compass },
  { href: "/mood-room/create", label: "Create a Mood Room", icon: Users },
  { href: "/mood-room/join", label: "Join a Mood Room", icon: Users },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

const accountLinks = [
  { href: "/signin", label: "Sign In" },
  { href: "/signup", label: "Sign Up" },
];

const linkClass =
  "inline-flex items-center gap-2 rounded-md text-sm text-neutral-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5200]";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-neutral-950 text-neutral-300">
      {/* Brand accent bar */}
      <div aria-hidden="true" className="h-1 bg-linear-to-r from-[#ff5200] via-orange-400 to-[#ff5200]" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link href="/" className="inline-block rounded-md text-2xl font-extrabold tracking-tight text-white">
              Crave <span className="text-[#ff5200]">Buddy</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
              Food that matches your mood. Tell us how you feel, build a mood board, or
              decide together with friends in a Mood Room.
            </p>
            <Link
              href="/mood-board"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff5200] px-4 text-sm font-bold text-white shadow-sm shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-[#e64a00]"
            >
              <Compass size={18} aria-hidden="true" />
              Find my next craving
            </Link>
          </div>

          <nav aria-label="Explore">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white">Explore</h2>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    <Icon size={16} aria-hidden="true" className="text-[#ff5200]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white">Account</h2>
            <ul className="mt-4 space-y-3">
              {accountLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Crave Buddy. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">
            Made with <Heart size={12} aria-label="love" className="fill-[#ff5200] text-[#ff5200]" /> for hungry people
          </p>
        </div>
      </div>
    </footer>
  );
}
