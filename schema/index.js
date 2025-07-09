import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { userSchema } from './user.js';
import { teamSchema } from './team.js';
import { messageSchema } from './message.js';
import { errorSchema } from './error.js';
import { channelSchema } from './channel.js';

export const schemaArray = mergeTypeDefs([userSchema, messageSchema, errorSchema, channelSchema, teamSchema]);
