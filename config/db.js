import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI, { 
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