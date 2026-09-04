import baseWorker from './after-contact-worker.js';
import { patchIndexHtml } from './game-html-patcher.js';
import { patchEarthSpecialistsRuntime } from './earth-specialists-runtime.js';
import { patchSolarLancerRuntime } from './solar-lancer-runtime.js';
import { patchAurelianDeploymentRuntime } from './aurelian-deployment-runtime.js';
import { patchAurelianTeamRuntime } from './aurelian-team-runtime.js';
import { patchAurelianCombatRuntime } from './aurelian-combat-runtime.js';
import { patchAurelianRouteCompatRuntime } from './aurelian-route-compat-runtime.js';
import { patchCombatPresentationLockRuntime } from './combat-presentation-lock-runtime.js';
import { patchSoloEarthRoundRobinRuntime } from './solo-earth-round-robin-runtime.js';
import { patchDestructionCinematicRuntime } from './destruction-cinematic-runtime.js';
import { patchEarthCombatClarityRuntime } from './earth-combat-clarity-runtime.js';
import { patchCutawayLifecycleRuntime } from './cutaway-lifecycle-runtime.js';
export { MyDurableObject } from './after-contact-worker.js';

const REMAKE_BUILD = '2026-09-04_REMAKE_PREVIEW_1';

function isRootDocumentRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/legacy' || url.pathname === '/legacy/' || url.pathname === '/legacy/index.html';
}

function isRemakeDocumentRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return url.pathname === '/remake' || url.pathname === '/remake/' || url.pathname === '/remake/index.html';
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

async function serveAssetDocument(request, env, pathname) {
  const url = new URL(request.url);
  const assetUrl = new URL(pathname, url);
  const assetRequest = new Request(assetUrl.toString(), {method: request.method, headers: request.headers});
  const assetResponse = await env.ASSETS.fetch(assetRequest);
  const headers = documentHeaders(assetResponse);
  if (request.method === 'HEAD') return {assetResponse, headers, html: null};
  return {assetResponse, headers, html: await assetResponse.text()};
}

async function serveLegacyShell(request, env) {
  const {assetResponse, headers, html: rawHtml} = await serveAssetDocument(request, env, '/index.html');
  headers.set('x-after-contact-route', 'start-menu');
  if (request.method === 'HEAD') return new Response(null, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
  let html = patchIndexHtml(rawHtml);
  html = patchEarthSpecialistsRuntime(html);
  html = patchSolarLancerRuntime(html);
  html = patchAurelianDeploymentRuntime(html);
  html = patchAurelianTeamRuntime(html);
  html = patchAurelianCombatRuntime(html);
  html = patchAurelianRouteCompatRuntime(html);
  html = patchCombatPresentationLockRuntime(html);
  html = patchSoloEarthRoundRobinRuntime(html);
  html = patchDestructionCinematicRuntime(html);
  html = patchEarthCombatClarityRuntime(html);
  html = patchCutawayLifecycleRuntime(html);
  html = installSharedDeploymentController(html);
  return new Response(html, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (isRootDocumentRequest(request, url)) return serveLegacyShell(request, env);

    if (isRemakeDocumentRequest(request, url)) {
      const {assetResponse, headers, html} = await serveAssetDocument(request, env, '/remake/index.html');
      headers.set('x-after-contact-build', REMAKE_BUILD);
      headers.set('x-after-contact-route', 'remake-preview');
      if (request.method === 'HEAD') return new Response(null, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
      return new Response(html, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
    }

    if (isStaticAssetRequest(request, url)) return env.ASSETS.fetch(request);
    return baseWorker.fetch(request, env, ctx);
  },
};
