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


// Metodo para sortear una bolilla / balota
gameSchema.methods.drawBall = async function () {
  try {
      // Generar un número aleatorio entre 1 y 75
      const ballNumber = Math.floor(Math.random() * 75) + 1;

      // Verificar que la balota no haya sido llamada antes
      const existingBall = this.balls.find(ball => ball.number === ballNumber);
      if (existingBall) {
          throw new Error("La balota ya ha sido llamada.");
      }

      // Añadir la balota al arreglo de balotas
      this.balls.push({
          number: ballNumber,
          calledAt: new Date(),
      });

      // Guardar los cambios en el juego
      await this.save();
      return ballNumber; // Retornar el número de la balota extraída

  } catch (error) {
      console.error("Error al extraer una balota:", error.message);
      throw new Error("No se pudo extraer una balota.");
  }
};

const Game = mongoose.model("Game", gameSchema);
export default Game;
