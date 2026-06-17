"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header"
import { MoodBoardDisplay } from "@/components/UserMoodBoard/MoodBoardDisplay"

export default function UserMoodBoard() {

    const { id } = useParams<{ id: string }>();

    return (
        <main>
            <Header />
            <MoodBoardDisplay id={id} />
        </main>
    )
}