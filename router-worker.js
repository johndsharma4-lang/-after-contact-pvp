import baseWorker from './after-contact-worker.js';
export { MyDurableObject } from './after-contact-worker.js';

function isDocumentRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return url.pathname === '/' || url.pathname === '/index.html';
}

function documentHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=UTF-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate');
  headers.set('x-content-type-options', 'nosniff');
  headers.delete('content-disposition');
  return headers;
}

class StoryPresentationInjector {
  element(element) {
    element.append(`
      <style>
        #storyPanelCount{display:none!important}
        body.acStorySuppressed #storyIntro,
        body.acStorySuppressed #storyComic{display:none!important;opacity:0!important;pointer-events:none!important}
      </style>
      <script src="/story-presentation.js?v=20260824-9"></script>
      <script>
      (()=>{
        const intro=document.getElementById('storyIntro');
        const comic=document.getElementById('storyComic');
        const canvas=document.getElementById('storyPanelCanvas');
        const count=document.getElementById('storyPanelCount');
        const solo=document.getElementById('mpSoloBtn');
        const replay=document.getElementById('replayStoryBtn');
        if(!intro||!comic||!canvas)return;

        const fixedFive=new Image();
        fixedFive.decoding='async';
        fixedFive.src='/story-panels/panel-05-v2.webp?v=20260824-9';

        function drawFixedFive(){
          if(!comic.classList.contains('show')||comic.classList.contains('acStartMenu'))return;
          if(!fixedFive.complete||!fixedFive.naturalWidth){fixedFive.onload=drawFixedFive;return;}
          const r=comic.getBoundingClientRect();
          if(!r.width||!r.height)return;
          const dpr=Math.min(devicePixelRatio||1,2);
          const w=Math.max(1,Math.round(r.width*dpr));
          const h=Math.max(1,Math.round(r.height*dpr));
          canvas.width=w;canvas.height=h;
          const ctx=canvas.getContext('2d');
          ctx.clearRect(0,0,w,h);ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
          const s=Math.min(w/fixedFive.naturalWidth,h/fixedFive.naturalHeight);
          const dw=fixedFive.naturalWidth*s,dh=fixedFive.naturalHeight*s;
          ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
          ctx.drawImage(fixedFive,(w-dw)/2,(h-dh)/2,dw,dh);
        }

        if(count){
          const watchFive=()=>{
            if(/^5\s*\/\s*7/.test((count.textContent||'').trim())){
              drawFixedFive();
              setTimeout(drawFixedFive,100);
              setTimeout(drawFixedFive,500);
            }
          };
          new MutationObserver(watchFive).observe(count,{childList:true,subtree:true,characterData:true});
          watchFive();
        }

        function hardEndStoryBeforeSolo(){
          try{ if(typeof window.endStoryIntro==='function') window.endStoryIntro(); }catch{}
          document.body.classList.add('acStorySuppressed');
          intro.classList.remove('show','playing');
          intro.setAttribute('aria-hidden','true');
          comic.classList.remove('show','lastFrame','acStartMenu');
          comic.style.display='none';
          comic.style.pointerEvents='none';
          const ctx=canvas.getContext('2d');
          if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);
        }

        function restoreStory(){
          document.body.classList.remove('acStorySuppressed');
          comic.style.removeProperty('display');
          comic.style.removeProperty('pointer-events');
        }

        solo?.addEventListener('pointerdown',hardEndStoryBeforeSolo,true);
        replay?.addEventListener('pointerdown',restoreStory,true);
        replay?.addEventListener('click',restoreStory,true);
      })();
      </script>
    `, { html: true });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (isDocumentRequest(request, url)) {
      const indexUrl = new URL('/index.html', url);
      const assetRequest = new Request(indexUrl.toString(), {
        method: request.method,
        headers: request.headers,
      });

      const assetResponse = await env.ASSETS.fetch(assetRequest);
      const headers = documentHeaders(assetResponse);

      if (request.method === 'HEAD') {
        return new Response(null, {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers,
        });
      }

      const transformed = new HTMLRewriter()
        .on('body', new StoryPresentationInjector())
        .transform(assetResponse);

      return new Response(transformed.body, {
        status: transformed.status,
        statusText: transformed.statusText,
        headers,
      });
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
