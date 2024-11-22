const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Sirve el contenido estático
app.use(express.static('public'));

// Lista de usuarios conectados
const users = {};

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Manejar la asignación de un nombre de usuario
    socket.on('register', (username) => {
        users[socket.id] = username;
        console.log(`${username} se ha registrado con el ID ${socket.id}`);
        io.emit('update users', users); // Actualiza la lista de usuarios conectados
    });

    // Manejar mensajes privados
    socket.on('private message', ({ recipientId, message }) => {
        if (users[recipientId]) {
            socket.to(recipientId).emit('private message', {
                sender: users[socket.id],
                message,
            });
        }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
        delete users[socket.id];
        io.emit('update users', users); // Actualiza la lista de usuarios conectados
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
