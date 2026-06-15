import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@streaming.app' },
    update: {},
    create: {
      email: 'demo@streaming.app',
      passwordHash: hashedPassword,
      displayName: 'Demo User',
    },
  });

  console.log(`Created user: ${demoUser.email}`);

  const songs = [
    { title: 'Sunset Boulevard', artist: 'The Midnight', album: 'Endless Summer', duration: 245, genres: ['synthwave', 'electronic'] },
    { title: 'Neon Lights', artist: 'FM-84', album: 'Atlas', duration: 312, genres: ['synthwave', 'retro'] },
    { title: 'Home', artist: 'Waveshaper', album: 'Station Nova', duration: 198, genres: ['electronic', 'ambient'] },
    { title: 'Digital Love', artist: 'Daft Punk', album: 'Discovery', duration: 301, genres: ['electronic', 'house'] },
    { title: 'Intro', artist: 'The XX', album: 'XX', duration: 127, genres: ['indie', 'ambient'] },
    { title: 'Apocalypse', artist: 'Cigarettes After Sex', album: 'Cigarettes After Sex', duration: 290, genres: ['indie', 'dream pop'] },
    { title: 'Weightless', artist: 'Marconi Union', album: 'Weightless', duration: 483, genres: ['ambient', 'relaxation'] },
    { title: 'Strobe', artist: 'Deadmau5', album: 'For Lack of a Better Name', duration: 637, genres: ['electronic', 'progressive house'] },
  ];

  for (const song of songs) {
    await prisma.song.create({
      data: {
        ...song,
        audioUrl: `/audio/placeholder.mp3`,
        status: 'ready',
      },
    });
  }

  console.log(`Created ${songs.length} songs`);

  const allSongs = await prisma.song.findMany();

  const playlist = await prisma.playlist.create({
    data: {
      name: 'Favorites',
      description: 'My favorite tracks',
      isPublic: true,
      ownerId: demoUser.id,
      songs: {
        create: allSongs.slice(0, 4).map((song, index) => ({
          songId: song.id,
          position: index,
        })),
      },
    },
  });

  console.log(`Created playlist: ${playlist.name}`);

  // Add favorites
  for (const song of allSongs.slice(0, 3)) {
    await prisma.favorite.create({
      data: {
        userId: demoUser.id,
        songId: song.id,
      },
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
