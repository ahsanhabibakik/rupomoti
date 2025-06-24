import { PrismaClient } from '@prisma/client';
import { generateSKU } from '../src/lib/utils/sku';

const prisma = new PrismaClient();

const productData = [
  { name: 'Gold ring with diamond', id: '1Vqz7z3J4hE' },
  { name: 'Silver bracelet with gemstones', id: '2T6kQz8l2wE' },
  { name: 'Gold necklace with pendant', id: '3U8z7z3J4hE' },
  { name: 'Silver earrings with pearls', id: '4Vqz7z3J4hE' },
  { name: 'Gold watch with leather strap', id: '5T6kQz8l2wE' },
  { name: 'Silver anklet with charms', id: '6U8z7z3J4hE' },
  { name: 'Gold cufflinks with initials', id: '7Vqz7z3J4hE' },
  { name: 'Diamond engagement ring', id: '8T6kQz8l2wE' },
  { name: 'Gold bangle with intricate design', id: '9U8z7z3J4hE' },
  { name: 'Silver pendant necklace', id: '10Vqz7z3J4hE' },
  { name: 'Gold hoop earrings', id: '11T6kQz8l2wE' },
  { name: 'Silver chain bracelet', id: '12U8z7z3J4hE' },
  { name: 'Gold ring with emerald', id: '13Vqz7z3J4hE' },
  { name: 'Silver watch with mesh band', id: '14T6kQz8l2wE' },
  { name: 'Gold necklace with sapphire', id: '15U8z7z3J4hE' },
  { name: 'Silver earrings with diamonds', id: '16Vqz7z3J4hE' },
  { name: 'Gold bracelet with charms', id: '17T6kQz8l2wE' },
  { name: 'Silver ring with ruby', id: '18U8z7z3J4hE' },
  { name: 'Gold pendant with pearl', id: '19Vqz7z3J4hE' },
  { name: 'Silver anklet with bells', id: '20T6kQz8l2wE' },
  { name: 'Gold cuff bracelet', id: '21U8z7z3J4hE' },
  { name: 'Silver necklace with pendant', id: '22Vqz7z3J4hE' },
  { name: 'Gold earrings with gemstones', id: '23T6kQz8l2wE' },
  { name: 'Silver ring with sapphire', id: '24U8z7z3J4hE' },
  { name: 'Gold chain bracelet', id: '25Vqz7z3J4hE' },
  { name: 'Silver pendant with diamond', id: '26T6kQz8l2wE' },
  { name: 'Gold watch with diamond accents', id: '27U8z7z3J4hE' },
  { name: 'Silver earrings with emeralds', id: '28Vqz7z3J4hE' },
  { name: 'Gold ring with amethyst', id: '29T6kQz8l2wE' },
  { name: 'Silver bracelet with turquoise', id: '30U8z7z3J4hE' },
];

async function main() {
  console.log('Start seeding...');

  // 1. Get or create categories
  let categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log('No categories found, creating some...');
    await prisma.category.createMany({
      data: [
        { name: 'Rings', slug: 'rings' },
        { name: 'Bracelets', slug: 'bracelets' },
        { name: 'Necklaces', slug: 'necklaces' },
        { name: 'Earrings', slug: 'earrings' },
      ],
    });
    categories = await prisma.category.findMany();
    console.log('Categories created.');
  }

  // 2. Create products
  for (const product of productData) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomPrice = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
    const randomStock = Math.floor(Math.random() * 100);
    const imageUrl = `https://source.unsplash.com/${product.id}`;
    
    await prisma.product.create({
      data: {
        name: product.name,
        description: `High-quality ${product.name}. A perfect choice for you.`,
        price: randomPrice,
        stock: randomStock,
        sku: generateSKU(product.name),
        images: [imageUrl],
        categoryId: randomCategory.id,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
