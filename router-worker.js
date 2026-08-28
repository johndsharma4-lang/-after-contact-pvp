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
<style id="ac-v0330-earth-deployment">
#acLandscapeGate{position:fixed;inset:0;z-index:1000000;display:none;align-items:center;justify-content:center;background:#020911;color:#fff;text-align:center;padding:24px}
#acLandscapeGate .gateCard{width:min(390px,88vw);padding:25px 20px;border:1px solid rgba(96,201,255,.4);border-radius:22px;background:#07131f;box-shadow:0 22px 70px #000}
#acLandscapeGate .phone{font-size:56px;transform:rotate(90deg);display:inline-block}.gateTitle{font-size:23px;font-weight:1000;margin-top:8px;letter-spacing:.04em}.gateSub{font-size:13px;opacity:.68;margin-top:8px;line-height:1.35}
@media(orientation:portrait){#acLandscapeGate{display:flex!important}body{overflow:hidden!important}}
#characterOverlay.acEarthDeployMode{padding:4px!important;overflow:hidden!important}
#characterOverlay.acEarthDeployMode>.characterPanel{display:none!important}
#acEarthDeployRoot{position:absolute;inset:5px;display:grid;grid-template-columns:minmax(255px,34%) minmax(0,66%);gap:8px;padding:8px;border:1px solid rgba(217,168,56,.35);border-radius:18px;background:#020b14;overflow:hidden;color:#fff;font-family:inherit}
#acEarthRosterPane{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}
#acEarthHeader{flex:0 0 auto;padding:2px 4px 5px}
#acEarthHeader .eyebrow{font-size:7px;font-weight:1000;letter-spacing:.17em;color:#edc459}
#acEarthHeader h2{font-size:20px;line-height:.95;margin:3px 0 4px;font-weight:1000;letter-spacing:.01em}
#acEarthHeader p{font-size:6.5px;line-height:1.2;opacity:.68;margin:0;max-width:38ch}
#acEarthRoster{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;display:flex;flex-direction:column;gap:5px;padding:1px 4px 5px 0}
.acUnitCard{position:relative;flex:0 0 92px;min-height:92px;display:grid;grid-template-columns:72px minmax(0,1fr);grid-template-rows:auto auto 1fr auto;column-gap:7px;padding:6px;border:1px solid rgba(90,175,225,.34);border-radius:12px;background:linear-gradient(180deg,rgba(23,65,94,.18),rgba(2,8,14,.96));overflow:hidden}
.acUnitCard[data-unit="bombardier"]{border-color:rgba(231,172,53,.62)}.acUnitCard[data-unit="sniper"]{border-color:rgba(60,184,255,.62)}.acUnitCard[data-unit="radio_man"]{border-color:rgba(124,218,79,.62)}
.acUnitCard.placed{opacity:.6}.acUnitArt{grid-column:1;grid-row:1/5;width:68px;height:80px;align-self:center;object-fit:contain;touch-action:none;user-select:none;-webkit-user-drag:none;cursor:grab;border-radius:8px}.acUnitArt:active{cursor:grabbing}
.acUnitName{grid-column:2;grid-row:1;font-size:10px;font-weight:1000;line-height:1}.acUnitWeapon{grid-column:2;grid-row:2;font-size:5.7px;color:#8bdcff;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.acUnitDesc{grid-column:2;grid-row:3;font-size:5.8px;line-height:1.18;opacity:.67;margin-top:3px}.acStats{grid-column:2;grid-row:4;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px}.acStat label{display:flex;justify-content:space-between;font-size:4.8px;font-weight:900;opacity:.78}.acTrack{height:3px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;margin-top:1px}.acFill{height:100%;background:linear-gradient(90deg,#42a3d5,#c9f1ff)}
.acLocked{flex:0 0 38px;display:grid;grid-template-columns:28px 1fr;gap:7px;align-items:center;padding:5px 8px;border:1px dashed rgba(255,255,255,.15);border-radius:9px;opacity:.38;background:rgba(255,255,255,.02)}.acLocked .lock{font-size:15px;text-align:center}.acLocked strong{display:block;font-size:6.5px;letter-spacing:.08em}.acLocked span{font-size:5.3px;opacity:.6}
#acEarthFortressPane{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}
#acEarthFortressTitle{flex:0 0 auto;text-align:center;font-size:8px;font-weight:1000;letter-spacing:.15em;color:#64d5ff;margin:1px 0 4px}
#acEarthFortress{position:relative;flex:1 1 auto;min-height:0;padding:10px 13px;display:grid;place-items:center;border:1px solid rgba(93,191,239,.24);border-radius:18px;background:radial-gradient(ellipse at center,rgba(35,106,148,.18),rgba(1,7,12,.98) 73%);overflow:hidden}
#acEarthFortress:before{content:"";position:absolute;inset:4%;border:8px solid rgba(72,132,168,.32);border-radius:22% 22% 17% 17%;pointer-events:none;box-shadow:inset 0 0 28px rgba(58,157,213,.1)}
#acEarthRooms{position:relative;z-index:2;width:96%;height:96%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:5px}
.acRoom{position:relative;display:grid;place-items:center;border:2px solid rgba(78,160,205,.55);border-radius:9px;background:linear-gradient(180deg,rgba(8,24,38,.98),rgba(1,7,13,.99));overflow:hidden;box-shadow:inset 0 0 17px rgba(0,0,0,.8)}.acRoom.over{border-color:#79ffc0;box-shadow:0 0 13px rgba(121,255,192,.24),inset 0 0 16px rgba(121,255,192,.08)}.acRoom.filled{border-color:rgba(117,239,171,.82)}
.acRoomNum{position:absolute;left:5px;top:4px;font-size:5px;font-weight:1000;opacity:.45}.acRoomName{position:absolute;right:5px;bottom:4px;font-size:5px;font-weight:1000;letter-spacing:.05em;opacity:.72}.acRoomPlus{font-size:22px;opacity:.42}.acPlacedArt{width:62%;height:72%;object-fit:contain;pointer-events:none}.acPlacedName{position:absolute;left:5px;bottom:4px;font-size:5px;font-weight:1000;color:#8fffd0;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#acEarthDeployBtn{flex:0 0 38px;height:38px;margin-top:5px;border:0;border-radius:11px;background:linear-gradient(180deg,#b68231,#704b18);color:#fff;font-size:11px;font-weight:1000;letter-spacing:.13em;opacity:.38}.ready#acEarthDeployBtn{opacity:1;background:linear-gradient(180deg,#37baff,#137acb)}
#acEarthDeployHint{flex:0 0 auto;text-align:center;font-size:5.2px;opacity:.52;margin-top:2px}
#acEarthGhost{position:fixed;z-index:100001;width:66px;height:78px;object-fit:contain;pointer-events:none;display:none;filter:drop-shadow(0 8px 15px #000)}
@media(max-height:450px) and (orientation:landscape){#acEarthDeployRoot{grid-template-columns:minmax(225px,32%) minmax(0,68%);padding:5px;gap:6px}#acEarthHeader h2{font-size:16px}#acEarthHeader p{display:none}.acUnitCard{flex-basis:74px;min-height:74px;grid-template-columns:57px minmax(0,1fr);padding:4px}.acUnitArt{width:54px;height:65px}.acUnitName{font-size:8px}.acUnitWeapon,.acUnitDesc{font-size:4.8px}.acStat label{font-size:4px}.acLocked{flex-basis:30px;padding:3px 6px}#acEarthDeployBtn{height:31px;flex-basis:31px;margin-top:3px}#acEarthDeployHint{display:none}}
</style>`;

const INTERNAL_PATCH = `
// === AFTER CONTACT v0.33.0 AUTHORITATIVE EARTH DEPLOYMENT CONTROLLER ===
const AC_DEPLOY_VERSION='0.33.0';
const AC_EARTH_UNITS=Object.freeze([
 {id:'bombardier',name:'BOMBARDIER',weapon:'HEAVY ARTILLERY • HE-9 BARRAGE',desc:'Heavy explosive specialist. High durability and massive area damage.',stats:{acc:65,hp:85,dmg:80,aoe:100}},
 {id:'sniper',name:'SNIPER',weapon:'LONGSHOT SPECIALIST',desc:'Precision high-damage rounds with a small explosive impact radius.',stats:{acc:100,hp:60,dmg:100,aoe:20}},
 {id:'radio_man',name:'RADIO MAN',weapon:'TACTICAL COMMAND • COMBAT CONTROLLER',desc:'Battlefield intel, target marking and tactical support for allied warriors.',stats:{acc:80,hp:75,dmg:55,aoe:65}}
]);
const AC_ROOM_NAMES=['ARTILLERY','COMMAND','WEAPONS','ENGINE','CREW','MED BAY','SHIELD','MAIN HALL','AMMO'];
const acDeployState={phase:'idle',placements:{bombardier:null,sniper:null,radio_man:null},drag:null};
window.__AC_DEPLOYMENT_STATE=acDeployState;
function acUnitArt(id){if(id==='bombardier')return '/bombardier.webp';const sniper=id==='sniper',label=sniper?'SNIPER':'RADIO',feature=sniper?'<circle cx="160" cy="220" r="42" fill="none" stroke="#bde9ff" stroke-width="5"/><path d="M103 220h114M160 163v114" stroke="#e8f8ff" stroke-width="6"/>':'<path d="M105 165q55-60 110 0M123 188q37-39 74 0M144 210q16-16 32 0" fill="none" stroke="#bdeaff" stroke-width="7"/><rect x="120" y="230" width="80" height="55" rx="8" fill="#13283a" stroke="#7fdcff" stroke-width="4"/>';const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420"><defs><linearGradient id="g"><stop stop-color="#15283b"/><stop offset="1" stop-color="#03070c"/></linearGradient></defs><rect width="320" height="420" fill="url(#g)"/><circle cx="160" cy="100" r="43" fill="#293e52" stroke="#83d9ff" stroke-width="5"/><path d="M98 300q13-130 62-130t62 130l26 66H72z" fill="#20364a" stroke="#6ccfff" stroke-width="5"/>'+feature+'<text x="160" y="391" text-anchor="middle" fill="#fff" font-family="Arial" font-size="19" font-weight="900">'+label+'</text></svg>';return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
function acStats(s){return [['ACC',s.acc],['HP',s.hp],['DMG',s.dmg],['AOE',s.aoe]].map(([k,v])=>'<div class="acStat"><label><span>'+k+'</span><b>'+v+'</b></label><div class="acTrack"><div class="acFill" style="width:'+v+'%"></div></div></div>').join('')}
function acEnsureLandscapeGate(){let g=document.getElementById('acLandscapeGate');if(g)return;g=document.createElement('div');g.id='acLandscapeGate';g.innerHTML='<div class="gateCard"><div class="phone">📱</div><div class="gateTitle">TURN PHONE SIDEWAYS</div><div class="gateSub">After Contact is built for landscape play. Rotate your phone to continue.</div></div>';document.body.appendChild(g)}
acEnsureLandscapeGate();
function acBuildRoot(){
 characterOverlay.classList.add('acEarthDeployMode');
 let root=document.getElementById('acEarthDeployRoot');if(root)root.remove();
 root=document.createElement('div');root.id='acEarthDeployRoot';
 const cards=AC_EARTH_UNITS.map(u=>'<article class="acUnitCard" data-unit="'+u.id+'"><img class="acUnitArt" data-drag-unit="'+u.id+'" src="'+acUnitArt(u.id)+'" alt="'+u.name+'"><div class="acUnitName">'+u.name+'</div><div class="acUnitWeapon">'+u.weapon+'</div><div class="acUnitDesc">'+u.desc+'</div><div class="acStats">'+acStats(u.stats)+'</div></article>').join('');
 const locks=Array.from({length:6},()=>'<div class="acLocked"><div class="lock">🔒</div><div><strong>LOCKED WARRIOR SLOT</strong><span>FUTURE EARTH WARRIOR</span></div></div>').join('');
 const rooms=AC_ROOM_NAMES.map((n,i)=>'<div class="acRoom" data-room="'+i+'"><span class="acRoomNum">'+(i+1)+'</span><span class="acRoomPlus">+</span><span class="acRoomName">'+n+'</span></div>').join('');
 root.innerHTML='<section id="acEarthRosterPane"><header id="acEarthHeader"><div class="eyebrow">EARTH FORTRESS • DEPLOYMENT</div><h2>DEPLOY YOUR WARRIORS</h2><p>Swipe the roster normally. Drag a warrior image into any fortress room. All three warriors must be placed before deployment.</p></header><div id="acEarthRoster">'+cards+locks+'</div></section><section id="acEarthFortressPane"><div id="acEarthFortressTitle"></div><div id="acEarthFortress"><div id="acEarthRooms">'+rooms+'</div></div><button id="acEarthDeployBtn" type="button">PLACE WARRIOR</button><div id="acEarthDeployHint">DRAG WARRIOR IMAGE • DROP INTO ROOM • DRAG AGAIN TO REPOSITION</div></section>';
 characterOverlay.appendChild(root);
 let ghost=document.getElementById('acEarthGhost');if(!ghost){ghost=document.createElement('img');ghost.id='acEarthGhost';document.body.appendChild(ghost)}
 root.querySelector('#acEarthDeployBtn').addEventListener('click',acCommitDeployment);
 root.querySelectorAll('[data-drag-unit]').forEach(img=>{img.addEventListener('pointerdown',acPointerStart,{passive:false});img.addEventListener('touchstart',acTouchStart,{passive:false})});
 acDeployState.phase='placement';acRenderDeployment();diag('EARTH DEPLOYMENT','v0.33.0 authoritative placement controller ready');
}
function acPlacementEntries(){return Object.entries(acDeployState.placements)}
function acReady(){const vals=Object.values(acDeployState.placements);return vals.every(Number.isInteger)&&new Set(vals).size===3}
function acRenderDeployment(){
 const root=document.getElementById('acEarthDeployRoot');if(!root)return;const placed=Object.values(acDeployState.placements).filter(Number.isInteger).length;
 const title=root.querySelector('#acEarthFortressTitle');if(title)title.textContent='FORTRESS INTERIOR • '+placed+' / 3 PLACED';
 root.querySelectorAll('.acUnitCard').forEach(c=>c.classList.toggle('placed',Number.isInteger(acDeployState.placements[c.dataset.unit])));
 root.querySelectorAll('.acRoom').forEach(room=>{const idx=Number(room.dataset.room),entry=acPlacementEntries().find(([,r])=>r===idx);room.classList.toggle('filled',!!entry);room.querySelectorAll('.acPlacedArt,.acPlacedName').forEach(n=>n.remove());const plus=room.querySelector('.acRoomPlus');if(plus)plus.style.display=entry?'none':'';if(entry){const u=AC_EARTH_UNITS.find(x=>x.id===entry[0]);const img=document.createElement('img');img.className='acPlacedArt';img.src=acUnitArt(u.id);img.alt=u.name;const nm=document.createElement('span');nm.className='acPlacedName';nm.textContent=u.name;room.append(img,nm)}});
 const btn=root.querySelector('#acEarthDeployBtn');const ready=acReady();btn.classList.toggle('ready',ready);btn.textContent=ready?'DEPLOY':'PLACE WARRIOR';btn.disabled=!ready;
}
function acBegin(unit,x,y,pointerId,kind){if(!AC_EARTH_UNITS.some(u=>u.id===unit))return;acDeployState.drag={unit,pointerId,kind,x,y};const g=document.getElementById('acEarthGhost');g.src=acUnitArt(unit);g.style.display='block';acMoveGhost(x,y)}
function acMoveGhost(x,y){const g=document.getElementById('acEarthGhost');g.style.left=(x-33)+'px';g.style.top=(y-39)+'px';const hit=document.elementFromPoint(x,y)?.closest?.('.acRoom');document.querySelectorAll('.acRoom').forEach(r=>r.classList.toggle('over',r===hit))}
function acDrop(x,y){const d=acDeployState.drag;if(!d)return;const hit=document.elementFromPoint(x,y)?.closest?.('.acRoom');if(hit){const room=Number(hit.dataset.room);const occupied=acPlacementEntries().find(([id,r])=>id!==d.unit&&r===room);if(!occupied)acDeployState.placements[d.unit]=room}acDeployState.drag=null;document.getElementById('acEarthGhost').style.display='none';document.querySelectorAll('.acRoom').forEach(r=>r.classList.remove('over'));acRenderDeployment()}
function acPointerStart(e){if(e.pointerType==='touch')return;e.preventDefault();e.stopPropagation();const unit=e.currentTarget.dataset.dragUnit;acBegin(unit,e.clientX,e.clientY,e.pointerId,'pointer');window.addEventListener('pointermove',acPointerMove,{passive:false});window.addEventListener('pointerup',acPointerEnd,{passive:false,once:true})}
function acPointerMove(e){const d=acDeployState.drag;if(!d||d.kind!=='pointer'||d.pointerId!==e.pointerId)return;e.preventDefault();acMoveGhost(e.clientX,e.clientY)}
function acPointerEnd(e){window.removeEventListener('pointermove',acPointerMove);const d=acDeployState.drag;if(!d||d.kind!=='pointer')return;e.preventDefault();acDrop(e.clientX,e.clientY)}
function acTouchStart(e){const t=e.changedTouches?.[0];if(!t)return;e.preventDefault();e.stopPropagation();const unit=e.currentTarget.dataset.dragUnit;acBegin(unit,t.clientX,t.clientY,t.identifier,'touch');window.addEventListener('touchmove',acTouchMove,{passive:false});window.addEventListener('touchend',acTouchEnd,{passive:false,once:true});window.addEventListener('touchcancel',acTouchEnd,{passive:false,once:true})}
function acTouchMove(e){const d=acDeployState.drag;if(!d||d.kind!=='touch')return;const t=Array.from(e.touches||[]).find(x=>x.identifier===d.pointerId);if(!t)return;e.preventDefault();acMoveGhost(t.clientX,t.clientY)}
function acTouchEnd(e){window.removeEventListener('touchmove',acTouchMove);const d=acDeployState.drag;if(!d||d.kind!=='touch')return;const t=Array.from(e.changedTouches||[]).find(x=>x.identifier===d.pointerId);if(!t)return;acDrop(t.clientX,t.clientY)}
function acPrepBattleUnits(){const warriors=localSide==='earth'?eWarriors:aWarriors;AC_EARTH_UNITS.forEach((u,i)=>{const w=warriors?.[i];if(!w)return;applyProfileToWarrior(w,'bombardier');w.weaponKey=u.id==='bombardier'?'bombardier':u.id;w.faction='earth';w.acEarthSpecialist=u.id;w.displayName=u.name;w.passive=false;w.room=acDeployState.placements[u.id];w.roomIndex=acDeployState.placements[u.id];if(w.nameText)w.nameText.textContent=u.name;const art=acUnitArt(u.id);if(w.sprite)textureLoader.load(art,t=>{w.sprite.material.map=t;w.sprite.material.needsUpdate=true},undefined,()=>{})})}
function acCommitDeployment(e){if(e)stopNative(e);if(!acReady()||window.matchMedia('(orientation: portrait)').matches)return;acDeployState.phase='committed';selectedWarriorType='bombardier';const ordered=AC_EARTH_UNITS.map(u=>acDeployState.placements[u.id]);deployment.length=0;ordered.forEach(r=>deployment.push(r));window.__AC_EARTH_DEPLOYMENT={version:AC_DEPLOY_VERSION,faction:'earth',units:AC_EARTH_UNITS.map((u,i)=>({id:u.id,room:ordered[i]})),rooms:ordered.slice(),ready:true};diag('EARTH DEPLOY COMMIT',JSON.stringify(window.__AC_EARTH_DEPLOYMENT));continueToDeployment(e);deployment.length=0;ordered.forEach(r=>deployment.push(r));acPrepBattleUnits();updateDeployUI();setTimeout(()=>startBattle(e),30)}
const acLegacyRenderFactionRoster=renderFactionRoster;
renderFactionRoster=function(){if(selectedFaction!=='earth'){characterOverlay.classList.remove('acEarthDeployMode');document.getElementById('acEarthDeployRoot')?.remove();return acLegacyRenderFactionRoster()}selectedWarriorType='bombardier';acDeployState.placements={bombardier:null,sniper:null,radio_man:null};setTimeout(acBuildRoot,0);return true};
const acLegacyValidateFactionStarter=validateFactionStarter;validateFactionStarter=function(f,w){if(f==='earth')return w==='bombardier';return acLegacyValidateFactionStarter(f,w)};
const acBuildBadge=document.querySelector('.lab');if(acBuildBadge)acBuildBadge.textContent='3D LAB • MOBILE PVP TEST • v0.33.0';diag('PATCH 0.33.0','AUTHORITATIVE EARTH DEPLOYMENT REBUILD');
`;

function patchIndexHtml(html) {
  let out = html;
  if (!out.includes('ac-v0330-earth-deployment')) out = out.replace('</head>', `${PATCH_CSS}\n</head>`);
  if (!out.includes('PATCH 0.33.0')) {
    const close = out.lastIndexOf('</script>');
    if (close > 0) out = out.slice(0, close) + INTERNAL_PATCH + '\n' + out.slice(close);
  }
  out = out.replace('</body>', '<script src="/lifecycle-fix.js?v=20260827-8"></script>\n</body>');
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
      let html = await assetResponse.text();
      html = patchIndexHtml(html);
      return new Response(html, {status: assetResponse.status,statusText: assetResponse.statusText,headers});
    }
    return baseWorker.fetch(request, env, ctx);
  },
};
