import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample topics
  const topics = await Promise.all([
    prisma.topic.upsert({
      where: { id: 'topic-daily-routine' },
      update: {},
      create: {
        id: 'topic-daily-routine',
        name: 'Daily Routine',
        description: 'Talk about your daily activities and habits',
        category: 'daily-routine',
        isDaily: false,
      },
    }),
    prisma.topic.upsert({
      where: { id: 'topic-job-career' },
      update: {},
      create: {
        id: 'topic-job-career',
        name: 'Job & Career',
        description: 'Discuss your work, career goals, and professional experiences',
        category: 'job-career',
        isDaily: false,
      },
    }),
    prisma.topic.upsert({
      where: { id: 'topic-travel' },
      update: {},
      create: {
        id: 'topic-travel',
        name: 'Travel Experiences',
        description: 'Share your travel stories and dream destinations',
        category: 'travel',
        isDaily: false,
      },
    }),
    prisma.topic.upsert({
      where: { id: 'topic-hobbies' },
      update: {},
      create: {
        id: 'topic-hobbies',
        name: 'Hobbies & Interests',
        description: 'Talk about what you enjoy doing in your free time',
        category: 'hobbies',
        isDaily: false,
      },
    }),
    prisma.topic.upsert({
      where: { id: 'topic-technology' },
      update: {},
      create: {
        id: 'topic-technology',
        name: 'Technology',
        description: 'Discuss technology trends, gadgets, and innovations',
        category: 'technology',
        isDaily: false,
      },
    }),
    prisma.topic.upsert({
      where: { id: 'topic-food' },
      update: {},
      create: {
        id: 'topic-food',
        name: 'Food & Cooking',
        description: 'Share your favorite foods and cooking experiences',
        category: 'food',
        isDaily: false,
      },
    }),
  ]);

  console.log(`✅ Created ${topics.length} topics`);

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

