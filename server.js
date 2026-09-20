const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const players = {};

io.on('connection', (socket) => {
  console.log('Pemain baru bersambung:', socket.id);

  socket.on('join_game', (playerData) => {
    players[socket.id] = {
      id: socket.id, 
      charClass: playerData.charClass || 'Warrior',
      x: playerData.x || 0,
      y: playerData.y || 10,
      z: playerData.z || 0,
      rotation: playerData.rotation || 0,
      anim: 'idle'
    };
    
    socket.emit('current_players', players);
    socket.broadcast.emit('player_joined', players[socket.id]);
  });

  socket.on('player_move', (moveData) => {
    if (players[socket.id]) {
      players[socket.id].x = moveData.x;
      players[socket.id].y = moveData.y;
      players[socket.id].z = moveData.z;
      players[socket.id].rotation = moveData.rotation;
      players[socket.id].anim = moveData.anim;

      socket.broadcast.emit('player_moved', players[socket.id]);
    }
  });

  socket.on('disconnect', () => {
    console.log('Pemain terputus talian:', socket.id);
    delete players[socket.id];
    io.emit('player_left', socket.id); 
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server MMORPG Socket.io sedang berjalan di port ${PORT} 🚀`);
});
