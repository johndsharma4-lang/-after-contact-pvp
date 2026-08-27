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

const SPECIALIST_CSS = `
<style id="ac-v03213-specialists">
#characterRoster.acEarthRoster{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:9px!important}
#characterRoster.acEarthRoster .characterCard{min-height:180px!important;padding:9px!important}
#characterRoster.acEarthRoster .characterCard img{height:68%!important}
#characterRoster.acEarthRoster .characterName{font-size:clamp(8px,.86vw,12px)!important;text-align:center}
#characterRoster.acEarthRoster .characterWeapon{font-size:7px!important;text-align:center}
@media(max-height:520px) and (orientation:landscape){#characterRoster.acEarthRoster .characterCard{min-height:100px!important}#characterRoster.acEarthRoster .characterCard img{height:62%!important}}
</style>`;

const INTERNAL_PATCH = `
// === AFTER CONTACT v0.32.13 INTERNAL EARTH ROSTER PATCH ===
const AC_EARTH_SPECIALISTS=Object.freeze([
  Object.freeze({id:'bombardier',name:'BOMBARDIER',weapon:'HE-9 BARRAGE',base:'bombardier',accent:'#55bfff',mark:'HE-9'}),
  Object.freeze({id:'sniper',name:'SNIPER',weapon:'LONGSHOT RIFLE',base:'bombardier',accent:'#d8efff',mark:'SNIPER'}),
  Object.freeze({id:'radio_man',name:'RADIO MAN',weapon:'TARGET LOCATOR',base:'bombardier',accent:'#83dcff',mark:'RADIO'}),
  Object.freeze({id:'combat_controller',name:'COMBAT CONTROLLER',weapon:'TACTICAL UPLINK',base:'bombardier',accent:'#7bbcff',mark:'CONTROL'})
]);
const AC_EARTH_SPECIALIST_MAP=Object.freeze(Object.fromEntries(AC_EARTH_SPECIALISTS.map(u=>[u.id,u])));
function acEarthSpecialistArt(type){
  if(type==='bombardier')return '/bombardier.webp';
  const u=AC_EARTH_SPECIALIST_MAP[type]||AC_EARTH_SPECIALISTS[0];
  const icon=type==='sniper'?'⌖':type==='radio_man'?'⌁':'✦';
  const extra=type==='sniper'?'<path d="M116 255h88M160 211v88" stroke="#dff5ff" stroke-width="6" opacity=".9"/>':type==='radio_man'?'<path d="M112 168q48-52 96 0M126 186q34-34 68 0M145 204q15-14 30 0" fill="none" stroke="#bceeff" stroke-width="6"/>':'<path d="M115 175h90M160 130v90" stroke="#bce6ff" stroke-width="8"/><circle cx="160" cy="175" r="55" fill="none" stroke="#83c8ff" stroke-width="5"/>';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#101b27"/><stop offset="1" stop-color="#03070c"/></linearGradient></defs><rect width="320" height="420" fill="url(#g)"/><circle cx="160" cy="112" r="42" fill="#25384a" stroke="'+u.accent+'" stroke-width="5"/><path d="M104 286q10-115 56-115t56 115l26 80H78z" fill="#1e3144" stroke="'+u.accent+'" stroke-width="5"/><path d="M118 238h84v68h-84z" fill="#142332" stroke="#78b7db" stroke-width="4"/>'+extra+'<text x="160" y="350" text-anchor="middle" fill="'+u.accent+'" font-family="Arial,sans-serif" font-size="30" font-weight="900">'+icon+'</text><text x="160" y="388" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="20" font-weight="900">'+u.mark+'</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

const acOriginalValidateFactionStarter=validateFactionStarter;
validateFactionStarter=function(faction,warrior){
  if(faction==='earth')return !!AC_EARTH_SPECIALIST_MAP[warrior];
  return acOriginalValidateFactionStarter(faction,warrior);
};

const acOriginalRenderFactionRoster=renderFactionRoster;
renderFactionRoster=function(){
  if(selectedFaction!=='earth'){
    const roster=document.getElementById('characterRoster');if(roster)roster.classList.remove('acEarthRoster');
    return acOriginalRenderFactionRoster();
  }
  const roster=document.getElementById('characterRoster');if(!roster)return false;
  roster.classList.add('acEarthRoster');
  [...roster.querySelectorAll('.characterCard,.characterReserve')].forEach(n=>n.remove());
  selectedWarriorType=AC_EARTH_SPECIALISTS[0].id;
  for(const unit of AC_EARTH_SPECIALISTS){
    const card=document.createElement('div');
    card.className='characterCard'+(unit.id===selectedWarriorType?' selected':'');
    card.dataset.warrior=unit.id;card.setAttribute('role','button');card.tabIndex=0;
    const img=document.createElement('img');img.src=acEarthSpecialistArt(unit.id);img.alt=unit.name;img.style.filter='none';
    const name=document.createElement('div');name.className='characterName';name.textContent=unit.name;
    const weapon=document.createElement('div');weapon.className='characterWeapon';weapon.textContent=unit.weapon;
    card.append(img,name,weapon);
    const pick=e=>selectStarterCard(unit.id,card,e);
    card.addEventListener('pointerup',pick,{passive:false});
    card.addEventListener('click',e=>{if(e.detail===0)pick(e)},{passive:false});
    roster.insertBefore(card,characterContinue);
  }
  characterContinue.textContent='DEPLOY BOMBARDIER';characterContinue.disabled=false;
  const kicker=document.querySelector('.characterKicker');if(kicker)kicker.textContent='EARTH COMMAND • SPECIALIST ROSTER';
  const text=document.querySelector('.characterText');if(text)text.textContent='Choose your Earth warrior, then deploy that warrior into any fortress compartment.';
  diag('EARTH ROSTER','Bombardier + Sniper + Radio Man + Combat Controller ready');
  return true;
};

const acOriginalApplyStarterProfile=applyStarterProfile;
applyStarterProfile=function(type){
  const specialist=selectedFaction==='earth'?AC_EARTH_SPECIALIST_MAP[type]:null;
  if(!specialist)return acOriginalApplyStarterProfile(type);
  acOriginalApplyStarterProfile('bombardier');
  selectedWarriorType=specialist.id;
  const w=localSide==='earth'?eWarriors[0]:aWarriors[0];
  if(w){w.weaponKey='bombardier';w.acEarthSpecialist=specialist.id;w.displayName=specialist.name;if(w.nameText)w.nameText.textContent=specialist.name;}
  starterCard.dataset.warriorStock=specialist.id;
  const img=starterCard.querySelector('img');if(img){img.src=acEarthSpecialistArt(specialist.id);img.style.display='block';img.style.filter='none'}
  const cardName=starterCard.querySelector('.cardName');if(cardName)cardName.textContent=specialist.name;
  const deployText=document.querySelector('.deployText');if(deployText)deployText.textContent='Drag your '+specialist.name+' into any fortress compartment. You can reposition before battle.';
  const shipLabel=document.querySelector('.shipLabel');if(shipLabel)shipLabel.textContent='EARTH COMMAND • 3×3 TEST FORTRESS';
  characterContinue.textContent='DEPLOY '+specialist.name;characterContinue.disabled=false;
  diag('EARTH SPECIALIST PROFILE',specialist.id+' visual identity / stable combat route bombardier');
};

const acOriginalSelectStarterCard=selectStarterCard;
selectStarterCard=function(type,card,e){
  if(selectedFaction!=='earth'||!AC_EARTH_SPECIALIST_MAP[type])return acOriginalSelectStarterCard(type,card,e);
  if(e)stopNative(e);
  selectedWarriorType=type;
  document.querySelectorAll('#characterRoster .characterCard').forEach(c=>c.classList.remove('selected'));
  if(card)card.classList.add('selected');
  applyStarterProfile(type);characterContinue.disabled=false;
  diag('WARRIOR SELECT',AC_EARTH_SPECIALIST_MAP[type].name+' faction=earth');
};

// Keep the modern physical cutaway/interior system, but suppress the obsolete glow-silhouette X-ray layer.
function acSuppressLegacyXrayGlow(){
  for(const w of allWarriors||[]){
    if(w.xrayGlow){w.xrayGlow.visible=false;if(w.xrayGlow.material)w.xrayGlow.material.opacity=0;}
    if(w.captainBeacon){w.captainBeacon.visible=false;if(w.captainBeacon.material)w.captainBeacon.material.opacity=0;}
  }
}
acSuppressLegacyXrayGlow();
if(typeof refreshPrivateXrayVisuals==='function'){
  const acOriginalRefreshPrivateXrayVisuals=refreshPrivateXrayVisuals;
  refreshPrivateXrayVisuals=function(...args){const r=acOriginalRefreshPrivateXrayVisuals(...args);acSuppressLegacyXrayGlow();return r;};
}
if(typeof updatePrivateXrayAnimation==='function'){
  const acOriginalUpdatePrivateXrayAnimation=updatePrivateXrayAnimation;
  updatePrivateXrayAnimation=function(...args){const r=acOriginalUpdatePrivateXrayAnimation(...args);acSuppressLegacyXrayGlow();return r;};
}
const acBuildBadge=document.querySelector('.lab');if(acBuildBadge)acBuildBadge.textContent='3D LAB • MOBILE PVP TEST • v0.32.13';
diag('PATCH 0.32.13','REAL EARTH ROSTER + LEGACY XRAY GLOW REMOVED');
`;

function patchIndexHtml(html) {
  let out = html;
  if (!out.includes('ac-v03213-specialists')) {
    out = out.replace('</head>', `${SPECIALIST_CSS}\n</head>`);
  }
  if (!out.includes('PATCH 0.32.13')) {
    const close = out.lastIndexOf('</script>');
    if (close > 0) out = out.slice(0, close) + INTERNAL_PATCH + '\n' + out.slice(close);
  }
  out = out.replace('</body>', '<script src="/lifecycle-fix.js?v=20260827-2"></script>\n</body>');
  return out;
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

      let html = await assetResponse.text();
      html = patchIndexHtml(html);

      return new Response(html, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
