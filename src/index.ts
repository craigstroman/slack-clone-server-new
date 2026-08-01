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

import { createPubSub } from '@graphql-yoga/subscription';

import { CounterResolver } from './resolvers/CounterResolver';
import { HelloResolver } from './resolvers/Hello';

const pubSub = createPubSub();

async function main(): Promise<void> {
  const port = 9001;

  const schema = await buildSchema({
    resolvers: [CounterResolver, HelloResolver],
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

      onSubscribe: (_context, messageId) => {
        console.log('Subscription requested:', messageId);
      },

      onDisconnect: () => {
        console.log('WebSocket client disconnected');
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

  app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(apolloServer));

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
