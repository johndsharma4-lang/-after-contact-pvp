/* After Contact — Solo Game story handoff guard */
(() => {
  'use strict';

  const intro = document.getElementById('storyIntro');
  const comic = document.getElementById('storyComic');
  const canvas = document.getElementById('storyPanelCanvas');
  const source = document.getElementById('storyComicSource');
  if (!intro || !comic) return;

  const style = document.createElement('style');
  style.textContent = `
    #storyComicSource{display:none!important;visibility:hidden!important;opacity:0!important}
    body.acSoloEntering #storyIntro,
    body.acSoloEntering #storyComic{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      transition:none!important;
    }
  `;
  document.head.appendChild(style);

  function killStoryImmediately() {
    document.body.classList.add('acSoloEntering','acGameplayMode');
    intro.classList.remove('show','playing');
    intro.setAttribute('aria-hidden','true');
    comic.classList.remove('show','lastFrame','acStartMenu');
    comic.setAttribute('aria-hidden','true');
    comic.style.setProperty('display','none','important');
    comic.style.setProperty('opacity','0','important');
    comic.style.setProperty('pointer-events','none','important');
    if (source) source.style.setProperty('display','none','important');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
      canvas.style.setProperty('display','none','important');
    }
  }

  function restoreStoryForReplay() {
    document.body.classList.remove('acSoloEntering','acGameplayMode');
    comic.style.removeProperty('display');
    comic.style.removeProperty('opacity');
    comic.style.removeProperty('pointer-events');
    canvas?.style.removeProperty('display');
  }

  /* Document capture runs before the Solo button's own pointer handlers. */
  document.addEventListener('pointerdown', e => {
    if (e.target?.closest?.('#mpSoloBtn')) killStoryImmediately();
    if (e.target?.closest?.('#replayStoryBtn')) restoreStoryForReplay();
  }, true);

  document.addEventListener('click', e => {
    if (e.target?.closest?.('#mpSoloBtn')) killStoryImmediately();
    if (e.target?.closest?.('#replayStoryBtn')) restoreStoryForReplay();
  }, true);

  /* If legacy code tries to re-show the story during Solo entry, suppress it again. */
  new MutationObserver(() => {
    if (document.body.classList.contains('acSoloEntering')) {
      if (comic.classList.contains('show') || intro.classList.contains('show')) killStoryImmediately();
    }
  }).observe(document.body, {subtree:true, attributes:true, attributeFilter:['class','style']});
})();
