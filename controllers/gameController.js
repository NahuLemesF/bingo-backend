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
const assignCardToPlayer = async (req, res) => {
  const { gameId } = req.params;
  try {
      // Buscar el juego - Siempre verificamos primero si existe
      const game = await Game.findById(gameId);
      if (!game) {
          return res.status(404).json({ message: "Juego no encontrado" });
      }

      // Verificar el estado del juego - Importante para el flujo del juego
      if (game.gameStatus !== 'waiting') {
          return res.status(400).json({ 
              message: "El juego no está en estado de espera" 
          });
      }

      // Verificar jugadores - No podemos asignar tarjetas sin jugadores
      if (game.players.length === 0) {
          return res.status(400).json({ 
              message: "No hay jugadores en el juego" 
          });
      }

      const assignedCards = [];

      // Generar y asignar tarjetas a cada jugador
      for (const player of game.players) {
          // Genera una nueva tarjeta usando la función generateBingoCard
          const bingoCard = generateBingoCard();
          const newCard = new Card({ columns: bingoCard });
          await newCard.save();

          // Asigna la tarjeta al jugador
          player.bingoCard = newCard._id;
          assignedCards.push({
              playerId: player.userId,
              card: bingoCard
          });
      }

      // Guarda los cambios en el juego
      await game.save();

      // Retorna las tarjetas asignadas
      res.status(200).json({ 
          message: 'Tarjetas asignadas correctamente', 
          assignedCards 
      });

  } catch (error) {
      console.error("Error al asignar tarjetas:", error.message);
      res.status(500).json({ 
          message: 'Error al asignar tarjetas',
          error: error.message 
      });
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
