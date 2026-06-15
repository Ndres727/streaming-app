import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SongsService } from '../../songs/songs.service';
import { Song } from '../models/song.model';

@Resolver(() => Song)
export class SongResolver {
  constructor(private readonly songsService: SongsService) {}

  @Query(() => [Song])
  @UseGuards(AuthGuard('jwt'))
  songs(@Args('search', { nullable: true }) search?: string) {
    return this.songsService.findAll(search);
  }

  @Query(() => Song)
  @UseGuards(AuthGuard('jwt'))
  song(@Args('id') id: string) {
    return this.songsService.findById(id);
  }
}
