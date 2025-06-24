import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newImageUrls = [
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/01903f107085967.5f9f1eb8501eb.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/7b8b5e107085967.5f9f1eb8502b6.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/1a2b3c107085967.5f9f1eb8503a7.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/4d5e6f107085967.5f9f1eb8504b8.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/7g8h9i107085967.5f9f1eb8505c9.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/0j1k2l107085967.5f9f1eb8506da.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/3m4n5o107085967.5f9f1eb8507eb.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/6p7q8r107085967.5f9f1eb8508fc.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/9t0u1v107085967.5f9f1eb8509fd.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/2w3x4y107085967.5f9f1eb850af0.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/5z6a7b107085967.5f9f1eb850bf1.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/8c9d0e107085967.5f9f1eb850cf2.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/1f2g3h107085967.5f9f1eb850df3.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/4i5j6k107085967.5f9f1eb850ef4.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/7l8m9n107085967.5f9f1eb850ff5.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/0o1p2q107085967.5f9f1eb8510f6.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/3r4s5t107085967.5f9f1eb8511f7.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/6u7v8w107085967.5f9f1eb8512f8.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/9x0y1z107085967.5f9f1eb8513f9.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/2a3b4c107085967.5f9f1eb8514fa.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/5d6e7f107085967.5f9f1eb8515fb.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/8g9h0i107085967.5f9f1eb8516fc.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/1j2k3l107085967.5f9f1eb8517fd.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/4m5n6o107085967.5f9f1eb8518fe.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/7p8q9r107085967.5f9f1eb8519ff.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/0s1t2u107085967.5f9f1eb8520f0.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/3v4w5x107085967.5f9f1eb8521f1.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/6y7z8a107085967.5f9f1eb8522f2.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/9b0c1d107085967.5f9f1eb8523f3.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/2d3e4f107085967.5f9f1eb8524f4.jpg',
];

async function updateProductImages() {
  console.log('Starting to update product images...');

  try {
    const products = await prisma.product.findMany({
      select: { id: true },
    });

    if (products.length === 0) {
      console.log('No products found in the database.');
      return;
    }

    console.log(`Found ${products.length} products to update.`);

    const updatePromises = products.map((product, index) => {
      const newImageUrl = newImageUrls[index % newImageUrls.length];
      return prisma.product.update({
        where: { id: product.id },
        data: { images: [newImageUrl] },
      });
    });

    await Promise.all(updatePromises);

    console.log('Successfully updated all product images.');
  } catch (error) {
    console.error('An error occurred while updating product images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages(); 