import { createPubSub } from '@graphql-yoga/subscription';

import type { ChatMessage } from './entities/CHATMESSAGE';

export interface iCounterPayload {
  counterUpdated: number;
}

export const MESSAGE_SENT = 'MESSAGE_SENT' as const;

export const pubSub = createPubSub<{
  MESSAGE_SENT: [payload: ChatMessage];
}>();
