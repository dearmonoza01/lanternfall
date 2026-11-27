
/* ---- cards-r1 (TEST, 12 Nov 2026): monster cards, frame A (Art, DeaRz 11 Nov 14:10) ----
   * 36 cards, one per LIVE monster; each is matched to the game's monster entry by name / slug (MOBS key or name, parentheses ignored) - the list of matched / unmatched monsters is window.__CARDS.report;
   * the old card_* items stay deprecated (mobclean); no card items exist for the live monsters yet, so each card gets ONE new collectible item mcard_<slug> (k:'card', newCard:1, no stat effect, no drop, not insertable, no sell value) - Balance can later replace it with the real card ids;
   * inventory: the item icon is the small framed card (72 px); clicking a card in the bag opens the big card view (framed, 540 px) instead of the Master Smith hint;
   * monster book (wiki): a matched monster's page shows its framed card; click = big view;
   * GM (?gm=on): "Cards TEST" button puts all 36 cards in the bag; window.__CARDS.give(). ?cards=off disables. ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]cards=off\b/.test(Q),D=window.__MCARDS;
const CD=window.__CARDS={ver:'cards-r1',on:!OFF,err:null,report:{matched:[],unmatched:[]},items:{}};
if(OFF||!D)return;
/* r85 (DeaRz 14 Nov 11:12): every card shown as an ITEM icon (bag, storage, loot, socket list ...) shows the CARD BACK; the big card view / monster book still show the face (c.framed). No card-back art exists yet,
   so the back is drawn in code (dark navy, double gold border, lantern emblem; boss cards get an orange border so the grade still reads) - Art can replace backSrc(). c.iconFace keeps the original face icon. ?cardback=off = faces as before. */
const BKART={n:'assets/7cba1c609dc090ef.webp',b:'assets/37b4d99e1a21696f.webp'};   /* Art card_back_r1 (DeaRz 14 Nov 15:06): normal gold + boss bronze back, fitted and centred in a 192x192 transparent box (aspect kept) */
const BACKON=!/[?&]cardback=off\b/.test(Q);const BK={};
function backSrc(c){const key=c&&c.boss?'b':'n';if(BKART[key])return BKART[key];if(BK[key])return BK[key];
  const W=144,H=224,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),T=c&&c.boss?['#ffb347','#a8561c','#ffe0b0']:['#ffd36b','#8a6a1e','#fff1bf'];
  const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
  rr(1,1,W-2,H-2,12);const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#20336a');bg.addColorStop(.5,'#101c44');bg.addColorStop(1,'#0a1030');g.fillStyle=bg;g.fill();
  g.save();rr(1,1,W-2,H-2,12);g.clip();g.strokeStyle='rgba(255,211,107,.10)';g.lineWidth=1;for(let i=-H;i<W+H;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();g.beginPath();g.moveTo(i+H,0);g.lineTo(i,H);g.stroke()}
  const vg=g.createRadialGradient(W/2,H/2,10,W/2,H/2,H*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,10,.55)');g.fillStyle=vg;g.fillRect(0,0,W,H);g.restore();
  rr(1.5,1.5,W-3,H-3,12);g.lineWidth=5;const bd=g.createLinearGradient(0,0,W,H);bd.addColorStop(0,T[0]);bd.addColorStop(.5,T[1]);bd.addColorStop(1,T[0]);g.strokeStyle=bd;g.stroke();
  rr(8,8,W-16,H-16,8);g.lineWidth=1.5;g.strokeStyle=T[2];g.globalAlpha=.8;g.stroke();g.globalAlpha=1;rr(12,12,W-24,H-24,6);g.lineWidth=1;g.strokeStyle=T[0];g.globalAlpha=.45;g.stroke();g.globalAlpha=1;
  for(const [x,y] of [[16,16],[W-16,16],[16,H-16],[W-16,H-16]]){g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillStyle=T[0];g.fillRect(-4,-4,8,8);g.strokeStyle='#0a1030';g.lineWidth=1;g.strokeRect(-4,-4,8,8);g.restore()}
  const cx0=W/2,cy0=H/2+2;
  const halo=g.createRadialGradient(cx0,cy0,2,cx0,cy0,62);halo.addColorStop(0,'rgba(255,200,90,.55)');halo.addColorStop(1,'rgba(255,160,40,0)');g.fillStyle=halo;g.beginPath();g.arc(cx0,cy0,62,0,6.283);g.fill();
  g.lineWidth=2.5;g.strokeStyle=T[0];g.fillStyle=T[1];
  g.beginPath();g.arc(cx0,cy0-52,6,0,6.283);g.stroke();g.beginPath();g.moveTo(cx0,cy0-46);g.lineTo(cx0,cy0-38);g.stroke();
  g.beginPath();g.moveTo(cx0-18,cy0-30);g.quadraticCurveTo(cx0,cy0-46,cx0+18,cy0-30);g.closePath();g.fill();g.stroke();
  const lg=g.createLinearGradient(0,cy0-30,0,cy0+30);lg.addColorStop(0,'#ffe9a8');lg.addColorStop(.5,'#ffb43c');lg.addColorStop(1,'#d86a14');rr(cx0-17,cy0-30,34,58,7);g.fillStyle=lg;g.fill();g.stroke();
  g.lineWidth=2;g.beginPath();g.moveTo(cx0-6,cy0-30);g.lineTo(cx0-6,cy0+28);g.moveTo(cx0+6,cy0-30);g.lineTo(cx0+6,cy0+28);g.moveTo(cx0-17,cy0-4);g.lineTo(cx0+17,cy0-4);g.stroke();
  g.fillStyle='#fff6d0';g.beginPath();g.moveTo(cx0,cy0-20);g.quadraticCurveTo(cx0+9,cy0-4,cx0,cy0+14);g.quadraticCurveTo(cx0-9,cy0-4,cx0,cy0-20);g.fill();
  g.fillStyle=T[1];g.strokeStyle=T[0];g.lineWidth=2.5;g.beginPath();g.moveTo(cx0-19,cy0+28);g.lineTo(cx0+19,cy0+28);g.lineTo(cx0+14,cy0+38);g.lineTo(cx0-14,cy0+38);g.closePath();g.fill();g.stroke();
  g.fillStyle=T[0];g.beginPath();g.moveTo(cx0,cy0+52);g.lineTo(cx0+5,cy0+60);g.lineTo(cx0,cy0+68);g.lineTo(cx0-5,cy0+60);g.closePath();g.fill();
  return BK[key]=cv.toDataURL('image/png')}
window.__CARDS.backSrc=backSrc;window.__CARDS.back=BACKON;
/* r88 (DeaRz 14 Nov 15:43: "the card face looks a little stretched"): the small FACE icons of the cards (c.icon / c.iconFace) are 0.64 : 1 art that the item boxes draw into SQUARE boxes (fill) = stretched. They are re-made once as a square 192x192 transparent box with the art fitted and centred (aspect kept). ?cardfit=off = the old stretched icons. */
const CARDFIT=!/[?&]cardfit=off\b/.test(Q);
function sqFace(c,field){try{if(!CARDFIT||!c||!c[field]||c['_sq_'+field])return;c['_sq_'+field]=1;const im=new Image();im.onload=()=>{try{if(Math.abs(im.naturalWidth/im.naturalHeight-1)<0.03)return;const S=192,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');g.imageSmoothingQuality='high';const sc=Math.min(S/im.naturalWidth,S/im.naturalHeight),w=Math.round(im.naturalWidth*sc),h=Math.round(im.naturalHeight*sc);g.drawImage(im,(S-w)>>1,(S-h)>>1,w,h);c[field]=cv.toDataURL('image/webp',.92);c['_sqd_'+field]=[im.naturalWidth,im.naturalHeight]}catch(e){ERR('sqface',e)}};im.src=c[field]}catch(e){ERR('sqface',e)}}
window.__CARDS.sqFace=sqFace;
const ERR=(w,e)=>{CD.err=w+': '+((e&&e.message)||e);try{console.error('[CARDS]',w,e)}catch(_){}};
const norm=s=>String(s||'').replace(/\([^)]*\)/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const BYN={};for(const c of D.cards){BYN[norm(c.monster)]=c;BYN[norm(c.slug)]=c}
function mobFor(c){const nm=norm(c.monster),sg=norm(c.slug);let hit=null;for(const k in MOBS){const m=MOBS[k];if(!m||m.retired||/^(gb_|ge_|gp_)/.test(k))continue;if(norm(k)===nm||norm(k)===sg||norm(m.n)===nm){hit=k;if(!/^(devdummy|c182|m10ref)/.test(k))break}}return hit}
function build(){CD.report.matched=[];CD.report.unmatched=[];for(const c of D.cards){const mob=mobFor(c),id='mcard_'+c.slug;c.mob=mob;c.id=id;if(ITEMS[id]&&mob)ITEMS[id].mob=mob;
    if(!ITEMS[id])ITEMS[id]={n:'การ์ด '+c.monster,d:'การ์ดสะสมมอนสเตอร์ '+c.monster+(c.boss?' (บอส)':'')+' · เก็บสะสมเท่านั้น (ยังไม่มีเอฟเฟกต์) · กดเพื่อดูการ์ด',k:'card',col:c.boss?'#ffb347':'#ffd36b',mob:mob||undefined,newCard:1,card2:1,sell:0,price:0,noSell:1,c1q:1};
    CD.items[id]=c;if(BACKON&&!c.iconFace){c.iconFace=c.icon;c.icon=backSrc(c);sqFace(c,'iconFace')}else if(!BACKON)sqFace(c,'icon');(mob?CD.report.matched:CD.report.unmatched).push(mob?{monster:c.monster,slug:c.slug,mob,item:id}:{monster:c.monster,slug:c.slug,why:'no MOBS entry with this name / slug'})}
  CD.report.counts={cards:D.cards.length,matched:CD.report.matched.length,unmatched:CD.report.unmatched.length}}
try{build()}catch(e){ERR('build',e)}
/* the Map 4+ species (Puffcap, Stone Boar, Mossback ...) are installed into MOBS only when their map is first loaded: match again every 4 s until all 36 are matched */
setInterval(()=>{try{if(CD.report.unmatched.length)build()}catch(e){ERR('rematch',e)}},4000);
/* ---- inventory icon ---- */
try{const _i=itemIcon;itemIcon=function(it){try{if(it&&it.id&&CD.items[it.id])return CD.items[it.id].icon}catch(_){}return _i.apply(this,arguments)}}catch(e){ERR('hook icon',e)}
/* ---- big card view ---- */
let ov=null;
function view(c){try{if(!ov){ov=document.createElement('div');ov.id='mcardView';ov.style.cssText='position:fixed;inset:0;z-index:9000;background:rgba(4,8,18,.86);display:none;align-items:center;justify-content:center;flex-direction:column;gap:8px;cursor:pointer';ov.addEventListener('click',()=>{ov.style.display='none'});document.body.appendChild(ov)}
  ov.innerHTML='';const im=new Image();im.src=c.framed;im.style.cssText='max-height:86vh;max-width:92vw;object-fit:contain;filter:drop-shadow(0 6px 24px rgba(0,0,0,.7))';const cap=document.createElement('div');cap.textContent=c.monster+(c.boss?' · BOSS':'');cap.style.cssText='color:#ffe9b0;font:700 14px system-ui,sans-serif';ov.append(im,cap);try{if(window.__ITEMINFO&&__ITEMINFO.cardEl){im.style.maxHeight='54vh';ov.append(__ITEMINFO.cardEl(c))}}catch(_){}ov.style.display='flex';CD.lastView=c.slug}catch(e){ERR('view',e)}}
CD.view=view;
/* bag click -> card view (capture: before the game's own 'use at Master Smith' hint) */
document.addEventListener('click',e=>{try{const cell=e.target&&e.target.closest&&e.target.closest('.cell[data-inv]');if(!cell)return;const it=P.inv[+cell.dataset.inv];if(it&&it.id&&CD.items[it.id]){e.stopPropagation();e.preventDefault();view(CD.items[it.id])}}catch(er){ERR('bag',er)}},true);
/* ---- monster book: card on the monster's page ---- */
let wt=0;
function wikiCard(){try{if(!document.getElementById('wikiOv')||document.getElementById('wikiOv').hidden)return;const h=document.querySelector('.wkH h3');if(!h)return;const body=h.closest('.wkH');if(!body||body.parentElement.querySelector('.mcardImg'))return;
  const nm=norm(h.textContent.replace(/NEW$/,''));const c=BYN[nm];if(!c)return;const im=new Image();im.className='mcardImg';im.src=c.framed;im.title=c.monster;im.style.cssText='float:right;width:150px;margin:0 0 8px 12px;border-radius:8px;cursor:pointer;filter:drop-shadow(0 3px 8px rgba(0,0,0,.6))';im.addEventListener('click',ev=>{ev.stopPropagation();view(c)});body.after(im);CD.wikiShown=(CD.wikiShown||0)+1}catch(e){ERR('wiki',e)}}
CD.wikiCard=wikiCard;setInterval(wikiCard,600);try{new MutationObserver(()=>{clearTimeout(wt);wt=setTimeout(wikiCard,250)}).observe(document.body,{childList:true,subtree:true})}catch(e){ERR('observer',e)}
/* ---- GM ---- */
CD.give=()=>{let n=0;for(const c of D.cards){if(!P.inv.find(x=>x&&x.id===c.id)){if((window.QBAG222?QBAG222.used(P):P.inv.length)>=P.invSize)P.invSize=P.inv.length+1;addItem({id:c.id,q:1});n++}}try{if(G.win==='wInv')renderInv()}catch(_){}return n};
if(/[?&]gm=on\b/.test(Q)){const add=()=>{try{if(document.getElementById('cardsBtn'))return;const b=document.createElement('button');b.id='cardsBtn';b.textContent='Cards TEST';b.style.cssText='position:fixed;left:8px;top:270px;z-index:8000;padding:7px 12px;border-radius:10px;border:1px solid #ffd36b;background:rgba(60,44,10,.92);color:#ffe9b0;font:700 14px system-ui,sans-serif;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();CD.give()});document.body.appendChild(b)}catch(e){ERR('btn',e)}};if(document.body)add();else document.addEventListener('DOMContentLoaded',add);setTimeout(add,1500)}
console.info('[CARDS] '+CD.report.counts.matched+'/'+D.cards.length+' matched');
})();
