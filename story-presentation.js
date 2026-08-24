/* After Contact — story presentation: mobile readability + simple whole-frame fit */
(() => {
  'use strict';
  const comic=document.getElementById('storyComic');
  const canvas=document.getElementById('storyPanelCanvas');
  const count=document.getElementById('storyPanelCount');
  const start=document.getElementById('storyContinue');
  if(!comic||!canvas)return;

  const style=document.createElement('style');
  style.textContent=`
    /* Keep the original Star-Wars keyframes/direction, but make the experience quick.
       The animation itself is capped at 18 seconds and begins after 1 second. */
    #storyCrawl{font-size:clamp(38px,9.5vw,64px)!important;line-height:1.30!important}
    #storyCrawl p,#storyCrawl div,#storyCrawl span{font-size:inherit!important;line-height:inherit!important}
    #storyIntro.playing #storyCrawl{animation-delay:1s!important;animation-duration:18s!important}
    @media (orientation:portrait){
      #storyCrawl{font-size:clamp(52px,14vw,76px)!important;line-height:1.22!important}
    }
    @media (orientation:landscape) and (max-height:520px){
      #storyCrawl{font-size:clamp(28px,5vw,42px)!important;line-height:1.30!important}
    }

    /* Canvas is only a viewport. The story renderer remains responsible for drawing each frame. */
    #storyComic{overflow:hidden!important;background:#000!important}
    #storyPanelCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#000!important}
    #storyPanelCount{top:max(10px,env(safe-area-inset-top))!important;padding:7px 11px!important;border-radius:999px!important;background:rgba(0,0,0,.58)!important;text-shadow:0 2px 8px #000!important;z-index:4!important;pointer-events:none!important;white-space:nowrap!important}
    #storyFrameBtn,#storyContinue{bottom:max(16px,calc(env(safe-area-inset-bottom) + 8px))!important;z-index:5!important;min-width:154px!important;background:rgba(0,0,0,.74)!important;backdrop-filter:blur(7px)!important;-webkit-backdrop-filter:blur(7px)!important;box-shadow:0 8px 28px rgba(0,0,0,.48)!important}
    #storyFrameBtn:active,#storyContinue:active{transform:translateX(-50%) scale(.97)!important}
    #storyComic.lastFrame #storyPanelCount{display:none!important}
    #storyComic.lastFrame #storyContinue{display:block!important;min-width:210px!important;padding:14px 26px!important;border:1px solid rgba(255,255,255,.72)!important;background:rgba(3,8,14,.88)!important;color:#fff!important;font-size:12px!important;letter-spacing:.18em!important;text-shadow:0 1px 8px #000!important;box-shadow:0 10px 34px rgba(0,0,0,.65)!important}
  `;
  document.head.appendChild(style);

  /* IMPORTANT: do not redraw the live story canvas into itself.
     That was degrading/duplicating frames. We only resize the canvas's CSS box so the ORIGINAL
     frame produced by index.html is shown proportionally inside the available phone viewport. */
  function fitCanvasBox(){
    if(!comic.classList.contains('show')||!canvas.width||!canvas.height)return;
    const r=comic.getBoundingClientRect();
    const vw=Math.max(1,r.width||innerWidth),vh=Math.max(1,r.height||innerHeight);
    const landscape=vw>vh;
    const top=landscape?8:12;
    const bottom=landscape?58:72;
    const availW=vw-12;
    const availH=Math.max(1,vh-top-bottom);
    const sourceRatio=canvas.width/canvas.height;
    const boxRatio=availW/availH;
    let w,h;
    if(sourceRatio>boxRatio){w=availW;h=w/sourceRatio;}else{h=availH;w=h*sourceRatio;}
    canvas.style.setProperty('width',`${Math.floor(w)}px`,'important');
    canvas.style.setProperty('height',`${Math.floor(h)}px`,'important');
    canvas.style.setProperty('left','50%','important');
    canvas.style.setProperty('top',`${Math.floor(top+(availH-h)/2)}px`,'important');
    canvas.style.setProperty('right','auto','important');
    canvas.style.setProperty('bottom','auto','important');
    canvas.style.setProperty('transform','translateX(-50%)','important');
  }

  const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(fitCanvasBox));
  new MutationObserver(()=>setTimeout(schedule,30)).observe(comic,{attributes:true,attributeFilter:['data-frame','class']});
  addEventListener('resize',()=>setTimeout(schedule,80),{passive:true});
  addEventListener('orientationchange',()=>setTimeout(schedule,200),{passive:true});
  visualViewport?.addEventListener('resize',()=>setTimeout(schedule,80),{passive:true});
  if(count)count.setAttribute('aria-live','polite');
  if(start)start.setAttribute('aria-label','Start After Contact');
  schedule();
})();
