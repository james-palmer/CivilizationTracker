// DOM Elements
const landingView = document.getElementById('landingView');
const gameView = document.getElementById('gameView');
const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const createGameModal = document.getElementById('createGameModal');
const joinGameModal = document.getElementById('joinGameModal');
const createGameForm = document.getElementById('createGameForm');
const joinGameForm = document.getElementById('joinGameForm');
const notificationBanner = document.getElementById('notificationBanner');
const themeToggle = document.getElementById('themeToggle');
const closeModalBtns = document.querySelectorAll('.close-modal');
const closeNotificationBtn = document.querySelector('.close-notification');
const enableNotificationsBtn = document.getElementById('enableNotifications');

// State
let currentGame = null;
let currentPlayerSteamId = null;
let gamePollingInterval = null;

// API endpoints
const API_BASE_URL = '/api';

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme;
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
    const newTheme = document.body.className === 'dark' ? 'light' : 'dark';
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
});

// Modal Management
function showModal(modal) {
    modal.classList.remove('hidden');
}

function hideModal(modal) {
    modal.classList.add('hidden');
}

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        hideModal(btn.closest('.modal'));
    });
});

// Game Management
async function createGame(event) {
    event.preventDefault();
    const gameName = document.getElementById('newGameName').value;
    const steamId = document.getElementById('steamId').value;

    try {
        const response = await fetch(`${API_BASE_URL}/game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: gameName, steamId }),
        });

        if (!response.ok) throw new Error('Failed to create game');

        const game = await response.json();
        hideModal(createGameModal);
        joinGame(game.code, steamId);
    } catch (error) {
        alert('Failed to create game: ' + error.message);
    }
}

async function joinGame(gameCode, steamId) {
    try {
        const response = await fetch(`${API_BASE_URL}/game/code/${gameCode}`);
        if (!response.ok) throw new Error('Game not found');

        const game = await response.json();
        
        // Save game info to local storage
        const games = JSON.parse(localStorage.getItem('civ-tracker-games') || '{}');
        games[gameCode] = {
            id: game.id,
            name: game.name,
            steamId
        };
        localStorage.setItem('civ-tracker-games', JSON.stringify(games));
        localStorage.setItem(`civ-tracker-steam-id-${gameCode}`, steamId);

        // Update state and UI
        currentGame = game;
        currentPlayerSteamId = steamId;
        updateGameView();
        startGamePolling();

        // Show notification banner if notifications aren't enabled
        if ('Notification' in window && Notification.permission !== 'granted') {
            showNotificationBanner();
        }
    } catch (error) {
        alert('Failed to join game: ' + error.message);
    }
}

function updateGameView() {
    if (!currentGame) return;

    landingView.classList.add('hidden');
    gameView.classList.remove('hidden');

    document.getElementById('gameName').textContent = currentGame.name;
    document.getElementById('gameCode').textContent = currentGame.code;

    // Update players list
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    currentGame.players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player';
        playerElement.textContent = `Player: ${player.steamId}`;
        if (player.steamId === currentPlayerSteamId) {
            playerElement.textContent += ' (You)';
        }
        playersList.appendChild(playerElement);
    });

    // Update turn information
    const currentTurn = document.getElementById('currentTurn');
    currentTurn.textContent = `Turn ${currentGame.currentTurn || 1}`;
}

async function pollGameState() {
    try {
        const response = await fetch(`${API_BASE_URL}/game/code/${currentGame.code}`);
        if (!response.ok) throw new Error('Failed to fetch game state');

        const game = await response.json();
        if (game.currentTurn !== currentGame.currentTurn) {
            currentGame = game;
            updateGameView();
            if (Notification.permission === 'granted') {
                new Notification('Civilization Turn Update', {
                    body: `It's now turn ${game.currentTurn} in ${game.name}!`,
                });
            }
        }
    } catch (error) {
        console.error('Error polling game state:', error);
    }
}

function startGamePolling() {
    if (gamePollingInterval) clearInterval(gamePollingInterval);
    gamePollingInterval = setInterval(pollGameState, 5000);
}

// Notification Management
function showNotificationBanner() {
    notificationBanner.classList.remove('hidden');
}

async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            notificationBanner.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

// Event Listeners
createGameBtn.addEventListener('click', () => showModal(createGameModal));
joinGameBtn.addEventListener('click', () => showModal(joinGameModal));
createGameForm.addEventListener('submit', createGame);

joinGameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const gameCode = document.getElementById('gameCodeInput').value;
    const steamId = document.getElementById('joinSteamId').value;
    hideModal(joinGameModal);
    joinGame(gameCode, steamId);
});

closeNotificationBtn?.addEventListener('click', () => {
    notificationBanner.classList.add('hidden');
});

enableNotificationsBtn?.addEventListener('click', requestNotificationPermission);

// Initialize
initializeTheme();

// Check for existing game session
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get('code');
    
    if (gameCode) {
        const games = JSON.parse(localStorage.getItem('civ-tracker-games') || '{}');
        const steamId = localStorage.getItem(`civ-tracker-steam-id-${gameCode}`);
        
        if (games[gameCode] && steamId) {
            joinGame(gameCode, steamId);
        } else {
            showModal(joinGameModal);
            document.getElementById('gameCodeInput').value = gameCode;
        }
    }
}); 