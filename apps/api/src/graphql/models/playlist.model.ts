import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Song } from './song.model';

@ObjectType()
export class Playlist {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field()
  isPublic: boolean;

  @Field(() => ID)
  ownerId: string;

  @Field(() => [Song])
  songs: Song[];

  @Field()
  createdAt: string;
}
