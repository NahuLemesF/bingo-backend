import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    columns: {
        B: { type: [Number], required: true }, // 5 numeros. rango del 1 al 15
        I: { type: [Number], required: true }, // 5 numeros. rango del 16 al 30
        N: { type: [mongoose.Schema.Types.Mixed], required: true }, // 4 numeros. rango del 31 al 45
        G: { type: [Number], required: true }, // 5 numeros. rango del 46 al 60
        O: { type: [Number], required: true }, // 5 numeros. rango del 61 al 75
    },
});

const Card = mongoose.model('Card', cardSchema);

export default Card;