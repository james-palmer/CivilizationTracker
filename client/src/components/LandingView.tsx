import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CreateGameForm from "./CreateGameForm";
import JoinGameForm from "./JoinGameForm";

export default function LandingView() {
  const [view, setView] = useState<"landing" | "create" | "join">("landing");

  return (
    <div className="flex flex-col items-center">
      {view === "landing" && (
        <>
          <div className="w-full max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-['Cinzel'] font-bold mb-4 text-white">
              Track Your <span className="text-accent">Civilization VI</span> Turns
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Never lose track of whose turn it is again. Create or join a game session to coordinate with your opponent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Create Game Card */}
            <Card className="hover:-translate-y-1 transition-all duration-300 bg-background/60 border border-primary/30 rounded-xl shadow-lg p-6 flex flex-col backdrop-blur-md">
              <div className="mb-4 text-center">
                <div className="inline-block p-3 rounded-full bg-primary mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-['Cinzel'] font-semibold mb-2">Create New Game</h3>
                <p className="text-gray-300 text-sm">Start a new session and invite another player</p>
              </div>
              <Button 
                onClick={() => setView("create")} 
                className="mt-auto bg-primary hover:bg-primary/80 text-white relative overflow-hidden"
              >
                Create Game
              </Button>
            </Card>

            {/* Join Game Card */}
            <Card className="hover:-translate-y-1 transition-all duration-300 bg-background/60 border border-primary/30 rounded-xl shadow-lg p-6 flex flex-col backdrop-blur-md">
              <div className="mb-4 text-center">
                <div className="inline-block p-3 rounded-full bg-secondary mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-['Cinzel'] font-semibold mb-2">Join Existing Game</h3>
                <p className="text-gray-300 text-sm">Enter a game code to join an existing session</p>
              </div>
              <Button 
                onClick={() => setView("join")} 
                className="mt-auto bg-secondary hover:bg-secondary/80 text-white relative overflow-hidden"
              >
                Join Game
              </Button>
            </Card>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="flex space-x-4 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-300 text-sm">This app uses push notifications to alert players of their turn</p>
            </div>
          </div>
        </>
      )}

      {view === "create" && (
        <CreateGameForm onCancel={() => setView("landing")} />
      )}

      {view === "join" && (
        <JoinGameForm onCancel={() => setView("landing")} />
      )}
    </div>
  );
}
