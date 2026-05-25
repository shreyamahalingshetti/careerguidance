const fs = require('fs');
const code = fs.readFileSync('app/dashboard/12th-standard/test/page.tsx','utf8');
const re = /<(\/)?\s*([A-Za-z0-9_:-]+)[^>]*?(\/?)>/g;
let m;
const stack = [];
let idx=0;
while ((m = re.exec(code)) !== null) {
  const isClosing = !!m[1];
  const tag = m[2];
  const selfClose = !!m[3];
  const pos = m.index;
  if (isClosing) {
    if (stack.length && stack[stack.length - 1].tag === tag) {
      stack.pop();
    } else {
      console.log('Unmatched close', tag, 'at', pos);
    }
  } else if (selfClose) {
    // ignore
  } else {
    stack.push({ tag, pos });
  }
}
if (stack.length) {
  console.log('Unclosed tags:');
  stack.forEach(s => console.log(s.tag, '@', s.pos));
} else {
  console.log('All tags seem closed');
}
