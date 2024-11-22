import express from "express"; 
import connectDB from "./config/db.js";

const app = express(); // Llamando express
const port = 3000;

connectDB();

app.use("/", (req, res) => {
    res.send("Hola Mundo");
});

app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`);
}) // Asignando el servidor al puerto 3000