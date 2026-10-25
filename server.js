import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.join(rootDirectory, 'dist');
const port = Number(process.env.PORT) || 3000;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function getFilePath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://localhost:${port}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const baseDirectory = pathname.startsWith('/Imagenes/') ? rootDirectory : clientDirectory;
  const filePath = path.resolve(baseDirectory, relativePath);

  if (!filePath.startsWith(`${baseDirectory}${path.sep}`)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  let filePath;

  try {
    filePath = getFilePath(request.url);
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
    return;
  }

  const pathname = new URL(request.url, `http://localhost:${port}`).pathname;
  if (pathname === '/healthz') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (!filePath) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      if (pathname.startsWith('/assets/') || pathname.startsWith('/Imagenes/')) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Asset Not Found');
        return;
      }

      const fallbackPath = path.join(clientDirectory, 'index.html');
      fs.stat(fallbackPath, (fallbackError, fallbackStats) => {
        if (fallbackError || !fallbackStats.isFile()) {
          response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Not Found');
          return;
        }

        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(fallbackPath).pipe(response);
      });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600'
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`7Mares server listening on port ${port}`);
});