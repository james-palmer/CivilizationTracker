import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingView from "@/components/LandingView";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] bg-opacity-80 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center bg-fixed">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <LandingView />
      </main>
      <Footer />
    </div>
  );
}
