import http from 'node:http';
import { WebSocketServer } from 'ws';

const httpServer = http.createServer((_request, response) => {
  response.writeHead(200);
  response.end('HTTP server works');
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

httpServer.on('upgrade', (request) => {
  console.log('Upgrade received:', request.url);
});

wsServer.on('connection', (socket) => {
  console.log('WebSocket connected');

  socket.send('WebSocket server works');
});

httpServer.listen(9001, '0.0.0.0', () => {
  console.log('Listening on port 9001');
});
