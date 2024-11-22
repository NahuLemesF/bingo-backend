import mongoose from 'mongoose';

const dbURI = 'mongodb+srv://nahulem:b3nd174l0cur4@cluster0.dr9v2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const connectDB = async () => {
    try {
        const db = await mongoose.connect(dbURI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
        });

        const url = `${db.connection.host}:${db.connection.port}`;
        console.log(`MongoDB conectado en: ${url}`);

    } catch (error) {
        console.error(`Error al conectar la base de datos: , ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;