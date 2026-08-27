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
<style id="ac-v03217-earth-placement">
#characterOverlay.acEarthPlacement{padding:5px!important}
#characterOverlay.acEarthPlacement .characterPanel{display:grid!important;grid-template-columns:minmax(260px,.74fr) minmax(0,1.55fr)!important;grid-template-rows:1fr!important;width:min(1260px,99%)!important;height:min(690px,97%)!important;gap:8px!important;padding:8px!important;overflow:hidden!important}
#acEarthRosterPane{grid-column:1;display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}
#characterOverlay.acEarthPlacement .characterIntro{display:block!important;flex:0 0 auto!important;padding:2px 4px 5px!important;min-height:0!important;overflow:visible!important}
#characterOverlay.acEarthPlacement .characterKicker{font-size:7px!important;line-height:1!important;letter-spacing:.14em!important}
#characterOverlay.acEarthPlacement .characterTitle{font-size:clamp(17px,2.1vw,28px)!important;line-height:.92!important;margin:3px 0 0!important}
#characterOverlay.acEarthPlacement .characterText{font-size:7px!important;line-height:1.22!important;margin:5px 0 0!important;max-width:34ch!important}
#characterOverlay.acEarthPlacement #characterRoster{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;gap:4px!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding:1px 3px 3px 1px!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard{display:grid!important;grid-template-columns:62px minmax(0,1fr)!important;grid-template-rows:auto auto 1fr auto!important;column-gap:6px!important;flex:0 0 88px!important;min-height:88px!important;max-height:88px!important;padding:5px!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(27,70,101,.17),rgba(2,8,15,.94))!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard[data-ac-earth-index="0"]{border-color:rgba(242,176,57,.7)!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard[data-ac-earth-index="1"]{border-color:rgba(65,181,255,.7)!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard[data-ac-earth-index="2"]{border-color:rgba(139,222,80,.7)!important}
#characterOverlay.acEarthPlacement #characterRoster .characterCard img{grid-column:1;grid-row:1/5;width:60px!important;height:78px!important;object-fit:contain!important;filter:none!important;align-self:center!important}
#characterOverlay.acEarthPlacement #characterRoster .characterName{grid-column:2;grid-row:1;font-size:9px!important;line-height:1!important;text-align:left!important;padding:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#characterOverlay.acEarthPlacement #characterRoster .characterWeapon{grid-column:2;grid-row:2;font-size:5.7px!important;line-height:1.1!important;margin:2px 0 0!important;text-align:left!important;color:#8fdcff!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.acEarthDesc{grid-column:2;grid-row:3;font-size:5.7px;line-height:1.18;opacity:.68;margin-top:2px;overflow:hidden}
.acEarthStats{grid-column:2;grid-row:4;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;margin-top:2px}
.acStatLabel{font-size:5px;font-weight:1000;display:flex;justify-content:space-between;gap:1px;opacity:.75}.acStatTrack{height:3px;margin-top:1px;border-radius:999px;background:rgba(255,255,255,.11);overflow:hidden}.acStatFill{height:100%;background:linear-gradient(90deg,#3d96c8,#c4efff)}
.acLockedWarrior{display:grid;grid-template-columns:28px 1fr;align-items:center;gap:6px;flex:0 0 38px;min-height:38px;border:1px dashed rgba(255,255,255,.16);border-radius:8px;background:rgba(255,255,255,.025);padding:4px 7px;opacity:.4}.acLockedIcon{font-size:15px;text-align:center}.acLockedTitle{font-size:6.5px;font-weight:1000;letter-spacing:.08em}.acLockedSub{font-size:5.5px;opacity:.6;margin-top:1px}
#characterOverlay.acEarthPlacement #characterContinue{display:none!important}
#acEarthShipPanel{grid-column:2;display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}
#acEarthShipLabel{text-align:center;font-size:8px;font-weight:1000;letter-spacing:.13em;color:#65d0ff;margin:1px 0 4px}
#acEarthShipShell{position:relative;flex:1 1 auto;min-height:0;display:grid;place-items:center;border:1px solid rgba(94,187,236,.26);border-radius:16px;background:radial-gradient(ellipse at center,rgba(37,102,142,.16),rgba(2,8,14,.98) 72%);overflow:hidden}
#acEarthShipShell:before{content:"";position:absolute;inset:3%;border:7px solid rgba(76,132,169,.38);border-radius:21% 21% 16% 16%;box-shadow:inset 0 0 22px rgba(51,153,209,.1);pointer-events:none}
#acEarthPlacementGrid{position:relative;z-index:2;width:min(92%,620px);height:min(90%,470px);display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:5px}
.acEarthPlaceSlot{position:relative;display:grid;place-items:center;border:2px solid rgba(83,164,209,.5);border-radius:7px;background:linear-gradient(180deg,rgba(9,25,39,.98),rgba(1,7,13,.99));box-shadow:inset 0 0 18px rgba(0,0,0,.82);overflow:hidden}
.acEarthPlaceSlot:before{content:"+";font-size:22px;color:rgba(220,245,255,.46);position:absolute}.acEarthPlaceSlot:after{content:attr(data-label);position:absolute;left:4px;top:3px;font-size:5.5px;font-weight:1000;opacity:.42}.acEarthPlaceSlot.hover{border-color:#7fffc2!important}.acEarthPlaceSlot.filled{border-color:rgba(121,240,172,.82)!important}.acEarthPlaceSlot.filled:before{display:none}.acEarthPlaceSlot img{width:88%;height:88%;object-fit:contain;pointer-events:none;z-index:2}
#acEarthDeployBtn{flex:0 0 40px;height:40px;margin-top:5px;border:0;border-radius:10px;background:linear-gradient(180deg,#b68030,#704a17);color:#fff;font-size:11px;font-weight:1000;letter-spacing:.12em;touch-action:manipulation}
#acEarthDeployBtn:disabled{opacity:.38}.acEarthHint{text-align:center;font-size:6px;opacity:.5;margin-top:3px}
#acEarthDragGhost{position:fixed;z-index:140;width:58px;height:68px;object-fit:contain;display:none;pointer-events:none;filter:drop-shadow(0 8px 14px #000)}
@media(max-width:700px) and (orientation:portrait){#characterOverlay.acEarthPlacement{overflow:auto!important;padding:4px!important}#characterOverlay.acEarthPlacement .characterPanel{display:flex!important;flex-direction:column!important;width:96%!important;height:auto!important;min-height:calc(100% - 4px)!important;overflow:visible!important}#acEarthRosterPane{height:520px;flex:0 0 520px}#characterOverlay.acEarthPlacement #characterRoster .characterCard{flex-basis:96px!important;min-height:96px!important;max-height:96px!important}#acEarthShipPanel{flex:0 0 430px;min-height:430px;margin-top:6px}#acEarthPlacementGrid{width:92%;height:310px}#acEarthDeployBtn{height:48px;flex-basis:48px}}
@media(max-height:520px) and (orientation:landscape){#characterOverlay.acEarthPlacement .characterPanel{grid-template-columns:minmax(238px,.68fr) minmax(0,1.6fr)!important;height:calc(100% - 2px)!important;padding:5px!important;gap:6px!important}#characterOverlay.acEarthPlacement .characterTitle{font-size:16px!important}#characterOverlay.acEarthPlacement .characterText{font-size:6px!important;margin-top:3px!important}#characterOverlay.acEarthPlacement #characterRoster .characterCard{grid-template-columns:54px minmax(0,1fr)!important;flex-basis:76px!important;min-height:76px!important;max-height:76px!important;padding:4px!important}#characterOverlay.acEarthPlacement #characterRoster .characterCard img{width:52px!important;height:68px!important}.acEarthDesc{font-size:5px}.acLockedWarrior{flex-basis:32px;min-height:32px}#acEarthPlacementGrid{height:min(88%,330px);gap:4px}#acEarthDeployBtn{height:34px;flex-basis:34px;margin-top:3px;font-size:10px}.acEarthHint{display:none}}
</style>`;

const INTERNAL_PATCH = `
// === AFTER CONTACT v0.32.17 LAYOUT REPAIR ===
const AC_EARTH_TEAM=Object.freeze([
 {id:'bombardier',name:'BOMBARDIER',weapon:'HEAVY ARTILLERY • HE-9 BARRAGE',desc:'Heavy explosive specialist. High durability and massive area damage.',stats:{acc:65,hp:85,dmg:80,aoe:100}},
 {id:'sniper',name:'SNIPER',weapon:'LONGSHOT SPECIALIST',desc:'Precision high-damage rounds with a small explosive impact radius.',stats:{acc:100,hp:60,dmg:100,aoe:20}},
 {id:'radio_man',name:'RADIO MAN',weapon:'TACTICAL COMMAND • COMBAT CONTROLLER',desc:'Battlefield intel, target marking and tactical support for allied warriors.',stats:{acc:80,hp:75,dmg:55,aoe:65}}
]);
const AC_EARTH_ROOM_NAMES=['1 • ARTILLERY','2 • COMMAND','3 • WEAPONS','4 • ENGINE','5 • CREW','6 • MED BAY','7 • SHIELD','8 • MAIN HALL','9 • AMMO'];
const acEarthPlacement=[null,null,null];let acEarthDragIndex=null,acEarthDragPointer=null;
function acEarthArt(type){if(type==='bombardier')return '/bombardier.webp';const icon=type==='sniper'?'⌖':'⌁',label=type==='sniper'?'SNIPER':'RADIO',feature=type==='sniper'?'<circle cx="160" cy="220" r="42" fill="none" stroke="#bde9ff" stroke-width="5"/><path d="M103 220h114M160 163v114" stroke="#e8f8ff" stroke-width="6"/>':'<path d="M105 165q55-60 110 0M123 188q37-39 74 0M144 210q16-16 32 0" fill="none" stroke="#bdeaff" stroke-width="7"/><rect x="120" y="230" width="80" height="55" rx="8" fill="#13283a" stroke="#7fdcff" stroke-width="4"/>';const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#15283b"/><stop offset="1" stop-color="#03070c"/></linearGradient></defs><rect width="320" height="420" fill="url(#g)"/><circle cx="160" cy="100" r="43" fill="#293e52" stroke="#83d9ff" stroke-width="5"/><path d="M98 300q13-130 62-130t62 130l26 66H72z" fill="#20364a" stroke="#6ccfff" stroke-width="5"/>'+feature+'<text x="160" y="350" text-anchor="middle" fill="#dff6ff" font-family="Arial" font-size="27" font-weight="900">'+icon+'</text><text x="160" y="391" text-anchor="middle" fill="#fff" font-family="Arial" font-size="19" font-weight="900">'+label+'</text></svg>';return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
function acStatMarkup(s){return [['ACC',s.acc],['HP',s.hp],['DMG',s.dmg],['AOE',s.aoe]].map(([k,v])=>'<div class="acStat"><div class="acStatLabel"><span>'+k+'</span><b>'+v+'</b></div><div class="acStatTrack"><div class="acStatFill" style="width:'+v+'%"></div></div></div>').join('')}
function acEarthPlacementOpen(){return selectedFaction==='earth'&&gameFlowPhase==='warrior'&&!characterOverlay.classList.contains('hidden')}
function acBuildEarthPlacement(){
 if(selectedFaction!=='earth')return false;characterOverlay.classList.add('acEarthPlacement');
 const panel=characterOverlay.querySelector('.characterPanel'),intro=panel?.querySelector('.characterIntro'),roster=document.getElementById('characterRoster');if(!panel||!intro||!roster)return false;
 let pane=document.getElementById('acEarthRosterPane');if(!pane){pane=document.createElement('section');pane.id='acEarthRosterPane';panel.insertBefore(pane,panel.firstChild);pane.appendChild(intro);pane.appendChild(roster)}
 const kicker=intro.querySelector('.characterKicker'),title=intro.querySelector('.characterTitle'),text=intro.querySelector('.characterText');if(kicker)kicker.textContent='EARTH FORTRESS • DEPLOYMENT';if(title)title.textContent='DEPLOY YOUR WARRIORS';if(text)text.textContent='Drag each warrior into a fortress compartment. Scroll down for future locked warriors.';
 [...roster.querySelectorAll('.characterCard,.characterReserve,.acLockedWarrior')].forEach(n=>n.remove());
 AC_EARTH_TEAM.forEach((u,i)=>{const card=document.createElement('div');card.className='characterCard';card.dataset.acEarthIndex=String(i);card.innerHTML='<img src="'+acEarthArt(u.id)+'" alt="'+u.name+'"><div class="characterName">'+u.name+'</div><div class="characterWeapon">'+u.weapon+'</div><div class="acEarthDesc">'+u.desc+'</div><div class="acEarthStats">'+acStatMarkup(u.stats)+'</div>';card.addEventListener('pointerdown',e=>acEarthBeginDrag(e,i),{passive:false});roster.insertBefore(card,characterContinue)});
 for(let i=0;i<6;i++){const lock=document.createElement('div');lock.className='acLockedWarrior';lock.innerHTML='<div class="acLockedIcon">🔒</div><div><div class="acLockedTitle">LOCKED WARRIOR SLOT</div><div class="acLockedSub">FUTURE EARTH WARRIOR</div></div>';roster.insertBefore(lock,characterContinue)}
 let ship=document.getElementById('acEarthShipPanel');if(!ship){ship=document.createElement('section');ship.id='acEarthShipPanel';panel.appendChild(ship)}ship.innerHTML='<div id="acEarthShipLabel">FORTRESS INTERIOR • 0 / 3 PLACED</div><div id="acEarthShipShell"><div id="acEarthPlacementGrid">'+AC_EARTH_ROOM_NAMES.map((n,i)=>'<div class="acEarthPlaceSlot" data-index="'+i+'" data-label="'+n+'"></div>').join('')+'</div></div><button id="acEarthDeployBtn" type="button" disabled>PLACE WARRIOR</button><div class="acEarthHint">PLACE ALL 3 WARRIORS IN UNIQUE COMPARTMENTS • DRAG AGAIN TO REPOSITION</div>';ship.querySelector('#acEarthDeployBtn').addEventListener('pointerup',acEarthDeploy,{passive:false});
 let ghost=document.getElementById('acEarthDragGhost');if(!ghost){ghost=document.createElement('img');ghost.id='acEarthDragGhost';ghost.alt='';document.body.appendChild(ghost)}acEarthPlacement.fill(null);acEarthRefreshPlacement();diag('EARTH PLACEMENT','v0.32.17 two-column layout repaired');return true
}
function acEarthRefreshPlacement(){if(!acEarthPlacementOpen())return;document.querySelectorAll('#characterRoster .characterCard').forEach(c=>{const i=Number(c.dataset.acEarthIndex);c.classList.toggle('placed',Number.isInteger(acEarthPlacement[i]))});document.querySelectorAll('.acEarthPlaceSlot').forEach(slot=>{const room=Number(slot.dataset.index),wi=acEarthPlacement.findIndex(x=>x===room);slot.innerHTML='';slot.classList.toggle('filled',wi>=0);if(wi>=0){const img=document.createElement('img');img.src=acEarthArt(AC_EARTH_TEAM[wi].id);img.alt=AC_EARTH_TEAM[wi].name;slot.appendChild(img)}});const placed=acEarthPlacement.filter(Number.isInteger).length,ready=placed===3&&new Set(acEarthPlacement).size===3,btn=document.getElementById('acEarthDeployBtn'),label=document.getElementById('acEarthShipLabel');if(label)label.textContent='FORTRESS INTERIOR • '+placed+' / 3 PLACED';if(btn){btn.disabled=!ready;btn.textContent=ready?'DEPLOY':'PLACE WARRIOR'}}
function acEarthBeginDrag(e,i){if(!acEarthPlacementOpen())return;e.preventDefault();e.stopPropagation();acEarthDragIndex=i;acEarthDragPointer=e.pointerId;e.currentTarget.classList.add('dragging');const g=document.getElementById('acEarthDragGhost');g.src=acEarthArt(AC_EARTH_TEAM[i].id);g.style.display='block';g.style.left=(e.clientX-29)+'px';g.style.top=(e.clientY-34)+'px'}
function acEarthMoveDrag(e){if(acEarthDragIndex==null||e.pointerId!==acEarthDragPointer)return;e.preventDefault();const g=document.getElementById('acEarthDragGhost');g.style.left=(e.clientX-29)+'px';g.style.top=(e.clientY-34)+'px';const hit=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList?.contains('acEarthPlaceSlot'));document.querySelectorAll('.acEarthPlaceSlot').forEach(s=>s.classList.toggle('hover',s===hit))}
function acEarthEndDrag(e){if(acEarthDragIndex==null||e.pointerId!==acEarthDragPointer)return;e.preventDefault();const wi=acEarthDragIndex,hit=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList?.contains('acEarthPlaceSlot'));document.getElementById('acEarthDragGhost').style.display='none';document.querySelectorAll('.acEarthPlaceSlot').forEach(s=>s.classList.remove('hover'));document.querySelectorAll('#characterRoster .characterCard').forEach(c=>c.classList.remove('dragging'));if(hit){const room=Number(hit.dataset.index),other=acEarthPlacement.findIndex((r,j)=>j!==wi&&r===room);if(other<0)acEarthPlacement[wi]=room}acEarthDragIndex=null;acEarthDragPointer=null;acEarthRefreshPlacement()}
document.addEventListener('pointermove',acEarthMoveDrag,{passive:false,capture:true});document.addEventListener('pointerup',acEarthEndDrag,{passive:false,capture:true});document.addEventListener('pointercancel',acEarthEndDrag,{passive:false,capture:true});
const acOldRenderFactionRoster=renderFactionRoster;renderFactionRoster=function(){if(selectedFaction!=='earth'){characterOverlay.classList.remove('acEarthPlacement');document.getElementById('acEarthShipPanel')?.remove();return acOldRenderFactionRoster()}selectedWarriorType='bombardier';setTimeout(acBuildEarthPlacement,0);return true};
const acOldValidateFactionStarter=validateFactionStarter;validateFactionStarter=function(f,w){if(f==='earth')return w==='bombardier';return acOldValidateFactionStarter(f,w)};
function acPrepEarthBattleTeam(){const warriors=localSide==='earth'?eWarriors:aWarriors;AC_EARTH_TEAM.forEach((u,i)=>{const w=warriors[i];if(!w)return;applyProfileToWarrior(w,'bombardier');w.weaponKey='bombardier';w.faction='earth';w.acEarthSpecialist=u.id;w.displayName=u.name;w.passive=false;if(w.nameText)w.nameText.textContent=u.name;const art=acEarthArt(u.id);if(w.sprite)textureLoader.load(art,t=>{w.sprite.material.map=t;w.sprite.material.needsUpdate=true},undefined,()=>{})})}
function acEarthDeploy(e){if(e)stopNative(e);if(!acEarthPlacement.every(Number.isInteger)||new Set(acEarthPlacement).size!==3)return;selectedWarriorType='bombardier';const saved=[...acEarthPlacement];continueToDeployment(e);deployment.length=3;for(let i=0;i<3;i++)deployment[i]=saved[i];acPrepEarthBattleTeam();updateDeployUI();diag('EARTH DEPLOY','3 warrior positions committed');setTimeout(()=>startBattle(e),40)}
function acSuppressLegacyXrayGlow(){for(const w of allWarriors||[]){if(w.xrayGlow){w.xrayGlow.visible=false;if(w.xrayGlow.material)w.xrayGlow.material.opacity=0}if(w.captainBeacon){w.captainBeacon.visible=false;if(w.captainBeacon.material)w.captainBeacon.material.opacity=0}}}
acSuppressLegacyXrayGlow();if(typeof refreshPrivateXrayVisuals==='function'){const f=refreshPrivateXrayVisuals;refreshPrivateXrayVisuals=function(...a){const r=f(...a);acSuppressLegacyXrayGlow();return r}}if(typeof updatePrivateXrayAnimation==='function'){const f=updatePrivateXrayAnimation;updatePrivateXrayAnimation=function(...a){const r=f(...a);acSuppressLegacyXrayGlow();return r}}
const acBuildBadge=document.querySelector('.lab');if(acBuildBadge)acBuildBadge.textContent='3D LAB • MOBILE PVP TEST • v0.32.17';diag('PATCH 0.32.17','EARTH DEPLOYMENT TWO-COLUMN LAYOUT REPAIRED');
`;

function patchIndexHtml(html) {
  let out = html;
  if (!out.includes('ac-v03217-earth-placement')) out = out.replace('</head>', `${PATCH_CSS}\n</head>`);
  if (!out.includes('PATCH 0.32.17')) {
    const close = out.lastIndexOf('</script>');
    if (close > 0) out = out.slice(0, close) + INTERNAL_PATCH + '\n' + out.slice(close);
  }
  out = out.replace('</body>', '<script src="/lifecycle-fix.js?v=20260827-6"></script>\n</body>');
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
