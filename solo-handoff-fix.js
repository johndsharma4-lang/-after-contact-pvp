/* After Contact — final story polish + Solo Game handoff */
(() => {
  'use strict';

  const intro=document.getElementById('storyIntro');
  const comic=document.getElementById('storyComic');
  const canvas=document.getElementById('storyPanelCanvas');
  const source=document.getElementById('storyComicSource');
  const titleScreen=document.getElementById('titleScreen');
  const mpOverlay=document.getElementById('mpOverlay');
  const nextButton=document.getElementById('storyFrameBtn');
  const replayButton=document.getElementById('replayStoryBtn');
  if(!intro||!comic||!canvas)return;

  /* The approved custom title replaces the legacy title screen completely. */
  const style=document.createElement('style');
  style.textContent=`
    #titleScreen{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
    #storyComicSource{display:none!important;visibility:hidden!important;opacity:0!important}

    body.acSoloEntering #storyIntro,
    body.acSoloEntering #storyComic{
      display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;transition:none!important
    }

    #acCrispStoryText{position:absolute;inset:0;z-index:7;pointer-events:none;display:none;font-family:Arial Black,Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
    #acCrispStoryText.show{display:block}

    #acCrispStoryText .acSpeech{position:absolute;top:11%;width:25%;min-height:14%;display:flex;align-items:center;justify-content:center;padding:min(1.25vw,2.8vh) min(1.45vw,3vh);background:#f6f4ed;color:#090909;border:min(.23vw,.5vh) solid #171717;border-radius:48% 48% 45% 45%/42% 42% 52% 52%;box-shadow:0 3px 12px #0007;text-align:center;font-size:min(1.42vw,3.35vh);line-height:1.1;font-weight:1000;letter-spacing:.01em}
    #acCrispStoryText .acSpeech.s1{left:5.5%}
    #acCrispStoryText .acSpeech.s2{left:37.5%;width:22%}
    #acCrispStoryText .acSpeech.s3{right:5.2%;width:26%}

    #acCrispStoryText .acCaptionBox{position:absolute;left:7.3%;top:3.2%;width:28%;padding:min(1.25vw,2.6vh) min(1.35vw,2.8vh);background:rgba(2,2,2,.96);border:1px solid rgba(255,255,255,.18);box-shadow:0 4px 16px #000a;text-align:left;text-transform:uppercase}
    #acCrispStoryText .acCaptionWhite{color:#fff;font-size:min(1.72vw,4.0vh);line-height:1.07;font-weight:1000;letter-spacing:.02em}
    #acCrispStoryText .acCaptionRed{margin-top:min(.7vw,1.7vh);color:#d82b39;font-size:min(1.48vw,3.45vh);line-height:1.08;font-weight:1000;letter-spacing:.015em}

    #acCrispStoryText.future .acCaptionBox{left:7.5%;top:4.5%;width:25%;padding:min(1.05vw,2.3vh) min(1.2vw,2.5vh)}
    #acCrispStoryText.future .acFutureTitle{font-size:min(1.55vw,3.55vh);color:#fff;font-weight:1000;line-height:1.08;margin-bottom:min(.85vw,1.8vh)}
    #acCrispStoryText.future .acFutureBody{font-size:min(1.22vw,2.85vh);color:#f8f8f8;font-weight:1000;line-height:1.18;letter-spacing:.015em}
    #acCrispStoryText.future .acGap{height:min(.8vw,1.7vh)}

    @media (orientation:landscape) and (max-height:430px){
      #acCrispStoryText .acSpeech{top:10%;font-size:min(1.55vw,3.5vh);padding:min(1.05vw,2.3vh)}
      #acCrispStoryText .acCaptionBox{top:2.5%;width:29%}
      #acCrispStoryText .acCaptionWhite{font-size:min(1.78vw,4.15vh)}
      #acCrispStoryText .acCaptionRed{font-size:min(1.5vw,3.55vh)}
      #acCrispStoryText.future .acCaptionBox{top:3.2%;width:26%}
    }
  `;
  document.head.appendChild(style);

  if(titleScreen){
    titleScreen.classList.add('hidden');
    titleScreen.setAttribute('aria-hidden','true');
  }

  const crisp=document.createElement('div');
  crisp.id='acCrispStoryText';
  crisp.setAttribute('aria-hidden','true');
  comic.appendChild(crisp);

  let frameIndex=0;
  let storyFramesLive=false;

  function renderCrispText(){
    crisp.className='';
    crisp.innerHTML='';
    if(!storyFramesLive||comic.classList.contains('acStartMenu'))return;

    /* Frame 4: replace soft baked speech lettering with browser-rendered type. */
    if(frameIndex===3){
      crisp.className='show';
      crisp.innerHTML=`
        <div class="acSpeech s1">YOU HAVE<br>SOMETHING<br>WE NEED.</div>
        <div class="acSpeech s2">AND YOU<br>NEED US.</div>
        <div class="acSpeech s3">REFUSE…<br>AND YOU<br>WILL LOSE IT ALL.</div>`;
      return;
    }

    /* Frame 6: mask the baked caption and redraw it sharply. */
    if(frameIndex===5){
      crisp.className='show';
      crisp.innerHTML=`<div class="acCaptionBox"><div class="acCaptionWhite">THEIR WARNING<br>BECAME REALITY.</div><div class="acCaptionRed">AT 9:45 PM, THE<br>WHITE HOUSE<br>CEASED TO EXIST.</div></div>`;
      return;
    }

    /* Frame 7: same treatment for the 50-years-later narration. */
    if(frameIndex===6){
      crisp.className='show future';
      crisp.innerHTML=`<div class="acCaptionBox"><div class="acFutureTitle">50 YEARS LATER…</div><div class="acFutureBody">FOUR CIVILIZATIONS.<br>FOUR DYING WORLDS.<br>ONE RESOURCE.<div class="acGap"></div>NOT ENOUGH<br>FOR EVERYONE.<div class="acGap"></div>EXTINCTION WAITS<br>FOR THE LOSER.</div></div>`;
    }
  }

  function killStoryImmediately(){
    document.body.classList.add('acSoloEntering','acGameplayMode');
    storyFramesLive=false;
    crisp.className='';crisp.innerHTML='';
    intro.classList.remove('show','playing');
    intro.setAttribute('aria-hidden','true');
    comic.classList.remove('show','lastFrame','acStartMenu');
    comic.setAttribute('aria-hidden','true');
    comic.style.setProperty('display','none','important');
    comic.style.setProperty('opacity','0','important');
    comic.style.setProperty('pointer-events','none','important');
    if(source)source.style.setProperty('display','none','important');
    if(canvas){
      const ctx=canvas.getContext('2d');
      if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);
      canvas.style.setProperty('display','none','important');
    }
    if(titleScreen){titleScreen.classList.add('hidden');titleScreen.style.setProperty('display','none','important');}
  }

  function restoreStoryForReplay(){
    document.body.classList.remove('acSoloEntering','acGameplayMode');
    comic.style.removeProperty('display');
    comic.style.removeProperty('opacity');
    comic.style.removeProperty('pointer-events');
    canvas.style.removeProperty('display');
    if(titleScreen){titleScreen.classList.add('hidden');titleScreen.style.setProperty('display','none','important');}
  }

  /* Watch the approved comic becoming visible: that always starts on frame 1. */
  new MutationObserver(()=>{
    if(comic.classList.contains('show')&&!comic.classList.contains('acStartMenu')&&!document.body.classList.contains('acSoloEntering')){
      if(!storyFramesLive){frameIndex=0;storyFramesLive=true;setTimeout(renderCrispText,40);}
    }
    if(comic.classList.contains('acStartMenu')){storyFramesLive=false;crisp.className='';crisp.innerHTML='';}
  }).observe(comic,{attributes:true,attributeFilter:['class']});

  /* Track NEXT without interfering with the approved story controller. */
  document.addEventListener('pointerup',e=>{
    if(!e.target?.closest?.('#storyFrameBtn')||!storyFramesLive)return;
    setTimeout(()=>{
      frameIndex=Math.min(frameIndex+1,7);
      renderCrispText();
    },0);
  },true);

  document.addEventListener('click',e=>{
    if(e.detail!==0||!e.target?.closest?.('#storyFrameBtn')||!storyFramesLive)return;
    setTimeout(()=>{frameIndex=Math.min(frameIndex+1,7);renderCrispText();},0);
  },true);

  /* Solo/Multiplayer capture happens before the game's own button handlers. */
  document.addEventListener('pointerdown',e=>{
    if(e.target?.closest?.('#mpSoloBtn,#mpHostBtn,#mpJoinBtn'))killStoryImmediately();
    if(e.target?.closest?.('#replayStoryBtn'))restoreStoryForReplay();
  },true);
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#mpSoloBtn,#mpHostBtn,#mpJoinBtn'))killStoryImmediately();
    if(e.target?.closest?.('#replayStoryBtn'))restoreStoryForReplay();
  },true);

  /* Legacy title may still be asked to show by old code; keep it permanently suppressed. */
  new MutationObserver(()=>{
    if(titleScreen){titleScreen.classList.add('hidden');titleScreen.setAttribute('aria-hidden','true');}
    if(document.body.classList.contains('acSoloEntering')&&(comic.classList.contains('show')||intro.classList.contains('show')))killStoryImmediately();
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','style']});

  /* Once the custom title is tapped, the old title remains impossible to reveal. */
  document.addEventListener('pointerup',e=>{
    if(e.target?.closest?.('#acStartMenu')){
      if(titleScreen){titleScreen.classList.add('hidden');titleScreen.style.setProperty('display','none','important');}
      setTimeout(()=>{mpOverlay?.classList.remove('hidden');},0);
    }
  },true);
})();
