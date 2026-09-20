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
      name: playerData.name || 'Unknown',
      level: playerData.level || 1,
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

  // HANYA TERIMA EVENT PERGERAKAN JIKA IA BERBEZA DARI KLIEN (EVENT NAMA PERLU SAMA)
  // Nota: Di klien anda emit menggunakan "player_moved" atau "player_move"? 
  // Jika klien emit "player_moved", maka di sini juga mesti "player_moved".
  // Saya betulkan kepada "player_moved" selari dengan kod klien anda sebelum ini.
  socket.on('player_moved', (moveData) => {
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
  
}); // <--- INI PENUTUP SEBENAR UNTUK io.on('connection')

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server MMORPG Socket.io sedang berjalan di port ${PORT} 🚀`);
});
