import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Esquema del usuario
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // Nombre del usuario
    email: { type: String, required: true, unique: true, trim: true }, // Correo electrónico único
    password: { type: String, required: true }, // Contraseña del usuario
})

// Para encriptar las contraseñas antes de guardarlas
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// Para verificar contraseña del usuario en el login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Exportando el modelo de Usuario

const User = mongoose.model('User', userSchema);

export default User;