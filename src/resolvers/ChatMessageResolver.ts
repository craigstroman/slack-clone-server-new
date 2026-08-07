import { Arg, ID, Mutation, Query, Resolver, Root, Subscription } from 'type-graphql';

import { AppDataSource } from '../database.js';
import { ChatMessage } from '../entities/CHATMESSAGE';
import { ChatRoom } from '../entities/CHATROOM';
import { SendMessageInput } from '../inputs/SendMessageInput';
import { MESSAGE_SENT } from '../pubsub';
import { pubSub } from '../pubsub';

@Resolver(() => ChatMessage)
export class ChatMessageResolver {
  @Query(() => [ChatMessage])
  async messages(
    @Arg('roomId', () => ID)
    roomId: number,
  ): Promise<ChatMessage[]> {
    return AppDataSource.getRepository(ChatMessage).find({
      where: {
        roomId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  @Mutation(() => ChatMessage)
  async sendMessage(
    @Arg('input', () => SendMessageInput)
    input: SendMessageInput,
  ): Promise<ChatMessage> {
    const username = input.username.trim();
    const text = input.text.trim();
    const user_id = input.user_id;

    if (!username) {
      throw new Error('A username is required.');
    }

    if (!text) {
      throw new Error('The message cannot be empty.');
    }

    const roomRepository = AppDataSource.getRepository(ChatRoom);

    const room = await roomRepository.findOneBy({
      id: Number(input.roomId),
    });

    if (!room) {
      throw new Error(`Chat room "${input.roomId}" was not found.`);
    }

    const messageRepository = AppDataSource.getRepository(ChatMessage);

    const message: ChatMessage = messageRepository.create({
      roomId: room.id,
      room,
      username,
      text,
      user_id,
    });

    const savedMessage: ChatMessage = await messageRepository.save(message);

    console.log('2. Publishing topic:', MESSAGE_SENT);

    await pubSub.publish(MESSAGE_SENT, savedMessage);

    return savedMessage;
  }

  @Subscription(() => ChatMessage, {
    topics: MESSAGE_SENT,

    filter: ({
      payload,
      args,
    }: {
      payload: ChatMessage;
      args: {
        roomId: number;
      };
    }): boolean => {
      console.log('4. Filter received payload:', payload);
      console.log('5. Filter received arguments:', args);

      const matches = Number(payload.roomId) === Number(args.roomId);

      console.log('6. Filter result:', matches);

      return matches;
    },
  })
  messageSent(
    @Root()
    message: ChatMessage,

    @Arg('roomId', () => ID)
    _roomId: string,
  ): ChatMessage {
    console.log('Subscription message:', message);
    console.log('Subscription arguments:', _roomId);
    return message;
  }
}
