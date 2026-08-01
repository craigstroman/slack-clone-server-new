import { Resolver, Subscription, Root, Mutation, Int } from 'type-graphql';

import { COUNTER_UPDATED, iCounterPayload, pubSub } from '../pubsub';

let counter = 0;

// TODO: Figure out why subscription is not getting updated counter value when I run the mutation incrementCounter

@Resolver()
export class CounterResolver {
  @Mutation(() => Int)
  async incrementCounter(): Promise<number> {
    counter += 1;

    console.log('Counter incremented:', counter);

    const payload: iCounterPayload = {
      counterUpdated: counter,
    };

    await pubSub.publish(COUNTER_UPDATED, payload);

    return counter;
  }

  @Mutation(() => Int)
  async resetCounter(): Promise<number> {
    console.log('Resetting counter');
    counter = 0;

    await pubSub.publish(COUNTER_UPDATED, {
      counterUpdated: counter,
    });

    return counter;
  }

  @Subscription(() => Int, {
    subscribe: () => {
      console.log('Counter subscriber registered');

      return pubSub.subscribe(COUNTER_UPDATED);
    },
  })
  counterUpdated(@Root() payload: CounterPayload): number {
    console.log('Subscription payload:', payload);

    return payload.counterUpdated;
  }
}
