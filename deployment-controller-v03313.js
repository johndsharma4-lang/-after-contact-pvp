(()=>{
'use strict';

const ROSTERS=Object.freeze({
  earth:{
    label:'EARTH',accent:'#79dfff',team:[
      {key:'bombardier',name:'BOMBARDIER',role:'EXPLOSIVE ARTILLERY',hp:85,aa:60,img:'/bombardier.webp',desc:'HE-9 heavy explosive specialist. Five-missile barrage with ballistic spread and compartment pressure.'},
      {key:'sniper',name:'SNIPER',role:'PRECISION BREACH',hp:60,aa:60,img:'/earth-sniper.webp',desc:'Long-range precision specialist using explosive breach rounds and projected manual aiming.'},
      {key:'combat_controller',name:'COMBAT CONTROLLER',role:'TACTICAL SUPPORT',hp:75,aa:60,img:'/combat-controller.webp',desc:'Designates enemy compartments for delayed adaptive battlefield support.'}
    ]
  },
  aurelian:{
    label:'AURELIAN',accent:'#ffd76a',team:[
      {key:'solar_lancer',name:'SOLAR LANCER',role:'PENETRATING LASER',hp:85,aa:60,img:'/solar-lancer.webp',desc:'Precision solar marksman. Uses projected manual aiming and a penetrating sustained solar laser.'},
      {key:'sun_disk_gunner',name:'SUN DISK GUNNER',role:'SOLAR CUTTER',hp:70,aa:60,glyph:'☀',desc:'Gauntlet-launched large solar disk. Slices through a compartment, then detonates across three compartments with stacking solar fire.'},
      {key:'sunadier',name:'SUNADIER',role:'SOLAR ARTILLERY',hp:80,aa:60,glyph:'✺',desc:'Chain-lobs a solar grenade. The chain releases near the apex and snaps back while the grenade continues into a scatter detonation.'}
    ]
  },
  lizard:{
    label:'REPTILIAN',accent:'#79ef9a',team:[
      {key:'acid_brute',name:'ACID BRUTE',role:'CORROSIVE SIEGE',hp:100,aa:60,img:'/acid-brute.webp',desc:'Corrosive flood specialist with stacking acid and armor melt.'}
    ]
  },
  gray:{
    label:'GRAY',accent:'#bb8cff',team:[
      {key:'spatial_disintegrator',name:'SPATIAL DISINTEGRATOR',role:'MATTER COLLAPSE',hp:85,aa:60,glyph:'◎',desc:'Spatial warfare specialist built around compartment erasure and matter collapse.'}
    ]
  }
});

const FUTURE_TOTAL=9;
let modal=null,active=null,commitBtn=null,lastFaction='';

const css=`
#deployOverlay.acUnified{touch-action:pan-y!important;--acFaction:#79dfff;--acFactionSoft:rgba(121,223,255,.14)}
#deployOverlay.acUnified.acFaction-aurelian{--acFaction:#ffd76a;--acFactionSoft:rgba(255,215,106,.15)}
#deployOverlay.acUnified.acFaction-lizard{--acFaction:#79ef9a;--acFactionSoft:rgba(121,239,154,.14)}
#deployOverlay.acUnified.acFaction-gray{--acFaction:#bb8cff;--acFactionSoft:rgba(187,140,255,.14)}
#deployOverlay.acUnified .deployRoster{display:none!important}
#deployOverlay.acUnified .deployPanel{min-height:0!important;overflow:hidden!important;touch-action:pan-y!important}
#deployOverlay.acUnified .deployLeft{height:100%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;touch-action:pan-y!important}
#deployOverlay.acUnified .deployRight{height:100%!important;min-height:0!important;overflow:hidden!important}
#deployOverlay.acUnified .deployTitle{color:var(--acFaction)!important;text-shadow:0 0 14px var(--acFactionSoft)}
#deployOverlay.acUnified .shipLabel{color:var(--acFaction)!important}
.acUnifiedScrollShell{position:relative;flex:1 1 0;min-height:0;overflow:hidden;display:flex;flex-direction:column;touch-action:pan-y!important}
.acUnifiedScrollHint{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:5px;text-align:center;padding:3px 2px 5px;color:var(--acFaction);font:900 7px/1 system-ui;letter-spacing:.1em;touch-action:manipulation!important}
.acUnifiedScrollHintText{flex:1;pointer-events:none}.acScrollStep{flex:0 0 28px;height:24px;border:1px solid color-mix(in srgb,var(--acFaction) 45%,transparent);border-radius:7px;background:rgba(8,20,32,.94);color:var(--acFaction);font:1000 11px/1 system-ui;touch-action:manipulation!important}
.acUnifiedRoster{position:relative;flex:1 1 0;height:0;min-height:0;max-height:100%;overflow-y:scroll!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;display:flex;flex-direction:column;gap:8px;padding:2px 6px 58px 0;scrollbar-width:thin;scroll-behavior:smooth}
.acUnifiedRoster::-webkit-scrollbar{width:6px}.acUnifiedRoster::-webkit-scrollbar-thumb{background:var(--acFaction);border-radius:99px}.acUnifiedRoster::-webkit-scrollbar-track{background:rgba(255,255,255,.04)}
.acUnifiedRow{flex:0 0 auto;min-height:72px;display:grid;grid-template-columns:60px minmax(0,1fr) 78px;gap:8px;align-items:center;padding:6px 8px;border:1px solid color-mix(in srgb,var(--acFaction) 34%,transparent);border-radius:12px;background:linear-gradient(180deg,var(--acFactionSoft),rgba(3,10,18,.90));color:#fff;touch-action:pan-y!important}
.acUnifiedRow img{width:56px;height:60px;object-fit:contain;pointer-events:none;touch-action:pan-y!important;filter:drop-shadow(0 7px 8px rgba(0,0,0,.62))}
.acWarriorGlyph{width:56px;height:60px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--acFaction) 50%,transparent);border-radius:12px;background:radial-gradient(circle,var(--acFactionSoft),rgba(3,10,18,.8) 72%);color:var(--acFaction);font:1000 32px/1 system-ui;text-shadow:0 0 12px var(--acFaction)}
.acUnifiedInfo{min-width:0;touch-action:pan-y!important}.acUnifiedName,.acUnifiedRole,.acUnifiedState{touch-action:pan-y!important}.acUnifiedName{font:1000 10px/1.1 system-ui;letter-spacing:.07em}.acUnifiedRole{font:800 7px/1.2 system-ui;color:var(--acFaction);margin-top:4px}.acUnifiedState{font:900 7px/1.2 system-ui;color:#79f0ac;margin-top:5px}.acUnifiedDeploy{height:38px;border:1px solid var(--acFaction);border-radius:9px;background:linear-gradient(180deg,color-mix(in srgb,var(--acFaction) 82%,white),color-mix(in srgb,var(--acFaction) 70%,#1c6f59));color:#03110a;font:1000 8px system-ui;letter-spacing:.08em;touch-action:manipulation!important}.acUnifiedDeploy:disabled{opacity:.4}.acUnifiedFuture{opacity:.30;border-style:dashed;grid-template-columns:50px minmax(0,1fr);min-height:60px;touch-action:pan-y!important}.acUnifiedFutureMark{width:46px;height:46px;border:1px dashed rgba(255,255,255,.28);border-radius:9px;display:grid;place-items:center;font:1000 18px system-ui;touch-action:pan-y!important}
.acDeploymentCommit{position:absolute;z-index:75;right:18px;bottom:16px;width:min(330px,39%);height:52px;border:1px solid var(--acFaction);border-radius:13px;background:linear-gradient(180deg,color-mix(in srgb,var(--acFaction) 82%,white),color-mix(in srgb,var(--acFaction) 70%,#1c6f59));color:#03110a;font:1000 11px/1 system-ui;letter-spacing:.1em;box-shadow:0 12px 30px rgba(0,0,0,.34);touch-action:manipulation!important;display:none}.acDeploymentCommit.show{display:block}.acDeploymentCommit:active{transform:translateY(1px)}
.acUnifiedModal{position:absolute;inset:0;z-index:90;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(1,6,12,.88);backdrop-filter:blur(8px);touch-action:auto!important}.acUnifiedModal.show{display:flex}.acUnifiedCard{width:min(600px,94%);max-height:88%;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y!important;border:1px solid color-mix(in srgb,var(--acFaction) 45%,transparent);border-radius:18px;background:linear-gradient(180deg,rgba(6,20,34,.99),rgba(2,9,17,.99));padding:14px;display:grid;grid-template-columns:minmax(110px,.75fr) minmax(170px,1.25fr);gap:14px;position:relative}.acUnifiedArt,.acUnifiedArtGlyph{width:100%;height:min(280px,45vh);object-fit:contain}.acUnifiedArtGlyph{display:grid;place-items:center;color:var(--acFaction);font:1000 clamp(64px,16vw,130px)/1 system-ui;text-shadow:0 0 28px var(--acFaction)}.acUnifiedClose{position:absolute;right:8px;top:8px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#0a1622;color:#fff;font-weight:900;touch-action:manipulation!important}.acUnifiedModalName{font:1000 clamp(19px,4vw,31px)/1 system-ui}.acUnifiedModalRole{font:900 8px system-ui;color:var(--acFaction);margin-top:5px}.acUnifiedStats{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.acUnifiedStat{padding:8px;border:1px solid rgba(255,255,255,.13);border-radius:9px}.acUnifiedStat b{display:block;font:1000 15px system-ui}.acUnifiedStat span{font:800 7px system-ui;opacity:.55}.acUnifiedDesc{font:600 10px/1.45 system-ui;color:#c7d8e5}.acUnifiedMsg{min-height:12px;margin-top:8px;color:#ffd27a;font:800 8px system-ui}.acUnifiedActions{position:sticky;bottom:-14px;display:grid;grid-template-columns:1fr .55fr;gap:8px;margin-top:12px;padding-top:12px;background:linear-gradient(180deg,rgba(2,9,17,0),rgba(2,9,17,.98) 32%)}.acUnifiedAction{height:46px;border-radius:10px;border:1px solid rgba(116,217,255,.3);background:#0a1a2a;color:#fff;font:1000 9px system-ui;touch-action:manipulation!important}.acUnifiedAction.deploy{background:var(--acFaction);border-color:var(--acFaction);color:#03110a}.acUnifiedAction:disabled{opacity:.4}
#deployOverlay.acUnified .deploySlot,#deployOverlay.acUnified #battleBtn{touch-action:manipulation!important}
@media(max-width:760px){#deployOverlay.acUnified{padding:5px!important}#deployOverlay.acUnified .deployPanel{height:calc(100% - 2px)!important;padding:7px 7px 64px!important;gap:8px!important}#deployOverlay.acUnified .deployTitle{flex:0 0 auto}#deployOverlay.acUnified .deployText{flex:0 0 auto;margin-bottom:4px!important}.acUnifiedScrollHint{font-size:6px;padding-bottom:4px}.acUnifiedRoster{padding-bottom:68px}.acUnifiedRow{min-height:62px;grid-template-columns:50px minmax(0,1fr) 68px;padding:4px 6px;gap:6px}.acUnifiedRow img,.acWarriorGlyph{width:47px;height:52px}.acUnifiedDeploy{height:34px;font-size:7px}.acUnifiedCard{grid-template-columns:minmax(94px,.68fr) minmax(150px,1.32fr);padding:10px;gap:9px}.acUnifiedArt,.acUnifiedArtGlyph{height:min(225px,42vh)}.acDeploymentCommit{right:9px;bottom:8px;width:42%;height:44px;font-size:9px}}
`;

const bridge=()=>window.__acDeployBridge||null;
const state=()=>{try{return bridge()?.getState?.()||[]}catch{return []}};
function selectedFaction(){
  const card=document.querySelector('.factionCard.selected[data-faction]');
  return card?.dataset?.faction||'earth';
}
function roster(){return ROSTERS[selectedFaction()]||ROSTERS.earth}
function team(){return roster().team}
function placed(i){return Number.isInteger(state()[i])}
function addStyle(){if(document.getElementById('acUnifiedStyle'))return;const s=document.createElement('style');s.id='acUnifiedStyle';s.textContent=css;document.head.appendChild(s)}
function emptyRoom(){const s=state();for(let i=0;i<9;i++)if(!s.includes(i))return i;return-1}
function deploy(i){const b=bridge(),room=emptyRoom(),w=team()[i];if(!w||!b||room<0)return false;try{return b.place(i,room,null)!==false}catch(e){console.warn('[AC unified deploy]',e);return false}}
function ensureCommit(){if(commitBtn)return commitBtn;const overlay=document.getElementById('deployOverlay');if(!overlay)return null;commitBtn=document.createElement('button');commitBtn.type='button';commitBtn.className='acDeploymentCommit';commitBtn.textContent='LOCK IN • START BATTLE';commitBtn.addEventListener('click',()=>{const native=document.getElementById('battleBtn');if(!native||native.disabled)return;native.click()});overlay.appendChild(commitBtn);return commitBtn}
function ensureModal(){
  if(modal)return modal;const overlay=document.getElementById('deployOverlay');if(!overlay)return null;
  modal=document.createElement('div');modal.className='acUnifiedModal';modal.innerHTML=`<div class="acUnifiedCard"><button class="acUnifiedClose" type="button">×</button><div class="acModalArtHost"></div><div><div class="acUnifiedModalName"></div><div class="acUnifiedModalRole"></div><div class="acUnifiedStats"><div class="acUnifiedStat"><b class="hp"></b><span>HP</span></div><div class="acUnifiedStat"><b class="aa"></b><span>AA</span></div></div><div class="acUnifiedDesc"></div><div class="acUnifiedMsg"></div><div class="acUnifiedActions"><button class="acUnifiedAction deploy" type="button">DEPLOY</button><button class="acUnifiedAction close" type="button">CLOSE</button></div></div></div>`;overlay.appendChild(modal);
  const close=()=>{modal.classList.remove('show');active=null};modal.querySelector('.acUnifiedClose').onclick=close;modal.querySelector('.close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});modal.querySelector('.deploy').onclick=()=>{if(active==null)return;if(deploy(active)){setTimeout(()=>{syncRows();close()},40)}else modal.querySelector('.acUnifiedMsg').textContent='Deployment did not reach the vessel. Try another empty room.'};return modal
}
function renderArt(host,w,cls='acUnifiedArt'){
  host.innerHTML='';if(w.img){const img=document.createElement('img');img.className=cls;img.src=w.img;img.alt=w.name;host.appendChild(img)}else{const g=document.createElement('div');g.className=cls==='acUnifiedArt'?'acUnifiedArtGlyph':'acWarriorGlyph';g.textContent=w.glyph||'✦';host.appendChild(g)}
}
function details(i){const w=team()[i],m=ensureModal();if(!w||!m)return;active=i;renderArt(m.querySelector('.acModalArtHost'),w);m.querySelector('.acUnifiedModalName').textContent=w.name;m.querySelector('.acUnifiedModalRole').textContent=w.role;m.querySelector('.hp').textContent=w.hp;m.querySelector('.aa').textContent=w.aa;m.querySelector('.acUnifiedDesc').textContent=w.desc;const on=placed(i);m.querySelector('.acUnifiedMsg').textContent=on?`Deployed in room ${state()[i]+1}. You can rearrange this warrior on the vessel.`:(!w.img&&selectedFaction()==='aurelian'?'CONCEPT ART ASSET PENDING • GAMEPLAY SLOT ACTIVE':'');const b=m.querySelector('.deploy');b.disabled=on;b.textContent=on?'DEPLOYED':'DEPLOY';m.classList.add('show')}
function stepScroll(dir){const list=document.querySelector('.acUnifiedRoster');if(!list)return;list.scrollBy({top:dir*Math.max(70,list.clientHeight*.72),behavior:'smooth'})}
function rebuildRoster(list){
  const f=selectedFaction(),r=roster();list.innerHTML='';list.dataset.faction=f;
  r.team.forEach((w,i)=>{const row=document.createElement('div');row.className='acUnifiedRow';row.dataset.wi=i;const art=w.img?`<img src="${w.img}" alt="${w.name}">`:`<div class="acWarriorGlyph" aria-label="${w.name}">${w.glyph||'✦'}</div>`;row.innerHTML=`${art}<div class="acUnifiedInfo"><div class="acUnifiedName">${w.name}</div><div class="acUnifiedRole">${w.role}</div><div class="acUnifiedState"></div></div><button class="acUnifiedDeploy" type="button">DEPLOY</button>`;row.querySelector('.acUnifiedInfo').onclick=()=>details(i);row.querySelector('img,.acWarriorGlyph').onclick=()=>details(i);row.querySelector('.acUnifiedDeploy').onclick=e=>{e.stopPropagation();if(deploy(i))setTimeout(syncRows,40)};list.appendChild(row)});
  const future=Math.max(0,FUTURE_TOTAL-r.team.length);for(let i=0;i<future;i++){const n=r.team.length+i+1,el=document.createElement('div');el.className='acUnifiedRow acUnifiedFuture';el.innerHTML=`<div class="acUnifiedFutureMark">+</div><div><div class="acUnifiedName">FUTURE ${r.label} WARRIOR ${String(n).padStart(2,'0')}</div><div class="acUnifiedRole">COMING SOON</div></div>`;list.appendChild(el)}
}
function build(){
  const overlay=document.getElementById('deployOverlay'),native=overlay?.querySelector('.deployRoster');if(!overlay||!native)return false;addStyle();const f=selectedFaction(),r=roster();overlay.classList.add('acUnified');overlay.classList.remove('acFaction-earth','acFaction-aurelian','acFaction-lizard','acFaction-gray');overlay.classList.add('acFaction-'+f);overlay.style.setProperty('--acFaction',r.accent);
  let shell=overlay.querySelector('.acUnifiedScrollShell'),list=overlay.querySelector('.acUnifiedRoster');if(!shell){shell=document.createElement('div');shell.className='acUnifiedScrollShell';const hint=document.createElement('div');hint.className='acUnifiedScrollHint';hint.innerHTML='<button class="acScrollStep up" type="button">▲</button><span class="acUnifiedScrollHintText"></span><button class="acScrollStep down" type="button">▼</button>';list=document.createElement('div');list.className='acUnifiedRoster';shell.append(hint,list);native.before(shell);hint.querySelector('.up').onclick=()=>stepScroll(-1);hint.querySelector('.down').onclick=()=>stepScroll(1)}
  if(list.dataset.faction!==f)rebuildRoster(list);const hintText=shell.querySelector('.acUnifiedScrollHintText');if(hintText)hintText.textContent=`SWIPE / SCROLL • ${r.label} WARRIORS • FUTURE SLOTS`;
  const title=overlay.querySelector('.deployTitle');if(title)title.textContent=`DEPLOY ${r.label} TEAM`;const text=overlay.querySelector('.deployText');if(text)text.textContent=`Deploy your ${r.team.length} active ${r.label} warrior${r.team.length===1?'':'s'}, arrange them in vessel rooms, then lock in.`;const ship=overlay.querySelector('.shipLabel');if(ship)ship.textContent=`${r.label} VESSEL CUTAWAY • 3×3 STRATEGIC ROOMS`;ensureCommit();lastFaction=f;syncRows();return true
}
function syncRows(){
  const f=selectedFaction();if(f!==lastFaction){build();return}const s=state(),r=roster();document.querySelectorAll('.acUnifiedRow[data-wi]').forEach(row=>{const i=Number(row.dataset.wi),on=Number.isInteger(s[i]),st=row.querySelector('.acUnifiedState'),b=row.querySelector('.acUnifiedDeploy');if(st)st.textContent=on?`ROOM ${s[i]+1} • TAP FOR DETAILS`:'TAP FOR DETAILS';if(b){b.disabled=on;b.textContent=on?'DEPLOYED':'DEPLOY'}});
  const native=document.getElementById('battleBtn'),bridgeRequired=bridge()?.required?.(),need=Math.min(r.team.length,Number.isFinite(bridgeRequired)?bridgeRequired:r.team.length),count=s.slice(0,need).filter(Number.isInteger).length,commit=ensureCommit();if(native){if(count<need)native.textContent=`PLACE WARRIOR • ${count}/${need}`;else native.textContent='START BATTLE'}if(commit){const ready=count>=need&&native&&!native.disabled;commit.classList.toggle('show',ready);commit.disabled=!ready;commit.textContent='LOCK IN • START BATTLE'}
}
function boot(){build();document.addEventListener('click',e=>{if(e.target.closest?.('.factionCard'))setTimeout(build,60);if(e.target.closest?.('#deployOverlay .deploySlot'))setTimeout(syncRows,40)},true);window.addEventListener('pageshow',()=>setTimeout(()=>{build();syncRows()},80));setTimeout(()=>{build();syncRows()},350);setInterval(()=>{const overlay=document.getElementById('deployOverlay');if(overlay&&!overlay.classList.contains('hidden')){build();syncRows()}},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();