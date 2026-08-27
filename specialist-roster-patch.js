// AFTER CONTACT v0.32.12b - Earth specialist roster UI bridge
// This file intentionally works through the DOM only so it can coexist with the main game module.
(() => {
  const UNITS = [
    {id:'bombardier', name:'BOMBARDIER', weapon:'HE-9 BARRAGE', glyph:'✹', desc:'Heavy explosive starter.'},
    {id:'sniper', name:'SNIPER', weapon:'LONGSHOT RIFLE', glyph:'⌖', desc:'Precision single-target specialist.'},
    {id:'radio_man', name:'RADIO MAN', weapon:'TARGET LOCATOR', glyph:'⌁', desc:'Marks a location for delayed support fire.'},
    {id:'combat_controller', name:'COMBAT CONTROLLER', weapon:'TACTICAL UPLINK', glyph:'✦', desc:'Battlefield command and targeting support.'}
  ];
  let chosen='bombardier';
  let patched=false;

  const style=document.createElement('style');
  style.textContent=`
    #characterRoster.acEarthSpecialists{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:9px!important;align-items:stretch!important}
    #characterRoster.acEarthSpecialists .characterCard{min-height:188px!important;justify-content:center!important;text-align:center!important;padding:10px!important}
    #characterRoster.acEarthSpecialists .acSpecialistGlyph{font:1000 42px/1 system-ui;margin-bottom:12px;color:#d9f4ff;text-shadow:0 0 16px rgba(73,185,255,.45)}
    #characterRoster.acEarthSpecialists .acSpecialistDesc{font:700 7px/1.35 system-ui;opacity:.55;margin-top:7px}
    #characterRoster.acEarthSpecialists .characterCard.selected{border-color:#76d6ff!important;box-shadow:0 0 0 2px rgba(71,185,255,.2),0 0 28px rgba(71,185,255,.18)!important}
    #starterCard .acDeployGlyph{font:1000 48px/1 system-ui;text-align:center;margin:8px 0 12px;color:#d9f4ff;text-shadow:0 0 14px rgba(73,185,255,.45)}
    @media(max-width:850px){#characterRoster.acEarthSpecialists{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    @media(max-height:520px) and (orientation:landscape){#characterRoster.acEarthSpecialists{grid-template-columns:repeat(4,minmax(0,1fr))!important}#characterRoster.acEarthSpecialists .characterCard{min-height:100px!important}.acSpecialistDesc{display:none!important}.acSpecialistGlyph{font-size:30px!important;margin-bottom:5px!important}}
  `;
  document.head.appendChild(style);

  function earthScreenOpen(){
    const kicker=document.querySelector('#characterOverlay .characterKicker')?.textContent||'';
    return !document.getElementById('characterOverlay')?.classList.contains('hidden') && /EARTH COMMAND/i.test(kicker);
  }

  function unitById(id){return UNITS.find(x=>x.id===id)||UNITS[0]}

  function setChosen(id){
    chosen=unitById(id).id;
    document.documentElement.dataset.acEarthSpecialist=chosen;
    document.querySelectorAll('#characterRoster .characterCard').forEach(c=>c.classList.toggle('selected',c.dataset.warrior===chosen));
    const u=unitById(chosen),continueBtn=document.getElementById('characterContinue');
    if(continueBtn){continueBtn.disabled=false;continueBtn.textContent=`DEPLOY ${u.name}`}
  }

  function buildRoster(){
    const roster=document.getElementById('characterRoster');
    if(!roster||!earthScreenOpen())return false;
    const continueBtn=document.getElementById('characterContinue');
    if(!continueBtn)return false;
    roster.classList.add('acEarthSpecialists');
    [...roster.querySelectorAll('.characterCard,.characterReserve')].forEach(n=>n.remove());
    for(const u of UNITS){
      const card=document.createElement('div');
      card.className='characterCard';
      card.dataset.warrior=u.id;
      card.setAttribute('role','button');card.tabIndex=0;
      if(u.id==='bombardier'){
        card.innerHTML=`<img src="/bombardier.webp" alt="Bombardier"><div class="characterName">${u.name}</div><div class="characterWeapon">${u.weapon}</div><div class="acSpecialistDesc">${u.desc}</div>`;
      }else{
        card.innerHTML=`<div class="acSpecialistGlyph">${u.glyph}</div><div class="characterName">${u.name}</div><div class="characterWeapon">${u.weapon}</div><div class="acSpecialistDesc">${u.desc}</div>`;
      }
      const choose=e=>{e.preventDefault();e.stopPropagation();setChosen(u.id)};
      card.addEventListener('pointerup',choose,{passive:false});
      card.addEventListener('click',e=>{if(e.detail===0)choose(e)},{passive:false});
      roster.insertBefore(card,continueBtn);
    }
    const intro=document.querySelector('#characterOverlay .characterText');
    if(intro)intro.textContent='Choose an Earth warrior, then deploy that warrior into any fortress compartment.';
    const kicker=document.querySelector('#characterOverlay .characterKicker');
    if(kicker)kicker.textContent='EARTH COMMAND • SPECIALIST ROSTER';
    setChosen(chosen);
    patched=true;
    return true;
  }

  function paintDeployCard(){
    const deploy=document.getElementById('deployOverlay');
    if(!deploy||deploy.classList.contains('hidden'))return;
    const u=unitById(chosen),card=document.getElementById('starterCard');
    if(!card)return;
    card.dataset.displaySpecialist=u.id;
    const img=card.querySelector('img');
    if(img)img.style.display=u.id==='bombardier'?'block':'none';
    let glyph=card.querySelector('.acDeployGlyph');
    if(!glyph){glyph=document.createElement('div');glyph.className='acDeployGlyph';card.insertBefore(glyph,card.querySelector('.cardName'))}
    glyph.style.display=u.id==='bombardier'?'none':'block';glyph.textContent=u.glyph;
    const name=card.querySelector('.cardName');if(name)name.textContent=u.name;
    const hint=card.querySelector('.cardHint');if(hint)hint.textContent='DRAG TO FORTRESS';
    const text=document.querySelector('#deployOverlay .deployText');if(text)text.textContent=`Drag your ${u.name} into any fortress compartment. You can reposition before battle.`;
    const label=document.querySelector('#deployOverlay .shipLabel');if(label)label.textContent='EARTH COMMAND • 3×3 TEST FORTRESS';
    // Keep the visible occupant matching the chosen specialist during placement.
    document.querySelectorAll('#deployGrid .deploySlot.filled').forEach(slot=>{
      const slotImg=slot.querySelector('img');if(slotImg)slotImg.style.display=u.id==='bombardier'?'block':'none';
      let sg=slot.querySelector('.acDeployGlyph');if(!sg&&u.id!=='bombardier'){sg=document.createElement('div');sg.className='acDeployGlyph';sg.style.fontSize='26px';slot.appendChild(sg)}
      if(sg){sg.textContent=u.glyph;sg.style.display=u.id==='bombardier'?'none':'block'}
    });
  }

  // The main game rebuilds Character Select dynamically after faction choice, so watch that handoff.
  const observer=new MutationObserver(()=>{
    if(earthScreenOpen()){
      const cards=[...document.querySelectorAll('#characterRoster .characterCard')];
      if(!patched||cards.length!==4||!cards.some(c=>c.dataset.warrior==='sniper'))buildRoster();
    }else patched=false;
    paintDeployCard();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-hidden']});

  // Run once after the game module has initialized.
  setTimeout(()=>{if(earthScreenOpen())buildRoster();paintDeployCard()},150);
  setInterval(()=>{if(earthScreenOpen()&&document.querySelectorAll('#characterRoster .characterCard').length!==4)buildRoster();paintDeployCard()},500);
})();
