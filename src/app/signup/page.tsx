"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, signUp, useSession } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SignUpPage() {

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    const router = useRouter();

    const { data: session, isPending } = useSession();
    useEffect(() => {
        if (session?.user) {
            router.push("/");
        }
    }, [isPending, session, router]);


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
            router.push("/");
        }
    }

    async function handleGoogleSignIn() {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: callbackUrl || "/"
        });
    }

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-neutral-950 to-red-950 p-6">
            <div className="w-full max-w-md">
                <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-white">
                            Join Crave Buddy
                        </h1>
                        <p className="text-neutral-400 mt-2">
                            Discover food that matches your mood.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="name"
                            placeholder="Full Name"
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-orange-500 transition"
                        />

                        <input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-orange-500 transition"
                        />

                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                minLength={8}
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white placeholder:text-neutral-500 outline-none focus:border-orange-500 transition"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                minLength={8}
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white placeholder:text-neutral-500 outline-none focus:border-orange-500 transition"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white hover:scale-[1.02] transition hover:cursor-pointer"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-neutral-950 px-4 text-sm text-neutral-500">
                                OR
                            </span>
                        </div>
                    </div>

                    <button
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-white hover:bg-white/10 transition hover:cursor-pointer"
                        onClick={handleGoogleSignIn}
                    >
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-neutral-400">
                        Already have an account?{" "}
                        <a
                            href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl ?? "/")}`}
                            className="text-orange-400 hover:text-orange-300"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}