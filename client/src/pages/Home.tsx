import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingView from "@/components/LandingView";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";

export default function Home() {
  return (
    <BackgroundSlideshow>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <LandingView />
      </main>
      <Footer />
    </BackgroundSlideshow>
  );
}
