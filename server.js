import express from "express"; 
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config(); 

const app = express(); // Llamando express

app.use(express.json()); // Middleware para parsear JSON

// Conectar a MongoDB
connectDB();

// Rutas de autenticacion y de juego
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000; //Si no existe el puerto en el deployement, se asigna el 3000
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
}) 