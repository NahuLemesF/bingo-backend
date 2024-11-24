import express from 'express';
import { createGame, startGame, assignCardToPlayer, drawBall } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Crear un nuevo juego
router.post('/create', protect, createGame);

// Asignar cartones de bingo
router.post('/assign-cards/:gameId', protect, assignCardToPlayer);

// Iniciar el juego
router.post('/start-game/:gameId', protect, startGame);

// Sacar una balota
router.post('/draw-ball/:gameId', protect, drawBall);

export default router;
