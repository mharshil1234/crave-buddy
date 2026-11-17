"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";

export function FooterAccountLinks({ linkClass }: { linkClass: string }) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const callback = encodeURIComponent(pathname);

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Couldn't sign out. Please try again.");
    }
  }

  // Avoid flashing "Sign In" to someone who is already signed in.
  if (isPending) {
    return (
      <ul className="mt-4 space-y-3" aria-hidden="true">
        <li className="h-4 w-20 animate-pulse rounded bg-neutral-800" />
        <li className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
      </ul>
    );
  }

  if (session?.user) {
    return (
      <ul className="mt-4 space-y-3">
        <li className="max-w-full truncate text-sm text-neutral-500">
          Signed in as <span className="text-neutral-300">{session.user.name}</span>
        </li>
        <li>
          <button type="button" onClick={handleSignOut} className={`${linkClass} cursor-pointer`}>
            Sign out
          </button>
        </li>
      </ul>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      <li>
        <Link href={`/signin?callbackUrl=${callback}`} className={linkClass}>
          Sign In
        </Link>
      </li>
      <li>
        <Link href={`/signup?callbackUrl=${callback}`} className={linkClass}>
          Sign Up
        </Link>
      </li>
    </ul>
  );
}
