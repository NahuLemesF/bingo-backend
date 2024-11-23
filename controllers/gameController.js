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

        res.status(201).json({ message: 'Juego creado', game: savedGame });
    } catch (error) {
        console.error("Error al iniciar un nuevo juego:", error.message);
        res.status(500).json({ message: 'Error al iniciar el juego' });
    }
};

// Función para asignar una tarjeta a cada jugador
const assignCardToPlayer = async (gameId) => {
    try {
        // Encuentra el juego por su ID
        const game = await Game.findById(gameId).populate("players"); // Para asegurarse de que hay jugadores
        if (!game) {
            throw new Error("Juego no encontrado");
        }

        // Verifica si ya hay jugadores en el juego
        if (game.players.length === 0) {
            throw new Error("No hay jugadores en el juego");
        }

        const assignedCards = [];

        for (const player of game.players) {
            // Genera una tarjeta para el jugador
            const newCard = new Card({ columns: generateBingoCard() });

            // Guarda la tarjeta en la base de datos
            await newCard.save();

            // Asigna la tarjeta al jugador
            player.card = newCard._id;
            assignedCards.push(newCard);
        }

        // Guarda los cambios en el juego
        await game.save();

        return assignedCards;
    } catch (error) {
        console.error("Error al asignar una tarjeta a un jugador:", error.message);
        throw new Error("No se pudo asignar la tarjeta a los jugadores, intente nuevamente.");
    }
};

export { startGame, assignCardToPlayer };
