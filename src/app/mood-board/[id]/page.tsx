"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer";
import { MoodBoardDisplay } from "@/components/UserMoodBoard/MoodBoardDisplay"

export default function UserMoodBoard() {

    const { id } = useParams<{ id: string }>();

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="min-h-dvh">
                <MoodBoardDisplay id={id} />
            </main>
            <Footer />
        </div>
    )
}