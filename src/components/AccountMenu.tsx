"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";

type AccountMenuProps = {
    name: string;
    email: string;
    variant: "light" | "brand";
};

export function AccountMenu({ name, email, variant }: AccountMenuProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const menuId = useId();
    const initial = name?.[0]?.toUpperCase() ?? "U";

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: PointerEvent) {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    async function handleSignOut() {
        setOpen(false);
        try {
            await signOut();
            toast.success("Signed out");
        } catch {
            toast.error("Couldn't sign out. Please try again.");
        }
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => setOpen((value) => !value)}
                className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-2 cursor-pointer transition ${variant === "light"
                    ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
            >
                <span
                    className={`flex size-9 items-center justify-center rounded-full bg-white text-sm font-extrabold text-brand shadow-sm ${variant === "light" ? "ring-1 ring-neutral-200" : ""}`}
                >
                    {initial}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-semibold md:block">{name}</span>
                <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    id={menuId}
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-lg"
                >
                    <div className="border-b border-neutral-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        <p className="truncate text-xs text-neutral-500">{email}</p>
                    </div>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 cursor-pointer hover:bg-red-50"
                    >
                        <LogOut size={16} aria-hidden="true" />
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
