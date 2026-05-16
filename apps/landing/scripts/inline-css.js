import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');
const htmlPath = join(dist, 'index.html');
let html = readFileSync(htmlPath, 'utf-8');

const cssLinkRegex = /<link[^>]+rel="stylesheet"[^>]+href="\/assets\/([^"]+\.css)"[^>]*>/g;

let match;
while ((match = cssLinkRegex.exec(html)) !== null) {
  const cssFile = match[1];
  const cssPath = join(dist, 'assets', cssFile);
  try {
    const css = readFileSync(cssPath, 'utf-8');
    html = html.replace(match[0], `<style>${css}</style>`);
    unlinkSync(cssPath);
    console.log(`Inlined: ${cssFile} (${css.length} bytes)`);
  } catch (e) {
    console.error(`Failed to inline ${cssFile}:`, e.message);
  }
}

writeFileSync(htmlPath, html);
console.log('CSS inlined successfully.');
