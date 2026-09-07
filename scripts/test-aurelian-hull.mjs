import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vendor=process.env.AC_HULL_VENDOR||path.resolve(root,'../vendor/node_modules');
const THREE=await import(pathToFileURL(path.join(vendor,'three/build/three.module.js')));
const {parse}=await import(pathToFileURL(path.join(vendor,'acorn/dist/acorn.mjs')));
const raw=fs.readFileSync(path.join(root,'index.html'),'utf8');
const {patchAurelianCanonExteriorRuntime:patch}=await import(pathToFileURL(path.join(root,'aurelian-canon-exterior-runtime.js')));
const checks=[];const ok=s=>{checks.push(s);console.log('PASS '+s)};
const patched=patch(raw);assert.notEqual(patched,raw);assert.equal(patch(patched),patched);ok('Hull patch applies once and is idempotent');
assert.equal(patch(raw.replace('function buildAurelianDirectorHull(', 'function unknownHull(')),raw.replace('function buildAurelianDirectorHull(', 'function unknownHull('));
assert.equal(patch(raw.replace("name:'PILOT_COCKPIT',x:-8.8", "name:'PILOT_COCKPIT',x:-9.8")),raw.replace("name:'PILOT_COCKPIT',x:-8.8", "name:'PILOT_COCKPIT',x:-9.8"));ok('Mismatched source/layout does not partially replace the game');
function buildContext(html){
  const body=html.slice(html.indexOf('function acAurelianShape('),html.indexOf('function addUnifiedExteriorShell('));
  parse(body,{ecmaVersion:'latest'});
  const ctx=vm.createContext({THREE,diag:()=>{},box:(w,h,d,c,metalness=.5,roughness=.5)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,metalness,roughness}))});
  vm.runInContext(body,ctx);return ctx;
}
const native=buildContext(raw),ctx=buildContext(patched);
const material=(color,metalness=.5,roughness=.5,emissive=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness,emissive});
const original=new THREE.Group();native.buildAurelianDirectorHull(original,0,material);
const skins=[0,5].map(cy=>{const s=new THREE.Group();ctx.buildAurelianDirectorHull(s,cy,material);s.updateMatrixWorld(true);return s});
assert.equal(JSON.stringify(skins[0].userData.acCutawayBayLayout),JSON.stringify(original.userData.acCutawayBayLayout));ok('All six bay coordinates, dimensions, roles and polygon points preserved exactly');
const a=skins[0],b=skins[1],panels=a.userData.acCutawayBayPanels;
assert.equal(panels.length,6);assert.equal(new Set(panels).size,6);
function descendants(root){const nodes=[];root.traverse(o=>nodes.push(o));return nodes}
const aa=descendants(a),bb=descendants(b);assert.equal(aa.length,bb.length);
for(let i=0;i<aa.length;i++){assert.equal(aa[i].name,bb[i].name);if(i===0||aa[i].name==='AURELIAN_DIRECTOR_HULL_STRUCTURE')continue;const p=aa[i].getWorldPosition(new THREE.Vector3()),q=bb[i].getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(q.y-p.y-5)<1e-8,aa[i].name);assert.ok(Math.abs(q.x-p.x)<1e-8&&Math.abs(q.z-p.z)<1e-8)}ok('Every opposite-side component uses exactly one vertical offset');
for(const o of aa)if(o.geometry){const p=o.geometry.attributes.position;for(let i=0;i<p.array.length;i++)assert.ok(Number.isFinite(p.array[i]),o.name);o.geometry.computeBoundingBox();assert.equal(o.geometry.boundingBox.isEmpty(),false)}ok('Real Three.js geometries have finite vertices and nonempty bounds');
const n=aa.length;ctx.buildAurelianDirectorHull(a,0,material);assert.equal(descendants(a).length,n);ok('Repeated builder calls do not duplicate the ship');
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))yes=!yes}return yes}
const ray=new THREE.Raycaster();let samples=0;
for(const s of a.userData.acCutawayBayLayout)for(let x=-s.w*.40;x<=s.w*.40;x+=.62)for(let y=-s.h*.36;y<=s.h*.36;y+=.53){if(!inside([x,y],s.points.map(p=>[p[0]*.82,p[1]*.82])))continue;ray.set(new THREE.Vector3(s.x+x,s.y+y,30),new THREE.Vector3(0,0,-1));const hits=ray.intersectObject(a.userData.acPrimaryHull,true).filter(h=>h.point.z>2.0);assert.equal(hits.length,0,'Armor blocks bay '+s.index+' at '+[x,y]+' by '+hits.map(h=>h.object.name));samples++}
ok(samples+' aperture rays clear fixed armor, including the previously blocked corners');
const cp=a.getObjectByName('AURELIAN_CANON_COCKPIT'),cn=a.getObjectByName('AURELIAN_CANON_SOLAR_CANNON_ART'),ex=a.getObjectByName('AURELIAN_CANON_EXHAUST_CLUSTER');assert.equal(cp.parent,panels[0]);assert.equal(cn.parent,panels[5]);assert.equal(descendants(ex).filter(o=>o.name==='AURELIAN_CANON_EXHAUST_HOUSING').length,3);assert.equal(descendants(ex).filter(o=>o.name==='AURELIAN_CANON_EXHAUST_PIPE').length,2);ok('Cockpit/cannon owned by doors; three exhaust housings and two pipes owned by fixed hull');
const seal=raw.slice(raw.indexOf('function setCutawayBayOpen('),raw.indexOf('function setCutawayFiringStage('));vm.runInContext(seal,ctx);
const visuals=panels.map((panel,i)=>{const cell=new THREE.Group(),interior=new THREE.Group(),shutter=new THREE.Group(),anchor=new THREE.Object3D();anchor.position.set(i+1,2,3);interior.add(anchor);cell.add(interior,shutter);return{index:i,nativeRoom:cell,interiorRoot:interior,frontShutter:shutter,exteriorPanel:panel,anchor}});
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true}
for(let cycle=0;cycle<20;cycle++){
  for(const v of visuals)ctx.setCutawayBayOpen(v,true);assert.ok(!visible(cp)&&!visible(cn)&&visible(ex));
  for(let shooter=0;shooter<6;shooter++){for(const v of visuals)ctx.setCutawayBayOpen(v,v.index===shooter);assert.ok(visible(visuals[shooter].interiorRoot));assert.ok(!visible(panels[shooter]));assert.equal(panels.filter(visible).length,5);assert.ok(visible(ex));}
  for(const v of visuals){ctx.setCutawayBayOpen(v,false);assert.deepEqual(v.anchor.position.toArray(),[v.index+1,2,3])}assert.ok(visible(cp)&&visible(cn)&&visible(ex));
}
ok('20 open/close cycles and all six shooter bays preserve exact panel ownership, crew anchors and exhaust visibility');
// Compile the complete production patch chain rather than just a standalone new module.
const router=fs.readFileSync(path.join(root,'router-worker.js'),'utf8');
const imports=new Map([...router.matchAll(/import \{ (\w+) \} from '\.\/([^']+)';/g)].map(m=>[m[1],m[2]]));
let full=raw;for(const [,name] of router.matchAll(/html=(patch\w+)\((?:rawHtml|html)\)/g)){const f=imports.get(name);assert.ok(f,name);const module=await import(pathToFileURL(path.join(root,f)));full=module[name](full)}
const scripts=[...full.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];let parsed=0;for(const [,attrs,code] of scripts){if(attrs.includes('application/json')||attrs.includes('importmap'))continue;parse(code,{sourceType:attrs.includes('module')?'module':'script',ecmaVersion:'latest',allowAwaitOutsideFunction:true});parsed++}
ok('Complete production chain applies and all '+parsed+' generated JavaScript blocks parse');
assert.equal((full.match(/function buildAurelianDirectorHull\(/g)||[]).length,1);assert.ok(!full.includes('function acBuildAurelianDirectorHullBase('));assert.ok(!full.includes('i===undefined?gold.clone()'));ok('One hull builder, no decorator stack and no undefined cannon loop variable');
const report={threeVersion:THREE.REVISION,checks,meshes:aa.filter(o=>o.isMesh).length,vertices:aa.filter(o=>o.geometry).reduce((n,o)=>n+o.geometry.attributes.position.count,0),apertureSamples:samples};
const output=process.env.AC_HULL_OUTPUT||path.resolve(root,'../test-output');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'hull-audit.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(output,'compiled.html'),full);console.log(JSON.stringify(report,null,2));
