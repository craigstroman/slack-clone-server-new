/*
  type ChatRoom {
    id: ID!
    name: String!
    messages: [ChatMessage!]!
  }
    */
import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ChatMessage } from './CHATMESSAGE';

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [ChatMessage])
  @OneToMany(() => ChatMessage, (message) => message.roomId)
  messages: ChatMessage[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}
