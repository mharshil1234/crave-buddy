"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Compass, Users, Menu, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { AccountMenu } from "./AccountMenu";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMoodBoardPage = pathname.startsWith("/mood-board");
  const isMoodRoomPage = pathname.startsWith("/mood-room");
  const isCartPage = pathname === "/cart";
  const callback = encodeURIComponent(pathname);

  // The mobile menu remembers the path it was opened on, so navigating closes it automatically.
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null);
  const mobileMenuOpen = menuOpenedOn === pathname;
  const closeMenu = () => setMenuOpenedOn(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpenedOn(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    closeMenu();
    try {
      await signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Couldn't sign out. Please try again.");
    }
  }

  const pillClass = `inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isCartPage
    ? "bg-white text-[#ff5200] shadow-neutral-950/15 ring-1 ring-neutral-200 hover:bg-neutral-50"
    : "bg-white text-[#ff5200] shadow-orange-950/15 hover:bg-orange-50"
    }`;
  const iconButtonClass = `inline-flex size-10 items-center justify-center rounded-xl transition cursor-pointer ${isCartPage
    ? "text-neutral-900 hover:bg-neutral-100"
    : "text-white hover:bg-white/15"
    }`;
  const mobileLinkClass = "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-neutral-900 hover:bg-orange-50";

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b shadow-sm backdrop-blur-md ${isCartPage
          ? "border-neutral-200 bg-white/95 shadow-neutral-950/10"
          : "border-orange-300/25 bg-[#ff5200]/95 shadow-orange-950/10"
          }`}
      >
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4 py-2 sm:min-h-18 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          <Link href="/" aria-label="Go to home" className="min-w-0 rounded-xl">
            <span
              className={`block truncate text-xl font-extrabold tracking-tight sm:text-2xl ${isCartPage ? "text-neutral-950" : "text-white"}`}
            >
              Crave Buddy
            </span>
            <span
              className={`hidden text-xs font-medium lg:block ${isCartPage ? "text-neutral-500" : "text-orange-100/90"}`}
            >
              Food that matches your mood
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="ml-auto hidden items-center gap-3 md:flex">
            {!isMoodBoardPage && (
              <Link href="/mood-board" className={pillClass}>
                <Compass size={20} aria-hidden="true" />
                Mood Board
              </Link>
            )}

            {!isMoodRoomPage && (
              <Link href="/mood-room/create" className={pillClass}>
                <Users size={18} aria-hidden="true" />
                Mood Room
              </Link>
            )}

            {!isCartPage && (
              <Link href="/cart" aria-label="View cart" className={iconButtonClass}>
                <ShoppingCart size={22} aria-hidden="true" />
              </Link>
            )}

            <div className="ml-2 lg:ml-6">
              {session?.user ? (
                <AccountMenu
                  name={session.user.name}
                  email={session.user.email}
                  variant={isCartPage ? "light" : "brand"}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/signin?callbackUrl=${callback}`}
                    className={`inline-flex h-10 items-center rounded-xl border px-4 text-sm font-semibold transition ${isCartPage
                      ? "border-neutral-300 text-neutral-900 hover:bg-neutral-100"
                      : "border-white/30 text-white hover:bg-white/15"
                      }`}
                  >
                    Sign In
                  </Link>
                  <Link href={`/signup?callbackUrl=${callback}`} className={pillClass}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile controls */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            {!isCartPage && (
              <Link href="/cart" aria-label="View cart" className={iconButtonClass}>
                <ShoppingCart size={22} aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpenedOn(mobileMenuOpen ? null : pathname)}
              className={iconButtonClass}
            >
              {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden"
          >
            <div className="flex flex-col">
              {!isMoodBoardPage && (
                <Link href="/mood-board" onClick={closeMenu} className={mobileLinkClass}>
                  <Compass size={20} aria-hidden="true" className="text-[#ff5200]" />
                  Mood Board
                </Link>
              )}
              {!isMoodRoomPage && (
                <Link href="/mood-room/create" onClick={closeMenu} className={mobileLinkClass}>
                  <Users size={20} aria-hidden="true" className="text-[#ff5200]" />
                  Mood Room
                </Link>
              )}
              {!isCartPage && (
                <Link href="/cart" onClick={closeMenu} className={mobileLinkClass}>
                  <ShoppingCart size={20} aria-hidden="true" className="text-[#ff5200]" />
                  Cart
                </Link>
              )}
            </div>

            <div className="mt-2 border-t border-neutral-100 pt-3">
              {session?.user ? (
                <div className="flex items-center gap-3 px-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-extrabold text-[#ff5200]">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900">{session.user.name}</p>
                    <p className="truncate text-xs text-neutral-500">{session.user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 cursor-pointer hover:bg-red-50"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/signin?callbackUrl=${callback}`}
                    onClick={closeMenu}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/signup?callbackUrl=${callback}`}
                    onClick={closeMenu}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ff5200] text-sm font-bold text-white hover:bg-[#e64a00]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Outside the header: its backdrop-blur would otherwise trap this fixed overlay inside the header box. */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-neutral-950/30 md:hidden"
        />
      )}
    </>
  );
}
