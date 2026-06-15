import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { Playlist } from '../models/playlist.model';
import { Song } from '../models/song.model';
import { CreatePlaylistInput, AddSongToPlaylistInput } from '../inputs/playlist.input';

function mapPlaylist(prismaPlaylist: any): Playlist {
  return {
    ...prismaPlaylist,
    songs: (prismaPlaylist.songs || []).map((ps: any) => ps.song),
  };
}

@Resolver(() => Playlist)
export class PlaylistResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Playlist])
  @UseGuards(AuthGuard('jwt'))
  async myPlaylists(@Context('req') req: any) {
    const playlists = await this.prisma.playlist.findMany({
      where: { ownerId: req.user.sub },
      include: { songs: { include: { song: true }, orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return playlists.map(mapPlaylist);
  }

  @Query(() => Playlist)
  @UseGuards(AuthGuard('jwt'))
  async playlist(@Args('id') id: string, @Context('req') req: any) {
    const result = await this.prisma.playlist.findFirstOrThrow({
      where: { id, ownerId: req.user.sub },
      include: { songs: { include: { song: true }, orderBy: { position: 'asc' } } },
    });
    return mapPlaylist(result);
  }

  @Mutation(() => Playlist)
  @UseGuards(AuthGuard('jwt'))
  async createPlaylist(
    @Args('input') input: CreatePlaylistInput,
    @Context('req') req: any,
  ) {
    const result = await this.prisma.playlist.create({
      data: {
        name: input.name,
        description: input.description,
        isPublic: input.isPublic ?? true,
        ownerId: req.user.sub,
      },
      include: { songs: { include: { song: true } } },
    });
    return mapPlaylist(result);
  }

  @Mutation(() => Playlist)
  @UseGuards(AuthGuard('jwt'))
  async addSongToPlaylist(
    @Args('input') input: AddSongToPlaylistInput,
    @Context('req') req: any,
  ) {
    await this.prisma.playlist.findFirstOrThrow({
      where: { id: input.playlistId, ownerId: req.user.sub },
    });

    const maxPosition = await this.prisma.playlistSong.findFirst({
      where: { playlistId: input.playlistId },
      orderBy: { position: 'desc' },
    });

    await this.prisma.playlistSong.create({
      data: {
        playlistId: input.playlistId,
        songId: input.songId,
        position: (maxPosition?.position ?? -1) + 1,
      },
    });

    const result = await this.prisma.playlist.findUniqueOrThrow({
      where: { id: input.playlistId },
      include: { songs: { include: { song: true }, orderBy: { position: 'asc' } } },
    });
    return mapPlaylist(result);
  }

  @Mutation(() => Playlist)
  @UseGuards(AuthGuard('jwt'))
  async removeSongFromPlaylist(
    @Args('playlistId') playlistId: string,
    @Args('songId') songId: string,
    @Context('req') req: any,
  ) {
    await this.prisma.playlist.findFirstOrThrow({
      where: { id: playlistId, ownerId: req.user.sub },
    });

    await this.prisma.playlistSong.deleteMany({
      where: { playlistId, songId },
    });

    const result = await this.prisma.playlist.findUniqueOrThrow({
      where: { id: playlistId },
      include: { songs: { include: { song: true }, orderBy: { position: 'asc' } } },
    });
    return mapPlaylist(result);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard('jwt'))
  async deletePlaylist(@Args('id') id: string, @Context('req') req: any) {
    await this.prisma.playlist.findFirstOrThrow({
      where: { id, ownerId: req.user.sub },
    });
    await this.prisma.playlist.delete({ where: { id } });
    return true;
  }
}
