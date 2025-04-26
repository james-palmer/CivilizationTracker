import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getTimeSince } from "@/lib/gameService";

type PlayerStatus = "ready" | "busy" | "unavailable";

interface PlayerStatusProps {
  name: string;
  steamId: string;
  status: string;
  message?: string | null;
  lastTurnCompleted?: Date | string | null;
  isCurrentPlayer: boolean;
  isTheirTurn: boolean;
  onStatusUpdate?: (status: PlayerStatus) => void;
  onCompleteTurn?: () => void;
}

export default function PlayerStatus({
  name,
  steamId,
  status,
  message,
  lastTurnCompleted,
  isCurrentPlayer,
  isTheirTurn,
  onStatusUpdate,
  onCompleteTurn
}: PlayerStatusProps) {
  const [showStatusButtons, setShowStatusButtons] = useState(true);
  
  // Color for status indicators
  const statusColor = {
    ready: "bg-green-500",
    busy: "bg-amber-500",
    unavailable: "bg-red-500"
  };
  
  // Status text
  const statusText = {
    ready: "Ready",
    busy: "Busy",
    unavailable: "Unavailable"
  };
  
  // Handle status button click
  const handleStatusButtonClick = (newStatus: PlayerStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(newStatus);
    }
    setShowStatusButtons(false);
  };
  
  // Handle complete turn button click
  const handleCompleteTurn = () => {
    if (onCompleteTurn) {
      onCompleteTurn();
      setShowStatusButtons(true);
    }
  };
  
  return (
    <div className="bg-background/70 rounded-lg p-3 border border-primary/20">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-sm">{isCurrentPlayer ? "You" : "Opponent"}</h3>
          <p className="text-xs text-gray-400 text-[10px]">{steamId}</p>
        </div>
        <div className={`${statusColor[status as keyof typeof statusColor]} px-1.5 py-0.5 rounded text-xs font-medium`}>
          {statusText[status as keyof typeof statusText]}
        </div>
      </div>
      
      <div className="text-xs mb-2">
        <p className="text-gray-300">
          Last turn: <span className="text-white">{lastTurnCompleted ? getTimeSince(lastTurnCompleted) : 'Never'}</span>
        </p>
      </div>
      
      {isCurrentPlayer ? (
        <div className="mt-3">
          {isTheirTurn && showStatusButtons ? (
            <div className="space-y-1.5">
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white text-xs"
                onClick={() => handleStatusButtonClick("ready")}
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Ready to play
              </Button>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs"
                onClick={() => handleStatusButtonClick("busy")}
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Busy (~30 min)
              </Button>
              <Button
                className="w-full bg-red-500 hover:bg-red-600 text-white text-xs"
                onClick={() => handleStatusButtonClick("unavailable")}
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Unavailable
              </Button>
            </div>
          ) : isTheirTurn && !showStatusButtons ? (
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-white text-xs font-semibold rounded-lg transition-all"
              onClick={handleCompleteTurn}
              size="sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Turn Completed
            </Button>
          ) : (
            <div className="p-2 rounded-lg bg-background/50 text-center text-gray-300 text-xs">
              <p>Waiting for opponent's turn</p>
            </div>
          )}
        </div>
      ) : (
        message && (
          <div className="mt-3 bg-background/50 p-2 rounded-lg">
            <p className="text-xs text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {message}
            </p>
          </div>
        )
      )}
    </div>
  );
}
