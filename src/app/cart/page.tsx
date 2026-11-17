"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MainCart } from "@/components/CartPage/MainCart";  

export default function cartPage() {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50 max-lg:has-[[data-checkout-bar]]:pb-20">
            <Header />
            <main className="min-h-dvh">
                <MainCart />
            </main>
            <Footer />
        </div>
    )
}
