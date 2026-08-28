// AFTER CONTACT v0.33.1 - lifecycle guard + authoritative Earth deployment touch hotfix
(() => {
  const activeMedia = new Set();
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function(...args){
    activeMedia.add(this);
    return originalPlay.apply(this,args);
  };
  function stopBackgroundMedia(){
    for(const media of activeMedia){
      try{media.pause()}catch{}
    }
    try{if(navigator.vibrate)navigator.vibrate(0)}catch{}
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBackgroundMedia()},{capture:true});
  window.addEventListener('pagehide',stopBackgroundMedia,{capture:true});
  window.addEventListener('beforeunload',stopBackgroundMedia,{capture:true});
  window.addEventListener('freeze',stopBackgroundMedia,{capture:true});
})();

(() => {
  const style=document.createElement('style');
  style.id='ac-v0331-touch-drag-hotfix';
  style.textContent=`
    #acEarthRoster{touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important;overflow-y:auto!important}
    #acEarthRoster .acUnitCard{touch-action:pan-y!important}
    #acEarthRoster .acUnitArt{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important;-webkit-user-drag:none!important;cursor:grab!important}
    #acEarthRoster .acUnitArt.acDragging{opacity:.55!important;cursor:grabbing!important}
    .acRoom.acDropTarget{border-color:#7fffc2!important;box-shadow:0 0 15px rgba(127,255,194,.28),inset 0 0 16px rgba(127,255,194,.08)!important}
    .acPlacedArt{width:64%!important;height:70%!important;object-fit:contain!important;pointer-events:none!important}
    .acPlacedName{left:5px!important;bottom:4px!important;color:#8fffd0!important}
  `;
  document.head.appendChild(style);

  let drag=null;

  function getState(){return window.__AC_DEPLOYMENT_STATE||null}
  function getRoot(){return document.getElementById('acEarthDeployRoot')}
  function getCards(){return [...document.querySelectorAll('#acEarthRoster .acUnitCard')]}
  function getRooms(){return [...document.querySelectorAll('#acEarthRooms .acRoom')]}
  function artFor(unit){return document.querySelector('#acEarthRoster .acUnitCard[data-unit="'+unit+'"] .acUnitArt')?.src||''}
  function displayName(unit){return unit==='radio_man'?'COMBAT CONTROLLER':unit==='sniper'?'SNIPER':'BOMBARDIER'}

  function renameController(){
    const card=document.querySelector('#acEarthRoster .acUnitCard[data-unit="radio_man"]');
    if(!card)return;
    const name=card.querySelector('.acUnitName');
    const weapon=card.querySelector('.acUnitWeapon');
    const desc=card.querySelector('.acUnitDesc');
    if(name)name.textContent='COMBAT CONTROLLER';
    if(weapon)weapon.textContent='TACTICAL UPLINK • TARGET LOCATOR';
    if(desc)desc.textContent='Battlefield command specialist for target marking, tactical uplink and allied fire support.';
    const img=card.querySelector('.acUnitArt');if(img)img.alt='COMBAT CONTROLLER';
  }

  function ready(state){
    if(!state?.placements)return false;
    const vals=['bombardier','sniper','radio_man'].map(k=>state.placements[k]);
    return vals.every(Number.isInteger)&&new Set(vals).size===3;
  }

  function render(){
    const state=getState(),root=getRoot();if(!state||!root)return;
    renameController();
    const placements=state.placements||{};
    let count=0;
    getCards().forEach(card=>{
      const placed=Number.isInteger(placements[card.dataset.unit]);
      if(placed)count++;
      card.classList.toggle('placed',placed);
    });
    getRooms().forEach(room=>{
      const idx=Number(room.dataset.room);
      const unit=['bombardier','sniper','radio_man'].find(k=>placements[k]===idx)||null;
      room.classList.toggle('filled',!!unit);
      room.querySelectorAll('.acPlacedArt,.acPlacedName').forEach(n=>n.remove());
      const plus=room.querySelector('.acRoomPlus');
      if(plus)plus.style.display=unit?'none':'';
      if(unit){
        const img=document.createElement('img');img.className='acPlacedArt';img.src=artFor(unit);img.alt=displayName(unit);
        const label=document.createElement('span');label.className='acPlacedName';label.textContent=displayName(unit);
        room.append(img,label);
      }
    });
    const title=document.getElementById('acEarthFortressTitle');if(title)title.textContent='FORTRESS INTERIOR • '+count+' / 3 PLACED';
    const btn=document.getElementById('acEarthDeployBtn');if(btn){const ok=ready(state);btn.disabled=!ok;btn.classList.toggle('ready',ok);btn.textContent=ok?'DEPLOY':'PLACE WARRIOR'}
  }

  function ghost(){
    let g=document.getElementById('acEarthGhost');
    if(!g){g=document.createElement('img');g.id='acEarthGhost';document.body.appendChild(g)}
    return g;
  }
  function moveGhost(x,y){
    const g=ghost();g.style.display='block';g.style.left=(x-33)+'px';g.style.top=(y-39)+'px';
    const hit=document.elementsFromPoint(x,y).find(el=>el.classList?.contains('acRoom'));
    getRooms().forEach(r=>r.classList.toggle('acDropTarget',r===hit));
  }
  function begin(e,img){
    const unit=img.dataset.dragUnit;if(!unit||!getState())return;
    e.preventDefault();e.stopImmediatePropagation();
    drag={unit,pointerId:e.pointerId,img};
    img.classList.add('acDragging');
    const g=ghost();g.src=img.src;moveGhost(e.clientX,e.clientY);
    try{img.setPointerCapture(e.pointerId)}catch{}
  }
  function move(e){
    if(!drag||e.pointerId!==drag.pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();moveGhost(e.clientX,e.clientY);
  }
  function end(e){
    if(!drag||e.pointerId!==drag.pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();
    const state=getState();
    const room=document.elementsFromPoint(e.clientX,e.clientY).find(el=>el.classList?.contains('acRoom'));
    if(state&&room){
      const idx=Number(room.dataset.room);
      const occupied=['bombardier','sniper','radio_man'].find(k=>k!==drag.unit&&state.placements[k]===idx);
      if(!occupied)state.placements[drag.unit]=idx;
    }
    drag.img?.classList.remove('acDragging');
    try{drag.img?.releasePointerCapture(e.pointerId)}catch{}
    drag=null;ghost().style.display='none';getRooms().forEach(r=>r.classList.remove('acDropTarget'));render();
  }

  document.addEventListener('pointerdown',e=>{
    const img=e.target.closest?.('#acEarthRoster .acUnitArt');
    if(!img)return;
    begin(e,img);
  },true);
  document.addEventListener('pointermove',move,true);
  document.addEventListener('pointerup',end,true);
  document.addEventListener('pointercancel',end,true);

  const observer=new MutationObserver(()=>{if(getRoot()){renameController();render()}});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(getRoot()){renameController();render()}
})();