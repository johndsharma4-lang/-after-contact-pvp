// AFTER CONTACT v0.33.2 - lifecycle guard + Earth deployment art/touch fix
(() => {
  const activeMedia = new Set();
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function(...args){ activeMedia.add(this); return originalPlay.apply(this,args); };
  function stopBackgroundMedia(){ for(const media of activeMedia){ try{media.pause()}catch{} } try{if(navigator.vibrate)navigator.vibrate(0)}catch{} }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBackgroundMedia()},{capture:true});
  window.addEventListener('pagehide',stopBackgroundMedia,{capture:true});
  window.addEventListener('beforeunload',stopBackgroundMedia,{capture:true});
  window.addEventListener('freeze',stopBackgroundMedia,{capture:true});
})();

(() => {
  const ART={bombardier:'/bombardier.webp',sniper:'/sniper.svg',radio_man:'/combat-controller.svg'};
  const NAME={bombardier:'BOMBARDIER',sniper:'SNIPER',radio_man:'COMBAT CONTROLLER'};

  const style=document.createElement('style');
  style.id='ac-v0332-earth-art-touch';
  style.textContent=`
    #acEarthRoster{touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important;overflow-y:auto!important}
    #acEarthRoster .acUnitCard{touch-action:pan-y!important}
    #acEarthRoster .acUnitArt{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important;-webkit-user-drag:none!important;cursor:grab!important;background:#000!important}
    #acEarthRoster .acUnitArt.acDragging{opacity:.5!important;cursor:grabbing!important}
    .acRoom.acDropTarget{border-color:#7fffc2!important;box-shadow:0 0 15px rgba(127,255,194,.28),inset 0 0 16px rgba(127,255,194,.08)!important}
    .acPlacedArt{width:68%!important;height:74%!important;object-fit:contain!important;pointer-events:none!important;background:#000!important}
    .acPlacedName{left:5px!important;bottom:4px!important;color:#8fffd0!important}
  `;
  document.head.appendChild(style);

  let drag=null;
  const state=()=>window.__AC_DEPLOYMENT_STATE||null;
  const root=()=>document.getElementById('acEarthDeployRoot');
  const cards=()=>[...document.querySelectorAll('#acEarthRoster .acUnitCard')];
  const rooms=()=>[...document.querySelectorAll('#acEarthRooms .acRoom')];

  function normalizeCards(){
    const sniper=document.querySelector('#acEarthRoster .acUnitCard[data-unit="sniper"]');
    if(sniper){
      const img=sniper.querySelector('.acUnitArt'); if(img){img.src=ART.sniper;img.alt='SNIPER';}
      const n=sniper.querySelector('.acUnitName'); if(n)n.textContent='SNIPER';
    }
    const cc=document.querySelector('#acEarthRoster .acUnitCard[data-unit="radio_man"]');
    if(cc){
      const img=cc.querySelector('.acUnitArt'); if(img){img.src=ART.radio_man;img.alt='COMBAT CONTROLLER';}
      const n=cc.querySelector('.acUnitName'); if(n)n.textContent='COMBAT CONTROLLER';
      const w=cc.querySelector('.acUnitWeapon'); if(w)w.textContent='TACTICAL UPLINK • TARGET LOCATOR';
      const d=cc.querySelector('.acUnitDesc'); if(d)d.textContent='Battlefield command specialist for target marking, tactical uplink and allied fire support.';
    }
  }

  function isReady(s){
    if(!s?.placements)return false;
    const vals=['bombardier','sniper','radio_man'].map(k=>s.placements[k]);
    return vals.every(Number.isInteger)&&new Set(vals).size===3;
  }

  function render(){
    const s=state(),r=root(); if(!s||!r)return;
    normalizeCards();
    const placements=s.placements||{};
    let count=0;
    cards().forEach(card=>{ const p=Number.isInteger(placements[card.dataset.unit]); if(p)count++; card.classList.toggle('placed',p); });
    rooms().forEach(room=>{
      const idx=Number(room.dataset.room);
      const unit=['bombardier','sniper','radio_man'].find(k=>placements[k]===idx)||null;
      room.classList.toggle('filled',!!unit);
      room.querySelectorAll('.acPlacedArt,.acPlacedName').forEach(n=>n.remove());
      const plus=room.querySelector('.acRoomPlus'); if(plus)plus.style.display=unit?'none':'';
      if(unit){
        const img=document.createElement('img'); img.className='acPlacedArt'; img.src=ART[unit]; img.alt=NAME[unit];
        const label=document.createElement('span'); label.className='acPlacedName'; label.textContent=NAME[unit];
        room.append(img,label);
      }
    });
    const title=document.getElementById('acEarthFortressTitle'); if(title)title.textContent='FORTRESS INTERIOR • '+count+' / 3 PLACED';
    const btn=document.getElementById('acEarthDeployBtn'); if(btn){ const ok=isReady(s); btn.disabled=!ok; btn.classList.toggle('ready',ok); btn.textContent=ok?'DEPLOY':'PLACE WARRIOR'; }
  }

  function ghost(){ let g=document.getElementById('acEarthGhost'); if(!g){g=document.createElement('img');g.id='acEarthGhost';document.body.appendChild(g);} return g; }
  function roomAt(x,y){ return document.elementsFromPoint(x,y).find(el=>el.classList?.contains('acRoom'))||null; }
  function moveGhost(x,y){ const g=ghost(); g.style.display='block'; g.style.left=(x-33)+'px'; g.style.top=(y-39)+'px'; const hit=roomAt(x,y); rooms().forEach(r=>r.classList.toggle('acDropTarget',r===hit)); }

  function begin(e,img){
    const unit=img.dataset.dragUnit; if(!unit||!state())return;
    e.preventDefault(); e.stopImmediatePropagation();
    drag={unit,pointerId:e.pointerId,img}; img.classList.add('acDragging');
    const g=ghost(); g.src=ART[unit]||img.src; moveGhost(e.clientX,e.clientY);
    try{img.setPointerCapture(e.pointerId)}catch{}
  }
  function move(e){ if(!drag||e.pointerId!==drag.pointerId)return; e.preventDefault(); e.stopImmediatePropagation(); moveGhost(e.clientX,e.clientY); }
  function end(e){
    if(!drag||e.pointerId!==drag.pointerId)return;
    e.preventDefault(); e.stopImmediatePropagation();
    const s=state(),hit=roomAt(e.clientX,e.clientY);
    if(s&&hit){
      const idx=Number(hit.dataset.room);
      const occupied=['bombardier','sniper','radio_man'].find(k=>k!==drag.unit&&s.placements[k]===idx);
      if(!occupied)s.placements[drag.unit]=idx;
    }
    drag.img?.classList.remove('acDragging');
    try{drag.img?.releasePointerCapture(e.pointerId)}catch{}
    drag=null; ghost().style.display='none'; rooms().forEach(r=>r.classList.remove('acDropTarget')); render();
  }

  document.addEventListener('pointerdown',e=>{ const img=e.target.closest?.('#acEarthRoster .acUnitArt'); if(img)begin(e,img); },true);
  document.addEventListener('pointermove',move,true);
  document.addEventListener('pointerup',end,true);
  document.addEventListener('pointercancel',end,true);

  const observer=new MutationObserver(()=>{ if(root()){normalizeCards();render();} });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(root()){normalizeCards();render();}
})();