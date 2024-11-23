import mongoose from "mongoose";

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

const Game = mongoose.model("Game", gameSchema);
export default Game;
