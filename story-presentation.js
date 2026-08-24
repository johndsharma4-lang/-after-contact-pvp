/* After Contact — isolated story presentation layer */
(() => {
  'use strict';
  const comic = document.getElementById('storyComic');
  const canvas = document.getElementById('storyPanelCanvas');
  const count = document.getElementById('storyPanelCount');
  const next = document.getElementById('storyFrameBtn');
  const start = document.getElementById('storyContinue');
  if (!comic || !canvas) return;

  const style = document.createElement('style');
  style.textContent = `
    /* Preserve the ORIGINAL crawl movement/position/keyframes.
       Only increase readability and shorten its existing startup delay. */
    #storyCrawl{font-size:clamp(34px,8.8vw,60px)!important;line-height:1.38!important}
    #storyCrawl p,#storyCrawl div,#storyCrawl span{font-size:inherit!important;line-height:inherit!important}
    #storyIntro.playing #storyCrawl{animation-delay:2.5s!important}
    @media (orientation:portrait){
      #storyCrawl{font-size:clamp(36px,9.4vw,58px)!important;line-height:1.36!important}
    }
    @media (orientation:landscape) and (max-height:520px){
      #storyCrawl{font-size:clamp(28px,5vw,42px)!important;line-height:1.32!important}
    }

    #storyComic{overflow:hidden!important;background:#000!important}
    #storyPanelCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border-radius:0!important;box-shadow:none!important;background:#000!important}
    #storyPanelCount{top:max(10px,env(safe-area-inset-top))!important;padding:7px 11px!important;border-radius:999px!important;background:rgba(0,0,0,.58)!important;text-shadow:0 2px 8px #000!important;z-index:4!important;pointer-events:none!important;white-space:nowrap!important}
    #storyFrameBtn,#storyContinue{bottom:max(16px,calc(env(safe-area-inset-bottom) + 8px))!important;z-index:5!important;min-width:154px!important;background:rgba(0,0,0,.74)!important;backdrop-filter:blur(7px)!important;-webkit-backdrop-filter:blur(7px)!important;box-shadow:0 8px 28px rgba(0,0,0,.48)!important}
    #storyFrameBtn:active,#storyContinue:active{transform:translateX(-50%) scale(.97)!important}
    #storyComic.lastFrame #storyPanelCount{display:none!important}
    #storyComic.lastFrame #storyContinue{display:block!important;min-width:210px!important;padding:14px 26px!important;border:1px solid rgba(255,255,255,.72)!important;background:linear-gradient(180deg,rgba(12,18,26,.90),rgba(2,5,9,.92))!important;color:#fff!important;font-size:12px!important;letter-spacing:.18em!important;text-shadow:0 1px 8px #000!important;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 10px 34px rgba(0,0,0,.65)!important}
    @media (orientation:landscape) and (max-height:520px){
      #storyPanelCount{font-size:8px!important;top:max(6px,env(safe-area-inset-top))!important;padding:5px 9px!important}
      #storyFrameBtn,#storyContinue{padding:9px 18px!important;bottom:max(6px,env(safe-area-inset-bottom))!important}
      #storyComic.lastFrame #storyContinue{padding:10px 22px!important;min-width:190px!important}
    }
  `;
  document.head.appendChild(style);

  function visibleBounds(src){
    const w=src.width,h=src.height;
    if(!w||!h)return{x:0,y:0,w,h};
    const ctx=src.getContext('2d',{willReadFrequently:true});
    let data;
    try{data=ctx.getImageData(0,0,w,h).data}catch{return{x:0,y:0,w,h}}
    const brightAt=(x,y)=>{const i=(y*w+x)*4;return data[i]+data[i+1]+data[i+2]>42};
    const rowHas=y=>{let hits=0,samples=0,step=Math.max(2,Math.floor(w/120));for(let x=0;x<w;x+=step){samples++;if(brightAt(x,y))hits++;}return hits>Math.max(1,samples*.018)};
    const colHas=x=>{let hits=0,samples=0,step=Math.max(2,Math.floor(h/80));for(let y=0;y<h;y+=step){samples++;if(brightAt(x,y))hits++;}return hits>Math.max(1,samples*.018)};
    let top=0,bottom=h-1,left=0,right=w-1;
    while(top<h-1&&!rowHas(top))top++;
    while(bottom>top&&!rowHas(bottom))bottom--;
    while(left<w-1&&!colHas(left))left++;
    while(right>left&&!colHas(right))right--;
    const padX=Math.round(w*.008),padY=Math.round(h*.008);
    left=Math.max(0,left-padX);right=Math.min(w-1,right+padX);top=Math.max(0,top-padY);bottom=Math.min(h-1,bottom+padY);
    return{x:left,y:top,w:Math.max(1,right-left+1),h:Math.max(1,bottom-top+1)};
  }

  function drawContainedPanel(){
    if(!comic.classList.contains('show')||!canvas.width||!canvas.height)return;
    const snapshot=document.createElement('canvas');
    snapshot.width=canvas.width;snapshot.height=canvas.height;
    snapshot.getContext('2d').drawImage(canvas,0,0);
    const b=visibleBounds(snapshot);
    const rect=comic.getBoundingClientRect();
    const cssW=Math.max(1,Math.round(rect.width||window.innerWidth));
    const cssH=Math.max(1,Math.round(rect.height||window.innerHeight));
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const outW=Math.round(cssW*dpr),outH=Math.round(cssH*dpr);
    const frame=Number(comic.dataset.frame||1);
    const landscape=cssW>cssH;
    canvas.width=outW;canvas.height=outH;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#000';ctx.fillRect(0,0,outW,outH);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    if(frame===15){
      const bgScale=Math.max(outW/b.w,outH/b.h);
      const bgW=b.w*bgScale,bgH=b.h*bgScale;
      ctx.save();ctx.globalAlpha=.34;ctx.filter=`blur(${Math.max(10,18*dpr)}px) brightness(.48)`;
      ctx.drawImage(snapshot,b.x,b.y,b.w,b.h,(outW-bgW)/2,(outH-bgH)/2,bgW,bgH);
      ctx.restore();
      const shade=ctx.createLinearGradient(0,0,0,outH);shade.addColorStop(0,'rgba(0,0,0,.16)');shade.addColorStop(.68,'rgba(0,0,0,.06)');shade.addColorStop(1,'rgba(0,0,0,.54)');ctx.fillStyle=shade;ctx.fillRect(0,0,outW,outH);
    }
    const sidePad=(landscape?0.025:0.035)*outW;
    const topPad=(landscape?0.055:0.075)*outH;
    const bottomPad=(landscape?0.12:0.105)*outH;
    const availW=Math.max(1,outW-sidePad*2);
    const availH=Math.max(1,outH-topPad-bottomPad);
    const scale=Math.min(availW/b.w,availH/b.h);
    const dw=b.w*scale,dh=b.h*scale;
    const dx=(outW-dw)/2;
    const dy=topPad+(availH-dh)/2;
    if(frame===15){
      ctx.save();ctx.shadowColor='rgba(0,0,0,.75)';ctx.shadowBlur=22*dpr;ctx.shadowOffsetY=6*dpr;
      ctx.drawImage(snapshot,b.x,b.y,b.w,b.h,dx,dy,dw,dh);ctx.restore();
    }else ctx.drawImage(snapshot,b.x,b.y,b.w,b.h,dx,dy,dw,dh);
  }

  const scheduleFit=()=>requestAnimationFrame(()=>requestAnimationFrame(drawContainedPanel));
  new MutationObserver(ms=>{if(ms.some(m=>m.attributeName==='data-frame'||m.attributeName==='class'))scheduleFit()}).observe(comic,{attributes:true,attributeFilter:['data-frame','class']});
  next?.addEventListener('pointerup',()=>setTimeout(scheduleFit,0));
  next?.addEventListener('click',()=>setTimeout(scheduleFit,0));
  window.addEventListener('resize',()=>setTimeout(scheduleFit,90),{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(scheduleFit,220),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>setTimeout(scheduleFit,90),{passive:true});
  if(count)count.setAttribute('aria-live','polite');
  if(start)start.setAttribute('aria-label','Start After Contact');
  scheduleFit();
})();
