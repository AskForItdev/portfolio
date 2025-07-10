// Chat functions

export async function makeThumbnailBase64(file, maxWidth = 300) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const scale = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * scale;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getMessagePreview(message, type) {
  if (!message) return 'No messages';
  if (type === 'image') return '...image';
  if (type === 'text') return message.slice(0, 20) + '...';
  if (type === 'recording') return '...recording';
  if (type === 'deleted') return '...message deleted';
  return message;
}
