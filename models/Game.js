import mongoose from "mongoose";
import { checkWinner } from "../controllers/gameController.js";

// Esquema del juego
const gameSchema = new mongoose.Schema(
  {
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Referencia al usuario
        name: { type: String, required: true }, // Nombre del jugador
        card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" }, // Referencia a la tarjeta asignada
      },
    ],
    balls: [
      {
        number: { type: Number, required: true }, // Número de la balota
        calledAt: { type: Date, default: Date.now() }, // Fecha de la llamada
      },
    ],
    gameStatus: {
      type: String,
      enum: ["waiting", "in-progress", "completed"], // Estado del juego
      default: "waiting",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId, // Referencia al jugador que ganó
      ref: "User",
      default: null,
    },
  },
  { timestamps: true } // Agrega automáticamente campos createdAt y updatedAt
);


// Metodo para sortear una bolilla / balota
gameSchema.methods.drawBall = async function () {
  try {
    // Generar un número aleatorio entre 1 y 75
    const ballNumber = Math.floor(Math.random() * 75) + 1;

    // Verificar que la balota no haya sido llamada antes
    const ballExists = this.balls.find(ball => ball.number === ballNumber);
    if (ballExists) {
      return this.drawBall();  // Si la balota ya fue llamada, llama nuevamente
    }

    // Añadir la balota al arreglo de balotas extraídas
    this.balls.push({ number: ballNumber });

    // Verificar si algún jugador ha ganado
    for (let player of this.players) {
      const playerCard = player.card; // Asumimos que cada jugador tiene una tarjeta
      if (checkWinner(playerCard, this.balls)) {
        // Si el jugador ha ganado, actualizamos el estado del juego
        this.gameStatus = "completed"; // El juego termina
        this.winner = player.userId; // Marcamos al jugador como ganador
        break;  // Ya hemos encontrado un ganador, podemos salir del bucle
      }
    }

    // Guardar los cambios en el juego
    await this.save();

    return ballNumber;  // Retornar el número de la balota extraída
  } catch (error) {
    console.error("Error al extraer la balota:", error.message);
    throw new Error("No se pudo extraer la balota.");
  }
};

const Game = mongoose.model("Game", gameSchema);
export default Game;
