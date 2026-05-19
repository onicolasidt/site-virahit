#!/usr/bin/env node
/**
 * Pré-renderização da landing ViraHit
 * 
 * Roda DEPOIS do `vite build`. Serve dist/ com servidor estático simples,
 * abre Puppeteer para cada rota, captura HTML renderizado pelo React,
 * e sobrescreve os arquivos HTML no dist/.
 * 
 * Resultado: HTML chega com conteúdo real → PSI estimado 70 → 75-80.
 * 
 * Uso: node scripts/prerender.cjs
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const ROUTES = ['/', '/termos', '/privacidade'];
const PORT = 4173;
const RENDER_TIMEOUT = 15000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.webp': 'image/webp',
};

function createStaticServer(distDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Remove query strings
      let urlPath = req.url.split('?')[0];
      
      // Serve index.html for root or SPA fallback
      let filePath;
      if (urlPath === '/' || urlPath === '') {
        filePath = path.join(distDir, 'index.html');
      } else {
        filePath = path.join(distDir, urlPath);
      }
      
      // If file doesn't exist, try SPA fallback
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        // Try with /index.html for sub-routes (SPA)
        const indexPath = path.join(distDir, urlPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          filePath = path.join(distDir, 'index.html');
        }
      }
      
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 
          'Content-Type': contentType + (ext === '.html' ? '; charset=utf-8' : ''),
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      } catch (err) {
        console.error('[prerender] 404:', urlPath);
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    server.listen(port, () => {
      console.log(`[prerender] Servidor estático rodando em http://localhost:${port}`);
      resolve(server);
    });
    
    server.on('error', reject);
  });
}

async function prerender() {
  console.log('[prerender] Iniciando pré-renderização...');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('[prerender] ERRO: dist/ não encontrado. Rode `vite build` primeiro.');
    process.exit(1);
  }

  const originalHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
  console.log(`[prerender] index.html original: ${originalHtml.length} bytes`);

  // Servidor estático
  const server = await createStaticServer(DIST_DIR, PORT);

  // Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ],
  });
  console.log('[prerender] Puppeteer iniciado');

  for (const route of ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    console.log(`[prerender] Renderizando ${url}...`);

    let page;
    try {
      page = await browser.newPage();
      await page.setViewport({ width: 375, height: 812 });

      // Collect console errors
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      // Navigate
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: RENDER_TIMEOUT 
      });

      // Wait for React to mount content in #root
      // Use optional chaining safely (Puppeteer 1.x evaluate doesn't support ?.)
      await page.waitForFunction(
        'document.getElementById("root") && document.getElementById("root").children.length > 0',
        { timeout: 10000 }
      ).catch(() => {
        console.log(`[prerender] Aviso: #root sem conteúdo após 10s para ${route}`);
      });

      // Extra wait for styles and fonts
      await new Promise(r => setTimeout(r, 2000));

      // Check if content was rendered
      const hasContent = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root && root.children.length > 0;
      });

      if (!hasContent) {
        console.log(`[prerender] Aviso: #root vazio para ${route}, usando HTML original`);
        await page.close();
        continue;
      }

      // Capture rendered HTML
      let html = await page.content();
      
      // Clean up: remove Wistia JSON-LD injected during prerendering
      // (it contains localhost URLs and dynamic data that breaks in production)
      html = html.replace(/<script class="w-json-ld"[^>]*>[\s\S]*?<\/script>/gi, '');
      
      // Clean up: remove any injected style tags from Wistia that reference localhost
      // These are artifacts of prerendering and should be dynamic in production
      html = html.replace(/<style[^>]*data-wistia[^>]*>[\s\S]*?<\/style>/gi, '');
      
      // Clean up: remove Facebook Pixel inline scripts (the external scripts with src are fine, but inline ones with localhost domain are bad)
      // Only remove inline scripts that contain "connect.facebook.net" AND "localhost"
      // The original <script> tags from our HTML template (fbq init, etc.) should stay
      const facebookInlineScripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
      for (const script of facebookInlineScripts) {
        if (script.includes('connect.facebook.net') && script.includes('localhost')) {
          html = html.replace(script, '');
        }
      }
      
      // Clean up: remove Google Analytics inline scripts that contain domain=localhost
      // Only remove the ones injected by the prerender that reference localhost
      const gaInlineScripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
      for (const script of gaInlineScripts) {
        if (script.includes('googletagmanager.com') && script.includes('localhost')) {
          html = html.replace(script, '');
        }
      }
      
      // Clean up: remove external GA script tags injected during prerendering (not from our template)
      // These are the <script async src="https://www.googletagmanager.com/gtag/js?id=..."> that were loaded during rendering
      html = html.replace(/<script[^>]*async=""[^>]*src="https:\/\/www\.googletagmanager\.com\/gtag\/js[^"]*"[^>]*><\/script>/gi, '');
      
      // Clean up: remove external Facebook Pixel script tags loaded during rendering  
      html = html.replace(/<script[^>]*async=""[^>]*src="https:\/\/connect\.facebook\.net\/[^"]*"[^>]*><\/script>/gi, '');
      html = html.replace(/<script[^>]*src="https:\/\/connect\.facebook\.net\/[^"]*"[^>]*><\/script>/gi, '');
      
      // Output path
      let outputPath;
      if (route === '/') {
        outputPath = path.join(DIST_DIR, 'index.html');
      } else {
        const dir = path.join(DIST_DIR, route.substring(1));
        fs.mkdirSync(dir, { recursive: true });
        outputPath = path.join(dir, 'index.html');
      }

      fs.writeFileSync(outputPath, html, 'utf-8');
      console.log(`[prerender] OK ${route} → ${html.length} bytes escritos`);

      if (errors.length > 0) {
        console.log(`[prerender] Erros no console: ${errors.join('; ')}`);
      }

      await page.close();
    } catch (err) {
      console.error(`[prerender] ERRO ${route}: ${err.message}`);
      if (page) await page.close().catch(() => {});
    }
  }

  await browser.close();
  server.close();
  console.log('[prerender] Concluído!');
}

prerender().catch((err) => {
  console.error('[prerender] ERRO FATAL:', err);
  process.exit(1);
});