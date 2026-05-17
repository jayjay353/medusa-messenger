const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ===== CORS =====
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://deinname.github.io'  // Ersetze das mit deiner GitHub Pages URL
  ],
  credentials: true
}));

// ===== Middleware =====
app.use(express.json()); // Für req.body in POST Routes
app.use(express.static('public'));

// ===== Socket.io mit CORS =====
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://jayjay353.github.io'
    ],
    methods: ['GET', 'POST']
  }
});

// ===== Socket Events =====
io.on('connection', (socket) => {
  console.log('Client verbunden:', socket.id);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client getrennt:', socket.id);
  });
});

// ===== Test Route =====
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API läuft' });
});

// ===== Server starten =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Medusa Messenger läuft auf http://localhost:${PORT}`));
