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

        res.status(201).json({ message: 'Juego iniciado', game: savedGame });
    } catch (error) {
        console.error("Error al iniciar un nuevo juego:", error.message);
        res.status(500).json({ message: 'Error al iniciar el juego' });
    }
};

// Función para asignar una tarjeta a cada jugador
const assignCardToPlayer = async (req, res) => {
    const { gameId } = req.params;
    try {
        // Encuentra el juego por su ID
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        if (game.players.length === 0) {
            return res.status(400).json({ message: "No hay jugadores en el juego" });
        }

        const assignedCards = [];

        for (const player of game.players) {
            // Genera una tarjeta para el jugador
            const newCard = new Card({ columns: generateBingoCard() });
            await newCard.save();

            // Asigna la tarjeta al jugador
            player.bingoCard = newCard._id;
            assignedCards.push(newCard);
        }

        // Guarda los cambios en el juego
        await game.save();

        res.status(200).json({ message: 'Tarjetas asignadas', assignedCards });
    } catch (error) {
        console.error("Error al asignar tarjeta:", error.message);
        res.status(500).json({ message: 'Error al asignar tarjeta' });
    }
};

export { startGame, assignCardToPlayer };