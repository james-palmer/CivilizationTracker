import { apiRequest } from "./queryClient";
import type { 
  InsertGameSession, 
  GameSession, 
  GameSessionWithPlayers,
  JoinGameData,
  UpdateStatusData
} from "@shared/schema";

// Generate a unique game code
export async function generateGameCode(): Promise<string> {
  try {
    const res = await fetch("/api/generate-code");
    const data = await res.json();
    return data.code;
  } catch (error) {
    console.error("Error generating game code:", error);
    // Fallback to client-side code generation
    return generateRandomCode();
  }
}

// Generate a random 6-character code on the client side as fallback
function generateRandomCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Create a new game session
export async function createGameSession(gameData: InsertGameSession): Promise<GameSession> {
  const res = await apiRequest("POST", "/api/game", gameData);
  return res.json();
}

// Join an existing game session
export async function joinGame(joinData: JoinGameData): Promise<GameSessionWithPlayers> {
  const res = await apiRequest("POST", "/api/game/join", joinData);
  const data = await res.json();
  return data.gameSession;
}

// Get a game session by code
export async function getGameByCode(code: string): Promise<GameSessionWithPlayers> {
  const res = await fetch(`/api/game/code/${code}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch game: ${res.statusText}`);
  }
  return res.json();
}

// Get a game session by ID
export async function getGameById(id: number): Promise<GameSessionWithPlayers> {
  const res = await fetch(`/api/game/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch game: ${res.statusText}`);
  }
  return res.json();
}

// Update player status
export async function updatePlayerStatus(data: UpdateStatusData): Promise<void> {
  await apiRequest("POST", "/api/status", data);
}

// Complete a turn
export async function completeTurn(gameSessionId: number, steamId: string): Promise<GameSessionWithPlayers> {
  const res = await apiRequest("POST", "/api/complete-turn", { gameSessionId, steamId });
  return res.json();
}

// Format date for display
export function formatDate(date: Date | string): string {
  if (!date) return 'Never';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
}

// Get time since for display (e.g. "2 hours ago")
export function getTimeSince(date: Date | string): string {
  if (!date) return 'Never';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'Just now';
}
