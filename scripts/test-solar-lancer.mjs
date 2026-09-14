import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=readFileSync(resolve(root,'index.html'),'utf8');

function sourceBlock(startNeedle,endNeedle){
  const start=base.indexOf(startNeedle),end=base.indexOf(endNeedle,start);
  assert.ok(start>=0&&end>start,`Missing source block ${startNeedle}`);
  return base.slice(start,end);
}

const resolveSource=sourceBlock('function resolveSolarBurnTick(','\nfunction spawnSolarLancerBeam(');
const calls={shield:0,structure:[],crew:[],conceal:0};
let shieldMode='open';
const statusEl={textContent:''};
const crew=[];
const noop=()=>{};
const resolveStage=new Function(
  'battleStarted','matchEnded','weaponImpactSfx','spawnExplosionVisual','spawnImpactBurst','spawnDebris','kickCamera','diag','opposing','applyWarriorDamage','spawnSolarCrewReaction','applyStructureDamage','syncWarriorConcealment','eraseCompartment','absorbShieldHit','ensureSolarBurnHole','damageRoomVisual','updateDamageMonitor','statusEl','EXPOSURE_THRESHOLDS','checkMatchEnd',
  `${resolveSource};return resolveSolarBurnTick;`
)(true,false,noop,noop,noop,noop,noop,noop,()=>crew,(w,amount)=>{calls.crew.push(amount);w.hp=Math.max(0,w.hp-amount);return amount},noop,(_attacker,amount)=>{calls.structure.push(amount);return amount},()=>{calls.conceal++},(_attacker,room)=>{room.erased=true;room.armor=0;room.breach=100;return true},(_attacker,_index,amount)=>{calls.shield++;return shieldMode==='blocked'?{absorbed:amount,passed:0,blocked:true,openBefore:false}:{absorbed:0,passed:amount,blocked:false,openBefore:true}},noop,noop,noop,statusEl,{partial:50,targetable:70},noop);

function endpoint(id){return{id}}
function makePath(armors=[100,100,100]){return armors.map((armor,i)=>({room:{armor,breach:100-armor,erased:false,solarPenetrated:false},roomIndex:i,end:endpoint(i+1),direct:false,reached:false}))}
function makeBeam(firstEnd){return{end:{id:firstEnd.id,copy(v){this.id=v.id}},visualEnd:{id:firstEnd.id},visualFrom:{id:firstEnd.id,copy(v){this.id=v.id}},extensionProgress:1,hold:.1,activeStage:-1,activeHit:null,blocked:false}}
const weapon={damage:48,armorDamage:72};

{
  const aimPointSource=sourceBlock('function projectedPrecisionAimPoint(','\nfunction renderEnemyAimOutlines(');
  const projectPoint=new Function(`${aimPointSource};return projectedPrecisionAimPoint;`)();
  assert.deepEqual(projectPoint({x:0,y:0},{x:100,y:0}),{x:430,y:0},'a short mobile drag must project far enough to reach the opposing fortress');
  assert.deepEqual(projectPoint({x:0,y:0},{x:300,y:0}),{x:690,y:0},'the projected reticle must stay inside its maximum controllable reach');
}

{
  const path=makePath(),beam=makeBeam(path[0].end);shieldMode='blocked';calls.shield=0;
  const result=resolveStage({},path,weapon,0,beam);
  assert.equal(result.blocked,true);
  assert.equal(calls.shield,1);
  assert.equal(path[0].reached,true);
  assert.equal(path[1].reached,false,'a blocked entry must not resolve later cabins');
  assert.equal(path[0].room.armor,100);
  assert.equal(beam.blocked,true);
}

{
  const path=makePath(),beam=makeBeam(path[0].end);shieldMode='open';calls.shield=0;calls.structure.length=0;
  resolveStage({},path,weapon,0,beam);
  assert.deepEqual(path.map(h=>h.room.armor),[28,100,100],'stage one may only damage cabin one');
  resolveStage({},path,weapon,1,beam);
  assert.deepEqual(path.map(h=>h.room.armor),[28,48,100],'stage two must resolve separately at 72% power');
  resolveStage({},path,weapon,2,beam);
  assert.deepEqual(path.map(h=>h.room.armor),[28,48,64],'stage three must resolve separately at 50% power');
  assert.equal(calls.shield,1,'the shield envelope is crossed once at entry');
  assert.deepEqual(calls.structure,[72,52,36]);
  assert.equal(beam.extensionProgress,0,'each new cabin resets the visible extension animation');
}

{
  const survivor={roomIndex:0,hp:100,active:true,exposedBySolar:false,exposedByBreach:false};crew.splice(0,crew.length,survivor);const path=makePath([80]),beam=makeBeam(path[0].end);shieldMode='open';calls.conceal=0;calls.crew.length=0;
  resolveStage({},path,weapon,0,beam);
  assert.equal(path[0].room.breach,92);
  assert.equal(survivor.exposedBySolar,true,'a targetable solar breach must expose its real survivor');
  assert.ok(calls.conceal>0,'exposure must immediately resync the survivor render');
  assert.equal(calls.crew[0],35,'first-cabin crew damage remains strong without becoming an automatic kill');
  crew.length=0;
}

{
  const depthSource=sourceBlock('function syncExposedWarriorDepth(','\nfunction syncWarriorConcealment(');
  const syncDepth=new Function(`${depthSource};return syncExposedWarriorDepth;`)();
  const material={userData:{},depthTest:true,depthWrite:true,transparent:false,opacity:.78,needsUpdate:false};
  const mesh={isMesh:true,material,userData:{},renderOrder:24};
  const warrior={model3D:{traverse(fn){fn(mesh)}}};
  syncDepth(warrior,true);
  assert.equal(material.transparent,true,'exposed survivor must enter the transparent render pass after the wreck cavity');
  assert.equal(material.depthTest,false);
  assert.equal(mesh.renderOrder,78);
  syncDepth(warrior,false);
  assert.equal(material.transparent,false);
  assert.equal(material.depthTest,true);
  assert.equal(material.depthWrite,true);
  assert.equal(material.opacity,.78);
  assert.equal(mesh.renderOrder,24);
}

{
  const {patchIndexHtml}=await import(pathToFileURL(resolve(root,'game-html-patcher.js')));
  const {patchEarthSpecialistsRuntime}=await import(pathToFileURL(resolve(root,'earth-specialists-runtime.js')));
  const {patchSolarLancerRuntime}=await import(pathToFileURL(resolve(root,'solar-lancer-runtime.js')));
  const compiled=patchSolarLancerRuntime(patchEarthSpecialistsRuntime(patchIndexHtml(base)));
  const aimStart=compiled.indexOf('function setAimVisual('),aimEnd=compiled.indexOf('\nfunction clearAim(',aimStart),aimBlock=compiled.slice(aimStart,aimEnd);
  const releaseStart=compiled.indexOf('function finishPointer('),releaseEnd=compiled.indexOf("canvas.addEventListener('pointerup'",releaseStart),releaseBlock=compiled.slice(releaseStart,releaseEnd);
  assert.ok(aimBlock.includes("precisionPoint=wp.kind==='laser'?projectedPrecisionAimPoint(a,b):b"),'the live Solar Lancer reticle must use the shared projected point');
  assert.ok(aimBlock.includes('renderEnemyAimOutlines(precisionPoint)'),'cabin outlines must follow the projected reticle, not the player thumb');
  assert.ok(!aimBlock.includes('solarFanAimGuide'),'the retired cyan fan preview must not survive the production patch chain');
  assert.ok(releaseBlock.includes("(selected?.weaponKey==='sniper'||selected?.weaponKey==='solar_lancer')&&aimOriginStage?projectedPrecisionAimPoint(aimOriginStage,pt):pt"),'release must use the exact same projection solver as the visible Solar Lancer reticle');
}

console.log('PASS Solar Lancer projection matches release, stages three diminishing cabin hits, stops at shields, and renders exposed survivors above wreck cavities');
