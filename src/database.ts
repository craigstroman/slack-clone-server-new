import 'reflect-metadata';

import { DataSource } from 'typeorm';

import path from 'path';
import dotenv from 'dotenv';

import { ChatMessage } from './entities/CHATMESSAGE';
import { ChatRoom } from './entities/CHATROOM';
import { User } from './entities/USER';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ChatMessage, ChatRoom, User],
  /*
   * Use migrations in production.
   * synchronize is convenient only during development.
   */
  synchronize: process.env.NODE_ENV !== 'production',

  logging: process.env.NODE_ENV === 'development',
});
