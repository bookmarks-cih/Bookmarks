// Neo Marks Storage Server
// Simple HTTP server for file-based marks storage per cookie-id

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3456;
const STORAGE_DIR = path.join(__dirname, 'marks-storage');
const MARKS_LIMIT = 50;

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  console.log('[Storage] Created directory:', STORAGE_DIR);
}

// Utility functions
function isValidCookieId(id) {
  return id && typeof id === 'string' && /.{1,64}/.test(id);
}

function getMarksFilePath(cookieId) {
  return path.join(STORAGE_DIR, `marks-${cookieId}.json`);
}

function loadMarks(cookieId) {
  const filePath = getMarksFilePath(cookieId);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('[Storage] Load error:', e.message);
  }
  return [];
}

function saveMarks(cookieId, marks) {
  const filePath = getMarksFilePath(cookieId);
  try {
    const limited = marks.slice(0, MARKS_LIMIT);
    fs.writeFileSync(filePath, JSON.stringify(limited, null, 2), 'utf8');
    return limited;
  } catch (e) {
    console.error('[Storage] Save error:', e.message);
    return marks;
  }
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Request handler
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  // API Routes
  if (pathname === '/api/marks' && method === 'GET') {
    const cookieId = parsedUrl.query.cookieId;
    if (!isValidCookieId(cookieId)) {
      return sendJSON(res, 400, { error: 'Invalid or missing cookieId' });
    }
    const marks = loadMarks(cookieId);
    return sendJSON(res, 200, { cookieId, marks });
  }
  
  if (pathname === '/api/marks' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { cookieId, marks } = data;
        if (!isValidCookieId(cookieId)) {
          return sendJSON(res, 400, { error: 'Invalid or missing cookieId' });
        }
        if (!Array.isArray(marks)) {
          return sendJSON(res, 400, { error: 'marks must be an array' });
        }
        const saved = saveMarks(cookieId, marks);
        console.log(`[Storage] Saved ${saved.length} marks for ${cookieId}`);
        return sendJSON(res, 200, { cookieId, marks: saved });
      } catch (e) {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }
  
  if (pathname === '/api/marks' && method === 'DELETE') {
    const cookieId = parsedUrl.query.cookieId;
    const markId = parsedUrl.query.markId;
    if (!isValidCookieId(cookieId)) {
      return sendJSON(res, 400, { error: 'Invalid or missing cookieId' });
    }
    const marks = loadMarks(cookieId);
    const filtered = marks.filter(m => m.id !== markId);
    const saved = saveMarks(cookieId, filtered);
    return sendJSON(res, 200, { cookieId, marks: saved });
  }
  
  if (pathname === '/api/validate' && method === 'GET') {
    const cookieId = parsedUrl.query.cookieId;
    const valid = isValidCookieId(cookieId);
    return sendJSON(res, 200, { cookieId, valid });
  }
  
  if (pathname === '/api/storage-info' && method === 'GET') {
    try {
      const files = fs.readdirSync(STORAGE_DIR).filter(f => f.startsWith('marks-') && f.endsWith('.json'));
      const totalUsers = files.length;
      let totalMarks = 0;
      files.forEach(f => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(STORAGE_DIR, f), 'utf8'));
          totalMarks += (Array.isArray(data) ? data.length : 0);
        } catch (e) {}
      });
      return sendJSON(res, 200, { storageDir: STORAGE_DIR, totalUsers, totalMarks });
    } catch (e) {
      return sendJSON(res, 500, { error: e.message });
    }
  }
  
  // Health check
  if (pathname === '/health') {
    return sendJSON(res, 200, { status: 'ok', uptime: process.uptime() });
  }
  
  // 404
  return sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`[Neo Marks Storage Server] Running on http://localhost:${PORT}`);
  console.log(`[Storage] Directory: ${STORAGE_DIR}`);
});