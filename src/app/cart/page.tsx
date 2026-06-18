"use client";

import { Header } from "@/components/Header";
import { MainCart } from "@/components/CartPage/MainCart";  

export default function cartPage() {
    return (
        <main className="min-h-screen bg-gray-200">
            <Header />
            <MainCart />
        </main>
    )
}
