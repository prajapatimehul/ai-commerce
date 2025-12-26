// Image processing utilities for T-shirt customization

/**
 * Fetches an image from a URL and returns it as a File object
 */
export async function fetchImageAsFile(imageUrl: string): Promise<File> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();
  const filename = imageUrl.split('/').pop() || 'tshirt.jpg';

  return new File([blob], filename, { type: blob.type });
}

/**
 * Compresses an image file to reduce size while maintaining quality
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 1280)
 * @param quality - JPEG quality 0-1 (default: 0.75)
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  quality = 0.75
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(
              new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
            );
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts an image file to base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Validates image format
 */
export function validateImageFormat(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];
  return supportedTypes.includes(file.type.toLowerCase());
}
