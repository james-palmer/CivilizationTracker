import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <BackgroundSlideshow>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-['Cinzel'] font-bold mb-2 text-white">404</h1>
          <h2 className="text-xl mb-3 text-gray-300">Page Not Found</h2>
          <p className="mb-6 text-sm text-gray-400 max-w-md mx-auto">
            The page you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-primary hover:bg-primary/80 text-white"
            size="sm"
          >
            Return Home
          </Button>
        </div>
      </main>
      <Footer />
    </BackgroundSlideshow>
  );
}
