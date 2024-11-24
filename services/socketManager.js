const socketIO = require('socket.io');

class SocketManager {
    constructor(server) {
        this.io = socketIO(server);
        this.games = new Map(); // Almacena juegos activos
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.io.on('connection', (socket) => {
            // Unirse al lobby
            socket.on('joinLobby', (userId) => {
                const gameId = this.findOrCreateGame();
                socket.join(gameId);
                this.games.get(gameId).players.push({
                    id: userId,
                    socket: socket.id
                });
                
                // Si hay suficientes jugadores, iniciar el juego
                if (this.games.get(gameId).players.length >= 2) {
                    setTimeout(() => {
                        this.startGame(gameId);
                    }, 30000); // 30 segundos de espera
                }
            });

            // Manejar selección de número
            socket.on('selectNumber', ({ gameId, number }) => {
                // Validar selección
            });

            // Manejar llamada de bingo
            socket.on('callBingo', ({ gameId, userId, card }) => {
                // Validar victoria
            });
        });
    }

    startGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) return;

        // Generar tarjetones para cada jugador
        game.players.forEach(player => {
            const card = this.generateBingoCard();
            this.io.to(player.socket).emit('gameCard', card);
        });

        // Iniciar sorteo de balotas
        this.startDrawingBalls(gameId);
    }

    generateBingoCard() {
        // Implementar generación de tarjetón
    }

    startDrawingBalls(gameId) {
        // Implementar sorteo de balotas
    }
}

module.exports = SocketManager;