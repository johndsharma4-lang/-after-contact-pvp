/* After Contact — isolated story presentation layer */
(() => {
  'use strict';
  const comic=document.getElementById('storyComic'),canvas=document.getElementById('storyPanelCanvas'),count=document.getElementById('storyPanelCount'),next=document.getElementById('storyFrameBtn'),start=document.getElementById('storyContinue');
  if(!comic||!canvas)return;
  const style=document.createElement('style');
  style.textContent=`
    /* Keep the original Star-Wars crawl. Only typography + short delay are overridden. */
    #storyCrawl{font-size:clamp(34px,8.8vw,60px)!important;line-height:1.34!important}
    #storyCrawl p,#storyCrawl div,#storyCrawl span{font-size:inherit!important;line-height:inherit!important}
    #storyIntro.playing #storyCrawl{animation-delay:2.5s!important}
    @media (orientation:portrait){#storyCrawl{font-size:clamp(46px,12.5vw,68px)!important;line-height:1.28!important}}
    @media (orientation:landscape) and (max-height:520px){#storyCrawl{font-size:clamp(28px,5vw,42px)!important;line-height:1.32!important}}

    #storyComic{overflow:hidden!important;background:#000!important}
    #storyPanelCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#000!important}
    #storyPanelCount{top:max(10px,env(safe-area-inset-top))!important;padding:7px 11px!important;border-radius:999px!important;background:rgba(0,0,0,.58)!important;text-shadow:0 2px 8px #000!important;z-index:4!important;pointer-events:none!important;white-space:nowrap!important}
    #storyFrameBtn,#storyContinue{bottom:max(16px,calc(env(safe-area-inset-bottom) + 8px))!important;z-index:5!important;min-width:154px!important;background:rgba(0,0,0,.74)!important;backdrop-filter:blur(7px)!important;-webkit-backdrop-filter:blur(7px)!important;box-shadow:0 8px 28px rgba(0,0,0,.48)!important}
    #storyFrameBtn:active,#storyContinue:active{transform:translateX(-50%) scale(.97)!important}
    #storyComic.lastFrame #storyPanelCount{display:none!important}
    #storyComic.lastFrame #storyContinue{display:block!important;min-width:210px!important;padding:14px 26px!important;border:1px solid rgba(255,255,255,.72)!important;background:linear-gradient(180deg,rgba(12,18,26,.90),rgba(2,5,9,.92))!important;color:#fff!important;font-size:12px!important;letter-spacing:.18em!important;text-shadow:0 1px 8px #000!important;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 10px 34px rgba(0,0,0,.65)!important}
  `;document.head.appendChild(style);

  /* The comic renderer already draws the current frame onto this canvas. We preserve that exact
     rendered frame, then fit the WHOLE frame into the real visible phone viewport. No content
     detection/cropping: that was the source of the ugly chopped/duplicated framing. */
  let lastSource=null,lastFrame=0,painting=false;
  function captureSource(){
    if(painting||!canvas.width||!canvas.height)return;
    const f=Number(comic.dataset.frame||1);
    /* Capture only when the underlying story renderer has produced a new frame. */
    if(f===lastFrame&&lastSource)return;
    const s=document.createElement('canvas');s.width=canvas.width;s.height=canvas.height;
    s.getContext('2d').drawImage(canvas,0,0);lastSource=s;lastFrame=f;
  }
  function fitPanel(){
    if(!comic.classList.contains('show'))return;
    captureSource();if(!lastSource)return;
    const rect=comic.getBoundingClientRect(),cssW=Math.max(1,Math.round(rect.width||innerWidth)),cssH=Math.max(1,Math.round(rect.height||innerHeight)),dpr=Math.min(2,devicePixelRatio||1),W=Math.round(cssW*dpr),H=Math.round(cssH*dpr),f=Number(comic.dataset.frame||1),land=cssW>cssH;
    painting=true;canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const src=lastSource,marginX=(land?.025:.025)*W,top=(land?.035:.035)*H,bottom=(land?.13:.10)*H,aw=W-marginX*2,ah=H-top-bottom,scale=Math.min(aw/src.width,ah/src.height),dw=src.width*scale,dh=src.height*scale,dx=(W-dw)/2,dy=top+(ah-dh)/2;
    if(f===15){const bg=Math.max(W/src.width,H/src.height),bw=src.width*bg,bh=src.height*bg;ctx.save();ctx.globalAlpha=.24;ctx.filter=`blur(${14*dpr}px) brightness(.42)`;ctx.drawImage(src,(W-bw)/2,(H-bh)/2,bw,bh);ctx.restore();}
    ctx.drawImage(src,dx,dy,dw,dh);painting=false;
  }
  const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(fitPanel));
  new MutationObserver(ms=>{if(ms.some(m=>m.attributeName==='data-frame')){lastSource=null;lastFrame=0;setTimeout(schedule,35)}else if(ms.some(m=>m.attributeName==='class'))setTimeout(schedule,35)}).observe(comic,{attributes:true,attributeFilter:['data-frame','class']});
  next?.addEventListener('click',()=>setTimeout(schedule,55));next?.addEventListener('pointerup',()=>setTimeout(schedule,55));
  addEventListener('resize',()=>setTimeout(schedule,100),{passive:true});addEventListener('orientationchange',()=>setTimeout(schedule,240),{passive:true});visualViewport?.addEventListener('resize',()=>setTimeout(schedule,100),{passive:true});
  if(count)count.setAttribute('aria-live','polite');if(start)start.setAttribute('aria-label','Start After Contact');schedule();
})();
