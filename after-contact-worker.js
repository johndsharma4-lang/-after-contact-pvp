import { DurableObject } from 'cloudflare:workers';

function roomNamespace(env){
  const direct=env.MY_DURABLE_OBJECT||env.GAME_ROOMS;
  if(direct&&typeof direct.idFromName==='function'&&typeof direct.get==='function')return direct;
  for(const value of Object.values(env||{})){
    if(value&&typeof value.idFromName==='function'&&typeof value.get==='function')return value;
  }
  throw new Error('Durable Object binding missing. Use the Worker + Durable Objects template, or add a binding to MyDurableObject.');
}

const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code=()=>Array.from({length:6},()=>CHARS[Math.floor(Math.random()*CHARS.length)]).join('');
const token=()=>crypto.randomUUID().replaceAll('-','');
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const factionMovementMode=faction=>String(faction||'').toLowerCase()==='earth'?'ground':String(faction||'').toLowerCase()==='lizard'?'submerged':'flight';
const factionAllowsVerticalMovement=faction=>factionMovementMode(faction)!=='ground';
const verticalBoundsForFaction=faction=>String(faction||'').toLowerCase()==='lizard'?{min:6,max:27.5}:String(faction||'').toLowerCase()==='earth'?{min:4.2,max:4.2}:{min:8,max:58};
const positionForSide=(side,faction)=>({x:side==='aurelian'?-31:28,y:String(faction||'').toLowerCase()==='earth'?4.2:18});

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(request.method==='GET'&&url.pathname==='/api/nda/status'){
      const tester=String(url.searchParams.get('tester')||'').slice(0,160);
      if(tester.length<8)return json({accepted:false,version:null});
      const ns=roomNamespace(env),id=ns.idFromName('after-contact-nda-ledger-v1'),stub=ns.get(id);
      const target=new URL('https://room/nda-status');target.searchParams.set('tester',tester);
      return stub.fetch(new Request(target,{method:'GET'}));
    }
    if(request.method==='POST'&&url.pathname==='/api/nda/accept'){
      let d;try{d=await request.json()}catch{return json({error:'Invalid body'},400)}
      const ns=roomNamespace(env),id=ns.idFromName('after-contact-nda-ledger-v1'),stub=ns.get(id);
      return stub.fetch(new Request('https://room/nda-accept',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tester:String(d.tester||'').slice(0,160),name:String(d.name||'').trim().slice(0,100),version:String(d.version||'').slice(0,20)})}));
    }
    if(request.method==='POST'&&url.pathname==='/api/create'){
      const roomCode=code(),hostToken=token();
      const id=roomNamespace(env).idFromName(roomCode);
      const stub=roomNamespace(env).get(id);
      const r=await stub.fetch(new Request(`https://room/init`,{method:'POST',body:JSON.stringify({code:roomCode,hostToken})}));
      if(!r.ok)return r;
      return json({code:roomCode,token:hostToken});
    }
    const join=url.pathname.match(/^\/api\/join\/([A-Z0-9]{4,10})$/i);
    if(request.method==='POST'&&join){
      const roomCode=join[1].toUpperCase(),guestToken=token();
      const id=roomNamespace(env).idFromName(roomCode),stub=roomNamespace(env).get(id);
      return stub.fetch(new Request(`https://room/join`,{method:'POST',body:JSON.stringify({guestToken})}));
    }
    const ready=url.pathname.match(/^\/api\/ready\/([A-Z0-9]{4,10})$/i);
    if(request.method==='POST'&&ready){
      const roomCode=ready[1].toUpperCase();
      let d;try{d=await request.json()}catch{return json({error:'Invalid body'},400)}
      const id=roomNamespace(env).idFromName(roomCode),stub=roomNamespace(env).get(id);
      return stub.fetch(new Request('https://room/ready',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:String(d.token||''),deployment:Array.isArray(d.deployment)?d.deployment.slice(0,1):[],faction:String(d.faction||''),warrior:String(d.warrior||'')})}));
    }
    const stateRoute=url.pathname.match(/^\/api\/state\/([A-Z0-9]{4,10})$/i);
    if(request.method==='GET'&&stateRoute){
      const roomCode=stateRoute[1].toUpperCase();
      const id=roomNamespace(env).idFromName(roomCode),stub=roomNamespace(env).get(id);
      const target=new URL('https://room/state');target.searchParams.set('token',url.searchParams.get('token')||'');
      return stub.fetch(new Request(target,{method:'GET'}));
    }
    const ws=url.pathname.match(/^\/ws\/([A-Z0-9]{4,10})$/i);
    if(ws){
      const roomCode=ws[1].toUpperCase(),id=roomNamespace(env).idFromName(roomCode),stub=roomNamespace(env).get(id);
      const target=new URL('https://room/ws');target.searchParams.set('token',url.searchParams.get('token')||'');
      return stub.fetch(new Request(target,request));
    }
    if(request.method==='GET' || request.method==='HEAD') return env.ASSETS.fetch(request);
    return new Response('Not found',{status:404});
  }
};

export class MyDurableObject extends DurableObject {
  constructor(ctx, env){
    super(ctx,env);this.ctx=ctx;this.env=env;
    this.ready={aurelian:null,earth:null};this.factions={aurelian:null,earth:null};this.playReady={aurelian:false,earth:false};this.turn='aurelian';this.round=1;this.status='lobby';this.hostToken='';this.guestToken='';this.roomCode='';
    this.positions={aurelian:{x:-31,y:18},earth:{x:28,y:4.2}};this.moveUsed={aurelian:0,earth:0};this.actionLockUntil=0;
    ctx.blockConcurrencyWhile(async()=>{const s=await ctx.storage.get('state');if(s)Object.assign(this,s);if(!this.playReady)this.playReady={aurelian:false,earth:false};if(!this.positions)this.positions={aurelian:{x:-31,y:18},earth:{x:28,y:4.2}};if(!this.moveUsed)this.moveUsed={aurelian:0,earth:0}});
  }
  state(){return{ready:this.ready,factions:this.factions,playReady:this.playReady,turn:this.turn,round:this.round,status:this.status,hostToken:this.hostToken,guestToken:this.guestToken,roomCode:this.roomCode,positions:this.positions,moveUsed:this.moveUsed}}
  async persist(){await this.ctx.storage.put('state',this.state())}
  roleFor(t){if(t&&t===this.hostToken)return'aurelian';if(t&&t===this.guestToken)return'earth';return null}
  sockets(){return this.ctx.getWebSockets()}
  countPlayers(){const roles=new Set();for(const ws of this.sockets()){try{roles.add(ws.deserializeAttachment()?.side)}catch{}}return [...roles].filter(Boolean).length}
  send(ws,obj){try{ws.send(JSON.stringify(obj))}catch{}}
  broadcast(obj){const payload=JSON.stringify(obj);for(const ws of this.sockets()){try{ws.send(payload)}catch{}}}
  async fetch(request){
    const url=new URL(request.url);
    if(request.method==='GET'&&url.pathname==='/nda-status'){
      const tester=String(url.searchParams.get('tester')||'').slice(0,160);
      if(tester.length<8)return json({accepted:false,version:null});
      const record=await this.ctx.storage.get(`nda:${tester}`);
      return json(record?{accepted:true,version:record.version,name:record.name,acceptedAt:record.acceptedAt}:{accepted:false,version:null});
    }
    if(request.method==='POST'&&url.pathname==='/nda-accept'){
      let d;try{d=await request.json()}catch{return json({error:'Invalid body'},400)}
      const tester=String(d.tester||'').slice(0,160),name=String(d.name||'').trim().slice(0,100),version=String(d.version||'').slice(0,20);
      if(tester.length<8||name.length<2||version!=='1.0')return json({error:'Invalid NDA acceptance'},400);
      const record={version,name,acceptedAt:new Date().toISOString()};
      await this.ctx.storage.put(`nda:${tester}`,record);
      return json({ok:true,...record});
    }
    if(request.method==='POST'&&url.pathname==='/init'){
      const d=await request.json();if(this.hostToken)return json({error:'Room already exists'},409);
      this.hostToken=d.hostToken;this.roomCode=d.code;await this.persist();return json({ok:true});
    }
    if(request.method==='POST'&&url.pathname==='/join'){
      if(!this.hostToken)return json({error:'Room not found'},404);
      if(this.guestToken)return json({error:'Room already has a guest player'},409);
      const d=await request.json();this.guestToken=d.guestToken;await this.persist();return json({token:this.guestToken,side:'earth'});
    }
    if(request.method==='GET'&&url.pathname==='/state'){
      const side=this.roleFor(url.searchParams.get('token')||'');
      if(!side)return json({error:'Invalid room token'},403);
      return json({
        ok:true,side,status:this.status,turn:this.turn,round:this.round,players:this.countPlayers(),
        playReady:{aurelian:!!this.playReady.aurelian,earth:!!this.playReady.earth},
        ready:{aurelian:!!this.ready.aurelian,earth:!!this.ready.earth},
        deployments:this.ready,factions:this.factions,positions:this.positions,moveUsed:this.moveUsed
      });
    }
    if(request.method==='POST'&&url.pathname==='/ready'){
      let d;try{d=await request.json()}catch{return json({error:'Invalid body'},400)}
      const side=this.roleFor(String(d.token||''));
      if(!side)return json({error:'Invalid room token'},403);
      // v0.25.3: READY is idempotent. If the room already advanced to battle,
      // return the authoritative battle state instead of rejecting a retry.
      if(this.status==='battle'&&this.ready.aurelian&&this.ready.earth){
        return json({
          ok:true,side,status:this.status,turn:this.turn,round:this.round,
          ready:{aurelian:true,earth:true},deployments:this.ready,factions:this.factions,positions:this.positions,moveUsed:this.moveUsed
        });
      }
      if(this.status!=='lobby')return json({error:'Match is not in lobby'},409);
      const dep=Array.isArray(d.deployment)?d.deployment.slice(0,1):[];
      if(dep.length!==1||!Number.isInteger(dep[0])||dep[0]<0||dep[0]>8)return json({error:'Invalid deployment'},400);
      const allowed={earth:'bombardier',aurelian:'solar_lancer',lizard:'acid_brute',gray:'spatial_disintegrator'};
      const faction=allowed[String(d.faction||'').toLowerCase()]?String(d.faction).toLowerCase():(side==='earth'?'earth':'aurelian');
      const warrior=allowed[faction];
      this.factions[side]={faction,warrior};
      this.ready[side]=dep;await this.persist();
      this.broadcast({type:'deployment_state',ready:{aurelian:!!this.ready.aurelian,earth:!!this.ready.earth},deployments:this.ready,factions:this.factions,status:this.status});
      if(this.ready.aurelian&&this.ready.earth){
        this.actionLockUntil=0;this.status='battle';this.turn='aurelian';this.round=1;this.positions={aurelian:positionForSide('aurelian',this.factions?.aurelian?.faction||'aurelian'),earth:positionForSide('earth',this.factions?.earth?.faction||'earth')};this.moveUsed={aurelian:0,earth:0};await this.persist();
        this.broadcast({type:'start',deployments:this.ready,factions:this.factions,turn:this.turn,round:this.round,positions:this.positions,moveUsed:this.moveUsed});
      }
      return json({
        ok:true,side,status:this.status,turn:this.turn,round:this.round,
        ready:{aurelian:!!this.ready.aurelian,earth:!!this.ready.earth},
        deployments:this.ready,factions:this.factions,positions:this.positions,moveUsed:this.moveUsed
      });
    }
    if(url.pathname==='/ws'){
      if(request.headers.get('Upgrade')!=='websocket')return new Response('Expected websocket',{status:426});
      const t=url.searchParams.get('token')||'',side=this.roleFor(t);if(!side)return new Response('Invalid room token',{status:403});
      const pair=new WebSocketPair(),client=pair[0],server=pair[1];
      this.ctx.acceptWebSocket(server);server.serializeAttachment({side,token:t});
      this.send(server,{type:'hello',side,players:Math.max(1,this.countPlayers()),turn:this.turn,round:this.round,status:this.status,playReady:this.playReady,ready:{aurelian:!!this.ready.aurelian,earth:!!this.ready.earth},deployments:this.ready,factions:this.factions,positions:this.positions,moveUsed:this.moveUsed});this.send(server,{type:'deployment_state',ready:{aurelian:!!this.ready.aurelian,earth:!!this.ready.earth},deployments:this.ready,factions:this.factions,status:this.status});this.send(server,{type:'play_state',ready:this.playReady});
      queueMicrotask(()=>this.broadcast({type:'players',count:this.countPlayers()}));
      if(this.status==='lobby'&&this.playReady.aurelian&&this.playReady.earth)this.send(server,{type:'play_start',recovered:true});
      if(this.status==='battle'&&this.ready.aurelian&&this.ready.earth)this.send(server,{type:'start',deployments:this.ready,factions:this.factions,turn:this.turn,round:this.round,positions:this.positions,moveUsed:this.moveUsed});
      return new Response(null,{status:101,webSocket:client});
    }
    return new Response('Not found',{status:404});
  }
  async webSocketMessage(ws,message){
    let m;try{m=JSON.parse(typeof message==='string'?message:new TextDecoder().decode(message))}catch{return}
    const side=ws.deserializeAttachment()?.side;if(!side)return;
    if(m.type==='ping'){this.send(ws,{type:'pong',ts:Number(m.ts)||Date.now(),serverTs:Date.now(),status:this.status,turn:this.turn,round:this.round});return}
    if(m.type==='play_ready'){
      if(this.status!=='lobby')return;
      this.playReady[side]=true;await this.persist();
      this.broadcast({type:'play_state',ready:this.playReady});
      if(this.playReady.aurelian&&this.playReady.earth)this.broadcast({type:'play_start'});
      return;
    }
    if(m.type==='ready'){
      const dep=Array.isArray(m.deployment)?m.deployment.slice(0,1):[];
      if(dep.length!==1||!Number.isInteger(dep[0])||dep[0]<0||dep[0]>8)return this.send(ws,{type:'error',message:'Invalid deployment'});
      if(this.status==='battle'&&this.ready.aurelian&&this.ready.earth){
        this.send(ws,{type:'ready_ack',side,deployment:this.ready[side]||dep});
        this.send(ws,{type:'start',deployments:this.ready,factions:this.factions,turn:this.turn,round:this.round,positions:this.positions,moveUsed:this.moveUsed});
        return;
      }
      if(this.status!=='lobby')return this.send(ws,{type:'error',message:'Match is not in lobby'});
      const allowed={earth:'bombardier',aurelian:'solar_lancer',lizard:'acid_brute',gray:'spatial_disintegrator'};
      const faction=allowed[String(m.faction||'').toLowerCase()]?String(m.faction).toLowerCase():(side==='earth'?'earth':'aurelian');
      this.factions[side]={faction,warrior:allowed[faction]};
      this.ready[side]=dep;await this.persist();
      this.send(ws,{type:'ready_ack',side,deployment:dep,faction,warrior:allowed[faction]});
      this.broadcast({type:'deployment_state',ready:{aurelian:!!this.ready.aurelian,earth:!!this.ready.earth},deployments:this.ready,factions:this.factions,status:this.status});
      if(this.ready.aurelian&&this.ready.earth){
        this.status='battle';this.turn='aurelian';this.round=1;this.positions={aurelian:positionForSide('aurelian',this.factions?.aurelian?.faction||'aurelian'),earth:positionForSide('earth',this.factions?.earth?.faction||'earth')};this.moveUsed={aurelian:0,earth:0};await this.persist();
        this.broadcast({type:'start',deployments:this.ready,factions:this.factions,turn:this.turn,round:this.round,positions:this.positions,moveUsed:this.moveUsed})
      }else{
        this.send(ws,{type:'waiting'})
      }
      return;
    }
    if(m.type==='move'){
      if(this.status!=='battle')return this.send(ws,{type:'error',code:'MATCH_INACTIVE',message:'Match is not active'});
      if(side!==this.turn)return this.send(ws,{type:'error',code:'NOT_TURN',message:'Not your turn'});
      if((this.moveUsed?.[side]||0)>=5)return this.send(ws,{type:'error',code:'MOVE_DEPLETED',message:'Mobility core depleted'});
      let dx=Math.sign(Number(m.dx)||0),dy=Math.sign(Number(m.dy)||0);
      const faction=this.factions?.[side]?.faction||(side==='earth'?'earth':'aurelian');
      const vertical=factionAllowsVerticalMovement(faction),mode=factionMovementMode(faction),yb=verticalBoundsForFaction(faction);
      if(!vertical)dy=0;
      if((Math.abs(dx)+Math.abs(dy))!==1)return this.send(ws,{type:'error',code:'INVALID_MOVE',message:'Invalid move'});
      const cur=this.positions?.[side]||positionForSide(side,faction);
      const pct=Math.max(0,Math.min(1,Number(m.structurePct)||1)),cost=pct<=.50?2:1,scale=pct<=.25?.48:pct<=.50?.66:pct<=.75?.84:1;
      if((this.moveUsed?.[side]||0)+cost>5)return this.send(ws,{type:'error',code:'MOVE_DEPLETED',message:'Damaged propulsion requires more mobility energy'});
      const xStep=7.5*scale,yStep=4.5*scale;
      let nx=cur.x+dx*xStep,ny=cur.y+dy*yStep;
      nx=side==='aurelian'?Math.max(-105,Math.min(-18,nx)):Math.max(18,Math.min(105,nx));
      ny=vertical?Math.max(yb.min,Math.min(yb.max,ny)):4.2;
      if(nx===cur.x&&ny===cur.y)return this.send(ws,{type:'error',code:'MOVE_BOUNDARY',message:'Movement boundary reached'});
      this.positions[side]={x:nx,y:ny};this.moveUsed[side]=(this.moveUsed[side]||0)+cost;await this.persist();
      this.broadcast({type:'move',side,position:this.positions[side],remaining:5-this.moveUsed[side]});return;
    }
    if(m.type==='fire'){
      if(this.status!=='battle')return this.send(ws,{type:'error',code:'MATCH_INACTIVE',message:'Match is not active'});
      if(Date.now()<(this.actionLockUntil||0))return this.send(ws,{type:'error',code:'ACTION_LOCK',message:'Weapon action still resolving'});
      if(side!==this.turn)return this.send(ws,{type:'error',code:'NOT_TURN',message:'Not your turn'});
      const pt=m.point||{};if(!Number.isFinite(pt.x)||!Number.isFinite(pt.y)||pt.x<0||pt.x>1280||pt.y<0||pt.y>720)return this.send(ws,{type:'error',code:'INVALID_SHOT',message:`Invalid shot • x=${String(pt.x)} y=${String(pt.y)}`});
      const power=Math.max(18,Math.min(100,Number(m.power)||18));
      const identity=this.factions?.[side]||{faction:side==='earth'?'earth':'aurelian',warrior:side==='earth'?'bombardier':'solar_lancer'};
      const next=side==='aurelian'?'earth':'aurelian';
      const actionMs=identity.warrior==='solar_lancer'?5250:identity.warrior==='bombardier'?2200:0;
      if(actionMs){
        const actionName=identity.warrior==='solar_lancer'?'solar':'he9_barrage';
        this.actionLockUntil=Date.now()+actionMs;await this.persist();
        this.broadcast({type:'fire',side,faction:identity.faction,warrior:identity.warrior,point:{x:pt.x,y:pt.y},power,nextTurn:side,round:this.round,actionLock:actionName});
        setTimeout(async()=>{
          if(this.status!=='battle'||this.turn!==side)return;
          if(side==='earth'){this.round+=1;if(this.round>15){this.status='ended';this.actionLockUntil=0;await this.persist();this.broadcast({type:'draw',reason:'15 ROUNDS COMPLETE'});return}}
          this.turn=next;this.moveUsed[next]=0;this.actionLockUntil=0;await this.persist();this.broadcast({type:'turn',turn:next,round:this.round,reason:actionName+'_complete'});
        },actionMs);
        return;
      }
      if(side==='earth'){this.round+=1;if(this.round>15){this.status='ended';await this.persist();this.broadcast({type:'draw',reason:'15 ROUNDS COMPLETE'});return}}
      this.turn=next;this.moveUsed[next]=0;await this.persist();this.broadcast({type:'fire',side,faction:identity.faction,warrior:identity.warrior,point:{x:pt.x,y:pt.y},power,nextTurn:next,round:this.round});return;
    }
    if(m.type==='match_end'){
      if(this.status==='ended')return;this.status='ended';await this.persist();const winner=m.winner==='earth'?'earth':'aurelian';this.broadcast({type:'match_end',winner,reason:String(m.reason||'MATCH COMPLETE').slice(0,120)});return;
    }
    if(m.type==='reset'){
      const mode=m.mode==='faction'?'faction':(m.mode==='redeploy'?'redeploy':'rematch');
      if(mode==='faction'){this.actionLockUntil=0;this.status='lobby';this.ready={aurelian:null,earth:null};this.factions={aurelian:null,earth:null};this.turn='aurelian';this.round=1;this.positions={aurelian:{x:-31,y:18},earth:{x:28,y:4.2}};this.moveUsed={aurelian:0,earth:0};await this.persist();this.broadcast({type:'reset',mode:'faction'});return}
      if(mode==='redeploy'){this.actionLockUntil=0;this.status='lobby';this.ready={aurelian:null,earth:null};this.turn='aurelian';this.round=1;this.positions={aurelian:{x:-31,y:18},earth:{x:28,y:4.2}};this.moveUsed={aurelian:0,earth:0};this.actionLockUntil=0;await this.persist();this.broadcast({type:'reset',mode:'redeploy'});return}
      if(!this.ready.aurelian||!this.ready.earth)return this.send(ws,{type:'error',message:'Both deployments are required'});
      this.status='battle';this.turn='aurelian';this.round=1;this.positions={aurelian:positionForSide('aurelian',this.factions?.aurelian?.faction||'aurelian'),earth:positionForSide('earth',this.factions?.earth?.faction||'earth')};this.moveUsed={aurelian:0,earth:0};await this.persist();this.broadcast({type:'reset',mode:'rematch',deployments:this.ready,factions:this.factions,turn:this.turn,round:this.round,positions:this.positions,moveUsed:this.moveUsed});return;
    }
    if(m.type==='leave'){try{ws.close(1000,'left match')}catch{}}
  }
  async webSocketClose(){queueMicrotask(()=>this.broadcast({type:'players',count:this.countPlayers()}))}
  async webSocketError(){queueMicrotask(()=>this.broadcast({type:'players',count:this.countPlayers()}))}
}
