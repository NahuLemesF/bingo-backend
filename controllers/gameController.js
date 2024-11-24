import mongoose from 'mongoose';
import Card from "../models/Card.js";
import Game from "../models/Game.js";
import { generateBingoCard } from "../utils/generateCard.js";

// Crear juego
const createGame = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const players = req.body.players.map(player => ({
      userId: new mongoose.Types.ObjectId(player.userId),
      name: player.name
    }));

    const newGame = new Game({
      players,
      balls: [],
      gameStatus: 'waiting',
    });

    console.log("New Game Object:", newGame);

    const savedGame = await newGame.save();
    console.log("Saved Game:", savedGame);

    res.status(201).json({ message: 'Juego creado', game: savedGame });
  } catch (error) {
    console.error("Error al crear un nuevo juego:", error.message);
    res.status(500).json({ message: 'Error al crear el juego' });
  }
};

// Iniciar juego
const startGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    if (game.gameStatus !== 'waiting') {
      return res.status(400).json({ message: "El juego no está en estado de espera" });
    }

    game.gameStatus = 'in-progress';
    await game.save();

    console.log("Estado del Juego Después de Actualizar:", game.gameStatus);

    res.status(200).json({ message: 'Juego iniciado', game });
  } catch (error) {
    console.error("Error al iniciar el juego:", error.message);
    res.status(500).json({ message: 'Error al iniciar el juego' });
  }
};

// Función para asignar una tarjeta a cada jugador
const assignCardToPlayer = async (req, res, next) => {
  const { gameId } = req.params;
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Juego no encontrado' });
    }

    if (game.gameStatus !== 'waiting') {
      return res.status(400).json({ message: 'El juego no está en estado de espera' });
    }

    if (game.players.length === 0) {
      return res.status(400).json({ message: 'No hay jugadores en el juego' });
    }

    const assignedCards = [];

    for (const player of game.players) {
      if (!player.userId) {
        return res.status(400).json({ message: `El jugador ${player.name} no tiene un userId` });
      }

      const bingoCard = generateBingoCard();
      const newCard = new Card({ columns: bingoCard });
      await newCard.save();

      console.log(`Nueva Tarjeta Creada para ${player.userId}:`, newCard);

      player.card = newCard._id;
      assignedCards.push({ playerId: player.userId, card: newCard });
    }

    await game.save();
    console.log('Juego Guardado con Tarjetas Asignadas:', game);

    res.status(200).json({ message: 'Tarjetas asignadas a los jugadores', assignedCards });
  } catch (error) {
    console.error('Error al asignar tarjetas:', error.message);
    res.status(500).json({ message: 'Error al asignar tarjetas' });
  }
};

// Mostrar balota
const drawBall = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId).populate('players.card');
    if (!game) {
      return res.status(404).json({ message: 'Juego no encontrado' });
    }

    if (game.gameStatus === 'completed') {
      return res.status(400).json({ message: 'El juego ya ha terminado' });
    }

    const { ballNumber, winnerType, winnerPlayer } = await game.generateBall();

    const response = {
      message: 'Balota extraída',
      ballNumber,
      balls: game.balls,
    };

    if (winnerType) {
      response.message = `El juego ha terminado. El ganador es ${winnerPlayer.name} con una victoria de tipo ${winnerType}.`;
      response.winner = {
        playerId: winnerPlayer.userId,
        playerName: winnerPlayer.name,
        winnerType,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error al extraer la balota:', error.message);
    res.status(500).json({ message: 'Error al extraer la balota' });
  }
};



// Comprobar ganador
const checkWinner = (card, balls) => {
  const columns = card.columns;

  if (!columns || typeof columns !== 'object') {
    throw new Error('La estructura de la tarjeta de bingo es incorrecta');
  }

  const columnKeys = Object.keys(columns);

  // Verificar filas
  for (let row = 0; row < 5; row++) {
    if (columnKeys.every(key => {
      if (key === 'N' && row === 2) return true; // Ignorar el espacio libre en la columna N
      return balls.some(ball => ball.number === columns[key][row]);
    })) {
      return 'row';
    }
  }

  // Verificar columnas
  for (let key of columnKeys) {
    if (columns[key].every(number => balls.some(ball => ball.number === number))) {
      return 'column';
    }
  }

  // Verificar diagonales
  const leftDiagonal = columnKeys.every((key, index) => {
    if (key === 'N' && index === 2) return true; // Ignorar el espacio libre en la columna N
    return balls.some(ball => ball.number === columns[key][index]);
  });

  const rightDiagonal = columnKeys.every((key, index) => {
    if (key === 'N' && index === 2) return true; // Ignorar el espacio libre en la columna N
    return balls.some(ball => ball.number === columns[key][4 - index]);
  });

  if (leftDiagonal || rightDiagonal) {
    return 'diagonal';
  }

  // Verificar cartón completo
  const fullCard = columnKeys.every(key => columns[key].every(number => balls.some(ball => ball.number === number)));
  if (fullCard) {
    return 'fullCard';
  }

  // Verificar esquinas
  const corners = [
    columns['B'][0],
    columns['B'][4],
    columns['O'][0],
    columns['O'][4]
  ];
  if (corners.every(corner => balls.some(ball => ball.number === corner))) {
    return 'corners';
  }

  return null;
};



export { createGame, startGame, assignCardToPlayer, checkWinner, drawBall };
