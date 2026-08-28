(()=>{
'use strict';
const BUILD='v0.33.9';
const CONTROLLER_DESC='Designates targets for delayed tactical support strikes. Support type changes based on the enemy fortress.';
const STYLE_ID='deploymentButtonV0339Style';
const css=`
.acRosterV338 .acRosterItem:not(.future){grid-template-columns:64px minmax(0,1fr) 82px!important;gap:7px!important}
.acQuickDeployV339{align-self:center;width:78px;height:40px;border:1px solid #79f0ac;border-radius:9px;background:linear-gradient(180deg,#58e6a3,#22a86f);color:#03110a;font:1000 9px/1 system-ui;letter-spacing:.09em;box-shadow:0 7px 18px rgba(0,0,0,.35);touch-action:manipulation;cursor:pointer}
.acQuickDeployV339:active{transform:scale(.97)}
.acQuickDeployV339:disabled{opacity:.35;filter:grayscale(.6);cursor:default}
.acModalInfo{display:flex!important;flex-direction:column!important;min-height:0}
.acModalActions{position:sticky!important;bottom:-16px!important;z-index:5!important;margin-top:auto!important;padding:12px 0 4px!important;background:linear-gradient(180deg,rgba(2,9,17,0),rgba(2,9,17,.98) 32%)!important}
.acModalBtn.deploy{height:54px!important;font-size:12px!important;box-shadow:0 8px 24px rgba(46,205,137,.28)!important}
@media(max-width:760px){.acRosterV338 .acRosterItem:not(.future){grid-template-columns:54px minmax(0,1fr) 72px!important}.acQuickDeployV339{width:68px;height:36px;font-size:8px}.acModalActions{bottom:-11px!important}.acModalBtn.deploy{height:48px!important;font-size:10px!important}}
`;
function addStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=css;document.head.appendChild(s)}
function syncVersion(){document.querySelectorAll('.mpTitle,.lab').forEach(el=>{el.textContent=el.textContent.replace(/v0\.33\.[78]/g,BUILD)});const h=document.querySelector('#ownerDbgPanel .dbgHead span');if(h)h.textContent=`MATCH RECORDER • ${BUILD}`;const c=document.getElementById('ownerBuildCard');if(c){const d=c.querySelector('div');if(d)d.textContent=`LATEST BUILD • ${BUILD}`}}
function originalCardForRow(row){const id=Number(row?.dataset?.warriorId);const cards=[...document.querySelectorAll('#deployOverlay .deployRoster .deployCard')];return cards.find(c=>Number(c.dataset.warriorIndex)===id)||cards[id]||cards[id-1]||null}
function firstAvailableSlot(){const slots=[...document.querySelectorAll('#deployOverlay .deploySlot')];return slots.find(s=>!s.classList.contains('filled')&&!s.querySelector('.deployOccupant,.warriorToken,img'))||slots.find(s=>!s.classList.contains('filled'))||slots[0]||null}
function nativeDeployRow(row){if(!row||row.classList.contains('deployed'))return false;const card=originalCardForRow(row);const slot=firstAvailableSlot();if(!card||!slot)return false;try{card.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));setTimeout(()=>slot.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})),30);return true}catch(e){console.warn('[v0.33.9] deploy failed',e);return false}}
function addQuickButtons(){document.querySelectorAll('.acRosterV338 .acRosterItem:not(.future)').forEach(row=>{let btn=row.querySelector('.acQuickDeployV339');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='acQuickDeployV339';btn.addEventListener('pointerdown',e=>e.stopPropagation());btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(nativeDeployRow(row)){btn.textContent='DEPLOYING';btn.disabled=true;setTimeout(refresh,180)}});row.appendChild(btn)}const deployed=row.classList.contains('deployed');btn.textContent=deployed?'DEPLOYED':'DEPLOY';btn.disabled=deployed})}
function fixModal(){const modal=document.querySelector('.acModalV338');if(!modal)return;const name=modal.querySelector('.acModalName')?.textContent?.trim().toUpperCase();if(name==='COMBAT CONTROLLER'){const desc=modal.querySelector('.acModalDesc');if(desc)desc.textContent=CONTROLLER_DESC}const btn=modal.querySelector('.acModalBtn.deploy');if(btn&&!btn.disabled){btn.textContent='DEPLOY';btn.style.display='block'}const actions=modal.querySelector('.acModalActions');if(actions)actions.style.display='grid'}
function patchControllerSource(){const cards=[...document.querySelectorAll('#deployOverlay .deployRoster .deployCard')];cards.forEach(card=>{const name=(card.querySelector('.cardName')?.textContent||'').trim().toUpperCase();if(name==='COMBAT CONTROLLER'){const desc=card.querySelector('.cardDesc,.desc,.description');if(desc)desc.textContent=CONTROLLER_DESC}})}
function refresh(){addStyle();syncVersion();patchControllerSource();addQuickButtons();fixModal()}
let timer=0;const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refresh,50)});
function boot(){refresh();observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled']});setTimeout(refresh,250);setTimeout(refresh,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();