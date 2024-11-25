let players = [];
let interval;
let countdownInterval;
let countdownTime = 30; // Tiempo de cuenta regresiva en segundos
let gameState = 'waiting'; // Estado del juego: 'waiting', 'countdown', 'in-progress', 'finished'

export const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Enviar el tiempo de cuenta regresiva actual y el estado del juego al nuevo cliente
    socket.emit("countdown", countdownTime);
    socket.emit("gameState", gameState);

    socket.on("joinLobby", (userData) => {
      // Verificar si el jugador ya está en la lista
      const existingPlayer = players.find(player => player.id === socket.id);
      if (!existingPlayer) {
        players.push({ id: socket.id, username: userData.username });
        console.log(`${userData.username} se ha unido al lobby. Total jugadores: ${players.length}`);
      }

      // Emitir la lista de jugadores a todos los clientes
      io.emit("updatePlayers", players);

      // Iniciar la cuenta regresiva si no ha comenzado y el estado del juego es 'waiting'
      if (players.length >= 1 && gameState === 'waiting') {
        startCountdown(io);
      }
    });

    socket.on("disconnect", () => {
      players = players.filter(player => player.id !== socket.id);
      console.log("Cliente desconectado:", socket.id);

      // Emitir la lista actualizada de jugadores a todos los clientes
      io.emit("updatePlayers", players);

      // Detener el juego si hay menos de 1 jugador
      if (players.length < 1) {
        clearInterval(interval);
        clearInterval(countdownInterval);
        countdownInterval = null;
        countdownTime = 30; // Reiniciar el tiempo de cuenta regresiva
        gameState = 'waiting'; // Reiniciar el estado del juego
        io.emit("gameState", gameState);
      }
    });
  });
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
      if (players.length >= 2) {
        startGame(io);
      } else {
        io.emit("timeout");
        players = [];
        countdownTime = 30; // Reiniciar el tiempo de cuenta regresiva
        gameState = 'waiting'; // Reiniciar el estado del juego
        io.emit("gameState", gameState);
      }
    }
  }, 1000); // Actualizar cada segundo
};

const startGame = (io) => {
  gameState = 'in-progress';
  io.emit("gameState", gameState);

  const calledNumbers = new Set();
  interval = setInterval(() => {
    if (calledNumbers.size >= 75) {
      clearInterval(interval);
      gameState = 'finished';
      io.emit("gameState", gameState);
      return;
    }

    let number;
    do {
      number = Math.floor(Math.random() * 75) + 1;
    } while (calledNumbers.has(number));

    calledNumbers.add(number);
    io.emit("number", number);
  }, 5000); // Emitir un número cada 5 segundos

  io.emit("startGame", players);
};