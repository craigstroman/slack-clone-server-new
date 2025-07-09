import path from 'path';
import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import { fileURLToPath } from 'url';
import { channel } from './models/channel.js';
import { directMessage } from './models/directMessage.js';
import { member } from './models/member.js';
import { message } from './models/message.js';
import { team } from './models/team.js';
import { user } from './models/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

console.log('process.env.DB_NAME: ', process.env.DB_NAME);

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: 'postgres',
  host: 'localhost',
  logging: console.log,
  logging: function (str) {
    console.log(str);
  },
});

export const models = {
  User: user,
  Channel: channel,
  Message: message,
  Team: team,
  Member: member,
  DirectMessage: directMessage,
};

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});
