import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { joinGame, getGameByCode } from "@/lib/gameService";
import { GameSessionWithPlayers } from "@shared/schema";

interface JoinGameFormProps {
  onCancel: () => void;
}

export default function JoinGameForm({ onCancel }: JoinGameFormProps) {
  const [gameCode, setGameCode] = useState("");
  const [steamId, setSteamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedCode, setDebouncedCode] = useState("");
  const [gameDetails, setGameDetails] = useState<GameSessionWithPlayers | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Debounce the game code for API calls
  useEffect(() => {
    if (gameCode.length === 6) {
      const timer = setTimeout(() => {
        setDebouncedCode(gameCode);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setGameDetails(null);
      setDebouncedCode("");
    }
  }, [gameCode]);

  // Fetch game details when code is entered
  const { isLoading: isLoadingGame, error } = useQuery({
    queryKey: [`/api/game/code/${debouncedCode}`],
    queryFn: () => debouncedCode ? getGameByCode(debouncedCode) : null,
    enabled: debouncedCode.length === 6,
    onSuccess: (data) => {
      if (data) {
        setGameDetails(data);
        // Clear any existing steamId selection
        setSteamId("");
      }
    },
    onError: () => {
      setGameDetails(null);
    }
  });

  const joinGameMutation = useMutation({
    mutationFn: joinGame,
    onSuccess: (data) => {
      const gameSession = data.gameSession;
      toast({
        title: "Game Joined!",
        description: `Successfully joined game: ${gameSession.name}`,
      });
      // Navigate to the game page
      navigate(`/game/${gameSession.code}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to join game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!gameCode || !steamId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    joinGameMutation.mutate({
      code: gameCode,
      steamId
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto px-3">
      <Card className="bg-background/80 rounded-lg shadow-lg border border-primary/30 backdrop-blur-md">
        <CardContent className="pt-3">
          <div className="mb-3 text-center">
            <h2 className="text-xl font-['Cinzel'] font-bold">Join Game</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="join-game-code" className="text-xs">Game Code</Label>
              <div className="relative">
                <Input
                  id="join-game-code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="bg-background/70 border-primary/40 font-mono uppercase h-8 text-sm pr-16"
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  required
                />
                {gameCode && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(gameCode);
                      toast({
                        title: "Code copied",
                        description: "Game code copied to clipboard"
                      });
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded px-2 py-0.5"
                  >
                    Copy
                  </button>
                )}
              </div>
              
              {isLoadingGame && gameCode.length === 6 && (
                <p className="text-xs text-primary/70 animate-pulse">Looking for game...</p>
              )}
              
              {error instanceof Error && gameCode.length === 6 && (
                <p className="text-xs text-red-400">{error.message}</p>
              )}
            </div>

            {gameDetails && (
              <div className="space-y-2 p-2 bg-background/40 rounded border border-primary/20">
                <p className="text-xs font-medium">{gameDetails.name}</p>
                <div className="space-y-1">
                  <Label className="text-xs mb-1">Select your ID</Label>
                  <RadioGroup 
                    value={steamId} 
                    onValueChange={setSteamId}
                    className="space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={gameDetails.player1SteamId} id="player1" />
                      <Label htmlFor="player1" className="text-xs font-mono">
                        {gameDetails.player1SteamId}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={gameDetails.player2SteamId} id="player2" />
                      <Label htmlFor="player2" className="text-xs font-mono">
                        {gameDetails.player2SteamId}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {!gameDetails && (
              <div className="space-y-1">
                <Label htmlFor="join-steam-id" className="text-xs">Your ID</Label>
                <Input
                  id="join-steam-id"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  className="bg-background/70 border-primary/40 h-8 text-sm"
                  placeholder="Your Steam ID"
                  required
                />
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1 h-8 text-xs"
                disabled={isLoading}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white h-8 text-xs"
                disabled={isLoading || (gameDetails && !steamId)}
                size="sm"
              >
                {isLoading ? "Joining..." : "Join"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}