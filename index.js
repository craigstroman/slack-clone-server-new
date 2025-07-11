import path from 'path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { sequelize } from './database.js';
import { resolvers } from './resolvers/index.js';
import { schemaArray } from './schema/index.js';
import { router } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs: schemaArray,
  resolvers,
});

await server.start();

const port = process.env.PORT;
app.set('port', port);

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

app.use('/static', express.static('public'));

app.locals.title = 'Slack Clone';
app.locals.content = 'A Slack clone using Express, GarphQL, and React.';
// app.locals.reactApp = reactApp;
app.locals.env = process.env;
app.use(router);

app.use(
  '/',
  cors(),
  // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
  express.json({ limit: '50mb' }),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

try {
  await sequelize.authenticate();

  console.log(`Databases loaded.`);

  try {
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/`);
  } catch (err) {
    console.log('There was an error starting the server.');
    console.log('error: ', err);
  }
} catch (err) {
  console.log('There was an error connecting to the database.');
  console.log('error: ', err);
}
