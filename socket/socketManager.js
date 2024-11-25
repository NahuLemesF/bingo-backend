// socket/socketManager.js

let players = [];
let countdownInterval;
let countdownTime = 30;
let gameState = 'waiting';

// Definir startCountdown antes de usarla
const startCountdown = (io) => {
  gameState = 'countdown';
  io.emit("gameState", gameState);

  countdownInterval = setInterval(() => {
    countdownTime--;
    io.emit("countdown", countdownTime);

    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      
      if (players.length >= 2) {
        startGame(io);
      } else {
        io.emit("timeout");
        resetGame(io);
      }
    }
  }, 1000);
};

const resetGame = (io) => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  players = [];
  countdownTime = 30;
  gameState = 'waiting';
  countdownInterval = null;

  io.emit("updatePlayers", players);
  io.emit("countdown", countdownTime);
  io.emit("gameState", gameState);
};

const startGame = (io) => {
  gameState = 'in-progress';
  io.emit("gameState", gameState);
  io.emit("startGame", players);
};

const handlePlayerLeave = (socketId, io) => {
  players = players.filter(player => player.id !== socketId);
  io.emit("updatePlayers", players);

  if (players.length < 2) {
    resetGame(io);
    io.emit("timeout");
  }
};

export const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.emit("countdown", countdownTime);
    socket.emit("gameState", gameState);
    socket.emit("updatePlayers", players);

    socket.on("joinLobby", (userData) => {
      players = players.filter(p => p.id !== socket.id);
      players.push({ id: socket.id, username: userData.username });
      console.log(`${userData.username} se unió. Total: ${players.length}`);

      io.emit("updatePlayers", players);
      
      if (players.length >= 1 && gameState === 'waiting' && !countdownInterval) {
        startCountdown(io);
      }
    });

    socket.on("resetGame", () => {
      resetGame(io);
      io.emit("gameReset");
    });

    socket.on("leaveLobby", () => {
      handlePlayerLeave(socket.id, io);
    });

    socket.on("disconnect", () => {
      handlePlayerLeave(socket.id, io);
    });
  });
};