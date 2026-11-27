
/* ---- candidate_balance_v1_r4: p258 r2 bow shot 8 directions + click-lock any direction (TEST only) ---- */
/* p258 r2 — Bow shot in 8 directions (candidate_balance_v1_r4; r2 = click-lock E-only check of p253 also passed, balance review v1_r3), TEST only, on top of p252 r2 + p255 r2). Not merged, not published.
   Art: approved\3d\bow_shoot_r13x3_layers (DeaRz 17 Oct "อนุมัติชุดธนู ปล่อยมุม 26° ไว้ ใช้ 24 fps"), 8 directions rendered separately
   (no mirroring), two layers drawn body first, then bow (bow + string + arrow + quiver) at the same anchor. Frames: NNN 052 = lowered
   rest, 053..105 = one shot (shot 2 of the 3-shot loop, the same 53 frames the old E set used), release = NNN 090 (clip index 37).
   Speed: one shot clip = the balance v1 shot time (1 shot / s at base, ASPD rule of p255) — DeaRz card 17 Oct 16:22 "1 นัดต่อวิ".
   How it plugs in without touching p252's code:
     • p252 still runs the shot (timing, arrow, damage, lock, cancel). Its E-only check reads camY() right after aimPoint(range):
       for that one read we return the angle that makes the aim count as "E", so every direction starts a shot. The real camera yaw
       is used everywhere else (and for our own direction pick).
     • drawing: outermost drawPlayerSprite layer draws the 8-direction layered frames during the shot and the rest pose after it;
       everything else (idle / walk / run / hurt / death) is p252's 8-direction loco art as before.
     • the arrow keeps p252's path / hit rules; only where it is drawn starts at this direction's drawn arrow head (data spawn tip).
     • at the release frame the archer turns to the locked target if it is still in the same 45° sector (p252 did this for E only).
   Arrow flies toward the game's target direction (the art's 26° offset is left as approved). Debug: window.BOW8. */
(function(){
'use strict';
const D=window.__BOW8,BW=window.BOW,HD=window.__HERO3D,H=window.HERO3D;
const B8=window.BOW8={ver:'p258-r3',on:true,err:null,ready:0,stats:{starts:{},releases:{},draws:0,rest:0,hacks:0,lockHacks:0,track:0,arrows:0},dir:null,last:null};
if(!D||!BW||!HD||!H){B8.err='missing '+(!D?'data ':'')+(!BW?'p252 ':'')+(!HD||!H?'hero':'');console.warn('[p258]',B8.err);return;}
const ORDER=D.dirs,N=D.shot.n,REL=D.shot.release,K=HD.drawScale,FY=HD.footY;
// placement: the 282x362 render is the bow loco / old E render with the top 80 rows kept (those sets were cut to the hero's 282x282 frame,
// anchor 141,208); measured: feet and body line up with the loco frames at exactly that offset. So frame px (x,y) sits like loco px (x,y-80).
const AX=HD.frame.ax,AY=HD.frame.ay+80;
const imgs={};for(const L of ['body','bow']){const im=new Image();im.onload=()=>{B8.ready++;};im.src=D.src[L];imgs[L]=im;}
const ok=()=>B8.on&&B8.ready===2&&BW.bowNow&&BW.bowNow();
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const yaw=()=>{try{return CAM&&!(typeof ED!=='undefined'&&ED.on)?CAM.yaw||0:0;}catch(e){return 0;}};
const dirOf=sa=>((Math.round(wrapA(sa)/(Math.PI/4))%8)+8)%8;   // screen angle -> E,SE,S,SW,W,NW,N,NE
const inSector=(sa,d)=>Math.abs(wrapA(sa-d*Math.PI/4))<Math.PI/8+0.09;

/* ---------- start: let p252's E-only check pass for every direction (one camY read, only inside its basic attack) ---------- */
let inAtk=0,pend=null;
{const o=basicAttack;basicAttack=function(){inAtk++;try{return o.apply(this,arguments);}finally{inAtk--;pend=null;}};}
{const o=aimPoint;aimPoint=function(range){const r=o.apply(this,arguments);
  try{if(inAtk&&ok()&&range===BW.cfg.range&&!BW.st){let ang=P.face||0;if(r&&isFinite(r.x)&&(r.x!==P.x||r.y!==P.y))ang=Math.atan2(r.y-P.y,r.x-P.x);
    pend={ang,sa:ang+yaw()};}}catch(e){B8.err='aim '+e.message;}
  return r;};}
/* r2: p253 (click-lock auto attack) has its own E-only check inside its private tick(): it reads TLOCK.losTo(target) and then camY()
   once. While p253's tick is running with the bow, that one camY read gets the angle that counts as "E" (target straight ahead), so
   the locked shot starts in every direction. The flag lives only inside that tick (cleared by our update wrapper every frame). */
let lock=null;
{const T_=window.TLOCK;if(T_&&typeof T_.losTo==='function'){const o=T_.losTo;T_.losTo=function(e){const r=o.apply(this,arguments);
  try{lock=null;if(r&&ok()&&e&&P.weapon&&P.weapon.t==='bow'&&/\btick\b/.test(new Error().stack||''))lock={a:Math.atan2(e.y-P.y,e.x-P.x)};}catch(x){lock=null;}
  return r;};}else B8.err='no TLOCK.losTo';}
{const o=camY;camY=function(){if(pend&&pend.v===undefined){const p=pend;p.v=-p.ang;B8.stats.hacks++;pend=null;B8.next=p;return p.v;}
  if(lock){let inTick=false;try{inTick=/\btick\b/.test(new Error().stack||'');}catch(x){}if(inTick){const v=-lock.a;lock=null;B8.stats.lockHacks++;return v;}}
  return o.apply(this,arguments);};}
/* after p252 accepted the shot: fix its direction for the whole clip */
{const o=basicAttack;basicAttack=function(){const st0=BW.st;const r=o.apply(this,arguments);
  try{const st=BW.st;if(st&&st!==st0&&ok()){const sa=st.ang+yaw(),d=dirOf(sa);st.b8={d};B8.dir=d;const k=ORDER[d];B8.stats.starts[k]=(B8.stats.starts[k]||0)+1;}}catch(e){B8.err='start '+e.message;}
  B8.next=null;return r;};}

/* ---------- release: track the locked target inside the same sector; the arrow starts at this direction's drawn arrow head ---------- */
{const o=update;update=function(dt){
  const st=BW.st,n0=BW.arrows.length,rel0=st&&st.rel;
  try{if(st&&st.b8&&!st.rel&&ok()){const k=Math.floor((clk()-st.t0)/st.dur*N);
    if(k>=REL){const T_=window.TLOCK,e=T_&&T_.e;if(e&&!e.dead&&e.hp>0){const a2=Math.atan2(e.y-P.y,e.x-P.x);if(inSector(a2+yaw(),st.b8.d)&&a2!==st.ang){st.ang=a2;P.face=a2;B8.stats.track++;}}
      st.b8.trk=1;}}}catch(e){B8.err='track '+e.message;}
  let r;try{r=o.apply(this,arguments);}finally{lock=null;}
  try{if(st&&st.b8&&!rel0&&st.rel){const ar=BW.arrows[BW.arrows.length-1];if(ar&&BW.arrows.length>n0||ar&&!ar.b8)tipFix(ar,st.b8.d);
    const k=ORDER[st.b8.d];B8.stats.releases[k]=(B8.stats.releases[k]||0)+1;}}catch(e){B8.err='release '+e.message;}
  return r;};}
function tipFix(ar,d){if(ar.b8)return;const sp=D.spawn[ORDER[d]];ar.b8=d;B8.stats.arrows++;
  const tx=P.x+(sp.tip[0]-AX)*K,ty=P.y+FY+(sp.tip[1]-AY)*K;          // the drawn arrow head on the release frame
  const dx=ar.x-ar.trav*ar.c,dy=ar.y-ar.trav*ar.s;                    // p252 start point (feet)
  const d0=Math.max(0,(tx-dx)*ar.c+(ty+ar.h-dy)*ar.s);                 // forward part of the tip offset (never behind the archer)
  ar.ox=tx-(dx+ar.c*Math.max(ar.trav,d0));ar.oy=ty-(dy+ar.s*Math.max(ar.trav,d0)-ar.h);}   // the rest stays a fixed drawing offset for the whole flight
{const o=drawParts;drawParts=function(){const sh=[];try{for(const ar of BW.arrows)if(ar.b8!=null&&(ar.ox||ar.oy)){ar.x+=ar.ox;ar.y+=ar.oy;sh.push(ar);}}catch(e){}
  try{return o.apply(this,arguments);}finally{for(const ar of sh){ar.x-=ar.ox;ar.y-=ar.oy;}}};}

/* ---------- drawing: body layer, then bow layer, same anchor; uniform scale only ---------- */
function cell(L,d,i){const r=D.layers[L].rects[ORDER[d]][i];return r;}
/* r3 (r34, DeaRz 18 Oct 05:51): the loco / sword / hurt / death art has a 2 px dark-brown outline (#2B201C) baked into its frames; the approved bow shot
   renders have none, so the outline is drawn here in code: one silhouette of body + bow, grown 2 frame px (same px as the loco frames, both drawn x K),
   filled #2B201C, the two layers drawn over it. Built once per frame (canvas), kept in a small cache; the approved images are not changed. */
const OL={c:'#2B201C',w:2,max:120,map:new Map(),built:0};B8.outline=OL;
const OLO=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(dx*dx+dy*dy<=5)OLO.push([dx,dy]);
function olFrame(d,i){const key=d*1000+i;let c=OL.map.get(key);if(c){OL.map.delete(key);OL.map.set(key,c);return c;}
  const rs=[];for(const L of ['body','bow']){const r=cell(L,d,i);if(r)rs.push([L,r]);}if(!rs.length)return null;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [,r] of rs){x0=Math.min(x0,r[4]);y0=Math.min(y0,r[5]);x1=Math.max(x1,r[4]+r[2]);y1=Math.max(y1,r[5]+r[3]);}
  x0=Math.floor(x0)-3;y0=Math.floor(y0)-3;c=document.createElement('canvas');c.width=Math.ceil(x1)+3-x0;c.height=Math.ceil(y1)+3-y0;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  for(const [dx,dy] of OLO)for(const [L,r] of rs)g.drawImage(imgs[L],r[0],r[1],r[2],r[3],r[4]-x0+dx,r[5]-y0+dy,r[2],r[3]);
  g.globalCompositeOperation='source-in';g.fillStyle=OL.c;g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';
  for(const [L,r] of rs)g.drawImage(imgs[L],r[0],r[1],r[2],r[3],r[4]-x0,r[5]-y0,r[2],r[3]);
  c.ox=x0;c.oy=y0;OL.map.set(key,c);OL.built++;if(OL.map.size>OL.max)OL.map.delete(OL.map.keys().next().value);return c;}
function drawFrame(d,i,x,y){let c=null;try{if(OL.on!==false)c=olFrame(d,i);}catch(e){B8.err='outline '+e.message;OL.on=false;}
  if(c){ctx.drawImage(c,x+(c.ox-AX)*K,y+(c.oy-AY)*K,c.width*K,c.height*K);return;}
  for(const L of ['body','bow']){const r=cell(L,d,i);if(!r)continue;
  ctx.drawImage(imgs[L],r[0],r[1],r[2],r[3],x+(r[4]-AX)*K,y+(r[5]-AY)*K,r[2]*K,r[3]*K);}}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  try{const ov=typeof SPR_OVR!=='undefined'&&SPR_OVR.player;
    if(ov&&ov.hero3d&&ok()&&!P.dead){const st=BW.st,now=clk();let d=null,i=null,clip=null;
      if(st&&st.b8){d=st.b8.d;i=1+Math.max(0,Math.min(N-1,Math.floor((now-st.t0)/st.dur*N)));clip='bow_shot';B8.last={d,end:null};}
      else if(B8.last&&BW.lastEnd!=null&&now-BW.lastEnd<3&&!(P.hurtT>0)&&!P.dash&&Math.hypot(P.vx||0,P.vy||0)<=25&&inSector(fa,B8.last.d)){d=B8.last.d;i=D.rest;clip='bow_rest';B8.stats.rest++;}
      if(d!=null){const yy=y+FY;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';drawFrame(d,i,x,yy);ctx.restore();
        H.anchor={x,y:yy};H.dir=d;H.clip=clip;B8.stats.draws++;return;}}}
  catch(e){B8.err='draw '+e.message;}
  return o.apply(this,arguments);};}

/* ---------- TEST chip text ---------- */
setInterval(()=>{try{const c=document.getElementById('bowTestChip');const t='🏹 BOW TEST · ยิงได้ครบ 8 ทิศ · ยืน/เดิน/วิ่ง/โดนตี/ตาย มีครบ 8 ทิศ ธนู+ซองสะพายหลัง';if(c&&c.textContent!==t)c.textContent=t;}catch(e){}},500);
})();

