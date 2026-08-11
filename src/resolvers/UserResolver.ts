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
  Authorized,
} from 'type-graphql';
import { v4 } from 'uuid';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';
import { AppDataSource } from '../database';
import { MyContext } from '../types';
import { User } from '../entities/USER';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

@InputType()
class UsernameRegisterInput {
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
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @Authorized()
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see someone elses email
    return '';
  }
  @Authorized()
  @Query(() => User)
  async me(@Ctx() { req }: MyContext) {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }

    console.log('SESSION:', req.session);
    console.log('USER ID:', req.session.userId);

    const id = req.session.userId;

    const user = await User.findOne(id);

    return user;
  }

  @Authorized()
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernameRegisterInput,
    @Ctx() { req, em }: MyContext,
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username must be greater than 2 characters long.',
          },
        ],
      };
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password length must be greater than 2 characters long.',
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const userRepository = AppDataSource.getRepository(User);

    const result = await userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        first_name: options.first_name,
        last_name: options.last_name,
        username: options.username,
        email: options.email,
        password: hashedPassword,
      })
      .returning('*')
      .execute();

    const user = result.raw[0];

    try {
      await em.persistAndFlush(user);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('23505')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    if (req.session) {
      req.session.userId = user.id;
    }
    // console.log('Login mutation called');
    // console.log('LOGIN SESSION ID:', req.sessionID);
    // console.log('LOGIN SESSION:', req.session);

    return { user };
  }
  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() context: MyContext,
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } },
    );

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username or password is invalid.',
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    console.log('login mutation called');
    console.log('user: ', user);

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: "Username or password doesn't match.",
          },
        ],
      };
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Your password validation would happen here.
    if (context.req.session) {
      context.req.session.userId = user.id;
    }

    console.log('Login mutation called');

    context.req.session.userId = user.id;

    console.log('===== LOGIN =====');
    console.log('sessionID:', context.req.sessionID);
    console.log('cookie header:', context.req.headers.cookie);
    console.log('Session ID:', context.req.sessionID);
    if (context.req.session) {
      console.log('User ID:', context.req.session.userId);
    }

    return { user };
  }
}
