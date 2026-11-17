import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MoodRoomForm } from "@/components/MoodRoom/MoodRoomForm";

export default function CreateMoodRoomPage() {
    
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <MoodRoomForm />
            </main>
            <Footer />
        </div>
    );
}