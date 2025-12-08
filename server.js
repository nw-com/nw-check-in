const http = require('http');
console.log('Starting server...');
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const server = http.createServer((req, res) => {
  // Simple logging to file
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  fs.appendFile('access.log', logEntry, (err) => {
    if (err) console.error('Log error:', err);
  });

  let requestUrl = req.url.split('?')[0];
  let filePath = '.' + requestUrl;
  if (filePath === './') {
    filePath = './index.html';
  }

  console.log('Current CWD:', process.cwd());
  console.log('Request:', req.url);
  console.log('Resolved path:', filePath);
  console.log('File exists:', fs.existsSync(filePath));

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      // Disable caching to ensure latest files are served
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 3002;
server.on('error', (e) => {
  console.error('Server error:', e);
});
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
