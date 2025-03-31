import sharp from 'sharp';

sharp('public/icon.svg')
  .resize(32, 32)
  .png()
  .toFile('public/icon.png')
  .then(() => console.log('Conversion complete'))
  .catch(err => console.error('Error:', err)); 