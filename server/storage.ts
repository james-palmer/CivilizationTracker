import { 
  users, type User, type InsertUser,
  gameSessions, type GameSession, type InsertGameSession,
  playerStatuses, type PlayerStatus, type InsertPlayerStatus,
  subscriptions, type Subscription, type InsertSubscription,
  type GameSessionWithPlayers
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameSessions: Map<number, GameSession>;
  private playerStatuses: Map<string, PlayerStatus>; // compound key: `${gameSessionId}-${steamId}`
  private subscriptions: Map<string, Subscription>; // key: steamId
  private currentUserId: number;
  private currentGameSessionId: number;
  private currentPlayerStatusId: number;
  private currentSubscriptionId: number;

  constructor() {
    this.users = new Map();
    this.gameSessions = new Map();
    this.playerStatuses = new Map();
    this.subscriptions = new Map();
    this.currentUserId = 1;
    this.currentGameSessionId = 1;
    this.currentPlayerStatusId = 1;
    this.currentSubscriptionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Game session methods
  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const id = this.currentGameSessionId++;
    const createdAt = new Date();
    const gameSession: GameSession = { ...session, id, createdAt };
    this.gameSessions.set(id, gameSession);
    return gameSession;
  }

  async getGameSessionByCode(code: string): Promise<GameSession | undefined> {
    return Array.from(this.gameSessions.values()).find(
      (session) => session.code === code,
    );
  }

  async getGameSessionById(id: number): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async getGameSessionWithPlayers(id: number): Promise<GameSessionWithPlayers | undefined> {
    const session = await this.getGameSessionById(id);
    if (!session) return undefined;

    const player1Status = await this.getPlayerStatus(id, session.player1SteamId);
    const player2Status = await this.getPlayerStatus(id, session.player2SteamId);

    return {
      ...session,
      player1Status,
      player2Status,
    };
  }

  async getGameSessionWithPlayersByCode(code: string): Promise<GameSessionWithPlayers | undefined> {
    const session = await this.getGameSessionByCode(code);
    if (!session) return undefined;

    return this.getGameSessionWithPlayers(session.id);
  }

  async updateGameSessionTurn(id: number, currentTurn: string): Promise<GameSession | undefined> {
    const session = await this.getGameSessionById(id);
    if (!session) return undefined;

    const updatedSession: GameSession = { ...session, currentTurn };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Player status methods
  async createPlayerStatus(playerStatus: InsertPlayerStatus): Promise<PlayerStatus> {
    const id = this.currentPlayerStatusId++;
    const updatedAt = new Date();
    const status: PlayerStatus = { ...playerStatus, id, updatedAt };
    
    const key = `${playerStatus.gameSessionId}-${playerStatus.steamId}`;
    this.playerStatuses.set(key, status);
    
    return status;
  }

  async getPlayerStatus(gameSessionId: number, steamId: string): Promise<PlayerStatus | undefined> {
    const key = `${gameSessionId}-${steamId}`;
    return this.playerStatuses.get(key);
  }

  async updatePlayerStatus(
    gameSessionId: number, 
    steamId: string, 
    status: string, 
    message?: string
  ): Promise<PlayerStatus | undefined> {
    const key = `${gameSessionId}-${steamId}`;
    const playerStatus = this.playerStatuses.get(key);
    
    if (!playerStatus) return undefined;
    
    const updatedStatus: PlayerStatus = { 
      ...playerStatus, 
      status, 
      message: message || playerStatus.message,
      updatedAt: new Date()
    };
    
    this.playerStatuses.set(key, updatedStatus);
    return updatedStatus;
  }

  async updatePlayerLastTurn(gameSessionId: number, steamId: string): Promise<PlayerStatus | undefined> {
    const key = `${gameSessionId}-${steamId}`;
    const playerStatus = this.playerStatuses.get(key);
    
    if (!playerStatus) return undefined;
    
    const updatedStatus: PlayerStatus = { 
      ...playerStatus, 
      lastTurnCompleted: new Date(),
      updatedAt: new Date()
    };
    
    this.playerStatuses.set(key, updatedStatus);
    return updatedStatus;
  }

  // Subscription methods
  async saveSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const createdAt = new Date();
    const sub: Subscription = { ...subscription, id, createdAt };
    
    this.subscriptions.set(subscription.steamId, sub);
    return sub;
  }

  async getSubscriptionBySteamId(steamId: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(steamId);
  }
}

export const storage = new MemStorage();
