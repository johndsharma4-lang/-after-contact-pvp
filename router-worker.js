import baseWorker from './after-contact-worker.js';
import { patchIndexHtml } from './game-html-patcher.js';
import { patchEarthSpecialistsRuntime } from './earth-specialists-runtime.js';
import { patchSolarLancerRuntime } from './solar-lancer-runtime.js';
import { patchAurelianDeploymentRuntime } from './aurelian-deployment-runtime.js';
import { patchAurelianTeamRuntime } from './aurelian-team-runtime.js';
import { patchAurelianCombatRuntime } from './aurelian-combat-runtime.js';
import { patchCombatPresentationLockRuntime } from './combat-presentation-lock-runtime.js';
import { patchSoloEarthRoundRobinRuntime } from './solo-earth-round-robin-runtime.js';
import { patchDestructionCinematicRuntime } from './destruction-cinematic-runtime.js';
export { MyDurableObject } from './after-contact-worker.js';

function isDocumentRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return url.pathname === '/' || url.pathname === '/index.html';
}

function isStaticAssetRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return /\.(?:webp|png|jpg|jpeg|svg|gif|mp3|wav|css|js)$/i.test(url.pathname);
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

function installSharedDeploymentController(html) {
  if (html.includes('deployment-controller-v03313.js')) return html;
  return html.replace('</body>', '<script src="/deployment-controller-v03313.js"></script>\n</body>');
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
      let html = patchIndexHtml(await assetResponse.text());
      html = patchEarthSpecialistsRuntime(html);
      html = patchSolarLancerRuntime(html);
      html = patchAurelianDeploymentRuntime(html);
      html = patchAurelianTeamRuntime(html);
      html = patchAurelianCombatRuntime(html);
      html = patchCombatPresentationLockRuntime(html);
      html = patchSoloEarthRoundRobinRuntime(html);
      html = patchDestructionCinematicRuntime(html);
      html = installSharedDeploymentController(html);
      return new Response(html, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
    }
    if (isStaticAssetRequest(request, url)) return env.ASSETS.fetch(request);
    return baseWorker.fetch(request, env, ctx);
  },
};
