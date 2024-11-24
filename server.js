import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketEvents } from "./socket/socketManager.js";

dotenv.config();

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Puerto típico de Vite
  },
});

// Middleware
app.use(cors());

// Conectar a la base de datos
connectDB();

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

// Configurar WebSocket
setupSocketEvents(io);

// Servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});

export { io };