const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../node_modules/asynckit');
console.log('Cleaning target:', target);

if (fs.existsSync(target)) {
  fs.rmSync(target, { recursive: true, force: true });
  console.log('Successfully removed corrupted asynckit directory.');
} else {
  console.log('asynckit directory does not exist.');
}
