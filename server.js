const express = require('express');
const app = express();
const http = require('http').createServer(app);
const crypto = require('crypto');

app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// In-memory storage
const games = new Map();
const subscriptions = new Map();

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Generate a unique game code
function generateGameCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// API Routes
app.post('/api/game', (req, res) => {
    try {
        const { name, steamId } = req.body;
        if (!name || !steamId) {
            return res.status(400).json({ message: 'Name and Steam ID are required' });
        }

        const code = generateGameCode();
        const game = {
            id: Date.now(),
            code,
            name,
            player1SteamId: steamId,
            player2SteamId: null,
            currentTurn: 1,
            players: [
                { steamId, status: 'ready' }
            ],
            createdAt: new Date()
        };

        games.set(code, game);
        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ message: 'Error creating game' });
    }
});

app.post('/api/game/join', (req, res) => {
    try {
        const { code, steamId } = req.body;
        const game = games.get(code);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.player1SteamId === steamId) {
            return res.json({ game });
        }

        if (!game.player2SteamId) {
            game.player2SteamId = steamId;
            game.players.push({ steamId, status: 'ready' });
            games.set(code, game);
        } else if (game.player2SteamId !== steamId) {
            return res.status(403).json({ message: 'Game is full' });
        }

        res.json({ game });
    } catch (error) {
        res.status(500).json({ message: 'Error joining game' });
    }
});

app.get('/api/game/code/:code', (req, res) => {
    try {
        const { code } = req.params;
        const game = games.get(code);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json(game);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching game' });
    }
});

app.post('/api/status', (req, res) => {
    try {
        const { code, steamId, status, message } = req.body;
        const game = games.get(code);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const player = game.players.find(p => p.steamId === steamId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        player.status = status;
        player.statusMessage = message;
        games.set(code, game);

        // Notify other player if they have a subscription
        const otherPlayer = game.players.find(p => p.steamId !== steamId);
        if (otherPlayer) {
            const subscription = subscriptions.get(otherPlayer.steamId);
            if (subscription) {
                // In a real app, you would send a push notification here
                console.log(`Notifying player ${otherPlayer.steamId} about status change`);
            }
        }

        res.json({ status: 'updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
});

app.post('/api/subscribe', (req, res) => {
    try {
        const { steamId, subscription } = req.body;
        if (!steamId || !subscription) {
            return res.status(400).json({ message: 'Steam ID and subscription are required' });
        }

        subscriptions.set(steamId, subscription);
        res.status(201).json({ message: 'Subscription saved' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving subscription' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 