const getRandomNumbers = (min, max, count) => {
    const numbers = []; // Para evitar duplicados 
    while (numbers.length < count) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    return numbers;
}

export const generateBingoCard = () => {
    const bingoCard = {
        B: getRandomNumbers(1, 15, 5),
        I: getRandomNumbers(16, 30, 5),
        N: getRandomNumbers(31, 45, 4), // Se generan solo cuatro numeros porque el centro sera libre
        G: getRandomNumbers(46, 60, 5),
        O: getRandomNumbers(61, 75, 5),
    };

    // Para dejar libre el centro de la columna N
    bingoCard.N.splice(2, 0, 'FREE');
    return bingoCard;
};