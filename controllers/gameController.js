import Card from "../models/Card.js";
import Game from "../models/Game.js";
import { generateBingoCard } from "../utils/generateCard.js";

// Función para iniciar un nuevo juego
const startGame = async (req, res) => {
    try {
        const newGame = new Game({
            players: req.body.players || [],
            balls: [],
            gameStatus: 'waiting',
        });

        const savedGame = await newGame.save();

        // Asignar tarjetas a los jugadores
        const assignedCards = await assignCardToPlayer(savedGame._id);

        res.status(201).json({ message: 'Juego iniciado y tarjetas asignadas', assignedCards });
    } catch (error) {
        console.error("Error al iniciar un nuevo juego:", error.message);
        res.status(500).json({ message: 'Error al iniciar el juego' });
    }
};

// Función para asignar una tarjeta a cada jugador
const assignCardToPlayer = async (gameId) => {
    try {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error("Juego no encontrado");
        }

        const assignedCards = [];

        for (const player of game.players) {
            const newCard = new Card({ columns: generateBingoCard() });
            await newCard.save();

            player.bingoCard = newCard._id;
            assignedCards.push(newCard);
        }

        await game.save();

        return assignedCards;
    } catch (error) {
        console.error("Error al asignar tarjeta:", error.message);
        throw error;
    }
};

export { startGame, assignCardToPlayer };
