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
<style id="ac-v03216-earth-placement">
#characterOverlay.acEarthPlacement{padding:8px!important}
#characterOverlay.acEarthPlacement .characterPanel{width:min(1240px,98%)!important;height:min(650px,96%)!important;grid-template-columns:minmax(285px,.78fr) minmax(0,1.55fr)!important;gap:12px!important;padding:12px!important;overflow:hidden!important}
#characterOverlay.acEarthPlacement .characterIntro{justify-content:flex-start!important;min-width:0!important;min-height:0!important;overflow:hidden!important}
#characterOverlay.acEarthPlacement .characterKicker{font-size:8px!important}
#characterOverlay.acEarthPlacement .characterTitle{font-size:clamp(20px,2.5vw,34px)!important;line-height:.95!important;margin-top:2px!important}
#characterOverlay.acEarthPlacement .characterText{font-size:clamp(8px,.88vw,11px)!important;line-height:1.25!important;margin:5px 0 7px!important}
#characterOverlay.acEarthPlacement #characterRoster{display:flex!important;flex-direction:column!important;gap:6px!important;min-height:0!important;overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;padding:0 4px 4px 0!important;touch-action:pan-y!important}
#characterOverlay.acEarthPlacement #characterRoster::-webkit-scrollbar{width:5px}#characterOverlay.acEarthPlacement #characterRoster::-webkit-scrollbar-thumb{background:rgba(116,217,255,.38);border-radius:999px}
#characterOverlay.acEarthPlacement #characterRoster .characterCard{display:grid!important;grid-template-columns:78px minmax(0,1fr)!important;grid-template-rows:auto auto 1fr auto!important;column-gap:8px!important;min-height:112px!important;flex:0 0 112px!important;padding:7px!important;border-color:rgba(116,217,255,.34)!important;background:linear-gradient(180deg,rgba(44,103,141,.14),rgba(2,10,18,.9))!important;cursor:grab!important;overflow:hidden!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard[data-ac-earth-index="0"]{border-color:rgba(240,176,64,.55)!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard[data-ac-earth-index="1"]{border-color:rgba(73,185,255,.55)!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard[data-ac-earth-index="2"]{border-color:rgba(132,220,91,.55)!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard img{grid-column:1;grid-row:1/5;width:76px!important;height:100%!important;max-height:98px!important;object-fit:contain!important;filter:none!important;align-self:center!important}
#characterOverlay.acEarthPlacement #characterRoster .characterName{grid-column:2;grid-row:1;font-size:11px!important;line-height:1!important;text-align:left!important;padding:0!important}
#characterOverlay.acEarthPlacement #characterRoster .characterWeapon{grid-column:2;grid-row:2;font-size:7px!important;line-height:1.1!important;margin:2px 0 0!important;text-align:left!important;color:#9edfff!important;opacity:.9!important}
.acEarthDesc{grid-column:2;grid-row:3;font-size:7px;line-height:1.2;opacity:.68;margin-top:3px;min-height:17px}
.acEarthStats{grid-column:2;grid-row:4;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin-top:4px}
.acStat{min-width:0}.acStatLabel{font-size:6px;font-weight:1000;letter-spacing:.04em;opacity:.68;display:flex;justify-content:space-between;gap:2px}.acStatTrack{height:4px;margin-top:2px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}.acStatFill{height:100%;border-radius:999px;background:linear-gradient(90deg,#4d9fce,#bfeeff)}
#characterOverlay.acEarthPlacement #characterRoster .characterCard.placed{opacity:.48!important;border-color:rgba(121,240,172,.58)!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard.dragging{opacity:1!important;border-color:#7fffc2!important;box-shadow:0 0 0 2px rgba(127,255,194,.2)!important}
.acLockedWarrior{flex:0 0 48px;min-height:48px;border:1px dashed rgba(255,255,255,.18);border-radius:10px;background:rgba(255,255,255,.025);display:grid;grid-template-columns:34px 1fr;align-items:center;gap:7px;padding:6px 9px;opacity:.42}.acLockedIcon{font-size:19px;text-align:center}.acLockedTitle{font-size:8px;font-weight:1000;letter-spacing:.08em}.acLockedSub{font-size:7px;opacity:.58;margin-top:2px}
#characterOverlay.acEarthPlacement #characterContinue{display:none!important}
#acEarthShipPanel{display:flex;flex-direction:column;min-width:0;min-height:0}
#acEarthShipLabel{text-align:center;font-size:9px;font-weight:1000;letter-spacing:.13em;color:#69cfff;margin-bottom:5px}
#acEarthShipShell{position:relative;flex:1;min-height:0;display:grid;place-items:center;border:1px solid rgba(116,217,255,.23);border-radius:18px;background:radial-gradient(ellipse at center,rgba(52,112,150,.13),rgba(3,10,18,.98) 70%);overflow:hidden}
#acEarthShipShell:before{content:"";position:absolute;inset:4%;border:8px solid rgba(80,125,155,.36);border-radius:22% 22% 18% 18%;box-shadow:inset 0 0 26px rgba(33,112,160,.12);pointer-events:none}
#acEarthPlacementGrid{width:min(88%,560px);height:min(88%,470px);display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:6px;z-index:2}
.acEarthPlaceSlot{position:relative;border:2px solid rgba(90,162,203,.5);border-radius:8px;background:linear-gradient(180deg,rgba(8,21,34,.97),rgba(1,7,13,.98));box-shadow:inset 0 0 20px rgba(0,0,0,.82);overflow:hidden;display:grid;place-items:center}
.acEarthPlaceSlot:before{content:"+";font-size:24px;font-weight:300;color:rgba(215,242,255,.46);position:absolute}.acEarthPlaceSlot:after{content:attr(data-label);position:absolute;left:5px;top:4px;font-size:6px;font-weight:1000;opacity:.42}.acEarthPlaceSlot.hover{border-color:#7fffc2!important;box-shadow:inset 0 0 20px rgba(127,255,194,.08),0 0 12px rgba(127,255,194,.18)!important}.acEarthPlaceSlot.filled{border-color:rgba(121,240,172,.82)!important}.acEarthPlaceSlot.filled:before{display:none}.acEarthPlaceSlot img{width:92%;height:92%;object-fit:contain;pointer-events:none;z-index:2}
#acEarthDeployBtn{height:46px;margin-top:7px;border:0;border-radius:12px;background:linear-gradient(180deg,#b98231,#73501d);color:#fff;font-size:13px;font-weight:1000;letter-spacing:.12em;touch-action:manipulation;cursor:pointer}
#acEarthDeployBtn:disabled{opacity:.38;filter:saturate(.55)}.acEarthHint{text-align:center;font-size:7px;opacity:.52;margin-top:4px}
#acEarthDragGhost{position:fixed;z-index:120;width:62px;height:72px;object-fit:contain;display:none;pointer-events:none;filter:drop-shadow(0 8px 14px #000)}
@media(max-height:520px) and (orientation:landscape){#characterOverlay.acEarthPlacement{padding:4px!important}#characterOverlay.acEarthPlacement .characterPanel{height:calc(100% - 2px)!important;padding:7px!important;gap:8px!important;grid-template-columns:minmax(250px,.72fr) minmax(0,1.6fr)!important}#characterOverlay.acEarthPlacement .characterTitle{font-size:18px!important}#characterOverlay.acEarthPlacement .characterText{font-size:7px!important;margin:2px 0 4px!important}#characterOverlay.acEarthPlacement #characterRoster{gap:4px!important}#characterOverlay.acEarthPlacement #characterRoster .characterCard{grid-template-columns:66px minmax(0,1fr)!important;min-height:92px!important;flex-basis:92px!important;padding:5px!important}#characterOverlay.acEarthPlacement #characterRoster .characterCard img{width:64px!important;max-height:82px!important}.acEarthDesc{font-size:6px}.acEarthStats{gap:3px;margin-top:2px}.acStatLabel{font-size:5px}.acLockedWarrior{flex-basis:40px;min-height:40px;padding:4px 7px}#acEarthShipLabel{font-size:7px;margin-bottom:2px}#acEarthPlacementGrid{width:min(91%,500px);height:min(88%,355px);gap:4px}#acEarthDeployBtn{height:38px;margin-top:4px;font-size:11px}.acEarthHint{display:none}}
</style>`;

const INTERNAL_PATCH = `
// === AFTER CONTACT v0.32.16 COMPACT EARTH DEPLOYMENT ROSTER ===
const AC_EARTH_TEAM=Object.freeze([
 {id:'bombardier',name:'BOMBARDIER',weapon:'HEAVY ARTILLERY • HE-9 BARRAGE',desc:'Heavy explosive specialist. High durability and massive area damage.',stats:{acc:65,hp:85,dmg:80,aoe:100}},
 {id:'sniper',name:'SNIPER',weapon:'LONGSHOT SPECIALIST',desc:'Precision high-damage rounds with a small explosive impact radius.',stats:{acc:100,hp:60,dmg:100,aoe:20}},
 {id:'radio_man',name:'RADIO MAN',weapon:'TACTICAL COMMAND • COMBAT CONTROLLER',desc:'Battlefield intel, target marking and tactical support for allied warriors.',stats:{acc:80,hp:75,dmg:55,aoe:65}}
]);
const AC_EARTH_ROOM_NAMES=['1 • ARTILLERY BAY','2 • COMMAND CENTER','3 • WEAPONS LOCKER','4 • ENGINE ROOM','5 • CREW QUARTERS','6 • MED BAY','7 • SHIELD GENERATOR','8 • MAIN HALL','9 • AMMO STORAGE'];
const acEarthPlacement=[null,null,null];let acEarthDragIndex=null,acEarthDragPointer=null;
function acEarthArt(type){
 if(type==='bombardier')return '/bombardier.webp';
 const icon=type==='sniper'?'⌖':'⌁',label=type==='sniper'?'SNIPER':'RADIO';
 const feature=type==='sniper'?'<circle cx="160" cy="220" r="42" fill="none" stroke="#bde9ff" stroke-width="5"/><path d="M103 220h114M160 163v114" stroke="#e8f8ff" stroke-width="6"/>':'<path d="M105 165q55-60 110 0M123 188q37-39 74 0M144 210q16-16 32 0" fill="none" stroke="#bdeaff" stroke-width="7"/><rect x="120" y="230" width="80" height="55" rx="8" fill="#13283a" stroke="#7fdcff" stroke-width="4"/>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#15283b"/><stop offset="1" stop-color="#03070c"/></linearGradient></defs><rect width="320" height="420" fill="url(#g)"/><circle cx="160" cy="100" r="43" fill="#293e52" stroke="#83d9ff" stroke-width="5"/><path d="M98 300q13-130 62-130t62 130l26 66H72z" fill="#20364a" stroke="#6ccfff" stroke-width="5"/>'+feature+'<text x="160" y="350" text-anchor="middle" fill="#dff6ff" font-family="Arial" font-size="27" font-weight="900">'+icon+'</text><text x="160" y="391" text-anchor="middle" fill="#fff" font-family="Arial" font-size="19" font-weight="900">'+label+'</text></svg>';return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)
}
function acStatMarkup(stats){return [['ACC',stats.acc],['HP',stats.hp],['DMG',stats.dmg],['AOE',stats.aoe]].map(([k,v])=>'<div class="acStat"><div class="acStatLabel"><span>'+k+'</span><b>'+v+'</b></div><div class="acStatTrack"><div class="acStatFill" style="width:'+v+'%"></div></div></div>').join('')}
function acEarthPlacementOpen(){return selectedFaction==='earth'&&gameFlowPhase==='warrior'&&!characterOverlay.classList.contains('hidden')}
function acBuildEarthPlacement(){
 if(selectedFaction!=='earth')return false;characterOverlay.classList.add('acEarthPlacement');const panel=characterOverlay.querySelector('.characterPanel'),intro=panel?.querySelector('.characterIntro'),roster=document.getElementById('characterRoster');if(!panel||!intro||!roster)return false;
 const kicker=intro.querySelector('.characterKicker'),title=intro.querySelector('.characterTitle'),text=intro.querySelector('.characterText');if(kicker)kicker.textContent='EARTH FORTRESS • DEPLOYMENT';if(title)title.textContent='DEPLOY YOUR WARRIORS';if(text)text.textContent='Drag each warrior into a fortress compartment. Scroll the roster to see future locked warrior slots.';
 [...roster.querySelectorAll('.characterCard,.characterReserve,.acLockedWarrior')].forEach(n=>n.remove());
 AC_EARTH_TEAM.forEach((u,i)=>{const card=document.createElement('div');card.className='characterCard';card.dataset.acEarthIndex=String(i);card.innerHTML='<img src="'+acEarthArt(u.id)+'" alt="'+u.name+'"><div class="characterName">'+u.name+'</div><div class="characterWeapon">'+u.weapon+'</div><div class="acEarthDesc">'+u.desc+'</div><div class="acEarthStats">'+acStatMarkup(u.stats)+'</div>';card.addEventListener('pointerdown',e=>acEarthBeginDrag(e,i),{passive:false});roster.insertBefore(card,characterContinue)});
 for(let i=0;i<6;i++){const lock=document.createElement('div');lock.className='acLockedWarrior';lock.innerHTML='<div class="acLockedIcon">🔒</div><div><div class="acLockedTitle">LOCKED WARRIOR SLOT</div><div class="acLockedSub">FUTURE EARTH WARRIOR</div></div>';roster.insertBefore(lock,characterContinue)}
 let ship=document.getElementById('acEarthShipPanel');if(!ship){ship=document.createElement('section');ship.id='acEarthShipPanel';panel.appendChild(ship)}ship.innerHTML='<div id="acEarthShipLabel">FORTRESS INTERIOR • 0 / 3 PLACED</div><div id="acEarthShipShell"><div id="acEarthPlacementGrid">'+AC_EARTH_ROOM_NAMES.map((name,i)=>'<div class="acEarthPlaceSlot" data-index="'+i+'" data-label="'+name+'"></div>').join('')+'</div></div><button id="acEarthDeployBtn" type="button" disabled>PLACE WARRIOR</button><div class="acEarthHint">PLACE ALL 3 WARRIORS IN UNIQUE COMPARTMENTS • DRAG AGAIN TO REPOSITION</div>';ship.querySelector('#acEarthDeployBtn').addEventListener('pointerup',acEarthDeploy,{passive:false});
 let ghost=document.getElementById('acEarthDragGhost');if(!ghost){ghost=document.createElement('img');ghost.id='acEarthDragGhost';ghost.alt='';document.body.appendChild(ghost)}acEarthPlacement.fill(null);acEarthRefreshPlacement();diag('EARTH PLACEMENT','compact roster + six locked slots ready');return true
}
function acEarthRefreshPlacement(){if(!acEarthPlacementOpen())return;document.querySelectorAll('#characterRoster .characterCard').forEach(c=>{const i=Number(c.dataset.acEarthIndex);c.classList.toggle('placed',Number.isInteger(acEarthPlacement[i]))});document.querySelectorAll('.acEarthPlaceSlot').forEach(slot=>{const room=Number(slot.dataset.index),wi=acEarthPlacement.findIndex(x=>x===room);slot.innerHTML='';slot.classList.toggle('filled',wi>=0);if(wi>=0){const img=document.createElement('img');img.src=acEarthArt(AC_EARTH_TEAM[wi].id);img.alt=AC_EARTH_TEAM[wi].name;slot.appendChild(img)}});const placed=acEarthPlacement.filter(Number.isInteger).length,ready=placed===3&&new Set(acEarthPlacement).size===3,btn=document.getElementById('acEarthDeployBtn'),label=document.getElementById('acEarthShipLabel');if(label)label.textContent='FORTRESS INTERIOR • '+placed+' / 3 PLACED';if(btn){btn.disabled=!ready;btn.textContent=ready?'DEPLOY':'PLACE WARRIOR'}}
function acEarthBeginDrag(e,i){if(!acEarthPlacementOpen())return;e.preventDefault();e.stopPropagation();acEarthDragIndex=i;acEarthDragPointer=e.pointerId;const card=e.currentTarget;card.classList.add('dragging');const ghost=document.getElementById('acEarthDragGhost');ghost.src=acEarthArt(AC_EARTH_TEAM[i].id);ghost.style.display='block';ghost.style.left=(e.clientX-31)+'px';ghost.style.top=(e.clientY-36)+'px';try{card.setPointerCapture(e.pointerId)}catch{}}
function acEarthMoveDrag(e){if(acEarthDragIndex==null||e.pointerId!==acEarthDragPointer)return;e.preventDefault();const ghost=document.getElementById('acEarthDragGhost');ghost.style.left=(e.clientX-31)+'px';ghost.style.top=(e.clientY-36)+'px';const hit=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList?.contains('acEarthPlaceSlot'));document.querySelectorAll('.acEarthPlaceSlot').forEach(s=>s.classList.toggle('hover',s===hit))}
function acEarthEndDrag(e){if(acEarthDragIndex==null||e.pointerId!==acEarthDragPointer)return;e.preventDefault();const wi=acEarthDragIndex,hit=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList?.contains('acEarthPlaceSlot'));document.getElementById('acEarthDragGhost').style.display='none';document.querySelectorAll('.acEarthPlaceSlot').forEach(s=>s.classList.remove('hover'));document.querySelectorAll('#characterRoster .characterCard').forEach(c=>c.classList.remove('dragging'));if(hit){const room=Number(hit.dataset.index),other=acEarthPlacement.findIndex((r,j)=>j!==wi&&r===room);if(other<0)acEarthPlacement[wi]=room}acEarthDragIndex=null;acEarthDragPointer=null;acEarthRefreshPlacement()}
document.addEventListener('pointermove',acEarthMoveDrag,{passive:false,capture:true});document.addEventListener('pointerup',acEarthEndDrag,{passive:false,capture:true});document.addEventListener('pointercancel',acEarthEndDrag,{passive:false,capture:true});
const acOldRenderFactionRoster=renderFactionRoster;renderFactionRoster=function(){if(selectedFaction!=='earth'){characterOverlay.classList.remove('acEarthPlacement');document.getElementById('acEarthShipPanel')?.remove();return acOldRenderFactionRoster()}selectedWarriorType='bombardier';setTimeout(acBuildEarthPlacement,0);return true};
const acOldValidateFactionStarter=validateFactionStarter;validateFactionStarter=function(faction,warrior){if(faction==='earth')return warrior==='bombardier';return acOldValidateFactionStarter(faction,warrior)};
function acPrepEarthBattleTeam(){const warriors=localSide==='earth'?eWarriors:aWarriors;AC_EARTH_TEAM.forEach((u,i)=>{const w=warriors[i];if(!w)return;applyProfileToWarrior(w,'bombardier');w.weaponKey='bombardier';w.faction='earth';w.acEarthSpecialist=u.id;w.displayName=u.name;w.passive=false;if(w.nameText)w.nameText.textContent=u.name;const art=acEarthArt(u.id);if(w.sprite)textureLoader.load(art,t=>{w.sprite.material.map=t;w.sprite.material.needsUpdate=true},undefined,()=>{})})}
function acEarthDeploy(e){if(e)stopNative(e);if(!acEarthPlacement.every(Number.isInteger)||new Set(acEarthPlacement).size!==3)return;selectedWarriorType='bombardier';const saved=[...acEarthPlacement];continueToDeployment(e);deployment.length=3;for(let i=0;i<3;i++)deployment[i]=saved[i];acPrepEarthBattleTeam();updateDeployUI();diag('EARTH DEPLOY','3 warrior positions committed');setTimeout(()=>startBattle(e),40)}
function acSuppressLegacyXrayGlow(){for(const w of allWarriors||[]){if(w.xrayGlow){w.xrayGlow.visible=false;if(w.xrayGlow.material)w.xrayGlow.material.opacity=0}if(w.captainBeacon){w.captainBeacon.visible=false;if(w.captainBeacon.material)w.captainBeacon.material.opacity=0}}}
acSuppressLegacyXrayGlow();if(typeof refreshPrivateXrayVisuals==='function'){const f=refreshPrivateXrayVisuals;refreshPrivateXrayVisuals=function(...a){const r=f(...a);acSuppressLegacyXrayGlow();return r}}if(typeof updatePrivateXrayAnimation==='function'){const f=updatePrivateXrayAnimation;updatePrivateXrayAnimation=function(...a){const r=f(...a);acSuppressLegacyXrayGlow();return r}}
const acBuildBadge=document.querySelector('.lab');if(acBuildBadge)acBuildBadge.textContent='3D LAB • MOBILE PVP TEST • v0.32.16';diag('PATCH 0.32.16','COMPACT SCROLLABLE EARTH ROSTER + STATS + 6 LOCKED SLOTS');
`;

function patchIndexHtml(html) {
  let out = html;
  if (!out.includes('ac-v03216-earth-placement')) out = out.replace('</head>', `${PATCH_CSS}\n</head>`);
  if (!out.includes('PATCH 0.32.16')) {
    const close = out.lastIndexOf('</script>');
    if (close > 0) out = out.slice(0, close) + INTERNAL_PATCH + '\n' + out.slice(close);
  }
  out = out.replace('</body>', '<script src="/lifecycle-fix.js?v=20260827-5"></script>\n</body>');
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
