// services/socketManager.js
import socketIO from 'socket.io';
import { generateBingoCard } from '../utils/generateCard'; // Asegúrate de que la ruta sea correcta

class SocketManager {
  constructor(server) {
    this.io = socketIO(server);
    this.games = new Map(); // Almacena juegos activos
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.io.on('connection', (socket) => {
      console.log('Nuevo cliente conectado:', socket.id);

      // Unirse al lobby
      socket.on('joinLobby', (userId) => {
        const gameId = this.findOrCreateGame();
        socket.join(gameId);
        this.games.get(gameId).players.push({
          id: userId,
          socket: socket.id
        });

        console.log(`Cliente ${socket.id} se unió al juego ${gameId}`);

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
        console.log(`Número seleccionado: ${number} en el juego ${gameId}`);
      });

      // Manejar llamada de bingo
      socket.on('callBingo', ({ gameId, userId, card }) => {
        // Validar victoria
        console.log(`Bingo llamado por el usuario ${userId} en el juego ${gameId}`);
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });
  }

  findOrCreateGame() {
    // Buscar un juego existente o crear uno nuevo
    let gameId;
    for (let [id, game] of this.games) {
      if (game.players.length < 2) {
        gameId = id;
        break;
      }
    }

    if (!gameId) {
      gameId = `game-${Date.now()}`;
      this.games.set(gameId, { players: [] });
    }

    return gameId;
  }

  startGame(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    console.log(`Iniciando el juego ${gameId}`);

    // Generar tarjetones para cada jugador
    game.players.forEach(player => {
      const card = generateBingoCard();
      this.io.to(player.socket).emit('gameCard', card);
    });

    // Iniciar sorteo de balotas
    this.startDrawingBalls(gameId);
  }

  generateBingoCard() {
    // Implementar generación de tarjetón
    return {
      B: this.getRandomNumbers(1, 15, 5),
      I: this.getRandomNumbers(16, 30, 5),
      N: this.getRandomNumbers(31, 45, 4), // Se generan solo cuatro números porque el centro será libre
      G: this.getRandomNumbers(46, 60, 5),
      O: this.getRandomNumbers(61, 75, 5),
    };
  }

  getRandomNumbers(min, max, count) {
    const numbers = [];
    while (numbers.length < count) {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber);
      }
    }
    return numbers;
  }

  startDrawingBalls(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    console.log(`Iniciando sorteo de balotas para el juego ${gameId}`);

    const drawInterval = setInterval(() => {
      const ballNumber = Math.floor(Math.random() * 75) + 1;
      this.io.to(gameId).emit('ballDrawn', { ballNumber });

      // Aquí puedes agregar lógica para detener el sorteo cuando haya un ganador
    }, 5000); // Sorteo cada 5 segundos

    game.drawInterval = drawInterval;
  }
}

module.exports = SocketManager;