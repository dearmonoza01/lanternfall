
/* ---- r268 FISHART268 (TEST ONLY). DeaRz 27 Nov 01:49 UTC "ปลามีไอค่อนแล้วไม่ใช่หรอ แล้วก็ตัวปลาที่ว่ายในน้ำด้วยนำเข้าเกมด้วยนะ", 01:54 "ปลาที่ไม่มีใน art เอาออกได้เลย".
   Art pack fishart_r1 (MD5 d941ecf0ad6edb18390a5850ee03fa82): the game's fish = Art's approved 22 (FS01..FS22, names / tiers from icons/manifest.json).
   - Chances: the rod roll (r197, BASE uncommon 25 %, rare 6 %, very rare 1.5 %, shiny 1 % = Balance r1.6) picks the tier; inside a tier every fish has the same weight
     (r1.6: rare 1.2 % each of 5, very rare 0.3 % each of 5; the Balance file gives no per-fish split for commons / uncommons, so they are equal too).
     Sell: common 1, uncommon 2, rare 6, very rare 20 G; shiny x5 (approved r1.0 / r1.2 / r1.3). Statuses, minigame, tokens: unchanged game rules by tier.
   - FS13 keeps the id goldDragonKoi and FS16 cloudDragon (their approved code VFX stay); the other 20 are new ids fs01..fs22 / items fish_fs01..fish_fs22 (+ _s shiny).
   - Removed (no Art): pondCarp, mudLoach, reedMinnow, lanternGuppy, silverPerch, mistEel, skyKoi, goldenLanternfish. Old saves: every such fish (bag, house storage,
     tank, catch log) becomes the Art fish of the same tier: carp->FS03, loach->FS08, minnow->FS01, lanternGuppy->FS02, silverPerch->FS09, mistEel->FS10,
     skyKoi->FS11, goldenLanternfish->FS14; shiny, statuses, quantity and tank state are kept.
   - Pictures: Art icon in the catch card, bag, tooltip, shop sell list, cooking lists (itemIcon + ITEMS[id].icon). Tank: Art swim frames (swim8; DeaRz's swim16 for
     FS10/13/16/17/18/19; 32-frame 8x4 atlas for FS20-22), drawn at 0.62 of the frame like Art's demo, 1 loop per second, hard frame switch (no crossfade),
     instant flip (the tank's own mirror), never upscaled, no outline. Swim sheets are loaded only when the tank view opens (until then the icon is drawn).
   Off: ?fishart=off (old 10 fish with code pictures; converted saves stay converted). Debug: window.FISHART268 ---- */
(function(){'use strict';
const Q=String(location.search);
const X=window.FISHART268={ver:'fishart-r268c',on:!/[?&]fishart=off\b/.test(Q),err:null,conv:{items:0,tank:0,seen:0},loaded:0,icons:{}};
if(!X.on)return;
const ERR=(w,e)=>{X.err=w+': '+((e&&e.message)||e);try{console.warn('[FISHART268]',w,e)}catch(_){}};
const ART=[{c:'FS01',id:'fs01',item:'fish_fs01',n:'ปลาเมฆขาว',r:'common',fw:167,fh:104,nf:8,num:1,icon:'assets/b7935c6e44b1463e.png',swim:'assets/9f766e57b268e736.png'},
{c:'FS02',id:'fs02',item:'fish_fs02',n:'ปลาโคมไฟ',r:'common',fw:171,fh:112,nf:8,num:2,icon:'assets/796b21fa7e61ab80.png',swim:'assets/e6a9c33fa57f227d.png'},
{c:'FS03',id:'fs03',item:'fish_fs03',n:'ปลาคาร์พหมอก',r:'common',fw:170,fh:114,nf:8,num:3,icon:'assets/ca08b966047e78ff.png',swim:'assets/0572f0011b1db140.png'},
{c:'FS04',id:'fs04',item:'fish_fs04',n:'ปลาหางลม',r:'common',fw:166,fh:102,nf:8,num:4,icon:'assets/94fd84faa7c3bdd6.png',swim:'assets/35e461fb3aa95912.png'},
{c:'FS05',id:'fs05',item:'fish_fs05',n:'ปลาการ์ตูนแสงแดด',r:'common',fw:173,fh:120,nf:8,num:5,icon:'assets/288cf3a149e29ebf.png',swim:'assets/bde742d24d67eb63.png'},
{c:'FS06',id:'fs06',item:'fish_fs06',n:'ปลาครีบใบไม้',r:'common',fw:168,fh:113,nf:8,num:6,icon:'assets/b0eb7f39816aef79.png',swim:'assets/2fae994c9c819e93.png'},
{c:'FS07',id:'fs07',item:'fish_fs07',n:'ปลาปักเป้า',r:'common',fw:166,fh:124,nf:8,num:7,icon:'assets/b4c431bb2cca81a3.png',swim:'assets/fb9aa638b9a6c658.png'},
{c:'FS08',id:'fs08',item:'fish_fs08',n:'ปลาลูกศรเงิน',r:'common',fw:167,fh:100,nf:8,num:8,icon:'assets/5b870b290f33e138.png',swim:'assets/427c083a808d42a3.png'},
{c:'FS09',id:'fs09',item:'fish_fs09',n:'คาร์พแก้ว',r:'uncommon',fw:160,fh:97,nf:8,num:9,icon:'assets/27c04c38bc12381b.png',swim:'assets/6be5f92217c9c9fa.png'},
{c:'FS10',id:'fs10',item:'fish_fs10',n:'ปลาไหลดาว',r:'uncommon',fw:362,fh:150,nf:16,num:10,icon:'assets/2de2e5fd9f1e703f.png',swim:'assets/858abc1a24f4a50f.png'},
{c:'FS11',id:'fs11',item:'fish_fs11',n:'ปลาเทวดาจันทร์',r:'uncommon',fw:160,fh:141,nf:8,num:11,icon:'assets/35ef3a7c2f5f2dbc.png',swim:'assets/e6cf58688d6ce6af.png'},
{c:'FS12',id:'fs12',item:'fish_fs12',n:'ปลาหางริบบิ้น',r:'uncommon',fw:160,fh:94,nf:8,num:12,icon:'assets/a285fcd2721f6cbe.png',swim:'assets/ee5cfa7605b9546d.png'},
{c:'FS13',id:'goldDragonKoi',item:'fish_goldDragonKoi',n:'คาร์พมังกรทอง',r:'veryrare',fw:325,fh:212,nf:16,num:13,icon:'assets/18e46d5dac43cc71.png',swim:'assets/542438d739b64908.png'},
{c:'FS14',id:'fs14',item:'fish_fs14',n:'ปลาโคมซากุระ',r:'rare',fw:160,fh:119,nf:8,num:14,icon:'assets/315fce07403505eb.png',swim:'assets/1c90ec2dbb0b2fc0.png'},
{c:'FS15',id:'fs15',item:'fish_fs15',n:'ปลาคริสตัล',r:'rare',fw:160,fh:112,nf:8,num:15,icon:'assets/2b59963e5ad80ec7.png',swim:'assets/99bfb633850b4d21.png'},
{c:'FS16',id:'cloudDragon',item:'fish_cloudDragon',n:'ปลามังกรเมฆ',r:'veryrare',fw:336,fh:174,nf:16,num:16,icon:'assets/1f0d25159c4f142d.png',swim:'assets/c957293f895e91e5.png'},
{c:'FS17',id:'fs17',item:'fish_fs17',n:'ปลาทองกระต่ายจันทร์',r:'rare',fw:173,fh:131,nf:16,num:17,icon:'assets/2d862361a53b2808.png',swim:'assets/003d59e60dd7eb4b.png'},
{c:'FS18',id:'fs18',item:'fish_fs18',n:'ปลาทองเหลืองไขลาน',r:'rare',fw:176,fh:135,nf:16,num:18,icon:'assets/0381060b447fbcf0.png',swim:'assets/9186c9003b945d2d.png'},
{c:'FS19',id:'fs19',item:'fish_fs19',n:'ปลานกยูง',r:'rare',fw:180,fh:132,nf:16,num:19,icon:'assets/deff62cd6b41b98b.png',swim:'assets/62c94a6340bda0cb.png'},
{c:'FS20',id:'fs20',item:'fish_fs20',n:'วาฬดาว',r:'veryrare',fw:358,fh:132,nf:32,num:20,icon:'assets/a0941bca9c9d1c71.png',swim:'assets/90365b5a27785ad5.png'},
{c:'FS21',id:'fs21',item:'fish_fs21',n:'ปลากิเลนหยก',r:'veryrare',fw:351,fh:136,nf:32,num:21,icon:'assets/ef92e38aa9342812.png',swim:'assets/13ed9b4ca728b953.png'},
{c:'FS22',id:'fs22',item:'fish_fs22',n:'คาร์พจิ้งจอกเก้าหาง',r:'veryrare',fw:347,fh:221,nf:32,num:22,icon:'assets/061ada9c30e6fb3f.png',swim:'assets/3f4cd40321aa18a4.png'}];
X.art=ART;
const BYC={},BYID={};for(const a of ART){BYC[a.c]=a;BYID[a.id]=a}
const OLD={pondCarp:'FS03',mudLoach:'FS08',reedMinnow:'FS01',lanternGuppy:'FS02',silverPerch:'FS09',mistEel:'FS10',skyKoi:'FS11',goldenLanternfish:'FS14'};
const OLDITEM={fish_carp:'pondCarp',fish_loach:'mudLoach',fish_minnow:'reedMinnow',fish_lanternGuppy:'lanternGuppy',fish_silverPerch:'silverPerch',fish_mistEel:'mistEel',fish_skyKoi:'skyKoi',fish_goldenLanternfish:'goldenLanternfish'};
const SELL={common:1,uncommon:2,rare:6,veryrare:20};
const COL={common:'#9ab88a',uncommon:'#7ad0ff',rare:'#ffd24a',veryrare:'#ffc23a'};
const FS=window.__FISHING,FT=window.__FISHTANK;
if(!FS||!FS.cfg||!FT||!FT.species){X.err='fishing / tank missing';return}
/* ---- icons ---- */
for(const a of ART){const im=new Image();im.src=a.icon;a.iconImg=im;X.icons[a.item]=a.icon;X.icons[a.item+'_s']=a.icon}
function iconFn(a){return g=>{try{if(a.iconImg.complete&&a.iconImg.naturalWidth)g.drawImage(a.iconImg,0,0,64,64)}catch(_){}}}
/* ---- fish table ---- */
const rar=FS.cfg.rar;
for(const k of Object.keys(OLD)){delete FS.cfg.fish[k];delete FS.cfg.fish[k+'_s']}
for(const a of ART){const sh=a.id+'_s';FS.cfg.fish[a.id]={n:a.n,r:a.r,w:({common:67.5/8,uncommon:25/4,rare:6/5,veryrare:1.5/5})[a.r],sell:SELL[a.r],item:a.item,code:a.c};FS.cfg.fish[sh]={n:a.n+' ไชนี่',r:a.r,w:0,sell:SELL[a.r]*5,item:a.item+'_s',shiny:1,code:a.c}}
FS.fishIds.length=0;for(const k of Object.keys(FS.cfg.fish))FS.fishIds.push(k);try{const FX0=window.__FISHEXTRA;if(FX0&&FX0.cfg){FX0.cfg.vrP=0}}catch(_){}
/* ---- tank species ---- */
const S=0.62;
for(const a of ART){const base={n:a.n,r:a.r,itemId:a.item,kind:'art',code:a.c,len:Math.round(a.fw*S),h:Math.round(a.fh*S),speed:a.num>12?38:a.num>8?48:58,band:a.r==='common'?[.3,.78]:[.22,.7],body:'#ccc',belly:'#eee',fin:'#aaa',mark:'#fff'};
  FT.species[a.id]=Object.assign({},base,{id:a.id});FT.species[a.id+'_s']=Object.assign({},base,{id:a.id+'_s',n:a.n+' ไชนี่',itemId:a.item+'_s',shiny:1,base:a.id})}
const ids=FT.speciesIds.filter(k=>!OLD[k.replace(/_s$/,'')]);for(const a of ART){for(const k of [a.id,a.id+'_s'])if(ids.indexOf(k)<0)ids.push(k)}
FT.speciesIds.length=0;for(const k of ids)FT.speciesIds.push(k);
FT.speciesIds.forEach((k,i)=>{FT.species[k]._ph=i*1.7});
/* swim frames: loaded when the tank view opens */
function loadSwim(){if(X.loaded)return;X.loaded=1;for(const a of ART){const im=new Image();im.src=a.swim;a.swimImg=im}}
X.loadSwim=loadSwim;
function drawer(a){return {draw(g,t,sp,p){try{const L=sp.len,Hh=sp.h,im=a.swimImg;
  if(im&&im.complete&&im.naturalWidth){const nf=a.nf,ph=(p&&p.u!=null?((String(p.u).length*1.37)%nf):(sp._ph||0)),fr=Math.floor(((t||0)*nf+ph))%nf,cols=Math.max(1,Math.round(im.naturalWidth/a.fw));
    g.drawImage(im,(fr%cols)*a.fw,Math.floor(fr/cols)*a.fh,a.fw,a.fh,-L/2,-Hh/2,L,Hh)}
  else if(a.iconImg.complete&&a.iconImg.naturalWidth){const s=Math.min(L,Hh*1.6);g.drawImage(a.iconImg,-s/2,-s/2,s,s)}}catch(e){ERR('draw',e)}}}}
/* FS13 / FS16 keep the r180 sprites (approved code VFX round the body); only their BODY becomes the Art frames (X.body, called from the r268b patch). Shiny = Art + r180 stars. */
X.body=(g,t,sp,p)=>{try{const a=BYID[String(sp&&sp.id||'').replace(/_s$/,'')]||(sp&&sp.code&&BYC[sp.code]);if(!a)return false;drawer(a).draw(g,t,FT.species[a.id]||sp,p);return true}catch(_){return false}};
const FX=window.__FISHEXTRA;
for(const a of ART){if(a.id==='goldDragonKoi'||a.id==='cloudDragon')continue;const d=drawer(a);FT.sprites[a.id]=d;
  FT.sprites[a.id+'_s']={draw(g,t,sp,p){d.draw(g,t,FT.species[a.id],p);try{if(FX&&FX.shinyOver)FX.shinyOver(g,t,FT.species[a.id],p)}catch(_){}}}}
setInterval(()=>{try{if(FT.open)loadSwim()}catch(_){}},400);
/* ---- items ---- */
function regItems(){try{if(typeof ITEMS==='undefined')return;for(const a of ART){const nm=(rar[a.r]&&rar[a.r].name)||a.r;
  for(const [id,sh] of [[a.item,0],[a.item+'_s',1]]){ITEMS[id]=Object.assign(ITEMS[id]||{},{n:a.n+(sh?' ไชนี่':''),d:'ปลาจากการตกปลา ('+nm+(sh?' · ไชนี่':'')+') · ขายได้ที่ร้านค้า หรือใส่ตู้ปลา',k:'mat',col:COL[a.r],icon:iconFn(a),price:0,sell:SELL[a.r]*(sh?5:1),stall:1})}}}catch(e){ERR('items',e)}}
regItems();setTimeout(regItems,1700);setTimeout(regItems,6500);setTimeout(regItems,12000);
try{const _i=itemIcon;itemIcon=function(it){try{if(it&&it.id&&!it.kind&&X.icons[it.id])return X.icons[it.id]}catch(_){}return _i.apply(this,arguments)}}catch(e){ERR('itemIcon',e)}
/* ---- old saves: convert the 8 removed fish ---- */
const newSp=sp=>{const b=String(sp).replace(/_s$/,''),sh=/_s$/.test(sp);if(!OLD[b])return null;const a=BYC[OLD[b]];return a.id+(sh?'_s':'')};
const newItem=id=>{const b=String(id).replace(/_s$/,''),sh=/_s$/.test(id);const sp=OLDITEM[b];if(!sp)return null;const a=BYC[OLD[sp]];return a.item+(sh?'_s':'')};
function walk(o,depth){if(!o||typeof o!=='object'||depth>7)return;if(Array.isArray(o)){for(const x of o)walk(x,depth+1);return}
  if(typeof o.id==='string'&&/^fish_/.test(o.id)){const n=newItem(o.id);if(n){o.id=n;X.conv.items++}}
  if(typeof o.sp==='string'){const n=newSp(o.sp);if(n){o.sp=n;X.conv.tank++}}
  for(const k in o){const v=o[k];if(v&&typeof v==='object')walk(v,depth+1)}}
function convert(){try{if(typeof P==='undefined'||!P||typeof G==='undefined'||G.state!=='play')return;const b0=X.conv.items+X.conv.tank;walk(P.inv,0);for(const k in P){if(k!=='inv'&&Array.isArray(P[k]))walk(P[k],0)}
  try{const H=window.HOUSE;if(H&&H.state)walk(H.state(),0)}catch(_){}
  try{const s=JSON.parse(localStorage.getItem('lf_fishseen199')||'{}'),o={};let ch=0;for(const k in s){const kb=k.replace(/\*$/,''),n=newSp(kb);if(n){o[n+(k.length>kb.length?'*':'')]=1;ch++}else o[k]=s[k]}if(ch){localStorage.setItem('lf_fishseen199',JSON.stringify(o));X.conv.seen+=ch}}catch(_){}
  if(X.conv.items+X.conv.tank>b0){try{const H=window.HOUSE;if(H&&H.save)H.save()}catch(_){}try{if(typeof saveGame==='function')saveGame()}catch(_){}}}catch(e){ERR('convert',e)}}
X.convert=convert;setInterval(convert,2000);try{const _sm=saveMigrate;saveMigrate=function(s){const r=_sm.apply(this,arguments);try{const b0=X.conv.items+X.conv.tank;walk(r,0);X.conv.onLoad=(X.conv.onLoad|0)+(X.conv.items+X.conv.tank-b0)}catch(e){ERR('migrate',e)}return r}}catch(e){ERR('hook migrate',e)}
})();
