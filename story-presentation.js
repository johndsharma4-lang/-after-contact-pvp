/* After Contact — landscape-only story presentation */
(() => {
  'use strict';
  const intro=document.getElementById('storyIntro');
  const comic=document.getElementById('storyComic');
  const canvas=document.getElementById('storyPanelCanvas');
  const count=document.getElementById('storyPanelCount');
  const start=document.getElementById('storyContinue');
  const rotate=document.getElementById('rotate');
  if(!intro||!comic||!canvas)return;

  const style=document.createElement('style');
  style.textContent=`
    /* ORIGINAL crawl speed remains 43s. Only readability and the off-screen lead-in are adjusted. */
    #storyCrawl{font-size:clamp(32px,5.2vw,48px)!important;line-height:1.46!important}
    #storyCrawl p,#storyCrawl span{font-size:inherit!important;line-height:inherit!important}
    #storyIntro.playing #storyCrawl{animation-duration:43s!important;animation-delay:0s!important}
    @media (orientation:landscape) and (max-height:560px){#storyCrawl{font-size:clamp(30px,5vw,44px)!important;line-height:1.42!important}}

    /* Landscape comic: whole 960x620 rendered frame, centered and contained. */
    #storyComic{overflow:hidden!important;background:#050505!important}
    #storyPanelCanvas{position:absolute!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:auto!important;height:auto!important;max-width:calc(100vw - 20px)!important;max-height:calc(100vh - 74px)!important;aspect-ratio:960/620!important;border:0!important;border-radius:8px!important;box-shadow:0 12px 42px #000!important;background:#050505!important}
    #storyPanelCount{top:max(7px,env(safe-area-inset-top))!important;z-index:4!important;background:rgba(0,0,0,.58)!important;padding:5px 9px!important;border-radius:999px!important}
    #storyFrameBtn,#storyContinue{bottom:max(7px,env(safe-area-inset-bottom))!important;z-index:5!important;padding:9px 18px!important;min-width:145px!important;background:rgba(3,8,14,.88)!important}
    #storyComic.lastFrame #storyPanelCount{display:none!important}
    #storyComic.lastFrame #storyContinue{display:block!important;min-width:210px!important}

    /* During the story, portrait is not a supported layout. */
    body.acStoryPortrait #rotate{display:flex!important;z-index:10000!important}
    body.acStoryPortrait #rotate .rotateCard p:after{content:' The story will continue automatically when your phone is sideways.'}
  `;
  document.head.appendChild(style);

  let pausedForPortrait=false;
  function isPortraitPhone(){return matchMedia('(orientation: portrait)').matches && Math.min(innerWidth,innerHeight)<700;}
  function syncStoryOrientation(){
    if(!intro.classList.contains('show')){document.body.classList.remove('acStoryPortrait');pausedForPortrait=false;return;}
    const portrait=isPortraitPhone();
    document.body.classList.toggle('acStoryPortrait',portrait);
    if(portrait){
      if(intro.classList.contains('playing')){intro.classList.remove('playing');pausedForPortrait=true;}
      if(rotate)rotate.style.setProperty('display','flex','important');
      return;
    }
    if(rotate)rotate.style.removeProperty('display');
    if(pausedForPortrait){
      pausedForPortrait=false;
      /* Restart the crawl cleanly once landscape is reached. */
      void intro.offsetWidth;
      requestAnimationFrame(()=>intro.classList.add('playing'));
    }
  }

  new MutationObserver(syncStoryOrientation).observe(intro,{attributes:true,attributeFilter:['class']});
  addEventListener('orientationchange',()=>{setTimeout(syncStoryOrientation,60);setTimeout(syncStoryOrientation,260)});
  addEventListener('resize',()=>setTimeout(syncStoryOrientation,50),{passive:true});
  visualViewport?.addEventListener('resize',()=>setTimeout(syncStoryOrientation,50),{passive:true});
  if(count)count.setAttribute('aria-live','polite');
  if(start)start.setAttribute('aria-label','Start After Contact');
  syncStoryOrientation();
})();
