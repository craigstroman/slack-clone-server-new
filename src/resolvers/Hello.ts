import { Resolver, Query } from 'type-graphql';

@Resolver()
export class HelloResolver {
  @Query()
  hello(): string {
    return 'Hello from Apollo Server';
  }
}
