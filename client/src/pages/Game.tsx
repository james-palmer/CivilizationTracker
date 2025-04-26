import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSession from "@/components/GameSession";
import NotificationBanner from "@/components/NotificationBanner";
import { getGameByCode } from "@/lib/gameService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { subscribeToPushNotifications } from "@/lib/notifications";

export default function Game() {
  const [, params] = useRoute("/game/:code");
  const [, navigate] = useLocation();
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [steamId, setSteamId] = useState<string>("");
  
  const gameCode = params?.code || "";
  
  const { data: game, isLoading, error } = useQuery({
    queryKey: [`/api/game/code/${gameCode}`],
    queryFn: () => getGameByCode(gameCode),
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });
  
  // Check for stored steam ID for this game
  useEffect(() => {
    const storedSteamId = localStorage.getItem(`civ-tracker-steam-id-${gameCode}`);
    if (storedSteamId) {
      setSteamId(storedSteamId);
    } else if (game) {
      // Try to guess which player this is
      const storedGames = localStorage.getItem('civ-tracker-games');
      const games = storedGames ? JSON.parse(storedGames) : {};
      
      if (games[gameCode]) {
        setSteamId(games[gameCode].steamId);
        localStorage.setItem(`civ-tracker-steam-id-${gameCode}`, games[gameCode].steamId);
      }
    }
  }, [gameCode, game]);
  
  // Show notification banner after a delay
  useEffect(() => {
    if (game && steamId) {
      const timer = setTimeout(() => {
        // Check if push is supported before showing the banner
        if ('Notification' in window && Notification.permission !== 'granted') {
          setShowNotificationBanner(true);
        }
      }, 2000);
      
      // Save this game and steam ID to local storage
      const storedGames = localStorage.getItem('civ-tracker-games');
      const games = storedGames ? JSON.parse(storedGames) : {};
      
      games[gameCode] = {
        id: game.id,
        name: game.name,
        steamId
      };
      
      localStorage.setItem('civ-tracker-games', JSON.stringify(games));
      localStorage.setItem(`civ-tracker-steam-id-${gameCode}`, steamId);
      
      return () => clearTimeout(timer);
    }
  }, [game, steamId, gameCode]);
  
  // Handle invalid game or missing steamId
  if (!isLoading && (!game || (!steamId && game))) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0F172A] bg-opacity-80 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center bg-fixed">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertTitle>Game Not Found</AlertTitle>
            <AlertDescription>
              {!game ? "The game you're looking for doesn't exist or has expired." : "You need to join this game first."}
              <div className="mt-4">
                <button 
                  onClick={() => navigate("/")}
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  Return Home
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0F172A] bg-opacity-80 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center bg-fixed">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "An error occurred loading the game."}
              <div className="mt-4">
                <button 
                  onClick={() => navigate("/")}
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  Return Home
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] bg-opacity-80 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center bg-fixed">
      <Header 
        gameName={game?.name} 
        gameCode={game?.code} 
        isInGame={true} 
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="w-full max-w-4xl mx-auto">
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        ) : game && steamId ? (
          <GameSession game={game} currentPlayerSteamId={steamId} />
        ) : null}
      </main>
      <Footer />
      
      {showNotificationBanner && steamId && (
        <NotificationBanner 
          steamId={steamId} 
          onClose={() => setShowNotificationBanner(false)} 
        />
      )}
    </div>
  );
}
