import { createPubSub } from '@graphql-yoga/subscription';

export interface iCounterPayload {
  counterUpdated: number;
}

export const COUNTER_UPDATED = 'COUNTER_UPDATED';

export const pubSub = createPubSub<{
  COUNTER_UPDATED: [payload: iCounterPayload];
}>();
