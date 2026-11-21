import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JoinMoodRoomForm } from "@/components/MoodRoom/JoinMoodRoomForm";

export default function JoinMoodRoomPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="min-h-dvh">
                <JoinMoodRoomForm />
            </main>
            <Footer />
        </div>
    );
}
