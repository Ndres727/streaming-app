import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Song {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  artist: string;

  @Field()
  album: string;

  @Field(() => Int)
  duration: number;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field()
  audioUrl: string;

  @Field({ nullable: true })
  hlsUrl?: string;

  @Field(() => [String])
  genres: string[];

  @Field()
  status: string;

  @Field()
  createdAt: string;
}
