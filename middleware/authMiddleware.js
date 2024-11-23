import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware para verificar el token de autenticación
const protect = async (req, res, next) => {
    let token;

    // Verificar si el token existe en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraer el token del header
            token = req.headers.authorization.split(' ')[1];

            // Verificar si el token es válido
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Buscar el usuario en la base de datos y excluir el campo contraseña
            const user = await User.findById(decoded.id).select('-password');

            // Si el usuario no existe, devolver error
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Asignar el usuario a la solicitud
            req.user = user;

            // Pasar al siguiente middleware o controlador
            next();
        } catch (error) {
            console.error('Error al verificar el token:', error.message);
            return res.status(401).json({ message: 'No autorizado, token inválido' });
        }
    }

    // Si no se envió un token, devolver una respuesta
    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se envió un token' });
    }
};

export { protect };
