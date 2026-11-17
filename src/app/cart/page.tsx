"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MainCart } from "@/components/CartPage/MainCart";  

export default function cartPage() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-200">
            <Header />
            <main className="flex-1">
                <MainCart />
            </main>
            <Footer />
        </div>
    )
}
