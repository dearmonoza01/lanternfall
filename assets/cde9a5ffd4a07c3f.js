
/* ---- r153 houseroom (TEST ONLY, DeaRz 17-18 Nov 2026 via coordinator): the cottage becomes an enterable house.
   One smallCottage only (second placement refused, old saves keep the first and return the rest to storage). A door warp (oval doormat, no glow) sits at the cottage's warp_point and follows the house every frame; F / tap within ~40 px enters (never automatic, not in build mode). Inside = small room (floor 520 x 300, back wall 110 tall, wall border, door gap with exit mat) drawn by code in the SAME zone as the platform (mode flag HOUSE.roomOn): no clouds, no lanterns, no time-of-day tint, same safe-zone rules. Exit returns to the cottage's CURRENT warp (fallback platform centre). Room decor: build mode with the same storage, saved in S.room={v:1,floor,items[],in}. Art swap: HOUSE.setRoomArt({src,ax,ay,scale,floor:[[x,y]..],door:[x,y]}), HOUSE.setMat(src). Flag ?houseroom=off = nothing (no one-house rule either). HOUSE.cfg.room.build=false disables decorating the room. Debug: HOUSE.room ---- */
(function(){'use strict';
const H=window.HOUSE;if(!H||!H.on||!H.build)return;
const R=H.room={on:!/[?&]houseroom=off\b/.test(String(location.search)),ver:'houseroom-r2d',err:null,stats:{enter:0,exit:0,fix:0,drawMs:0,frames:0}};
if(!R.on)return;
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[HOUSEROOM]',w,e)}catch(_){}};
H.cfg.room={build:true,floorW:520,floorH:300,wallH:110,promptR:40,doorGap:100};
const ZID=H.ZID,FOOT=10,IT=H.items,B=H.build;
H.roomOn=false;
const ROOM_NO=['smallCottage','farmPlot','treePlot','youngTree','woodenFence','fenceGate'];
const S0=()=>H.state();
/* ---- data: door / warp points of the cottage (decor_r1 PNG px). Art can override via __HOUSE_DECOR.items.smallCottage.door_point_png / warp_point_png ---- */
try{const a=window.__HOUSE_DECOR&&__HOUSE_DECOR.items&&__HOUSE_DECOR.items.smallCottage||{};const d=IT.smallCottage;if(d){d.doorPt=a.door_point_png||d.doorPt||[140,199];d.warpPt=a.warp_point_png||d.warpPt||[146,210]}}catch(e){ERR('data',e)}
function ensureRoom(){const S=S0();let r=S.room;if(!r||typeof r!=='object'||r.v!==1){r=S.room={v:1,floor:'wood',items:[],in:false}}if(!Array.isArray(r.items))r.items=[];if(r.in==null)r.in=false;return r}
let vc=null;H.roomView=()=>{const S=S0(),r=ensureRoom();if(!vc||vc.S!==S||vc.items!==r.items){const v=Object.create(S);Object.defineProperty(v,'placed',{get(){return r.items},set(a){r.items=a},enumerable:true});vc={S,items:r.items,v}}return vc.v};
/* ---- room geometry (world px, centred on the platform zone centre) ---- */
let ART=null;
const C=()=>{const g=H.geom();return {x:g.ZW/2,y:g.ZH/2}};
function rect(){const c=C(),w=H.cfg.room.floorW,h=H.cfg.room.floorH;return {x0:c.x-w/2,y0:c.y-h/2,x1:c.x+w/2,y1:c.y+h/2}}
function inPoly(x,y,Q){let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function floorPoly(){if(ART&&ART.floor){const c=C(),k=ART.scale||1;return ART.floor.map(p=>[c.x+(p[0]-ART.ax)*k,c.y+(p[1]-ART.ay)*k])}return null}
function inFloor(x,y,m){const P=floorPoly();if(P)return inPoly(x,y,P);const r=rect();return x>=r.x0+m&&x<=r.x1-m&&y>=r.y0+m&&y<=r.y1-m}
function inStrip(x,y){if(!(ART&&ART.strip))return false;const c=C(),k=ART.scale||1,S=ART.strip;return x>=c.x+(S[0]-ART.ax)*k&&x<=c.x+(S[2]-ART.ax)*k&&y>=c.y+(S[1]-ART.ay)*k&&y<=c.y+(S[3]-ART.ay)*k}
H.roomFloorOk=(x,y)=>inFloor(x,y,3)&&!inStrip(x,y);
H.roomSpawnPos=()=>{if(ART&&ART.spawn){const c=C(),k=ART.scale||1;return {x:c.x+(ART.spawn[0]-ART.ax)*k,y:c.y+(ART.spawn[1]-ART.ay)*k}}const d=H.roomDoorPos();return {x:d.x,y:d.y-34}};
H.roomArtOn=()=>!!(ART&&ART.img&&ART.img.complete&&ART.img.naturalWidth);
H.roomDoorPos=()=>{if(ART&&ART.door){const c=C(),k=ART.scale||1;return {x:c.x+(ART.door[0]-ART.ax)*k,y:c.y+(ART.door[1]-ART.ay)*k}}const r=rect();return {x:(r.x0+r.x1)/2,y:r.y1-24}};
{const _w=H.walkable;H.walkable=function(x,y){if(H.roomOn)return inFloor(x,y,-30);return _w.apply(this,arguments)}}
{const o=updPlayer;updPlayer=function(){if(!H.roomOn||G.zone!==ZID||!P)return o.apply(this,arguments);const x0=P.x,y0=P.y;const r=o.apply(this,arguments);try{const ok=(x,y)=>inFloor(x,y+FOOT,7);if(!ok(P.x,P.y)){if(ok(P.x,y0))P.y=y0;else if(ok(x0,P.y))P.x=x0;else{P.x=x0;P.y=y0}}}catch(e){ERR('room slide',e)}return r}}
/* ---- rules ---- */
H.roomRules=(id,ignoreUid)=>{if(H.roomOn){if(!H.cfg.room.build)return 'ตกแต่งห้องยังปิดอยู่';const d=IT[id];if(ROOM_NO.includes(id)||(d&&(d.farm||d.tree)))return 'วางในบ้านไม่ได้';return ''}if(id==='smallCottage'&&S0().placed.some(o=>o.id==='smallCottage'&&o.uid!==ignoreUid))return 'มีบ้านได้หลังเดียว';return ''};
function enforceOne(){try{const S=S0(),cs=S.placed.filter(o=>o.id==='smallCottage');if(cs.length<=1)return 0;const keep=cs[0];S.placed=S.placed.filter(o=>o===keep||o.id!=='smallCottage');if(!S.storage)S.storage={};S.storage.smallCottage=(S.storage.smallCottage|0)+cs.length-1;H.save();if(!H.roomOn)B.syncDec();R.stats.fix+=cs.length-1;try{toast('มีบ้านได้หลังเดียว · เก็บบ้านที่เกินคืนคลัง','#ffe9b0')}catch(_){}return cs.length-1}catch(e){ERR('one',e);return 0}}
H.enforceOneHouse=enforceOne;
{const _s=H.sanitize;H.sanitize=function(){const r=_s.apply(this,arguments);enforceOne();const rm=ensureRoom();try{for(const o of rm.items)B.fixFacing(o)}catch(_){}return r}}
/* ---- cottage + warp ---- */
const cottage=()=>S0().placed.find(o=>o.id==='smallCottage')||null;
const LPT=(o,k)=>{const d=IT.smallCottage,F=d.fac&&d.fac[o.f|0];return (F&&F[k])||d[k]};function ptWorld(o,pt){const d=IT.smallCottage,F=(d.fac&&d.fac[o.f|0])?d.fac[o.f|0]:((o.f&&d.footB)?d.footB:d);return {x:o.x-F.ax+pt[0],y:o.y-F.ay+pt[1]}}
H.houseWarp=()=>{const o=cottage();return o?ptWorld(o,LPT(o,'warpPt')):null};
H.houseDoor=()=>{const o=cottage();return o?ptWorld(o,LPT(o,'doorPt')):null};
/* ---- doormat (image slot: H.setMat(src); default = small plain code oval, no glow) ---- */
let MAT=null;H.matScale=1;H.setMat=s=>{if(!s){MAT=null;return}if(typeof s==='string'){const i=new Image();i.src=s;MAT=i}else MAT=s};
function mat(c,x,y){if(MAT&&MAT.complete&&MAT.naturalWidth){const w=MAT.naturalWidth*H.matScale,h=MAT.naturalHeight*H.matScale;c.drawImage(MAT,x-w/2,y-h/2,w,h);return}}
H.roomWarpDraw=function(c){try{if(H.roomOn){}else{const w=H.houseWarp();if(w)mat(c,w.x,w.y)}}catch(e){ERR('warp draw',e)}};
/* ---- room picture (code placeholder; Art swap = HOUSE.setRoomArt) ---- */
H.setRoomArt=o=>{if(!o||!o.src){ART=null;return}const i=new Image();i.src=o.src;ART={img:i,ax:o.ax||0,ay:o.ay||0,scale:o.scale||1,floor:o.floor||null,door:o.door||null,spawn:o.spawn||null,strip:o.strip||null}};

H.roomDraw=function(c){const t0=performance.now();try{const g=H.geom(),r=rect(),WH=H.cfg.room.wallH;c.save();c.fillStyle='#100b0e';c.fillRect(-4000,-4000,g.ZW+8000,g.ZH+8000);
 if(ART&&ART.img&&ART.img.complete&&ART.img.naturalWidth){const k=ART.scale||1,cc=C();c.drawImage(ART.img,cc.x-ART.ax*k,cc.y-ART.ay*k,ART.img.naturalWidth*k,ART.img.naturalHeight*k)}
 else{}
 c.restore();R.stats.drawMs=R.stats.drawMs*.95+(performance.now()-t0)*.05;R.stats.frames++}catch(e){ERR('roomDraw',e)}};
/* ---- enter / exit ---- */
let exitSave=null,hidTint=false;
function setExitFar(on){try{const E=H.exitPos();if(!E)return;if(on){if(!exitSave)exitSave={x:E.x,y:E.y};E.x=-9999;E.y=-9999}else if(exitSave){E.x=exitSave.x;E.y=exitSave.y;exitSave=null}}catch(_){}}
function snapCam(){try{cam.x=P.x-VW/2;cam.y=P.y-VH/2;clampCam()}catch(_){}}
function canEnter(){return !H.roomOn&&G.zone===ZID&&G.state==='play'&&!P.dead&&!H.busy&&!B.on&&!!cottage()}
H.enterRoom=function(force){if(!force&&!canEnter())return false;try{ensureRoom().in=true;H.roomOn=true;setExitFar(true);const d=H.roomSpawnPos();P.x=d.x;P.y=d.y-FOOT;P.vx=P.vy=0;B.syncDec();H.save();snapCam();R.stats.enter++;try{log('เข้าบ้าน','g')}catch(_){}return true}catch(e){ERR('enter',e);H.roomOn=false;return false}};
H.exitRoom=function(fallback){if(!H.roomOn)return false;try{H.roomOn=false;ensureRoom().in=false;setExitFar(false);const o=cottage(),w=o?ptWorld(o,LPT(o,'warpPt')):null;if(w){P.x=w.x;P.y=w.y-FOOT}else{const E=H.exitPos();P.x=E.x;P.y=E.y-70}P.vx=P.vy=0;B.syncDec();try{B.resolveHero()}catch(_){}H.save();snapCam();R.stats.exit++;try{log(fallback?'ไม่มีบ้านบนลาน · กลับมาที่ลาน':'ออกจากบ้าน','g')}catch(_){}return true}catch(e){ERR('exit',e);return false}};
{const _l=loadZone;loadZone=function(zid){const r=_l.apply(this,arguments);try{if(H.roomOn){H.roomOn=false;setExitFar(false);if(zid!==ZID){try{ensureRoom().in=false}catch(_){}}}}catch(e){ERR('loadZone',e)}return r}}
/* indoors: no firefly/mote ambience (the game's updAmbient particles), no night-light layer */
try{const _ua=updAmbient;updAmbient=function(){if(H.roomOn){try{amb.length=0}catch(_){}return}return _ua.apply(this,arguments)}}catch(e){ERR('amb',e)}
/* ---- prompt ---- */
const css=document.createElement('style');css.textContent='#houseRoomPrompt{position:fixed;left:50%;bottom:calc(205px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:7;display:none;padding:8px 18px;border-radius:999px;background:rgba(20,15,8,.9);border:1px solid #ffd98a;color:#fff;font-size:13px;cursor:pointer;box-shadow:0 0 18px rgba(255,200,100,.45);white-space:nowrap}#houseRoomPrompt kbd{display:inline-block;min-width:20px;padding:0 6px;margin-right:6px;border-radius:6px;background:#ffd98a;color:#1a0e00;font-weight:700;text-align:center}@media (max-height:520px){#houseRoomPrompt{bottom:calc(130px + env(safe-area-inset-bottom,0px));font-size:12px;padding:6px 12px}}';document.head.appendChild(css);
const pr=document.createElement('div');pr.id='houseRoomPrompt';document.body.appendChild(pr);
let want=null;
function act(){if(want==='in')H.enterRoom();else if(want==='out'){if(!B.on)H.exitRoom()}}
pr.addEventListener('click',e=>{e.stopPropagation();act()});for(const ev of ['pointerdown','mousedown','touchstart'])pr.addEventListener(ev,e=>e.stopPropagation());
const keyH=e=>{if((e.key==='f'||e.key==='F')&&!e.repeat&&want&&!G.win&&!G.interact){act();e.stopImmediatePropagation();e.preventDefault();return true}return false};
if(window.__EK)window.__EK.unshift?window.__EK.unshift(keyH):window.__EK.push(keyH);else addEventListener('keydown',e=>{keyH(e)},true);
const nearD=(w)=>w&&Math.hypot(w.x-P.x,(w.y-(P.y+FOOT))*1.4)<H.cfg.room.promptR;
/* ---- per-frame tick ---- */
let started=false,fr=0,hideRw=false;
function wrapDefs(){try{for(const k of ['houseexit','houselantern']){const d=PROP_DEFS[k];if(d&&typeof d.live==='function'&&!d.__rw){const ol=d.live;d.__rw=1;d.live=function(){if(H.roomOn||(k==='houseexit'&&H.housePill))return;return ol.apply(this,arguments)}}}}catch(_){}}
function tick(){fr++;if(G.state!=='play'||!P){pr.style.display='none';return}
 if(!started){started=true;try{const r=ensureRoom();if(r.in){if(cottage()&&S0().lantern){setTimeout(()=>{try{if(G.zone!==ZID)H.enterDirect();setTimeout(()=>{if(cottage())H.enterRoom(true);else{ensureRoom().in=false}},700)}catch(e){ERR('resume',e)}},900)}else r.in=false}}catch(e){ERR('start',e)}}
 if(fr%30===0){enforceOne();wrapDefs()}
 if(G.zone!==ZID){pr.style.display='none';want=null;return}
 if(H.roomOn&&!cottage()){H.exitRoom(true);try{toast('บ้านถูกเก็บแล้ว · ออกมาที่ลาน','#ffe9b0')}catch(_){}}
 if(H.roomOn){const dn=document.getElementById('houseDown');if(dn)dn.style.display='none';const t=document.getElementById('gtTint');if(t&&t.style.display!=='none'){t.style.display='none';hidTint=true}}
 else if(hidTint){const t=document.getElementById('gtTint');if(t)t.style.display='';hidTint=false}
 let w=null;if(!B.on&&!P.dead&&!H.busy&&!G.win){if(H.roomOn){const d=H.roomDoorPos();if(nearD(d))w='out'}else if(cottage()&&nearD(H.houseWarp()))w='in'}
 want=w;H.housePill=(w==='in');if(H.roomOn){try{amb.length=0;const nl=document.getElementById('nlLayer');if(nl)nl.style.display='none'}catch(_){}}if(w){const t=w==='in'?'<kbd>F</kbd>เข้าบ้าน':'<kbd>F</kbd>ออกจากบ้าน';if(pr.dataset.t!==t){pr.innerHTML=t;pr.dataset.t=t}pr.style.display='block'}else pr.style.display='none'}
{const _up=update;update=function(dt){const r=_up.apply(this,arguments);try{tick()}catch(e){ERR('tick',e)}return r}}
setTimeout(()=>{try{enforceOne();ensureRoom()}catch(_){}},1000);
})();


