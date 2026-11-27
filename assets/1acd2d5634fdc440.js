
/* ---- p263 r2: Cave 1 rooms you are not in are hidden under solid rock (DeaRz 18 Oct 11:19 "ตรงนี้ทำให้บังแมพอีกฝั่งได้มั้ยให้มันเหมือนถ้ำจริงๆ";
   brief art/cave1/handoff-code-cave1-r2-occlusion.md). TEST only, on top of p260 r1:
   - ground: re-baked with a solid rock roof (#1a1512..#241c17, faint rock texture, soft dark edge next to the wall tops) wherever there is no floor.
   - rooms: the floor is split into entry hall E, halls A, B, C by walking distance from each hall's core (tools/cave1/r2/regions.py).
     Each room has a mask (half res): 1 on its floor and on the walls whose face looks onto it, fading to 0 between 30 and 130 px
     (walking distance) into the next room, so a passage mouth shows a little of what is beyond.
   - the roof overlay (in the ground canvas, under all sprites) covers the map except the open rooms; a room opens when the hero is within
     ~95 px of it (it is the room you stand in, or the one at the end of the passage you are in) and closes again past ~120 px, fading 0.4 s.
     The ground canvas is redrawn only while a fade runs; a settled frame draws exactly what r1 drew.
   - monsters (and their telegraphs) in the dark are not drawn; their AI and respawns run as before. Stalagmites, rocks, crystals, the arch
     fade with their room. Collision, zones, minimap unchanged. ---- */
(function(){'use strict';
const C1=window.__M4T&&window.__M4T.cave1,R2=window.__C1_R2;if(!C1||!R2||typeof PROP_DEFS==='undefined')return;
const ID=C1.id,D=C1.data,MW=D.W,MH=D.H,KEYS=['E','A','B','C'],FADE=.4,OPEN=.35,CLOSE=.15,HIDE=.3,GS=8;
const S={ok:false,f:{E:0,A:0,B:0,C:0},tg:{E:0,A:0,B:0,C:0},grid:{},gw:Math.ceil(MW/GS),gh:Math.ceil(MH/GS),enter:-1,last:0,rebuilds:0,hidden:0,drawn:0,err:null};C1.r2=S;
const im={};let ov=null,og=null,dirty=true;
function load(k,src){const i=new Image();i.decoding='async';i.onload=()=>{im[k]=i;ready();};i.src=src;}
load('roof',R2.roof);for(const k of KEYS)load(k,R2.masks[k]);
function ready(){if(S.ok||!im.roof||KEYS.some(k=>!im[k]))return;
  try{const c=document.createElement('canvas');c.width=S.gw;c.height=S.gh;const g=c.getContext('2d',{willReadFrequently:true});
    for(const k of KEYS){g.clearRect(0,0,S.gw,S.gh);g.drawImage(im[k],0,0,S.gw,S.gh);const d=g.getImageData(0,0,S.gw,S.gh).data,a=new Uint8Array(S.gw*S.gh);for(let i=0;i<a.length;i++)a[i]=d[i*4+3];S.grid[k]=a;}
    ov=document.createElement('canvas');ov.width=im.roof.width;ov.height=im.roof.height;og=ov.getContext('2d');S.ok=true;dirty=true;}catch(e){S.err=e.message;}}
const at=(k,x,y)=>{const a=S.grid[k];if(!a)return 0;const c=Math.max(0,Math.min(S.gw-1,Math.floor(x/GS))),r=Math.max(0,Math.min(S.gh-1,Math.floor(y/GS)));return a[r*S.gw+c]/255;};
function vis(x,y){if(!S.ok||G.zone!==ID)return 1;let v=0;for(const k of KEYS)if(S.f[k]>0)v=Math.max(v,S.f[k]*at(k,x,y));return v;}
C1.vis=vis;
/* which rooms are open: the hero's own room and any room within ~95 px of the hero (hysteresis so a border never flickers) */
function targets(){if(!P)return;let any=false;for(const k of KEYS){const m=at(k,P.x,P.y);if(m>OPEN||(S.tg[k]&&m>CLOSE)){S.tg[k]=1;any=true;}else S.tg[k]=0;}
  if(!any){let b=null,bv=-1;for(const k of KEYS){const m=at(k,P.x,P.y);if(m>bv){bv=m;b=k;}}if(bv>0)S.tg[b]=1;else for(const k of KEYS)S.tg[k]=S.f[k]>.5?1:0;}}   // off the floor for a moment: keep what is open
function step(){const t=performance.now(),dt=Math.min(.1,(t-S.last)/1000);S.last=t;
  if(C1.stats.enter!==S.enter){S.enter=C1.stats.enter;targets();for(const k of KEYS)S.f[k]=S.tg[k];dirty=true;return;}   // just arrived: no fade
  targets();for(const k of KEYS){const f=S.f[k],g=S.tg[k];if(f!==g){S.f[k]=g>f?Math.min(g,f+dt/FADE):Math.max(g,f-dt/FADE);dirty=true;}}}
function rebuild(){og.globalCompositeOperation='copy';og.globalAlpha=1;og.drawImage(im.roof,0,0);og.globalCompositeOperation='destination-out';
  for(const k of KEYS){const f=S.f[k];if(f<=.001)continue;og.globalAlpha=f;og.drawImage(im[k],0,0,ov.width,ov.height);}
  og.globalCompositeOperation='source-over';og.globalAlpha=1;dirty=false;S.rebuilds++;}
/* the overlay is composited into the map's ground canvas (ground image + roof), so a settled frame costs nothing extra;
   only while a room fades is the ground canvas redrawn */
let BGC=null;
{const o=genBG;genBG=function(zid){const c=o.apply(this,arguments);if(zid===ID){BGC=c;dirty=true;}return c;};}
function liveRoof(c){if(!S.ok||G.zone!==ID||!C1.groundOk||!BGC)return;try{step();if(!dirty)return;const gi=C1.art.ground;if(!gi||!gi.complete)return;rebuild();
  const g=BGC.getContext('2d');g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='copy';g.drawImage(gi,0,0,BGC.width,BGC.height);g.globalCompositeOperation='source-over';
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(ov,0,0,BGC.width,BGC.height);g.restore();S.bgDraws=(S.bgDraws||0)+1;}catch(e){S.err=e.message;}}
PROP_DEFS.c1Roof=Object.assign({},PROP_DEFS.c1Out,{n:'Cave 1 rock roof over the rooms you are not in (r2)',live:liveRoof});
/* rock outside the map: the roof colour, so the map edge does not show */
{const RC=R2.rc,d=PROP_DEFS.c1Out;d.live=function(c){const t=c.getTransform().inverse(),cw=c.canvas.width,ch=c.canvas.height,ps=[[0,0],[cw,0],[0,ch],[cw,ch]].map(([u,v])=>[t.a*u+t.c*v+t.e,t.b*u+t.d*v+t.f]);
  const x0=Math.min(...ps.map(q=>q[0]))-40,x1=Math.max(...ps.map(q=>q[0]))+40,y0=Math.min(...ps.map(q=>q[1]))-40,y1=Math.max(...ps.map(q=>q[1]))+40;
  if(x0>=0&&y0>=0&&x1<=MW&&y1<=MH)return;c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.rect(0,0,MW,MH);c.clip('evenodd');c.fillStyle=RC;c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();};}
/* r2b (art review r2 exception): the east side walls continue whole past the map edge (x 2000..2100) over the roof, fading with rooms B / C */
const EIM={};for(const k of['roof','B','C'])if(R2.east&&R2.east[k]){const i=new Image();i.decoding='async';i.onload=()=>{EIM[k]=i;};i.src=R2.east[k];}
function liveEast(c){if(G.zone!==ID||!EIM.roof)return;const ex=R2.ex||100;c.save();c.imageSmoothingEnabled=true;c.drawImage(EIM.roof,MW,0,ex,MH);
  for(const k of['B','C']){const f=S.ok?S.f[k]:1;if(EIM[k]&&f>.001){c.globalAlpha=f;c.drawImage(EIM[k],MW,0,ex,MH);}}c.restore();}
PROP_DEFS.c1East=Object.assign({},PROP_DEFS.c1Out,{n:'Cave 1 east walls past the map edge (r2b)',live:liveEast});
/* props fade with their room */
for(const t in PROP_DEFS){if(!/^c1(S_|C_|Exit$)/.test(t))continue;const d=PROP_DEFS[t],o=d.live;if(typeof o!=='function')continue;
  d.live=function(c,p){const v=vis(p.x,p.y);if(v<.02)return;if(v>.98)return o.apply(this,arguments);c.save();c.globalAlpha*=v;try{o.apply(this,arguments);}finally{c.restore();}};}
/* the roof goes right after the outside rock, under everything else */
{const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(zid===ID&&Array.isArray(r)&&!r.some(p=>p.t==='c1Roof')){const i=r.findIndex(p=>p.t==='c1Out');
  r.splice(i+1,0,{t:'c1Roof',x:MW/2,y:MH/2,s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1},{t:'c1East',x:MW/2,y:MH/2,s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});}}catch(e){S.err=e.message;}return r;};}
/* monsters in the dark: not drawn (AI untouched) */
{const o=drawEnemy;drawEnemy=function(e){if(G.zone===ID&&S.ok&&e&&vis(e.x,e.y)<HIDE){S.hidden++;return;}S.drawn++;return o.apply(this,arguments);};}
{const o=drawTele;drawTele=function(e){if(G.zone===ID&&S.ok&&e&&vis(e.x,e.y)<HIDE)return;return o.apply(this,arguments);};}
})();

