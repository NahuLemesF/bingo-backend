import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import { setupSocketEvents } from "./socket/socketManager.js";

dotenv.config();

// Inicialización
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Puerto típico de Vite
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Conexión BD
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