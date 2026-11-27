
/* CASH228 r228: Cash Shop with Crystals (💎). ?cashshop=off. TEST: top-up is a FREE placeholder (no real payment yet). All prices are Code placeholders until Balance + DeaRz approve. */
(function(){const X=window.CASH228={on:true,err:null,ver:'r228',log:[]};
try{if(/[?&]cashshop=off/.test(location.search)){X.on=false;return}}catch(e){}
const TABS=[['top','💎 เติมคริสตัล'],['cloth','👕 ชุดแต่งตัว'],['home','🏠 ของแต่งบ้าน'],['pot','🧪 ยา'],['ref','🔨 ตีบวก'],['conv','🎒 ของสะดวก']];
/* top-up packs: crystals (+bonus); baht labels are placeholders, payment is NOT connected */
const PACKS=[[60,0,'฿35'],[300,30,'฿169'],[900,135,'฿499'],[1800,360,'฿999'],[3000,750,'฿1,690']];/* Balance cashshop_v1, approved for now by DeaRz 25 Nov 05:48 UTC */
const SHOP={
 cloth:[{id:'c_soon1',n:'ชุดอัศวินตะเกียง',soon:1,ic:'🛡'},{id:'c_soon2',n:'ชุดนักเดินทางลอยฟ้า',soon:1,ic:'🧥'},{id:'c_soon3',n:'ชุดผจญภัยฤดูหนาว',soon:1,ic:'🧣'}],
 home:[['hangingLanternPost',60],['wovenRug',90],['youngTree',100],['bookshelf',120],['simpleBed',150]].map(([d,c])=>({id:'h_'+d,decor:d,q:1,c})),
 pot:[['hpPot3',10,20],['hpPot4',10,40],['hpPot5',10,60],['mpPot3',10,20],['mpPot4',10,40],['mpPot5',10,60]].map(([i,q,c])=>({id:'p_'+i,item:i,q,c})),
 ref:[['smithGem',5,30,3],['optStone',3,30,3],['smithGemUp',1,40,5],['safeScroll',1,100,1],['luckScroll',1,120,1]].map(([i,q,c,day])=>({id:'r_'+i,item:i,q,c,day})),
 conv:[{id:'v_bag',n:'ขยายกระเป๋า +16 ช่อง',bag:16,c:150,ic:'🎒'}]};
X.SHOP=SHOP;X.PACKS=PACKS;
/* wallet: per character name in localStorage (real money must later live on a server) */
const key=()=>'lf_cash228_'+((window.P&&P.name)||'_');
function bal(){try{return Math.max(0,parseInt(localStorage.getItem(key())||'0',10)||0)}catch(e){return 0}}
function setBal(v){try{localStorage.setItem(key(),String(Math.max(0,Math.floor(v))))}catch(e){X.err='save '+e.message}chip()}
X.bal=bal;X.add=n=>{setBal(bal()+n);return bal()};
const dkey=()=>'lf_cash228d_'+((window.P&&P.name)||'_');
function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function dayRec(){let r=null;try{r=JSON.parse(localStorage.getItem(dkey())||'null')}catch(e){}if(!r||r.d!==today())r={d:today(),n:{}};return r}
function left(it){if(!it.day)return Infinity;return Math.max(0,it.day-(dayRec().n[it.id]||0))}
function useDay(it){if(!it.day)return;const r=dayRec();r.n[it.id]=(r.n[it.id]||0)+1;try{localStorage.setItem(dkey(),JSON.stringify(r))}catch(e){}}
X.left=id=>{for(const k in SHOP)for(const x of SHOP[k])if(x.id===id)return left(x)};
function itemN(id){try{return (ITEMS[id]&&ITEMS[id].n)||id}catch(e){return id}}
function decorN(id){try{return HOUSE.items[id].n}catch(e){return id}}
function decorPng(id){try{const a=window.__HOUSE_DECOR&&__HOUSE_DECOR.items[id];if(!a)return null;let src=a.png;if((!src||src.length<200)&&a.facings){const f=a.facings[a.default]||Object.values(a.facings)[0];src=f&&(f.png||f.src)}return src&&src.length>200?src:null}catch(e){return null}}
function icon(it){try{if(it.decor){const s=decorPng(it.decor);if(s)return `<img src="${s}" alt="" style="object-fit:contain">`}if(it.item)return `<img src="${itemIcon({id:it.item})}" alt="">`}catch(e){}return `<span class="cs228e">${it.ic||(it.decor?'🪑':'🎁')}</span>`}
function name(it){return it.n||(it.item?itemN(it.item):it.decor?decorN(it.decor):it.id)}
function canGive(it){if(it.soon)return 'เร็วๆ นี้';
 if(it.decor){try{if(!HOUSE||!HOUSE.items||!HOUSE.items[it.decor]||typeof HOUSE.storageAdd!=='function')return 'ระบบบ้านยังไม่พร้อม'}catch(e){return 'ระบบบ้านยังไม่พร้อม'}}
 if(it.item){try{if(!ITEMS[it.item])return 'ไม่มีไอเท็มนี้'}catch(e){return 'ไม่มีไอเท็มนี้'}}
 if(it.bag&&P.invSize>=192)return 'กระเป๋าเต็มสุดแล้ว (192)';if(it.day&&left(it)<=0)return 'วันนี้ครบแล้ว';return null}
function give(it){
 if(it.decor)return !!HOUSE.storageAdd(it.decor,it.q||1);
 if(it.item)return !!addItem({id:it.item,q:it.q||1});
 if(it.bag){P.invSize=Math.min(192,P.invSize+it.bag);try{if(G.win==='wInv')renderInv()}catch(_){}return true}
 return false}
function buy(id){let it=null;for(const k in SHOP)for(const x of SHOP[k])if(x.id===id)it=x;if(!it)return 'no item';
 const why=canGive(it);if(why)return why;if(bal()<it.c)return 'คริสตัลไม่พอ';
 const b0=bal();setBal(b0-it.c);let ok=false;try{ok=give(it)}catch(e){X.err='give '+e.message}
 if(!ok){setBal(b0);return 'กระเป๋าเต็ม · คืนคริสตัลแล้ว'}
 useDay(it);X.log.push({t:Date.now(),id,c:it.c});try{if(typeof saveGame==='function')saveGame()}catch(_){}
 try{toast('ซื้อ '+name(it)+(it.q>1?' ×'+it.q:'')+' แล้ว','#bfe8ff')}catch(_){}return true}
X.buy=buy;
function topup(i){const p=PACKS[i];if(!p)return;setBal(bal()+p[0]+p[1]);X.log.push({t:Date.now(),topup:p[0]+p[1]});try{toast('ทดสอบ: ได้ 💎'+(p[0]+p[1])+' (ไม่ได้จ่ายเงินจริง)','#bfe8ff')}catch(_){}}
X.topup=topup;
/* ---------- UI ---------- */
try{const st=document.createElement('style');st.textContent=`
#cCash228{cursor:pointer;pointer-events:auto!important;background:linear-gradient(#2b3f7a,#1a2a58)!important;border-color:#8fd0ff!important;color:#dff4ff!important}
#cs228{position:fixed;inset:0;z-index:9000;background:rgba(4,8,20,.72);display:flex;align-items:center;justify-content:center;padding:10px;box-sizing:border-box}
#cs228[hidden]{display:none}
#cs228 .w{width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;background:linear-gradient(#14224a,#0c1530);border:1px solid rgba(255,215,120,.45);border-radius:16px;color:#e6efff;box-shadow:0 10px 40px rgba(0,0,0,.6);overflow:hidden;font-size:14px}
#cs228 .hd{display:flex;align-items:center;gap:8px;padding:12px 14px 6px}
#cs228 .hd h3{margin:0;flex:1;font-size:18px;color:#ffe08a;letter-spacing:.5px}
#cs228 .bal{background:rgba(120,190,255,.15);border:1px solid #8fd0ff;border-radius:20px;padding:4px 12px;font-weight:bold;color:#cfeeff;white-space:nowrap}
#cs228 .x{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:10px;padding:6px 12px;font:inherit;cursor:pointer}
#cs228 .tb{display:flex;gap:6px;padding:6px 12px 10px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid rgba(255,215,120,.2)}
#cs228 .tb button{flex:0 0 auto;padding:8px 10px;border-radius:10px;border:1px solid rgba(160,200,255,.3);background:rgba(30,50,90,.7);color:#cfe0ff;font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
#cs228 .tb button.on{background:linear-gradient(#ffd77a,#e0a840);color:#2a1a00;border-color:#ffe2a0;font-weight:bold}
#cs228 .bd{overflow-y:auto;padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
#cs228 .cd{background:rgba(255,255,255,.05);border:1px solid rgba(160,200,255,.22);border-radius:12px;padding:10px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
#cs228 .cd img,#cs228 .cs228e{width:44px;height:44px;font-size:34px;line-height:44px;image-rendering:auto}
#cs228 .cd .n{font-weight:bold;min-height:2.4em;display:flex;align-items:center}
#cs228 .cd .q{color:#9fb6dd;font-size:12px}
#cs228 .cd button{width:100%;padding:8px 4px;border-radius:10px;border:1px solid #8fd0ff;background:linear-gradient(#3a6bc0,#22468a);color:#fff;font:inherit;font-weight:bold;cursor:pointer}
#cs228 .cd button.cf{background:linear-gradient(#ffd77a,#e0a840);color:#2a1a00;border-color:#ffe2a0}
#cs228 .cd button:disabled{opacity:.45;cursor:default}
#cs228 .cd.soon{opacity:.6}
#cs228 .note{grid-column:1/-1;font-size:12px;color:#ffd0a0;background:rgba(255,160,60,.1);border:1px solid rgba(255,160,60,.35);border-radius:10px;padding:8px 10px;margin:0}
#cs228 .msg{min-height:1.2em;font-size:12px;color:#ffb4b4}
`;document.head.appendChild(st)}catch(e){X.err='css '+e.message}
let tab='top',armed=null,armT=0;
function card(it){const why=canGive(it),poor=!why&&bal()<it.c;
 return `<div class="cd${it.soon?' soon':''}">${icon(it)}<div class="n">${name(it)}</div><div class="q">${it.q>1?'×'+it.q:it.bag?'+'+it.bag+' ช่อง (สูงสุด 192)':it.decor?'เข้าคลังของแต่งบ้าน':'&nbsp;'}${it.day?`<br><span style="color:#ffd77a">วันนี้ซื้อได้อีก ${left(it)}/${it.day}</span>`:''}</div>
 <button data-buy="${it.id}" ${why?'disabled':''} class="${armed===it.id?'cf':''}">${why?why:armed===it.id?'ยืนยัน 💎'+it.c:'💎 '+it.c}</button><div class="msg" id="cs228m_${it.id}">${poor?'คริสตัลไม่พอ':''}</div></div>`}
function render(){const w=document.getElementById('cs228');if(!w||w.hidden)return;
 w.querySelector('.bal').textContent='💎 '+bal().toLocaleString();
 w.querySelectorAll('.tb button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 const bd=w.querySelector('.bd');
 if(tab==='top')bd.innerHTML=`<p class="note">ทดสอบ: ยังไม่ได้ต่อระบบจ่ายเงินจริง กดแล้วได้คริสตัลฟรี ราคาเงินบาทเป็นตัวอย่าง</p>`+PACKS.map((p,i)=>`<div class="cd"><span class="cs228e">💎</span><div class="n">${p[0].toLocaleString()} คริสตัล</div><div class="q">${p[1]?'แถม +'+p[1]:'&nbsp;'}</div><button data-top="${i}">${p[2]}</button><div class="msg"></div></div>`).join('');
 else bd.innerHTML=(tab==='cloth'?'<p class="note">ชุดแต่งตัวต้องให้ Art วาดก่อน ตอนนี้เป็นช่องตัวอย่าง</p>':'')+(tab==='ref'?'<p class="note">ของตีบวกจำกัดจำนวนต่อวัน รีเซ็ตตอนเที่ยงคืน</p>':'')+SHOP[tab].filter(it=>{try{return !it.item||ITEMS[it.item]}catch(e){return false}}).map(card).join('')}
function open(t){let w=document.getElementById('cs228');if(!w){w=document.createElement('div');w.id='cs228';w.hidden=true;
  w.innerHTML=`<div class="w"><div class="hd"><h3>💎 ร้านคริสตัล</h3><span class="bal"></span><button class="x" type="button">✕</button></div><div class="tb">${TABS.map(([k,n])=>`<button type="button" data-t="${k}">${n}</button>`).join('')}</div><div class="bd"></div></div>`;
  document.body.appendChild(w);
  w.addEventListener('click',e=>{if(e.target===w||e.target.closest('.x')){close();return}
   const tb=e.target.closest('[data-t]');if(tb){tab=tb.dataset.t;armed=null;render();return}
   const tp=e.target.closest('[data-top]');if(tp){topup(+tp.dataset.top);render();return}
   const bb=e.target.closest('[data-buy]');if(bb&&!bb.disabled){const id=bb.dataset.buy;
    if(armed!==id||Date.now()-armT>5000){armed=id;armT=Date.now();render();return}
    armed=null;const r=buy(id);render();if(r!==true){const m=document.getElementById('cs228m_'+id);if(m)m.textContent=r}}});
  ['pointerdown','touchstart','mousedown','wheel'].forEach(ev=>w.addEventListener(ev,e=>e.stopPropagation(),{passive:true}))}
 if(t)tab=t;armed=null;w.hidden=false;X.open_=true;render()}
function close(){const w=document.getElementById('cs228');if(w)w.hidden=true;X.open_=false}
X.open=open;X.close=close;X.render=render;
function chip(){const c=document.getElementById('cCash228');if(c)c.textContent='💎 '+bal().toLocaleString()}
setInterval(()=>{try{const g=document.getElementById('cGold');if(!g)return;let c=document.getElementById('cCash228');
  if(!c){c=document.createElement('span');c.className='chip';c.id='cCash228';c.title='ร้านคริสตัล';g.after(c);c.addEventListener('click',e=>{e.stopPropagation();open()})}
  chip()}catch(e){X.err='chip '+e.message}},800);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&X.open_)close()});
})();

