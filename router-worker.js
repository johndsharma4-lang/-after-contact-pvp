import baseWorker from './after-contact-worker.js';
export { MyDurableObject } from './after-contact-worker.js';

function isDocumentRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return url.pathname === '/' || url.pathname === '/index.html';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Force the game document to be served as HTML instead of a download.
    if (isDocumentRequest(request, url)) {
      const indexUrl = new URL('/index.html', url);
      const assetRequest = new Request(indexUrl.toString(), {
        method: request.method,
        headers: request.headers,
      });

      const assetResponse = await env.ASSETS.fetch(assetRequest);
      const headers = new Headers(assetResponse.headers);
      headers.set('content-type', 'text/html; charset=UTF-8');
      headers.set('cache-control', 'no-store, no-cache, must-revalidate');
      headers.set('x-content-type-options', 'nosniff');
      headers.delete('content-disposition');

      return new Response(request.method === 'HEAD' ? null : assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
