"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authClient, signIn, useSession } from "@/lib/auth-client";

export function SignInContent() {

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    const router = useRouter();

    const { data: session, isPending } = useSession();

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (session?.user) {
            router.push("/");
        }
    }, [session, isPending, router]);

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
            router.push("/");
        }
    }

    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: callbackUrl || "/"
        });
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-neutral-950 to-red-950 p-6">
            <div className="w-full max-w-md">
                <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-white">
                            Welcome Back
                        </h1>
                        <p className="text-neutral-400 mt-2">
                            Sign in to continue your food journey.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                autoComplete="current-password"
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white placeholder:text-neutral-500 outline-none focus:border-orange-500 transition"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-neutral-400 hover:text-white cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white hover:scale-[1.02] transition cursor-pointer"
                        >
                            Sign In
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
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-white hover:bg-white/10 transition cursor-pointer"
                        onClick={handleGoogleSignIn}
                    >
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-neutral-400">
                        Don't have an account?{" "}
                        <a
                            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl ?? "/")}`}
                            className="text-orange-400 hover:text-orange-300"
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}