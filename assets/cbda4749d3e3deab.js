
/* p308 — GM TEST panel (DeaRz 26 Oct 12:46 "ขอโหมด GM เทสทุกสกิล"): floating 🛠 GM button, TEST builds only.
   Level / weapon / skill level / no cooldown / infinite MP+HP / dummy monsters. Touches only the running game, nothing is saved. */
(function(){try{
if(window.__GMT)return;if(!/gm=on/.test(location.search))return;const GT=window.__GMT={on:false,noCd:false,god:false,dummy:false,err:null,pins:[]};
const css=document.createElement('style');css.textContent='#gmtBtn{position:fixed;left:10px;top:372px;z-index:9998;background:#7b1fa2;color:#fff;border:2px solid #e1bee7;border-radius:10px;padding:8px 12px;font:700 14px system-ui;min-height:40px;cursor:pointer;opacity:.92}'
 +'#gmtP{position:fixed;left:10px;top:420px;z-index:9998;width:268px;max-height:54vh;overflow:auto;background:rgba(16,10,28,.96);color:#eee;border:1px solid #a070d0;border-radius:12px;padding:10px;font:13px/1.45 system-ui;display:none}'
 +'#gmtP h4{margin:10px 0 4px;font-size:12px;color:#d9b8ff;letter-spacing:.04em}#gmtP h4:first-child{margin-top:0}'
 +'#gmtP .r{display:flex;flex-wrap:wrap;gap:5px}#gmtP button{font:600 13px system-ui;background:#3b2a58;color:#fff;border:1px solid #7a5aa8;border-radius:8px;padding:7px 10px;min-height:38px;cursor:pointer}#gmtP button.on{background:#2e7d32;border-color:#9ccc65}#gmtP button:active{filter:brightness(1.3)}#gmtP .m{color:#bbb;font-size:12px;min-height:16px}';
document.head.appendChild(css);
const btn=document.createElement('button');btn.id='gmtBtn';btn.type='button';btn.textContent='🛠 GM';
const pan=document.createElement('div');pan.id='gmtP';
const stop=e=>e.stopPropagation();for(const el of [btn,pan])for(const ev of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click','keydown','keyup','wheel'])el.addEventListener(ev,stop);
const msg=t=>{const m=pan.querySelector('.m');if(m)m.textContent=t;};
const safe=(f,n)=>()=>{try{f();}catch(e){GT.err=n+' '+e.message;msg('ผิดพลาด: '+n+' '+e.message);}};
const sec=t=>{const h=document.createElement('h4');h.textContent=t;pan.appendChild(h);const r=document.createElement('div');r.className='r';pan.appendChild(r);return r;};
const add=(r,t,f,tog)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.addEventListener('click',()=>{safe(()=>{const v=f();if(tog)b.classList.toggle('on',!!v);},t)();});r.appendChild(b);return b;};
const live=()=>(typeof enemies!=='undefined'?enemies:[]).filter(e=>e&&!e.dead&&e.hp>0);
const pinDo=()=>{if(!GT.dummy)return;for(const q of GT.pins){const e=q.e;if(!e||e.dead)continue;e.hp=e.maxHp=1e9;e.x=q.x;e.y=q.y;e.vx=e.vy=0;e.sp=0;}};
setInterval(()=>{try{if(typeof P==='undefined'||!P||typeof G==='undefined'||G.state!=='play')return;
  if(GT.noCd){for(const id in P.cds)P.cds[id]=0;P.mp=P.maxMp;}
  if(GT.god){P.hp=P.maxHp;P.mp=P.maxMp;}
  pinDo();}catch(e){GT.err='tick '+e.message;}},80);
let r=sec('ตัวละคร (สกิลปลดล็อกตามเลเวล)');
for(const n of [30,60,100])add(r,'Lv '+n,()=>{P.lvl=n;P.jobLv=Math.max(P.jobLv|0,50);try{recalc();}catch(_){}P.hp=P.maxHp;P.mp=P.maxMp;try{buildBar();}catch(_){}msg('ตั้งเลเวล '+n);});
add(r,'♾ ไม่คูลดาวน์/MP',()=>GT.noCd=!GT.noCd,true);add(r,'🛡 HP ไม่ลด',()=>GT.god=!GT.god,true);
r=sec('อาวุธ');
const wt=()=>P.weapon&&P.weapon.t;
add(r,'⚔ ดาบ',()=>{if(wt()==='staff')STF.toggle();else if(wt()==='bow')BOW.toggle();msg('ถือดาบ');});
add(r,'🏹 ธนู',()=>{if(wt()!=='bow')BOW.toggle();msg('ถือธนู');});
add(r,'🔮 คทา',()=>{if(wt()!=='staff')STF.toggle();msg('ถือคทา');});
r=sec('ระดับสกิลทุกอัน (ดาบ ธนู คทา)');
for(const n of [1,4,5,10])add(r,'Lv '+n,()=>{const S=window.SKLV;if(!S||!S.on){msg('ระบบเลเวลสกิลปิดอยู่');return;}
  const keys=new Set(Object.keys(S.lv));for(const k of ['sk1','sk2','atk3','atk4','atk5','buf3','buf4','buf5','pierce','rain','leap','fan','lantern','focus','wind','poison','weak','stance','fireball','ice','chain','spikes','ult','shield','curse','mana','avatar'])keys.add(k);
  let ok=0;for(const k of keys){try{if(S.set(k,n))ok++;else S.lv[k]=n;}catch(_){S.lv[k]=n;}}try{S.apply();}catch(_){}msg('ตั้งสกิลทั้งหมด Lv '+n+' ('+ok+' ตัวผ่านระบบ, ที่เหลือตั้งตรง)');});
r=sec('มอนเป้า (ตรึงนิ่ง เลือดไม่หมด)');
add(r,'🎯 ดึงมอนมาล้อม',()=>{const L=live().slice(0,8);const lay=[[250,0],[330,40],[170,-50],[310,-60],[200,60],[-120,40],[120,-140],[120,140]];GT.pins=L.map((e,i)=>({e,x:P.x+lay[i][0],y:P.y+lay[i][1]}));GT.dummy=true;pinDo();msg('ตรึงมอน '+L.length+' ตัวรอบตัวละคร (เลือดไม่หมด)');});
add(r,'ปล่อยมอน',()=>{GT.dummy=false;for(const q of GT.pins){if(q.e){q.e.maxHp=Math.min(q.e.maxHp,1e4);q.e.hp=q.e.maxHp;}}GT.pins=[];msg('ปล่อยมอนแล้ว');});
add(r,'🌾 ไปทุ่งสไลม์',()=>{loadZone('cartroad_plains',{x:1300,y:800});msg('ไปทุ่งสไลม์ (cartroad_plains)');});
r=sec('สถานะ');const m=document.createElement('div');m.className='m';pan.appendChild(m);
const keysTip=document.createElement('div');keysTip.className='m';keysTip.textContent='ปุ่มสกิลคทา: J (ไฟร์บอล) · แถบล่างช่อง 1–4 · R ไม้ตาย · มือถือแตะไอคอนบนแถบ';pan.appendChild(keysTip);
btn.addEventListener('click',()=>{GT.on=!GT.on;pan.style.display=GT.on?'block':'none';});
document.body.appendChild(btn);document.body.appendChild(pan);
setInterval(()=>{try{btn.style.display=(typeof G!=='undefined'&&G.state==='play')?'':'none';if(btn.style.display==='none')pan.style.display='none';else pan.style.display=GT.on?'block':'none';}catch(_){}},400);
}catch(e){window.__GMTERR=e.message;}})();

