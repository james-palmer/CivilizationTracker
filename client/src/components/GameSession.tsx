import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updatePlayerStatus, completeTurn, getTimeSince } from "@/lib/gameService";
import PlayerStatus from "./PlayerStatus";
import { GameSessionWithPlayers } from "@shared/schema";

interface GameSessionProps {
  game: GameSessionWithPlayers;
  currentPlayerSteamId: string;
}

export default function GameSession({ game, currentPlayerSteamId }: GameSessionProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determine which player the current user is
  const isPlayer1 = currentPlayerSteamId === game.player1SteamId;
  const currentPlayer = isPlayer1 ? 'player1' : 'player2';
  const isYourTurn = game.currentTurn === (isPlayer1 ? 'player1' : 'player2');
  
  // Get player statuses
  const currentPlayerStatus = isPlayer1 ? game.player1Status : game.player2Status;
  const opponentStatus = isPlayer1 ? game.player2Status : game.player1Status;
  
  const updateStatusMutation = useMutation({
    mutationFn: updatePlayerStatus,
    onSuccess: () => {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: [`/api/game/${game.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      });
    }
  });
  
  const completeTurnMutation = useMutation({
    mutationFn: (steamId: string) => completeTurn(game.id, steamId),
    onSuccess: () => {
      toast({ title: "Turn completed", description: "Your opponent has been notified" });
      queryClient.invalidateQueries({ queryKey: [`/api/game/${game.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete turn",
        variant: "destructive"
      });
    }
  });
  
  const handleStatusUpdate = (status: string) => {
    updateStatusMutation.mutate({
      gameSessionId: game.id,
      steamId: currentPlayerSteamId,
      status
    });
  };
  
  const handleCompleteTurn = () => {
    if (!isYourTurn) {
      toast({
        title: "Not your turn",
        description: "It's not your turn to play",
        variant: "destructive"
      });
      return;
    }
    
    completeTurnMutation.mutate(currentPlayerSteamId);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(game.code);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLeaveGame = () => {
    navigate("/");
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-background/60 rounded-xl shadow-lg border border-primary/30 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-primary/20">
          <div>
            <h2 className="text-2xl font-['Cinzel'] font-bold mb-1">{game.name}</h2>
            <div className="flex items-center text-sm text-gray-300">
              <span>Code: </span>
              <span className="ml-1 font-mono">{game.code}</span>
              <button 
                onClick={handleCopyCode} 
                className="ml-2 text-gray-400 hover:text-white"
                aria-label="Copy code"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className={`${isYourTurn ? 'bg-green-500' : 'bg-amber-500'} py-1 px-3 rounded-full text-sm font-medium flex items-center`}>
              <div className="h-2 w-2 rounded-full bg-white mr-2"></div>
              <span>{isYourTurn ? "Your Turn" : "Opponent's Turn"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Player Status */}
          <PlayerStatus 
            name={isPlayer1 ? game.player1SteamId : game.player2SteamId}
            steamId={currentPlayerSteamId}
            status={currentPlayerStatus?.status || "unavailable"}
            lastTurnCompleted={currentPlayerStatus?.lastTurnCompleted}
            isCurrentPlayer={true}
            isTheirTurn={isYourTurn}
            onStatusUpdate={handleStatusUpdate}
            onCompleteTurn={handleCompleteTurn}
          />
          
          {/* Opponent Status */}
          <PlayerStatus 
            name={isPlayer1 ? game.player2SteamId : game.player1SteamId}
            steamId={isPlayer1 ? game.player2SteamId : game.player1SteamId}
            status={opponentStatus?.status || "unavailable"}
            message={opponentStatus?.message}
            lastTurnCompleted={opponentStatus?.lastTurnCompleted}
            isCurrentPlayer={false}
            isTheirTurn={!isYourTurn}
          />
        </div>

        <div className="mt-8 pt-4 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            <p>Active since: {getTimeSince(game.createdAt)}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLeaveGame}
            className="text-gray-300 hover:text-white text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave Game
          </Button>
        </div>
      </Card>
    </div>
  );
}
