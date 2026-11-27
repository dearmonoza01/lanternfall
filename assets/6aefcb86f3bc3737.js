
/* ---- p266 r2 = r1c + the south waterfall framed like Map 4's falls and the south cliff closed with end caps (art/map5/handoff-code-map5-r2-waterfall.md). r1c = r1b + the north arch is the way into Map 6 (p267; brief art/map6/handoff-code-map6-r1.md section 2): rubble removed, the doorway opened, walking into it
   fades over to Map 6's arrival plaza (only when p267 is installed); Map 6's south arch brings the hero back just south of this arch (M5.enter). ----
   p266 r1b = r1 + north gate on visible snow: mountains + mist 200 px higher, 3 snowy pines each side of the arch (art review art/map5/review-ingame-r1.md, 18 Oct 16:50) ----
   p266 r1: Map 5 TEST map "หมู่บ้านต้นธาร" (DeaRz 18 Oct 13:09 "เริ่มได้เลย"; brief art/map5/handoff-code-map5-r1.md, layout v16 = art/map5/draw_map5_layout.py,
   depth spec map5-depth-spec.md, population balance/approved/BALANCE_map5_population_v3.md). A TEST sub-map of the Map 4 TEST session (p254 r41 hooks: M4.sub,
   M4.load, M4.r28.pause/resume, M4.goMap5, M4.port), like Cave 1 (p260):
   - entered by walking into the Map 4 portal swirl (fade), arriving just south of the Map 5 portal ring; stepping onto the ring's centre goes back to Map 4,
     just south of its portal. The save stays untouched the whole time (Map 4's snapshot + storage hold cover this map too); the TEST button still leaves both.
   - ground: one image baked from the approved art (tools/map5_r1, Python, 0.8 px per world px): Map 4 grass tiles + decals, gravel paths + plaza, snow tile +
     patches blending into the grass, a cool lighter veil toward the top, pool + stream in Map 4's water colours, contact + cast shadows toward the lower right,
     and the upright pieces at their camera height (cliff faces, both stair flights, the portal platform, both bridge decks, the waterfall lip).
   - live sprites (y-sorted): tall + snowy pines (canopy turns see-through with the hero behind), 4 house ruins (Map 4 low walls + D1 extras), north gate arch +
     rubble (closed), portal pillars, snowy rocks, Map 4 rocks / bushes / reeds, Map 2 grass (sway), bridge front rails.
   - code-drawn: 2-layer mountain backdrop with parallax (far 0.6, near 0.75) over a sky gradient, mist (seam band, side edges, 2 slow drifting layers),
     portal swirl + glow, waterfall strip, stream ripples, pool rings. Camera zoom 0.7 while here (restored on leaving).
   - collision: map edges, cliff faces (stairs open), stair sides, pool + stream (bridges open, rails at the deck edges), every tree base, ruins, gate, pillars,
     rocks. Grass, frosted grass, bushes, reeds, snow patches: walk-through.
   - monsters (21): zone 2 Stone Boar x7 Lv18-20, zone 3 Elder Ruin Warden x4 Lv20-22 (respawn x1.5), zone 4 Moss Turtle x3 + Stone Boar x3 Lv21-23,
     zone 7 Gale Feather x4 Lv22-24. Member 50-80 s, whole zone 90-120 s; never within 200 px of the plaza, never within 360 px of the hero, >= 60 px from
     stairs / bridge heads / gate; a chase ends when the hero enters the plaza or leaves the zone (Map 4 r28 reset / walk home). No boss (no art yet). ---- */
(function(){'use strict';
const M4=window.__M4T,A=window.__M5_ART,D=window.__M5_DATA,A4=window.__M4T_ART;if(!M4||!M4.sub||!M4.load||!A||!D||!A4||typeof ZONES==='undefined')return;
const ID='w22_map5_test',MW=D.W,MH=D.H,GK=D.GK,T=.866;
M4.sub.add(ID);
const M5={on:false,stats:{enter:0,exit:0,saveBlocked:0,ring:0,atmos:0,galeScope:0},art:{},id:ID,data:D};M4.map5=M5;
const img=k=>{const a=A[k];if(!a)return null;if(!M5.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M5.art[k]=i;}const i=M5.art[k];return i.complete&&i.naturalWidth?i:null;};
const img4=k=>{const a=A4[k];if(!a)return null;if(!M4.art[k]){const i=new Image();i.decoding='async';i.src=a.src;M4.art[k]=i;}const i=M4.art[k];return i.complete&&i.naturalWidth?i:null;};
function preload(){for(const k in A)img(k);for(const k of['g-dark','b3-portal-swirl','waterfall-strip-A-wide','ring-thin','ring-foam-thick','rock-tilted-crack','rock-pair','cliff-side-A','cliff-side-B'])img4(k);}   // decoded on the first trip (not at page load)
const G4=D.g4,onF=(x,y)=>{const R=D.walk[Math.floor(y/G4)];if(!R||x<0)return false;const c=Math.floor(x/G4);for(let i=0;i<R.length;i+=2)if(c>=R[i]&&c<R[i+1])return true;return false;};
const now=()=>(typeof time==='number'?time:0);
/* ---------- zone ---------- */
ZONES[ID]={n:'Map 5 (TEST)',th:'หมู่บ้านต้นธาร · แมพทดสอบ',sub:'Map 5 · TEST · ไม่บันทึกเซฟ',safe:0,fullSafe:0,w:MW,h:MH,seed:4505,ground:['#66a037','#4f8a2c','#78b046','#3a6a24'],acc:'#cfe8ff',amb:'mote',mobs:[],density:0,areas:[],m4test:1};
try{if(typeof EDGE_THEME!=='undefined')EDGE_THEME[ID]=[];}catch(e){}
/* ---------- helpers ---------- */
function view(c){const t=c.getTransform().inverse(),cw=c.canvas.width,ch=c.canvas.height,ps=[[0,0],[cw,0],[0,ch],[cw,ch]].map(([u,v])=>[t.a*u+t.c*v+t.e,t.b*u+t.d*v+t.f]);
  return {x0:Math.min(...ps.map(q=>q[0])),x1:Math.max(...ps.map(q=>q[0])),y0:Math.min(...ps.map(q=>q[1])),y1:Math.max(...ps.map(q=>q[1]))};}   // visible world rect (ground layer = world coordinates)
const foot=k=>{const f=D.foot[k];if(A[k])return [A[k].fx,A[k].fy];if(f)return f;const a=A4[k];return [a.gw/2,a.gh-3];};
const behindOf=(p,cx,gw,hT)=>!!P&&Math.abs(P.x-cx)<gw*.42&&P.y<p.y-6&&P.y>p.y-hT*.95;
/* ---------- props ---------- */
const P_=(o)=>Object.assign({cat:'m4test',w:2,h:2,ax:1,ay:1,liveOnly:1,nofade:1,draw(){}},o);
// pines: canopy fades to 45 % while the hero stands behind it, the trunk stays solid (Map 4 liveTree rule); one uniform scale, never flipped
function tree(c,p,k){const a=A[k],im=img(k);if(!im)return;const hT=a.gh/T,cx=p.x-a.fx+a.gw/2,b=behindOf(p,cx,a.gw,hT);
  p.m5al=(p.m5al==null?1:p.m5al)+((b?.45:1)-(p.m5al==null?1:p.m5al))*.15;
  const x0=p.x-a.fx,y0=p.y-a.fy,cut=a.gh*.78,nw=im.naturalWidth,nh=im.naturalHeight;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.globalAlpha*=p.m5al;c.drawImage(im,0,0,nw,nh*cut/a.gh,x0,y0,a.gw,cut);c.globalAlpha=1;c.drawImage(im,0,nh*cut/a.gh,nw,nh*(1-cut/a.gh),x0,y0+cut,a.gw,a.gh-cut);c.restore();}
// still pieces (ruins, gate, pillars, snowy rocks, frosted grass): drawn at the foot point; pieces taller than 90 px turn see-through (55 %) with the hero behind
function still(c,p,k){const m4=!A[k],a=m4?A4[k]:A[k],im=m4?img4(k):img(k);if(!im)return;const [fx,fy]=foot(k);let al=1;
  if(a.gh>90){const b=behindOf(p,p.x-fx+a.gw/2,a.gw*1.1,a.gh/T);p.m5al=(p.m5al==null?1:p.m5al)+((b?.55:1)-(p.m5al==null?1:p.m5al))*.15;al=p.m5al;}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(al<1)c.globalAlpha*=al;c.drawImage(im,p.x-fx,p.y-fy,a.gw,a.gh);c.restore();}
/* outside the map: Map 4's dark forest tiles (left / right / bottom); the sky + mountains cover the top */
let OUTPAT=null;
function liveOutside(c){const im=img4('g-dark');if(!im)return;if(!OUTPAT)OUTPAT=c.createPattern(im,'repeat');const v=view(c),x0=v.x0-40,x1=v.x1+40,y0=v.y0-40,y1=v.y1+40;
  if(x0>=0&&y0>=0&&x1<=MW&&y1<=MH)return;c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.rect(0,0,MW,MH);c.clip('evenodd');c.fillStyle=OUTPAT;c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();}
/* sky + 2 mountain layers (a3, both tile left-right), world-anchored with parallax: far 0.6, near 0.75 sideways, a little downward drift as the camera goes south */
const MTN=[['mtn_far',D.mtn.far,.6],['mtn_near',D.mtn.near,.75]];
function liveSky(c){const v=view(c);if(v.y0>D.mtn.near+20)return;const cx=(v.x0+v.x1)/2,cy=(v.y0+v.y1)/2,dy=Math.max(0,Math.min(40,(cy-500)*.06));
  const yb=D.mtn.far+dy-40,g=c.createLinearGradient(0,Math.min(v.y0,-300),0,yb);g.addColorStop(0,'#86b4dc');g.addColorStop(.7,'#c4dcee');g.addColorStop(1,'#e2edf4');
  c.save();c.fillStyle=g;c.fillRect(v.x0-10,Math.min(v.y0,-300)-10,v.x1-v.x0+20,yb-Math.min(v.y0,-300)+10);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  for(const [k,base,par] of MTN){const a=A[k],im=img(k);if(!im)continue;const w=a.gw,h=a.gh/T,off=cx*(1-par),y=base+dy*(k==='mtn_far'?.5:1)-h;
    for(let x=off+Math.floor((v.x0-off)/w)*w;x<v.x1;x+=w)c.drawImage(im,Math.floor(x),y,Math.ceil(w)+1,h);}
  {const yb=D.mtn.near+dy,g2=c.createLinearGradient(0,yb-70,0,yb+6);g2.addColorStop(0,'rgba(209,219,233,0)');g2.addColorStop(.75,'rgba(209,219,233,.85)');g2.addColorStop(1,'rgba(209,219,233,1)');
    c.fillStyle=g2;c.fillRect(v.x0-10,yb-70,v.x1-v.x0+20,76);}   // the near range's straight foot fades into the snow (same colour as the baked snow there)
  c.restore();}
/* portal ring: rotating swirl inside the ring's inner stone disc (41 x 22 px on screen, flat on the platform) + a breathing blue glow over the rune band */
function liveSwirl(c){const [x,y]=D.ring,t=now(),k=.5+.5*Math.sin(t*Math.PI*2/3.6),im=img4('b3-portal-swirl'),ry=22/T;
  c.save();c.translate(x,y);c.scale(1,ry/41);
  c.save();c.beginPath();c.arc(0,0,41,0,6.2832);c.clip();if(im){c.rotate(t*.35);c.imageSmoothingEnabled=true;c.globalAlpha*=.92;c.drawImage(im,-46,-46,92,92);}c.restore();
  c.globalCompositeOperation='lighter';let g=c.createRadialGradient(0,0,20,0,0,70);g.addColorStop(0,`rgba(120,210,255,${.22+.10*k})`);g.addColorStop(.6,`rgba(70,160,255,${.10+.06*k})`);g.addColorStop(1,'rgba(50,130,255,0)');
  c.fillStyle=g;c.beginPath();c.arc(0,0,70,0,6.2832);c.fill();c.restore();}
/* r2 waterfall (handoff-code-map5-r2-waterfall.md, DeaRz 18 Oct 20:19 "แก้2ข้อ น้ำตก กับ ขอบหินที่ขาด"): built like Map 4's approved falls (p254 r14-r19):
   no lip (Map 4 r14: DeaRz said lip + strip read as stacked pasted pictures); Map 4's wide strip cropped of its 10 px brown side edges, uniform scale
   to the channel + 14 px under each bank, starting 2 px above the cliff grass with a 6 px top fade, tiles crossfading over 24 px, scrolling down and
   running off the south map edge (no visible end, no foot foam: the foot is never on screen); 2 crest rocks tucked under the banks with foam in the gap
   and a ripple upstream of each; the channel banks cliff-side-A / -B (approved Map 4 pieces, gw x gh like Map 4) over the strip's sides.
   The cliff runs end in cliff-h-endcap-right / cliff-h-endcap-left-B tucked 20 px behind the banks (baked into the ground, r2 bake). */
const XF=24,TOPF=6,FC={cv:null};let TF=null;
function tileFaded(im,a){if(TF)return TF;const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const g=cv.getContext('2d');g.drawImage(im,0,0);
  const gr=g.createLinearGradient(0,0,0,cv.height);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(XF/a.gh,'#000');gr.addColorStop(1,'#000');g.globalCompositeOperation='destination-in';g.fillStyle=gr;g.fillRect(0,0,cv.width,cv.height);return TF=cv;}
const CREST=[['rock-tilted-crack',.82,-2,20],['rock-pair',.78,6,20]];   // [key, uniform scale, base dy from the crest line, px tucked under the bank]
function crest(){const F=D.fall,vl=F.l+14,vr=F.r-14;return CREST.map(([k,sc,dy,t],i)=>{const a=A4[k],w=a.gw*sc;return {k,sc,dy,w,h:a.gh*sc,x:i?vr+t-w/2:vl-t+w/2};});}
function drawRock(c,q,by){const im=img4(q.k),a=A4[q.k];if(!im)return;c.drawImage(im,q.x-q.w/2,by-(a.gh-3)*q.sc,q.w,q.h);}
function ringAt5(c,k,x,y,ph,s){const im=img4(k),a=A4[k];if(!im)return;const q=((now()/2.6)+ph)%1,ss=s*(.7+q*.5);c.save();c.globalAlpha*=.75*(1-q)*Math.min(1,q*5);c.drawImage(im,x-a.gw*ss/2,y-a.gh*ss/2,a.gw*ss,a.gh*ss);c.restore();}
function liveFall(c){const F=D.fall,k_='waterfall-strip-A-wide',im=img4(k_),s_=A4[k_];if(!im)return;const tf=tileFaded(im,s_),t=now();
  const SC=10,sr=im.naturalWidth/s_.gw,w=F.r-F.l+28,k=w/(s_.gw-2*SC),gtop=F.top,top=gtop-2,th=s_.gh*k,xf=XF*k,step=th-xf,off=(t*42)%step,cx=F.x;
  const v=view(c),bot=Math.min(MH+80,v.y1+20),hh=bot-top;
  if(hh>0){const K=2;let cv=FC.cv;if(!cv||cv.width!==Math.ceil(w*K)||cv.height!==Math.ceil(hh*K)){cv=FC.cv=document.createElement('canvas');cv.width=Math.ceil(w*K);cv.height=Math.ceil(hh*K);}
    const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,cv.width,cv.height);g.setTransform(K,0,0,K,0,0);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    const y0=-step+off-step,sx=SC*sr,sw=im.naturalWidth-2*SC*sr,sh=im.naturalHeight;g.drawImage(im,sx,0,sw,sh,0,y0,w,th);for(let y=y0+step;y<hh;y+=step)g.drawImage(tf,sx,0,sw,sh,0,y,w,th);
    const gr=g.createLinearGradient(0,0,0,hh);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(Math.min(1,TOPF/hh),'#000');gr.addColorStop(1,'#000');g.globalCompositeOperation='destination-in';g.fillStyle=gr;g.fillRect(0,0,w,hh);
    g.globalCompositeOperation='source-over';c.drawImage(cv,cx-w/2,top,w,hh);}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  const R=crest();R.forEach((q,i)=>ringAt5(c,'ring-thin',q.x,gtop+q.dy-q.h*.72,i*.41,Math.max(40,Math.min(55,q.w*.8))/A4['ring-thin'].gw));
  {const fa=A4['ring-foam-thick'],fi=img4('ring-foam-thick'),gx=(R[0].x+R[0].w/2+R[1].x-R[1].w/2)/2,gw=Math.max(24,R[1].x-R[1].w/2-(R[0].x+R[0].w/2)),fs=Math.max(36,gw+14)/fa.gw,fy=gtop-3;
    if(fi){c.save();c.globalAlpha*=.85;c.drawImage(fi,gx-fa.gw*fs/2,fy-fa.gh*fs/2,fa.gw*fs,fa.gh*fs);c.restore();}ringAt5(c,'ring-foam-thick',gx,fy,.5,fs);}
  for(const q of R.slice().sort((a,b)=>a.dy-b.dy))drawRock(c,q,gtop+q.dy);
  for(const [kk,p] of [['cliff-side-A',F.sa],['cliff-side-B',F.sb]]){const a=A4[kk],im2=img4(kk);if(im2)c.drawImage(im2,p[0]-a.gw/2,p[1],a.gw,a.gh);}
  c.restore();}
/* water life: Map 4 ripple strokes running down the stream (not under the bridge decks), slow rings on the still pool */
const RIP=[];{const S=D.stream;for(let i=0;i<S.length-1;i++){const [x1,y1]=S[i],[x2,y2]=S[i+1],L=Math.hypot(x2-x1,y2-y1);for(let s=0;s<L;s+=64)RIP.push([x1+(x2-x1)*s/L,y1+(y2-y1)*s/L,(x2-x1)/L,(y2-y1)/L]);}}
const PRING=[[2250,1930],[2420,2050],[2300,2110],[2470,1900],[2180,2040]];
function liveWater(c){const v=view(c),t=now();c.save();c.strokeStyle='rgba(220,250,255,.28)';c.lineWidth=3;c.lineCap='round';
  for(let i=0;i<RIP.length;i++){const [x,y,dx,dy]=RIP[i];if(y<2240||y>D.fall.top-10||x<v.x0-80||x>v.x1+80||y<v.y0-80||y>v.y1+80)continue;
    if(D.bridges.some(b=>Math.abs(y-b.y)<82))continue;const ph=((t*40+i*7)%60)/60;
    for(const f of[-.5,0,.45]){const px=x-dy*f*D.shw*.8+dx*(ph*60-30),py=y+dx*f*D.shw*.8+dy*(ph*60-30);c.beginPath();c.moveTo(px-14,py);c.lineTo(px+14,py+4);c.stroke();}}
  c.restore();const im=img4('ring-thin');if(!im)return;const a=A4['ring-thin'];
  PRING.forEach(([x,y],i)=>{if(x<v.x0-100||x>v.x1+100||y<v.y0-100||y>v.y1+100)return;const q=((t/4.5)+i*.37)%1,s=(.55+q*.8)*60/a.gw;
    c.save();c.globalAlpha=.55*(1-q)*Math.min(1,q*5);c.drawImage(im,x-a.gw*s/2,y-a.gh*s/2,a.gw*s,a.gh*s);c.restore();});}
function register(){
  PROP_DEFS.m5Out=P_({n:'Map 5: dark forest outside the map',layer:'ground',w:MW+6000,h:MH+6000,ax:(MW+6000)/2,ay:(MH+6000)/2,live:liveOutside});
  PROP_DEFS.m5Sky=P_({n:'Map 5: sky + mountain backdrop (parallax)',layer:'ground',w:MW+6000,h:MH+6000,ax:(MW+6000)/2,ay:(MH+6000)/2,live:liveSky});
  PROP_DEFS.m5Water=P_({n:'Map 5: stream ripples + pool rings',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveWater});
  PROP_DEFS.m5Fall=P_({n:'Map 5: waterfall (strip, crest rocks, channel banks)',layer:'ground',w:440,h:620,ax:220,ay:300,live:liveFall});
  PROP_DEFS.m5Swirl=P_({n:'Map 5: portal swirl + glow',layer:'ground',w:200,h:200,ax:100,ay:100,live:liveSwirl});
  PROP_DEFS.m5Zones=P_({n:'Map 5 zone outlines (TEST)',layer:'ground',w:MW+400,h:MH+400,ax:(MW+400)/2,ay:(MH+400)/2,live:liveZones});
  for(const k in A){if(!/^s?pine\d$/.test(k))continue;const a=A[k];PROP_DEFS['m5T_'+k]=P_({n:'Map 5 pine '+k,w:a.gw,h:a.gh,ax:a.fx,ay:a.fy,live:(c,p)=>tree(c,p,k)});}
  const S=new Set();for(const q of D.props)if(['ruin','gate','pillar','srock','fgrass'].includes(q[0]))S.add(q[1]);
  for(const k of S){const a=A[k]||A4[k];if(!a){console.warn('[p266] missing art',k);continue;}const [fx,fy]=foot(k);PROP_DEFS['m5S_'+k]=P_({n:'Map 5 '+k,w:a.gw,h:a.gh,ax:fx,ay:fy,live:(c,p)=>still(c,p,k)});}
  PROP_DEFS.m5Solid=P_({n:'Map 5 collision',solid:D.solids.map(([x,y,r])=>({dx:x,dy:y,r}))});}
register();
function props(){const m=(t,x,y,o)=>Object.assign({t,x:Math.round(x),y:Math.round(y),s:1,v:0,f:1,ph:0,edge:1,nc:0,m4:1},o||{});
  const out=[m('m5Out',MW/2,MH/2),m('m5Sky',MW/2,MH/2),m('m5Water',MW/2,MH/2),m('m5Fall',D.fall.x,D.fall.top+100),m('m5Swirl',D.ring[0],D.ring[1]),m('m5Zones',MW/2,MH/2)];
  for(const [kind,k,x,y,s] of D.props){let t=null,o={};
    if(kind==='tree')t='m5T_'+k;else if(kind==='rock')t='m4R_'+k;else if(kind==='cg'){t='m4CG_'+k;o={m4s:s};}else if(kind==='reed')t='m4B_'+k;else if(kind==='bush'){t='m4Fs_'+k;o={m4s:1};}else t='m5S_'+k;
    if(!PROP_DEFS[t]){M5.missing=(M5.missing||[]);if(M5.missing.indexOf(t)<0)M5.missing.push(t);continue;}out.push(m(t,x,y,o));}
  for(const b of D.bridges)if(PROP_DEFS['m4L2_'+b.k])out.push(m('m4L2_'+b.k,b.x,b.y,{m4sy:b.y+b.D}));   // front rails: Map 4's L2 pieces, sorted at the rail line
  out.push(m('m5Solid',0,0));return out;}
{const o=loadPropsFor;loadPropsFor=function(zid){if(zid===ID){try{ED.source='default';}catch(e){}return props();}return o.apply(this,arguments);};}
/* ground: the baked image (async decode -> drawn into the same canvas as soon as it is ready), 0.8 px per world px */
{const o=genBG;genBG=function(zid){if(zid!==ID)return o.apply(this,arguments);LIGHTS=[];const c=document.createElement('canvas');c.width=Math.round(MW*GK);c.height=Math.round(MH*GK);const g=c.getContext('2d');g.fillStyle='#5f9a35';g.fillRect(0,0,c.width,c.height);BGS=GK;
  let n=0;const go=()=>{const im=img('ground');if(im){g.drawImage(im,0,0,c.width,c.height);M5.groundOk=true;return;}if(++n<300)setTimeout(go,50);};M5.groundOk=false;go();return c;};}
{const o=gatesFor;gatesFor=function(zid){if(zid===ID)return [];return o.apply(this,arguments);};}
{const o=spawnEnemy;spawnEnemy=function(){if(G.zone===ID)return;return o.apply(this,arguments);};}

/* ---------- mist (screen space, after the world, world-anchored): a band over the snow / mountain seam, soft side edges, 2 slow drifting layers ---------- */
let MC=null;function mistCanvas(){if(MC)return MC;const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');let sd=5505;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<46;i++){const x=r()*512,y=40+r()*48,rx=40+r()*90,ry=18+r()*22,a=.10+r()*.10;for(const ox of[-512,0,512]){g.save();g.translate(x+ox,y);g.scale(1,ry/rx);const q=g.createRadialGradient(0,0,1,0,0,rx);
    q.addColorStop(0,`rgba(240,246,252,${a})`);q.addColorStop(1,'rgba(240,246,252,0)');g.fillStyle=q;g.beginPath();g.arc(0,0,rx,0,6.2832);g.fill();g.restore();}}
  return MC=c;}
function mistBand(wy0,wy1,speed,alpha,seed){const a=w2s(0,wy0),b=w2s(0,wy1);if(b[1]<-20||a[1]>H+20)return;const z=camZ(),h=b[1]-a[1],tw=1024*z,mc=mistCanvas();
  let x=(a[0]+now()*speed*z+seed*tw)%tw;if(x>0)x-=tw;ctx.save();ctx.globalAlpha=alpha;for(;x<W;x+=tw)ctx.drawImage(mc,x,a[1],tw+1,h);ctx.restore();}
function drawMist(){const z=camZ();
  const sh=D.mtn.shift||0;mistBand(262+sh,402+sh,6,.75,0);mistBand(190+sh,310+sh,-4,.55,.37);   // r1b: shifted up with the mountains (art review: the gate stands on snow, mist above its mid-height)
    // seam band (mountain foot / snow strip top, mostly above where heroes can walk) + a thinner one higher on the mountain foot
  for(const [wy0,wy1,sp,al,sd] of[[560,980,9,.24,.2],[1150,1650,-7,.20,.61]])mistBand(wy0,wy1,sp,al,sd);   // 2 slow drifting layers over the snow strip and the upper meadow / cliff (light: fights stay readable)
  const L=w2s(0,0)[0],R=w2s(MW,0)[0],ew=300*z;   // side edges
  if(L+ew>0){const g=ctx.createLinearGradient(L-60*z,0,L+ew,0);g.addColorStop(0,'rgba(232,240,248,.38)');g.addColorStop(1,'rgba(232,240,248,0)');ctx.fillStyle=g;ctx.fillRect(0,0,Math.min(W,L+ew),H);}
  if(R-ew<W){const g=ctx.createLinearGradient(R+60*z,0,R-ew,0);g.addColorStop(0,'rgba(232,240,248,.38)');g.addColorStop(1,'rgba(232,240,248,0)');ctx.fillStyle=g;ctx.fillRect(Math.max(0,R-ew),0,W-Math.max(0,R-ew),H);}}
try{const o=drawAtmos;drawAtmos=function(){const r=o.apply(this,arguments);if(G.zone===ID){try{ctx.save();ctx.setTransform(ctx.getTransform());drawMist();ctx.restore();M5.stats.atmos++;}catch(e){M5.mistErr=e.message;}}return r;};}catch(e){M5.atmosErr=e.message;}
/* ---------- way in (Map 4 portal) and back (Map 5 portal ring) ---------- */
function enter(pos,face){preload();try{M4.r28.pause();}catch(e){}   // r1c: also used by Map 6 (back through its south arch)
  if(!M4.load(ID,{x:pos[0],y:pos[1]})){console.warn('[p266] Map 5 did not load');try{M4.load(M4.id,{x:M4.port.x,y:M4.port.y+60});M4.r28.resume();}catch(e){}return false;}
  M5.on=true;M5.stats.enter++;M5.armT=now()+1.5;if(M5.z0==null)M5.z0=CAM.zt;CAM.zt=.7;try{P.face=face==null?Math.PI/2:face;}catch(_){}ZP.where=null;try{populate();}catch(e){ZP.err.push('populate '+e.message);}return true;}
function goMap5(){if(G.fade||!M4.on)return false;G.fade={t:0,fn:()=>enter(D.arrive)};return true;}
function goBack(){if(G.fade)return;M5.stats.ring++;G.fade={t:0,fn:()=>{leaveClean();M5.stats.exit++;
  try{M4.load(M4.id,{x:M4.port.x,y:M4.port.y+60});}catch(e){console.warn('[p266] back to Map 4',e);}try{M4.r28.resume();}catch(e){}}};}
M4.goMap5=goMap5;M5.goBack=goBack;M5.enter=enter;M5.north=D.north;M5.stats.north=0;
setInterval(()=>{try{if(M5.on&&G.zone!==ID&&!G.fade)leaveClean();if(!P||G.fade||G.state!=='play'||G.zone!==ID)return;
  const [rx,ry]=D.ring;if(now()>M5.armT&&((P.x-rx)/44)**2+((P.y-ry)/32)**2<1)goBack();
  const N=D.north;if(N&&typeof M4.goMap6==='function'&&now()>M5.armT&&Math.abs(P.x-N.cx)<42&&P.y<N.y+18){M5.stats.north++;M4.goMap6();}}catch(e){}},100);   // r1c: into the north arch doorway -> Map 6   // the ring's inner disc (41 x 25 world) + a little
/* ---------- monsters (Map 4 r28 rules, Map 5 polygon zones) ---------- */
const POP={member:[50,80],cleared:[90,120],minP:360,retry:2.5,aggro:.72,join:170,ret:1.6,timeout:20,safeGap:200};
function polyIn(x,y,Q){let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function edgeD(x,y,Q){let m=1e9;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [x1,y1]=Q[j],[x2,y2]=Q[i],dx=x2-x1,dy=y2-y1,L=dx*dx+dy*dy,t=L?Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/L)):0;m=Math.min(m,Math.hypot(x-x1-t*dx,y-y1-t*dy));}return m;}
const inZ=(z,x,y,m)=>{const i=polyIn(x,y,z.poly);if(!m)return i;if(m>0)return i&&edgeD(x,y,z.poly)>=m;return i||edgeD(x,y,z.poly)<-m;};   // m > 0: that far inside; m < 0: up to -m outside
const inR=(r,x,y,m)=>x>r[0]+(m||0)&&x<r[2]-(m||0)&&y>r[1]+(m||0)&&y<r[3]-(m||0);
const rectGap=(r,x,y)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-y,0,y-r[3]));
const ZC=D.zones.map(z=>{const xs=z.poly.map(q=>q[0]),ys=z.poly.map(q=>q[1]);return Object.assign({},z,{bb:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],cnt:z.mix.reduce((a,q)=>a+q[1],0)});});
const ZP={on:false,members:[],stats:{spawn:{},rej:{},respawns:0,kills:0,resets:0,pulls:0,minSpawnDist:null,plazaDrops:0},where:null,err:[]};M5.zones=ZP;M5.zc=ZC;
function zoneAt(x,y){for(const z of ZC)if(inZ(z,x,y))return z;return null;}
function spotWhy(z,x,y,r,o){o=o||{};
  if(!inZ(z,x,y,r+10))return 'zone';
  for(const [dx,dy] of[[0,0],[-r-12,0],[r+12,0],[0,-r-12],[0,r+12]])if(!onF(x+dx,y+dy))return 'floor';
  if(typeof blocked==='function'&&blocked(x,y,r+8))return 'solid';
  if(rectGap(D.safe,x,y)<POP.safeGap)return 'safe';
  for(const [ax,ay,ar] of D.avoid)if(Math.hypot(x-ax,y-ay)<ar+r)return 'avoid';
  if(!o.home){if(P&&!P.dead&&o.minP&&Math.hypot(x-P.x,y-P.y)<o.minP)return 'player';
    for(const q of enemies)if(!q.dead&&Math.hypot(q.x-x,q.y-y)<Math.max((q.sz+r)*1.15,(q.m5z===z)?z.sep*.5:0))return 'monster';}
  return null;}
function grnd(){let sd=5505;return ()=>(sd=(sd*16807)%2147483647)/2147483647;}
function plan(){if(ZP.planned)return;ZP.planned=true;const R=grnd();
  for(const z of ZC){const mr=Math.max(...z.mix.map(q=>(MOBS[q[0]]&&MOBS[q[0]].sz)||20)),q=z.bb,cells=[];
    for(let y=Math.ceil((q[1]+10)/20)*20;y<q[3];y+=20)for(let x=Math.ceil((q[0]+10)/20)*20;x<q[2];x+=20)if(!spotWhy(z,x,y,mr,{home:1}))cells.push([x,y]);
    z.walk=Math.round(cells.length*400);
    const pick=(n,sp)=>{let best=[];for(let t=0;t<60&&best.length<n;t++){const h=[];for(let k=0;k<900&&h.length<n&&cells.length;k++){const c=cells[Math.floor(R()*cells.length)];if(h.every(p=>Math.hypot(p[0]-c[0],p[1]-c[1])>=sp))h.push(c);}if(h.length>best.length)best=h;}return best;};
    let homes=pick(z.cnt,z.sep);if(homes.length<z.cnt)homes=pick(z.cnt,z.sep*.7);z.n=homes.length;
    const types=[];{const left=z.mix.map(q=>q[1]);while(types.length<z.cnt)z.mix.forEach((q,i)=>{if(left[i]-->0)types.push(q[0]);});}   // mixed zone: alternate the species
    z.minSep=0;if(homes.length>1){let m=1e9;for(let i=0;i<homes.length;i++)for(let j=i+1;j<homes.length;j++)m=Math.min(m,Math.hypot(homes[i][0]-homes[j][0],homes[i][1]-homes[j][1]));z.minSep=Math.round(m);}
    homes.forEach((h,i)=>ZP.members.push({z,type:types[i],idx:i,hx:h[0],hy:h[1],e:null,respT:null,L:null}));}}
function galeScope(){const REG=window.MON_SPRITES,R=REG&&REG.byType&&REG.byType.galefeather;if(!R)return false;if(R.data.m5scope)return true;R.data.m5scope=1;
  const d=Object.getOwnPropertyDescriptor(R.data,'scope'),old=d&&d.get?d.get:()=>d?d.value:'studio';   // Gale Feather art: Studio as before, plus this map
  Object.defineProperty(R.data,'scope',{configurable:true,get(){return (typeof G!=='undefined'&&G.zone===ID)?'map5test':old.call(R.data);}});M5.stats.galeScope++;return true;}
function spawn(m,initial){if(m.type==='ruinwarden_m4'&&!(window.MON_SPRITES&&MON_SPRITES.byType.ruinwarden_m4)){m.respT=now()+1;return false;}   // never shown before its recoloured art is ready (p254 r29)
  if(m.type==='galefeather'&&!galeScope()){m.respT=now()+1;return false;}
  const z=m.z,mob=MOBS[m.type];if(!mob){ZP.err.length<20&&ZP.err.push('no species '+m.type);m.respT=now()+30;return false;}
  const r=mob.sz||20,o={minP:initial?0:POP.minP};let s=null,why=null;
  for(let k=0;k<26&&!s;k++){const a=Math.random()*6.2832,d=k?Math.min(120,Math.random()*(30+k*8)):0,x=m.hx+Math.cos(a)*d,y=m.hy+Math.sin(a)*d;why=spotWhy(z,x,y,r,o);if(!why)s=[x,y];else ZP.stats.rej[why]=(ZP.stats.rej[why]||0)+1;}
  if(!s)return false;
  const L=z.lv[0]+Math.floor(Math.random()*(z.lv[1]-z.lv[0]+1)),e=makeEnemy(m.type,L,s[0],s[1]);
  const sp=(window.W22&&W22.sp10&&W22.sp10.data||{})[m.type]||{};e.m5z=z;e.m5m=m;e.sx=s[0];e.sy=s[1];e.w22am=(sp.aggro||1)*POP.aggro;e.wx=e.x;e.wy=e.y;e.wanderT=1+Math.random()*3;
  m.e=e;m.respT=null;m.L=L;enemies.push(e);ZP.stats.spawn[z.id]=(ZP.stats.spawn[z.id]||0)+1;
  if(!initial){ZP.stats.respawns++;const dd=P?Math.hypot(s[0]-P.x,s[1]-P.y):0;ZP.stats.minSpawnDist=Math.min(ZP.stats.minSpawnDist==null?1e9:ZP.stats.minSpawnDist,Math.round(dd));try{ring(s[0],s[1],8,60,.5,mob.c,3);}catch(_){}}
  return true;}
function populate(){if(!M4.popInstall())return;plan();for(const m of ZP.members){m.e=null;if(m.respT!=null&&now()<m.respT)continue;spawn(m,true);}ZP.on=true;}
function leaveClean(){if(M5.on&&M5.z0!=null){CAM.zt=M5.z0;M5.z0=null;}if(!M5.on&&!ZP.on)return;ZP.on=false;M5.on=false;for(const m of ZP.members){if(m.e&&!m.e.dead)m.respT=now();m.e=null;}ZP.where=null;}
function died(e){const m=e.m5m;if(!m||m.e!==e)return;m.e=null;ZP.stats.kills++;const z=m.z,k=(z.resp||1),rr=a=>a[0]+Math.random()*(a[1]-a[0]);
  m.respT=now()+rr(POP.member)*k;const live=ZP.members.filter(q=>q.z===z&&q.e&&!q.e.dead);
  if(!live.length){const t0=now()+rr(POP.cleared)*k;let i=0;for(const q of ZP.members)if(q.z===z)q.respT=Math.max(q.respT||0,t0+(i++)*4);}}
{const o=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=o.apply(this,arguments);try{if(e&&!was&&e.dead&&e.m5m)died(e);}catch(er){ZP.err.push('kill '+er.message);}return r;};}
const heroIn=z=>P&&!P.dead&&inZ(z,P.x,P.y,-40)&&!inR(D.safe,P.x,P.y);
function zPre(dt){const alive=P&&!P.dead&&G.state==='play'&&!(P.stealth>0);
  for(const e of enemies){if(e.dead||!e.m5z)continue;
    if(e.w22ret){e.hp=e.w22ret.hp;e.w22px=e.x;e.w22py=e.y;e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;for(const k in e.st)delete e.st[k];continue;}
    if(alive&&!e.aggro&&!(e.st&&e.st.stun)&&heroIn(e.m5z)&&Math.hypot(e.x-P.x,e.y-P.y)<detectR(e)){e.aggro=true;e.alertT=.9;e.calmT=0;ZP.stats.pulls++;try{textAt(e.x,e.y-e.sz*2.6,'!','#ff5a6a',22,{life:.7,vy:-30});}catch(_){}
      if(e.joinMode!=='solo')for(const q of enemies)if(q!==e&&!q.dead&&!q.aggro&&q.m5z===e.m5z&&q.joinMode!=='solo'&&Math.hypot(q.x-e.x,q.y-e.y)<POP.join){q.aggro=true;q.alertT=.9;}}}}
function rStart(e){e.w22ret={t:0,hp:e.hp};e.aggro=false;e.wind=0;e.strikeT=0;e.tele=null;e.vx=e.vy=0;e.calmT=0;e.atkCd=1.4;
  for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}e.dotT=.5;for(let i=projs.length-1;i>=0;i--)if(projs[i].src===e)projs.splice(i,1);}
function rEnd(e,why){e.w22ret=null;if(why==='timeout'){e.x=e.sx;e.y=e.sy;}
  e.hp=e.maxHp;e.aggro=false;e.wind=0;e.tele=null;e.strikeT=0;e.atkCd=1+Math.random()*.6;e.dotT=.5;for(const k in e.st)delete e.st[k];if(e.pz&&e.pz.clear)try{e.pz.clear();}catch(_){}}
function zPost(dt){
  for(const e of enemies){if(e.dead||!e.m5z)continue;const z=e.m5z;
    if(e.w22ret){const r=e.w22ret;r.t+=dt;const dx=e.sx-e.w22px,dy=e.sy-e.w22py,d=Math.hypot(dx,dy)||1;
      if(d<26||r.t>POP.timeout){rEnd(e,d<26?'home':'timeout');continue;}
      const st=Math.min(d,e.sp*POP.ret*dt);e.x=e.w22px+dx/d*st;e.y=e.w22py+dy/d*st;e.vx=e.vy=0;e.hp=r.hp;try{collide(e,e.sz*.7);}catch(_){}continue;}
    if(e.aggro){if(!inZ(z,e.x,e.y,-24)||!heroIn(z)){if(P&&inR(D.safe,P.x,P.y))ZP.stats.plazaDrops++;rStart(e);e.w22px=e.x;e.w22py=e.y;ZP.stats.resets++;}}
    else if(!inZ(z,e.wx,e.wy,30)||!onF(e.wx,e.wy)){e.wx=e.sx;e.wy=e.sy;}}   // calm wander: inside the zone, on walkable ground
  ZP.respT=(ZP.respT||0)-dt;if(ZP.respT<=0){ZP.respT=1;
    for(const m of ZP.members){if(m.e&&!m.e.dead)continue;if(m.respT!=null&&now()>=m.respT){
      if(ZP.members.some(q=>q.z===m.z&&q.e&&!q.e.dead&&(q.e.aggro||q.e.w22ret))){m.respT=now()+POP.retry;continue;}   // never refill a zone during a fight
      if(!spawn(m,false))m.respT=now()+POP.retry;}}}}
{const o=updEnemies;updEnemies=function(dt){if(G.zone!==ID||!ZP.on)return o.apply(this,arguments);try{zPre(dt);}catch(er){if(ZP.err.length<20)ZP.err.push('pre '+er.message);}
  const r=o.apply(this,arguments);try{zPost(dt);}catch(er){if(ZP.err.length<20)ZP.err.push('post '+er.message);}return r;};}
/* HUD: zone names */
function whereText(){if(!P)return null;if(inR(D.safe,P.x,P.y))return {k:'s',t:'ลานพอร์ทัล',s:'🛡 Safe Zone · ลานพอร์ทัล',safe:1};
  const z=zoneAt(P.x,P.y);if(z)return {k:'z'+z.id,t:z.nm,s:`แมพ 5 · ${z.nm} · Lv ${z.lv[0]}–${z.lv[1]}`};
  if(P.y<D.cliffs.u[0])return {k:'n',t:null,s:'แมพ 5 · ชั้นบน'};return {k:'p',t:null,s:'แมพ 5 · ทางเดิน'};}
{const o=updZoneTag;updZoneTag=function(){const r=o.apply(this,arguments);try{if(G.zone===ID){const w=whereText(),s=document.getElementById('zSub'),n=document.getElementById('zName');
  if(n)n.textContent='Map 5 (TEST)';if(s&&w)s.textContent=w.s;if(n)n.style.color=w&&w.safe?'#7dff9a':'';}}catch(_){}return r;};}
setInterval(()=>{try{if(G.zone!==ID||!P)return;const w=whereText();if(!w||w.k===ZP.where)return;const first=ZP.where==null;ZP.where=w.k;updZoneTag();if(!first&&w.t)showBanner(w.t,w.s,2.2);}catch(_){}},200);
/* TEST: zone outlines (the Map 4 TEST button "แสดงเส้นโซน" toggles every TEST map) */
function liveZones(c){const dbg=M5.dbg;if(!(M4.zones&&M4.zones.lines)&&!dbg)return;c.save();
  if(dbg){c.strokeStyle='rgba(255,40,60,.85)';c.lineWidth=2;for(const o of SOLIDS){c.beginPath();c.arc(o.x,o.y,o.r,0,6.2832);c.stroke();}}   // TEST: collision discs (M5.dbg = true)
  const zk=1/Math.max(.3,Math.min(1,CAM.z||1));c.lineWidth=3*zk;c.font=`bold ${Math.round(22*Math.min(zk,2))}px sans-serif`;
  const lab=(x0,y0,lb,col)=>{c.fillStyle='rgba(0,0,0,.55)';const w=c.measureText(lb).width+12,hh=28*Math.min(zk,2);c.fillRect(x0+4,y0+4,w,hh);c.fillStyle=col;c.fillText(lb,x0+10,y0+hh-2);};
  for(const z of ZC){c.strokeStyle=z.col;c.globalAlpha=.9;c.beginPath();z.poly.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.stroke();
    lab(z.bb[0]+20,z.bb[1]+10,`${z.id} · ${z.mix.map(q=>((MOBS[q[0]]&&MOBS[q[0]].n)||q[0])+'×'+q[1]).join(' + ')} · Lv ${z.lv[0]}–${z.lv[1]} · ${z.n||0} ตัว`,z.col);}
  {const q=D.safe;c.strokeStyle='#50bef0';c.setLineDash([6,6]);c.strokeRect(q[0],q[1],q[2]-q[0],q[3]-q[1]);c.setLineDash([]);lab(q[0],q[1],'1 · Safe Zone · ลานพอร์ทัล','#50bef0');}
  c.restore();}
M5.why=(i,x,y,r)=>spotWhy(ZC[i],x,y,r||20,{home:1});M5.onF=onF;M5.leave=leaveClean;M5.whereText=whereText;
})();
