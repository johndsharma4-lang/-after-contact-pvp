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
  return headers;
}

class StoryPresentationInjector {
  element(element) {
    element.append('<script src="/story-presentation.js?v=20260824-4"></script>', { html: true });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (isDocumentRequest(request, url)) {
      const indexUrl = new URL('/index.html', url);
      const assetRequest = new Request(indexUrl.toString(), {
        method: request.method,
        headers: request.headers,
      });

      const assetResponse = await env.ASSETS.fetch(assetRequest);
      const headers = documentHeaders(assetResponse);

      if (request.method === 'HEAD') {
        return new Response(null, {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers,
        });
      }

      const transformed = new HTMLRewriter()
        .on('body', new StoryPresentationInjector())
        .transform(assetResponse);

      return new Response(transformed.body, {
        status: transformed.status,
        statusText: transformed.statusText,
        headers,
      });
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
