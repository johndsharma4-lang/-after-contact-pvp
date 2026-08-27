// AFTER CONTACT v0.32.19 - browser lifecycle audio guard + Earth deployment hotfix
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
  #characterOverlay.acEarthPlacement .characterPanel{height:calc(100dvh - 12px)!important;max-height:calc(100dvh - 12px)!important;grid-template-columns:minmax(220px,.62fr) minmax(0,1.72fr)!important;align-items:stretch!important}
  #acEarthRosterPane{height:100%!important;max-height:100%!important;min-height:0!important;overflow:hidden!important}
  #characterOverlay.acEarthPlacement .characterIntro{flex:0 0 auto!important;padding:0 3px 3px!important}
  #characterOverlay.acEarthPlacement .characterKicker{font-size:6px!important}
  #characterOverlay.acEarthPlacement .characterTitle{font-size:14px!important;line-height:.94!important;margin-top:2px!important}
  #characterOverlay.acEarthPlacement .characterText{font-size:5.7px!important;line-height:1.15!important;margin-top:3px!important;max-width:36ch!important}
  #characterOverlay.acEarthPlacement #characterRoster{flex:1 1 0!important;height:0!important;min-height:0!important;max-height:none!important;overflow-y:scroll!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;overscroll-behavior:contain!important;padding-right:4px!important;scrollbar-width:thin!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterCard{flex:0 0 68px!important;min-height:68px!important;max-height:68px!important;grid-template-columns:46px minmax(0,1fr)!important;padding:4px!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterCard img{width:44px!important;height:60px!important;cursor:grab!important;touch-action:none!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterName{font-size:7.5px!important}
  #characterOverlay.acEarthPlacement #characterRoster .characterWeapon{font-size:4.7px!important}
  .acEarthDesc{font-size:4.7px!important;line-height:1.1!important}
  .acStatLabel{font-size:4.2px!important}.acStatTrack{height:2.5px!important}
  .acLockedWarrior{flex:0 0 29px!important;min-height:29px!important;padding:3px 6px!important}
  .acLockedIcon{font-size:11px!important}.acLockedTitle{font-size:5.5px!important}.acLockedSub{font-size:4.6px!important}
  #acEarthShipPanel{height:100%!important;min-height:0!important;overflow:hidden!important}
  #acEarthShipLabel{font-size:7px!important;margin:0 0 2px!important;flex:0 0 auto!important}
  #acEarthShipShell{flex:1 1 0!important;height:0!important;min-height:0!important;padding:4px!important}
  #acEarthPlacementGrid{width:96%!important;height:96%!important;max-height:none!important;gap:4px!important}
  .acEarthPlaceSlot:before{font-size:18px!important}.acEarthPlaceSlot:after,.acEarthRoomName{font-size:4.7px!important}
  .acEarthPlaceSlot img{width:72%!important;height:72%!important}
  #acEarthDeployBtn{flex:0 0 31px!important;height:31px!important;margin-top:3px!important;font-size:9px!important}
  .acEarthHint{font-size:5px!important;margin-top:1px!important;line-height:1!important}
  @media(max-height:430px) and (orientation:landscape){
    #characterOverlay.acEarthPlacement .characterPanel{grid-template-columns:minmax(205px,.58fr) minmax(0,1.78fr)!important;padding:4px!important;gap:5px!important}
    #characterOverlay.acEarthPlacement .characterTitle{font-size:12px!important}
    #characterOverlay.acEarthPlacement .characterText{display:none!important}
    #characterOverlay.acEarthPlacement #characterRoster .characterCard{flex-basis:60px!important;min-height:60px!important;max-height:60px!important}
    #characterOverlay.acEarthPlacement #characterRoster .characterCard img{height:52px!important;width:40px!important}
    #acEarthDeployBtn{flex-basis:28px!important;height:28px!important}
    .acEarthHint{display:none!important}
  }`;
  const style = document.createElement('style');
  style.id = 'ac-v03219-scroll-fit-hotfix';
  style.textContent = css;
  document.head.appendChild(style);

  function installRosterTouchFix(){
    const roster = document.getElementById('characterRoster');
    if(!roster || roster.dataset.acScrollFix === '1') return;
    roster.dataset.acScrollFix = '1';
    roster.addEventListener('pointerdown', (e) => {
      const card = e.target.closest?.('.characterCard');
      if(!card) return;
      const image = e.target.closest?.('.characterCard img');
      if(!image){
        e.stopImmediatePropagation();
      }
    }, true);
    roster.addEventListener('touchmove', () => {}, {passive:true});
  }

  const observer = new MutationObserver(() => installRosterTouchFix());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  installRosterTouchFix();
})();