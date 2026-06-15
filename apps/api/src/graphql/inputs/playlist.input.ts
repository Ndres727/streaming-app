import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePlaylistInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ defaultValue: true })
  isPublic?: boolean;
}

@InputType()
export class AddSongToPlaylistInput {
  @Field()
  playlistId: string;

  @Field()
  songId: string;
}
