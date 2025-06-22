// Client-side Cloudinary utilities
export async function uploadImage(file: File) {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rupomoti_products');
    formData.append('folder', 'rupomoti/products');
    formData.append('use_filename', 'true');
    formData.append('unique_filename', 'true');
    formData.append('overwrite', 'false');
    formData.append('transformation', JSON.stringify([
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ]));

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

export async function deleteImage(publicId: string) {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete image');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(error.message || 'Failed to delete image');
  }
}
