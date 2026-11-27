
/* ---- r173 skybr3 (TEST ONLY, DeaRz/Art 18-19 Nov 2026 "สะพานใช้ได้ประมาณนี้"): Map 8 sky bridge redraw SB3.
   - bridge picture = sky_r5_2018x2865.png instead of the old 1970x2806 (same scale x1.425, same top-left: the anchor stays at the OLD bottom, so the tower and the summit landing land on the same pixels; only the canvas grew right / down).
   - the deck (level 2) is narrower (about 5 heroes): new deck quad (Art figures, picture-flat space) backL (213,58) frontL (87,119) frontR (1463,1116) backR (1659,986), converted to game world y by y' = BY + (y-BY)/0.866 (see FINDING below); level-2 rail walls (circles r12) follow its two long edges (wall centres = quad edge shifted up 10 px (hero centre is 10 px above the feet) and out by R+RH-INSET, so the feet stay about INSET=12 px inside the edge). The 7 old landing walls (x > 1750) stay; both ends (tower door, summit landing) stay open: the deck runs straight onto the summit floor, no wall line at the joint.
   - the old p300 pieces made from the OLD picture (3 crystal post cut-outs, the front-rail piece) are switched off; the new picture carries its own small posts and rails. Hero on the deck is drawn over the bridge like before (Map 8 rule); hero under the bridge uses D.bot.sky measured again from the NEW picture (lowest painted pixel per 1x column).
   - ground piece m8_skybr_landing_patch.png (235 x 144 world px) at world top-left (1479.2, 1076.4) on the ground layer (under heroes and props, above the base ground): continues the summit path under the deck end.
   Flag ?skybr3=off = old sprite, old deck, no patch. Debug: window.__SKYBR3 ---- */
(function(){'use strict';
const S=window.__SKYBR3={ver:'skybr3-r1',on:!/[?&]skybr3=off\b/.test(String(location.search)),err:null,cfg:{INSET_BACK:12,INSET_FRONT:24,FOOT:10,RH:12.8,STEP:8,R:12,QUAD:{backL:[213,58],frontL:[87,119],frontR:[1463,1116],backR:[1659,986]},PATCH:[1479.2,1076.4,235,144]},built:null};
if(!S.on)return;
try{
const D=window.__M8_DATA,A=window.__M8_ART,IMG=window.__SKYBR3_IMG,PIMG=window.__SKYBR3_PATCH,ID='w23_map8_test';
if(!D||!A||!A.sky||!IMG||typeof PROP_DEFS==='undefined'||!PROP_DEFS.m8B_sky){S.err='missing parts';return}
const S2=1.425,T=.866,KV=S2/T,a=A.sky,BX=D.br.sky[0],BY=D.br.sky[1];
/* 1. picture */
a.src=IMG;a.w2=2018;a.h2=2865;   /* ax2 / ay2 unchanged (985 / 2806 = the old bottom) */
const im=new Image();let imOk=false;im.onload=()=>{imOk=true;try{recomputeBot()}catch(e){S.err='bot '+e.message}};im.src=IMG;
const pim=new Image();let pOk=false;pim.onload=()=>{pOk=true};pim.src=PIMG;
const d=PROP_DEFS.m8B_sky;d.w=a.w2*S2;d.h=a.h2*S2;
function gspace(c,p){const T0=camT(),th=camY();if(T0>.995&&Math.abs(th)<1e-3)return;const s=CAM.persp?1+(w2s(p.x,p.y)[1]/H-.55)*(1-T0)*.5:1;c.translate(p.x,p.y);c.scale(1/s,T0/s);if(th)c.rotate(th);c.translate(-p.x,-p.y);}
d.live=(c,p)=>{if(!imOk)return;c.save();gspace(c,p);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(im,p.x-a.ax2*S2,p.y-a.ay2*KV,a.w2*S2,a.h2*KV);c.restore();if(S.dbg){c.save();gspace(c,p);c.lineWidth=2;c.strokeStyle='rgba(40,200,255,.95)';c.fillStyle='rgba(40,200,255,.18)';for(const q of D.solD){c.beginPath();c.arc(q[0],q[1],q[2],0,6.2832);c.fill();c.stroke()}const Q=S.cfg.QUADW||S.cfg.QUAD;c.strokeStyle='#ff3df0';c.beginPath();c.moveTo(...Q.backL);c.lineTo(...Q.backR);c.lineTo(...Q.frontR);c.lineTo(...Q.frontL);c.closePath();c.stroke();const P2=S.cfg.PATCH;c.strokeStyle='#ffe23d';c.strokeRect(P2[0],P2[1],P2[2],P2[3]);if(typeof P!=='undefined'&&P){c.fillStyle='#ff2020';c.beginPath();c.arc(P.x,P.y,3,0,6.2832);c.fill();c.fillStyle='#ffff20';c.beginPath();c.arc(P.x,P.y+S.cfg.FOOT,3,0,6.2832);c.fill()}c.restore()}};
/* 2. old pieces cut from the old picture: off */
for(const k of ['m8BrFront','m8BrPost_392','m8BrPost_654','m8BrPost_910']){const q=PROP_DEFS[k];if(q)q.live=()=>{};}
/* 3. under-bridge depth rule, measured from the new picture */
function recomputeBot(){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const px=g.getImageData(0,0,c.width,c.height).data,bot=D.bot.sky;let n=0;
 for(let x=0;x<bot.length;x++){const wx=x*D.KX,u=Math.round(a.ax2+(wx-BX)/S2);if(u<0||u>=c.width){bot[x]=-1;continue}let low=-1;for(let v=c.height-1;v>=0;v--)if(px[(v*c.width+u)*4+3]>40){low=v;break}
  if(low<0){bot[x]=-1;continue}bot[x]=(BY+(low-a.ay2)*KV)/D.KY;n++}S.botN=n}
/* 4. level-2 walls along the new quad's two long edges */
/* FINDING: the quad in HANDOFF_SB3 is in the PICTURE's own flat space (picture px x 1.425 both ways, the space of the quoted top-left (-1061.625,-2687.05)); the game's world y is stretched 1/0.866 about the bridge anchor (a prop drawn through gspace shows picture row v at world y = BY+(v-ay2)*S2/T, the same mapping the old p300 walls use via W()). So y_world = BY + (y_art - BY)/T. The landing patch (1479.2,1076.4) is already in world coordinates (it lands exactly at the converted deck end). */
const QA=S.cfg.QUAD,cv=q=>[q[0],BY+(q[1]-BY)/T];const Q={backL:cv(QA.backL),frontL:cv(QA.frontL),frontR:cv(QA.frontR),backR:cv(QA.backR)};S.cfg.QUADW=Q;const R=S.cfg.R,STEP=S.cfg.STEP;   /* the game blocks the hero's CENTRE P (feet = P.y+10) with radius P.r*0.8 = 12.8: wall centres sit on the quad edge shifted up by FOOT and out by R+RH-INSET so the feet stay >= INSET px inside the quad edge (back rail 12 = the Art figure; front rail 24: the near rail is a tall object whose top edge is the quad line, with 12 the boots stand on the rail cap) */
function edge(p0,p1,out,inset){const OFF=R+S.cfg.RH-inset;const dx=p1[0]-p0[0],dy=p1[1]-p0[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=out*uy,ny=-out*ux;const arr=[];for(let t=0;t<=L;t+=STEP)arr.push([p0[0]+ux*t+nx*OFF,p0[1]+uy*t+ny*OFF-S.cfg.FOOT,R]);return arr}
/* SEAL: the deck's tower end (y < 0 in game world) lies outside the map; the hero cannot go north of P.y = 40, so at the map border the near rail's walls are out of his reach and he could slip west past the end of the near rail. A short transverse chain at x = 268 (y 0..84, from the map border to the near rail's chain) closes the deck there: west of it the deck is a sliver beside the map edge (the tower door end itself is beyond the map edge and unreachable, as it was before). */
function seal(){const a=[];for(let y=0;y<=84;y+=S.cfg.STEP)a.push([268,y,R]);return a}
function walls(){/* outward normal: back edge (running left->right) outward = up/right, front edge outward = down/left */return edge(Q.backL,Q.backR,1,S.cfg.INSET_BACK).concat(edge(Q.frontL,Q.frontR,-1,S.cfg.INSET_FRONT)).concat(seal())}
const keep=D.solD.slice(0,7);   /* the 7 old landing walls (x 1758..1794) */
S.rebuild=()=>{const w=walls();D.solD.length=0;for(const q of keep)D.solD.push(q);for(const q of w)D.solD.push(q);S.built={walls:w.length,keep:keep.length};try{const M=window.__M4T&&__M4T.map8;if(M&&M.level===2&&M.setLevel){M.setLevel(1);M.setLevel(2)}}catch(e){}return S.built};
S.rebuild();
/* the lazy level-2 cache (lv2Build) is built at the first setLevel(2), after this point, so it reads the new set */
/* 4b. near (front) rail piece, drawn right AFTER the hero while he is on the deck (hero = in front of the far rail, behind the near rail): a strip along the near rail's cap line + the 7 near posts (crystal + column), cut from the new picture. Line in picture px: v(u)=1969+0.7246*(u-806) (= world frontL..frontR); strip = 16 px above .. 12 px below the line (rail cap + gold trim only, no deck floor). Post centres (crystal blobs measured on the picture): u 1162,1338,1502,1672,1777 (+ 990 and 816 extrapolated at the same spacing), crystal centre v = line - 12. */
const NEAR={U0:780,V0:1880,W:1050,H:840,posts:[816,990,1162,1338,1502,1672,1777],up:16,down:12};
const vline=u=>1969+0.7246*(u-806);
let nearC=null;
function nearCanvas(){if(nearC||!imOk)return nearC;const c=document.createElement('canvas');c.width=NEAR.W;c.height=NEAR.H;const g=c.getContext('2d');g.beginPath();
 const us=[];for(let u=800;u<=1790;u+=15)us.push(u);us.push(1790);
 us.forEach((u,i)=>{const x=u-NEAR.U0,y=vline(u)-NEAR.up-NEAR.V0;i?g.lineTo(x,y):g.moveTo(x,y)});for(let i=us.length-1;i>=0;i--){const u=us[i];g.lineTo(u-NEAR.U0,vline(u)+NEAR.down-NEAR.V0)}g.closePath();
 for(const pu of NEAR.posts){const cx=pu-NEAR.U0,cy=vline(pu)-12-NEAR.V0;const P1=[[0,-46],[15,-26],[16,6],[0,16],[-16,6],[-15,-26]];P1.forEach(([x,y],i)=>i?g.lineTo(cx+x,cy+y):g.moveTo(cx+x,cy+y));g.closePath();g.moveTo(cx-21,cy+6);g.lineTo(cx+21,cy+6);g.lineTo(cx+21,cy+58);g.lineTo(cx-21,cy+58);g.closePath()}
 g.clip('nonzero');g.drawImage(im,NEAR.U0,NEAR.V0,NEAR.W,NEAR.H,0,0,NEAR.W,NEAR.H);nearC=c;return c}
PROP_DEFS.m8SkyNear=Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},{n:'Map 8 sky bridge near rail (over the hero on the deck)',w:a.w2*S2,h:a.h2*S2,ax:a.ax2*S2,ay:a.ay2*S2,
 live:(c,p)=>{const m=window.__M4T&&__M4T.map8;if(!m||m.level!==2||G.zone!==ID)return;const k=nearCanvas();if(!k)return;c.save();gspace(c,p);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(k,p.x+(NEAR.U0-a.ax2)*S2,p.y+(NEAR.V0-a.ay2)*KV,NEAR.W*S2,NEAR.H*KV);c.restore()}});
S.near=NEAR;
{const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(zid===ID&&Array.isArray(r)&&!r.some(q=>q&&q.t==='m8SkyNear'))r.push({t:'m8SkyNear',x:BX,y:BY,s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1,m8front:1});}catch(_){}return r}}/* 5. ground patch */
{const dd=PROP_DEFS.m8Dbg;const MW=D.W,MH=D.H;PROP_DEFS.m8SkyPatch=Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},{n:'Map 8 sky bridge landing patch (ground)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:(c,p)=>{if(!pOk)return;const P=S.cfg.PATCH;c.drawImage(pim,P[0],P[1],P[2],P[3])}});
 const o=loadPropsFor;loadPropsFor=function(zid){const r=o.apply(this,arguments);try{if(zid===ID&&Array.isArray(r)&&!r.some(q=>q&&q.t==='m8SkyPatch'))r.push({t:'m8SkyPatch',x:MW/2,y:MH/2,s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1});}catch(_){}return r}}
}catch(e){S.err=e.message}
})();

