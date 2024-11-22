import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Funcion para registrar un usuario

const registerUser = async (req, res) => {
    const { name, email, password } = req.body; // Extraemos los datos de la peticion

    try {
        // Verificamos si el email ya existe en la base de datos
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'El correo ya está registrado' });
        }

        // Creamos un nuevo usuario
        const user = new User({
            name,
            email,
            password,
        });

        // Guardamos usuario en la base de datos
        const savedUser = await user.save();

        // Respuesta de la interface
        res.status(201).json({ msg: 'Usuario creado', user: savedUser });
    } catch (error) {
        res.status(500).json({ msg: 'Error al registrar el usuario', error });
    }
}

// Funcion para iniciar sesion

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificamos si el email existe en la base de datos
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Usuario no encontrado' });
        }

        // Verificamos la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        // Si la contraseña coincide, generamos un token de acceso
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respuesta de la interface
        res.json({ msg: 'Sesión iniciada correctamente', user });
    } catch (error) {
        res.status(500).json({ msg: 'Error al iniciar sesión', error });
    }
}

export { registerUser, loginUser };