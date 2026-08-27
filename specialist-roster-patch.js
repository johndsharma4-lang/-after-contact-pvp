// AFTER CONTACT v0.32.12 - Earth specialist roster patch
(() => {
  const SPECIALISTS = {
    earth: [
      {id:'bombardier', name:'BOMBARDIER', weapon:'HE-9 BARRAGE', desc:'Heavy explosive starter.'},
      {id:'sniper', name:'SNIPER', weapon:'LONGSHOT RIFLE', desc:'Precision single-target specialist.'},
      {id:'radio_man', name:'RADIO MAN', weapon:'TARGET LOCATOR', desc:'Marks a location for a delayed support strike.'},
      {id:'combat_controller', name:'COMBAT CONTROLLER', weapon:'TACTICAL UPLINK', desc:'Battlefield command and targeting support.'}
    ]
  };
  const BASE_ROUTE={sniper:'solar_lancer',radio_man:'bombardier',combat_controller:'bombardier'};
  let specialist=null;
  const style=document.createElement('style');
  style.textContent=`#characterRoster.acSpecialistRoster{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;overflow:auto}#characterRoster.acSpecialistRoster .characterCard{min-height:150px;justify-content:center;padding:12px;text-align:center}#characterRoster.acSpecialistRoster .acUnitGlyph{font:1000 38px/1 system-ui;margin-bottom:10px;filter:drop-shadow(0 0 10px rgba(116,217,255,.35))}#characterRoster.acSpecialistRoster .acUnitDesc{font:700 7px/1.3 system-ui;opacity:.55;margin-top:6px}#starterCard .acDeployGlyph{font:1000 44px/1 system-ui;margin:8px 0;text-align:center}@media(max-height:520px) and (orientation:landscape){#characterRoster.acSpecialistRoster .characterCard{min-height:92px}.acUnitDesc{display:none!important}}`;
  document.head.appendChild(style);
  const glyph=id=>({bombardier:'✹',sniper:'⌖',radio_man:'⌁',combat_controller:'✦'})[id]||'✦';
  const roster=document.getElementById('characterRoster');
  const originalRender=renderFactionRoster;
  const originalApply=applyStarterProfile;
  const originalValidate=validateFactionStarter;
  const originalFire=fireWarriorFromStage;
  validateFactionStarter=function(faction,warrior){if(faction==='earth'&&SPECIALISTS.earth.some(x=>x.id===warrior))return true;return originalValidate(faction,warrior)};
  function paintDeployCard(unit){if(!unit)return;const card=document.getElementById('starterCard');if(!card)return;card.dataset.warriorStock=unit.id;card.querySelector('.cardName').textContent=unit.name;const img=card.querySelector('img');if(img)img.style.display=unit.id==='bombardier'?'block':'none';let g=card.querySelector('.acDeployGlyph');if(!g){g=document.createElement('div');g.className='acDeployGlyph';card.insertBefore(g,card.querySelector('.cardName'))}g.style.display=unit.id==='bombardier'?'none':'block';g.textContent=glyph(unit.id);const hint=card.querySelector('.cardHint');if(hint)hint.textContent='DRAG TO FORTRESS'}
  function choose(unit){specialist=unit.id==='bombardier'?null:unit.id;selectedWarriorType=unit.id;roster.querySelectorAll('.characterCard').forEach(c=>c.classList.toggle('selected',c.dataset.warrior===unit.id));characterContinue.disabled=false;characterContinue.textContent=`DEPLOY ${unit.name}`;paintDeployCard(unit);diag('SPECIALIST SELECT',`${unit.id} faction=${selectedFaction}`)}
  renderFactionRoster=function(){if(selectedFaction!=='earth'){specialist=null;roster.classList.remove('acSpecialistRoster');return originalRender()}roster.classList.add('acSpecialistRoster');[...roster.querySelectorAll('.characterCard,.characterReserve')].forEach(n=>n.remove());for(const unit of SPECIALISTS.earth){const card=document.createElement('div');card.className='characterCard';card.dataset.warrior=unit.id;card.innerHTML=`<div class="acUnitGlyph">${glyph(unit.id)}</div><div class="characterName">${unit.name}</div><div class="characterWeapon">${unit.weapon}</div><div class="acUnitDesc">${unit.desc}</div>`;card.addEventListener('pointerup',e=>{stopNative(e);choose(unit)},{passive:false});roster.insertBefore(card,characterContinue)}choose(SPECIALISTS.earth[0]);document.querySelector('.characterKicker').textContent='EARTH COMMAND • SPECIALIST ROSTER';document.querySelector('.characterText').textContent='Choose one Earth specialist, then deploy that warrior into any fortress compartment.';return true};
  applyStarterProfile=function(type){if(selectedFaction==='earth'&&BASE_ROUTE[type]){const requested=type;originalApply(BASE_ROUTE[type]);selectedWarriorType=requested;specialist=requested;const w=localSide==='earth'?eWarriors[0]:aWarriors[0];if(w){w.weaponKey=requested;w.acBaseRoute=BASE_ROUTE[requested];w.displayName=SPECIALISTS.earth.find(x=>x.id===requested)?.name||requested}paintDeployCard(SPECIALISTS.earth.find(x=>x.id===requested));document.querySelector('.deployText').textContent=`Drag your ${w?.displayName||requested} into any fortress compartment. You can reposition before battle.`;document.querySelector('.shipLabel').textContent='EARTH COMMAND • 3×3 TEST FORTRESS';diag('SPECIALIST PROFILE',`${requested} base=${BASE_ROUTE[requested]}`);return}specialist=null;originalApply(type)};
  fireWarriorFromStage=function(w,point,power,remote=false,eventWarrior=null){const key=eventWarrior||w?.weaponKey;if(BASE_ROUTE[key]){const old=w.weaponKey;w.weaponKey=BASE_ROUTE[key];if(key==='sniper'){statusEl.textContent='SNIPER • LONGSHOT';weaponNameEl.textContent='SNIPER • LONGSHOT RIFLE'}else if(key==='radio_man'){statusEl.textContent='RADIO MAN • TARGET LOCATOR';weaponNameEl.textContent='RADIO MAN • SUPPORT LOCATOR'}else{statusEl.textContent='COMBAT CONTROLLER • TACTICAL UPLINK';weaponNameEl.textContent='COMBAT CONTROLLER • TACTICAL UPLINK'}const result=originalFire(w,point,power,remote,BASE_ROUTE[key]);w.weaponKey=old;return result}return originalFire(w,point,power,remote,eventWarrior)};
  const originalUpdateDeploy=updateDeployUI;updateDeployUI=function(){originalUpdateDeploy();if(selectedFaction==='earth'){const u=SPECIALISTS.earth.find(x=>x.id===selectedWarriorType);if(u)paintDeployCard(u)}};
  const badge=document.querySelector('.lab');if(badge)badge.textContent='3D LAB • MOBILE PVP TEST • v0.32.12';
  diag('PATCH 0.32.12','Earth Sniper + Radio Man + Combat Controller roster/deployment enabled');
})();
