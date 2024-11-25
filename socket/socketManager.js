// socket/socketManager.js

// Variables globales al inicio
const initialState = {
  countdownTime: 30,
  gameState: 'waiting'
};

let players = [];
let countdownInterval = null;
let countdownTime = initialState.countdownTime;
let gameState = initialState.gameState;

const resetGame = (io) => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  players = [];
  countdownTime = initialState.countdownTime;
  gameState = initialState.gameState;
  countdownInterval = null;

  io.emit("updatePlayers", players);
  io.emit("countdown", countdownTime);
  io.emit("gameState", gameState);
};

const handlePlayerLeave = (socketId, io) => {
  players = players.filter(player => player.id !== socketId);
  io.emit("updatePlayers", players);

  if (players.length < 1) {
    resetGame(io);
  }
};

const startGame = (io) => {
  gameState = 'in-progress';
  io.emit("gameState", gameState);
  io.emit("startGame", players);
};

const startCountdown = (io) => {
  gameState = 'countdown';
  io.emit("gameState", gameState);

  countdownInterval = setInterval(() => {
    countdownTime--;
    io.emit("countdown", countdownTime);

    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      
      if (players.length < 2) {
        io.emit("timeout");
        resetGame(io);
      } else {
        startGame(io);
      }
    }
  }, 1000);
};

export const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Emitir estado inicial
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

    socket.on("disconnect", () => {
      handlePlayerLeave(socket.id, io);
    });
  });
};