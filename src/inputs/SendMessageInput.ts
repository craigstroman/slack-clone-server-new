import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class SendMessageInput {
  @Field(() => ID)
  roomId!: string;

  @Field()
  username!: string;

  @Field()
  user_id!: number;

  @Field()
  text!: string;
}
