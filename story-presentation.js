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
    #storyComic{overflow:hidden!important;background:#000!important}
    #storyPanelCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border-radius:0!important;box-shadow:none!important;background:#000!important}
    #storyPanelCount{top:max(12px,env(safe-area-inset-top))!important;padding:7px 11px!important;border-radius:999px!important;background:rgba(0,0,0,.52)!important;text-shadow:0 2px 8px #000!important;z-index:4!important;pointer-events:none!important}
    #storyFrameBtn,#storyContinue{bottom:max(18px,calc(env(safe-area-inset-bottom) + 10px))!important;z-index:5!important;min-width:150px!important;background:rgba(0,0,0,.72)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;box-shadow:0 8px 28px rgba(0,0,0,.45)!important}
    #storyFrameBtn:active,#storyContinue:active{transform:translateX(-50%) scale(.97)!important}
    @media (orientation:landscape) and (max-height:520px){#storyPanelCount{font-size:8px!important;top:max(7px,env(safe-area-inset-top))!important}#storyFrameBtn,#storyContinue{padding:9px 18px!important;bottom:max(7px,env(safe-area-inset-bottom))!important}}
  `;
  document.head.appendChild(style);

  const FRAME_FOCUS = {
    1:[.5,.5],2:[.5,.5],3:[.5,.5],4:[.5,.5],5:[.5,.5],6:[.5,.5],7:[.5,.5],8:[.5,.5],9:[.5,.5],10:[.5,.5],11:[.5,.5],12:[.5,.5],13:[.5,.5],14:[.5,.5],15:[.5,.5]
  };

  function visibleBounds(src){
    const w=src.width,h=src.height;if(!w||!h)return{x:0,y:0,w,h};
    const ctx=src.getContext('2d',{willReadFrequently:true});let data;
    try{data=ctx.getImageData(0,0,w,h).data}catch{return{x:0,y:0,w,h}}
    const brightAt=(x,y)=>{const i=(y*w+x)*4;return data[i]+data[i+1]+data[i+2]>42};
    const rowHas=y=>{let hits=0,samples=0,step=Math.max(2,Math.floor(w/120));for(let x=0;x<w;x+=step){samples++;if(brightAt(x,y))hits++;}return hits>Math.max(1,samples*.018)};
    const colHas=x=>{let hits=0,samples=0,step=Math.max(2,Math.floor(h/80));for(let y=0;y<h;y+=step){samples++;if(brightAt(x,y))hits++;}return hits>Math.max(1,samples*.018)};
    let top=0,bottom=h-1,left=0,right=w-1;
    while(top<h-1&&!rowHas(top))top++;while(bottom>top&&!rowHas(bottom))bottom--;while(left<w-1&&!colHas(left))left++;while(right>left&&!colHas(right))right--;
    const padX=Math.round(w*.006),padY=Math.round(h*.006);left=Math.max(0,left-padX);right=Math.min(w-1,right+padX);top=Math.max(0,top-padY);bottom=Math.min(h-1,bottom+padY);
    return{x:left,y:top,w:Math.max(1,right-left+1),h:Math.max(1,bottom-top+1)};
  }

  function coverCurrentPanel(){
    if(!comic.classList.contains('show')||!canvas.width||!canvas.height)return;
    const snapshot=document.createElement('canvas');snapshot.width=canvas.width;snapshot.height=canvas.height;snapshot.getContext('2d').drawImage(canvas,0,0);
    const b=visibleBounds(snapshot);const rect=comic.getBoundingClientRect();const cssW=Math.max(320,Math.round(rect.width||innerWidth));const cssH=Math.max(180,Math.round(rect.height||innerHeight));const dpr=Math.min(2,window.devicePixelRatio||1);const outW=Math.round(cssW*dpr),outH=Math.round(cssH*dpr);
    const frame=Number(comic.dataset.frame||1),focus=FRAME_FOCUS[frame]||[.5,.5],scale=Math.max(outW/b.w,outH/b.h),cropW=outW/scale,cropH=outH/scale,maxX=Math.max(0,b.w-cropW),maxY=Math.max(0,b.h-cropH),sx=b.x+maxX*Math.max(0,Math.min(1,focus[0])),sy=b.y+maxY*Math.max(0,Math.min(1,focus[1]));
    canvas.width=outW;canvas.height=outH;const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,outW,outH);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(snapshot,sx,sy,cropW,cropH,0,0,outW,outH);
  }

  const scheduleFit=()=>requestAnimationFrame(()=>requestAnimationFrame(coverCurrentPanel));
  new MutationObserver(ms=>{if(ms.some(m=>m.attributeName==='data-frame'||m.attributeName==='class'))scheduleFit()}).observe(comic,{attributes:true,attributeFilter:['data-frame','class']});
  next?.addEventListener('pointerup',()=>setTimeout(scheduleFit,0));next?.addEventListener('click',()=>setTimeout(scheduleFit,0));window.addEventListener('resize',()=>setTimeout(scheduleFit,80),{passive:true});window.addEventListener('orientationchange',()=>setTimeout(scheduleFit,180),{passive:true});
  if(count)count.setAttribute('aria-live','polite');if(start)start.setAttribute('aria-label','Start After Contact');scheduleFit();
})();
