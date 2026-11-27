
/* ---- r199 rodlook + catch card (TEST ONLY). Motion fishing r6b/r7e handoff (motion/fishing_r6_rods/code_handoff_r6b/), PASSED by DeaRz 24 Nov 06:55 + 07:15 BKK.
   (1) The held rod is the item rod picture of the equipped tier (ROD197.tier, rodheld1..7.png): grip 0.17 from the butt, rigid (no bend), line from the rod tip,
       and the near fist is drawn again over the handle. Needs the r199 patches in fishpose195 (hooks ROD199.use / tip / drawRod / fist) and PUPPET.draw (__ONLY).
   (2) Catch card "ตกได้แล้ว!" (Motion catchCard r7e): fish icon, name, tier colour + ribbon (common #c9d1d9, uncommon #5ccf6a, rare #4aa3ff, very rare #ffc23a,
       legendary #ff2a2a), rays for rare and up, shiny stars + "ประกาย (สถานะ x1.5)", "ใหม่!" on the first catch of that fish (shiny counted apart), the statuses.
       Replaces the old small card; tap / click closes it, otherwise 3.2 s.
   NOT here: the 7th status "ลดเวลา" and legendary 3-4 statuses (Balance numbers pending), legendary fish.
   ?rodlook=off = code-drawn rod, ?catchcard=off = old card. Debug window.ROD199 ---- */
(function(){'use strict';
const Q=String(location.search);
const R=window.ROD199={ver:'rodlook-r199',on:!/[?&]rodlook=off\b/.test(Q),card:!/[?&]catchcard=off\b/.test(Q),err:null,stats:{rod:0,fist:0,cards:0},last:null};
const ERR=(w,e)=>{R.err=w+': '+((e&&e.message)||e);try{console.error('[ROD199]',w,e)}catch(_){}};
const META={"1": {"tip": [114, 4], "butt": [5, 118]}, "2": {"tip": [112, 5], "butt": [9, 112]}, "3": {"tip": [115, 5], "butt": [6, 118]}, "4": {"tip": [115, 5], "butt": [6, 118]}, "5": {"tip": [114, 5], "butt": [7, 119]}, "6": {"tip": [116, 6], "butt": [5, 118]}, "7": {"tip": [118, 10], "butt": [6, 119]}},GRIP=0.17,IM={};
const SRC={"1": "assets/c0b4c0896f7e0402.png", "2": "assets/93b5c4652a2dfa59.png", "3": "assets/3138dd51b0147d47.png", "4": "assets/6addc6a3d2092ff9.png", "5": "assets/e388540f171957c0.png", "6": "assets/dd715e3ba36aa6a5.png", "7": "assets/2fd63960805ba4ff.png"};
if(R.on)for(const k in SRC){const im=new Image();im.src=SRC[k];IM[k]=im}
const tier=()=>{try{const t=window.ROD197&&ROD197.on?ROD197.tier:1;return (t>=1&&t<=7)?t:1}catch(_){return 1}};
const img=()=>{const im=IM[tier()];return (im&&im.complete&&im.naturalWidth)?im:null};
R.use=()=>R.on&&!!img();R.img=img;R.META=META;R.tierNow=tier;
const LEN=()=>{try{return FISH.rodLen}catch(_){return 300}};
R.rodLen=430;/* FISH.rodLen (Motion r5); the fishpose patch refreshes it */
/* tip of the item rod (rigid) */
R.tip=function(g,FP,f,SC){const L=(R.rodLen+70)*SC,a=FP.rod*Math.PI/180;return [g[0]+Math.cos(a)*f*L*(1-GRIP),g[1]-Math.sin(a)*L*(1-GRIP)]};
R.drawRod=function(cx,g,FP,f,SC){const im=img();if(!im)return;const M=META[tier()];const vx=M.tip[0]-M.butt[0],vy=M.tip[1]-M.butt[1],Li=Math.hypot(vx,vy),th=Math.atan2(vy,vx),Lt=(R.rodLen+70)*SC,k=Lt/Li,a=FP.rod*Math.PI/180,gp=[M.butt[0]+vx*GRIP,M.butt[1]+vy*GRIP];
 cx.save();cx.translate(g[0],g[1]);cx.scale(f,1);cx.rotate(-a);cx.scale(k,k);cx.rotate(-th);cx.translate(-gp[0],-gp[1]);cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';cx.drawImage(im,0,0);cx.restore();R.stats.rod++};
/* near fist again over the handle: the puppet draws only fist_near (window.__ONLY, r199 patch); the hero wrappers skip it (PUPPETX.inGhost) */
R.fist=function(cx,fr){try{if(!fr||fr.hx==null||!fr.hp)return;const U=window.PUPPET,X=window.PUPPETX;if(!U||!X)return;const g0=X.inGhost;X.inGhost=true;window.__ONLY='fist_near';try{U.draw(cx,fr.hx,fr.hy,fr.sc,fr.face,fr.hp)}finally{window.__ONLY=null;X.inGhost=g0}R.stats.fist++}catch(e){ERR('fist',e)}};
/* ---- (2) catch card ---- */
if(R.card){
const CT={common:{n:'ธรรมดา',c:'#c9d1d9',lv:1},uncommon:{n:'ไม่ธรรมดา',c:'#5ccf6a',lv:2},rare:{n:'หายาก',c:'#4aa3ff',lv:3},veryrare:{n:'หายากมาก',c:'#ffc23a',lv:4},legendary:{n:'ตำนาน',c:'#ff2a2a',lv:5}};
R.CT=CT;
const st=document.createElement('style');st.textContent='body.rod199card #fsCard{display:none!important}#rod199cv{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:60;display:none;cursor:pointer}';document.head.appendChild(st);
const cv=document.createElement('canvas');cv.id='rod199cv';document.body.appendChild(cv);document.body.classList.add('rod199card');
const close=e=>{try{if(e){e.preventDefault();e.stopPropagation()}}catch(_){}C=null;cv.style.display='none'};
for(const ev of ['pointerdown','touchstart','mousedown'])cv.addEventListener(ev,close,{passive:false});
let C=null,lastSt=null,seen={};try{seen=JSON.parse(localStorage.getItem('lf_fishseen199')||'{}')||{}}catch(_){seen={}}
/* the statuses of the caught fish = what the status module rolled for this catch */
function hookItem(){const F=window.__F183;if(!F||!F.fishItem)return false;if(F._r199)return true;F._r199=1;const o=F.fishItem;F.fishItem=function(){const it=o.apply(this,arguments);try{lastSt=(it&&it.st)?it.st.slice():[]}catch(_){lastSt=[]}return it};return true}
{let n=0;const iv=setInterval(()=>{if(hookItem()||++n>240)clearInterval(iv)},500)}
let caught0=null;
setInterval(()=>{try{const f=window.__FISHING;if(!f||!f.stats)return;const c=f.stats.caught|0;if(caught0==null){caught0=c;return}if(c>caught0){caught0=c;const l=f.last;if(l&&l.fish)show(l.fish,l.bag!==false)}}catch(e){ERR('poll',e)}},100);
function show(sp,bag){const f=window.__FISHING,fd=f.cfg.fish[sp];if(!fd)return;const shiny=/_s$/.test(sp),base=shiny?sp.slice(0,-2):sp;
 const rows=[];try{const F=window.__F183;for(const a of (lastSt||[])){const t=F.txtSt([a],shiny);const i=t.lastIndexOf(' +');rows.push(i>0?[t.slice(0,i),t.slice(i+1)]:[t,''])}}catch(_){}
 lastSt=null;const key=base+(shiny?'*':''),isNew=!seen[key];seen[key]=1;try{localStorage.setItem('lf_fishseen199',JSON.stringify(seen))}catch(_){}
 const it=(typeof ITEMS!=='undefined')&&ITEMS[fd.item];
 C={sp,name:shiny?String(fd.n).replace(/\s*ไชนี่$/,''):fd.n,tier:CT[fd.r]||CT.common,shiny,rows,isNew,icon:it&&it.icon,bag,t0:performance.now()/1000};R.last={sp,tier:fd.r,shiny,rows:rows.length,isNew};R.stats.cards++;cv.style.display='block';
 if(!R.raf){R.raf=1;requestAnimationFrame(loop)}}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function star(g,x,y,r,c){g.save();g.translate(x,y);g.fillStyle=c;g.beginPath();for(let i=0;i<8;i++){const r2=i%2?r*.35:r,a=i*Math.PI/4;g.lineTo(Math.cos(a)*r2,Math.sin(a)*r2)}g.closePath();g.fill();g.restore()}
let ic=null;
function loop(){R.raf=0;if(!C){cv.style.display='none';return}const t=performance.now()/1000-C.t0;if(t>3.2){close();return}
 const dpr=Math.min(2,window.devicePixelRatio||1),W0=innerWidth,H0=innerHeight;if(cv.width!==Math.round(W0*dpr)||cv.height!==Math.round(H0*dpr)){cv.width=Math.round(W0*dpr);cv.height=Math.round(H0*dpr)}
 const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
 const k=Math.min(1,(W0-24)/430,(H0-40)/(262+Math.max(1,C.rows.length)*34+30));g.setTransform(dpr*k,0,0,dpr*k,0,0);
 const GW=W0/k,tr=C.tier,W=430,H=262+Math.max(1,C.rows.length)*34-14,X0=GW/2-W/2,Y0=Math.max(28,(H0/k)*.12);
 const a=Math.min(1,t/.18),sc=t<.18?.6+.4*(t/.18)+Math.sin(t/.18*Math.PI)*.08:1,fade=t>2.95?Math.max(0,1-(t-2.95)/.25):1;
 g.save();g.globalAlpha=a*fade;g.translate(GW/2,Y0+H/2);g.scale(sc,sc);g.translate(-GW/2,-(Y0+H/2));
 if(tr.lv>=3){g.save();g.translate(GW/2,Y0+92);g.rotate(t*.6);const n=tr.lv>=4?16:10;for(let i=0;i<n;i++){g.rotate(Math.PI*2/n);const gr=g.createLinearGradient(0,0,0,-260);gr.addColorStop(0,tr.c+'aa');gr.addColorStop(1,tr.c+'00');g.fillStyle=gr;g.beginPath();g.moveTo(-14,0);g.lineTo(0,-260);g.lineTo(14,0);g.fill()}g.restore()}
 g.shadowColor=tr.c;g.shadowBlur=tr.lv>=3?28:12;rr(g,X0,Y0,W,H,18);g.fillStyle='rgba(22,26,38,.94)';g.fill();g.shadowBlur=0;g.lineWidth=4;g.strokeStyle=tr.c;g.stroke();
 rr(g,X0+W/2-96,Y0-18,192,36,18);g.fillStyle=tr.c;g.fill();g.fillStyle='#161a26';g.font='bold 19px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ตกได้แล้ว!',GW/2,Y0);
 const ix=GW/2,iy=Y0+92,bob=Math.sin(t*3)*4;rr(g,ix-62,iy-62,124,124,16);g.fillStyle='rgba(255,255,255,.07)';g.fill();g.lineWidth=3;g.strokeStyle=tr.c;g.stroke();
 if(typeof C.icon==='function'){try{if(!ic){ic=document.createElement('canvas');ic.width=ic.height=128}const q=ic.getContext('2d');q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,128,128);q.setTransform(2,0,0,2,0,0);C.icon(q);g.drawImage(ic,ix-56,iy-56+bob,112,112)}catch(_){}}
 if(C.shiny){for(let i=0;i<6;i++){const aa=t*1.4+i*1.047,rx=ix+Math.cos(aa)*58,ry=iy+Math.sin(aa)*50+bob,tw=.5+.5*Math.sin(t*7+i*2);star(g,rx,ry,5+5*tw,'#ffe27a')}star(g,ix-50,iy-50,10,'#ffd23a')}
 if(C.isNew){g.save();g.translate(ix+62,iy-58);g.rotate(.25);rr(g,-30,-13,60,26,9);g.fillStyle='#ff5a5a';g.fill();g.fillStyle='#fff';g.font='bold 15px system-ui,sans-serif';g.fillText('ใหม่!',0,1);g.restore()}
 let y=Y0+176;g.fillStyle='#fff';g.font='bold 24px system-ui,sans-serif';g.fillText((C.shiny?'✦ ':'')+C.name+(C.shiny?' ✦':''),GW/2,y);
 y+=28;g.font='bold 15px system-ui,sans-serif';g.fillStyle=tr.c;g.fillText(tr.n+(C.shiny?' · ประกาย (สถานะ x1.5)':'')+(C.bag?'':' · กระเป๋าเต็ม ปล่อยกลับน้ำ'),GW/2,y);
 y+=22;g.strokeStyle='rgba(255,255,255,.15)';g.lineWidth=1;g.beginPath();g.moveTo(X0+24,y);g.lineTo(X0+W-24,y);g.stroke();y+=22;
 if(!C.rows.length){g.fillStyle='#9aa3b2';g.font='16px system-ui,sans-serif';g.fillText('ไม่มีสถานะ',GW/2,y)}
 C.rows.forEach((s,i)=>{const yy=y+i*34,ap=Math.min(1,Math.max(0,(t-.35-i*.18)/.2));g.globalAlpha=a*fade*ap;rr(g,X0+40,yy-14,W-80,28,8);g.fillStyle='rgba(255,255,255,.08)';g.fill();g.textAlign='left';g.fillStyle='#e8ecf2';g.font='16px system-ui,sans-serif';g.fillText('สถานะ '+(i+1)+'  '+s[0],X0+54,yy);g.textAlign='right';g.fillStyle='#7dffa0';g.font='bold 17px system-ui,sans-serif';g.fillText(s[1],X0+W-54,yy);g.textAlign='center';g.globalAlpha=a*fade});
 g.restore();requestAnimationFrame(loop);R.raf=1}
R.show=show;
}
})();

