import baseWorker from './after-contact-worker.js';
export { MyDurableObject } from './after-contact-worker.js';

function isDocumentRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return url.pathname === '/' || url.pathname === '/index.html';
}

function documentHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=UTF-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate');
  headers.set('x-content-type-options', 'nosniff');
  headers.delete('content-disposition');
  headers.delete('content-length');
  return headers;
}

function patchIndexHtml(html) {
  let patched = html;
  if (!patched.includes('/lifecycle-fix.js?v=20260828-1')) {
    patched = patched.replace('</body>', '<script src="/lifecycle-fix.js?v=20260828-1"></script>\n</body>');
  }
  if (!patched.includes('/deployment-roster-v0338.js?v=20260828-2')) {
    patched = patched.replace('</body>', '<script src="/deployment-roster-v0338.js?v=20260828-2"></script>\n</body>');
  }
  if (!patched.includes('/deployment-button-v0339.js?v=20260828-2')) {
    patched = patched.replace('</body>', '<script src="/deployment-button-v0339.js?v=20260828-2"></script>\n</body>');
  }
  return patched;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (isDocumentRequest(request, url)) {
      const indexUrl = new URL('/index.html', url);
      const assetRequest = new Request(indexUrl.toString(), {method: request.method, headers: request.headers});
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      const headers = documentHeaders(assetResponse);
      if (request.method === 'HEAD') return new Response(null, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
      const html = patchIndexHtml(await assetResponse.text());
      return new Response(html, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
    }
    return baseWorker.fetch(request, env, ctx);
  },
};
