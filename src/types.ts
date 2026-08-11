import { Request, Response } from 'express';
import { Redis } from 'ioredis';

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
