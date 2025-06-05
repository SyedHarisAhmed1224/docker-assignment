const express = require('express');
const http = require('http');
const cors = require('cors');
const mysql = require('mysql2');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// MySQL connection
const db = mysql.createConnection({
  host: 'mysql-container',
  user: 'root',
  password: 'haris',
  database: 'chat',
});

// User login
app.post('/login', (req, res) => {
  const { username } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length > 0) {
        res.send({ success: true, user: results[0] });
      } else {
        // Create new user
        db.query(
          'INSERT INTO users (username) VALUES (?)',
          [username],
          (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({
              success: true,
              user: { id: result.insertId, username },
            });
          }
        );
      }
    }
  );
});

// Fetch chat history between two users
app.get('/messages', (req, res) => {
  const { sender_id, receiver_id } = req.query;
  db.query(
    `SELECT * FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?) 
     ORDER BY sent_at ASC`,
    [sender_id, receiver_id, receiver_id, sender_id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.send(results);
    }
  );
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('send_message', (data) => {
    const { sender_id, receiver_id, message_text } = data;
    // Save message to DB
    db.query(
      'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)',
      [sender_id, receiver_id, message_text],
      (err, result) => {
        if (err) {
          console.error('Error saving message:', err);
          return;
        }
        // Emit message to receiver
        io.emit(`receive_message_${receiver_id}`, {
          id: result.insertId,
          sender_id,
          receiver_id,
          message_text,
          sent_at: new Date(),
        });
      }
    );
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
