import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Request } from 'express';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module';
import { SongsModule } from '../songs/songs.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { SongResolver } from './resolvers/song.resolver';
import { PlaylistResolver } from './resolvers/playlist.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      playground: true,
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    AuthModule,
    SongsModule,
  ],
  providers: [AuthResolver, SongResolver, PlaylistResolver],
})
export class GqlModule {}
