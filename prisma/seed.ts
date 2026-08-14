import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Singer', slug: 'singer', serviceType: 'both', icon: 'Music' },
  { name: 'Dancer', slug: 'dancer', serviceType: 'both', icon: 'Footprints' },
  { name: 'Actor', slug: 'actor', serviceType: 'both', icon: 'Clapperboard' },
  { name: 'Model', slug: 'model', serviceType: 'content', icon: 'Camera' },
  { name: 'Makeup Artist', slug: 'makeup-artist', serviceType: 'booking', icon: 'Sparkles' },
  { name: 'Mehndi Artist', slug: 'mehndi-artist', serviceType: 'booking', icon: 'Flower2' },
  { name: 'Tattoo Artist', slug: 'tattoo-artist', serviceType: 'booking', icon: 'PenTool' },
  { name: 'Photographer', slug: 'photographer', serviceType: 'booking', icon: 'Camera' },
  { name: 'Graphic Designer', slug: 'graphic-designer', serviceType: 'booking', icon: 'Palette' },
  { name: 'Influencer', slug: 'influencer', serviceType: 'content', icon: 'Users' },
  { name: 'Video Editor', slug: 'video-editor', serviceType: 'booking', icon: 'Video' },
  { name: 'Fashion Stylist', slug: 'fashion-stylist', serviceType: 'booking', icon: 'Shirt' },
  { name: 'DJ', slug: 'dj', serviceType: 'booking', icon: 'Disc' },
  { name: 'Rapper', slug: 'rapper', serviceType: 'both', icon: 'Mic' },
  { name: 'Poet', slug: 'poet', serviceType: 'content', icon: 'BookOpen' },
  { name: 'Voice Artist', slug: 'voice-artist', serviceType: 'booking', icon: 'Volume2' },
  { name: 'Anchor', slug: 'anchor', serviceType: 'booking', icon: 'Megaphone' },
  { name: 'Stand-up Comedian', slug: 'stand-up-comedian', serviceType: 'both', icon: 'Laugh' },
  { name: 'Wedding Vendor', slug: 'wedding-vendor', serviceType: 'booking', icon: 'Heart' },
  { name: 'Music Producer', slug: 'music-producer', serviceType: 'both', icon: 'Sliders' },
  { name: 'Choreographer', slug: 'choreographer', serviceType: 'booking', icon: 'Compass' },
  { name: 'Nail Artist', slug: 'nail-artist', serviceType: 'booking', icon: 'Sparkles' },
  { name: 'Hair Artist', slug: 'hair-artist', serviceType: 'booking', icon: 'Scissors' },
  { name: 'Digital Creator', slug: 'digital-creator', serviceType: 'content', icon: 'Laptop' },
  { name: 'AI Creator', slug: 'ai-creator', serviceType: 'content', icon: 'Cpu' },
  { name: 'Sketch Artist', slug: 'sketch-artist', serviceType: 'both', icon: 'Brush' },
  { name: 'Calligrapher', slug: 'calligrapher', serviceType: 'booking', icon: 'Pen' },
  { name: 'Interior Designer', slug: 'interior-designer', serviceType: 'booking', icon: 'Home' },
  { name: 'Costume Designer', slug: 'costume-designer', serviceType: 'booking', icon: 'Scissors' },
  { name: 'Mimicry Artist', slug: 'mimicry-artist', serviceType: 'booking', icon: 'Smile' },
  { name: 'Magician', slug: 'magician', serviceType: 'booking', icon: 'Wand2' },
  { name: 'Fitness Creator', slug: 'fitness-creator', serviceType: 'content', icon: 'Dumbbell' },
  { name: 'Chef Creator', slug: 'chef-creator', serviceType: 'content', icon: 'Utensils' },
  { name: 'Travel Creator', slug: 'travel-creator', serviceType: 'content', icon: 'Plane' },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`Successfully seeded ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
