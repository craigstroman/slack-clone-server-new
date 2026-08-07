import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
  FieldResolver,
  Root,
  Query,
} from 'type-graphql';
import { v4 } from 'uuid';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';
import { AppDataSource } from '../database';
import { MyContext } from '../types';
import { User } from '../entities/USER';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see someone elses email
    return '';
  }
  @Query(() => User)
  async me(@Ctx() { req }: MyContext) {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }

    const id = req.session.userId;

    const user = await User.findOne(id);

    return user;
  }
}
