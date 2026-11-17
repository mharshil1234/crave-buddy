"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Compass, Users, Menu, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { AccountMenu } from "./AccountMenu";
import { countCartRestaurants, useCartStore } from "@/stores/cartStore";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMoodBoardPage = pathname.startsWith("/mood-board");
  const isMoodRoomPage = pathname.startsWith("/mood-room");
  const isCartPage = pathname === "/cart";
  const callback = encodeURIComponent(pathname);

  const restaurantCount = useCartStore((state) => countCartRestaurants(state.cartByRestaurant));
  const setCartByRestaurant = useCartStore((state) => state.setCartByRestaurant);
  const cartLabel = restaurantCount > 0
    ? `View cart, ${restaurantCount} ${restaurantCount === 1 ? "restaurant" : "restaurants"}`
    : "View cart";

  // Load the whole cart once per page so the badge is right after a reload; useCartItem keeps it live after that.
  useEffect(() => {
    let cancelled = false;
    async function loadCart() {
      try {
        const response = await fetch("/api/cart/get");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data?.cart && typeof data.cart === "object") setCartByRestaurant(data.cart);
      } catch {
        // The badge is a nice-to-have; ignore failures.
      }
    }
    loadCart();
    return () => {
      cancelled = true;
    };
  }, [setCartByRestaurant]);

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

  const pillClass =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-brand shadow-sm shadow-orange-950/15 transition hover:-translate-y-0.5 hover:bg-brand-soft hover:shadow-md";
  const iconButtonClass =
    "inline-flex size-10 items-center justify-center rounded-xl text-white transition cursor-pointer hover:bg-white/15";
  const mobileLinkClass = "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-neutral-900 hover:bg-brand-soft";

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-orange-300/25 bg-brand/95 shadow-sm shadow-orange-950/10 backdrop-blur-md"
      >
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4 py-2 sm:min-h-18 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          <Link href="/" aria-label="Go to home" className="min-w-0 rounded-xl">
            <span
              className="block truncate text-xl font-extrabold tracking-tight text-white sm:text-2xl"
            >
              Crave Buddy
            </span>
            <span
              className="hidden text-xs font-medium text-orange-100/90 lg:block"
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
              <Link href="/cart" aria-label={cartLabel} className={`relative ${iconButtonClass}`}>
                <ShoppingCart size={22} aria-hidden="true" />
                {restaurantCount > 0 && <CartBadge count={restaurantCount} />}
              </Link>
            )}

            <div className="ml-2 lg:ml-6">
              {session?.user ? (
                <AccountMenu
                  name={session.user.name}
                  email={session.user.email}
                  variant="brand"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/signin?callbackUrl=${callback}`}
                    className="inline-flex h-10 items-center rounded-xl border border-white/30 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
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
              <Link href="/cart" aria-label={cartLabel} className={`relative ${iconButtonClass}`}>
                <ShoppingCart size={22} aria-hidden="true" />
                {restaurantCount > 0 && <CartBadge count={restaurantCount} />}
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
                  <Compass size={20} aria-hidden="true" className="text-brand" />
                  Mood Board
                </Link>
              )}
              {!isMoodRoomPage && (
                <Link href="/mood-room/create" onClick={closeMenu} className={mobileLinkClass}>
                  <Users size={20} aria-hidden="true" className="text-brand" />
                  Mood Room
                </Link>
              )}
              {!isCartPage && (
                <Link href="/cart" onClick={closeMenu} className={mobileLinkClass}>
                  <ShoppingCart size={20} aria-hidden="true" className="text-brand" />
                  Cart
                  {restaurantCount > 0 && (
                    <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                      {restaurantCount} {restaurantCount === 1 ? "restaurant" : "restaurants"}
                    </span>
                  )}
                </Link>
              )}
            </div>

            <div className="mt-2 border-t border-neutral-100 pt-3">
              {session?.user ? (
                <div className="flex items-center gap-3 px-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-extrabold text-brand">
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
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white hover:bg-brand-hover"
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

function CartBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-extrabold leading-none text-brand shadow-sm ring-2 ring-brand"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
