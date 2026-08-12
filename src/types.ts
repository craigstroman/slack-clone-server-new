import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { InputType, Field, ObjectType } from 'type-graphql';
import { User } from './entities/USER';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export interface MyContext {
  redis: Redis;
  req: Request;
  res: Response;
  userId?: number;
}

@InputType()
export class UsernameRegisterInput {
  @Field()
  first_name: string;
  @Field()
  last_name: string;
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
