import { mergeResolvers } from '@graphql-tools/merge';
import { userResolver } from './user.js';
import { teamResolver } from './team.js';
import { messageResolver } from './message.js';
import { channelResolver } from './channel.js';

export const resolvers = mergeResolvers([userResolver, teamResolver, messageResolver, channelResolver]);
