
/* ---- town-r1 (TEST, 11 Nov 2026): Astoria (Map 3) town NPCs, 40 villagers (astoria_npcs_v1.json FINAL, approved by DeaRz 11 Nov 07:58; TOWN_NPCS_v1) ----
   * 40 NPCs placed by district inside Map 3 (north_gate 5, market 10, plaza 7, smiths 4, homes 5, inn 5, east_gate 4); spots are picked at random inside the district rectangle and rejected on solids (blocked) / the map edge; Astoria is a full Safe Zone, so every spot is safe;
   * existing NPCs and the town's quest / shop modules are untouched (these are extra objects in NPCS, they never move an existing NPC);
   * kinds: stand = short looping work pose (hammer / sweep / instrument / sleep / idle) with a simple bob or tilt; walk = path inside its own district with random 2-6 s pauses, never leaves the district (and so never the safe area);
     quest / shop / board = stand + talk (their windows come later: the shop stock / quest logic are not wired in r1);
   * tap an NPC (click / F near it) = one-line talk bubble: a random line whose "if" is true (race=a|b|c, !race=.., done:<quest>, !done:<quest>, flags) via window.RACE.cond;
   * prototype art: the 12 existing 3/4 NPC sprites (NPC3Q) mirrored left / right, recoloured with a hue rotation per NPC; the villager kit (body + race part + cloth tint) replaces it later;
   * walkers further than ~1.5 screens from the hero freeze (no update); config window.__TOWN.cfg = {maxNpcs, maxActiveWalkers, ...}; ?town=off disables; __TOWN.sim(seconds) steps the walkers without rendering (tests). ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]town=off\b/.test(Q),ZID='astoria_capital';
const T=window.__TOWN={ver:'town-r1',on:!OFF,err:null,cfg:{maxNpcs:40,maxActiveWalkers:20,freezeDist:1500,pauseMin:2,pauseMax:6,speed:46,talkR:80},npcs:[],stats:{placed:0,talks:0,rejected:0,frozen:0},
  districts:{north_gate:[2300,260,3060,640],inn:[2260,1300,3100,1700],plaza:[2250,1850,3110,2420],market:[420,1950,1300,2520],smiths:[1500,2100,2350,2700],homes:[600,600,1900,1500],east_gate:[4550,1700,5150,2250]}};
if(OFF)return;
const ERR=(w,e)=>{T.err=w+': '+((e&&e.message)||e);try{console.error('[TOWN]',w,e)}catch(_){}};
const rnd=(a,b)=>a+Math.random()*(b-a);
const DATA=window.__TOWN_DATA;if(!DATA||!DATA.npcs){T.err='no data';return}
/* ---- sprites: 12 existing NPC bodies by race ---- */
const POOL={human:['ora','ferro','tor','pell','mira','varg'],cat:['mali','reo'],elf:['fon'],demon:['pip','hark'],none:['tor']};
const IM={};const img=k=>{if(IM[k]!==undefined)return IM[k];const d=window.NPC3Q&&NPC3Q[k];if(!d){IM[k]=null;return null}const i=new Image();i.decoding='async';i.src=d.src;IM[k]=i;return i};
const heroH=()=>{try{const c=window.PUPPETX&&PUPPETX.cfg;return c?c.TARGET_H*c.H_FACTOR:64}catch(_){return 64}};
const poseOf=n=>{const s=n.name;if(/ช่าง|ตี|ค้อน|ถ่าน|ฝึกงาน/.test(s))return 'hammer';if(/กวาด/.test(s))return 'sweep';if(/ขลุ่ย|ดนตรี|กวี|เป่า/.test(s))return 'play';if(/เมา|หลับ|ยาย|คุณยาย/.test(s))return 'sleep';return 'idle'};
/* ---- placement ---- */
const okSpot=(x,y)=>{try{const Z=ZONES[ZID];return x>120&&y>120&&x<Z.w-120&&y<Z.h-120&&!blocked(x,y,30)&&!blocked(x+24,y,18)&&!blocked(x-24,y,18)&&!blocked(x,y+16,18)&&(!window.__NPCFIX||!__NPCFIX.on||__NPCFIX.clear(x,y))}catch(_){return false}};
function spotIn(r,avoid){for(let i=0;i<80;i++){const x=rnd(r[0],r[2]),y=rnd(r[1],r[3]);if(!okSpot(x,y))continue;if(avoid&&avoid.some(a=>Math.hypot(a.x-x,a.y-y)<70))continue;return [x,y]}return null}
function place(){T.npcs=[];const placed=[];let cnt=0;const hueRot=n=>[0,20,-20,35,-35,0][n%6];
  for(const d of DATA.npcs){if(cnt>=T.cfg.maxNpcs)break;const r=T.districts[d.district];if(!r){T.stats.rejected++;continue}const s=spotIn(r,placed);if(!s){T.stats.rejected++;continue}
    const pool=POOL[d.race]||POOL.human,body=pool[cnt%pool.length];
    const n={x:s[0],y:s[1],n:d.name,kind:'town',town:1,id:d.id,district:d.district,race:d.race,tk:d.kind,lines:d.lines||[],body,hue:hueRot(cnt),home:{x:s[0],y:s[1]},pose:poseOf(d),ph:rnd(0,6.28),face:Math.random()<.5?-1:1,tgt:null,wait:rnd(0,T.cfg.pauseMax),moving:false};
    placed.push(n);T.npcs.push(n);cnt++}
  T.stats.placed=T.npcs.length;return T.npcs}
/* ---- walkers: random waypoints inside the own district, pauses 2-6 s, solid-checked steps ---- */
function stepNpc(n,dt){if(n.tk!=='walk')return;const r=T.districts[n.district];
  if(n.moving){const dx=n.tgt[0]-n.x,dy=n.tgt[1]-n.y,d=Math.hypot(dx,dy);if(d<6){n.moving=false;n.wait=rnd(T.cfg.pauseMin,T.cfg.pauseMax);return}
    const sp=T.cfg.speed*dt,nx=n.x+dx/d*Math.min(sp,d),ny=n.y+dy/d*Math.min(sp,d);if(nx<r[0]||nx>r[2]||ny<r[1]||ny>r[3]||blocked(nx,ny,22)){n.moving=false;n.wait=rnd(1,2);return}n.x=nx;n.y=ny;if(Math.abs(dx)>3)n.face=dx<0?-1:1}
  else{n.wait-=dt;if(n.wait<=0){const s=spotIn([Math.max(r[0],n.x-260),Math.max(r[1],n.y-260),Math.min(r[2],n.x+260),Math.min(r[3],n.y+260)]);if(s){n.tgt=s;n.moving=true}else n.wait=rnd(1,2)}}}
let tAcc=0;
function tick(dt,all){if(!T.npcs.length)return;let act=0;for(const n of T.npcs){if(n.tk!=='walk')continue;
    if(!all&&typeof P!=='undefined'&&P&&Math.hypot(n.x-P.x,n.y-P.y)>T.cfg.freezeDist){T.stats.frozen++;continue}if(!all&&act>=T.cfg.maxActiveWalkers)continue;act++;stepNpc(n,dt)}}
T.sim=function(sec){const dt=.05,N=Math.round(sec/dt);let outside=0,stuck=0;const start=T.npcs.map(n=>({x:n.x,y:n.y}));for(let i=0;i<N;i++){tick(dt,true);if(i%20===0)for(const n of T.npcs){const r=T.districts[n.district];if(n.x<r[0]||n.x>r[2]||n.y<r[1]||n.y>r[3])outside++;if(blocked(n.x,n.y,10))stuck++}}
  return {sec,walkers:T.npcs.filter(n=>n.tk==='walk').length,outsideDistrictSamples:outside,insideSolidSamples:stuck,moved:T.npcs.filter((n,i)=>n.tk==='walk'&&Math.hypot(n.x-start[i].x,n.y-start[i].y)>5).length}};
/* ---- draw ---- */
const TINT={};function tinted(k,im,hue){if(!hue)return im;const key=k+'|'+hue;let c=TINT[key];if(c)return c;c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');try{g.filter='hue-rotate('+hue+'deg)'}catch(_){}g.drawImage(im,0,0);return TINT[key]=c}
function drawTown(n){const t=(typeof time==='number'?time:performance.now()/1000)+n.ph,im=img(n.body),d=window.NPC3Q&&NPC3Q[n.body];const x=n.x,y=n.y;
  if(!im||!im.complete||!im.naturalWidth||!d){ctx.fillStyle='#c9a46a';ctx.beginPath();ctx.arc(x,y-30,12,0,6.283);ctx.fill();return}
  const hh=heroH()*d.scale*(n.tk==='stand'&&/เด็ก|ลูก/.test(n.n)?.8:1),sc=hh/(d.h-2*d.pad),dw=d.w*sc,dh=d.h*sc;
  ctx.save();ctx.globalAlpha*=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y+2,dw*.22,dw*.07,0,0,6.283);ctx.fill();ctx.restore();
  let rot=0,bob=0,sy=1+.005*(1+Math.sin(t*2.2));
  if(n.moving){bob=-Math.abs(Math.sin(t*7))*3;rot=Math.sin(t*7)*.03}
  else switch(n.pose){case 'hammer':rot=Math.max(0,Math.sin(t*5))*.11;bob=Math.max(0,Math.sin(t*5))*1.5;break;case 'sweep':rot=Math.sin(t*2.2)*.07;break;case 'play':bob=-Math.abs(Math.sin(t*3))*2;rot=Math.sin(t*1.5)*.03;break;case 'sleep':rot=.1+Math.sin(t*.8)*.02;sy=1+.01*Math.sin(t*.8);break;default:break}
  ctx.save();ctx.translate(x,y+bob);ctx.rotate(rot);ctx.scale(n.face>0?-1:1,sy);
  ctx.drawImage(tinted(n.body,im,n.hue),-dw/2,-(d.h-d.pad)*sc,dw,dh);ctx.restore();
  if(n.pose==='sleep'){ctx.save();ctx.fillStyle='#cfe6ff';ctx.font='700 14px sans-serif';ctx.globalAlpha=.5+.4*Math.sin(t*2);ctx.fillText('z',x+14,y-hh*.9-Math.sin(t)*3);ctx.restore()}
  try{label(x,y+16,n.n,'#e8e2cf')}catch(_){}}
try{const _dm=drawMerchant;drawMerchant=function(n){if(n&&n.town)return drawTown(n);return _dm.apply(this,arguments)}}catch(e){ERR('hook draw',e)}
/* ---- talk bubble ---- */
function doneFn(id){try{const C=window.CH1Q;if(C&&C.isDone)return !!C.isDone(id);const S=C&&C.state;return !!(S&&S.done&&S.done[id])}catch(_){return false}}
T.line=function(n){const ok=n.lines.filter(l=>!l.if||(window.RACE?RACE.cond(l.if,{},doneFn):true));return ok.length?ok[Math.floor(Math.random()*ok.length)].say:null};
T.say=function(n){const s=T.line(n);if(!s)return null;T.stats.talks++;n.bubble={s,t:time+4.2};T.last={id:n.id,say:s};try{log('['+n.n+'] '+s,'v')}catch(_){}return s};
try{const _i=interact;interact=function(){const it=G.interact;if(it&&it.k==='npc'&&it.n&&it.n.town){T.say(it.n);return true}return _i.apply(this,arguments)}}catch(e){ERR('hook interact',e)}
try{const cv=document.getElementById('c')||document.querySelector('canvas');window.addEventListener('pointerup',ev=>{try{if(G.zone!==ZID||G.state!=='play'||!T.npcs.length||ev.target!==cv&&!(ev.target&&ev.target.tagName==='CANVAS'))return;const wx=mwx(ev.clientX,ev.clientY),wy=mwy(ev.clientX,ev.clientY);let best=null,bd=1e9;for(const n of T.npcs){const d=Math.hypot(n.x-wx,n.y-40-wy);if(d<T.cfg.talkR&&d<bd){bd=d;best=n}}if(best)T.say(best)}catch(e){ERR('tap',e)}},true)}catch(e){ERR('tap hook',e)}
/* bubbles are drawn above the NPC */
try{const _t=drawTexts;drawTexts=function(){const r=_t.apply(this,arguments);try{if(G.zone===ZID)for(const n of T.npcs){const b=n.bubble;if(!b||time>b.t)continue;const w=Math.min(300,ctx.measureText(b.s).width+24);ctx.save();ctx.font='600 13px "Noto Sans Thai", system-ui, sans-serif';ctx.textAlign='center';const lines=[],words=b.s.split(' ');let cur='';for(const wd of words){if(ctx.measureText(cur+' '+wd).width>260&&cur){lines.push(cur);cur=wd}else cur=cur?cur+' '+wd:wd}if(cur)lines.push(cur);
      const bw=Math.min(300,Math.max(...lines.map(l=>ctx.measureText(l).width))+20),bh=lines.length*17+12,bx=n.x-bw/2,by=n.y-heroH()*1.35-bh;ctx.fillStyle='rgba(250,246,232,.95)';ctx.strokeStyle='#8a6a3a';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,bw,bh,8):ctx.rect(bx,by,bw,bh);ctx.fill();ctx.stroke();
      ctx.fillStyle='#3a2a18';lines.forEach((l,i)=>ctx.fillText(l,n.x,by+17+i*17));ctx.restore()}}catch(e){ERR('bubble',e)}return r}}catch(e){ERR('hook texts',e)}
/* ---- life cycle: placed when Astoria loads, ticked every frame ---- */
try{const _lz=loadZone;loadZone=function(zid){const r=_lz.apply(this,arguments);try{if(zid===ZID&&G.zone===ZID){const mine=T.npcs.length&&NPCS.some(n=>n.town);if(!mine){place()}for(const n of T.npcs)if(NPCS.indexOf(n)<0)NPCS.push(n)}else if(zid!==ZID){}}catch(e){ERR('loadZone',e)}return r}}catch(e){ERR('hook loadZone',e)}
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(G.zone===ZID&&G.state==='play')tick(dt,false)}catch(e){ERR('tick',e)}return r}}catch(e){ERR('hook update',e)}
console.info('[TOWN] Astoria town NPCs ready: '+DATA.npcs.length+' in data');
})();
