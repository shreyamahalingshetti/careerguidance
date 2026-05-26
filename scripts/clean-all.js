const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../node_modules');
console.log('Cleaning entire node_modules folder:', target);

if (fs.existsSync(target)) {
  fs.rmSync(target, { recursive: true, force: true });
  console.log('Successfully removed the entire node_modules folder.');
} else {
  console.log('node_modules folder does not exist.');
}
