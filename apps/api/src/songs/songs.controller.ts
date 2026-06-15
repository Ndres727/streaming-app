import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query('q') search?: string) {
    return this.songsService.findAll(search);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.songsService.findById(id);
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: CreateSongDto,
  ) {
    return this.songsService.uploadAndCreate(file, metadata);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.songsService.delete(id);
    return { message: 'Song deleted' };
  }
}
