import { ObjectType, Field } from '@nestjs/graphql';
import { UserProfile } from './user.model';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserProfile)
  user: UserProfile;
}
