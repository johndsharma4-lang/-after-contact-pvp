(()=>{
'use strict';
const STYLE_ID='acCutawayScanStyle';
const css=`
#acCutawayScan{position:absolute;inset:0;z-index:68;display:none;pointer-events:none;overflow:hidden;background:radial-gradient(circle at 50% 50%,rgba(30,145,195,.08),rgba(0,8,15,.48));opacity:0}
#acCutawayScan.live{display:block;animation:acScanFade .78s ease both}
#acCutawayScan .scanGrid{position:absolute;inset:0;background-image:linear-gradient(rgba(116,217,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(116,217,255,.08) 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)}
#acCutawayScan .scanBand{position:absolute;top:0;bottom:0;width:16%;left:-18%;background:linear-gradient(90deg,transparent,rgba(116,217,255,.18),rgba(210,249,255,.85),rgba(116,217,255,.18),transparent);filter:blur(.3px);box-shadow:0 0 36px rgba(116,217,255,.55);animation:acScanSweep .72s cubic-bezier(.3,.05,.25,1) both}
#acCutawayScan .scanTitle{position:absolute;left:50%;top:14%;transform:translateX(-50%);padding:7px 12px;border:1px solid rgba(116,217,255,.48);border-radius:999px;background:rgba(1,14,24,.88);color:#c8f4ff;font:1000 clamp(8px,1.1vw,12px)/1 system-ui;letter-spacing:.18em;text-shadow:0 0 10px rgba(116,217,255,.65);white-space:nowrap}
#acCutawayScan .scanSub{position:absolute;left:50%;top:22%;transform:translateX(-50%);color:#7edfff;font:900 clamp(7px,.85vw,10px)/1 system-ui;letter-spacing:.12em;opacity:.86;white-space:nowrap}
@keyframes acScanSweep{0%{left:-18%}100%{left:106%}}
@keyframes acScanFade{0%{opacity:0}10%{opacity:1}78%{opacity:1}100%{opacity:0}}
`;
function ensure(){if(!document.getElementById(STYLE_ID)){const s=document.createElement('style');s.id=STYLE_ID;s.textContent=css;document.head.appendChild(s)}let el=document.getElementById('acCutawayScan');if(!el){el=document.createElement('div');el.id='acCutawayScan';el.innerHTML='<div class="scanGrid"></div><div class="scanBand"></div><div class="scanTitle">TACTICAL X-RAY SCAN</div><div class="scanSub">FORTRESS INTERIOR MAPPING</div>';document.getElementById('stageShell')?.appendChild(el)}return el}
window.__acRunCutawayScan=()=>{const el=ensure();if(!el)return;el.classList.remove('live');void el.offsetWidth;el.classList.add('live');setTimeout(()=>el.classList.remove('live'),820)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
})();