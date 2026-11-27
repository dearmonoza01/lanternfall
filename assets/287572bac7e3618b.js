
/* p288 r1 — damage numbers new look (TEST; order orders/code/ORDER_20261023_damage-numbers-look.md, look = demo r4/r5 drawNew(), DeaRz OK 14:31
   "ตัวเลขดาเมจ ปรับให้ไม่เกิน 99,999 และตัวเลขจะเต็มเลขเสมอ ไม่มี 10K 20K"). Shown number capped at 99,999 (real damage unchanged), always full
   digits with commas. Font Lilita One (SIL OFL, latin subset embedded). Every hit still pops its own number (DeaRz 13:46: no sums).
   Kinds: hit / crit (32 px, red-gold, gold rim, CRITICAL!, star burst, shock ring, shake) / weak ▲ / resist ▼ / sub-hit 20 px / heal +N / hero hurt -N
   (drops) / MISS. Each number is drawn once into a small canvas (cache), so a frame only scales + fades images.
   ?dmgnum=old = the game's old numbers. */
(function(){const Q=String(location.search);const DN=window.__DMGNUM={on:!/dmgnum=old/.test(Q),err:null,font:false,stats:{hit:0,crit:0,weak:0,resist:0,sub:0,heal:0,hurt:0,miss:0,capped:0,cache:0,peak:0},list:[]};
if(!DN.on)return;
try{
const CAP=99999,F=v=>Math.min(CAP,Math.max(0,Math.round(v))).toLocaleString('en-US');
const FAM='"Lilita One","Arial Black",sans-serif';
try{const ff=new FontFace('Lilita One','url(assets/3b71f6c24c7e1301.woff2)');document.fonts.add(ff);ff.load().then(()=>{DN.font=true;CACHE.clear();}).catch(e=>{DN.err='font '+e.message;});}catch(e){DN.err='font '+e.message;}
const ELC={none:'#fff3d6',Neutral:'#fff3d6',Fire:'#ff7a3a',Ice:'#6fd8ff',Lightning:'#ffe14a',Earth:'#c79a5a',Light:'#ffd36b',Dark:'#a27bff',Poison:'#9be15d'};
const OLDC={};try{const c=window.ELEM&&ELEM.cfg&&ELEM.cfg.col;if(c)for(const k in c)OLDC[c[k].toLowerCase()]=k;}catch(_){}
/* element result of the hit being resolved (attack element + multiplier), read when its number arrives */
let LAST=null;
try{const K=(typeof COLCMB!=='undefined')?COLCMB:window.COLCMB;if(K&&K.resolveHit){const _r=K.resolveHit;K.resolveHit=function(i){const bn=window.ELEM&&ELEM.stats?ELEM.stats.basicNeutral:0;const r=_r.apply(this,arguments);
  try{if(i&&i.defElem!==undefined){const a=K.elemKey(i.attElem),d=K.elemKey(i.defElem);let k=K.elemMult(a,d),aa=a;if(window.ELEM&&ELEM.stats&&ELEM.stats.basicNeutral>bn){k=1;aa='Neutral';}LAST={a:aa,k,t:time};}}catch(_){}return r;};}}catch(e){DN.err='resolve '+e.message;}
const CACHE=new Map();
function look(kind,el){const L={size:26,top:'#ffffff',bot:ELC[el]||ELC.none,stroke:'#2b1a0e',pk:1.35,rise:46,suf:'',sufCol:'',life:.85};
  if(kind==='crit')Object.assign(L,{size:32,bot:el==='none'||el==='Neutral'?'#ff3b1a':ELC[el],stroke:'#2e0400',pk:1.6,rise:44,life:1.3});
  else if(kind==='weak')Object.assign(L,{size:30,suf:'▲',sufCol:ELC[el]||'#ff7a3a'});
  else if(kind==='resist')Object.assign(L,{size:21,top:'#e4e4e4',bot:'#9a9a9a',suf:'▼',sufCol:'#bdbdbd',stroke:'#2a2a2a'});
  else if(kind==='sub')Object.assign(L,{size:20,pk:1.15,rise:30,life:.7});
  else if(kind==='heal')Object.assign(L,{top:'#f4ffd0',bot:'#7fdc3a',stroke:'#173d0c',rise:40,life:1.1});
  else if(kind==='hurt')Object.assign(L,{size:22,top:'#ffd0d6',bot:'#ff3d5a',stroke:'#3d0610',rise:-18,life:.8});
  else if(kind==='miss')Object.assign(L,{size:19,top:'#f0f0f0',bot:'#a8a8a8',stroke:'#333333',rise:26,life:.7});
  return L;}
const SC=2;   // cache resolution (pop goes to 1.6x)
function img(txt,kind,el){const key=kind+'|'+el+'|'+txt;let c=CACHE.get(key);if(c)return c;const L=look(kind,el),s=L.size;
  const g0=document.createElement('canvas').getContext('2d');g0.font=s+'px '+FAM;const w=g0.measureText(txt).width;
  const pad=s*.6,W=Math.ceil((w+pad*2+(L.suf?s*.7:0))*SC),Hh=Math.ceil(s*(kind==='crit'?2.0:1.5)*SC);
  c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');g.scale(SC,SC);
  const bx=W/SC/2,by=Hh/SC-s*.3;g.translate(bx,by);c.ax=bx;c.ay=by;
  g.textAlign='center';g.textBaseline='alphabetic';g.lineJoin='round';
  if(kind==='crit'){g.font=(s*.36)+'px '+FAM;g.lineWidth=s*.11;g.strokeStyle='#2e0400';const ly=-s*1.02;g.strokeText('CRITICAL!',0,ly);g.fillStyle='#ffe14a';g.fillText('CRITICAL!',0,ly);}
  g.font=s+'px '+FAM;const ox=L.suf?-s*.25:0;
  if(kind==='miss')g.transform(1,0,-.2,1,0,0);
  g.lineWidth=s*.22;g.strokeStyle='rgba(0,0,0,.35)';g.strokeText(txt,ox+1.5,2.5);
  if(kind==='crit'){g.lineWidth=s*.42;g.strokeStyle='#ffd23a';g.strokeText(txt,ox,0);}
  g.lineWidth=s*.2;g.strokeStyle=L.stroke;g.strokeText(txt,ox,0);
  const gr=g.createLinearGradient(0,-s*.8,0,0);gr.addColorStop(0,L.top);if(kind==='crit'){gr.addColorStop(.35,'#fff27a');gr.addColorStop(.6,'#ffb020');}else gr.addColorStop(.45,L.top);gr.addColorStop(1,L.bot);g.fillStyle=gr;g.fillText(txt,ox,0);
  if(L.suf){g.font=(s*.55)+'px '+FAM;g.textAlign='left';g.lineWidth=s*.12;g.strokeStyle=L.stroke;const sx=ox+w/2+2,sy=-s*.38;g.strokeText(L.suf,sx,sy);g.fillStyle=L.sufCol;g.fillText(L.suf,sx,sy);}
  if(DN.font){CACHE.set(key,c);DN.stats.cache++;if(CACHE.size>240){const k0=CACHE.keys().next().value;CACHE.delete(k0);}}
  return c;}
const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
function pop(a,k){if(a<.07)return .3+(k-.3)*(a/.07);if(a<.16)return k+(1-k)*((a-.07)/.09);return 1;}
function add(o){const L=look(o.kind,o.el);let k=0;for(const n of DN.list){if(n.age<.5&&(o.tgt?n.tgt===o.tgt:Math.abs(n.x-o.x)<40&&Math.abs(n.y-o.y)<40))k++;}
  const st=Math.min(k,3);DN.list.push(Object.assign({age:0,life:L.life,L,dx:(k%2?1:-1)*st*10+(Math.random()*8-4),lift:st*15},o));DN.stats[o.kind]=(DN.stats[o.kind]||0)+1;
  if(DN.list.length>DN.stats.peak)DN.stats.peak=DN.list.length;if(DN.list.length>160)DN.list.shift();}
DN.add=add;
const parseN=s=>{const m=String(s).replace(/[✦+\-,\s]/g,'').match(/^([\d.]+)([kKmM]?)$/);if(!m)return null;return +m[1]*(m[2]==='k'||m[2]==='K'?1e3:m[2]==='m'||m[2]==='M'?1e6:1);};
const fm=v=>{try{return fmt(v);}catch(_){return String(Math.round(v));}};
const _t=textAt;textAt=function(x,y,txt,col,size,o){try{
  if(typeof txt==='string'){const C=window.C182,ev=C&&C.dmgEvt;
    if(ev&&(txt===fm(ev.d)||txt==='✦'+fm(ev.d))){let el='none',kind=ev.crit||txt[0]==='✦'?'crit':ev.sub?'sub':'hit';
      const R=LAST&&time-LAST.t<.05?LAST:null;if(R&&R.a&&R.a!=='Neutral')el=R.a;else if(col&&OLDC[String(col).toLowerCase()])el=OLDC[String(col).toLowerCase()];
      if(kind==='hit'&&R){if(R.k>1)kind='weak';else if(R.k<1)kind='resist';}
      if(ev.d>CAP)DN.stats.capped++;add({x,y,v:ev.d,txt:F(ev.d),kind,el,tgt:ev.e});LAST=null;return;}
    if(txt==='แพ้ทาง!'||txt==='ต้านทาน')return;   // the ▲ / ▼ on the number replace these labels
    if(txt==='MISS'){add({x,y,txt:'MISS',kind:'miss',el:'none'});return;}
    if(P&&Math.abs(x-P.x)<1){
      if(col==='#8dffc8'&&/^\+[\d.,]+[kKmM]?$/.test(txt)){const v=parseN(txt);if(v!=null){add({x,y,v,txt:'+'+F(v),kind:'heal',el:'none',tgt:'hero'});return;}}
      if(col==='#ff6b8b'&&/^[\d.,]+[kKmM]?$/.test(txt)){const v=parseN(txt);if(v!=null){add({x:x+10,y,v,txt:'-'+F(v),kind:'hurt',el:'none',tgt:'hurt'});return;}}}}
  }catch(e){DN.err='text '+e.message;}
  return _t.apply(this,arguments);};
let lastT=null;
const _d=drawTexts;drawTexts=function(){const r=_d.apply(this,arguments);try{const now=time,dt=lastT==null?0:Math.max(0,Math.min(.1,now-lastT));lastT=now;
  for(const n of DN.list)n.age+=dt;DN.list=DN.list.filter(n=>n.age<n.life);
  for(const n of DN.list){const L=n.L,a=n.age,p=Math.min(a/n.life,1),alpha=p>.72?1-(p-.72)/.28:1;if(alpha<=0)continue;
    const pe=n.kind==='crit'?Math.max(0,(a-.3)/(n.life-.3)):p,shake=n.kind==='crit'&&a<.22?(.22-a)*30:0,x=n.x+n.dx+(shake?Math.random()*2*shake-shake:0),y=n.y-n.lift-ease(pe)*L.rise,s=pop(a,L.pk);
    bb(n.x,n.y,()=>{ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(s,s);
      if(n.kind==='crit'){const sz=L.size,cy=-sz*.36;ctx.globalCompositeOperation='source-over';
        if(a<.35){const q=a/.35;ctx.strokeStyle='rgba(255,240,180,'+(1-q)+')';ctx.lineWidth=sz*.12*(1-q)+1;ctx.beginPath();ctx.arc(0,cy,sz*(.6+q*1.6),0,6.283);ctx.stroke();}
        const rr=sz*1.25*(1+.12*Math.sin(a*22)),g=ctx.createRadialGradient(0,cy,0,0,cy,rr);g.addColorStop(0,'rgba(255,255,230,.95)');g.addColorStop(.4,'rgba(255,200,60,.75)');g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.beginPath();
        for(let i=0;i<24;i++){const an=i*Math.PI/12+a*1.5,q=i%2?rr*.38:rr*(i%4?.85:1.15);ctx.lineTo(Math.cos(an)*q*1.35,cy+Math.sin(an)*q);}ctx.fill();}
      const c=img(n.txt,n.kind,n.el);ctx.drawImage(c,-c.ax,-c.ay,c.width/SC,c.height/SC);ctx.restore();});}
  ctx.globalAlpha=1;}catch(e){DN.err='draw '+e.message;}return r;};
}catch(e){DN.err=e.message;}})();

