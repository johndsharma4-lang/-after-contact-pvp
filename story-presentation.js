/* After Contact — approved story presentation */
(() => {
  'use strict';

  const intro=document.getElementById('storyIntro');
  const comic=document.getElementById('storyComic');
  const canvas=document.getElementById('storyPanelCanvas');
  const count=document.getElementById('storyPanelCount');
  const nextButton=document.getElementById('storyFrameBtn');
  const continueButton=document.getElementById('storyContinue');
  const mpOverlay=document.getElementById('mpOverlay');
  const soloButton=document.getElementById('mpSoloBtn');
  const hostButton=document.getElementById('mpHostBtn');
  const joinButton=document.getElementById('mpJoinBtn');
  const replayButton=document.getElementById('replayStoryBtn');
  if(!intro||!comic||!canvas)return;

  const ASSET_VERSION='20260824-8';
  const PANELS=[
    `/story-panels/panel-01.webp?v=${ASSET_VERSION}`,
    `/story-panels/panel-02.webp?v=${ASSET_VERSION}`,
    `/story-panels/panel-03.webp?v=${ASSET_VERSION}`,
    `/story-panels/panel-04.webp?v=${ASSET_VERSION}`,
    `/story-panels/panel-05-v2.webp?v=${ASSET_VERSION}`,
    `/story-panels/panel-06.webp?v=${ASSET_VERSION}`,
    `/story-panels/panel-07.webp?v=${ASSET_VERSION}`
  ];

  const imageCache=new Map();
  let panelIndex=0;
  let customSequenceActive=false;
  let storyArmed=false;
  let pendingLandscapeStart=null;
  let crawlWasPlaying=false;
  let preloadPromise=null;

  const style=document.createElement('style');
  style.textContent=`
    #storyPanelCount{display:none!important}
    #storyCrawlWrap{overflow:hidden!important}
    #storyCrawl{font-size:clamp(32px,5.2vw,48px)!important;line-height:1.46!important}
    #storyCrawl p,#storyCrawl span{font-size:inherit!important;line-height:inherit!important}
    #storyIntro.playing #storyCrawl{animation-duration:43s!important;animation-delay:-8s!important}

    #storyComic{overflow:hidden!important;background:#000!important}
    #storyPanelCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;transform:none!important;border:0!important;border-radius:0!important;background:#000!important;box-shadow:none!important}
    #storyFrameBtn,#storyContinue{z-index:8!important;bottom:max(10px,calc(env(safe-area-inset-bottom) + 4px))!important}

    body.acGameplayMode #storyIntro{display:none!important;opacity:0!important;pointer-events:none!important;visibility:hidden!important}

    #acStartMenu{position:absolute;inset:0;z-index:6;display:none;align-items:center;justify-content:center;flex-direction:column;background:radial-gradient(circle at 50% 45%,rgba(120,0,0,.13),transparent 42%),linear-gradient(180deg,#020202,#080808 62%,#010101);text-align:center;padding:3vh 5vw calc(4vh + env(safe-area-inset-bottom));overflow:hidden}
    #storyComic.acStartMenu #acStartMenu{display:flex}
    #storyComic.acStartMenu #storyPanelCanvas,#storyComic.acStartMenu #storyPanelCount,#storyComic.acStartMenu #storyFrameBtn{display:none!important}
    #acStartTitle{font-size:min(8.2vw,18vh);line-height:.9;font-weight:1000;letter-spacing:.012em;color:#f5f3ef;text-shadow:0 5px 28px #000;margin:0;white-space:nowrap;max-width:92vw}
    #acStartSubtitle{margin-top:2.5vh;font-size:min(2.5vw,6vh);font-weight:1000;letter-spacing:.15em;color:#c51e24;text-transform:uppercase;white-space:nowrap}
    #acStartTap{margin-top:4vh;font-size:min(1.8vw,4.2vh);font-weight:900;letter-spacing:.16em;color:#ddd;animation:acStartPulse 1.45s ease-in-out infinite alternate}
    #acStartDisclaimer{position:absolute;left:5vw;right:5vw;bottom:max(7px,env(safe-area-inset-bottom));font-size:min(.82vw,2vh);line-height:1.25;font-weight:800;letter-spacing:.05em;color:#8f8f8f;text-transform:uppercase}
    @keyframes acStartPulse{from{opacity:.48}to{opacity:1}}
    @media (orientation:landscape) and (max-height:430px){
      #acStartTitle{font-size:min(7.4vw,17vh)}
      #acStartSubtitle{margin-top:2vh;font-size:min(2.15vw,5.2vh)}
      #acStartTap{margin-top:3vh;font-size:min(1.6vw,3.8vh)}
      #acStartDisclaimer{font-size:min(.72vw,1.7vh)}
    }

    #acOrientationGate{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 30%,#10243a 0,#07111d 42%,#02070d 100%);padding:24px;color:white;text-align:center;touch-action:none}
    body.acGlobalPortrait #acOrientationGate{display:flex!important}
    #acOrientationCard{width:min(88vw,440px);padding:28px 24px;border:1px solid rgba(116,217,255,.35);border-radius:22px;background:rgba(3,13,25,.96);box-shadow:0 24px 70px rgba(0,0,0,.6)}
    #acOrientationIcon{font-size:58px;line-height:1;margin-bottom:14px;transform:rotate(90deg)}
    #acOrientationTitle{font-size:23px;font-weight:1000;letter-spacing:.08em}
    #acOrientationText{margin-top:10px;font-size:14px;line-height:1.45;color:#c8d4df}
    #acOrientationHint{margin-top:14px;font-size:11px;font-weight:900;letter-spacing:.13em;color:#74d9ff}
  `;
  document.head.appendChild(style);

  const gate=document.createElement('div');
  gate.id='acOrientationGate';
  gate.innerHTML='<div id="acOrientationCard"><div id="acOrientationIcon">📱</div><div id="acOrientationTitle">TURN YOUR PHONE SIDEWAYS</div><div id="acOrientationText">After Contact is designed for landscape play. Rotate your phone to continue.</div><div id="acOrientationHint">THE GAME WILL START WHEN YOUR PHONE IS SIDEWAYS</div></div>';
  document.body.appendChild(gate);

  const startMenu=document.createElement('div');
  startMenu.id='acStartMenu';
  startMenu.innerHTML='<div id="acStartTitle">AFTER CONTACT</div><div id="acStartSubtitle">THE WAR FOR AETHERIUM</div><div id="acStartTap">TAP TO CONTINUE</div><div id="acStartDisclaimer">AFTER CONTACT IS A WORK OF FICTION. CHARACTERS, GOVERNMENTS, EVENTS AND ORGANIZATIONS DEPICTED IN THE GAME ARE FICTIONAL OR USED FICTITIOUSLY.</div>';
  comic.appendChild(startMenu);

  function isPortraitPhone(){
    return matchMedia('(orientation: portrait)').matches&&Math.min(innerWidth,innerHeight)<700;
  }

  function hardCloseStoryForGameplay(){
    document.body.classList.add('acGameplayMode');
    customSequenceActive=false;
    storyArmed=false;
    pendingLandscapeStart=null;
    crawlWasPlaying=false;
    intro.classList.remove('show','playing');
    intro.setAttribute('aria-hidden','true');
    comic.classList.remove('show','lastFrame','acStartMenu');
    comic.style.pointerEvents='none';
    if(continueButton)continueButton.style.removeProperty('display');
    const ctx=canvas.getContext('2d');
    if(ctx){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);}
  }

  function allowStoryAgain(){
    document.body.classList.remove('acGameplayMode');
    comic.style.removeProperty('pointer-events');
  }

  function syncGlobalOrientation(){
    const portrait=isPortraitPhone();
    document.body.classList.toggle('acGlobalPortrait',portrait);
    if(!portrait&&pendingLandscapeStart&&originalStartStoryIntro){
      const p=pendingLandscapeStart;
      pendingLandscapeStart=null;
      originalStartStoryIntro.apply(p.thisArg,p.args);
    }
    if(!portrait&&crawlWasPlaying&&intro.classList.contains('show')){
      crawlWasPlaying=false;
      void intro.offsetWidth;
      requestAnimationFrame(()=>intro.classList.add('playing'));
    }
    if(portrait&&intro.classList.contains('playing')){
      intro.classList.remove('playing');
      crawlWasPlaying=true;
    }
  }

  const originalStartStoryIntro=typeof window.startStoryIntro==='function'?window.startStoryIntro:null;
  if(originalStartStoryIntro){
    window.startStoryIntro=function(...args){
      allowStoryAgain();
      storyArmed=true;
      if(isPortraitPhone()){
        pendingLandscapeStart={thisArg:this,args};
        syncGlobalOrientation();
        return false;
      }
      pendingLandscapeStart=null;
      return originalStartStoryIntro.apply(this,args);
    };
  }

  function retryUrl(src){return src+(src.includes('?')?'&':'?')+'retry=1';}
  function loadImage(src,retry=false){
    const key=src;
    if(!retry&&imageCache.has(key))return Promise.resolve(imageCache.get(key));
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.decoding='async';
      img.onload=()=>{
        if(img.naturalWidth<2||img.naturalHeight<2){reject(new Error('Invalid story image '+src));return;}
        imageCache.set(key,img);
        resolve(img);
      };
      img.onerror=()=>{
        if(!retry){loadImage(src,true).then(resolve,reject);return;}
        reject(new Error('Story image failed: '+src));
      };
      img.src=retry?retryUrl(src):src;
    });
  }

  function preloadPanels(){
    if(!preloadPromise)preloadPromise=Promise.all(PANELS.map(src=>loadImage(src).catch(()=>null)));
    return preloadPromise;
  }

  function drawContained(img){
    const rect=comic.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(rect.width*dpr));
    const h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w)canvas.width=w;
    if(canvas.height!==h)canvas.height=h;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,w,h);
    const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);
    const dw=img.naturalWidth*scale;
    const dh=img.naturalHeight*scale;
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);
  }

  function drawLoadFailure(index){
    const rect=comic.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(rect.width*dpr));
    const h=Math.max(1,Math.round(rect.height*dpr));
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#fff';ctx.textAlign='center';
    ctx.font=`900 ${Math.max(20,Math.round(h*.05))}px system-ui`;
    ctx.fillText('IMAGE FAILED TO LOAD',w/2,h/2);
  }

  async function renderPanel(index){
    allowStoryAgain();
    customSequenceActive=true;
    comic.classList.remove('acStartMenu','lastFrame');
    panelIndex=Math.max(0,Math.min(index,PANELS.length-1));
    if(continueButton)continueButton.style.setProperty('display','none','important');
    if(nextButton){nextButton.style.removeProperty('display');nextButton.textContent='NEXT';}
    try{
      const img=await loadImage(PANELS[panelIndex]);
      drawContained(img);
    }catch{
      try{drawContained(await loadImage(PANELS[panelIndex],true));}
      catch{drawLoadFailure(panelIndex);}
    }
  }

  function beginApprovedComic(){
    if(isPortraitPhone()||!storyArmed)return;
    storyArmed=false;
    customSequenceActive=true;
    preloadPanels().finally(()=>renderPanel(0));
  }

  function showStartMenu(){
    customSequenceActive=true;
    comic.classList.add('acStartMenu');
    if(continueButton)continueButton.style.setProperty('display','none','important');
  }

  function resetStoryPresentation(){
    customSequenceActive=false;
    storyArmed=false;
    comic.classList.remove('acStartMenu');
    if(continueButton)continueButton.style.removeProperty('display');
  }

  function handleNext(e){
    if(!customSequenceActive||comic.classList.contains('acStartMenu'))return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(panelIndex<PANELS.length-1)renderPanel(panelIndex+1);
    else showStartMenu();
  }

  function handleStartMenuTap(e){
    if(!comic.classList.contains('acStartMenu'))return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    comic.classList.remove('acStartMenu');
    customSequenceActive=false;
    storyArmed=false;
    if(continueButton){continueButton.style.removeProperty('display');continueButton.click();}
  }

  if(nextButton){
    nextButton.addEventListener('pointerup',handleNext,true);
    nextButton.addEventListener('click',e=>{if(e.detail===0)handleNext(e)},true);
  }
  startMenu.addEventListener('pointerup',handleStartMenuTap,true);
  startMenu.addEventListener('click',e=>{if(e.detail===0)handleStartMenuTap(e)},true);

  const introObserver=new MutationObserver(()=>{
    syncGlobalOrientation();
    if(intro.classList.contains('show')&&!document.body.classList.contains('acGameplayMode'))storyArmed=true;
  });
  introObserver.observe(intro,{attributes:true,attributeFilter:['class']});

  const comicObserver=new MutationObserver(()=>{
    syncGlobalOrientation();
    if(comic.classList.contains('show')&&storyArmed&&!customSequenceActive&&!comic.classList.contains('acStartMenu')&&!document.body.classList.contains('acGameplayMode'))beginApprovedComic();
  });
  comicObserver.observe(comic,{attributes:true,attributeFilter:['class']});

  if(mpOverlay){
    new MutationObserver(()=>{
      if(!mpOverlay.classList.contains('hidden'))resetStoryPresentation();
    }).observe(mpOverlay,{attributes:true,attributeFilter:['class']});
  }

  for(const button of [soloButton,hostButton,joinButton]){
    if(!button)continue;
    button.addEventListener('pointerdown',hardCloseStoryForGameplay,true);
    button.addEventListener('pointerup',hardCloseStoryForGameplay,true);
    button.addEventListener('click',hardCloseStoryForGameplay,true);
  }
  if(replayButton){
    replayButton.addEventListener('pointerdown',allowStoryAgain,true);
    replayButton.addEventListener('pointerup',allowStoryAgain,true);
    replayButton.addEventListener('click',allowStoryAgain,true);
  }

  addEventListener('orientationchange',()=>{setTimeout(syncGlobalOrientation,50);setTimeout(syncGlobalOrientation,260)});
  addEventListener('resize',()=>{
    syncGlobalOrientation();
    if(customSequenceActive&&!comic.classList.contains('acStartMenu')&&imageCache.has(PANELS[panelIndex]))drawContained(imageCache.get(PANELS[panelIndex]));
  },{passive:true});
  visualViewport?.addEventListener('resize',syncGlobalOrientation,{passive:true});

  preloadPanels();
  syncGlobalOrientation();
})();