import express from "express"; 
import dotenv from "dotenv";
import connectDB from "./config/db.js";

const app = express(); // Llamando express
dotenv.config();

connectDB();

app.get("/", (req, res) => {
    res.send("¡Bienvenid@ al Bingo Virtual de el Gran Buda!");
});

const PORT = process.env.PORT || 3000; //Si no existe el puerto en el deployement, se asigna el 3000

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
}) 