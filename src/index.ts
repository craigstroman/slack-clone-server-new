import 'reflect-metadata';
import { createServer } from 'node:http';

import express from 'express';
import cors from 'cors';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';

import { buildSchema } from 'type-graphql';

import session from 'express-session';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';

import { AppDataSource } from './database';

import { HelloResolver } from './resolvers/Hello';
import { ChatMessageResolver } from './resolvers/ChatMessageResolver';
import { ChatRoomResolver } from './resolvers/ChatRoomResolver';
import { UserResolver } from './resolvers/UserResolver';
import { pubSub } from './pubsub';

const port = 9001;

async function main(): Promise<void> {
  await AppDataSource.initialize();

  const redis = new Redis();
  const RedisStore = connectRedis(session);
  const secret: string = process.env.SECRET || '';

  const schema = await buildSchema({
    resolvers: [HelloResolver, ChatMessageResolver, ChatRoomResolver, UserResolver],
    pubSub,
    validate: false,
  });

  const app = express();

  // Apollo HTTP requests and graphql-ws connections must share
  // this same HTTP server.
  const httpServer = createServer(app);

  // Subscription WebSocket server.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      onConnect: () => {
        console.log('WebSocket client connected');
      },

      onSubscribe: (_context, payload) => {
        console.log('Subscription started:');
        console.log('payload: ', payload);
      },

      onDisconnect: () => {
        console.log('WebSocket client disconnected');
      },

      onError(_context, id, _payload, errors) {
        console.error('Subscription execution error:', {
          id,
          errors: errors.map((error) => ({
            message: error.message,
            path: error.path,
            locations: error.locations,
            stack: error.originalError?.stack,
          })),
        });
      },
    },
    wsServer,
  );

  const apolloServer = new ApolloServer({
    schema,

    plugins: [
      ApolloServerPluginDrainHttpServer({
        httpServer,
      }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },

      ApolloServerPluginLandingPageLocalDefault({
        embed: {
          endpointIsEditable: true,
        },
      }),
    ],
  });

  await apolloServer.start();

  app.use(
    session({
      name: 'uid',
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
      },
      saveUninitialized: true,
      secret: secret,
      resave: false,
    }),
  );

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({
        req,
        res,
      }),
    }),
  );

  app.set('trust proxy', 1);

  // Use httpServer.listen(), not app.listen().
  httpServer.listen(port, () => {
    console.log(`HTTP endpoint: http://localhost:${port}/graphql`);
    console.log(`Subscription endpoint: ws://localhost:${port}/subscriptions`);
  });
}

main().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
