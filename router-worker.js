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

  const bridgeNeedle = "  return true;\n}\nfunction showDeployGhost(e){";
  const bridgeReplacement = "  return true;\n}\nwindow.__acDeployBridge=Object.freeze({\n  getState:()=>deployment.slice(),\n  required:()=>requiredDeploymentCount(),\n  place:(warriorIndex,roomIndex,sourceRoom=null)=>placeWarriorInSlot(warriorIndex,roomIndex,sourceRoom),\n  refresh:()=>updateDeployUI()\n});\nfunction showDeployGhost(e){";
  if (!patched.includes('window.__acDeployBridge=Object.freeze')) patched = patched.replace(bridgeNeedle, bridgeReplacement);

  patched = patched.replaceAll('MATCH RECORDER v0.33.7', 'MATCH RECORDER v0.33.16');
  patched = patched.replaceAll('MATCH RECORDER v0.33.14', 'MATCH RECORDER v0.33.16');
  patched = patched.replaceAll('build=2026-08-28_EARTH_DEPLOYMENT_INPUT_STABLE', 'build=2026-08-28_PERSISTENT_FORTRESS_CUTAWAY');
  patched = patched.replaceAll('build=2026-08-28_SCROLL_AND_BATTLE_LOCKIN', 'build=2026-08-28_PERSISTENT_FORTRESS_CUTAWAY');

  // Cutaway is now the normal local combat command view. The tactical scan is
  // presentation; the interior geometry remains the existing private local cutaway.
  const oldOpen = "xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();applyXrayShell();buildPrivateXray();for(const w of localXrayWarriors())syncWarriorConcealment(w);refreshXrayCrewCard();updateBattleCamera();statusEl.textContent='FORTRESS CUTAWAY • TAP A NAMED WARRIOR';";
  const newOpen = "xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();window.__acRunCutawayScan?.();applyXrayShell();buildPrivateXray();for(const w of localXrayWarriors())syncWarriorConcealment(w);refreshXrayCrewCard();updateBattleCamera();statusEl.textContent='FORTRESS CUTAWAY • SELECT YOUR WARRIOR';";
  patched = patched.replace(oldOpen,newOpen);

  const oldSchedule = "if(mine){statusEl.textContent='YOUR TURN • MOVE OR FIRE • TAP OWN VESSEL FOR X-RAY';diag('XRAY READY',`${reason} side=${localXraySide()} private=Y manualOnly=Y`)}";
  const newSchedule = "if(mine){statusEl.textContent='TACTICAL SCAN • OPENING FORTRESS CUTAWAY';setTimeout(()=>{if(battleStarted&&!matchEnded&&!xrayOpen)openPrivateXray('automatic tactical scan')},120);diag('CUTAWAY READY',`${reason} side=${localXraySide()} private=Y automatic=Y persistent=Y`)}";
  patched = patched.replace(oldSchedule,newSchedule);

  // Own-vessel taps can open the cutaway if needed, but no longer close it.
  patched = patched.replace("function togglePrivateXray(reason='own vessel tap'){if(xrayOpen)closePrivateXray(reason);else openPrivateXray(reason)}","function togglePrivateXray(reason='own vessel tap'){if(!xrayOpen)openPrivateXray(reason)}");
  patched = patched.replace("statusEl.textContent='YOUR TURN • MOVE OR FIRE • TAP OWN VESSEL FOR X-RAY'","statusEl.textContent='YOUR TURN • FORTRESS CUTAWAY READY'");

  if (!patched.includes('/lifecycle-fix.js?v=20260828-1')) patched = patched.replace('</body>', '<script src="/lifecycle-fix.js?v=20260828-1"></script>\n</body>');

  patched = patched.replace(/\s*<script src="\/deployment-roster-v0338\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/deployment-button-v0339\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/deployment-controller-v03312\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/deployment-controller-v03313\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/cutaway-scan-v03316\.js\?v=[^"]+"><\/script>/g, '');

  if (!patched.includes('/deployment-controller-v03313.js?v=20260828-3')) patched = patched.replace('</body>', '<script src="/deployment-controller-v03313.js?v=20260828-3"></script>\n</body>');
  if (!patched.includes('/cutaway-scan-v03316.js?v=20260828-1')) patched = patched.replace('</body>', '<script src="/cutaway-scan-v03316.js?v=20260828-1"></script>\n</body>');
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