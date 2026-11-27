
/* ---- r183 food183 (TEST ONLY, coordinator Task 19 parts A + D, 22 Nov 2026). Base = TEST r182. Numbers = BALANCE_housing_fishing_v1.md (r1.7b/c, r1.7d pool + levels, r1.7f up to 3 statuses + caps) and BALANCE_cooking_recipes_r2.md (r2 recipes + r2.1 buffs, 20 min). Approved by DeaRz 22 Nov 13:46.
   A) ?foodstatus=off : INGREDIENT STATUSES. Pool of 6 (ATK, DEF, max HP, max MP, crit, attack speed), strength by level 1-4, level by source (home-grown crop / tree fruit and common fish Lv1, uncommon Lv2, rare Lv3, very rare Lv4), shiny fish x1.5. Rolled per item at catch / harvest, slot by slot (chances 1st / 2nd / 3rd per source), up to 3 DIFFERENT stats. Only home-grown produce (farm harvest, also by helpers) and caught fish (also by helpers) can roll; shop produce and River Fish never. Bag: item.st = [[stat,level],..] (canonical order); an item with no status has no st and stacks as before; status items stack only on an exact status set (patch in addItemTo, countItem sums all stacks, takeItem takes plain first). Name / tooltip show the statuses; the tank fish panel shows them (tank rec carries st). A dish keeps its OWN buff and ADDS the pooled ingredient statuses (fish first, then crops in recipe order; same stat adds up; at most 3 different stats; per-stat caps ATK 8, DEF 8, crit 5, aspd 5, max HP 10, max MP 10 %); the dish is a bag item with a derived id "ds:<dish>:<stat=value_..>" (ITEMS entry rebuilt from the id, so saves stay valid); one food slot, eating another food replaces everything.
   D) ?recipes2=off : 12 new dishes + Fish Stew (r2.1 buffs, 20 min). Ingredients may be a group ("any fish", "uncommon or better", "rare or better", "apple"). 7 + Fish Stew are known from the start; the 5 others are bought as recipe scrolls from the Astoria bakery stall (NPC ast_baker, which already sells the campfire kit and cooking goods; there is no innkeeper NPC). New effects have hooks: skill MP cost, crit damage, every 5th basic hit x2, damage taken, skill cooldown, one-time death guard, cooking-material drop, EXP, gold. A new cooking window lets the player choose WHICH fish / crop stack to use and previews the buff and statuses; it replaces the r130 window when either flag is on.
   Debug: window.__F183 ---- */
(function(){'use strict';
const Q=String(location.search);
const F=window.__F183={ver:'food-r183',status:!/[?&]foodstatus=off\b/.test(Q),recipes:!/[?&]recipes2=off\b/.test(Q),err:null,gm:/[?&]gm=on\b/.test(Q),stats:{rolls:0,withSt:0,cooked:0,learned:0,guard:0,hit5:0},log:[]};
const ERR=(w,e)=>{F.err=w+': '+((e&&e.message)||e);try{console.error('[F183]',w,e)}catch(_){}};
const FS=window.__FISHING,H=window.HOUSE,C=window.COOK;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ======================= A) status data ======================= */
const SORDER=['atk','def','hp','mp','crit','aspd'];
F.cfg={order:SORDER,name:{atk:'ATK',def:'DEF',hp:'Max HP',mp:'Max MP',crit:'Crit',aspd:'ความเร็วโจมตี'},
 val:{atk:[1,2,4,6],def:[1,2,4,6],hp:[2,3,6,8],mp:[2,3,6,8],crit:[1,1.5,3,4],aspd:[1,1.5,3,4]},       /* % by level 1-4 (r1.7d) */
 lvOf:{crop:1,common:1,uncommon:2,rare:3,veryrare:4},
 chance:{crop:[.20,.10,.05],common:[.30,.15,.05],uncommon:[.50,.25,.10],rare:[.80,.40,.15],veryrare:[1,.50,.20]}, /* 1st / 2nd / 3rd slot (r1.7f) */
 shinyMul:1.5,caps:{atk:8,def:8,crit:5,aspd:5,hp:10,mp:10},maxStats:3,
 foodSec:1200,                                                          /* r2.1: 20 min */
 priceRecipe:{boarCurry:100,peachPudding:150,steamedFish:300,grapeFish:400,luckyTart:400}};
const canon=st=>(st||[]).slice().sort((a,b)=>SORDER.indexOf(a[0])-SORDER.indexOf(b[0]));
const keyOf=st=>st&&st.length?JSON.stringify(canon(st)):'';
const isShinyId=id=>/_s$/.test(String(id||''));
const valOf=(s,lv,sh)=>+(F.cfg.val[s][Math.max(0,Math.min(3,lv-1))]*(sh?F.cfg.shinyMul:1)).toFixed(2);
const fmtV=v=>(Math.round(v*100)/100)+'%';
function txtSt(st,sh){return canon(st).map(a=>F.cfg.name[a[0]]+' +'+fmtV(valOf(a[0],a[1],sh))).join(' · ')}
F.txtSt=txtSt;
/* roll a status set for a source ('crop' or a fish tier); rnd injectable for the simulations */
F.roll=function(src,rnd){rnd=rnd||Math.random;const ch=F.cfg.chance[src]||[],lv=F.cfg.lvOf[src]||1,have=[];for(let i=0;i<3;i++){if(!(rnd()<(ch[i]||0)))break;const pool=SORDER.filter(s=>!have.some(h=>h[0]===s));if(!pool.length)break;have.push([pool[Math.floor(rnd()*pool.length)],lv])}F.stats.rolls++;if(have.length)F.stats.withSt++;return canon(have)};
/* fish tables (the roster is data driven: FS.cfg.fish) */
let FBI=null;function fishByItem(){if(FBI&&FBI.n===Object.keys(FS.cfg.fish).length)return FBI.m;const m={};for(const sp in FS.cfg.fish)m[FS.cfg.fish[sp].item]=sp;FBI={n:Object.keys(FS.cfg.fish).length,m};return m}
const fishItems=()=>Object.keys(fishByItem());
const TR={common:0,uncommon:1,rare:2,veryrare:3};
const tierOfItem=id=>{const sp=fishByItem()[id];return sp?FS.cfg.fish[sp].r:null};
const tierRank=id=>{const t=tierOfItem(id);return t==null?-1:TR[t]};
/* ======================= bag helpers ======================= */
const inv=()=>P.inv;
function addStat(it){try{return addItem(it)!==false}catch(_){return false}}
function stacksOf(ids){const set=new Set(ids),out=[];P.inv.forEach((it,i)=>{if(it&&set.has(it.id))out.push({it,i,q:it.q,st:it.st||null})});return out}
const GROUP={'*fish':()=>fishItems().concat(['riverFish']),'*fishU':()=>fishItems().filter(i=>tierRank(i)>=1),'*fishR':()=>fishItems().filter(i=>tierRank(i)>=2),'*apple':()=>['farmApple','eastApple']};
const GNAME={'*fish':'ปลาอะไรก็ได้ (ปลาในเกม / ปลาแม่น้ำ)','*fishU':'ปลาไม่ธรรมดาขึ้นไป','*fishR':'ปลาหายากขึ้นไป','*apple':'แอปเปิล'};
const idsOf=id=>id[0]==='*'?GROUP[id]():[id];
const nameOfIng=id=>id[0]==='*'?GNAME[id]:((ITEMS[id]||{}).n||id);
const isFishIng=id=>id[0]==='*'&&id!=='*apple';
/* helper cooking: plain items only (a status item is never eaten by a helper), groups understood */
F.hCount=id=>{let n=0;for(const x of stacksOf(idsOf(id)))if(!x.st)n+=x.q;return n};
F.hTake=function(id,k){let rem=k;for(const x of stacksOf(idsOf(id))){if(x.st)continue;const t=Math.min(rem,x.it.q);x.it.q-=t;rem-=t;if(!rem)break}for(let i=P.inv.length-1;i>=0;i--)if(P.inv[i]&&P.inv[i].q<=0)P.inv.splice(i,1);return rem===0};
/* ======================= items that carry statuses ======================= */
F.fishItem=function(sp,f){const it={id:f.item,q:1};try{if(F.status){const st=F.roll(f.r||'common');if(st.length)it.st=st}}catch(e){ERR('fishItem',e)}return it};
F.helperFish=function(sp,item){try{const it=F.fishItem(sp,FS.cfg.fish[sp]||{item,r:'common'});return addStat(it)}catch(e){ERR('helperFish',e);try{return addItem({id:item,q:1})}catch(_){return false}}};
F.farmAdd=function(id,n){try{const plain=[];let nPlain=0;const sets=new Map();for(let i=0;i<n;i++){const st=F.status?F.roll('crop'):[];if(st.length){const k=keyOf(st);const g=sets.get(k)||{st,n:0};g.n++;sets.set(k,g)}else nPlain++}
  let ok=true;if(nPlain)ok=addStat({id,q:nPlain})&&ok;for(const g of sets.values()){if(!addStat({id,q:g.n,st:g.st})){ok=addStat({id,q:g.n})&&ok}}return ok}catch(e){ERR('farmAdd',e);try{return !!addItem({id,q:n})}catch(_){return false}}};
/* ---- names / tooltips ---- */
try{const _n=itemName;itemName=function(it){let n=_n.apply(this,arguments);try{if(it&&it.st&&it.st.length)n+=' ['+txtSt(it.st,isShinyId(it.id)).replace(/ \+/g,'+').replace(/ · /g,' ')+']'}catch(_){}return n}}catch(e){ERR('hook itemName',e)}
try{const _t=tipFor;tipFor=function(it){let h=_t.apply(this,arguments);try{if(it&&it.st&&it.st.length)h+='<div class="tcmp" style="color:#ffd98a">✦ สถานะวัตถุดิบ (ติดไปกับอาหาร): '+esc(txtSt(it.st,isShinyId(it.id)))+'</div>';else if(it&&it.id&&String(it.id).indexOf('ds:')===0&&ITEMS[it.id]&&ITEMS[it.id].stTxt)h+='<div class="tcmp" style="color:#ffd98a">✦ สถานะเพิ่ม: '+esc(ITEMS[it.id].stTxt)+'</div>'}catch(_){}return h}}catch(e){ERR('hook tipFor',e)}
/* ======================= pooling statuses into a dish ======================= */
/* ings = [{id (ingredient id, may be group), it (the bag stack used or null)}] in recipe order; fish first, then crops */
F.pool=function(ings){const order=ings.slice().sort((a,b)=>(isFishIng(b.id)?1:0)-(isFishIng(a.id)?1:0));const acc={};const keep=[];
 for(const g of order){const it=g.it;if(!it||!it.st||!it.st.length)continue;const sh=isShinyId(it.id);for(const a of canon(it.st)){if(!(a[0] in acc)){if(keep.length>=F.cfg.maxStats)continue;keep.push(a[0]);acc[a[0]]=0}acc[a[0]]+=valOf(a[0],a[1],sh)}}
 const out={};for(const s of keep)out[s]=+Math.min(F.cfg.caps[s],acc[s]).toFixed(2);return out};
const dishKey=pool=>SORDER.filter(s=>s in pool).map(s=>s+'='+pool[s]).join('_');
/* ======================= recipes (r2 + r2.1) ======================= */
/* shapes drawn in code (placeholders: Art draws the 13 icons later) */
const ico={
 bowl:(g,c)=>{g.fillStyle='#8a5a30';g.beginPath();g.moveTo(10,32);g.lineTo(54,32);g.quadraticCurveTo(50,54,32,54);g.quadraticCurveTo(14,54,10,32);g.fill();g.fillStyle=c;g.beginPath();g.ellipse(32,32,22,7,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(36,12,3,0,7);g.arc(28,19,3,0,7);g.fill()},
 fish:(g,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(30,34,20,11,0,0,7);g.fill();g.beginPath();g.moveTo(48,34);g.lineTo(60,24);g.lineTo(60,44);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(20,31,2.5,0,7);g.fill()},
 pie:(g,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(32,36,22,12,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(32,32,16,6,0,0,7);g.fill()},
 bread:(g,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(32,38,22,14,0,0,7);g.fill();g.strokeStyle='rgba(120,70,20,.7)';g.lineWidth=2;for(const x of [22,32,42]){g.beginPath();g.moveTo(x-3,30);g.lineTo(x+3,42);g.stroke()}},
 leaf:(g,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(14,50);g.quadraticCurveTo(10,16,50,12);g.quadraticCurveTo(54,48,14,50);g.fill()},
 skew:(g,c)=>{g.strokeStyle='#8a6238';g.lineWidth=3;g.beginPath();g.moveTo(10,52);g.lineTo(54,12);g.stroke();g.fillStyle=c;for(const [x,y] of [[22,42],[32,33],[42,24]]){g.beginPath();g.ellipse(x,y,7,5,-.7,0,7);g.fill()}}};
/* recipe table: id, Thai name, ingredient list ([id,k]; '*..' = group), buff (the OWN buff of the dish), description, helper time (s), shape+colour, known from start?, hot (instant heal) */
const R=[
 {id:'tomatoSoup',n:'ซุปมะเขือเทศ',ing:[['tomato',2],['onion',1]],buff:{mpPct:.10,mpc:.10},d:'Max MP +10% · MP ที่สกิลใช้ −10%',t:20,sh:'bowl',col:'#f0503a',known:1},
 {id:'fruitSalad',n:'สลัดผลไม้',ing:[['*apple',1],['mtGrape',1],['indigoBerry',1]],buff:{crit:5,critDmg:.15},d:'คริติคอล +5% · ดาเมจคริติคอล +15%',t:15,sh:'bowl',col:'#e85a8a',known:1},
 {id:'applePie',n:'พายแอปเปิ้ล',ing:[['*apple',2],['wheat',2]],hot:{hp:.40,s:.3},buff:{hpRegen:.01},d:'ฟื้น HP 40% ทันที · ฟื้น HP 1% Max ทุก 3 วินาที',t:30,sh:'pie',col:'#d8402e',known:1},
 {id:'crispyFish',n:'ปลาทอดกรอบ',ing:[['*fish',1],['wheat',1],['potato',1]],buff:{atk:.06,hit5:1},d:'ATK +6% · โจมตีปกติครั้งที่ 5 แรง ×2',t:25,sh:'fish',col:'#d8a060',known:1},
 {id:'fishCabbageSoup',n:'แกงจืดปลาผักกาด',ing:[['*fish',1],['cabbage',1],['mistCarrot',1]],buff:{def:.13},d:'DEF +8% · ดาเมจที่โดน −5%',t:25,sh:'bowl',col:'#a8e08a',known:1,extra:'def .08 + damage taken −5%'},
 {id:'fishSkewer',n:'ปลาเสียบไม้ย่าง',ing:[['*fish',1],['onion',1],['tomato',1]],buff:{aspd:.06,speed:.05},d:'ความเร็วโจมตี +6% · ความเร็วเดิน +5%',t:20,sh:'skew',col:'#e0b060',known:1},
 {id:'berryBread',n:'ขนมปังเบอร์รี่',ing:[['wheat',2],['indigoBerry',2]],buff:{speed:.10,mpRegen:.20},d:'ความเร็วเดิน +10% · MP regen +20%',t:25,sh:'bread',col:'#4a5ac8',known:1},
 {id:'boarCurry',n:'แกงหมูป่าเห็ด',ing:[['boarMeat',2],['puffcapMush',1],['mistCarrot',1]],buff:{atk:.06,def:.06,hpPct:.05},d:'ATK +6% · DEF +6% · Max HP +5%',t:40,sh:'bowl',col:'#c08050'},
 {id:'peachPudding',n:'พุดดิ้งลูกท้อทอง',ing:[['goldPeach',1],['slimeJelly',2]],buff:{cdr:.08,mpRegen:.30},d:'คูลดาวน์สกิล −8% · MP regen +30%',t:30,sh:'pie',col:'#ffc85a'},
 {id:'steamedFish',n:'ปลานึ่งใบอ่อน',ing:[['*fishR',1],['tenderLeaf',2],['mossHerb',1]],buff:{hpPct:.12,hpRegen:.015,guard:1},d:'Max HP +12% · ฟื้น HP 1.5%/3 วิ · “กันตาย” 1 ครั้ง (HP<20% ฟื้น 30%)',t:45,sh:'fish',col:'#8fe39a'},
 {id:'grapeFish',n:'ปลาย่างซอสองุ่น',ing:[['*fishU',1],['mtGrape',2],['sweetRoot',1]],buff:{exp:.15,atk:.03},d:'EXP ที่ได้ +15% · ATK +3%',t:35,sh:'fish',col:'#8a5ad0'},
 {id:'luckyTart',n:'ทาร์ตท้อทองนำโชค',ing:[['goldPeach',2],['*apple',1],['wheat',1]],buff:{gold:.15,matDrop:.20},d:'เงินที่ดรอป +15% · ดรอปวัตถุดิบทำอาหาร +20%',t:35,sh:'pie',col:'#ffd36b'},
 {id:'fishStew',n:'ต้มปลา',ing:[['*fish',1],['potato',1],['onion',1]],buff:{hpPct:.08,def:.04},d:'Max HP +8% · DEF +4%',t:25,sh:'bowl',col:'#8ab8e8',known:1}];
F.R=R;
const BUFFN={atk:'ATK',def:'DEF',crit:'คริ',aspd:'ความเร็วโจมตี',speed:'ความเร็วเดิน',hpPct:'Max HP',mpPct:'Max MP',mpRegen:'MP regen',hpRegen:'HP regen/3วิ',critDmg:'ดาเมจคริ',cdr:'คูลดาวน์',mpc:'MP สกิล',guard:'กันตาย',hit5:'ครั้งที่5×2',exp:'EXP',gold:'เงินดรอป',matDrop:'ดรอปวัตถุดิบ'};
function regDish(r){try{if(!ITEMS[r.id])ITEMS[r.id]={n:r.n,d:r.d+' นาน 20 นาที',k:'use',col:r.col,food:{buff:r.buff,hot:r.hot,sec:F.cfg.foodSec},price:0,sell:Math.max(2,Math.round(r.t/5)),icon:g=>ico[r.sh](g,r.col)}}catch(e){ERR('regDish',e)}}
function regRecipeItem(r){try{const id='recipe_'+r.id;if(!ITEMS[id])ITEMS[id]={n:'สูตร: '+r.n,d:'ใช้เพื่อเรียนสูตร '+r.n+' (ทำที่กองไฟ) · '+r.d,k:'use',col:'#ffe9b0',price:F.cfg.priceRecipe[r.id],sell:Math.floor(F.cfg.priceRecipe[r.id]/4),stall:0,icon:g=>{g.fillStyle='#e8d8a8';g.fillRect(14,12,36,42);g.strokeStyle='#8a6a30';g.lineWidth=2;g.strokeRect(14,12,36,42);g.fillStyle='#8a6a30';for(const y of [22,30,38])g.fillRect(20,y,24,3);g.fillStyle=r.col;g.beginPath();g.arc(42,46,6,0,7);g.fill()}}}catch(e){ERR('regRecipeItem',e)}}
/* known recipes: state.cook183 (house save) ; starters have known:1 */
const cookState=()=>{try{const S=H.state();if(!S.cook183||typeof S.cook183!=='object')S.cook183={known:[]};if(!Array.isArray(S.cook183.known))S.cook183.known=[];return S.cook183}catch(_){return {known:[]}}};
const isKnown=r=>!!r.known||cookState().known.includes(r.id);
let BASE=null;
function syncRecipes(){try{if(!C||!C.recipes)return false;if(!BASE){BASE=C.recipes.slice();const hf=BASE.find(x=>x.id==='herbFish');if(hf&&F.recipes)hf.ing=[['*fish',1],['mossHerb',2]]}
 const known=F.recipes?R.filter(isKnown).map(r=>({id:r.id,ing:r.ing.map(a=>a.slice()),out:r.id})):[];C.recipes.length=0;for(const b of BASE)C.recipes.push(b);for(const k of known)C.recipes.push(k);return true}catch(e){ERR('syncRecipes',e);return false}}
F.learn=function(id){const r=R.find(x=>x.id===id);if(!r)return false;const s=cookState();if(!s.known.includes(id)){s.known.push(id);F.stats.learned++;try{H.save()}catch(_){}}syncRecipes();return true};
/* shop: the Astoria bakery stall sells the 5 recipe scrolls (it already sells the campfire kit and cooked foods) */
function shopHook(){try{const TN=window.__TOWNNPC;if(!TN||!TN.goods||F._shop)return false;if(!F.recipes){F._shop=1;return true}const L=TN.goods.ast_baker=TN.goods.ast_baker||[];for(const r of R)if(!r.known){const id='recipe_'+r.id;if(!L.includes(id))L.push(id)}F._shop=1;return true}catch(e){return false}}
/* helper cook times (base seconds before its strong-job bonus) + cook queue accepts the new dishes */
function helperHook(){try{const HP=window.__HELPER;if(!HP||!HP.cfg||!HP.cfg.cook||F._hp)return false;for(const r of R)HP.cfg.cook.times[r.id]=r.t;F._hp=1;return true}catch(e){return false}}
/* ======================= effect hooks (new buff keys on P.buffs.food) ======================= */
const Bk=k=>{try{return B(k)}catch(_){return 0}};
function hooks(){
 try{const _r=recalc;recalc=function(){const r=_r.apply(this,arguments);try{const m=Bk('mpPct');if(m){P.maxMp=Math.round(P.maxMp*(1+m));P.mp=Math.min(P.mp,P.maxMp)}}catch(_){}return r}}catch(e){ERR('hook recalc',e)}
 try{const _m=mpCost;mpCost=function(s,lv){const v=_m.apply(this,arguments);const d=Bk('mpc');return d?Math.max(0,Math.round(v*(1-Math.min(.6,d)))):v}}catch(e){ERR('hook mpCost',e)}
 try{const _h=hitEnemy;hitEnemy=function(e,m,o){o=o||{};try{if(Bk('hit5')>0&&!o.dot&&!o.echo&&G&&time-(G.basicT||-9)<.28){F.n5=(F.n5||0)+1;if(F.n5%5===0){m*=2;F.stats.hit5++;try{textAt(e.x,e.y-(e.sz||20)*2.9,'×2','#ffd36b',16,{life:.6})}catch(_){}}}}catch(_){}return _h.call(this,e,m,o)}}catch(e){ERR('hook hitEnemy',e)}
 try{const _p=hurtPlayer;hurtPlayer=function(raw,src){const r=_p.apply(this,arguments);try{guardCheck()}catch(_){}return r}}catch(e){ERR('hook hurt',e)}
 try{const _x=gainExp;gainExp=function(x,a,b){const d=Bk('exp');return _x.call(this,d>0?Math.round(x*(1+d)):x,a,b)}}catch(e){ERR('hook exp',e)}
 try{const _d=dropLoot;dropLoot=function(x,y,o){try{const d=Bk('gold');if(d>0&&o&&o.gold)o=Object.assign({},o,{gold:Math.max(1,Math.round(o.gold*(1+d)))})}catch(_){}return _d.call(this,x,y,o)}}catch(e){ERR('hook gold',e)}
 try{if(C&&C.cfg){for(const k of ['MAT_DROP','MAT_DROP_ELITE']){let base=C.cfg[k];Object.defineProperty(C.cfg,k,{configurable:true,get(){return base*(1+Bk('matDrop'))},set(v){base=v}})}}}catch(e){ERR('hook matDrop',e)}}
function guardCheck(){const b=P.buffs&&P.buffs.food;if(!b||!b.guard||P.dead)return;if(P.hp>0&&P.hp<P.maxHp*.2){b.guard=0;const h=P.maxHp*.3;P.hp=Math.min(P.maxHp,P.hp+h);F.stats.guard++;try{textAt(P.x,P.y-70,'กันตาย! +'+Math.round(h),'#8dffc8',18,{life:1.2});ring(P.x,P.y,10,120,.6,'#8dffc8',4)}catch(_){}}}
/* ======================= dish items with ingredient statuses (derived ids) ======================= */
function stBuff(pool){const b={};for(const s in pool){const v=pool[s];if(s==='atk')b.atk=(b.atk||0)+v/100;else if(s==='def')b.def=(b.def||0)+v/100;else if(s==='hp')b.hpPct=(b.hpPct||0)+v/100;else if(s==='mp')b.mpPct=(b.mpPct||0)+v/100;else if(s==='crit')b.crit=(b.crit||0)+v;else if(s==='aspd')b.aspd=(b.aspd||0)+v/100}return b}
function parseDish(id){const m=/^ds:([^:]+):(.*)$/.exec(id||'');if(!m)return null;const pool={};for(const part of m[2].split('_')){const q=/^(\w+)=([\d.]+)$/.exec(part);if(q&&q[1] in F.cfg.val)pool[q[1]]=+q[2]}return {base:m[1],pool}}
function regDerived(id){try{if(ITEMS[id])return true;const p=parseDish(id);if(!p||!ITEMS[p.base])return false;const b=ITEMS[p.base],f=b.food||{},nb=Object.assign({},f.buff||{});const sb=stBuff(p.pool);for(const k in sb)nb[k]=(nb[k]||0)+sb[k];
  const tx=Object.keys(p.pool).map(s=>F.cfg.name[s]+' +'+fmtV(p.pool[s])).join(' · ');ITEMS[id]=Object.assign({},b,{n:b.n+' ✦',d:(b.d||'')+' · สถานะวัตถุดิบ: '+tx,stTxt:tx,food:Object.assign({},f,{buff:nb,sec:f.sec||F.cfg.foodSec}),base:p.base});return true}catch(e){ERR('regDerived',e);return false}}
function scanDerived(){try{for(const it of P.inv)if(it&&typeof it.id==='string'&&it.id.indexOf('ds:')===0&&!ITEMS[it.id])regDerived(it.id)}catch(_){}}
F.dishId=(base,pool)=>{const k=dishKey(pool);return k?'ds:'+base+':'+k:base};
/* ======================= the cooking window (choose stacks, preview) ======================= */
const css=document.createElement('style');css.textContent='#cw2{position:fixed;inset:0;z-index:81;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.58);font:13px/1.4 "Noto Sans Thai",system-ui,sans-serif;color:#f0e4c8}#cw2.in{display:flex}'
+'#cw2 .pn{width:min(96vw,800px);height:min(94vh,560px);display:flex;flex-direction:column;border-radius:14px;border:2px solid #b8924a;background:linear-gradient(180deg,#2c2216,#120d08);box-shadow:0 10px 40px rgba(0,0,0,.8);padding:8px 10px 10px;box-sizing:border-box}'
+'#cw2 .hd{display:flex;align-items:center;gap:8px;margin-bottom:6px}#cw2 .hd h3{margin:0;font-size:16px;color:#ffe9b0;flex:1}#cw2 .tm{font-size:12px;color:#ffb35a}#cw2 .x{width:36px;height:36px;border-radius:9px;border:1px solid #b8924a;background:#3a2410;color:#ffe9b0;cursor:pointer;font-size:16px}'
+'#cw2 .bd{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.3fr);gap:10px}#cw2 .col{min-height:0;overflow:auto;padding-right:3px}'
+'#cw2 .rw{display:flex;gap:8px;align-items:center;padding:6px 8px;margin-bottom:5px;border-radius:10px;border:1px solid rgba(120,96,52,.55);background:rgba(30,23,14,.9);cursor:pointer}#cw2 .rw.sel{border-color:#ffd98a;box-shadow:0 0 0 1px #ffd98a}#cw2 .rw.no{opacity:.6}#cw2 .rw canvas{width:36px;height:36px;flex:none;background:#100d09;border-radius:8px}#cw2 .rw b{display:block;font-size:13px;color:#fff}#cw2 .rw small{display:block;font-size:11px;color:#c9b27a}'
+'#cw2 h4{margin:6px 0 3px;font-size:12px;color:#ffd98a}#cw2 .f183sl{margin-bottom:6px}#cw2 .cwk{display:flex;gap:4px;flex-wrap:wrap}#cw2 button.c{min-height:32px;padding:2px 8px;border-radius:8px;border:1px solid #6a5230;background:#2a2014;color:#f0e4c8;font:600 12px "Noto Sans Thai",system-ui,sans-serif;cursor:pointer;text-align:left}#cw2 button.c.on{border-color:#ffd98a;background:#4a3414;color:#fff}#cw2 button.c:disabled{opacity:.4;cursor:default}#cw2 .st{color:#ffd98a;font-size:11px}'
+'#cw2 .pv{padding:6px 8px;border-radius:10px;border:1px solid #6a5230;background:#1b140c;font-size:12px}#cw2 .pv b{color:#ffe9b0}#cw2 .ft{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}#cw2 .ft button{min-height:36px;min-width:36px;border-radius:9px;border:1px solid #b8924a;background:#3a2410;color:#ffe9b0;font:700 13px "Noto Sans Thai",system-ui,sans-serif;cursor:pointer}#cw2 .ft .go{margin-left:auto;min-height:42px;padding:0 22px;background:linear-gradient(#d49a3a,#8a5a14);color:#fff4cf;font-size:15px}#cw2 .ft .go:disabled{opacity:.4;cursor:default}'
+'#cw2 .col .ft{position:sticky;bottom:0;background:#14100a;padding:6px 0 2px;z-index:2}'
+'#cw2 .pg{height:6px;background:#1b140c;display:none;margin-bottom:5px}#cw2 .pg i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ff9a3a,#ffd36b)}@media (max-width:640px){#cw2 .bd{grid-template-columns:1fr;overflow:auto}#cw2 .col{overflow:visible}}';document.head.appendChild(css);
const win=document.createElement('div');win.id='cw2';document.body.appendChild(win);
for(const ev of ['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend','wheel'])win.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
let selR=0,qty=1,picks={},cooking=null,open=false;
const recList=()=>C.recipes.slice();
function recData(r){return R.find(x=>x.id===r.id)||null}
const baseFood=id=>ITEMS[id]||{};
function slotChoices(ing){const ids=idsOf(ing[0]),k=ing[1],all=stacksOf(ids).filter(x=>x.q>0);return all.map(x=>({it:x.it,q:x.q,ok:x.q>=k}))}
function defaultPick(ing){const ch=slotChoices(ing).filter(c=>c.ok);if(!ch.length)return null;ch.sort((a,b)=>(a.it.st?1:0)-(b.it.st?1:0)||b.q-a.q);return ch[0].it}
function stackLabel(it){const sh=isShinyId(it.id);return esc((ITEMS[it.id]||{}).n||it.id)+' ×'+it.q+(it.st&&it.st.length?'<span class="st"> ✦'+esc(txtSt(it.st,sh))+'</span>':'')}
function pickedFor(r,i){const p=picks[r.id+'|'+i];if(p&&P.inv.includes(p)&&p.q>=r.ing[i][1])return p;const d=defaultPick(r.ing[i]);picks[r.id+'|'+i]=d;return d}
function resultOf(r){const ings=r.ing.map((a,i)=>({id:a[0],it:pickedFor(r,i)}));const pool=F.status?F.pool(ings):{};const rd=recData(r);return {ings,pool,id:F.dishId(r.id,pool),rd}}
function maxQty(r){let n=99;r.ing.forEach((a,i)=>{const p=pickedFor(r,i);n=Math.min(n,p?Math.floor(p.q/a[1]):0)});return n===99?0:n}
function buffText(rd,pool){const parts=[rd?rd.d:(ITEMS[r2id()]||{}).d];return parts}
const r2id=()=>{const r=recList()[selR];return r?r.id:''};
function drawIcons(){for(const c of win.querySelectorAll('canvas[data-i]')){try{const it=ITEMS[c.dataset.i];const g=c.getContext('2d');g.clearRect(0,0,36,36);g.save();g.scale(36/64,36/64);if(it&&it.icon)it.icon(g);g.restore()}catch(_){}}}
function render(){if(!open||cooking)return;const L=recList();selR=Math.max(0,Math.min(selR,L.length-1));const sel=L[selR];
 let h='<div class="pn"><div class="hd"><h3>🔥 กองไฟ · ทำอาหาร</h3><span class="tm" id="cw2t"></span><button class="x" data-a="close" aria-label="ปิด">✕</button></div><div class="pg"><i></i></div><div class="bd"><div class="col">';
 L.forEach((r,i)=>{const mk=maxQty(r),rd=recData(r),it=ITEMS[r.out]||{};h+='<div class="rw'+(i===selR?' sel':'')+(mk?'':' no')+'" data-a="rec" data-i="'+i+'"><canvas width="36" height="36" data-i="'+r.out+'"></canvas><div style="flex:1;min-width:0"><b>'+esc(it.n||r.out)+'</b><small>'+esc(rd?rd.d:(it.d||''))+'</small><small>'+(mk?'ทำได้ '+mk:'ของไม่พอ')+'</small></div></div>'});
 h+='</div><div class="col">';
 if(sel){const rd=recData(sel),res=resultOf(sel);h+='<h4>'+esc((ITEMS[sel.out]||{}).n||sel.out)+(rd?' · ใช้เวลา '+cookSec(sel)+' วิ/จาน':'')+'</h4>';
  sel.ing.forEach((a,i)=>{const ch=slotChoices(a),p=pickedFor(sel,i);h+='<div class="f183sl"><div class="st" style="color:#c9b27a">วัตถุดิบ: '+esc(nameOfIng(a[0]))+' ×'+a[1]+'</div><div class="cwk">'+(ch.length?ch.map((c,j)=>'<button class="c'+(p===c.it?' on':'')+'" data-a="pick" data-r="'+i+'" data-j="'+j+'"'+(c.ok?'':' disabled')+'>'+stackLabel(c.it)+'</button>').join(''):'<span style="color:#ff8a8a">ไม่มีในกระเป๋า</span>')+'</div></div>'});
  const base=baseFood(sel.out),bf=(base.food||{}).buff||{};h+='<div class="pv"><b>ผลลัพธ์ที่ได้:</b> '+esc((ITEMS[sel.out]||{}).n||sel.out)+(Object.keys(res.pool).length?' ✦':'')+'<br>'+esc(rd?rd.d:(base.d||''))+'<br>'+(Object.keys(res.pool).length?'<span class="st">สถานะเพิ่มจากวัตถุดิบ: '+esc(Object.keys(res.pool).map(s=>F.cfg.name[s]+' +'+fmtV(res.pool[s])).join(' · '))+'</span>':'<span style="color:#9a9078">ไม่มีสถานะเพิ่ม</span>')+'<br><span style="color:#9fb2d8">'+(durMin(res.id)?'นาน '+durMin(res.id)+' นาที · ':'')+'กินได้ทีละอย่าง (อาหารใหม่แทนอาหารเก่าทั้งหมด)</span></div>';
  const mk=maxQty(sel);qty=Math.max(1,Math.min(qty,Math.max(1,mk)));
  h+='<div class="ft"><button data-a="mn">−</button><b>'+qty+'</b><button data-a="pl">+</button><button data-a="mx">สูงสุด</button><button class="go" data-a="go"'+(mk<1?' disabled':'')+'>ทำอาหาร</button></div>'}
 h+='</div></div></div>';win.innerHTML=h;drawIcons();tmTick()}
function durMin(id){try{if(String(id).indexOf('ds:')===0)regDerived(id);const f=(ITEMS[id]||{}).food||{};if(!f.buff)return 0;const s=f.sec==='cook'?C.cfg.FOOD_SEC:f.sec==='shop'?C.cfg.SHOP_FOOD_SEC:(f.sec||0);return Math.round(s/60)}catch(_){return 0}}
function cookSec(r){try{const HP=window.__HELPER;return (HP&&HP.cfg&&HP.cfg.cook&&HP.cfg.cook.times[r.id])||2}catch(_){return 2}}
function tmTick(){const e=document.getElementById('cw2t');if(!e||!C.fire)return;const m=Math.max(0,Math.floor(C.fire.left||0));e.textContent='ไฟเหลือ '+Math.floor(m/60)+':'+String(m%60).padStart(2,'0')}
F.openWin=function(){if(open)return true;open=true;try{for(const k in keys)keys[k]=false;mouse.down=false}catch(_){}selR=0;qty=1;picks={};syncRecipes();win.classList.add('in');render();return true};
F.closeWin=function(){if(cooking){clearTimeout(cooking.t);cooking=null}open=false;win.classList.remove('in');win.innerHTML='';return true};
function doCook(){if(cooking)return;const r=recList()[selR];if(!r)return;let left=Math.min(qty,maxQty(r));if(left<1)return;const sec=cookSec(r);const pg=win.querySelector('.pg'),bar=pg.querySelector('i');pg.style.display='block';win.querySelector('.go').disabled=true;
 const step=()=>{if(!open||!C.fire){cooking=null;return}bar.style.transition='none';bar.style.width='0';void bar.offsetWidth;bar.style.transition='width '+sec+'s linear';bar.style.width='100%';
  cooking={t:setTimeout(()=>{const res=resultOf(r);if(maxQty(r)<1){cooking=null;render();return}const out=F.cookNow(r,res);cooking=null;if(!out){render();return}left--;if(left>0&&maxQty(r)>0){cooking={};step()}else{qty=1;render()}},sec*1000)}};cooking={};step()}
/* consume the picked stacks and add ONE dish (shared by the window and the tests) */
F.cookNow=function(r,res){try{res=res||resultOf(r);if((window.QBAG222?QBAG222.used(P):P.inv.length)>=P.invSize&&!P.inv.some(it=>it.id===res.id)){try{log('กระเป๋าเต็ม ทำอาหารต่อไม่ได้','r')}catch(_){}return null}
 r.ing.forEach((a,i)=>{const p=res.ings[i].it;if(p){p.q-=a[1]}});for(let i=P.inv.length-1;i>=0;i--)if(P.inv[i]&&P.inv[i].q<=0)P.inv.splice(i,1);
 if(res.id!==r.out)regDerived(res.id);if(!addItem({id:res.id,q:1}))return null;F.stats.cooked++;F.last={dish:res.id,pool:res.pool};try{textAt(P.x,P.y-60,'+ '+(ITEMS[res.id]||{}).n,'#ffd98a',16);log('ทำ '+(ITEMS[res.id]||{}).n+' สำเร็จ','g')}catch(_){}try{if(G.win==='wInv')renderInv()}catch(_){}return res.id}catch(e){ERR('cookNow',e);return null}};
win.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target===win)F.closeWin();return}if(b.disabled||cooking)return;const a=b.dataset.a;const L=recList(),sel=L[selR];try{
 if(a==='close')F.closeWin();else if(a==='rec'){selR=+b.dataset.i;qty=1;render()}
 else if(a==='pick'){const i=+b.dataset.r,j=+b.dataset.j,ch=slotChoices(sel.ing[i]);if(ch[j]&&ch[j].ok)picks[sel.id+'|'+i]=ch[j].it;render()}
 else if(a==='mn'){qty=Math.max(1,qty-1);render()}else if(a==='pl'){qty=Math.min(Math.max(1,maxQty(sel)),qty+1);render()}else if(a==='mx'){qty=Math.max(1,maxQty(sel));render()}
 else if(a==='go')doCook()}catch(er){ERR('click',er)}});
/* take over from the r130 window: it opens (display flex) -> hide it and open ours */
function takeOver(){try{const old=document.getElementById('cookWin');if(!old||old._f183)return false;old._f183=1;new MutationObserver(()=>{if(old.style.display==='flex'&&(F.status||F.recipes)){old.style.display='none';F.openWin()}}).observe(old,{attributes:true,attributeFilter:['style']});return true}catch(e){return false}}
addEventListener('keydown',e=>{try{if(!open)return;if(e.key==='Escape'){F.closeWin();e.stopImmediatePropagation();e.preventDefault();return}if(!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')){e.stopImmediatePropagation();e.preventDefault()}}catch(_){}},true);
/* learn a recipe scroll */
try{const _u=useItemId;useItemId=function(id){try{if(typeof id==='string'&&id.indexOf('recipe_')===0){const rid=id.slice(7),r=R.find(x=>x.id===rid);if(r&&F.recipes){if(isKnown(r)){try{log('รู้สูตร '+r.n+' อยู่แล้ว','v')}catch(_){}return}if(countItem(id)>0){takeItem(id,1);F.learn(rid);try{log('เรียนสูตร '+r.n+' แล้ว · ทำได้ที่กองไฟ','g');textAt(P.x,P.y-60,'เรียนสูตร '+r.n,'#ffe9b0',16);if(G.win==='wInv')renderInv()}catch(_){}}return}}}catch(e){ERR('use recipe',e)}return _u.apply(this,arguments)}}catch(e){ERR('hook use',e)}
/* ======================= tank fish: statuses carried by the tank record, panel shows them ======================= */
function fishPanel(){try{const FT=window.__FISHTANK,pn=document.getElementById('ftFish');if(!FT||!FS||!pn)return;pn._mine=1;if(window.__F184&&__F184.panelOn&&__F184.panel){try{__F184.panel(pn)}catch(e){}return}const icon=id=>{const c=document.createElement('canvas');c.width=64;c.height=64;try{const it=ITEMS[FS.cfg.fish[id].item];if(it&&it.icon)it.icon(c.getContext('2d'))}catch(_){}return c};
 pn.innerHTML='';const mk=(t)=>{const h=document.createElement('h4');h.textContent=t;pn.appendChild(h)};mk('ปลาในกระเป๋า (กดเพื่อใส่ตู้)');let any=false;
 for(const x of stacksOf(fishItems())){const sp=fishByItem()[x.it.id],f=FS.cfg.fish[sp];if(!f)continue;any=true;const row=document.createElement('div');row.className='row';row.appendChild(icon(sp));const nm=document.createElement('div');nm.innerHTML='<span style="color:'+FS.cfg.rar[f.r].col+'">'+esc(f.n)+'</span> ×'+x.q+(x.st?'<br><span style="color:#ffd98a;font-size:11px">✦ '+esc(txtSt(x.st,isShinyId(sp)))+'</span>':'');row.appendChild(nm);const b=document.createElement('button');b.type='button';b.textContent='ใส่ตู้';b.addEventListener('click',()=>{F.tankPutSt(x.it)});row.appendChild(b);pn.appendChild(row)}
 if(!any){const d=document.createElement('div');d.className='x';d.textContent='ไม่มีปลาในกระเป๋า · ตกปลาที่บ่อในลานก่อน';pn.appendChild(d)}
 mk('ปลาในตู้ (กดเพื่อเอากลับกระเป๋า)');const lst=FT.fishList();if(!lst.length){const d=document.createElement('div');d.className='x';d.textContent='ตู้ยังว่างอยู่';pn.appendChild(d)}
 for(const rec of lst){const f=FS.cfg.fish[rec.sp];if(!f)continue;const row=document.createElement('div');row.className='row';row.appendChild(icon(rec.sp));const nm=document.createElement('div');nm.innerHTML='<span style="color:'+FS.cfg.rar[f.r].col+'">'+esc(f.n)+'</span>'+(rec.st&&rec.st.length?'<br><span style="color:#ffd98a;font-size:11px">✦ '+esc(txtSt(rec.st,isShinyId(rec.sp)))+'</span>':'');row.appendChild(nm);const b=document.createElement('button');b.type='button';b.textContent='เอาออก';b.addEventListener('click',()=>FS.tankTake(rec.u));row.appendChild(b);pn.appendChild(row)}
 }catch(e){ERR('fishPanel',e)}}
F.fishPanel=fishPanel;
F.tankPutSt=function(it){try{const FT=window.__FISHTANK,sp=fishByItem()[it.id],f=FS.cfg.fish[sp];if(!FT||!f)return {ok:false,why:'none'};if(!P.inv.includes(it)||it.q<1){FS.say&&FS.say('ไม่มี'+f.n+'ในกระเป๋า',true);return {ok:false,why:'bag'}}
 if(FT.fishList().length>=FT.cfg.cap){try{FT.say(FT.msgs.full,true)}catch(_){}return {ok:false,why:'full'}}
 const st=it.st?JSON.parse(JSON.stringify(it.st)):null;it.q-=1;if(it.q<=0){const i=P.inv.indexOf(it);if(i>=0)P.inv.splice(i,1)}
 const r=FT.addFish(sp,{src:'bag'});if(!r.ok){addStat(st?{id:f.item,q:1,st}:{id:f.item,q:1});return r}if(st)r.rec.st=st;try{FT.say('ใส่'+f.n+'ลงตู้แล้ว')}catch(_){}try{if(G.win==='wInv')renderInv()}catch(_){}try{H.save()}catch(_){}fishPanel();return {ok:true,rec:r.rec}}catch(e){ERR('tankPutSt',e);return {ok:false,why:'err'}}};
function wrapFishApi(){try{if(!FS||FS._f183)return false;FS._f183=1;const _put=FS.tankPut;FS.tankPut=function(id){const f=FS.cfg.fish[id];if(!f)return _put.apply(this,arguments);const ch=stacksOf([f.item]).sort((a,b)=>(a.st?1:0)-(b.st?1:0));if(!ch.length){try{FS.say&&FS.say('ไม่มี'+f.n+'ในกระเป๋า',true)}catch(_){}return {ok:false,why:'bag'}}return F.tankPutSt(ch[0].it)};
  const _take=FS.tankTake;FS.tankTake=function(u){try{const FT=window.__FISHTANK,rec=FT.fishList().find(x=>x.u===u);if(!rec||!rec.st||!rec.st.length){const r=_take.apply(this,arguments);fishPanel();return r}const f=FS.cfg.fish[rec.sp];if(!addStat({id:f.item,q:1,st:rec.st})){try{FS.say&&FS.say('กระเป๋าเต็ม · เอาปลาออกไม่ได้',true)}catch(_){}return {ok:false,why:'bagFull'}}FT.removeFish(u);try{FT.say('เอา'+f.n+'กลับใส่กระเป๋าแล้ว')}catch(_){}fishPanel();return {ok:true}}catch(e){ERR('tankTake',e);return {ok:false}}};
  return true}catch(e){ERR('wrapFishApi',e);return true}}
function watchPanel(){try{const pn=document.getElementById('ftFish');if(!pn||pn._f183)return false;pn._f183=1;const mo=new MutationObserver(()=>{if(pn._busy)return;pn._busy=1;try{fishPanel()}finally{setTimeout(()=>{pn._busy=0},0)}});mo.observe(pn,{childList:true});return true}catch(e){return false}}
/* ======================= buff chip shows the statuses ======================= */
function chipTick(){try{const chip=document.getElementById('cookBuff');if(!chip||chip.style.display==='none')return;const b=P.buffs&&P.buffs.food;if(!b)return;const it=ITEMS[b.food];if(window.__F184&&__F184.chip)__F184.chip(chip,b,it);else if(it&&it.stTxt&&chip.textContent.indexOf(it.stTxt)<0)chip.textContent+=' · ✦ '+it.stTxt}catch(_){}}
/* ======================= boot ======================= */
const ready=()=>!!(C&&C.on&&C.recipes&&FS&&FS.cfg&&H&&H.on);
F.ok=ready();
if(!F.ok){F.err='cook / fishing / housing module missing';F.ready=true;return}
for(const r of R)regDish(r);for(const r of R)if(!r.known)regRecipeItem(r);
if(F.recipes)hooks();else hooks();
syncRecipes();setTimeout(syncRecipes,1500);setTimeout(syncRecipes,5000);
{let n=0;const iv=setInterval(()=>{const a=wrapFishApi(),b=watchPanel(),c=takeOver(),d=shopHook(),e=helperHook();if((a&&b&&c&&d&&e)||++n>120)clearInterval(iv)},500)}
setInterval(scanDerived,700);scanDerived();
{const _up=update;update=function(dt){const r=_up.apply(this,arguments);try{chipTick();if(open){const f=C.fire;if(!f||!f.lit||Math.hypot(f.x-P.x,f.y-P.y)>(C.cfg.FIRE_INTERACT||95)+80)F.closeWin();else tmTick()}guardCheck()}catch(e){ERR('tick',e)}return r}}
/* ---- GM / tests ---- */
F.give=function(id,q,st){const it={id,q:q||1};if(st)it.st=canon(st);return addItem(it)};
F.simRoll=function(src,n,rnd){const o={n,none:0,c1:0,c2:0,c3:0,stat:{}};for(let i=0;i<n;i++){const s=F.roll(src,rnd);if(!s.length)o.none++;else if(s.length===1)o.c1++;else if(s.length===2)o.c2++;else o.c3++;for(const a of s)o.stat[a[0]]=(o.stat[a[0]]|0)+1}return o};
if(F.gm){let n=0;const iv=setInterval(()=>{try{const gm=document.getElementById('houseGm');if(gm&&!gm.dataset.f183){gm.dataset.f183='1';const mk=(t,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.style.cssText='font-size:11px;margin:1px;padding:2px 5px';for(const ev of ['pointerdown','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();fn()});gm.appendChild(b)};mk('🍲 GM: วัตถุดิบ+สถานะ',()=>{for(const id of ['wheat','potato','onion','tomato','cabbage','mistCarrot','mtGrape','indigoBerry','goldPeach','farmApple','boarMeat','puffcapMush','slimeJelly','tenderLeaf','mossHerb','sweetRoot','riverFish'])addItem({id,q:6});F.give('wheat',4,[['atk',1]]);F.give('potato',4,[['crit',1],['hp',1]]);for(const sp of ['pondCarp','silverPerch','goldenLanternfish','cloudDragon','pondCarp_s']){const f=FS.cfg.fish[sp];if(f){F.give(f.item,2,[['atk',F.cfg.lvOf[f.r]],['def',F.cfg.lvOf[f.r]]]);addItem({id:f.item,q:2})}}});mk('📜 GM: เรียนสูตรทั้งหมด',()=>{for(const r of R)F.learn(r.id)});clearInterval(iv)}else if(++n>60)clearInterval(iv)}catch(_){clearInterval(iv)}},1000)}
F.ready=true;
})();

