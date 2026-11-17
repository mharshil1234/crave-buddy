"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { safeCallbackUrl } from "@/lib/safe-redirect";
import { authClient, signIn, useSession } from "@/lib/auth-client";

export function SignInContent() {

    const searchParams = useSearchParams();
    const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

    const router = useRouter();

    const { data: session, isPending } = useSession();

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (session?.user) {
            router.push(callbackUrl);
        }
    }, [isPending, session, router, callbackUrl]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        const res = await signIn.email({
            email,
            password,
        });

        if (res.error) {
            toast.error(res.error.message || "Invalid email or password");
        } else {
            toast.success("Welcome back!");
            router.push(callbackUrl);
        }
    }

    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: callbackUrl
        });
    }

    return (
        <main className="mood-backdrop flex min-h-screen flex-col items-center justify-center p-6">
            <Link href="/" className="mb-6 text-2xl font-extrabold tracking-tight text-neutral-900">
                Crave <span className="text-brand">Buddy</span>
            </Link>
            <div className="w-full max-w-md">
                <div className="card p-8 shadow-xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-neutral-500">
                            Sign in to continue your food journey.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="email"
                            aria-label="Email address"
                            autoComplete="email"
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                        />

                        <div className="relative">
                            <input
                                name="password"
                                aria-label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                autoComplete="current-password"
                                className="input-field pr-12"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                OR
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary w-full"
                        onClick={handleGoogleSignIn}
                    >
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-sm text-neutral-500">
                        Don't have an account?{" "}
                        <a
                            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                            className="font-semibold text-brand hover:text-brand-hover"
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}