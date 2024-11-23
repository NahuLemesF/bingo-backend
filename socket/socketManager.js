export const setupSocketEvents = (io) => {
    io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);
  
      socket.on("joinLobby", (userData) => {
        // Lógica del lobby aquí
      });
  
      socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
      });
    });
  };