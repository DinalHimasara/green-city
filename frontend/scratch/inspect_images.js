const fs = require('fs');
const path = require('path');

const files = [
  'Screenshot 2026-07-16 005642.png',
  'Screenshot 2026-07-16 010133.png',
  'fg44x9.jpg',
  'rsadlh.jpg',
  's1l0f0.jpg',
  'logo1.png'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`${file}: size = ${stats.size} bytes`);
  } else {
    console.log(`${file} does not exist at ${filePath}`);
  }
});
