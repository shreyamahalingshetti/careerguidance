const fs = require('fs');
const path = require('path');

const targets = [
  path.resolve(__dirname, '../node_modules/@floating-ui/utils'),
  path.resolve(__dirname, '../node_modules/@floating-ui/core'),
  path.resolve(__dirname, '../node_modules/@floating-ui/dom'),
  path.resolve(__dirname, '../node_modules/@floating-ui/react-dom'),
];

targets.forEach(target => {
  console.log('Cleaning target:', target);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Successfully removed: ${target}`);
  } else {
    console.log(`Does not exist: ${target}`);
  }
});
