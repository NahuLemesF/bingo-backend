import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Registrar un usuario
router.post("/register", registerUser);

// Iniciar sesión de un usuario
router.post("/login", loginUser);

export default router;