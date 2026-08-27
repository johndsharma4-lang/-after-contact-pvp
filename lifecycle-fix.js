// AFTER CONTACT v0.32.12c - browser lifecycle audio guard
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
