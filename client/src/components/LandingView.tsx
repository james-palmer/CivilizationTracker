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
          <div className="w-full max-w-4xl mx-auto text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-['Cinzel'] font-bold mb-2 text-white">
              <span className="text-accent">Civ VI</span> Turn Tracker
            </h2>
            <p className="text-sm md:text-base text-gray-300 max-w-md mx-auto">
              Coordinate multiplayer turns with notifications
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
            {/* Create Game Card */}
            <Card className="hover:-translate-y-1 transition-all duration-300 bg-background/60 border border-primary/30 rounded-xl shadow-lg p-4 flex flex-col backdrop-blur-md">
              <div className="mb-3 text-center">
                <div className="inline-block p-2 rounded-full bg-primary mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-['Cinzel'] font-semibold">Create Game</h3>
              </div>
              <Button 
                onClick={() => setView("create")} 
                className="mt-auto bg-primary hover:bg-primary/80 text-white relative overflow-hidden"
              >
                Create
              </Button>
            </Card>

            {/* Join Game Card */}
            <Card className="hover:-translate-y-1 transition-all duration-300 bg-background/60 border border-primary/30 rounded-xl shadow-lg p-4 flex flex-col backdrop-blur-md">
              <div className="mb-3 text-center">
                <div className="inline-block p-2 rounded-full bg-secondary mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-xl font-['Cinzel'] font-semibold">Join Game</h3>
              </div>
              <Button 
                onClick={() => setView("join")} 
                className="mt-auto bg-secondary hover:bg-secondary/80 text-white relative overflow-hidden"
              >
                Join
              </Button>
            </Card>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-300 text-xs">Receive push notifications for your turn</p>
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
