import { AuthChecker } from 'type-graphql';

import { MyContext } from './types';

export const authChecker: AuthChecker<MyContext> = ({ context }) => {
  console.log('AUTH CHECKER');
  console.log('AUTH userId:', context.userId);

  return true;
};
