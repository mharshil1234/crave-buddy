import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MoodRoomForm } from "@/components/MoodRoom/MoodRoomForm";

export default function CreateMoodRoomPage() {
    
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="min-h-dvh">
                <MoodRoomForm />
            </main>
            <Footer />
        </div>
    );
}