import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureDefaultLogo() {
  console.log('Checking for existing logo...');
  
  // Check if a logo exists
  const existingLogo = await prisma.media.findFirst({
    where: { section: 'logo' }
  });
  
  if (!existingLogo) {
    console.log('No logo found. Creating default logo...');
    
    // Create default logo
    await prisma.media.create({
      data: {
        name: 'Rupomoti Logo',
        url: '/images/branding/logo.png',
        alt: 'Rupomoti Jewelry',
        type: 'image',
        section: 'logo',
        position: 1,
        isActive: true,
        metadata: {
          isDefault: true,
          width: 300,
          height: 100,
        }
      }
    });
    
    console.log('Default logo created.');
  } else {
    console.log('Logo already exists. No need to create default.');
  }
}

// Function to ensure media sections exist
async function ensureMediaSections() {
  console.log('Ensuring media sections exist...');
  
  const sections = [
    {
      name: 'logo',
      title: 'Logo',
      description: 'Website logo and branding',
      maxItems: 1,
      isActive: true,
      settings: {
        formats: ['image/png', 'image/svg+xml'],
        maxWidth: 300,
        maxHeight: 100,
        guidelines: 'PNG with transparent background recommended (300x100px)',
        cloudinaryFolder: 'rupomoti/logo',
        cloudinaryTransformations: {
          quality: 'auto:best',
          format: 'auto'
        }
      }
    },
    {
      name: 'hero-slider',
      title: 'Hero Slider',
      description: 'Main banner images for the homepage',
      maxItems: 10,
      isActive: true,
      settings: {
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 1920,
        maxHeight: 800,
        guidelines: 'Desktop: 1920x800px (16:9 ratio). Mobile: 800x1000px (4:5 ratio).',
        cloudinaryFolder: 'rupomoti/hero-slider',
        cloudinaryTransformations: {
          quality: 'auto:good',
          format: 'auto'
        }
      }
    },
    {
      name: 'banner',
      title: 'Banners',
      description: 'Promotional banners and ads',
      maxItems: 20,
      isActive: true,
      settings: {
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 1200,
        maxHeight: 400,
        guidelines: '1200x400px, JPG/PNG/WEBP, max 1MB',
        cloudinaryFolder: 'rupomoti/banners',
        cloudinaryTransformations: {
          quality: 'auto:good',
          format: 'auto'
        }
      }
    }
  ];
  
  for (const section of sections) {
    const existing = await prisma.mediaSection.findUnique({
      where: { name: section.name }
    });
    
    if (!existing) {
      await prisma.mediaSection.create({ data: section });
      console.log(`Created media section: ${section.name}`);
    } else {
      // Update with latest settings
      await prisma.mediaSection.update({
        where: { name: section.name },
        data: {
          title: section.title,
          description: section.description,
          maxItems: section.maxItems,
          isActive: section.isActive,
          settings: section.settings
        }
      });
      console.log(`Updated media section: ${section.name}`);
    }
  }
}

async function main() {
  try {
    await ensureMediaSections();
    await ensureDefaultLogo();
    console.log('Media setup completed successfully!');
  } catch (error) {
    console.error('Error setting up media:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
