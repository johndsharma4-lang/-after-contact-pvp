/* After Contact — approved story presentation */
(() => {
  'use strict';

  const intro = document.getElementById('storyIntro');
  const comic = document.getElementById('storyComic');
  const canvas = document.getElementById('storyPanelCanvas');
  const count = document.getElementById('storyPanelCount');
  const nextButton = document.getElementById('storyFrameBtn');
  const continueButton = document.getElementById('storyContinue');
  const rotate = document.getElementById('rotate');
  if (!intro || !comic || !canvas) return;

  const APPROVED_PANELS = [
    '/story-panels/panel-01.webp',
    '/story-panels/panel-02.webp',
    '/story-panels/panel-03.webp',
    '/story-panels/panel-04.webp',
    '/story-panels/panel-05.webp',
    '/story-panels/panel-06.webp',
    '/story-panels/panel-07.webp'
  ];

  const style = document.createElement('style');
  style.textContent = `
    #storyCrawlWrap{overflow:hidden!important}
    #storyCrawl{font-size:clamp(32px,5.2vw,48px)!important;line-height:1.46!important}
    #storyCrawl p,#storyCrawl span{font-size:inherit!important;line-height:inherit!important}
    #storyIntro.playing #storyCrawl{animation-duration:43s!important;animation-delay:-8s!important}

    #storyComic{overflow:hidden!important;background:#000!important}
    #storyPanelCanvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;transform:none!important;border:0!important;border-radius:0!important;background:#000!important;box-shadow:none!important}
    #storyPanelCount{top:max(8px,env(safe-area-inset-top))!important;z-index:7!important;background:rgba(0,0,0,.62)!important;padding:5px 10px!important;border-radius:999px!important}
    #storyFrameBtn,#storyContinue{z-index:8!important;bottom:max(10px,calc(env(safe-area-inset-bottom) + 4px))!important}

    #acStartMenu{position:absolute;inset:0;z-index:6;display:none;align-items:center;justify-content:center;flex-direction:column;background:radial-gradient(circle at 50% 45%,rgba(120,0,0,.13),transparent 42%),linear-gradient(180deg,#020202,#080808 62%,#010101);text-align:center;padding:4vh 5vw calc(4vh + env(safe-area-inset-bottom));}
    #storyComic.acStartMenu #acStartMenu{display:flex}
    #storyComic.acStartMenu #storyPanelCanvas,#storyComic.acStartMenu #storyPanelCount,#storyComic.acStartMenu #storyFrameBtn{display:none!important}
    #acStartTitle{font-size:clamp(56px,13vw,150px);line-height:.83;font-weight:1000;letter-spacing:.015em;color:#f5f3ef;text-shadow:0 5px 28px #000;margin:0;white-space:nowrap}
    #acStartSubtitle{margin-top:4vh;font-size:clamp(18px,3.4vw,38px);font-weight:1000;letter-spacing:.18em;color:#c51e24;text-transform:uppercase}
    #acStartTap{margin-top:7vh;font-size:clamp(14px,2.4vw,28px);font-weight:900;letter-spacing:.17em;color:#ddd;animation:acStartPulse 1.45s ease-in-out infinite alternate}
    #acStartDisclaimer{position:absolute;left:5vw;right:5vw;bottom:max(8px,env(safe-area-inset-bottom));font-size:clamp(7px,1vw,11px);line-height:1.35;font-weight:800;letter-spacing:.06em;color:#8f8f8f;text-transform:uppercase}
    @keyframes acStartPulse{from{opacity:.48}to{opacity:1}}

    body.acStoryPortrait #rotate{display:flex!important;z-index:10000!important}
    body.acStoryPortrait #storyIntro,body.acStoryPortrait #storyComic{visibility:hidden!important}
    body.acStoryPortrait #rotate .rotateCard p:after{content:' The story will begin when your phone is sideways.'}
  `;
  document.head.appendChild(style);

  const startMenu = document.createElement('div');
  startMenu.id = 'acStartMenu';
  startMenu.innerHTML = `
    <div id="acStartTitle">AFTER CONTACT</div>
    <div id="acStartSubtitle">THE WAR FOR AETHERIUM</div>
    <div id="acStartTap">TAP TO CONTINUE</div>
    <div id="acStartDisclaimer">AFTER CONTACT IS A WORK OF FICTION. CHARACTERS, GOVERNMENTS, EVENTS AND ORGANIZATIONS DEPICTED IN THE GAME ARE FICTIONAL OR USED FICTITIOUSLY.</div>
  `;
  comic.appendChild(startMenu);

  let panelIndex = 0;
  let customSequenceActive = false;
  let pausedForPortrait = false;
  let crawlWasPlaying = false;
  let preloadPromise = null;
  let pendingLandscapeStart = null;
  const imageCache = new Map();

  function isPortraitPhone() {
    return matchMedia('(orientation: portrait)').matches && Math.min(innerWidth, innerHeight) < 700;
  }

  /* Gate the game's real story starter BEFORE it creates its 43.5s transition timer. */
  const originalStartStoryIntro = typeof window.startStoryIntro === 'function' ? window.startStoryIntro : null;
  if (originalStartStoryIntro) {
    window.startStoryIntro = function(...args) {
      if (isPortraitPhone()) {
        pendingLandscapeStart = { thisArg: this, args };
        document.body.classList.add('acStoryPortrait');
        if (rotate) rotate.style.setProperty('display','flex','important');
        return;
      }
      pendingLandscapeStart = null;
      return originalStartStoryIntro.apply(this, args);
    };
  }

  function syncOrientation() {
    const storyVisible = !!pendingLandscapeStart || intro.classList.contains('show') || comic.classList.contains('show');
    if (!storyVisible) {
      document.body.classList.remove('acStoryPortrait');
      pausedForPortrait = false;
      return;
    }

    const portrait = isPortraitPhone();
    document.body.classList.toggle('acStoryPortrait', portrait);

    if (portrait) {
      if (intro.classList.contains('playing')) {
        intro.classList.remove('playing');
        crawlWasPlaying = true;
      }
      pausedForPortrait = true;
      if (rotate) rotate.style.setProperty('display','flex','important');
      return;
    }

    if (rotate) rotate.style.removeProperty('display');

    /* A portrait launch was requested: only now start the original story and its timer. */
    if (pendingLandscapeStart && originalStartStoryIntro) {
      const pending = pendingLandscapeStart;
      pendingLandscapeStart = null;
      pausedForPortrait = false;
      originalStartStoryIntro.apply(pending.thisArg, pending.args);
      return;
    }

    if (pausedForPortrait) {
      pausedForPortrait = false;
      if (crawlWasPlaying && intro.classList.contains('show')) {
        crawlWasPlaying = false;
        void intro.offsetWidth;
        requestAnimationFrame(() => intro.classList.add('playing'));
      }
    }

    if (comic.classList.contains('show') && !customSequenceActive && !comic.classList.contains('acStartMenu')) {
      beginApprovedComic();
    }
  }

  function loadImage(src) {
    if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { imageCache.set(src, img); resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function preloadApprovedPanels() {
    if (!preloadPromise) preloadPromise = Promise.all(APPROVED_PANELS.map(src => loadImage(src).catch(() => null)));
    return preloadPromise;
  }

  function drawContained(img) {
    const rect = comic.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,w,h);
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  async function renderApprovedPanel(index) {
    customSequenceActive = true;
    comic.classList.remove('acStartMenu','lastFrame');
    panelIndex = Math.max(0, Math.min(index, APPROVED_PANELS.length - 1));
    if (count) count.textContent = `${panelIndex + 1} / ${APPROVED_PANELS.length}`;
    if (continueButton) continueButton.style.setProperty('display','none','important');
    if (nextButton) {
      nextButton.style.removeProperty('display');
      nextButton.textContent = 'NEXT';
    }
    const img = await loadImage(APPROVED_PANELS[panelIndex]);
    drawContained(img);
  }

  function showNewStartMenu() {
    customSequenceActive = true;
    comic.classList.add('acStartMenu');
    if (continueButton) continueButton.style.setProperty('display','none','important');
  }

  function beginApprovedComic() {
    if (isPortraitPhone()) return;
    preloadApprovedPanels().then(() => renderApprovedPanel(0));
  }

  function handleNext(event) {
    if (!customSequenceActive || comic.classList.contains('acStartMenu')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (panelIndex < APPROVED_PANELS.length - 1) renderApprovedPanel(panelIndex + 1);
    else showNewStartMenu();
  }

  function handleStartMenuTap(event) {
    if (!comic.classList.contains('acStartMenu')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    comic.classList.remove('acStartMenu');
    customSequenceActive = false;
    if (continueButton) {
      continueButton.style.removeProperty('display');
      continueButton.click();
    }
  }

  if (nextButton) nextButton.addEventListener('click', handleNext, true);
  startMenu.addEventListener('click', handleStartMenuTap, true);
  startMenu.addEventListener('touchend', handleStartMenuTap, {capture:true, passive:false});

  const comicObserver = new MutationObserver(() => {
    syncOrientation();
    if (comic.classList.contains('show') && !customSequenceActive && !comic.classList.contains('acStartMenu')) beginApprovedComic();
  });
  comicObserver.observe(comic, {attributes:true, attributeFilter:['class']});

  const introObserver = new MutationObserver(syncOrientation);
  introObserver.observe(intro, {attributes:true, attributeFilter:['class']});

  addEventListener('orientationchange', () => { setTimeout(syncOrientation,60); setTimeout(syncOrientation,260); });
  addEventListener('resize', () => {
    syncOrientation();
    if (customSequenceActive && !comic.classList.contains('acStartMenu') && imageCache.has(APPROVED_PANELS[panelIndex])) drawContained(imageCache.get(APPROVED_PANELS[panelIndex]));
  }, {passive:true});
  visualViewport?.addEventListener('resize', syncOrientation, {passive:true});

  preloadApprovedPanels();
  syncOrientation();
})();