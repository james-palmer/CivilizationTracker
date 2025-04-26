import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game session schema
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  player1SteamId: text("player1_steam_id").notNull(),
  player2SteamId: text("player2_steam_id").notNull(),
  currentTurn: text("current_turn").notNull(), // player1 or player2
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

// Player status schema
export const playerStatuses = pgTable("player_statuses", {
  id: serial("id").primaryKey(),
  gameSessionId: integer("game_session_id").notNull(),
  steamId: text("steam_id").notNull(),
  status: text("status").notNull(), // "ready", "busy", "unavailable"
  message: text("message"),
  lastTurnCompleted: timestamp("last_turn_completed"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPlayerStatusSchema = createInsertSchema(playerStatuses).omit({
  id: true,
  updatedAt: true,
});

export type InsertPlayerStatus = z.infer<typeof insertPlayerStatusSchema>;
export type PlayerStatus = typeof playerStatuses.$inferSelect;

// Game session with players type
export type GameSessionWithPlayers = {
  id: number;
  name: string;
  code: string;
  player1SteamId: string;
  player2SteamId: string;
  currentTurn: string;
  createdAt: Date;
  player1Status: PlayerStatus | null;
  player2Status: PlayerStatus | null;
};

// Join game schema for validation
export const joinGameSchema = z.object({
  code: z.string().length(6),
  steamId: z.string().min(1),
});

export type JoinGameData = z.infer<typeof joinGameSchema>;

// Complete turn schema
export const completeTurnSchema = z.object({
  gameSessionId: z.number(),
  steamId: z.string().min(1),
});

export type CompleteTurnData = z.infer<typeof completeTurnSchema>;

// Update status schema
export const updateStatusSchema = z.object({
  gameSessionId: z.number(),
  steamId: z.string().min(1),
  status: z.enum(["ready", "busy", "unavailable"]),
  message: z.string().optional(),
});

export type UpdateStatusData = z.infer<typeof updateStatusSchema>;

// Subscription schema (for push notifications)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  steamId: text("steam_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
