import mongoose from 'mongoose';
import Card from './Card.js';
import { checkWinner } from '../controllers/gameController.js';

const gameSchema = new mongoose.Schema({
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
      },
    ],
    balls: [
      {
        number: { type: Number, required: true },
        calledAt: { type: Date, default: Date.now },
      },
    ],
    gameStatus: {
      type: String,
      enum: ["waiting", "in-progress", "completed"],
      default: "waiting",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

gameSchema.methods.generateBall = async function () {
  try {
    let ballNumber;

    do {
      ballNumber = Math.floor(Math.random() * 75) + 1;
    } while (this.balls.some(ball => ball.number === ballNumber));

    this.balls.push({ number: ballNumber });

    let winnerType = null;
    let winnerPlayer = null;

    for (const player of this.players) {
      const playerCard = await Card.findById(player.card);
      if (!playerCard) {
        throw new Error(`Tarjeta no encontrada para el jugador ${player.userId}`);
      }

      winnerType = checkWinner(playerCard, this.balls);
      if (winnerType) {
        this.gameStatus = 'completed';
        this.winner = player.userId;
        winnerPlayer = player;
        break;
      }
    }

    await this.save();

    return { ballNumber, winnerType, winnerPlayer };
  } catch (error) {
    console.error('Error al extraer la balota:', error.message);
    throw new Error('No se pudo extraer la balota.');
  }
};

const Game = mongoose.model("Game", gameSchema);
export default Game;