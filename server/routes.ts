import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertGameSessionSchema, 
  joinGameSchema, 
  updateStatusSchema,
  completeTurnSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import webpush from "web-push";
import * as crypto from "crypto";

// Generate VAPID keys if they don't exist
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BM3n1VFf0PJCCU74S7JlPMNEJHWigVlkfzrP56tUJnmC0L9_QfK3Ux3hGQO2-9hKz5_kOSWZFmsTPCFSFkDnR3g',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'c5Gu8YS4bCQnhwkuMI7CwyN_S9mVC0D7K-ZZFN9MVxQ'
};

// Setup web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:test@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Return VAPID public key
  app.get('/api/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  // Save push subscription
  app.post('/api/subscribe', async (req, res) => {
    try {
      const { steamId, subscription } = req.body;
      if (!steamId || !subscription) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const { endpoint, keys } = subscription;
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ message: 'Invalid subscription format' });
      }

      await storage.saveSubscription({
        steamId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      });

      res.status(201).json({ message: 'Subscription saved' });
    } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ message: 'Error saving subscription' });
    }
  });

  // Create a new game session
  app.post('/api/game', async (req, res) => {
    try {
      const gameData = insertGameSessionSchema.parse(req.body);
      
      // Check if the code is already in use
      const existingSession = await storage.getGameSessionByCode(gameData.code);
      if (existingSession) {
        return res.status(400).json({ message: 'Game code already in use' });
      }
      
      const gameSession = await storage.createGameSession(gameData);
      
      // Create initial player statuses
      await storage.createPlayerStatus({
        gameSessionId: gameSession.id,
        steamId: gameSession.player1SteamId,
        status: 'ready'
      });
      
      await storage.createPlayerStatus({
        gameSessionId: gameSession.id,
        steamId: gameSession.player2SteamId,
        status: 'unavailable'
      });
      
      res.status(201).json(gameSession);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating game session:', error);
      res.status(500).json({ message: 'Error creating game session' });
    }
  });

  // Join an existing game
  app.post('/api/game/join', async (req, res) => {
    try {
      const joinData = joinGameSchema.parse(req.body);
      
      const gameSession = await storage.getGameSessionWithPlayersByCode(joinData.code);
      if (!gameSession) {
        return res.status(404).json({ message: 'Game session not found' });
      }
      
      // Check if the user is part of this game
      if (gameSession.player1SteamId !== joinData.steamId && gameSession.player2SteamId !== joinData.steamId) {
        return res.status(403).json({ message: 'Not authorized to join this game' });
      }
      
      // Get or create player status
      let playerStatus = await storage.getPlayerStatus(gameSession.id, joinData.steamId);
      
      if (!playerStatus) {
        playerStatus = await storage.createPlayerStatus({
          gameSessionId: gameSession.id,
          steamId: joinData.steamId,
          status: 'ready'
        });
      }
      
      res.json({
        gameSession,
        playerStatus
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error joining game:', error);
      res.status(500).json({ message: 'Error joining game' });
    }
  });

  // Get game session by ID
  app.get('/api/game/:id', async (req, res) => {
    try {
      const gameId = parseInt(req.params.id, 10);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: 'Invalid game ID' });
      }
      
      const gameSession = await storage.getGameSessionWithPlayers(gameId);
      if (!gameSession) {
        return res.status(404).json({ message: 'Game session not found' });
      }
      
      res.json(gameSession);
    } catch (error) {
      console.error('Error fetching game session:', error);
      res.status(500).json({ message: 'Error fetching game session' });
    }
  });

  // Get game session by code
  app.get('/api/game/code/:code', async (req, res) => {
    try {
      const code = req.params.code;
      const gameSession = await storage.getGameSessionWithPlayersByCode(code);
      
      if (!gameSession) {
        return res.status(404).json({ message: 'Game session not found' });
      }
      
      res.json(gameSession);
    } catch (error) {
      console.error('Error fetching game session:', error);
      res.status(500).json({ message: 'Error fetching game session' });
    }
  });

  // Generate a unique game code
  app.get('/api/generate-code', (req, res) => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    res.json({ code });
  });

  // Update player status
  app.post('/api/status', async (req, res) => {
    try {
      const statusData = updateStatusSchema.parse(req.body);
      
      // Check if game exists
      const gameSession = await storage.getGameSessionById(statusData.gameSessionId);
      if (!gameSession) {
        return res.status(404).json({ message: 'Game session not found' });
      }
      
      // Check if player belongs to this game
      if (gameSession.player1SteamId !== statusData.steamId && gameSession.player2SteamId !== statusData.steamId) {
        return res.status(403).json({ message: 'Not authorized to update status in this game' });
      }
      
      const playerStatus = await storage.updatePlayerStatus(
        statusData.gameSessionId, 
        statusData.steamId, 
        statusData.status, 
        statusData.message
      );
      
      if (!playerStatus) {
        return res.status(404).json({ message: 'Player status not found' });
      }
      
      // Get opponent's steam ID and notify them of the status change
      const opponentSteamId = gameSession.player1SteamId === statusData.steamId ? 
        gameSession.player2SteamId : gameSession.player1SteamId;
      
      const opponentSubscription = await storage.getSubscriptionBySteamId(opponentSteamId);
      
      if (opponentSubscription) {
        try {
          const pushSubscription = {
            endpoint: opponentSubscription.endpoint,
            keys: {
              p256dh: opponentSubscription.p256dh,
              auth: opponentSubscription.auth
            }
          };
          
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: 'Civilization VI Turn Tracker',
              body: `Your opponent is ${statusData.status}`,
              tag: 'status-update',
              gameId: statusData.gameSessionId
            })
          );
        } catch (pushError) {
          console.error('Error sending push notification:', pushError);
          // Continue even if push fails
        }
      }
      
      res.json(playerStatus);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating player status:', error);
      res.status(500).json({ message: 'Error updating player status' });
    }
  });

  // Complete turn
  app.post('/api/complete-turn', async (req, res) => {
    try {
      const turnData = completeTurnSchema.parse(req.body);
      
      // Check if game exists
      const gameSession = await storage.getGameSessionById(turnData.gameSessionId);
      if (!gameSession) {
        return res.status(404).json({ message: 'Game session not found' });
      }
      
      // Check if it's the player's turn
      if ((gameSession.currentTurn === 'player1' && gameSession.player1SteamId !== turnData.steamId) ||
          (gameSession.currentTurn === 'player2' && gameSession.player2SteamId !== turnData.steamId)) {
        return res.status(400).json({ message: 'It\'s not your turn' });
      }
      
      // Update player's last turn timestamp
      await storage.updatePlayerLastTurn(turnData.gameSessionId, turnData.steamId);
      
      // Switch turns
      const nextTurn = gameSession.currentTurn === 'player1' ? 'player2' : 'player1';
      await storage.updateGameSessionTurn(turnData.gameSessionId, nextTurn);
      
      // Get opponent's steam ID and notify them
      const opponentSteamId = gameSession.player1SteamId === turnData.steamId ? 
        gameSession.player2SteamId : gameSession.player1SteamId;
      
      const opponentSubscription = await storage.getSubscriptionBySteamId(opponentSteamId);
      
      if (opponentSubscription) {
        try {
          const pushSubscription = {
            endpoint: opponentSubscription.endpoint,
            keys: {
              p256dh: opponentSubscription.p256dh,
              auth: opponentSubscription.auth
            }
          };
          
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: 'Civilization VI Turn Tracker',
              body: 'Your opponent has completed their turn. It\'s your turn now!',
              tag: 'turn-complete',
              gameId: turnData.gameSessionId
            })
          );
        } catch (pushError) {
          console.error('Error sending push notification:', pushError);
          // Continue even if push fails
        }
      }
      
      // Get updated game session
      const updatedGameSession = await storage.getGameSessionWithPlayers(turnData.gameSessionId);
      
      res.json(updatedGameSession);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error completing turn:', error);
      res.status(500).json({ message: 'Error completing turn' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
