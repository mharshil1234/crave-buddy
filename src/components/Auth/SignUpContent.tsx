"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, signUp, useSession } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { safeCallbackUrl } from "@/lib/safe-redirect";

export function SignUpContent() {

    const searchParams = useSearchParams();
    const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

    const router = useRouter();

    const { data: session, isPending } = useSession();
    useEffect(() => {
        if (session?.user) {
            router.push(callbackUrl);
        }
    }, [isPending, session, router, callbackUrl]);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const res = await signUp.email({
            name,
            email,
            password,
        });

        if (res.error) {
            toast.error(res.error.message || "Something went wrong.");
        } else {
            toast.success("Welcome to Crave Buddy!")
            router.push(callbackUrl);
        }
    }

    async function handleGoogleSignIn() {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: callbackUrl
        });
    }

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <main className="mood-backdrop flex min-h-screen flex-col items-center justify-center p-6">
            <Link href="/" className="mb-6 text-2xl font-extrabold tracking-tight text-neutral-900">
                Crave <span className="text-brand">Buddy</span>
            </Link>
            <div className="w-full max-w-md">
                <div className="card p-8 shadow-xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                            Join Crave Buddy
                        </h1>
                        <p className="mt-2 text-neutral-500">
                            Discover food that matches your mood.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="name"
                            aria-label="Full name"
                            autoComplete="name"
                            placeholder="Full Name"
                            className="input-field"
                        />

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
                                minLength={8}
                                className="input-field pr-12"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                name="confirmPassword"
                                aria-label="Confirm password"
                                autoComplete="new-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                minLength={8}
                                className="input-field pr-12"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                        >
                            Create Account
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
                        Already have an account?{" "}
                        <a
                            href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                            className="font-semibold text-brand hover:text-brand-hover"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}