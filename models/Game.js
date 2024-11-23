import mongoose from "mongoose";

// Para definir el esquema del juego
const gameSchema = new mongoose.Schema({
  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Referencia al usuario (ID) en la database
      name: { type: String, required: true }, // Nombre del jugador
      card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" }, // Referencia al modelo de tarjeta
    },
  ],
  balls: [
    {
      number: { type: Number, required: true }, // Número de la balota
      calledAt: { type: Date, default: Date.now() }, // Fecha en que se llamó la balota
    },
  ],
  gameStatus: {
    type: String,
    enum: ["waiting", "in-progress", "completed"], // El estado del juego
    default: "waiting", // Estado por defecto
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al jugador que ganó
    ref: "User", // Relacionamos con el modelo de Usuario
    default: null, // No tiene ganador al principio
  },
}, { timestamps: true }); // Timestamps agrega automáticamente campos de fecha (createdAt, updatedAt)

// Exportamos el esquema del juego
const Game = mongoose.model("Game", gameSchema);
export default Game;
