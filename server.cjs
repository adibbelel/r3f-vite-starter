const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let image = "/textures/UV_checker_Map_byValle.jpg";

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify({ type: 'init', data: document }));
  ws.on('message', (message) => {
    try {
      const parsedImage = JSON.parse(image);
      if (parsedImage.type === 'update') {
        document = parsedImage.data;

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', data: document }));
          }
        });
      }
    } catch (error) {
      console.error('Error parsing image:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});