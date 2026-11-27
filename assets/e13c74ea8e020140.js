
/* ---- r175 fishing (TEST ONLY, owner decisions via coordinator 21 Nov 2026). Base = TEST r174b4. Flag ?fishing=off = no pond item, no fishing, no tank "ใส่ปลา" button (the 8 fish bag items stay registered so a bag that holds fish stays valid; a placed pond is parked in state.pondStash).
   Housing item "fishPond" (บ่อตกปลาในลาน, cat pond, Emma 1,500 G, YARD only, 1 per platform, platform Lv4+ = 2): catalogue entry + DRAW.fishPond come from exact-string patches in the build; limits, shop refusal and the fishing itself are here.
   Fishing: stand next to the pond, F / tap = cast -> random wait 2-6 s -> bite sign, press within 0.9 s (too early = fish scared, too late = fish leaves) -> the rarity/fish is rolled at the bite -> small bar under the hero (needle sweeps left-right, one traversal = 1.1 s / speed, green zone fixed in the middle): common zone 30 % x1.0 2 good presses, uncommon 22 % x1.3 3, rare 15 % x1.6 4; the 3rd miss = the fish escapes (nothing lost). No bait, no cap. A catch goes to the real bag as the item fish_* (sell price in ITEMS[id].sell: the vendor sell tab). Moving, any window, build mode, the tank view, Esc or leaving the yard cancel cleanly.
   Hero pose = placeholder (faces the pond, rod line + bobber drawn by code); FISHING.pose is a separate hook for the Motion poses. All numbers live in FISHING.cfg (one object). Tank: "🐟 ใส่/เอาปลา" button in the tank view (bag -> tank, max 12; tank -> bag).
   GM: FISHING.force = fishId (next roll), FISHING.cfg.waitFixed (seconds), with ?gm=on a "+1 of each fish in the bag" button in the house GM panel. Debug: window.__FISHING ---- */
(function(){'use strict';
const Q=String(location.search),FS=window.__FISHING={ver:'fishing-r175',on:!/[?&]fishing=off\b/.test(Q),gm:/[?&]gm=on\b/.test(Q),err:null,force:null,st:null,stats:{casts:0,bites:0,scared:0,escaped:0,failed:0,cancelled:0,caught:0,bagFull:0,byFish:{},times:[]},last:null,msg:''};
const ERR=(w,e)=>{FS.err=w+': '+((e&&e.message)||e);try{console.error('[FISHING]',w,e)}catch(_){}};
/* ---------------- config: the ONE place for the numbers ---------------- */
FS.cfg={price:1500,waitMin:2,waitMax:6,waitFixed:null,biteWindow:.9,sweepSec:1.1,missesToFail:3,promptR:56,tapR:340,cooldown:.5,
 maxPond:lvl=>(lvl|0)>=4?2:1,
 rar:{common:{name:'สามัญ',col:'#d8e4d0',zone:.30,speed:1.0,need:2},uncommon:{name:'ไม่สามัญ',col:'#7ad0ff',zone:.22,speed:1.3,need:3},rare:{name:'หายาก',col:'#ffd24a',zone:.15,speed:1.6,need:4}},
 /* fish table: weight, sell price (G), night multiplier (game time 19-05), day-only flag; itemId = the bag item (same ids as FISHTANK.species) */
 fish:{pondCarp:{n:'ปลาคาร์ป',r:'common',w:20,sell:1,item:'fish_carp'},mudLoach:{n:'ปลาหมู',r:'common',w:18,sell:1,item:'fish_loach'},reedMinnow:{n:'ปลาซิว',r:'common',w:18,sell:1,item:'fish_minnow'},lanternGuppy:{n:'ปลาหางนกยูงตะเกียง',r:'common',w:14,sell:1,item:'fish_lanternGuppy',night:2},
  silverPerch:{n:'ปลากะพงเงิน',r:'uncommon',w:10,sell:2,item:'fish_silverPerch'},mistEel:{n:'ปลาไหลหมอก',r:'uncommon',w:8,sell:2,item:'fish_mistEel',night:1.5},skyKoi:{n:'ปลาคาร์ปฟ้า',r:'uncommon',w:7,sell:2,item:'fish_skyKoi',dayOnly:1},
  goldenLanternfish:{n:'ปลาตะเกียงทอง',r:'rare',w:5,sell:6,item:'fish_goldenLanternfish',night:2}}};
FS.msgs={yardOnly:'วางบ่อตกปลาได้เฉพาะที่ลานนอกบ้านเท่านั้น',limit:lvl=>'บ่อตกปลามีได้ '+FS.cfg.maxPond(lvl)+' บ่อต่อลาน'+((lvl|0)>=4?'':' (ลานเลเวล 4 ขึ้นไปมีได้ 2 บ่อ)')+' · มีครบแล้ว (วางอยู่หรืออยู่ในคลัง)'};
FS.fishIds=Object.keys(FS.cfg.fish);
FS.byItem=id=>FS.fishIds.find(k=>FS.cfg.fish[k].item===id)||null;
const isNight=h=>h>=19||h<5;
const hourNow=()=>{try{return GTIME.hour()}catch(_){return 12}};
FS.table=h=>{h=h==null?hourNow():h;const n=isNight(h),o={};for(const id of FS.fishIds){const f=FS.cfg.fish[id];let w=f.w;if(f.dayOnly&&n)w=0;else if(f.night&&n)w*=f.night;o[id]=w}return o};
FS.roll=(h,rnd)=>{const t=FS.table(h),ids=FS.fishIds;let sum=0;for(const id of ids)sum+=t[id];let r=(rnd?rnd():Math.random())*sum;for(const id of ids){r-=t[id];if(r<0)return id}return ids[0]};
/* ---------------- bag items (always registered, also with ?fishing=off) ---------------- */
function fishIcon(id){return g=>{try{const FT=window.__FISHTANK,sp=FT&&FT.species&&FT.species[id],spr=FT&&FT.sprites&&FT.sprites[id];g.save();g.translate(32,32);if(sp&&spr){const k=Math.min(46/sp.len,40/(sp.h*1.5),1.4);g.scale(k,k);spr.draw(g,0,sp)}else{g.fillStyle='#e8b020';g.beginPath();g.ellipse(0,0,20,10,0,0,6.2832);g.fill()}g.restore()}catch(_){}}}
const COL={common:'#9ab88a',uncommon:'#7ad0ff',rare:'#ffd24a'};
function regItems(){try{if(typeof ITEMS==='undefined')return false;for(const id of FS.fishIds){const f=FS.cfg.fish[id];ITEMS[f.item]=Object.assign(ITEMS[f.item]||{},{n:f.n,d:'ปลาจากบ่อตกปลาในลาน ('+FS.cfg.rar[f.r].name+') · ขายได้ที่ร้านค้า หรือใส่ตู้ปลา',k:'mat',col:COL[f.r],icon:fishIcon(id),price:0,sell:f.sell,stall:1});ITEMS[f.item].sell=f.sell}return true}catch(e){ERR('items',e);return false}}
regItems();setTimeout(regItems,1500);setTimeout(regItems,6000);
const H=window.HOUSE;
/* parked pond: when the flag is off the build's sanitize (patched) moves placed ponds to state.pondStash and brings them back with the flag on */
if(!FS.on)return;
if(!H||!H.on||!H.build||!H.items||!H.items.fishPond){FS.err='housing/pond item missing';return}
const B=H.build,ZID=H.ZID,IT=H.items,S0=()=>H.state();
/* ---------------- messages ---------------- */
let toastEl=null,toastT=0;
function say(m,bad){FS.msg=m;try{const FT=window.__FISHTANK;if(FT&&FT.say&&FT.ready){FT.say(m,bad);return}}catch(_){}
 try{if(!toastEl){toastEl=document.createElement('div');toastEl.id='fsToast';toastEl.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:100000;max-width:92vw;padding:10px 18px;border-radius:12px;background:rgba(20,14,8,.94);border:1px solid #ffd98a;color:#ffe9b0;font:700 14px/1.4 "Noto Sans Thai",system-ui,sans-serif;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.6);pointer-events:none;display:none';document.body.appendChild(toastEl)}toastEl.textContent=m;toastEl.style.borderColor=bad?'#ff8a8a':'#b8ffd0';toastEl.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.style.display='none'},3000)}catch(_){}
 try{log(m,'g')}catch(_){}}
FS.say=say;
/* ---------------- pond limit (per platform: Lv1-3 = 1, Lv4+ = 2) ---------------- */
const level=()=>{try{return S0().plat.level|0}catch(_){return 1}};
const maxPond=()=>FS.cfg.maxPond(level());
function pondsIn(ignoreUid){let n=0;try{for(const o of (S0().placed||[]))if(o&&o.id==='fishPond'&&o.uid!==ignoreUid)n++}catch(_){}return n}
const ownedPond=()=>pondsIn(null)+((S0().storage&&S0().storage.fishPond)|0);
FS.ponds=()=>({placed:pondsIn(null),stored:(S0().storage&&S0().storage.fishPond)|0,max:maxPond(),level:level()});
{const _c=H.canPlaceAt;H.canPlaceAt=function(x,y,a){try{if(a==='fishPond'){if(H.roomOn)return FS.msgs.yardOnly;if(pondsIn(arguments[3])>=maxPond())return FS.msgs.limit(level())}}catch(e){ERR('canPlace',e)}return _c.apply(this,arguments)}}
{const _s=H.storageAdd;H.storageAdd=function(id,n,quiet){try{if(id==='fishPond'&&n>0){const give=Math.max(0,Math.min(n,maxPond()-ownedPond()));if(give<=0){say(FS.msgs.limit(level()),true);return false}return _s.call(this,id,give,quiet)}}catch(e){ERR('storageAdd',e)}return _s.apply(this,arguments)}}
function wrapShop(){try{const SW=window.__SHOPWIN;if(!SW||SW._fp)return false;SW._fp=1;const o=SW.openNpc;const guard=(b)=>{const f=function(id,price,qty){if(id==='fishPond'){const room=maxPond()-ownedPond();if(room<=0){say(FS.msgs.limit(level()),true);return 0}qty=Math.min(qty|0||1,room)}return b.call(this,id,price,qty)};f._fpw=1;return f};
 SW.openNpc=function(a){try{if(a&&typeof a.buy==='function'&&a.list&&a.list.some(r=>r&&r.id==='fishPond'))a.buy=guard(a.buy)}catch(e){ERR('shop',e)}const r=o.apply(this,arguments);try{if(a&&typeof a.buy==='function'&&!a.buy._fpw&&a.list&&a.list.some(r2=>r2&&r2.id==='fishPond'))a.buy=guard(a.buy)}catch(_){}return r};return true}catch(e){ERR('wrapShop',e);return true}}
if(!wrapShop()){let n=0;const iv=setInterval(()=>{if(wrapShop()||++n>80)clearInterval(iv)},250)}
/* ---------------- pond picture (code placeholder, swappable: FISHING.frames.pond = fn(g,f,d); 176 x 112, footprint centre (88,69)) ---------------- */
const ell=(g,x,y,rx,ry,rot)=>{g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,6.2832)};
FS.frames={pond(g,f,d){g.fillStyle='rgba(0,0,0,.26)';ell(g,88,100,80,9);g.fill();
  const cx=88,cy=67;ell(g,cx,cy+3,82,43);g.fillStyle='#6f6c68';g.fill();
  for(let i=0;i<22;i++){const a=i/22*6.2832,x=cx+Math.cos(a)*74,y=cy+Math.sin(a)*38;g.fillStyle=['#aaa69e','#8e8a84','#bcb8ae'][i%3];ell(g,x,y,11+(i%2)*2,7+(i%3),a*.3);g.fill();g.strokeStyle='rgba(30,28,26,.45)';g.lineWidth=1.3;g.stroke()}
  ell(g,cx,cy,64,31);g.fillStyle='#5c5a56';g.fill();
  const gr=g.createRadialGradient(cx-10,cy-8,4,cx,cy,64);gr.addColorStop(0,'#a8ecf6');gr.addColorStop(.55,'#4fb0d4');gr.addColorStop(1,'#256a96');g.fillStyle=gr;ell(g,cx,cy,60,28);g.fill();
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;g.beginPath();g.ellipse(cx-20,cy-8,16,5,0,3.5,5.6);g.stroke();g.beginPath();g.ellipse(cx+24,cy+8,12,4,0,.2,2.4);g.stroke();
  for(const [x,y,r] of [[cx+30,cy-4,9],[cx-34,cy+6,8],[cx+6,cy+12,7]]){g.fillStyle='#3f9a4a';g.beginPath();g.moveTo(x,y);g.arc(x,y,r,.4,6.0);g.closePath();g.fill();g.strokeStyle='#1f5a2a';g.lineWidth=1;g.stroke()}
  g.fillStyle='#ff9ec0';ell(g,cx+30,cy-6,3.2,2.4);g.fill();g.fillStyle='#fff2a0';ell(g,cx+30,cy-6,1.2,1);g.fill();
  g.strokeStyle='#4a9a3a';g.lineWidth=2.4;for(const x of [18,24,160]){g.beginPath();g.moveTo(x,70);g.quadraticCurveTo(x+4,52,x+1,36);g.stroke()}g.fillStyle='#7a4a22';for(const x of [19,160])g.fillRect(x,33,3,9)}};
window.__FISHING_DRAW=(g,f,d)=>{try{FS.frames.pond(g,f,d)}catch(e){ERR('pond draw',e)}};
/* ---------------- fishing state ---------------- */
const UI='#hBox,#hAct,#hBuildBtn,#houseDown,#houseGm,#gtGm,.mbtn,#bar,#tSkills,#swin,#hStore,#housePrompt,#houseRoomPrompt,#ftPrompt,#ftOv,#hlPick,#fpPrompt,#fsBar,#fsCard';
const css=document.createElement('style');css.textContent='#fpPrompt{position:fixed;left:50%;bottom:calc(296px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:7;display:none;padding:8px 18px;border-radius:999px;background:rgba(20,15,8,.9);border:1px solid #7ad0ff;color:#fff;font-size:13px;cursor:pointer;box-shadow:0 0 18px rgba(120,200,255,.45);white-space:nowrap}#fpPrompt kbd{display:inline-block;min-width:20px;padding:0 6px;margin-right:6px;border-radius:6px;background:#9fe0ff;color:#06202e;font-weight:700;text-align:center}@media (max-height:520px){#fpPrompt{bottom:calc(150px + env(safe-area-inset-bottom,0px))}}'
 +'#fsBar{position:fixed;z-index:30;display:none;left:0;top:0;width:240px;padding:7px 9px 8px;border-radius:12px;background:rgba(14,10,6,.92);border:1px solid #7ad0ff;color:#ffe9b0;font:700 12px/1.3 "Noto Sans Thai",system-ui,sans-serif;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.6);touch-action:manipulation;user-select:none;-webkit-user-select:none;cursor:pointer}#fsBar .t{margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#fsBar .b{position:relative;height:26px;border-radius:13px;background:linear-gradient(#26364a,#14202e);border:1px solid #5a7a9a;overflow:hidden}#fsBar .z{position:absolute;top:0;bottom:0;background:linear-gradient(#5cf08a,#28b85a);opacity:.92;border-left:1px solid #d8ffe4;border-right:1px solid #d8ffe4}#fsBar .n{position:absolute;top:-2px;bottom:-2px;width:4px;margin-left:-2px;background:#fff;box-shadow:0 0 6px #fff,0 0 2px #000;border-radius:2px}#fsBar .p{margin-top:5px;letter-spacing:3px;font-size:13px;min-height:16px}#fsBar.bite{border-color:#ffd24a;box-shadow:0 0 16px rgba(255,210,74,.7)}#fsBar.good .b{box-shadow:0 0 10px #5cf08a}#fsBar.bad .b{box-shadow:0 0 10px #ff6a6a}'
 +'#fsCard{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:31;display:none;min-width:200px;padding:12px 18px;border-radius:14px;background:rgba(18,12,6,.96);border:1px solid #ffd98a;color:#ffe9b0;text-align:center;font:700 14px/1.4 "Noto Sans Thai",system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.65);cursor:pointer}#fsCard canvas{display:block;margin:0 auto 4px;width:64px;height:64px}#fsCard .r{font-size:12px}'
 +'#ftFishBtn{position:absolute;z-index:2;left:140px;top:8px;min-height:40px;padding:0 14px;border-radius:12px;border:1px solid #ffd98a;background:rgba(40,26,12,.92);color:#ffe9b0;font:800 14px system-ui,"Noto Sans Thai",sans-serif;cursor:pointer;touch-action:manipulation}#ftFish{position:absolute;z-index:3;left:10px;top:56px;display:none;flex-direction:column;gap:5px;padding:8px;border-radius:12px;background:rgba(18,12,6,.97);border:1px solid #ffd98a;width:min(360px,calc(100vw - 20px));max-height:calc(100vh - 72px);overflow:auto;color:#ffe9b0;font:700 12px "Noto Sans Thai",system-ui,sans-serif}#ftFish.in{display:flex}#ftFish h4{margin:2px 0 0;font-size:12px;color:#ffd98a}#ftFish .row{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:8px;align-items:center;padding:4px 6px;border-radius:10px;background:rgba(255,255,255,.06)}#ftFish canvas{position:static;inset:auto;width:40px;height:40px;display:block}#ftFish button{position:static;min-height:34px;padding:0 12px;border-radius:9px;border:1px solid #d6b05c;background:#3a2410;color:#ffe9b0;font:700 12px system-ui,"Noto Sans Thai",sans-serif;cursor:pointer;touch-action:manipulation}#ftFish .x{text-align:center;color:#9fb2d8;padding:6px}';document.head.appendChild(css);
const pr=document.createElement('div');pr.id='fpPrompt';pr.innerHTML='<kbd>F</kbd>ตกปลา';document.body.appendChild(pr);
for(const ev of ['pointerdown','mousedown','touchstart'])pr.addEventListener(ev,e=>e.stopPropagation());
pr.addEventListener('click',e=>{e.stopPropagation();FS.cast()});
const bar=document.createElement('div');bar.id='fsBar';bar.innerHTML='<div class="t"></div><div class="b"><div class="z"></div><div class="n"></div></div><div class="p"></div>';document.body.appendChild(bar);
const bT=bar.querySelector('.t'),bB=bar.querySelector('.b'),bZ=bar.querySelector('.z'),bN=bar.querySelector('.n'),bP=bar.querySelector('.p');
for(const ev of ['mousedown','touchstart'])bar.addEventListener(ev,e=>e.stopPropagation());
bar.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();FS.press('tap')});
const card=document.createElement('div');card.id='fsCard';document.body.appendChild(card);for(const ev of ['pointerdown','mousedown','touchstart'])card.addEventListener(ev,e=>e.stopPropagation());card.addEventListener('click',()=>{card.style.display='none'});
let cardT=0;
/* pond helpers */
const pondList=()=>{try{return (S0().placed||[]).filter(o=>o&&o.id==='fishPond')}catch(_){return[]}};
function distTo(o){const d=IT.fishPond,Q=B.poly(d,o.x,o.y,o.f);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of Q){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}const fx=P.x,fy=P.y+10,dx=Math.max(x0-fx,0,fx-x1),dy=Math.max(y0-fy,0,fy-y1);return Math.hypot(dx,dy*1.4)}
function nearestPond(){let best=null,bd=1e9;for(const o of pondList()){const d=distTo(o);if(d<bd){bd=d;best=o}}return best?{o:best,d:bd}:null}
const blocked=()=>{try{const FT=window.__FISHTANK;return (G.zone!==ZID&&!(window.WATERFISH249&&WATERFISH249.zoneOn()))||G.state!=='play'||!P||P.dead||H.busy||B.on||H.roomOn||!!G.win||!!G.interact||(FT&&FT.open)}catch(_){return true}};
FS.nearPond=()=>{try{if(blocked())return null;if(window.WATERFISH249&&WATERFISH249.zoneOn())return WATERFISH249.near();const n=nearestPond();return n&&n.d<FS.cfg.promptR?n.o:null}catch(_){return null}};
/* hero pose hook (placeholder: face the pond; Motion poses plug in here) */
FS.pose={apply(ph,st){try{if(st&&st.bob&&P)P.face=Math.atan2(st.bob.y-(P.y-4),st.bob.x-P.x)}catch(_){}},release(){}};
/* ---------------- state machine ---------------- */
const now=()=>performance.now()/1000;
function setPhase(ph){const st=FS.st;if(!st)return;st.ph=ph;st.t=now();try{FS.pose.apply(ph,st)}catch(_){}}
FS.cast=function(){try{if(FS.st)return false;if(blocked())return false;const o=FS.nearPond();if(!o){say('เดินไปยืนข้างบ่อตกปลาก่อน',true);return false}if(now()<(FS.coolUntil||0))return false;
  const d=IT.fishPond,rx=d.w*.30,ry=d.h*.26,side=(P.y>o.y?1:-1);const bob={x:o.x+(Math.random()-.5)*2*rx*.9,y:o.y+side*ry*(.2+Math.random()*.6)};if(o.wf249){bob.x=o.bx;bob.y=o.by}
  const w=FS.cfg.waitFixed!=null?FS.cfg.waitFixed:FS.cfg.waitMin+Math.random()*(FS.cfg.waitMax-FS.cfg.waitMin);
  FS.st={ph:'wait',t:now(),tCast:now(),uid:o.uid,bob,start:[P.x,P.y],wait:w,sp:null,rar:null,good:0,miss:0,tReel:0,flash:0,flashK:'',last:0};FS.stats.casts++;try{keys.a=keys.d=keys.w=keys.s=false}catch(_){}
  setPhase('wait');return true}catch(e){ERR('cast',e);return false}};
FS.cancel=function(why,silent){const st=FS.st;if(!st)return false;FS.st=null;FS.stats.cancelled++;bar.style.display='none';try{FS.pose.release()}catch(_){}FS.coolUntil=now()+FS.cfg.cooldown;if(!silent)say(why||'เลิกตกปลา');return true};
function endTo(msg,bad,key){FS.st=null;bar.style.display='none';try{FS.pose.release()}catch(_){}FS.coolUntil=now()+FS.cfg.cooldown;if(key)FS.stats[key]++;if(msg)say(msg,bad)}
function startBite(){const st=FS.st;const sp=(FS.force&&FS.cfg.fish[FS.force])?FS.force:FS.roll();FS.force=null;st.sp=sp;st.rar=FS.cfg.fish[sp].r;st.tBite=now();FS.stats.bites++;setPhase('bite')}
function startReel(){const st=FS.st,R=FS.cfg.rar[st.rar];st.ph='reel';st.tReel=now();st.good=0;st.miss=0;st.t=now();bar.classList.remove('bite')}
const needleAt=(st,t)=>{const R=FS.cfg.rar[st.rar];const x=(t-st.tReel)/(FS.cfg.sweepSec/R.speed),p=((x%2)+2)%2;return p<1?p:2-p};
FS.needle=()=>{const st=FS.st;return st&&st.ph==='reel'?needleAt(st,now()):null};
FS.press=function(src){try{const st=FS.st;if(!st)return false;const t=now();
  if(st.ph==='wait'){FS.stats.scared++;endTo('ดึงเร็วเกินไป ปลาตกใจหนีไปแล้ว',true);return true}
  if(st.ph==='bite'){if(t-st.tBite<=FS.cfg.biteWindow){startReel();return true}return true}
  if(st.ph==='reel'){if(t-st.last<.18)return true;st.last=t;const R=FS.cfg.rar[st.rar],u=needleAt(st,t),good=Math.abs(u-.5)<=R.zone/2;
   if(good){st.good++;st.flash=t;st.flashK='good';if(st.good>=R.need){finish();return true}}else{st.miss++;st.flash=t;st.flashK='bad';if(st.miss>=FS.cfg.missesToFail){FS.stats.failed++;endTo('ปลาหลุดไปแล้ว… (พลาดครบ '+FS.cfg.missesToFail+' ครั้ง)',true);return true}}return true}
  return false}catch(e){ERR('press',e);return false}};
function finish(){const st=FS.st,sp=st.sp,f=FS.cfg.fish[sp],secs=now()-st.tCast;FS.stats.caught++;FS.stats.byFish[sp]=(FS.stats.byFish[sp]|0)+1;FS.stats.times.push(+secs.toFixed(2));
 let into=true;try{into=addItem((window.__F183&&__F183.fishItem)?__F183.fishItem(sp,f):{id:f.item,q:1})!==false}catch(e){into=false;ERR('addItem',e)}if(!into)FS.stats.bagFull++;FS.last={fish:sp,rar:f.r,bag:into,secs:+secs.toFixed(2),t:Date.now()};
 FS.st=null;bar.style.display='none';try{FS.pose.release()}catch(_){}FS.coolUntil=now()+FS.cfg.cooldown;showCard(sp,into)}
function showCard(sp,into){const f=FS.cfg.fish[sp],R=FS.cfg.rar[f.r];card.innerHTML='<canvas width="64" height="64"></canvas><div>'+f.n+'</div><div class="r" style="color:'+R.col+'">'+R.name+' · ขาย '+f.sell+' G</div><div class="r">'+(into?'ใส่กระเป๋าแล้ว':'กระเป๋าเต็ม · ปล่อยปลากลับน้ำ')+'</div>';try{fishIcon(sp)(card.querySelector('canvas').getContext('2d'))}catch(_){}card.style.display='block';card.style.borderColor=into?'#ffd98a':'#ff8a8a';try{window.__FISHEXTRA&&__FISHEXTRA.cardFx&&__FISHEXTRA.cardFx(sp,card)}catch(_){}clearTimeout(cardT);cardT=setTimeout(()=>{card.style.display='none'},3200);if(!into)say('กระเป๋าเต็ม · ปลาถูกปล่อยกลับน้ำ',true)}
/* ---------------- per-frame tick (inside the game's update) ---------------- */
function place(){const st=FS.st;if(!st)return;const s=w2s(P.x,P.y+10),W=Math.min(240,innerWidth-24);bar.style.width=W+'px';let x=s[0]-W/2,y=s[1]+22;x=Math.max(8,Math.min(innerWidth-W-8,x));const bh=bar.offsetHeight||70,lim=innerHeight<520?innerHeight-bh-92:innerHeight-bh-170;y=Math.max(76,Math.min(lim,y));bar.style.left=Math.round(x)+'px';bar.style.top=Math.round(y)+'px'}
function tick(){const st=FS.st;const near=FS.cfg&&!st?FS.nearPond():null;const pv=near?'block':'none';if(pr.style.display!==pv)pr.style.display=pv;
 if(!st){if(bar.style.display!=='none')bar.style.display='none';return}
 if(blocked()||st.cancelMe){FS.cancel(G.win||G.interact?'เปิดหน้าต่าง · เลิกตกปลา':'เลิกตกปลา');return}
 const k=(()=>{try{return keys.a||keys.d||keys.w||keys.s||keys.ArrowLeft||keys.ArrowRight||keys.ArrowUp||keys.ArrowDown}catch(_){return false}})();
 if(k||Math.hypot(P.x-st.start[0],P.y-st.start[1])>10){FS.cancel('ขยับแล้ว · เลิกตกปลา');return}
 if(!(window.WATERFISH249&&WATERFISH249.isSt(st))&&!pondList().some(o=>o.uid===st.uid)){FS.cancel('บ่อหายไป · เลิกตกปลา');return}
 const t=now();
 if(st.ph==='wait'){if(t-st.t>=st.wait)startBite()}
 else if(st.ph==='bite'){if(t-st.tBite>FS.cfg.biteWindow){FS.stats.escaped++;endTo('ช้าไป ปลาหนีไปแล้ว',true);return}}
 /* bar UI */
 bar.style.display='block';
 if(st.ph==='wait'){bar.className='';bT.textContent='รอปลากินเบ็ด…';bB.style.display='none';bP.textContent='';}
 else if(st.ph==='bite'){bar.className='bite';bT.textContent='ปลากินเบ็ด! กด F / แตะ เดี๋ยวนี้!';bB.style.display='none';bP.textContent='';}
 else{const R=FS.cfg.rar[st.rar];bB.style.display='block';bZ.style.left=((1-R.zone)/2*100)+'%';bZ.style.width=(R.zone*100)+'%';bN.style.left=(needleAt(st,t)*100)+'%';bT.textContent='กดเมื่อขีดอยู่ในช่องสีเขียว';
  const fl=t-st.flash<.25?st.flashK:'';bar.className=fl;let p='';for(let i=0;i<R.need;i++)p+=i<st.good?'●':'○';p+='  ';for(let i=0;i<FS.cfg.missesToFail-1;i++)p+=i<st.miss?'✖':'·';bP.textContent=p}
 place()}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{tick()}catch(e){ERR('tick',e)}return r}}
/* bar needle at display rate between game updates (the game's update can be slow) */
(function loop(){requestAnimationFrame(loop);try{const st=FS.st;if(st&&st.ph==='reel'&&bar.style.display==='block')bN.style.left=(needleAt(st,now())*100)+'%'}catch(_){}})();
/* ---------------- world drawing: rod line, bobber, ripples, bite sign (above the props) ---------------- */
try{const _o=drawEditorOverlay;drawEditorOverlay=function(){const r=_o.apply(this,arguments);try{const st=FS.st;if(st&&(G.zone===ZID||(window.WATERFISH249&&WATERFISH249.isSt(st)))&&P){const c=ctx,t=now(),bx=st.bob.x,face=Math.cos(P.face||0)>=0?1:-1;let by=st.bob.y;const hx=P.x+face*13,hy=P.y-26,tipx=hx+Math.cos(P.face||0)*26,tipy=hy-34;
   let dip=0;if(st.ph==='wait')dip=Math.sin(t*2.6)*1.2;else if(st.ph==='bite')dip=3+Math.sin(t*24)*2.2;else dip=1.5+Math.sin(t*9)*2;by+=dip;
   c.save();c.lineCap='round';c.strokeStyle='#5a3a1a';c.lineWidth=2.6;c.beginPath();c.moveTo(hx,hy);c.lineTo(tipx,tipy);c.stroke();
   c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1;c.beginPath();c.moveTo(tipx,tipy);if(st.ph==='reel'){c.lineTo(bx,by)}else{c.quadraticCurveTo((tipx+bx)/2,Math.min(tipy,by)-10+Math.sin(t*2)*1.5,bx,by)}c.stroke();
   const rp=(t*1.4)%1;c.strokeStyle='rgba(255,255,255,'+(.55*(1-rp)).toFixed(2)+')';c.lineWidth=1.4;c.beginPath();c.ellipse(bx,by+3,6+rp*16,2.4+rp*6,0,0,6.2832);c.stroke();
   if(st.ph==='bite'||st.ph==='reel'){const rp2=(t*2.4)%1;c.strokeStyle='rgba(255,255,255,'+(.7*(1-rp2)).toFixed(2)+')';c.beginPath();c.ellipse(bx,by+3,5+rp2*24,2+rp2*9,0,0,6.2832);c.stroke()}
   if(st.ph==='reel'){c.fillStyle='rgba(20,60,90,.45)';c.beginPath();c.ellipse(bx+Math.sin(t*3.2)*16,by+8+Math.cos(t*2.7)*3,15,5,0,0,6.2832);c.fill()}
   c.fillStyle='#fff';c.beginPath();c.arc(bx,by,5,0,6.2832);c.fill();c.fillStyle='#e8402e';c.beginPath();c.arc(bx,by,5,3.1416,6.2832);c.fill();c.strokeStyle='#3a1a10';c.lineWidth=1;c.beginPath();c.arc(bx,by,5,0,6.2832);c.stroke();
   if(st.ph==='bite'){const s=1+.16*Math.sin(t*16);c.save();c.translate(bx,by-34);c.scale(s,s);c.fillStyle='#ffd24a';c.strokeStyle='#7a4a00';c.lineWidth=2;c.beginPath();c.arc(0,0,13,0,6.2832);c.fill();c.stroke();c.fillStyle='#7a2a00';c.font='900 19px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('!',0,1);c.restore()}
   c.restore()}}catch(e){ERR('draw',e)}return r}}catch(e){ERR('hook overlay',e)}
/* ---------------- input: F and taps ---------------- */
const keyF=e=>{try{if(e.key==='Escape'){if(FS.st){FS.cancel('เลิกตกปลา');e.stopImmediatePropagation();e.preventDefault();return true}return false}
  if((e.key==='f'||e.key==='F')&&!e.repeat){if(FS.st){FS.press('key');e.stopImmediatePropagation();e.preventDefault();return true}if(FS.nearPond()){FS.cast();e.stopImmediatePropagation();e.preventDefault();return true}}}catch(er){ERR('key',er)}return false};
if(window.__EK)window.__EK.unshift(keyF);else addEventListener('keydown',e=>{keyF(e)},true);
document.addEventListener('pointerdown',e=>{try{if(G.state!=='play'||(G.zone!==ZID&&!(window.WATERFISH249&&WATERFISH249.isSt(FS.st))))return;const t=e.target;if(t.closest&&t.closest(UI))return;
  if(FS.st){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();FS.press('tap');return}
  if(blocked())return;const [wx,wy]=s2w(e.clientX,e.clientY);const o=B.itemAt(wx,wy);if(o&&o.id==='fishPond'){const d=distTo(o);if(d<=FS.cfg.tapR){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();if(d>=FS.cfg.promptR)say('เดินไปยืนข้างบ่อก่อน แล้วแตะอีกครั้ง',true);else FS.cast()}else say('เดินไปยืนข้างบ่อก่อน',true)}}catch(er){ERR('tap',er)}},true);
/* ---------------- tank view: put fish from the bag / take them back ---------------- */
function tankUI(){const FT=window.__FISHTANK;if(!FT||!FT.ready||!FT.on||FS.tankUI)return false;const ov=document.getElementById('ftOv');if(!ov)return false;FS.tankUI=true;
 const btn=document.createElement('button');btn.id='ftFishBtn';btn.type='button';btn.textContent='🐟 ใส่/เอาปลา';ov.appendChild(btn);const pn=document.createElement('div');pn.id='ftFish';ov.appendChild(pn);
 const icon=(id)=>{const c=document.createElement('canvas');c.width=64;c.height=64;fishIcon(id)(c.getContext('2d'));return c};
 const rarName=id=>FS.cfg.rar[FS.cfg.fish[id].r];
 function render(){pn.innerHTML='';const h1=document.createElement('h4');h1.textContent='ปลาในกระเป๋า (กดเพื่อใส่ตู้)';pn.appendChild(h1);let any=false;
  for(const id of FS.fishIds){const f=FS.cfg.fish[id],n=(typeof countItem==='function')?countItem(f.item):0;if(n<1)continue;any=true;const row=document.createElement('div');row.className='row';row.appendChild(icon(id));const nm=document.createElement('div');nm.innerHTML='<span style="color:'+rarName(id).col+'">'+f.n+'</span> ×'+n;row.appendChild(nm);const b=document.createElement('button');b.type='button';b.textContent='ใส่ตู้';b.addEventListener('click',()=>FS.tankPut(id));row.appendChild(b);pn.appendChild(row)}
  if(!any){const x=document.createElement('div');x.className='x';x.textContent='ไม่มีปลาในกระเป๋า · ตกปลาที่บ่อในลานก่อน';pn.appendChild(x)}
  const h2=document.createElement('h4');h2.textContent='ปลาในตู้ (กดเพื่อเอากลับกระเป๋า)';pn.appendChild(h2);const lst=FT.fishList();
  if(!lst.length){const x=document.createElement('div');x.className='x';x.textContent='ตู้ยังว่างอยู่';pn.appendChild(x)}
  for(const rec of lst){const f=FS.cfg.fish[rec.sp];if(!f)continue;const row=document.createElement('div');row.className='row';row.appendChild(icon(rec.sp));const nm=document.createElement('div');nm.innerHTML='<span style="color:'+rarName(rec.sp).col+'">'+f.n+'</span>';row.appendChild(nm);const b=document.createElement('button');b.type='button';b.textContent='เอาออก';b.addEventListener('click',()=>FS.tankTake(rec.u));row.appendChild(b);pn.appendChild(row)}}
 FS.renderFishPanel=render;
 btn.addEventListener('click',()=>{const pk=document.getElementById('ftPick');if(pk)pk.classList.remove('in');pn.classList.toggle('in');if(pn.classList.contains('in'))render()});
 for(const ev of ['pointerdown','mousedown','touchstart','click'])pn.addEventListener(ev,e=>e.stopPropagation());
 const bg=document.getElementById('ftBgBtn');if(bg)bg.addEventListener('click',()=>pn.classList.remove('in'));
 const kh=e=>{if(FT.open&&e.key==='Escape'&&pn.classList.contains('in')){pn.classList.remove('in');e.stopImmediatePropagation();e.preventDefault();return true}return false};if(window.__EK)window.__EK.unshift(kh);
 setInterval(()=>{if(!FT.open&&pn.classList.contains('in'))pn.classList.remove('in')},400);return true}
FS.tankPut=function(id){try{const FT=window.__FISHTANK,f=FS.cfg.fish[id];if(!FT||!f)return {ok:false,why:'ไม่มีตู้ปลา'};if(countItem(f.item)<1){say('ไม่มี'+f.n+'ในกระเป๋า',true);return {ok:false,why:'bag'}}
  if(FT.fishList().length>=FT.cfg.cap){say(FT.msgs.full,true);return {ok:false,why:'full'}}
  if(!takeItem(f.item,1))return {ok:false,why:'take'};const r=FT.addFish(id,{src:'bag'});if(!r.ok){try{addItem({id:f.item,q:1})}catch(_){}say(r.why,true);return r}
  say('ใส่'+f.n+'ลงตู้แล้ว');if(FS.renderFishPanel)FS.renderFishPanel();return {ok:true}}catch(e){ERR('tankPut',e);return {ok:false,why:'err'}}};
FS.tankTake=function(u){try{const FT=window.__FISHTANK;if(!FT)return {ok:false};const rec=FT.fishList().find(x=>x.u===u);if(!rec)return {ok:false,why:'none'};const f=FS.cfg.fish[rec.sp];if(!f)return {ok:false,why:'unknown'};
  let ok=false;try{ok=addItem({id:f.item,q:1})!==false}catch(_){}if(!ok){say('กระเป๋าเต็ม · เอาปลาออกไม่ได้',true);return {ok:false,why:'bagFull'}}
  FT.removeFish(u);say('เอา'+f.n+'กลับใส่กระเป๋าแล้ว');if(FS.renderFishPanel)FS.renderFishPanel();return {ok:true}}catch(e){ERR('tankTake',e);return {ok:false,why:'err'}}};
{let n=0;const iv=setInterval(()=>{try{if(tankUI()||++n>60)clearInterval(iv)}catch(e){ERR('tankUI',e);clearInterval(iv)}},500)}
/* GM (only with ?gm=on) */
if(FS.gm){let n=0;const iv=setInterval(()=>{try{const gm=document.getElementById('houseGm');if(gm&&!gm.dataset.fs){gm.dataset.fs='1';const b=document.createElement('button');b.type='button';b.textContent='🎣 GM: ปลาทุกชนิด ×1 → กระเป๋า';b.style.cssText='font-size:11px;margin:1px;padding:2px 5px';for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();for(const id of FS.fishIds)addItem({id:FS.cfg.fish[id].item,q:1});say('GM: ใส่ปลาทุกชนิดลงกระเป๋าแล้ว')});gm.appendChild(b);clearInterval(iv)}else if(++n>60)clearInterval(iv)}catch(_){clearInterval(iv)}},1000)}
FS.ready=true;
})();

