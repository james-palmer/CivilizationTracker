import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateGameCode, createGameSession } from "@/lib/gameService";
import { useMutation } from "@tanstack/react-query";

interface CreateGameFormProps {
  onCancel: () => void;
}

export default function CreateGameForm({ onCancel }: CreateGameFormProps) {
  const [sessionName, setSessionName] = useState("");
  const [player1SteamId, setPlayer1SteamId] = useState("");
  const [player2SteamId, setPlayer2SteamId] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Generate a game code when the component mounts
  useEffect(() => {
    const generateCode = async () => {
      const code = await generateGameCode();
      setGameCode(code);
    };
    generateCode();
  }, []);

  // Refresh the game code
  const handleRefreshCode = async () => {
    const code = await generateGameCode();
    setGameCode(code);
  };

  const createGameMutation = useMutation({
    mutationFn: createGameSession,
    onSuccess: (data) => {
      toast({
        title: "Game Created!",
        description: `Successfully created game: ${data.name}`,
      });
      // Navigate to the game page
      navigate(`/game/${data.code}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!sessionName || !player1SteamId || !player2SteamId || !gameCode) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    createGameMutation.mutate({
      name: sessionName,
      code: gameCode,
      player1SteamId,
      player2SteamId,
      currentTurn: "player1"
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-background/80 rounded-xl shadow-lg border border-primary/30 backdrop-blur-md">
        <CardContent className="pt-4">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-['Cinzel'] font-bold">New Game</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="session-name" className="text-sm">Game Name</Label>
              <Input
                id="session-name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="bg-background/70 border-primary/40"
                placeholder="Name your game"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="player1-steam-id" className="text-sm">Your ID</Label>
              <Input
                id="player1-steam-id"
                value={player1SteamId}
                onChange={(e) => setPlayer1SteamId(e.target.value)}
                className="bg-background/70 border-primary/40"
                placeholder="Your Steam ID"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="player2-steam-id" className="text-sm">Opponent ID</Label>
              <Input
                id="player2-steam-id"
                value={player2SteamId}
                onChange={(e) => setPlayer2SteamId(e.target.value)}
                className="bg-background/70 border-primary/40"
                placeholder="Opponent's Steam ID"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="game-code" className="text-sm">Game Code</Label>
              <div className="relative">
                <Input
                  id="game-code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="bg-background/70 border-primary/40 font-mono uppercase"
                  readOnly
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleRefreshCode}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-400">Code to share with opponent</p>
            </div>

            <div className="pt-3 flex gap-3">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
