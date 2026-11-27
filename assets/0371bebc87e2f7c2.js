
/* ---- cards2-r1 (TEST, 12 Nov 2026): full monster-card system (Balance cards_r1.json FINAL, approved by DeaRz 11 Nov 23:11) ----
   * DROPS: 0.1 % per kill for every card (bosses included, not affected by drop boosts); boss pity: guaranteed on the 100th kill of that boss without its card, counter per boss per character (localStorage 'lanternfall_mcard_v1', keyed slot+name), reset when the card drops;
   * SLOTS on gear (new "monster card slots", it.mc = [slug,...], separate from the old card/card2 sockets): rarity grade 0-1 (Common, Uncommon) = 0 slots; 2-4 (Rare, Epic, Legend) = 1 slot; 5-6 (Mythic, Immortal) = 2 slots;
     insert from the card panel or the gear panel, only into gear whose slot matches the card's slot (head card = any head piece); removal at the Master Smith (card tab) for item Lv x 50 G, the card returns to the bag;
   * EFFECTS applied in recalc (+ hooks): totals of INSERTED cards are capped (atk/def/maxHP 30 %, aspd 10, crit 5, move 10, exp 10, allDmg 10, every resist 50), then the COLLECTION bonus (owning >= 1 copy, permanent, capped 10 % per stat) is added on top; keys supported: atk% def% maxHP% maxMP% aspd% crit% critDmg% eva% move% hpRegen% mpRegen% exp% allDmg% bossDmg% resFire/Water/Poison/Dark% (no key unsupported);
   * BOSS "special" procs only while the card is inserted: water wave (veilwater_serpent), crystal shield (crystal_golem), heal per kill (tide_guardian), spore cloud (mushroom_king), ignite (forge_titan), x2 hit every 10 s (shadow_demon_lord);
   * GM (?gm=on): give all cards, set pity, 2-slot test gear; ?cards=off disables everything (incl. the r1 card view). Debug: window.__CARDSYS ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]cards=off\b/.test(Q);
const CS=window.__CARDSYS={ver:'cards2-r1',on:!OFF,err:null,log:[],stats:{drops:0,pityDrops:0,procs:{}},T:{},B:{},sp:{}};
if(OFF)return;
const ERR=(w,e)=>{CS.err=w+': '+((e&&e.message)||e);try{console.error('[CARDS2]',w,e)}catch(_){}};
const II=()=>window.__ITEMINFO,CD=()=>window.__CARDS;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CAP={'atk%':30,'def%':30,'maxHP%':30,'aspd%':10,'crit%':5,'move%':10,'exp%':10,'allDmg%':10,'resFire%':50,'resWater%':50,'resPoison%':50,'resDark%':50},COLCAP=10,PITY=100,RATE=.001;
const SLOTCAT=s=>s==='headTop'?'head':s;
/* ---------- helpers: data of a card item ---------- */
function cardOfId(id){const c=CD()&&CD().items&&CD().items[id];return c||null}
function dataOf(c){return c&&II()&&II().cardData?II().cardData(c):null}
function slugOf(id){const c=cardOfId(id);const d=dataOf(c);return d?d.slug:(c?c.slug:null)}
function dataBySlug(slug){const D=CD()&&CD().data;return D&&D[slug]||null}
function itemIdOfSlug(slug){const items=CD()&&CD().items||{};for(const id in items){const d=dataOf(items[id]);if(d&&d.slug===slug)return id}return null}
function nameOf(slug){const d=dataBySlug(slug);return d?d.name_th:slug}
const isGear=it=>!!it&&(it.kind==='wpn'||it.kind==='eq');
function nSlots(it){if(!isGear(it))return 0;const r=it.rar|0;if(r<=1)return 0;return(r>=5&&it.drilled)?2:1}
CS.nSlots=nSlots;
const catOfGear=it=>slotCat(it);
function accepts(it,slug){const d=dataBySlug(slug);return !!(d&&isGear(it)&&SLOTCAT(d.slot)===catOfGear(it))}
/* ---------- per-character persistence (pity + collection) ---------- */
const SK='lanternfall_mcard_v1';   /* legacy per-slot key: only read once to migrate old test data */
const charKey=()=>{try{if(typeof CH!=='undefined'&&CH&&CH.cur>=0&&CH.list&&CH.list[CH.cur])return CH.cur+':'+(CH.list[CH.cur].name||'')}catch(_){}return 'solo'};
const readAll=()=>{try{return JSON.parse(localStorage.getItem(SK)||'{}')||{}}catch(_){return {}}};
/* the data now lives INSIDE the character's own save (SAVE_KEY json, field "mc"): chStash copies that string into CH.list[i].save, so it travels with the character (switch / copy / delete) */
function readSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null}catch(_){return null}}
function init(){if(!P)return false;if(P._mcInit===1&&P._mcKey===charKey())return true;const sv=readSave();let m=sv&&sv.mc;if(!m){const old=readAll()[charKey()];if(old)m=old}m=m||{};P.mcPity=Object.assign({},m.pity||{});P.mcOwned=Object.assign({},m.owned||{});P._mcInit=1;P._mcKey=charKey();return true}
function persist(){try{if(!P||P._mcInit!==1)return;const sv=readSave();if(!sv)return;sv.mc={pity:P.mcPity,owned:P.mcOwned};localStorage.setItem(SAVE_KEY,JSON.stringify(sv))}catch(e){ERR('persist',e)}}
try{const _sg=saveGame;saveGame=function(){const r=_sg.apply(this,arguments);try{if(P&&P._mcInit===1&&!P.dead)persist()}catch(_){}return r}}catch(e){ERR('hook saveGame',e)}CS.persist=persist;CS.init=init;
/* ---------- totals ---------- */
function insertedList(){const out=[];if(!P)return out;const seen=new Set();const add=it=>{if(isGear(it)&&it.mc&&!seen.has(it)){seen.add(it);for(const s of it.mc)out.push(s)}};add(P.weapon);if(P.equip)for(const k in P.equip)add(P.equip[k]);return out}
function totals(){const ins={},col={};for(const s of insertedList()){const d=dataBySlug(s);if(!d)continue;for(const e of d.effects||[]){if(e.stat==='special')continue;ins[e.stat]=(ins[e.stat]||0)+(+e.val||0)}}
  for(const s in (P.mcOwned||{})){const d=dataBySlug(s);if(!d)continue;for(const e of d.collect||[]){col[e.stat]=(col[e.stat]||0)+(+e.val||0)}}
  const tot={},keys=new Set([...Object.keys(ins),...Object.keys(col)]);
  for(const k of keys){const ci=CAP[k]!=null?Math.min(CAP[k],ins[k]||0):(ins[k]||0);tot[k]=ci+Math.min(COLCAP,col[k]||0)}
  return{ins,col,tot}}
CS.totals=()=>{init();return totals()};
/* ---------- recalc ---------- */
const SPEC={veilwater_serpent:'wave',crystal_golem:'shield',tide_guardian:'killHeal',mushroom_king:'spore',forge_titan:'ignite',shadow_demon_lord:'x2'};
function applyAll(){init();try{for(const g of gearList())migrate(g.it)}catch(_){}/* owned: anything in the bag or inserted */let ch=false;for(const it of P.inv||[]){if(it&&it.id){const s=slugOf(it.id);if(s&&!P.mcOwned[s]){P.mcOwned[s]=1;ch=true}}}for(const s of insertedList())if(!P.mcOwned[s]){P.mcOwned[s]=1;ch=true}if(ch)persist();
  const {tot}=totals();CS.last=tot;const v=k=>(tot[k]||0)/100;
  CS.B={atk:v('atk%'),matk:v('atk%'),aspd:v('aspd%'),crit:tot['crit%']||0,critDmg:v('critDmg%'),speed:v('move%')};
  CS.eva=v('eva%');CS.exp=v('exp%');CS.allDmg=v('allDmg%');CS.bossDmg=v('bossDmg%');CS.hpRegen=v('hpRegen%');CS.mpRegen=v('mpRegen%');
  if(tot['def%'])P.def=Math.round(P.def*(1+v('def%')));
  if(tot['maxHP%']){P.maxHp=Math.round(P.maxHp*(1+v('maxHP%')))}
  if(tot['maxMP%']){P.maxMp=Math.round(P.maxMp*(1+v('maxMP%')))}
  if(P.cfx&&P.cfx.redEle){for(const [k,ele] of [['resFire%','fire'],['resWater%','water'],['resPoison%','poison'],['resDark%','dark']]){const x=v(k);if(x){for(const key of [ele,ele[0].toUpperCase()+ele.slice(1)])P.cfx.redEle[key]=(P.cfx.redEle[key]||0)+x}}}
  const sp={};for(const s of insertedList()){if(SPEC[s])sp[SPEC[s]]=1}CS.sp=sp}
try{const _rc=recalc;recalc=function(){if(!P||!P.inv)return _rc.apply(this,arguments);const hr=P.maxHp?P.hp/P.maxHp:1,mr=P.maxMp?P.mp/P.maxMp:1;const r=_rc.apply(this,arguments);try{applyAll();P.hp=Math.min(P.maxHp,Math.max(1,Math.round(hr*P.maxHp)));P.mp=Math.min(P.maxMp,Math.round(mr*P.maxMp))}catch(e){ERR('recalc',e)}return r}}catch(e){ERR('hook recalc',e)}
try{const _B=B;B=function(k){let v=_B.apply(this,arguments);const x=CS.B&&CS.B[k];return x?v+x:v}}catch(e){ERR('hook B',e)}
try{const _d=dodgeChance;dodgeChance=function(){let v=_d.apply(this,arguments);return CS.eva?Math.min(.75,v+CS.eva):v}}catch(e){ERR('hook dodge',e)}
try{const _g=gainExp;gainExp=function(x){if(CS.exp)arguments[0]=Math.round(x*(1+CS.exp));return _g.apply(this,arguments)}}catch(e){ERR('hook exp',e)}
try{if(window.C182){const _h=C182.regenTick;C182.regenTick=function(dt){const h0=P.hp,r=_h.apply(this,arguments);if(CS.hpRegen&&P.hp>h0)P.hp=Math.min(P.maxHp,P.hp+(P.hp-h0)*CS.hpRegen);return r};const _m=C182.mpRegen;C182.mpRegen=function(){let v=_m.apply(this,arguments);return CS.mpRegen?v*(1+CS.mpRegen):v}}}catch(e){ERR('hook regen',e)}
/* ---------- damage: allDmg / bossDmg / x2 / ignite ---------- */
const isBoss=e=>!!(e&&((e.m&&e.m.boss)||e.gateBoss));
const pc=(k)=>{CS.stats.procs[k]=(CS.stats.procs[k]||0)+1};
try{const _ad=applyDamage;applyDamage=function(e,d,crit,o){if(!P||!e||(o&&o.cardProc))return _ad.apply(this,arguments);let m=1;if(CS.allDmg)m*=1+CS.allDmg;if(CS.bossDmg&&isBoss(e))m*=1+CS.bossDmg;
  if(CS.sp&&CS.sp.x2&&!(o&&o.dot)&&time>=(CS.T.x2||0)){m*=2;CS.T.x2=time+10;pc('x2');try{textAt(e.x,e.y-e.sz*2.8,'×2','#ffd36b',22,{life:.9})}catch(_){}}
  if(m!==1)d=Math.max(1,Math.round(d*m));const r=_ad.call(this,e,d,crit,o);
  if(crit&&CS.sp&&CS.sp.ignite&&!e.dead&&rng()<.2){e._ign={t:3,acc:0};pc('ignite');try{textAt(e.x,e.y-e.sz*2.6,'ติดไฟ','#ff9a3d',14,{life:.8})}catch(_){}}
  return r}}catch(e){ERR('hook applyDamage',e)}
/* ---------- basic attack: water wave ---------- */
try{const _ba=basicAttack;basicAttack=function(){const cd0=P.atkCd,r=_ba.apply(this,arguments);try{if(CS.sp&&CS.sp.wave&&P.atkCd>cd0&&rng()<.05){pc('wave');ring(P.x,P.y,10,120,.6,'#6ad4ff',6);textAt(P.x,P.y-60,'คลื่นน้ำ','#6ad4ff',16,{life:.9});for(const e of enemies){if(e.dead||Math.hypot(e.x-P.x,e.y-P.y)>120+(e.sz||0))continue;hitEnemy(e,1.5,{cardProc:1})}}}catch(er){ERR('wave',er)}return r}}catch(e){ERR('hook basicAttack',e)}
/* ---------- when hit: crystal shield ---------- */
try{const _hp=hurtPlayer;hurtPlayer=function(raw,src){const h0=P.hp,s0=P.shield||0,r=_hp.apply(this,arguments);try{if(CS.sp&&CS.sp.shield&&(P.hp<h0||(P.shield||0)<s0)&&time>=(CS.T.sh||0)&&rng()<.1){const a=Math.round(P.maxHp*.08);P.shield=(P.shield||0)+a;CS.T.sh=time+10;CS.T.shEnd=time+5;CS.T.shAmt=a;pc('shield');ring(P.x,P.y,10,60,.5,'#9fe8ff',5);textAt(P.x,P.y-50,'เกราะคริสตัล','#9fe8ff',14,{life:.9})}}catch(er){ERR('shield',er)}return r}}catch(e){ERR('hook hurtPlayer',e)}
/* ---------- update: DoT ticks, shield expiry ---------- */
const clouds=[];
try{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{
  if(CS.T.shEnd&&time>=CS.T.shEnd){P.shield=Math.max(0,(P.shield||0)-(CS.T.shAmt||0));CS.T.shEnd=0;CS.T.shAmt=0}
  const atk=P.atk*(1+(B('atk')||0));
  for(const e of enemies){if(e._ign){if(e.dead){e._ign=null;continue}e._ign.t-=dt;e._ign.acc+=dt;if(e._ign.acc>=.5){e._ign.acc-=.5;applyDamage(e,Math.max(1,Math.round(atk*.3*.5)),false,{dot:true,cardProc:1});try{textAt(e.x,e.y-e.sz*2,'🔥','#ff9a3d',11,{life:.5})}catch(_){}}if(e._ign.t<=0)e._ign=null}}
  for(let i=clouds.length-1;i>=0;i--){const c=clouds[i];c.t-=dt;c.acc+=dt;if(c.acc>=.5){c.acc-=.5;ring(c.x,c.y,20,150,.5,'#7dff8a',4);for(const e of enemies){if(e.dead||Math.hypot(e.x-c.x,e.y-c.y)>150+(e.sz||0))continue;applyDamage(e,Math.max(1,Math.round(atk*.5*.5)),false,{dot:true,cardProc:1})}}if(c.t<=0)clouds.splice(i,1)}
  }catch(er){ERR('update',er)}return r}}catch(e){ERR('hook update',e)}
/* ---------- kill: drops + pity + heal + spore ---------- */
const CARDOF={};function cardForEnemy(e){const t=e&&e.type;if(!t)return null;if(t in CARDOF)return CARDOF[t];let hit=null;const items=CD()&&CD().items||{};const norm=s=>String(s||'').replace(/\([^)]*\)/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');const bare=norm(String(t).replace(/^(g\d_|gb_|ge_|gp_)/,'')),nm=norm(e.m&&e.m.n);
  for(const id in items){const c=items[id];if(c.mob&&c.mob===t){hit=id;break}}
  if(!hit)for(const id in items){const c=items[id];if(norm(c.slug)===bare||norm(c.monster)===nm||norm(c.monster)===bare){hit=id;break}}
  CARDOF[t]=hit;return hit}
CS.cardForEnemy=cardForEnemy;
function giveCard(id,where){const ok=addItem({id,q:1});try{const d=dataOf(cardOfId(id));log('ได้รับ '+(d?d.name_th:id)+'!','g');textAt(P.x,P.y-70,'ได้การ์ด '+(d?d.name_th:''),'#ffd36b',16,{life:1.6})}catch(_){}return ok}
try{const _k=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=_k.apply(this,arguments);try{if(!P||!e||was||!e.dead||e.summoned||e.dev||e.raidB)return r;init();
  if(CS.sp.killHeal){P.hp=Math.min(P.maxHp,P.hp+Math.round(P.maxHp*.01));pc('killHeal')}
  if(CS.sp.spore&&rng()<.1){clouds.push({x:e.x,y:e.y,t:3,acc:0});pc('spore');ring(e.x,e.y,10,150,.6,'#7dff8a',5)}
  const id=cardForEnemy(e);if(id){const s=slugOf(id),d=dataBySlug(s),boss=!!(d&&(d.boss||(cardOfId(id)||{}).boss));let drop=false;
    if(boss&&isBoss(e)){P.mcPity[s]=(P.mcPity[s]||0)+1;if(P.mcPity[s]>=PITY){drop=true;CS.stats.pityDrops++}else if(rng()<RATE)drop=true;if(drop)P.mcPity[s]=0;persist()}
    else if(rng()<RATE)drop=true;
    if(drop){CS.stats.drops++;dropLoot(e.x,e.y,{item:{id,q:1},rare:1});CS.log.push({t:Date.now(),slug:s,pity:boss})}}
  }catch(er){ERR('kill',er)}return r}}catch(e){ERR('hook killEnemy',e)}
/* ---------- insert / remove ---------- */
function insertCard(it,id){init();const slug=slugOf(id);if(!slug||!isGear(it))return{ok:false,msg:'ใส่ไม่ได้'};const n=nSlots(it);if(!n)return{ok:false,msg:'อุปกรณ์ชิ้นนี้ไม่มีช่องการ์ด'};it.mc=it.mc||[];if(it.mc.length>=n)return{ok:false,msg:'ช่องเต็มแล้ว'};if(!accepts(it,slug))return{ok:false,msg:'ประเภทการ์ดไม่ตรงกับอุปกรณ์'};if(!takeItem(id,1))return{ok:false,msg:'ไม่มีการ์ดในกระเป๋า'};
  it.mc.push(slug);P.mcOwned[slug]=1;persist();recalc();try{saveGame()}catch(_){}try{ring(P.x,P.y,10,100,.5,'#ff8ae0',5);sfx('level')}catch(_){}return{ok:true,msg:'ใส่ '+nameOf(slug)+' แล้ว'}}
CS.insert=insertCard;
/* ---------- r8: break / drill / removal (DeaRz rules 12 Nov) ----------
   base slots: grade 0-1 = 0, grades 2-6 (Rare..Immortal) = 1; Mythic / Immortal can be DRILLED once at the Master Smith to 2 slots (it.drilled = 1): 30 % success, failure = the item breaks (cards inside lost), fee item Lv x100 G per attempt (placeholder);
   removing a card at the smith = 50/50: (a) the item breaks, the card(s) return to the bag, or (b) the card breaks, the item stays; fee Lv x50 G per attempt. In-page confirm dialog, toast + FX. GM toggles: CS.opt.drill auto|100|0, CS.opt.remove random|a|b. */
CS.opt={drill:'auto',remove:'random'};
function migrate(it){if(isGear(it)&&it.mc&&it.mc.length>=2&&!it.drilled&&(it.rar|0)>=5){it.drilled=1;CS.log.push({t:Date.now(),migrated:it.uid})}}
const canDrill=it=>isGear(it)&&(it.rar|0)>=5&&!it.drilled;
CS.canDrill=canDrill;
function breakItem(it){const name=itemName(it);if(P.weapon===it)P.weapon=fist();else for(const k in (P.equip||{}))if(P.equip[k]===it)P.equip[k]=null;const i=P.inv.indexOf(it);if(i>=0)P.inv.splice(i,1);return name}
function fxShatter(){try{shake(9);ring(P.x,P.y,10,160,.6,'#ff4f6a',8);for(let k=0;k<26;k++)part({x:P.x+rand(-10,10),y:P.y-20,vx:rand(-220,220),vy:rand(-260,40),life:rand(.5,1),max:1,size:rand(2,5),col:pick(['#b8c4d8','#8a96aa','#ff8a8a']),type:'debris',grav:600,rot:rand(0,6),vr:rand(-8,8),drag:.97});sfx('hurt')}catch(e){ERR('fx',e)}}
function fxSparkle(){try{emitThemed(P.x,P.y-20,THEMES.holy,28,220);ring(P.x,P.y,10,120,.7,'#ffe9a0',6);fx.push({k:'pillar',x:P.x,y:P.y,t:0,dur:1.1,col:'#ffe08a',w:60,h:340});sfx('level')}catch(e){ERR('fx',e)}}
/* confirm dialog (in page) */
let dlg=null,dlgCb=null;
function dlgEl(){if(dlg)return dlg;dlg=document.createElement('div');dlg.id='csDlg';dlg.style.cssText='position:fixed;inset:0;z-index:9800;display:none;align-items:center;justify-content:center;background:rgba(3,5,14,.7)';document.body.appendChild(dlg);
  dlg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-dlg]');if(e.target===dlg||(b&&b.dataset.dlg==='no')){dlg.style.display='none';dlgCb=null;return}if(b&&b.dataset.dlg==='ok'){const cb=dlgCb;dlg.style.display='none';dlgCb=null;try{cb&&cb()}catch(er){ERR('dlg',er)}}});return dlg}
function dialog(o,cb){const d=dlgEl();dlgCb=cb;d.innerHTML=`<div style="width:min(92vw,380px);box-sizing:border-box;padding:16px;border-radius:16px;text-align:center;background:linear-gradient(165deg,rgba(40,14,24,.98),rgba(8,10,28,.98));border:1px solid rgba(255,107,139,.6);box-shadow:0 0 36px rgba(255,79,106,.3);color:var(--text,#e4f1ff);font:13px/1.5 'Noto Sans Thai',system-ui,sans-serif">
  <h4 style="margin:0 0 8px;color:#ffb0c0;font-size:15px">${esc(o.title)}</h4>
  <div style="display:flex;gap:12px;justify-content:center;align-items:center"><div><img src="${esc(o.icon)}" width="56" height="56" alt="" style="object-fit:contain"><div style="font-weight:700;color:${esc(o.col||'#fff')}">${esc(o.name)}</div></div>${o.icon2?`<div style="font-size:20px">＋</div><div><img src="${esc(o.icon2)}" width="56" height="56" alt="" style="object-fit:contain"><div style="font-weight:700;color:#ffd36b">${esc(o.name2||'')}</div></div>`:''}</div>
  <div style="margin:10px 0;padding:10px;border-radius:12px;background:rgba(0,0,0,.35)">${o.lines.map(l=>`<div>${l}</div>`).join('')}<div style="margin-top:6px;color:#ff6b8b;font-weight:700">${esc(o.red)}</div></div>
  <div style="display:flex;gap:10px;justify-content:center"><button data-dlg="no" style="flex:1;padding:9px;border-radius:10px;border:1px solid rgba(143,164,204,.5);background:rgba(255,255,255,.05);color:inherit;font:inherit;font-weight:700;cursor:pointer">${esc(o.no||'ยกเลิก')}</button><button data-dlg="ok" style="flex:1;padding:9px;border-radius:10px;border:1px solid #ff6b8b;background:rgba(255,107,139,.18);color:#ffd0d8;font:inherit;font-weight:700;cursor:pointer">${esc(o.ok)}</button></div></div>`;d.style.display='flex'}
CS.dialog=dialog;
function afterAction(){try{if(II()&&II().refresh)II().refresh()}catch(_){}try{if(G.win==='wInv')renderInv()}catch(_){}try{if(G.win==='wRefine')renderRefine()}catch(_){}try{renderCardTab()}catch(_){}}
/* ---- drill ---- */
function drillAsk(uid){const it=findGear(uid);if(!it||!canDrill(it)){try{notify('เจาะไม่ได้',true)}catch(_){}return}const fee=(it.lvl||1)*100;
  dialog({title:'⚠ เจาะช่องการ์ด',icon:itemIcon(it),name:itemName(it),col:rarCol(it.rar),lines:['โอกาสสำเร็จ <b style="color:#8dffc8">30%</b>','ค่าเจาะ '+fee.toLocaleString()+' G (เสียทุกครั้ง)'],red:'ถ้าไม่สำเร็จ ไอเท็มจะแตกและหายไป (การ์ดที่ใส่อยู่หายด้วย)',ok:'เจาะ',no:'ยกเลิก'},()=>drillDo(it))}
function drillDo(it){init();const fee=(it.lvl||1)*100;if(!canDrill(it))return CS.lastResult={ok:false,msg:'เจาะไม่ได้'};if(P.gold<fee){try{notify('Gold ไม่พอ ('+fee+' G)',true)}catch(_){}return}
  P.gold-=fee;const m=CS.opt.drill,roll=m==='100'?true:m==='0'?false:rng()<.3,name=itemName(it);let msg;
  if(roll){it.drilled=1;recalc();msg='เจาะสำเร็จ! '+name+' มีช่องการ์ด 2 ช่อง';fxSparkle()}
  else{const lost=(it.mc||[]).length;breakItem(it);recalc();msg='💥 เจาะล้มเหลว — '+name+' แตกและหายไป'+(lost?' (การ์ด '+lost+' ใบหายด้วย)':'');fxShatter()}
  CS.lastResult={ok:roll,msg,kind:'drill'};CS.stats.drill=(CS.stats.drill||0)+1;try{notify(msg,!roll)}catch(_){}try{log(msg,roll?'g':'r')}catch(_){}try{saveGame()}catch(_){}afterAction()}
/* ---- removal ---- */
function removeAsk(uid,idx){const it=findGear(uid);if(!it||!it.mc||!it.mc[idx])return;const s=it.mc[idx],cid=itemIdOfSlug(s),c=cardOfId(cid),fee=(it.lvl||1)*50;
  dialog({title:'⚠ ถอดการ์ด',icon:itemIcon(it),name:itemName(it),col:rarCol(it.rar),icon2:c?c.icon:'',name2:nameOf(s),lines:['ค่าถอด '+fee.toLocaleString()+' G (เสียทุกครั้ง)'],red:'50% ของแตก (ได้การ์ดคืน) / 50% การ์ดแตก (ของอยู่)',ok:'ถอด',no:'ยกเลิก'},()=>removeDo(it,idx))}
function removeDo(it,idx){init();const fee=(it.lvl||1)*50;if(!it.mc||!it.mc[idx])return;if(P.gold<fee){try{notify('Gold ไม่พอ ('+fee+' G)',true)}catch(_){}return}
  P.gold-=fee;const m=CS.opt.remove,itemBreaks=m==='a'?true:m==='b'?false:rng()<.5,slug=it.mc[idx],name=itemName(it);let msg;
  if(itemBreaks){const cards=it.mc.slice();breakItem(it);for(const s of cards){const id=itemIdOfSlug(s);if(id)addItem({id,q:1})}recalc();msg='💥 '+name+' แตก! ได้การ์ดคืน '+cards.map(nameOf).join(', ');fxShatter()}
  else{it.mc.splice(idx,1);recalc();msg='💥 การ์ด '+nameOf(slug)+' แตกและหายไป ('+name+' ยังอยู่ ช่องว่าง)';fxShatter()}
  CS.lastResult={ok:true,itemBreaks,msg,kind:'remove'};CS.stats.removes=(CS.stats.removes||0)+1;try{notify(msg,true)}catch(_){}try{log(msg,'r')}catch(_){}try{saveGame()}catch(_){}afterAction()}
CS.drillAsk=drillAsk;CS.removeAsk=removeAsk;CS.drillDo=drillDo;CS.removeDo=removeDo;

/* ---------- UI pieces used by the item panel ---------- */
const SLOT_TH={weapon:'อาวุธ',armor:'ชุดเกราะ',shield:'โล่',garment:'ผ้าคลุม',shoes:'รองเท้า',headTop:'หมวก',acc:'เครื่องประดับ'};
function gearHtml(it){if(!isGear(it))return '';const n=nSlots(it),mc=it.mc||[];let h=`<div class="iis"><h4>ช่องการ์ดมอนสเตอร์</h4>`;
  if(!n)h+=`<div class="iir"><span>ไม่มีช่อง (ความหายาก ${esc((RARITY[it.rar]||{}).th||'')})</span></div>`;
  else for(let i=0;i<n;i++){const s=mc[i];h+=s?`<div class="iir"><span>◆ ${esc(nameOf(s))}</span><b>${esc(((dataBySlug(s)||{}).effects||[]).filter(e=>e.stat!=='special').map(statTxt).join(' ')||'')}</b></div>`:`<div class="iir"><span>◇ ว่าง</span><b class="muted">${esc(SLOT_TH[(catOfGear(it)==='head'?'headTop':catOfGear(it))]||'')}</b></div>`}
  if(n&&mc.length<n)h+=`<div class="iia"><button data-cs="pick" data-uid="${it.uid}">ใส่การ์ด</button></div>`;
  if(it.drilled)h+=`<div class="iir"><span>ช่องเจาะ</span><b style="color:#c98cff">✓ ช่องที่ 2 (เจาะแล้ว)</b></div>`;
  else if(canDrill(it))h+=`<div class="iit" style="font-size:11px;margin-top:4px">เจาะช่องที่ 2 ได้ที่ช่างตีเหล็ก (สำเร็จ 30% · ล้มเหลว = ไอเท็มแตก)</div>`;
  if(mc.length)h+=`<div class="iit" style="font-size:11px;margin-top:4px">ถอดการ์ดที่ช่างตีเหล็ก (เลเวล×50 G · 50% ของแตก / 50% การ์ดแตก)</div>`;
  return h+'</div>'}
const STATL={'maxHP%':'HP สูงสุด','maxMP%':'MP สูงสุด','atk%':'ATK','allDmg%':'ดาเมจรวม','aspd%':'ASPD','crit%':'Crit','critDmg%':'Crit DMG','def%':'DEF','eva%':'หลบ','exp%':'EXP','hpRegen%':'ฟื้นHP','mpRegen%':'ฟื้นMP','move%':'วิ่ง','resPoison%':'ต้านพิษ','resFire%':'ต้านไฟ','resWater%':'ต้านน้ำ','resDark%':'ต้านมืด','bossDmg%':'ดาเมจบอส'};
const statTxt=e=>e.stat==='special'?'★':(STATL[e.stat]||e.stat)+' +'+e.val+'%';
function cardHtml(c){init();const d=dataOf(c);if(!d)return '';const s=d.slug,own=!!P.mcOwned[s];let h=`<div class="iis"><div class="iir"><span>สะสม</span><b>${own?'ได้รับแล้ว ✓':'ยังไม่มี'}</b></div>`;
  if(d.boss||c.boss)h+=`<div class="iir"><span>ตัวนับ pity</span><b>${P.mcPity[s]||0}/${PITY}</b></div>`;
  h+=`<div class="iia"><button data-cs="cardpick" data-id="${esc(c.id)}">ใส่ลงอุปกรณ์</button></div></div>`;return h}
CS.gearHtml=gearHtml;CS.cardHtml=cardHtml;
/* ---------- picker overlay ---------- */
let pk=null;
function pkEl(){if(pk)return pk;pk=document.createElement('div');pk.id='csPick';pk.style.cssText='position:fixed;inset:0;z-index:9700;display:none;align-items:flex-end;justify-content:center;background:rgba(4,8,18,.6)';document.body.appendChild(pk);pk.addEventListener('click',e=>{e.stopPropagation();if(e.target===pk){pk.style.display='none';return}const b=e.target.closest('[data-pk]');if(!b)return;try{doPick(b)}catch(er){ERR('pick',er)}});return pk}
const CSSP=`<style>#csPick .box{width:min(94vw,400px);max-height:70vh;overflow:auto;margin:0 0 8px;padding:12px 14px;border-radius:14px;background:rgba(6,10,28,.98);border:1px solid var(--line,rgba(125,255,220,.2));color:var(--text,#e4f1ff);font:13px/1.5 "Noto Sans Thai",system-ui,sans-serif}#csPick h4{margin:0 0 6px;color:var(--mint,#8dffc8);font-size:13px}#csPick .row{display:flex;align-items:center;gap:8px;padding:6px 4px;border-top:1px dashed rgba(143,164,204,.2)}#csPick .row img{width:34px;height:34px;object-fit:contain}#csPick .row span{flex:1;min-width:0}#csPick .row small{display:block;color:var(--muted,#8fa4cc);font-size:11px}#csPick button{padding:6px 10px;border-radius:9px;border:1px solid var(--line,rgba(125,255,220,.2));background:rgba(125,255,220,.12);color:inherit;font:inherit;font-weight:700;cursor:pointer}#csPick .res{margin-top:6px;color:#ffd36b;font-size:12px}</style>`;
function gearList(){const out=[];if(P.weapon&&P.weapon.t!=='fist')out.push({it:P.weapon,eq:1});if(P.equip)for(const k in P.equip)if(P.equip[k])out.push({it:P.equip[k],eq:1});for(const x of P.inv||[])if(isGear(x))out.push({it:x,eq:0});return out}
function showPickForCard(id,msg){const slug=slugOf(id);const list=gearList().filter(g=>accepts(g.it,slug));let h=CSSP+`<div class="box"><h4>เลือกอุปกรณ์สำหรับ ${esc(nameOf(slug))}</h4>`;
  if(!list.length)h+=`<div class="muted">ไม่มีอุปกรณ์ประเภท “${esc(SLOT_TH[dataBySlug(slug).slot]||'')}” ในกระเป๋า / ที่สวมอยู่</div>`;
  for(const g of list){const n=nSlots(g.it),used=(g.it.mc||[]).length,full=used>=n;h+=`<div class="row"><img src="${esc(itemIcon(g.it))}" alt=""><span>${esc(itemName(g.it))}${g.eq?' <em>(สวมอยู่)</em>':''}<small>ช่องการ์ด ${used}/${n}${n?'':' — ไม่มีช่อง'}</small></span>${full||!n?'':`<button data-pk="ins" data-uid="${g.it.uid}" data-id="${esc(id)}">ใส่</button>`}</div>`}
  h+=msg?`<div class="res">${esc(msg)}</div>`:'';h+=`<div class="row" style="justify-content:flex-end"><button data-pk="close">ปิด</button></div></div>`;const p=pkEl();p.innerHTML=h;p.style.display='flex'}
function showPickForGear(it,msg){const n=nSlots(it),mc=it.mc||[];const cards=(P.inv||[]).filter(x=>x&&x.id&&cardOfId(x.id)&&accepts(it,slugOf(x.id)));let h=CSSP+`<div class="box"><h4>ใส่การ์ดให้ ${esc(itemName(it))} (${mc.length}/${n})</h4>`;
  if(!cards.length)h+=`<div class="muted">ไม่มีการ์ดที่ตรงช่องในกระเป๋า</div>`;
  for(const x of cards){const c=cardOfId(x.id),d=dataOf(c);h+=`<div class="row"><img src="${esc(c.icon||'')}" alt=""><span>${esc(d?d.name_th:x.id)} ×${x.q}<small>${esc(d?(d.effects||[]).filter(e=>e.stat!=='special').map(statTxt).join(' '):'')}</small></span><button data-pk="ins" data-uid="${it.uid}" data-id="${esc(x.id)}">ใส่</button></div>`}
  h+=msg?`<div class="res">${esc(msg)}</div>`:'';h+=`<div class="row" style="justify-content:flex-end"><button data-pk="close">ปิด</button></div></div>`;const p=pkEl();p.innerHTML=h;p.style.display='flex'}
function findGear(uid){for(const g of gearList())if(String(g.it.uid)===String(uid))return g.it;return null}
function afterChange(){try{if(II()&&II().refresh)II().refresh()}catch(_){}try{if(G.win==='wInv')renderInv()}catch(_){}try{if(G.win==='wRefine')renderRefine()}catch(_){}}
function doPick(b){const a=b.dataset.pk;if(a==='close'){pk.style.display='none';return}if(a==='ins'){const it=findGear(b.dataset.uid);const r=insertCard(it,b.dataset.id);CS.lastResult=r;if(pk.dataset.mode==='card')showPickForCard(b.dataset.id,r.msg);else showPickForGear(it,r.msg);afterChange()}}
/* ---------- click routing (capture) ---------- */
document.addEventListener('click',e=>{try{const t=e.target&&e.target.closest&&e.target.closest('[data-cs],[data-csrm],[data-csdrill]');if(!t)return;e.stopPropagation();e.preventDefault();init();
  if(t.dataset.cs==='pick'){pkEl().dataset.mode='gear';showPickForGear(findGear(t.dataset.uid))}
  else if(t.dataset.cs==='cardpick'){pkEl().dataset.mode='card';showPickForCard(t.dataset.id)}
  else if(t.dataset.csrm!==undefined){removeAsk(t.dataset.uid,+t.dataset.csrm)}
  else if(t.dataset.csdrill!==undefined){drillAsk(t.dataset.uid)}
  }catch(er){ERR('click',er)}},true);
/* ---------- smith: removal + insertion in the card tab ---------- */
try{const _rt=renderCardTab;renderCardTab=function(){const r=_rt.apply(this,arguments);try{init();const b=document.getElementById('rfBody');if(!b)return r;const old=b.querySelector('#csSmith');if(old)old.remove();const list=gearList().filter(g=>nSlots(g.it)||canDrill(g.it));
  let h=`<div id="csSmith" style="display:block;margin-top:14px;padding-top:10px;border-top:1px solid rgba(125,255,220,.2)"><h3 class="sec">การ์ดมอนสเตอร์ (ช่างตีเหล็ก)</h3><p class="muted" style="font-size:12px">ถอดการ์ด = เลเวล × 50 G · 50% ของแตก (ได้การ์ดคืน) / 50% การ์ดแตก (ของอยู่)<br>เจาะช่องที่ 2 (Mythic / Immortal) = เลเวล × 100 G · สำเร็จ 30% · ล้มเหลว = ไอเท็มแตก</p>`;let any=false;
  for(const g of list){const it=g.it,mc=it.mc||[];if(!mc.length&&!canDrill(it))continue;any=true;h+=`<div class="kv"><span style="color:${rarCol(it.rar)}">${esc(itemName(it))}${g.eq?' (สวมอยู่)':''} · Lv ${it.lvl||1}${it.drilled?' · ช่องเจาะ ✓':''}</span></div>`;
    mc.forEach((s,i)=>{h+=`<div class="kv"><span>◆ ${esc(nameOf(s))}</span><button class="btn sm" data-csrm="${i}" data-uid="${it.uid}" ${P.gold>=(it.lvl||1)*50?'':'disabled'}>ถอด · ${((it.lvl||1)*50).toLocaleString()} G</button></div>`});
    if(canDrill(it))h+=`<div class="kv"><span>เจาะช่องการ์ดที่ 2</span><button class="btn sm" data-csdrill="1" data-uid="${it.uid}" ${P.gold>=(it.lvl||1)*100?'':'disabled'}>เจาะช่องการ์ด · ${((it.lvl||1)*100).toLocaleString()} G</button></div>`}
  if(!any)h+=`<p class="muted" style="font-size:12px">ยังไม่มีอุปกรณ์ที่ใส่การ์ดมอนสเตอร์หรือเจาะช่องได้</p>`;h+='</div>';b.insertAdjacentHTML('beforeend',h)}catch(er){ERR('smith',er)}return r}}catch(e){ERR('hook cardTab',e)}
/* ---------- GM ---------- */
CS.gm={giveAll(){return CD().give()},setPity(slug,n){init();P.mcPity[slug]=n|0;persist();return P.mcPity[slug]},
  testGear(){const out=[];for(const [t,r] of [['armor',6],['shoes',6],['headTop',5],['shield',6],['garment',6],['acc',6]]){const g=makeGear(t,30,r);if(t==='armor'||t==='shield')g.drilled=1;P.inv.push(g);out.push(g)}const w=makeWeapon('sword',30,6);w.drilled=1;P.inv.push(w);out.push(w);if(P.invSize<P.inv.length)P.invSize=P.inv.length+2;try{if(G.win==='wInv')renderInv()}catch(_){}return out.length}};
if(/[?&]gm=on\b/.test(Q)){const add=()=>{try{if(document.getElementById('cs2Btn'))return;const mk=(id,txt,top,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=txt;b.style.cssText='position:fixed;left:150px;top:'+top+'px;z-index:8000;padding:6px 10px;border-radius:10px;border:1px solid #ff8ae0;background:rgba(50,16,44,.92);color:#ffd0f2;font:700 13px system-ui,sans-serif;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();fn()});document.body.appendChild(b)};
  mk('cs2Btn','Gear 2-slot TEST',318,()=>CS.gm.testGear());mk('cs2Pity','Pity 99 (bosses)',356,()=>{for(const d of Object.values((CD()&&CD().data)||{}))if(d.boss)CS.gm.setPity(d.slug,99)});
  const dl=['auto','100','0'],rl=['random','a','b'];const bd=mk('cs2Drill','Drill: auto (30%)',394,()=>{CS.opt.drill=dl[(dl.indexOf(CS.opt.drill)+1)%3];document.getElementById('cs2Drill').textContent='Drill: '+(CS.opt.drill==='auto'?'auto (30%)':CS.opt.drill+'%')});
  mk('cs2Rem','Remove: random 50/50',432,()=>{CS.opt.remove=rl[(rl.indexOf(CS.opt.remove)+1)%3];document.getElementById('cs2Rem').textContent='Remove: '+({random:'random 50/50',a:'item breaks',b:'card breaks'})[CS.opt.remove]})}catch(e){ERR('gm btn',e)}};if(document.body)add();else document.addEventListener('DOMContentLoaded',add);setTimeout(add,1600)}
console.info('[CARDS2] ready');
})();
