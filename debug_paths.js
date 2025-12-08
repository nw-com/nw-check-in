const fs = require('fs');
const path = require('path');

console.log('CWD:', process.cwd());
const reqUrl = '/';
let filePath = '.' + reqUrl;
if (filePath === './') {
  filePath = './index.html';
}
console.log('Resolved:', filePath);
console.log('Absolute:', path.resolve(filePath));
console.log('Exists:', fs.existsSync(filePath));

try {
    const content = fs.readFileSync(filePath);
    console.log('Read success, length:', content.length);
} catch (e) {
    console.error('Read error:', e);
}
