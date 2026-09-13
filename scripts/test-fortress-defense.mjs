import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let source=fs.readFileSync(path.join(root,'after-contact-worker.js'),'utf8');
source=source.replace("import { DurableObject } from 'cloudflare:workers';","const DurableObject=class{constructor(ctx,env){this.ctx=ctx;this.env=env}};")
  .replace('export default {','const defaultWorker={')
  .replace('export class MyDurableObject','class MyDurableObject')+'\nglobalThis.TestDO=MyDurableObject;';
const context=vm.createContext({URL,Request,Response,TextDecoder,crypto,queueMicrotask,console,setTimeout,clearTimeout});
new vm.Script(source,{filename:'after-contact-worker.js'}).runInContext(context);

function socket(side){const messages=[];return{messages,deserializeAttachment:()=>({side}),send:value=>messages.push(JSON.parse(value))}}
async function room(factions={aurelian:{faction:'aurelian'},earth:{faction:'earth'}}){
  const sockets=[socket('aurelian'),socket('earth')],storage={state:null,async get(){return this.state},async put(_key,value){this.state=value}},ctx={storage,getWebSockets:()=>sockets,blockConcurrencyWhile(fn){this.ready=fn()}};
  const game=new context.TestDO(ctx,{});await ctx.ready;game.status='battle';game.hostToken='a';game.guestToken='e';game.factions=factions;game.defenses=vm.runInContext(`freshDefenseState(${JSON.stringify(factions)})`,context);game.morale={aurelian:25,earth:25};game.moraleLastKnown={aurelian:25,earth:25};game.moraleTurnStart={aurelian:25,earth:25};return{game,sockets};
}
const last=(ws,type)=>ws.messages.filter(m=>m.type===type).at(-1);

{
  const {game,sockets}=await room();game.turn='aurelian';
  await game.webSocketMessage(sockets[0],JSON.stringify({type:'arm_defense'}));
  assert.equal(last(sockets[0],'error').code,'MORALE_LOW');assert.equal(game.defenses.aurelian.usesRemaining,1);
  game.morale.aurelian=50;await game.webSocketMessage(sockets[0],JSON.stringify({type:'arm_defense'}));
  assert.equal(game.defenses.aurelian.armed,true);assert.equal(game.defenses.aurelian.usesRemaining,0);assert.equal(last(sockets[0],'defense_armed').defenseView.armed,true);
  game.turn='earth';game.actionLockUntil=0;await game.webSocketMessage(sockets[1],JSON.stringify({type:'fire',weapon:'bombardier',point:{x:1,y:1}}));
  const fire=last(sockets[0],'fire');assert.equal(fire.blocked,true);assert.equal(fire.defenseTrigger.key,'solar_wall');assert.equal(game.defenses.aurelian.armed,false);
}

{
  const factions={aurelian:{faction:'earth'},earth:{faction:'earth'}},{game,sockets}=await room(factions);game.turn='earth';game.morale.earth=50;
  await game.webSocketMessage(sockets[1],JSON.stringify({type:'arm_defense'}));assert.equal(game.defenses.earth.usesRemaining,1);
  game.turn='aurelian';game.actionLockUntil=0;await game.webSocketMessage(sockets[0],JSON.stringify({type:'fire',weapon:'bombardier',point:{x:1,y:1}}));
  const fire=last(sockets[1],'fire');assert.equal(fire.blocked,false);assert.equal(fire.defenseTrigger.key,'countermeasure_flares');assert.equal(fire.defenseTrigger.blockCount,2);assert.equal(game.defenses.earth.armed,false);
}

console.log('PASS fortress defenses enforce Morale, hidden use state, Solar Wall blocking, and two-missile flare interception');
