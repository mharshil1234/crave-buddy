import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { LandingMain } from "../components/LandingMain";
import { HomeHero } from "../components/HomeHero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="min-h-dvh">
        <HomeHero />
        <LandingMain />
      </main>
      <Footer />
    </div>
  );
}
