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

  // v0.33.12 cleanup: the game core already owns the real three-warrior Earth
  // deployment state. Expose only a tiny bridge so the mobile roster talks to
  // that state instead of maintaining a second/fake deployment model.
  const bridgeNeedle = "  return true;\n}\nfunction showDeployGhost(e){";
  const bridgeReplacement = "  return true;\n}\nwindow.__acDeployBridge=Object.freeze({\n  getState:()=>deployment.slice(),\n  required:()=>requiredDeploymentCount(),\n  place:(warriorIndex,roomIndex,sourceRoom=null)=>placeWarriorInSlot(warriorIndex,roomIndex,sourceRoom),\n  refresh:()=>updateDeployUI()\n});\nfunction showDeployGhost(e){";
  if (!patched.includes('window.__acDeployBridge=Object.freeze')) {
    patched = patched.replace(bridgeNeedle, bridgeReplacement);
  }

  patched = patched.replaceAll('MATCH RECORDER v0.33.7', 'MATCH RECORDER v0.33.12');
  patched = patched.replaceAll('build=2026-08-28_EARTH_DEPLOYMENT_INPUT_STABLE', 'build=2026-08-28_UNIFIED_NATIVE_DEPLOYMENT');

  if (!patched.includes('/lifecycle-fix.js?v=20260828-1')) {
    patched = patched.replace('</body>', '<script src="/lifecycle-fix.js?v=20260828-1"></script>\n</body>');
  }

  // Remove every previously injected deployment overlay. These scripts hid the
  // native roster and created competing state/touch handlers on iPhone.
  patched = patched.replace(/\s*<script src="\/deployment-roster-v0338\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/deployment-button-v0339\.js\?v=[^"]+"><\/script>/g, '');

  if (!patched.includes('/deployment-controller-v03312.js?v=20260828-1')) {
    patched = patched.replace('</body>', '<script src="/deployment-controller-v03312.js?v=20260828-1"></script>\n</body>');
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
