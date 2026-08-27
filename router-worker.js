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

const PATCH_CSS = `
<style id="ac-v03215-earth-placement">
#characterOverlay.acEarthPlacement .characterPanel{width:min(1180px,96%);height:min(620px,94%);grid-template-columns:.9fr 1.1fr;gap:16px;padding:16px}
#characterOverlay.acEarthPlacement .characterIntro{justify-content:flex-start;min-width:0}
#characterOverlay.acEarthPlacement .characterTitle{font-size:clamp(22px,3vw,38px)}
#characterOverlay.acEarthPlacement .characterText{margin-bottom:9px}
#characterOverlay.acEarthPlacement #characterRoster{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;flex:1;min-height:0}
#characterOverlay.acEarthPlacement #characterRoster .characterCard{min-height:0;padding:7px;border-color:rgba(116,217,255,.35);background:linear-gradient(180deg,rgba(64,133,174,.14),rgba(2,10,18,.88));cursor:grab}
#characterOverlay.acEarthPlacement #characterRoster .characterCard img{height:70%;filter:none}
#characterOverlay.acEarthPlacement #characterRoster .characterCard.placed{opacity:.46;border-color:rgba(121,240,172,.5)}
#characterOverlay.acEarthPlacement #characterRoster .characterCard.dragging{border-color:#7fffc2;box-shadow:0 0 0 2px rgba(127,255,194,.2)}
#characterOverlay.acEarthPlacement #characterContinue{display:none!important}
#acEarthShipPanel{display:flex;flex-direction:column;min-width:0}
#acEarthShipLabel{text-align:center;font-size:10px;font-weight:1000;letter-spacing:.12em;color:#f0c65a;margin-bottom:7px}
#acEarthShipShell{position:relative;flex:1;min-height:0;display:grid;place-items:center;border:1px solid rgba(240,198,90,.22);border-radius:22px;background:radial-gradient(ellipse at center,rgba(240,198,90,.14),rgba(3,10,18,.96) 68%);overflow:hidden}
#acEarthShipShell:before,#acEarthShipShell:after{content:"";position:absolute;left:5%;right:5%;height:35%;border-radius:50%;border:7px solid rgba(188,142,43,.62);transform:skewX(-14deg);pointer-events:none}
#acEarthShipShell:before{top:12%;border-bottom-color:transparent}#acEarthShipShell:after{bottom:12%;border-top-color:transparent}
#acEarthPlacementGrid{width:min(78%,410px);aspect-ratio:1.18/1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:7px;z-index:2}
.acEarthPlaceSlot{position:relative;border:2px solid rgba(240,198,90,.5);border-radius:8px;background:linear-gradient(180deg,rgba(8,20,32,.98),rgba(1,6,12,.98));box-shadow:inset 0 0 18px rgba(0,0,0,.8);overflow:hidden}
.acEarthPlaceSlot:after{content:attr(data-label);position:absolute;right:4px;bottom:3px;font-size:7px;font-weight:900;opacity:.35}.acEarthPlaceSlot.hover{border-color:#7fffc2}.acEarthPlaceSlot.filled{border-color:rgba(121,240,172,.85)}
.acEarthPlaceSlot img{width:100%;height:100%;object-fit:contain;pointer-events:none}
#acEarthDeployBtn{height:48px;margin-top:9px;border:0;border-radius:13px;background:linear-gradient(180deg,#47b9ff,#147bd0);color:#fff;font-size:13px;font-weight:1000;letter-spacing:.12em;touch-action:manipulation}
#acEarthDeployBtn:disabled{opacity:.32}.acEarthHint{text-align:center;font-size:8px;opacity:.55;margin-top:5px}
#acEarthDragGhost{position:fixed;z-index:120;width:68px;height:78px;object-fit:contain;display:none;pointer-events:none;filter:drop-shadow(0 8px 14px #000)}
@media(max-height:520px) and (orientation:landscape){#characterOverlay.acEarthPlacement{padding:5px}#characterOverlay.acEarthPlacement .characterPanel{height:calc(100% - 2px);padding:8px;gap:9px}#characterOverlay.acEarthPlacement .characterTitle{font-size:20px}#characterOverlay.acEarthPlacement .characterText{font-size:8px;margin:2px 0 5px}#characterOverlay.acEarthPlacement #characterRoster{gap:5px}#characterOverlay.acEarthPlacement #characterRoster .characterCard{padding:4px}#acEarthShipLabel{font-size:8px;margin-bottom:3px}#acEarthDeployBtn{height:40px;margin-top:5px}.acEarthHint{display:none}}
</style>`;

const INTERNAL_PATCH = `
// === AFTER CONTACT v0.32.15 EARTH TACTICAL PLACEMENT ===
const AC_EARTH_TEAM=Object.freeze([
 {id:'bombardier',name:'BOMBARDIER',weapon:'HE-9 BARRAGE'},
 {id:'sniper',name:'SNIPER',weapon:'LONGSHOT RIFLE'},
 {id:'radio_man',name:'RADIO MAN',weapon:'TARGET LOCATOR • COMBAT CONTROLLER'}
]);
const acEarthPlacement=[null,null,null];
let acEarthDragIndex=null,acEarthDragPointer=null;
function acEarthArt(type){
 if(type==='bombardier')return '/bombardier.webp';
 const icon=type==='sniper'?'⌖':'⌁',label=type==='sniper'?'SNIPER':'RADIO';
 const feature=type==='sniper'?'<circle cx="160" cy="220" r="42" fill="none" stroke="#bde9ff" stroke-width="5"/><path d="M103 220h114M160 163v114" stroke="#e8f8ff" stroke-width="6"/>':'<path d="M105 165q55-60 110 0M123 188q37-39 74 0M144 210q16-16 32 0" fill="none" stroke="#bdeaff" stroke-width="7"/><rect x="120" y="230" width="80" height="55" rx="8" fill="#13283a" stroke="#7fdcff" stroke-width="4"/>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#15283b"/><stop offset="1" stop-color="#03070c"/></linearGradient></defs><rect width="320" height="420" fill="url(#g)"/><circle cx="160" cy="100" r="43" fill="#293e52" stroke="#83d9ff" stroke-width="5"/><path d="M98 300q13-130 62-130t62 130l26 66H72z" fill="#20364a" stroke="#6ccfff" stroke-width="5"/>'+feature+'<text x="160" y="350" text-anchor="middle" fill="#dff6ff" font-family="Arial" font-size="27" font-weight="900">'+icon+'</text><text x="160" y="391" text-anchor="middle" fill="#fff" font-family="Arial" font-size="19" font-weight="900">'+label+'</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function acEarthPlacementOpen(){return selectedFaction==='earth'&&gameFlowPhase==='warrior'&&!characterOverlay.classList.contains('hidden')}
function acBuildEarthPlacement(){
 if(selectedFaction!=='earth')return false;
 characterOverlay.classList.add('acEarthPlacement');
 const panel=characterOverlay.querySelector('.characterPanel'),intro=panel?.querySelector('.characterIntro'),roster=document.getElementById('characterRoster');if(!panel||!intro||!roster)return false;
 const kicker=intro.querySelector('.characterKicker'),title=intro.querySelector('.characterTitle'),text=intro.querySelector('.characterText');
 if(kicker)kicker.textContent='EARTH COMMAND • TACTICAL DEPLOYMENT';if(title)title.textContent='PLACE YOUR WARRIORS';if(text)text.textContent='Drag all three Earth warriors into the ship interior. Choose their strategic starting rooms, then press DEPLOY.';
 [...roster.querySelectorAll('.characterCard,.characterReserve')].forEach(n=>n.remove());
 AC_EARTH_TEAM.forEach((u,i)=>{const card=document.createElement('div');card.className='characterCard';card.dataset.acEarthIndex=String(i);card.innerHTML='<img src="'+acEarthArt(u.id)+'" alt="'+u.name+'"><div class="characterName">'+u.name+'</div><div class="characterWeapon">'+u.weapon+'</div>';card.addEventListener('pointerdown',e=>acEarthBeginDrag(e,i),{passive:false});roster.insertBefore(card,characterContinue)});
 let ship=document.getElementById('acEarthShipPanel');if(!ship){ship=document.createElement('section');ship.id='acEarthShipPanel';ship.innerHTML='<div id="acEarthShipLabel">EARTH FORTRESS • CUTAWAY INTERIOR</div><div id="acEarthShipShell"><div id="acEarthPlacementGrid">'+Array.from({length:9},(_,i)=>'<div class="acEarthPlaceSlot" data-index="'+i+'" data-label="'+(i+1)+'"></div>').join('')+'</div></div><button id="acEarthDeployBtn" type="button" disabled>PLACE ALL 3</button><div class="acEarthHint">DRAG A WARRIOR AGAIN TO REPOSITION • ONE WARRIOR PER COMPARTMENT</div>';panel.appendChild(ship);ship.querySelector('#acEarthDeployBtn').addEventListener('pointerup',acEarthDeploy,{passive:false});}
 let ghost=document.getElementById('acEarthDragGhost');if(!ghost){ghost=document.createElement('img');ghost.id='acEarthDragGhost';ghost.alt='';document.body.appendChild(ghost)}
 acEarthPlacement.fill(null);acEarthRefreshPlacement();diag('EARTH PLACEMENT','three-warrior cutaway placement screen ready');return true;
}
function acEarthRefreshPlacement(){
 if(!acEarthPlacementOpen())return;
 document.querySelectorAll('#characterRoster .characterCard').forEach(c=>{const i=Number(c.dataset.acEarthIndex);c.classList.toggle('placed',Number.isInteger(acEarthPlacement[i]))});
 document.querySelectorAll('.acEarthPlaceSlot').forEach(slot=>{const room=Number(slot.dataset.index),wi=acEarthPlacement.findIndex(x=>x===room);slot.innerHTML='';slot.classList.toggle('filled',wi>=0);if(wi>=0){const img=document.createElement('img');img.src=acEarthArt(AC_EARTH_TEAM[wi].id);img.alt=AC_EARTH_TEAM[wi].name;slot.appendChild(img)}});
 const ready=acEarthPlacement.every(Number.isInteger)&&new Set(acEarthPlacement).size===3,btn=document.getElementById('acEarthDeployBtn');if(btn){btn.disabled=!ready;btn.textContent=ready?'DEPLOY':'PLACE ALL 3'}
}
function acEarthBeginDrag(e,i){
 if(!acEarthPlacementOpen())return;e.preventDefault();e.stopPropagation();acEarthDragIndex=i;acEarthDragPointer=e.pointerId;const card=e.currentTarget;card.classList.add('dragging');const ghost=document.getElementById('acEarthDragGhost');ghost.src=acEarthArt(AC_EARTH_TEAM[i].id);ghost.style.display='block';ghost.style.left=(e.clientX-34)+'px';ghost.style.top=(e.clientY-39)+'px';
 try{card.setPointerCapture(e.pointerId)}catch{}
}
function acEarthMoveDrag(e){if(acEarthDragIndex==null||e.pointerId!==acEarthDragPointer)return;e.preventDefault();const ghost=document.getElementById('acEarthDragGhost');ghost.style.left=(e.clientX-34)+'px';ghost.style.top=(e.clientY-39)+'px';const hit=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList?.contains('acEarthPlaceSlot'));document.querySelectorAll('.acEarthPlaceSlot').forEach(s=>s.classList.toggle('hover',s===hit))}
function acEarthEndDrag(e){
 if(acEarthDragIndex==null||e.pointerId!==acEarthDragPointer)return;e.preventDefault();const wi=acEarthDragIndex,hit=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList?.contains('acEarthPlaceSlot'));document.getElementById('acEarthDragGhost').style.display='none';document.querySelectorAll('.acEarthPlaceSlot').forEach(s=>s.classList.remove('hover'));document.querySelectorAll('#characterRoster .characterCard').forEach(c=>c.classList.remove('dragging'));
 if(hit){const room=Number(hit.dataset.index),other=acEarthPlacement.findIndex((r,j)=>j!==wi&&r===room);if(other<0)acEarthPlacement[wi]=room;}
 acEarthDragIndex=null;acEarthDragPointer=null;acEarthRefreshPlacement();
}
document.addEventListener('pointermove',acEarthMoveDrag,{passive:false,capture:true});document.addEventListener('pointerup',acEarthEndDrag,{passive:false,capture:true});document.addEventListener('pointercancel',acEarthEndDrag,{passive:false,capture:true});
const acOldRenderFactionRoster=renderFactionRoster;
renderFactionRoster=function(){if(selectedFaction!=='earth'){characterOverlay.classList.remove('acEarthPlacement');document.getElementById('acEarthShipPanel')?.remove();return acOldRenderFactionRoster()}selectedWarriorType='bombardier';setTimeout(acBuildEarthPlacement,0);return true};
const acOldValidateFactionStarter=validateFactionStarter;validateFactionStarter=function(faction,warrior){if(faction==='earth')return warrior==='bombardier';return acOldValidateFactionStarter(faction,warrior)};
function acPrepEarthBattleTeam(){
 const warriors=localSide==='earth'?eWarriors:aWarriors;
 AC_EARTH_TEAM.forEach((u,i)=>{const w=warriors[i];if(!w)return;applyProfileToWarrior(w,'bombardier');w.weaponKey='bombardier';w.faction='earth';w.acEarthSpecialist=u.id;w.displayName=u.name;w.passive=false;if(w.nameText)w.nameText.textContent=u.name;const art=acEarthArt(u.id);if(w.sprite)textureLoader.load(art,t=>{w.sprite.material.map=t;w.sprite.material.needsUpdate=true},undefined,()=>{})});
}
function acEarthDeploy(e){
 if(e)stopNative(e);if(!acEarthPlacement.every(Number.isInteger)||new Set(acEarthPlacement).size!==3)return;
 selectedWarriorType='bombardier';const saved=[...acEarthPlacement];
 continueToDeployment(e);deployment.length=3;for(let i=0;i<3;i++)deployment[i]=saved[i];acPrepEarthBattleTeam();updateDeployUI();diag('EARTH DEPLOY','Bombardier + Sniper + Radio Man positions committed');setTimeout(()=>startBattle(e),40);
}
function acSuppressLegacyXrayGlow(){for(const w of allWarriors||[]){if(w.xrayGlow){w.xrayGlow.visible=false;if(w.xrayGlow.material)w.xrayGlow.material.opacity=0}if(w.captainBeacon){w.captainBeacon.visible=false;if(w.captainBeacon.material)w.captainBeacon.material.opacity=0}}}
acSuppressLegacyXrayGlow();if(typeof refreshPrivateXrayVisuals==='function'){const f=refreshPrivateXrayVisuals;refreshPrivateXrayVisuals=function(...a){const r=f(...a);acSuppressLegacyXrayGlow();return r}}if(typeof updatePrivateXrayAnimation==='function'){const f=updatePrivateXrayAnimation;updatePrivateXrayAnimation=function(...a){const r=f(...a);acSuppressLegacyXrayGlow();return r}}
const acBuildBadge=document.querySelector('.lab');if(acBuildBadge)acBuildBadge.textContent='3D LAB • MOBILE PVP TEST • v0.32.15';diag('PATCH 0.32.15','EARTH WARRIOR SCREEN NOW INCLUDES CUTAWAY SHIP PLACEMENT');
`;

function patchIndexHtml(html) {
  let out = html;
  if (!out.includes('ac-v03215-earth-placement')) out = out.replace('</head>', `${PATCH_CSS}\n</head>`);
  if (!out.includes('PATCH 0.32.15')) {
    const close = out.lastIndexOf('</script>');
    if (close > 0) out = out.slice(0, close) + INTERNAL_PATCH + '\n' + out.slice(close);
  }
  out = out.replace('</body>', '<script src="/lifecycle-fix.js?v=20260827-4"></script>\n</body>');
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (isDocumentRequest(request, url)) {
      const indexUrl = new URL('/index.html', url);
      const assetRequest = new Request(indexUrl.toString(), {method: request.method, headers: request.headers});
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      const headers = documentHeaders(assetResponse);
      if (request.method === 'HEAD') return new Response(null, {status: assetResponse.status,statusText: assetResponse.statusText,headers});
      let html = await assetResponse.text();html = patchIndexHtml(html);
      return new Response(html, {status: assetResponse.status,statusText: assetResponse.statusText,headers});
    }
    return baseWorker.fetch(request, env, ctx);
  },
};
