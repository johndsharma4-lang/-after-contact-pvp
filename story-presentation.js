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
    /* Keep the original 43s reading speed. Only shorten the empty lead-in before the first words arrive. */
    #storyCrawlWrap{overflow:hidden!important}
    #storyCrawl{font-size:clamp(32px,5.2vw,48px)!important;line-height:1.46!important}
    #storyCrawl p,#storyCrawl span{font-size:inherit!important;line-height:inherit!important}
    #storyIntro.playing #storyCrawl{animation-duration:43s!important;animation-delay:-8s!important}
    @media (orientation:landscape) and (max-height:560px){#storyCrawl{font-size:clamp(30px,5vw,44px)!important;line-height:1.42!important}}

    /* Frames 1–14: one isolated panel only. */
    #storyComic{overflow:hidden!important;background:#030303!important}
    #storyPanelCanvas{position:absolute!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:auto!important;height:auto!important;max-width:calc(100vw - 18px)!important;max-height:calc(100vh - 64px)!important;aspect-ratio:960/620!important;border:0!important;border-radius:5px!important;box-shadow:0 12px 42px #000!important;background:#050505!important}
    #storyPanelCount{top:max(5px,env(safe-area-inset-top))!important;z-index:4!important;background:rgba(0,0,0,.62)!important;padding:5px 9px!important;border-radius:999px!important}
    #storyFrameBtn,#storyContinue{bottom:max(5px,env(safe-area-inset-bottom))!important;z-index:5!important;padding:9px 18px!important;min-width:145px!important;background:rgba(3,8,14,.88)!important}
    #storyComic.lastFrame{background:#000!important}
    #storyComic.lastFrame #storyPanelCanvas{width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;left:0!important;top:0!important;transform:none!important;border-radius:0!important;box-shadow:none!important;background:#000!important}
    #storyComic.lastFrame:after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,0) 46%,rgba(0,0,0,.16) 67%,rgba(0,0,0,.66))}
    #storyComic.lastFrame #storyPanelCount,#storyComic.lastFrame #storyFrameBtn{display:none!important}
    #storyComic.lastFrame #storyContinue{display:block!important;z-index:6!important;left:50%!important;bottom:max(18px,calc(env(safe-area-inset-bottom) + 10px))!important;min-width:min(310px,48vw)!important;height:50px!important;padding:0 30px!important;border:1px solid rgba(255,255,255,.76)!important;border-radius:999px!important;background:linear-gradient(180deg,rgba(12,20,30,.92),rgba(2,7,12,.94))!important;color:#fff!important;font-size:13px!important;font-weight:1000!important;letter-spacing:.22em!important}
    body.acStoryPortrait #rotate{display:flex!important;z-index:10000!important}
    body.acStoryPortrait #rotate .rotateCard p:after{content:' The story will continue automatically when your phone is sideways.'}
  `;
  document.head.appendChild(style);

  let pausedForPortrait=false;
  function isPortraitPhone(){return matchMedia('(orientation: portrait)').matches&&Math.min(innerWidth,innerHeight)<700;}
  function syncStoryOrientation(){
    if(!intro.classList.contains('show')){document.body.classList.remove('acStoryPortrait');pausedForPortrait=false;return;}
    const portrait=isPortraitPhone();
    document.body.classList.toggle('acStoryPortrait',portrait);
    if(portrait){if(intro.classList.contains('playing')){intro.classList.remove('playing');pausedForPortrait=true;}if(rotate)rotate.style.setProperty('display','flex','important');return;}
    if(rotate)rotate.style.removeProperty('display');
    if(pausedForPortrait){pausedForPortrait=false;void intro.offsetWidth;requestAnimationFrame(()=>intro.classList.add('playing'));}
  }
  new MutationObserver(syncStoryOrientation).observe(intro,{attributes:true,attributeFilter:['class']});
  addEventListener('orientationchange',()=>{setTimeout(syncStoryOrientation,60);setTimeout(syncStoryOrientation,260)});
  addEventListener('resize',()=>setTimeout(syncStoryOrientation,50),{passive:true});
  visualViewport?.addEventListener('resize',()=>setTimeout(syncStoryOrientation,50),{passive:true});
  if(count)count.setAttribute('aria-live','polite');
  if(start)start.setAttribute('aria-label','Start After Contact');
  syncStoryOrientation();
})();
