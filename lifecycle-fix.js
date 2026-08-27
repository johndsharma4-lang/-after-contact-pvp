// AFTER CONTACT v0.32.20 - lifecycle guard + reliable Earth deployment touch controls
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
  const css = `
  #characterOverlay.acEarthPlacement .characterPanel{height:calc(100dvh - 10px)!important;max-height:calc(100dvh - 10px)!important;grid-template-columns:minmax(214px,.60fr) minmax(0,1.78fr)!important;align-items:stretch!important;padding:5px!important;gap:6px!important}
  #acEarthRosterPane{height:100%!important;min-height:0!important;max-height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
  #characterOverlay.acEarthPlacement .characterIntro{flex:0 0 auto!important;padding:0 2px 3px!important}
  #characterOverlay.acEarthPlacement .characterKicker{font-size:5.5px!important}
  #characterOverlay.acEarthPlacement .characterTitle{font-size:12.5px!important;line-height:.92!important;margin-top:2px!important}
  #characterOverlay.acEarthPlacement .characterText{font-size:5px!important;line-height:1.1!important;margin-top:2px!important;max-width:35ch!important}
  #characterOverlay.acEarthPlacement #characterRoster{display:flex!important;flex:1 1 auto!important;height:auto!important;min-height:0!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;overscroll-behavior:contain!important;padding:0 4px 4px 0!important;gap:3px!important;scrollbar-width:thin!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterCard{flex:0 0 58px!important;min-height:58px!important;max-height:58px!important;grid-template-columns:40px minmax(0,1fr)!important;padding:3px!important;column-gap:4px!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterCard img{width:38px!important;height:51px!important;cursor:grab!important;touch-action:none!important;user-select:none!important;-webkit-user-drag:none!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterName{font-size:6.7px!important;line-height:1!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterWeapon{font-size:4.1px!important;margin-top:1px!important}
  .acEarthDesc{font-size:4.15px!important;line-height:1.05!important;margin-top:1px!important}
  .acEarthStats{gap:2px!important;margin-top:1px!important}.acStatLabel{font-size:3.8px!important}.acStatTrack{height:2px!important}
  .acLockedWarrior{flex:0 0 26px!important;min-height:26px!important;padding:2px 5px!important;grid-template-columns:20px 1fr!important;gap:4px!important}
  .acLockedIcon{font-size:10px!important}.acLockedTitle{font-size:5px!important}.acLockedSub{font-size:4.2px!important}
  #acEarthShipPanel{height:100%!important;min-height:0!important;overflow:hidden!important}
  #acEarthShipLabel{font-size:6.5px!important;margin:0 0 2px!important;flex:0 0 auto!important}
  #acEarthShipShell{flex:1 1 auto!important;min-height:0!important;height:auto!important;padding:3px!important}
  #acEarthPlacementGrid{width:97%!important;height:96%!important;max-height:none!important;gap:3px!important}
  .acEarthPlaceSlot:before{font-size:16px!important}.acEarthPlaceSlot:after,.acEarthRoomName{font-size:4.3px!important}
  .acEarthPlaceSlot img{width:66%!important;height:66%!important;object-fit:contain!important}
  #acEarthDeployBtn{flex:0 0 29px!important;height:29px!important;margin-top:3px!important;font-size:8.5px!important}
  .acEarthHint{font-size:4.5px!important;margin-top:1px!important;line-height:1!important}
  #acEarthDragGhost{width:52px!important;height:62px!important}
  @media(max-height:430px) and (orientation:landscape){
    #characterOverlay.acEarthPlacement .characterPanel{grid-template-columns:minmax(196px,.56fr) minmax(0,1.84fr)!important;padding:4px!important;gap:5px!important}
    #characterOverlay.acEarthPlacement .characterTitle{font-size:11px!important}
    #characterOverlay.acEarthPlacement .characterText{display:none!important}
    #characterOverlay.acEarthPlacement #characterRoster .characterCard{flex-basis:52px!important;min-height:52px!important;max-height:52px!important;grid-template-columns:36px minmax(0,1fr)!important}
    #characterOverlay.acEarthPlacement #characterRoster .characterCard img{width:34px!important;height:45px!important}
    .acLockedWarrior{flex-basis:23px!important;min-height:23px!important}
    #acEarthDeployBtn{flex-basis:26px!important;height:26px!important}
    .acEarthHint{display:none!important}
  }`;
  const style = document.createElement('style');
  style.id = 'ac-v03220-touch-scroll-hotfix';
  style.textContent = css;
  document.head.appendChild(style);

  let activeTouch = null;
  let syntheticPointerId = 901;

  function dispatchPointer(type, target, x, y, pointerId){
    try{
      target.dispatchEvent(new PointerEvent(type,{
        bubbles:true,cancelable:true,clientX:x,clientY:y,
        pointerId,pointerType:'mouse',isPrimary:true,buttons:type==='pointerup'?0:1,button:0
      }));
    }catch{}
  }

  function installEarthTouchControls(){
    const roster = document.getElementById('characterRoster');
    if(!roster || roster.dataset.acTouch20 === '1') return;
    roster.dataset.acTouch20 = '1';

    roster.addEventListener('pointerdown',(e)=>{
      const card = e.target.closest?.('.characterCard');
      if(!card) return;
      const image = e.target.closest?.('.characterCard img');
      if(e.pointerType === 'touch'){
        e.stopImmediatePropagation();
        return;
      }
      if(!image) e.stopImmediatePropagation();
    },true);

    roster.addEventListener('touchstart',(e)=>{
      const image = e.target.closest?.('.characterCard img');
      if(!image) return;
      const touch = e.changedTouches?.[0];
      if(!touch) return;
      e.preventDefault();
      e.stopPropagation();
      syntheticPointerId += 1;
      activeTouch = {id:touch.identifier,pointerId:syntheticPointerId,image,x:touch.clientX,y:touch.clientY};
      dispatchPointer('pointerdown',image,touch.clientX,touch.clientY,syntheticPointerId);
    },{passive:false,capture:true});

    window.addEventListener('touchmove',(e)=>{
      if(!activeTouch) return;
      const touch = Array.from(e.changedTouches||[]).find(t=>t.identifier===activeTouch.id) || Array.from(e.touches||[]).find(t=>t.identifier===activeTouch.id);
      if(!touch) return;
      e.preventDefault();
      activeTouch.x=touch.clientX;activeTouch.y=touch.clientY;
      dispatchPointer('pointermove',document,touch.clientX,touch.clientY,activeTouch.pointerId);
    },{passive:false,capture:true});

    const finish=(e)=>{
      if(!activeTouch) return;
      const touch = Array.from(e.changedTouches||[]).find(t=>t.identifier===activeTouch.id);
      const x=touch?.clientX ?? activeTouch.x, y=touch?.clientY ?? activeTouch.y;
      e.preventDefault();
      dispatchPointer('pointerup',document,x,y,activeTouch.pointerId);
      activeTouch=null;
    };
    window.addEventListener('touchend',finish,{passive:false,capture:true});
    window.addEventListener('touchcancel',finish,{passive:false,capture:true});
  }

  const observer = new MutationObserver(()=>installEarthTouchControls());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  installEarthTouchControls();
})();