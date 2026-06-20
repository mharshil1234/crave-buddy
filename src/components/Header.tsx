"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();
  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? "U";
  const isMoodBoardPage = pathname.startsWith("/mood-board");
  const isCartPage = pathname === "/cart";

  return (
    <header
      className={`sticky top-0 z-50 border-b shadow-sm backdrop-blur-md ${isCartPage
        ? "border-neutral-200 bg-white/95 shadow-neutral-950/10"
        : "border-orange-300/25 bg-[#ff5200]/95 shadow-orange-950/10"
        }`}
    >
      <div className="mx-auto flex min-h-18 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Go to home"
          className="group flex min-w-0 items-center gap-3 rounded-xl text-left cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div>
            <h1
              className={`truncate text-xl font-extrabold tracking-tight sm:text-2xl ${isCartPage ? "text-neutral-950" : "text-white"
                }`}
            >
              Crave Buddy
            </h1>
            <p
              className={`hidden text-xs font-medium sm:block ${isCartPage ? "text-neutral-500" : "text-orange-100/90"
                }`}
            >
              Food that matches your mood
            </p>
          </div>
        </button>

        <nav className="ml-auto flex items-center gap-2 sm:gap-3">
          {!isMoodBoardPage && (
            <button
              type="button"
              onClick={() => router.push("/mood-board")}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer sm:px-4 ${isCartPage
                ? "bg-white text-[#ff5200] shadow-neutral-950/15 ring-1 ring-neutral-200 hover:bg-neutral-50"
                : "bg-white text-[#ff5200] shadow-orange-950/15 hover:bg-orange-50"
                }`}
            >
              <Sparkles size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Mood Board</span>
            </button>
          )}

          {!isCartPage && (
            <button
              type="button"
              aria-label="View cart"
              onClick={() => router.push("/cart")}
              className="inline-flex size-10 items-center justify-center rounded-xl text-white transition hover:bg-white/15 cursor-pointer"
            >
              <ShoppingCart size={22} aria-hidden="true" />
            </button>
          )}

          <div className="ml-4 sm:ml-6 lg:ml-8">
            {session?.user ? (
              <div
                className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:cursor-pointer ${isCartPage
                  ? "bg-neutral-100 text-neutral-900"
                  : "bg-white/10 text-white"
                  }`}
                onClick={() => {
                  signOut();
                  toast.success("Signed Out")
                }}
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-full text-sm font-extrabold shadow-sm ${isCartPage
                    ? "bg-white text-[#ff5200] ring-1 ring-neutral-200"
                    : "bg-white text-[#ff5200]"
                    }`}
                >
                  {userInitial}
                </div>
                <span className="hidden max-w-28 truncate text-sm font-semibold md:block">
                  {session.user.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)}
                  className={`hidden h-10 items-center rounded-xl border px-4 text-sm font-semibold transition cursor-pointer sm:inline-flex ${isCartPage
                    ? "border-neutral-300 text-neutral-900 hover:bg-neutral-100"
                    : "border-white/30 text-white hover:bg-white/15"
                    }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/signup?callbackUrl=${encodeURIComponent(pathname)}`)}
                  className={`inline-flex h-10 items-center rounded-xl px-3 text-sm font-bold shadow-sm shadow-orange-950/15 transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer sm:px-4 ${isCartPage
                    ? "bg-white text-[#ff5200] ring-1 ring-neutral-200 hover:bg-neutral-50"
                    : "bg-white text-[#ff5200] hover:bg-orange-50"
                    }`}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
