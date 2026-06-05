import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { LandingMain } from "../components/LandingMain";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <LandingMain />
      </main>
      <Footer />
    </div>
  );
}
