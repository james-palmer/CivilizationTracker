import { 
  users, type User, type InsertUser,
  gameSessions, type GameSession, type InsertGameSession,
  playerStatuses, type PlayerStatus, type InsertPlayerStatus,
  subscriptions, type Subscription, type InsertSubscription,
  type GameSessionWithPlayers
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game session methods
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSessionByCode(code: string): Promise<GameSession | undefined>;
  getGameSessionById(id: number): Promise<GameSession | undefined>;
  getGameSessionWithPlayers(id: number): Promise<GameSessionWithPlayers | undefined>;
  getGameSessionWithPlayersByCode(code: string): Promise<GameSessionWithPlayers | undefined>;
  updateGameSessionTurn(id: number, currentTurn: string): Promise<GameSession | undefined>;
  
  // Player status methods
  createPlayerStatus(playerStatus: InsertPlayerStatus): Promise<PlayerStatus>;
  getPlayerStatus(gameSessionId: number, steamId: string): Promise<PlayerStatus | undefined>;
  updatePlayerStatus(gameSessionId: number, steamId: string, 
    status: string, message?: string): Promise<PlayerStatus | undefined>;
  updatePlayerLastTurn(gameSessionId: number, steamId: string): Promise<PlayerStatus | undefined>;
  
  // Subscription methods
  saveSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionBySteamId(steamId: string): Promise<Subscription | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [gameSession] = await db
      .insert(gameSessions)
      .values({
        ...session,
        createdAt: new Date()
      })
      .returning();
    return gameSession;
  }

  async getGameSessionByCode(code: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.code, code));
    return session || undefined;
  }

  async getGameSessionById(id: number): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, id));
    return session || undefined;
  }

  async getGameSessionWithPlayers(id: number): Promise<GameSessionWithPlayers | undefined> {
    const session = await this.getGameSessionById(id);
    if (!session) return undefined;
    
    const player1Status = await this.getPlayerStatus(id, session.player1SteamId);
    const player2Status = await this.getPlayerStatus(id, session.player2SteamId);
    
    return {
      ...session,
      player1Status: player1Status || null,
      player2Status: player2Status || null
    };
  }

  async getGameSessionWithPlayersByCode(code: string): Promise<GameSessionWithPlayers | undefined> {
    const session = await this.getGameSessionByCode(code);
    if (!session) return undefined;
    
    return this.getGameSessionWithPlayers(session.id);
  }

  async updateGameSessionTurn(id: number, currentTurn: string): Promise<GameSession | undefined> {
    const [updatedSession] = await db
      .update(gameSessions)
      .set({ currentTurn })
      .where(eq(gameSessions.id, id))
      .returning();
    
    return updatedSession || undefined;
  }

  async createPlayerStatus(playerStatus: InsertPlayerStatus): Promise<PlayerStatus> {
    const [status] = await db
      .insert(playerStatuses)
      .values({
        ...playerStatus,
        updatedAt: new Date()
      })
      .returning();
    return status;
  }

  async getPlayerStatus(gameSessionId: number, steamId: string): Promise<PlayerStatus | undefined> {
    const [status] = await db
      .select()
      .from(playerStatuses)
      .where(
        and(
          eq(playerStatuses.gameSessionId, gameSessionId),
          eq(playerStatuses.steamId, steamId)
        )
      );
    return status || undefined;
  }

  async updatePlayerStatus(
    gameSessionId: number, 
    steamId: string, 
    status: string, 
    message?: string
  ): Promise<PlayerStatus | undefined> {
    const playerStatus = await this.getPlayerStatus(gameSessionId, steamId);
    if (!playerStatus) return undefined;
    
    const updateValues: Partial<PlayerStatus> = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (message !== undefined) {
      updateValues.message = message;
    }
    
    const [updatedStatus] = await db
      .update(playerStatuses)
      .set(updateValues)
      .where(
        and(
          eq(playerStatuses.gameSessionId, gameSessionId),
          eq(playerStatuses.steamId, steamId)
        )
      )
      .returning();
    
    return updatedStatus || undefined;
  }

  async updatePlayerLastTurn(gameSessionId: number, steamId: string): Promise<PlayerStatus | undefined> {
    const playerStatus = await this.getPlayerStatus(gameSessionId, steamId);
    if (!playerStatus) return undefined;
    
    const now = new Date();
    
    const [updatedStatus] = await db
      .update(playerStatuses)
      .set({ 
        lastTurnCompleted: now,
        updatedAt: now
      })
      .where(
        and(
          eq(playerStatuses.gameSessionId, gameSessionId),
          eq(playerStatuses.steamId, steamId)
        )
      )
      .returning();
    
    return updatedStatus || undefined;
  }

  async saveSubscription(subscription: InsertSubscription): Promise<Subscription> {
    // Check if subscription already exists for this steamId
    const existingSubscription = await this.getSubscriptionBySteamId(subscription.steamId);
    
    if (existingSubscription) {
      // Update the existing subscription
      const [updatedSubscription] = await db
        .update(subscriptions)
        .set({ 
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth
        })
        .where(eq(subscriptions.steamId, subscription.steamId))
        .returning();
      
      return updatedSubscription;
    } else {
      // Create a new subscription
      const [newSubscription] = await db
        .insert(subscriptions)
        .values({
          ...subscription,
          createdAt: new Date()
        })
        .returning();
      
      return newSubscription;
    }
  }

  async getSubscriptionBySteamId(steamId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.steamId, steamId));
    
    return subscription || undefined;
  }
}

export const storage = new DatabaseStorage();
