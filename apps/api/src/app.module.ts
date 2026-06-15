import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SongsModule } from './songs/songs.module';
import { StreamModule } from './stream/stream.module';
import { GqlModule } from './graphql/graphql.module';
import { FavoritesModule } from './favorites/favorites.module';
import { RecentlyPlayedModule } from './recently-played/recently-played.module';
import { AlbumsModule } from './albums/albums.module';
import { RadioModule } from './radio/radio.module';
import { DownloadsModule } from './downloads/downloads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get('REDIS_URL', 'redis://localhost:6379') },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    SongsModule,
    StreamModule,
    GqlModule,
    FavoritesModule,
    RecentlyPlayedModule,
    AlbumsModule,
    RadioModule,
    DownloadsModule,
  ],
})
export class AppModule {}
