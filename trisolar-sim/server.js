const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API endpoints
  if (pathname === '/api/presets') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      presets: [
        { id: 'figure8', name: 'Figure-8', category: '2D Classic', description: 'Three equal masses chase each other in a figure-8 pattern' },
        { id: 'butterfly', name: 'Butterfly I', category: '2D Classic', description: 'Butterfly-shaped periodic orbit' },
        { id: 'moth', name: 'Moth I', category: '2D Classic', description: 'Moth-shaped periodic orbit' },
        { id: 'yarn', name: 'Yarn', category: '2D Classic', description: 'Complex yarn-like periodic orbit' },
        { id: 'yin_yang_1', name: 'Yin-Yang I', category: '2D Classic', description: 'Yin-Yang shaped periodic orbit' },
        { id: 'broucke_a1', name: 'Broucke A1', category: '2D Broucke', description: 'Broucke-Hénon family orbit A1' },
        { id: 'broucke_a2', name: 'Broucke A2', category: '2D Broucke', description: 'Broucke-Hénon family orbit A2' },
        { id: 'broucke_a7', name: 'Broucke A7', category: '2D Broucke', description: 'Broucke-Hénon family orbit A7' },
        { id: 'lagrange', name: 'Lagrange (Equilateral)', category: '2D Classic', description: 'Three bodies in equilateral triangle formation' },
        { id: 'euler', name: 'Euler (Collinear)', category: '2D Classic', description: 'Three bodies in a line' },
        { id: 'random', name: 'Random', category: 'Sandbox', description: 'Random initial conditions' },
        { id: 'solar', name: 'Sun-Earth-Moon', category: 'Sandbox', description: 'Hierarchical solar system style' },
        { id: 'binary_star', name: 'Binary + Planet', category: 'Sandbox', description: 'Binary star system with a planet' },
        { id: 'pyth_3body', name: 'Pythagorean 3-Body', category: 'Classic', description: 'The famous Pythagorean three-body problem with masses 3, 4, 5' }
      ]
    }));
    return;
  }

  if (pathname === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      integrators: ['rk4', 'verlet', 'euler'],
      maxBodies: 10,
      version: '1.0.0'
    }));
    return;
  }

  // Static file handling
  let relativeFilePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.normalize(path.join(PUBLIC_DIR, relativeFilePath));

  // Security check to avoid path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    // If not found or is directory, fallback to index.html for SPA behavior
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const rawStream = fs.createReadStream(filePath);

    if (/\bgzip\b/.test(acceptEncoding) && (ext === '.html' || ext === '.css' || ext === '.js' || ext === '.json')) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip'
      });
      rawStream.pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      rawStream.pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🌌 Trisolar Simulator backend running at http://localhost:${PORT}\n`);
});
