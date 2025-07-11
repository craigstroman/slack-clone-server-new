import { Router } from 'express';
import { indexPage } from '../controllers/index.js';

export const router = new Router();

if (process.env.NODE_ENV === 'development') {
  router.route(/^\/(?!graphql).*/).get(indexPage);
} else {
  router.route('/').get(indexPage);
}
