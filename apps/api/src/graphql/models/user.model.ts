import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserProfile {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  createdAt: string;
}
