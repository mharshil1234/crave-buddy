import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MoodBoardForm } from "@/components/MoodBoard/MoodBoardForm";

export default function MoodBoard() {

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <MoodBoardForm />
            </main>
            <Footer />
        </div>
    )
}