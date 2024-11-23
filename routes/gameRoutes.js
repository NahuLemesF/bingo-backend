import express from 'express';
import { startGame, assignCardToPlayer } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';
import Game from '../models/Game.js';  // Asegúrate de importar el modelo de Game

const router = express.Router(); // Enrutador de express

// Ruta para iniciar el juego
router.post('/start-game/:gameId', protect, async (req, res) => {
    try {
        // Obtenemos el ID del juego desde los parámetros de la URL
        const { gameId } = req.params;

        // Buscamos el juego por su ID
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        // Si el juego no está en estado "waiting", no lo podemos iniciar
        if (game.gameStatus !== "waiting") {
            return res.status(400).json({ message: "El juego no está en estado 'waiting'" });
        }

        // Cambiar el estado del juego a "in-progress"
        game.gameStatus = "in-progress";

        // Guardamos el estado actualizado del juego
        await game.save();

        res.status(200).json({ message: "Juego iniciado", game });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al iniciar el juego" });
    }
});

// Ruta para asignar tarjetas
router.post('/assign-cards/:gameId', protect, async (req, res) => {
    try {
        // Obtenemos el ID del Juego de los parametros de la URL
        const { gameId } = req.params;
        
        // Llamamos a la función que asigna las tarjetas
        const assignedCards = await assignCardToPlayer(gameId);
        
        // Retornamos el resultado al cliente con un código de estado 200 (OK) y el mensaje de éxito
        res.status(200).json({ message: 'Juego iniciado y tarjetas asignadas', assignedCards });
    } catch (error) {
        // En caso de error, retornamos un código de estado 500 (Internal Server Error) y el mensaje de error
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar el juego' });
    }
});

// Ruta para dibujar una balota
router.post('/draw-ball/:gameId', protect, async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await Game.findById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Juego no encontrado" });
      }
  
      const ballNumber = await game.drawBall();  // Extraer balota
  
      // Verificamos el estado del juego
      if (game.gameStatus === "completed") {
        return res.status(200).json({ message: "El juego ha terminado", winner: game.winner });
      }
  
      // Si el juego no ha terminado, retornamos el número de la balota extraída
      res.status(200).json({ message: "Balota extraída", ballNumber });
    } catch (error) {
      console.error("Error al dibujar la balota:", error.message);
      res.status(500).json({ message: "Error al extraer la balota" });
    }
  });
  


// Exportamos el enrutador para que pueda ser utilizado en otros archivos
export default router;
