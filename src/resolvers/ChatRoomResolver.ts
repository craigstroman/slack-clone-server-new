import { Arg, ID, Mutation, Query, Resolver } from 'type-graphql';

import { AppDataSource } from '../database';
import { ChatRoom } from '../entities/CHATROOM';

@Resolver(() => ChatRoom)
export class ChatRoomResolver {
  @Query(() => [ChatRoom])
  async chatRooms() {
    return AppDataSource.getRepository(ChatRoom).find({ order: { createdAt: 'ASC' } });
  }

  @Query(() => ChatRoom, {
    nullable: true,
  })
  async chatRoom(
    @Arg('id', () => ID)
    id: string,
  ): Promise<ChatRoom | null> {
    return AppDataSource.getRepository(ChatRoom).findOne({
      where: {
        id: Number(id),
      },
      relations: {
        messages: true,
      },
    });
  }

  @Mutation(() => ChatRoom)
  async createChatRoom(
    @Arg('name')
    name: string,
  ): Promise<ChatRoom> {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error('The chat-room name cannot be empty.');
    }

    const roomRepository = AppDataSource.getRepository(ChatRoom);

    const existingRoom = await roomRepository.findOneBy({
      name: trimmedName,
    });

    if (existingRoom) {
      throw new Error(`A chat room named "${trimmedName}" already exists.`);
    }

    const room = roomRepository.create({
      name: trimmedName,
    });

    return roomRepository.save(room);
  }
}
