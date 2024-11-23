import Card from "../models/Card.js";
import Game from "../models/Game.js";
import { generateBingoCard } from "../utils/generateCard.js";

// Función para iniciar un nuevo juego
const startGame = async (req, res) => {
  try {
    // Crea un nuevo juego con el estado 'waiting'
    const newGame = new Game({
      players: req.body.players || [], // Para asegurar que los jugadores se envien en el cuerpo de la solicitud
      balls: [],
      gameStatus: 'waiting',
    });

    // Guarda el juego en la base de datos
    const savedGame = await newGame.save();

    res.status(201).json({ message: 'Juego creado', game: savedGame });
  } catch (error) {
    console.error("Error al iniciar un nuevo juego:", error.message);
    res.status(500).json({ message: 'Error al iniciar el juego' });
  }
};

// Función para asignar una tarjeta a cada jugador
// Función para asignar una tarjeta a cada jugador
const assignCardToPlayer = async (gameId) => {
  try {
    // Busca el juego por ID
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Juego no encontrado");
    }

    // Verifica que hay jugadores en el juego
    if (game.players.length === 0) {
      throw new Error("No hay jugadores en el juego");
    }

    const assignedCards = [];

    // Asigna una tarjeta a cada jugador
    for (let i = 0; i < game.players.length; i++) {
      const player = game.players[i];

      // Genera una nueva tarjeta
      const newCard = new Card({ columns: generateBingoCard() });
      await newCard.save();

      // Asigna el ID de la tarjeta al jugador
      game.players[i].card = newCard._id;

      // Añade la tarjeta asignada al arreglo de tarjetas
      assignedCards.push(newCard);
    }

    // Guarda los cambios en el juego
    await game.save();

    return assignedCards;
  } catch (error) {
    console.error("Error al asignar tarjetas:", error.message);
    throw new Error("No se pudo asignar tarjetas a los jugadores.");
  }
};

const checkWinner = (card, balls) => {
  // Iterar sobre las columnas de la tarjeta (B, I, N, G, O)
  for (let column in card.columns) {
    const columnValues = card.columns[column];
    let complete = true;

    // Verificar si todos los números en la columna están en las balotas
    for (let i = 0; i < columnValues.length; i++) {
      if (!balls.some(ball => ball.number === columnValues[i])) {
        complete = false;
        break;
      }
    }

    // Si todos los números de una columna están en las balotas, el jugador ha ganado
    if (complete) {
      return true; // El jugador ha ganado
    }
  }

  return false; // El jugador no ha ganado
};

export { startGame, assignCardToPlayer, checkWinner};
