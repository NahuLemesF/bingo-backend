import express from 'express';
import { startGame, assignCardToPlayer } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router(); // Enrutador de express

// Ruta para iniciar el juego
router.post('/start-game', startGame);

// Ruta para asignar tarjetas
router.post('/assign-cards/:gameId', protect, async (req, res) => {
    try {
        // Obtenemos el ID del Juego de los parametros de la URL
        const { gameId } = req.params;
        
        // Llamamos a la función que inicia el juego y devuelve las tarjetas asignadas
        const assignedCards = await assignCardToPlayer(gameId)
        
        // Retornamos el resultado al cliente con un código de estado 200 (OK) y el mensaje de éxito
        res.status(200).json({ message: 'Juego iniciado y tarjetas asignadas', assignedCards });
    } catch (error) {
        // En caso de error, retornamos un código de estado 500 (Internal Server Error) y el mensaje de error
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar el juego' });
    }
})

// Exportamos el enrutador para que pueda ser utilizado en otros archivos
export default router;