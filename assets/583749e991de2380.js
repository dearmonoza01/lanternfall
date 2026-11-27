/* ---- ATK19 TEST r7k (= r7j with the new Meshy dagger sprites in both hands [sprites only, module unchanged]; r7j =  r7i with PURPLE waves for all 4 hits [sprites hue-remapped once at load to violet, impact/sparks purple; ?atk19color=orig = original blue/red]; r7i =  r7h with the painted blades at 50 % size [R.sprK .5; ?atk19sprsize=1.0 = r7h size]; r7h =  r7g + new sweep directions [hit 1 bottom->up, hit 2 top->down, hit 3 top->down]; r7g =  r7f + Balance final [coef 1.7 / finisher 2.30], hit 5 spin REMOVED (4-hit combo), hits 1-4 waves = port of the cloud demo v12: DeaRz painted blade sprites + animated reveal/smear/glint/erode + noise-eaten aura + target impact; ?atk19wave=r7f = the r7f baked blades, ?atk19sprsize=1.0 = blade size) ; r7f = ( r7e + CRESCENT rendering after the anime slash reference: true lune silhouette (tapered both ends), smooth continuous gradient across the thickness hot rim -> red -> dark transparent, feathered outer edge, soft bloom, no strips / brush lines; ?atk19arc=old = r7e look; ?atk19arcsize=1.5 = visual size of the arcs of hits 1-4 vs the hit reach (hit area unchanged)) ; r7e = r7d + SOFT effects [?atk19soft=0 = r7d look]: feathered halo/edges, eased sweep + smooth thickness growth, longer smooth fade, breathing fill, decelerating sparks; damage identical] ; r7d = r7c with Balance trim: coef 1.6 / finisher 2.16 / hit 5 main 2.82 / others 1.13, ellipse hit area default [?atk19spinell=0 = circle]; r7c = r7b + (1) hit 5 damages every enemy inside the visible ground ring [circle, radius 135 px = the ring's outer edge; ?atk19spinr=NNN, ?atk19spinell=1 = the drawn 1.6:1 ellipse as hit area, ?atk19spinaoe=off = r7b single target]: the locked target (else nearest) takes coefficient 3.0 with its normal procs, the 4 nearest other enemies take coefficient 1.2 with NO procs (echo flag), no chain on hit 5; (2) effect shapes redrawn after DeaRz's reference: a flat translucent lens/disc with a variable-width brushed band (thick head, tapering tail), hits 1-4 = a sector of it, ?atk19shape=old = r7b streaks) ----
   ---- (r7b = r8 module + spin pose s5 r2 sprites; r8 = = r7 + the hit-5 ground ring restyled after DeaRz's reference picture: big flat ellipse, thick glossy near half (blue) tapering to a thin far half (red), faint dark disc inside, long orange spark streaks; ?atk19ringsize=1.55 scales the ring radius relative to the hit reach) ----
   ---- ATK19 TEST r7 (= r6 + hit 5: a full 360 deg spin slash after hit 4 (blue/red 360 deg ground ring + sparks); hits 1-2 wave blue, hits 3-4 red; ?atk19spin=off = the 4-hit combo) ----
   ---- ATK19 TEST r6 (= r5, but the wave is a COPY of the sword's wave recoloured violet: ?atk19wavesize=1.0) ---- 
   ---- ATK19 TEST r5 (= r4 + designed crescent sword wave per hit instead of the thin line trails + wider dagger reach tied to the wave; ?atk19wave=off, ?atk19range=1.0/1.35/1.5) ----
   ---- ATK19 TEST r4 (= r3 + Venom 60 % -> 35 % per hit while the combo is on; ?atk19=off keeps 60 %) ----
   ---- ATK19 TEST r3 (= r2 + BALANCE_dagger_atk19_v1): per-hit coefficient 1.4 (finisher 1.4 x 1.35 = 1.89), dagger-only cap 7 hits/s (0.143 s), dagger crit +5 % / crit dmg +0.10, hit flinch x0.55, double-strike proc B('dbl') x0.55. ?atk19coef=1.4 ?atk19cap=7 override.
   r2 description follows: ---- ATK19 TEST r2: the 4-hit twin-dagger combo (atk19: 75 deg reverse grip + refined arms) on the mannequin + hair m2, window.__ATK19 ----
   TEST only, appended AFTER the v7 dagger module (DAG8). With the daggers equipped:
     * standing = atk19 stance (own breathing idle, 12 f loop),
     * FAST: one hit per period T = per x ref / ASPD (per = 0.40 s at base, ref 1.06, same ASPD rule as the sword / bow of the balance module p255,
       cap 5 hits / s): at the starting stats T = 0.38 s. The sword swings every 0.73 s, the bow shoots every 0.67 s, the staff every 1.0 s and the v7 dagger every 0.67 s
       (measured in this build at the same stats), so the dagger is the fastest weapon. ASPD makes it faster like the others.
     * every hit plays the next combo segment 1 -> 2 -> 3 -> 4 (right sweep, right overhead chop, left sweep, left overhead chop), time-remapped to the period: the
       wind-up (26 %) and the recovery (43 %) are compressed, the strike frames get 31 % (the slash frame lands at 38 % of the period),
     * the game's own basic-attack damage / effects are fired exactly on the slash frame (the module bypasses the game's 0.35 s swing delay for the daggers),
     * input buffering: a press (or holding attack) during a hit queues the next hit, which starts when the current period ends: no press is swallowed, holding attack chains 1-2-3-4 non-stop,
     * the game's chain / finisher bonus keeps working: hit 4 is the finisher (x1.35 + ring) and the chain never times out between hits.
   walk / run / hurt / skills / equip = the v7 dagger module (DAG8) as before.
   ?atk19=off = the v7 dagger art and timing; ?atk19=small = 38 cm daggers (default 53 cm); ?atk19per=0.40 = base period. Buttons switch size / period / on-off.
   Debug: window.ATK19 (on, seg, k, hits, starts, log, per, T). */
(function(){'use strict';
const D=window.__ATK19,HD=window.__HERO3D,H=window.HERO3D;
const R=window.ATK19={ver:'atk19-test-r7b',on:true,err:null,ready:0,seg:null,k:0,lastEnd:-99,draws:0,hits:0,starts:0,log:[],per:0.50,queued:null,T:0.5,hitT:[]};
try{if(/atk19=off/.test(location.search))R.on=false;const q=/atk19per=([0-9.]+)/.exec(location.search);if(q)R.per=Math.max(0.15,Math.min(1.5,parseFloat(q[1])));}catch(e){}
if(!D||!HD||!H||typeof drawPlayerSprite!=='function'||typeof basicAttack!=='function'){R.err='missing data / hooks';console.warn('[atk19]',R.err);return;}
const K=HD.drawScale,AX=141,AY=(HD.frame.ay||208)+80,FY=HD.footY||0,DN=D.dirs;
const IM={},IMB={};let NIM=0;R.big=!!D.big;try{if(/atk19=small/.test(location.search))R.big=false;}catch(e){}
for(const c in D.clips){const im=new Image();NIM++;im.onload=()=>{R.ready++;};im.src=D.clips[c].src;IM[c]=im;}
if(D.big)for(const c in D.big.clips){const im=new Image();NIM++;im.onload=()=>{R.ready++;};im.src=D.big.clips[c].src;IMB[c]=im;}
const CL=()=>R.big?D.big.clips:D.clips,IMG=k=>R.big?IMB[k]:IM[k];
const clk=()=>typeof time==='number'?time:performance.now()/1000;
const dagNow=()=>{try{return !!(P&&P.weapon&&P.weapon.t==='dagger');}catch(e){return false;}};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
/* ---- balance r3 (BALANCE_dagger_atk19_v1) ---- */
const BAL={coef:1.7,v7coef:null,crit:0,critDmg:0,flinch:0.71,dbl:0.71};   /* r5 = Balance re-tune for 0.50 s/hit: coef 1.7 (finisher x1.35 = 2.30), flinch / double-strike x0.71, no extra dagger crit, venom 43 % */
try{const q=/atk19coef=([0-9.]+)/.exec(location.search);if(q)BAL.coef=parseFloat(q[1]);}catch(e){}
/* the real per-hit coefficient lives in the combat data (C182.api.D().weapons.dagger.actionCoef = perHitCoef, one hit per attack since p202); WEAPONS.dagger.mult cancels out (damage uses m / m0) */
const wdag=()=>{try{const D=C182.api.D();return D&&D.weapons&&D.weapons._p202?D.weapons.dagger:null;}catch(e){return null;}};
const setCoef=()=>{try{const w=wdag();if(!w)return false;if(BAL.v7coef==null)BAL.v7coef=w.actionCoef;const c=R.on?BAL.coef:BAL.v7coef;w.actionCoef=c;w.perHitCoef=c;R.coef=c;return true;}catch(e){R.err='coef '+e.message;return false;}};
{let n=0;const iv=setInterval(()=>{if(setCoef()||++n>200)clearInterval(iv);},250);}
R.bal=BAL;try{const oB=B;B=function(k){let v=oB.apply(this,arguments);try{if(R.on&&dagNow()){if(k==='crit')v+=BAL.crit;else if(k==='critDmg')v+=BAL.critDmg;else if(k==='dbl')v*=BAL.dbl;}}catch(e){}return v;};}catch(e){R.err='B '+e.message;}


/* ---- r5: ONE shared set of numbers for the visible crescent wave AND the hit area ----
   legacy dagger (game basicAttack_v5): hits 1-3 sector r 80 / arc 1.0 rad (57 deg), finisher r 92 / arc 1.8 rad (103 deg). Sword: r 120 / arc 2.5 rad (143 deg), 3rd swing r 130 / 3.4 rad.
   r5: reach = legacy r x RF (default 1.35, ?atk19range=1.0 = the legacy numbers exactly), capped below the sword's 120 (finisher 118); arcs = the wave's angular span. */
const LEG={r:[80,80,80,92,92],arc:[1.0,1.0,1.0,1.8,6.4]},ARCN=[1.9,1.5,1.9,2.2,6.4],RCAP=[116,116,116,118,118];   /* hit 5 (spin): full circle, r 92 */
R.rangeF=1.0;try{const q=/atk19range=([0-9.]+)/.exec(location.search);if(q)R.rangeF=Math.max(0.5,Math.min(2,parseFloat(q[1])));}catch(e){}
const reachOf=k=>R.rangeF===1?LEG.r[k]:Math.min(RCAP[k],LEG.r[k]*R.rangeF);
const arcOf=k=>k===4?6.4:R.rangeF===1?LEG.arc[k]:Math.max(LEG.arc[k],Math.min(2.4,ARCN[k]*R.rangeF/1.35));
R.reachOf=reachOf;R.arcOf=arcOf;R.sk=null;
/* r6 single target (DeaRz rule: a basic attack hits ONLY the one locked / focused target in front): during an atk19 strike the game's sector test returns true only for the chosen target =
   the p225 lock (TLOCK.e) if it is inside this hit's sector, else (no lock) the nearest enemy inside the sector; nothing else takes damage / venom. ?atk19single=off = every enemy in the arc as before. */
R.single=!/atk19single=off/.test(location.search);R.sid=0;R.pickInfo=null;let pickSid=-1,pick=null;
try{const oi=inSector;inSector=function(e,cx,cy,ang,r,arc){
  let ok;try{if(R.sk!=null&&R.on&&cx===P.x&&cy===P.y){if(R.rangeF!==1||R.sk===4){r=reachOf(R.sk);arc=arcOf(R.sk);}
      if(R.sk===4&&R.spinAoE){if(pickSid!==R.sid){pickSid=R.sid;const rr=R.spinR,cand=[];for(const q of enemies){if(q&&!q.dead&&oi.call(this,q,cx,cy,ang,rr,6.4)&&(!R.spinEll||(Math.pow((q.x-cx)/rr,2)+Math.pow((q.y-cy)/(rr*.6),2))<=1))cand.push(q);}
        const dd=q=>Math.hypot(q.x-cx,q.y-cy)-(q.sz||0);cand.sort((p,q)=>dd(p)-dd(q));const lk=window.TLOCK&&TLOCK.e;const prim=(lk&&cand.includes(lk))?lk:(cand[0]||null);
        R.prim5=prim;R.set5=new Set(prim?[prim].concat(cand.filter(q=>q!==prim).slice(0,R.spinMax-1)):[]);R.aoeInfo={sid:R.sid,cand:cand.length,hit:R.set5.size,locked:!!(prim&&prim===lk)};}
      return R.set5.has(e);}
      ok=oi.call(this,e,cx,cy,ang,r,arc);if(!R.single)return ok;
      if(pickSid!==R.sid){pickSid=R.sid;pick=null;const cand=[];for(const q of enemies){if(q&&!q.dead&&oi.call(this,q,cx,cy,ang,r,arc))cand.push(q);}
        const lk=window.TLOCK&&TLOCK.e;if(lk&&cand.includes(lk))pick=lk;else if(!lk||!(window.TLOCK&&TLOCK.on)){let bd=1e9;for(const q of cand){const d=Math.hypot(q.x-P.x,q.y-P.y)-(q.sz||0);if(d<bd){bd=d;pick=q;}}}
        R.pickInfo={sid:R.sid,cand:cand.length,locked:!!lk,pick:pick?(pick.type||'?'):null};}
      return ok&&e===pick;}}catch(x){R.err='single '+x.message;}
  return oi.call(this,e,cx,cy,ang,r,arc);};}catch(e){R.err='range '+e.message;}
/* venom proc (game code: if(B('venom')>0&&rng()<.6)applySt(e,{poison:4},{dt:'phys',dotm:.32})): the 60 % roll is fixed in the game, so with the combo on keep 35/60 of the applications -> 35 % per hit; the DoT stack cap is the game's own */
BAL.venom=0.43;BAL.venomBase=0.60;R.vTry=0;R.vKept=0;
try{const oa=applySt;applySt=function(e,s,o){try{if(R.on&&dagNow()&&s&&s.poison===4&&o&&o.dotm===0.32&&o.dt==='phys'){R.vTry++;if(rng()>=BAL.venom/BAL.venomBase)return;R.vKept++;}}catch(x){}return oa.apply(this,arguments);};}catch(e){R.err='venom '+e.message;}try{const oh=hitEnemy;hitEnemy=function(e,m,o){const ft=e?e.flinchT:0,fc=e?e.flinchCd:0,fcut=e?e.flinchCut:0;const r=oh.apply(this,arguments);
  try{if(e&&R.on&&dagNow()&&e.flinchT!==ft&&!(o&&(o.dot||o.thorn||o.echo))&&rng()>=BAL.flinch){e.flinchT=ft;e.flinchCd=fc;e.flinchCut=fcut;R.flinchSkipped=(R.flinchSkipped||0)+1;}}catch(x){}return r;};}catch(e){R.err='flinch '+e.message;}
/* r7 hit 5 (spin): coefficient 3.0 (Balance) = 3.0 / 1.7 x the normal hit (hits 1-3 1.7, hit 4 2.30 via the game's finisher); venom / double-strike / flinch / chain apply to it as to any hit; the chain hit stays 30 % of this boosted main hit */
BAL.hit5=2.82/1.6;BAL.aoe5=1.13/1.6;R.spinAoE=!/atk19spinaoe=off/.test(location.search);R.spinR=135;R.spinMax=5;R.spinEll=!/atk19spinell=0/.test(location.search);R.aoeHits=0;R.mainHits5=0;R.t5=-9;R.chain5Blocked=0;R.prim5=null;R.set5=new Set();try{const q=/atk19spinr=([0-9.]+)/.exec(location.search);if(q)R.spinR=Math.max(30,Math.min(300,parseFloat(q[1])));}catch(e){}
try{const o5=hitEnemy;hitEnemy=function(e,m,o){try{if(R.sk===4&&o&&!o.optChain&&!o.echo&&!o.dot&&!o.thorn){if(R.spinAoE&&e!==R.prim5){m=m*BAL.aoe5;o=Object.assign({},o,{echo:1});R.aoeHits++;}else{m=m*BAL.hit5;R.mainHits5++;}}}catch(x){}return o5.call(this,e,m,o);};}catch(e){R.err='hit5 '+e.message;}
/* r6 chain (Balance FINAL, all weapons in this test build; module only, the main game is untouched): the gear option 'chain' (optChain: main game code, gear option "Chain (ตีกระโดด) 1 เป้า" on melee weapons,
   always triggers once per landed basic attack, hits the nearest other enemy within 170 px after 0.08 s) is kept as the game does it, but a chain hit is now 30 % of the main hit
   (the game's 50 % x 0.6) and carries the 'echo' flag so no per-hit proc fires on it (venom, double-strike / multistrike, mirage echoes, flinch); armour, element and crit apply as for any hit.
   The basic hit itself still lands only on the locked / nearest target (single-target rule above). ?atk19chainfix=off = the game's own chain (50 %, procs allowed). */
R.chainFix=!/atk19chainfix=off/.test(location.search);BAL.chainDmg=0.3/0.5;R.chainHits=0;
try{const oc=hitEnemy;hitEnemy=function(e,m,o){try{if(o&&o.optChain&&R.spinAoE&&clk()-R.t5<0.2){R.chain5Blocked++;return;}if(o&&o.optChain&&R.chainFix&&!o.echo){R.chainHits++;return oc.call(this,e,m*BAL.chainDmg,Object.assign({},o,{echo:1}));}}catch(x){R.err='chain '+x.message;}return oc.apply(this,arguments);};}catch(e){R.err='chain '+e.message;}
const dirOf=fa=>((Math.round(wrap(fa)/(Math.PI/4))%8)+8)%8;
const SEGS=['s1','s2','s3','s4','s5'],CHAIN=[0,1,0,2,0];R.spin=false;   /* r7g: hit 5 (360 spin) removed, 4-hit combo */R.ringSize=1.55;try{const q=/atk19ringsize=([0-9.]+)/.exec(location.search);if(q)R.ringSize=Math.max(.6,Math.min(3,parseFloat(q[1])));}catch(e){}const NSEG=()=>(R.spin&&CL().s5)?5:4;for(const g_ of [D.clips,D.big&&D.big.clips]){if(g_&&g_.s5)g_.s5.lin=1;}   /* hit 5: the spin clip plays linearly over its period */      /* game chain index per hit: hits 1-3 normal, hit 4 = the game's finisher */
const REF=1.06,T0MAX=0.12;let CAP=7;try{const q=/atk19cap=([0-9.]+)/.exec(location.search);if(q)CAP=Math.max(2,Math.min(20,parseFloat(q[1])));}catch(e){}R.cap=CAP;
const aspdNow=()=>{let b=0;try{b=B('aspd')||0;}catch(e){}return (P.aspdF||1)*(1+b);};
const period=()=>Math.max(1/CAP,R.per*REF/Math.max(.05,aspdNow()));
R.per5=0.65;R.spinMin=0.25;const period5=()=>Math.max(R.spinMin,R.per5*REF/Math.max(.05,aspdNow()));   /* Balance: the spin lasts 0.65 s at base and scales with ASPD (floor 0.25 s = my choice, flagged) */
/* time remap: wind-up 26 % / strike 31 % / recovery 43 % of the period -> clip frame (the slash frame lands at 38 %) */
const FRAC=[0.26,0.57];
function frameAt(C,x){if(C.lin)return Math.max(0,Math.min(1,x))*(C.n-1);const hf=C.hit,a=hf-4,b=hf+6,n=C.n;x=Math.max(0,Math.min(1,x));
  if(x<FRAC[0])return x/FRAC[0]*a;
  if(x<FRAC[1])return a+(x-FRAC[0])/(FRAC[1]-FRAC[0])*(b-a);
  return b+(x-FRAC[1])/(1-FRAC[1])*(n-1-b);}
const hitX=C=>C.lin?C.hit/(C.n-1):FRAC[0]+(FRAC[1]-FRAC[0])*0.4;
const origAtk=basicAttack;
function strike(c,k){
  /* the game's own attack, immediately (its 3D swing module's 0.35 s delay is bypassed: H.on=false for this call), chain index aligned to our hit */
  const on0=H.on;let err=null;const nFx=(typeof fx!=='undefined'&&fx)?fx.length:0;R.sk=k;R.sid++;if(k===4)R.t5=clk();
  try{P.atkCd=0;P.chain=CHAIN[k];P.lastAtk=clk();H.on=false;origAtk.call(null);}catch(e){err=e.message;}finally{H.on=on0;R.sk=null;P.atkCd=0;try{if(R.wave&&typeof fx!=='undefined'){for(let i=fx.length-1;i>=nFx;i--){const o=fx[i];if(o&&(o.k==='thrust'||o.k==='cres'||o.k==='star'))fx.splice(i,1);}}}catch(x){}}
  if(err)R.err='hit '+err;
  try{if(R.v7g&&k<4){const tg=(R.single&&pickSid===R.sid)?pick:null;for(let i=WL.length-1;i>=0;i--){const w=WL[i];if(w.k===k&&w.t0!=null&&!w.tgtSet){w.tgtSet=1;if(tg&&isFinite(tg.x)&&isFinite(tg.y)){w.tx=tg.x-P.x;w.ty=tg.y-P.y;}break;}}}}catch(x){R.err='tgt '+x.message;}
  R.hits++;R.hitT.push(+clk().toFixed(3));if(R.hitT.length>40)R.hitT.shift();R.log.push(c+'@'+(R.seg?(clk()-R.seg.t0).toFixed(3):'-'));if(R.log.length>12)R.log.shift();
}
function startSeg(now,late){late=Math.min(late||0,T0MAX);
  const k=R.k%NSEG(),c=SEGS[k],C=CL()[c];R.k=k+1;
  let fa=(P.face!=null&&isFinite(P.face))?P.face:0;try{const tg=aimPoint();if(tg&&isFinite(tg.x)&&isFinite(tg.y))fa=Math.atan2(tg.y-P.y,tg.x-P.x);}catch(e){}
  P.face=fa;const d=dirOf(fa),T=(k===4?period5():period());R.T=T;
  R.seg={c,k,t0:now,T,d};R.starts++;R.queued=null;try{if(R.wave)spawnWave(k,fa,now,T);}catch(e){R.err='wave '+e.message;}
  const id=R.starts;
  timers.push({t:Math.max(.001,T*hitX(C)-late),fn:()=>{try{if(R.seg&&R.seg.t0===now)strike(c,k);}catch(e){R.err='strike '+e.message;}}});
  timers.push({t:Math.max(.001,T-late),fn:()=>{try{if(!R.seg||R.seg.t0!==now)return;
    if(R.queued&&R.on&&dagNow()&&!P.dead){const nom=now+T;startSeg(nom,clk()-nom);}else{R.seg=null;R.lastEnd=now+T;try{if(window.DAG8)window.DAG8.play=null;}catch(e){}}}catch(e){R.err='end '+e.message;}}});
}
basicAttack=function(){
  if(!(R.on&&dagNow()&&R.ready===NIM))return origAtk.apply(this,arguments);
  try{
    if(P.dead||P.dash||(typeof G!=='undefined'&&G.edit)||P.casting)return;
    const now=clk();
    if(R.seg&&now-R.seg.t0>R.seg.T*2+0.6){R.seg=null;R.queued=false;}   /* the end timer was lost (zone change cleared timers): drop the stale hit */
    if(R.seg){R.queued=true;return;}                   /* a hit is playing: buffer the press, the next hit starts when its period ends */
    if(now-R.lastEnd>1.0)R.k=0;
    startSeg(now);
  }catch(e){R.err='atk '+e.message;}
};
/* ---- r6 dagger wave = a COPY of the sword wave (p269 r6/r30: designed one-way crescent, 5 streaks side by side, tinted body + hot light, sweeps in with the cut, lingers in place and fades,
   2-pass depth: above the chest line behind the body), RECOLOURED to violet (Night Fang). Per facing it reads the sword's own arc table (HEROSW.wave.arc) so shape / size / timing are the sword's.
   ?atk19wavesize=1.0 scales it (1.0 = exactly the sword wave), ?atk19wave=off = the game's thin lines. ---- */
R.wave=!/atk19wave=off/.test(location.search);
R.wsize=1.0;try{const q=/atk19wavesize=([0-9.]+)/.exec(location.search);if(q)R.wsize=Math.max(.5,Math.min(3,parseFloat(q[1])));}catch(e){}
const PALS={violet:{glow:'#7a4fb0',deep:'#4a2470',mid:'#7a4fb0',hot:'#b894ec',core:'#f1e8ff',z:'rgba(36,18,58,0)'},fire:{glow:'#ff4a1a',deep:'#e8240c',mid:'#ff7a1e',hot:'#ffc04a',core:'#fff4cc',z:'rgba(232,36,12,0)'},red:{glow:'#ff2d2d',deep:'#7d0a14',mid:'#e0202a',hot:'#ff6a4d',core:'#ffe3da',z:'rgba(110,8,18,0)'},blue:{glow:'#2f9bff',deep:'#1d3fa8',mid:'#2f7bff',hot:'#7fd0ff',core:'#eaf8ff',z:'rgba(20,50,140,0)'}};   /* r7: hits 1-2 wave = blue, hits 3-4 = red (fire = the sword wave's own red), hit 5 ring = red far half / blue near half */   /* fire = the sword wave's own palette, debug only (?atk19wavepal=fire / ATK19.pal('fire')) to compare shape 1:1 */
let PAL=PALS.violet;R.pal=n=>{PAL=PALS[n]||PALS.violet;};try{if(/atk19wavepal=fire/.test(location.search))PAL=PALS.fire;}catch(e){}   /* the sword's FIRE palette (glow/deep/mid/hot/core) -> the dagger's violet ramp #24123a -> #4a2470 -> #7a4fb0 -> lilac -> pale core, same roles */
const WL=R.waves=[],EXTW=1.12,KS=()=>(HD.drawScale||1);
const swordArc=dn=>{try{const a=window.HEROSW&&HEROSW.wave&&HEROSW.wave.arc&&HEROSW.wave.arc[dn];if(a)return a;}catch(e){}return null;};
function spawnWave(k,fa,now,T){
  if(k===4)return spawnRing(k,fa,now,T);
  const d=dirOf(fa),A0=swordArc(DN[d])||{phi:d*Math.PI/4,R:112,y0:-40,dy:50,s:1};
  const hor=(k===0||k===2),A={phi:A0.phi,R:A0.R,y0:hor?-6:A0.y0,dy:hor?18:A0.dy,s:(k>=2?-1:1)*A0.s},hitT=now+T*hitX(CL()[SEGS[k]]),dur=Math.min(.1,T*.3);
  WL.push({A,k,fa,ext:EXTW,pal:(k<2?PALS.blue:PALS.red),sc:(reachOf(k)*.95/(112*KS()))*R.wsize,t0:hitT,s0:hitT-(R.cres?.01:dur),s1:hitT+(R.cres?(R.v7g?.27:.24):.02),te:null,ling:R.cres?.02:Math.max(.1,Math.min(.35,T*.7))*(R.soft&&!(R.dbgm&64)?2.0:1),cx:null,cy:null});while(WL.length>(R.soft&&!(R.dbgm&256)?6:3))WL.shift();
}
const bez=(A,t)=>{if(A.ring){const th0=A.th0+A.s*2*Math.PI*t;return [A.R*Math.cos(th0),A.R*.6*Math.sin(th0)];}const th=A.phi+A.s*(-75+150*t)*Math.PI/180;return [A.R*Math.cos(th),A.R*.6*Math.sin(th)+A.y0+A.dy*t];};
const bezN=(A,t)=>{if(A.ring){const th0=A.th0+A.s*2*Math.PI*t,x0=Math.cos(th0),y0=.6*Math.sin(th0),l0=Math.hypot(x0,y0)||1;return [x0/l0,y0/l0];}const th=A.phi+A.s*(-75+150*t)*Math.PI/180,x=Math.cos(th),y=.6*Math.sin(th),l=Math.hypot(x,y)||1;return [x/l,y/l];};
/* one streak: centre offset off along the normal, width wd (frame px), drawn on curve range [ta,tb] */
function streak(w,ta,tb,off,wd,cols,alpha,lighter){
  const A=w.A,a=Math.max(A.ring?-.4:0,ta),b=Math.min(A.ring?1.3:1,tb);if(b-a<.01||alpha<=0)return;
  const k=KS()*(w.sc||R.wsize),N=18,out=[],inn=[];
  for(let j=0;j<=N;j++){const t=a+(b-a)*j/N,q=(t-ta)/(tb-ta),p=bez(A,t),n=bezN(A,t),hw=wd*.5*Math.pow(Math.sin(Math.PI*Math.min(1,q*1.15)),.7)+.3;
    out.push([w.cx+(p[0]+n[0]*(off+hw))*k,w.cy+(p[1]+n[1]*(off+hw))*k]);inn.push([w.cx+(p[0]+n[0]*(off-hw))*k,w.cy+(p[1]+n[1]*(off-hw))*k]);}
  const t0=bez(A,a),t1=bez(A,b),g=ctx.createLinearGradient(w.cx+t0[0]*k,w.cy+t0[1]*k,w.cx+t1[0]*k,w.cy+t1[1]*k);
  g.addColorStop(0,PAL.z);cols.forEach((c_,i)=>g.addColorStop(.25+.75*i/(cols.length-1),c_));
  ctx.globalCompositeOperation=lighter?'lighter':'source-over';ctx.globalAlpha=alpha;ctx.fillStyle=g;
  ctx.beginPath();out.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=inn.length-1;i>=0;i--)ctx.lineTo(inn[i][0],inn[i][1]);ctx.closePath();ctx.fill();
}
/* ---- r7 hit 5: the 360 deg spin ring lying flat on the ground round the hero (reference: thick glossy band, far half red-orange, near half blue, sparks flying out).
   Same drawing machinery as the sword-wave copy (5 streaks + glow + hot light) on a closed ground ellipse; it sweeps round with the spin (head angle runs 0 -> 1.25 turns), lingers, fades; far half (above the feet line) is drawn behind the body in red, near half in front in blue. ---- */
function spawnRing(k,fa,now,T){
  const A={ring:1,th0:fa,s:-1,R:112,y0:0};   /* the spin turns to the hero's left: on screen the head runs against the screen angle */
  {const H=R.cres?.13:Math.max(.35,Math.min(1,.7*T/.65)),hs=R.cres?now+T*hitX(CL()[SEGS[4]])-.04:now+T*0.30;WL.push({A,ring:1,k,ext:1.25,sc:R.spinR/(112*KS()),s0:hs,s1:R.cres?hs+.001:now+T*0.60,te:null,H,ling:R.cres?H+.1+.22:Math.max(.12,Math.min(.35,T*.55))*(R.soft&&!(R.dbgm&64)?1.9:1),cx:null,cy:null});}while(WL.length>(R.soft&&!(R.dbgm&256)?6:3))WL.shift();
}
const SPK=[];
function spawnSparks(w,th){const R0=w.A.R*KS()*w.sc;for(let i=0;i<6;i++){const a=th+(Math.random()-.5)*.9,rad=1.25+Math.random()*.4,sp=(R.cres?170:70)+Math.random()*(R.cres?240:130),ca=Math.cos(a),sa=Math.sin(a);
  SPK.push({x:w.cx+R0*rad*ca,y:w.cy+R0*rad*.6*sa,vx:ca*sp,vy:sa*sp*.6-10-Math.random()*20,t0:clk(),life:R.cres?.16+Math.random()*.16:.45+Math.random()*.45,l:5+Math.random()*9,c:Math.random()<.2?'#ffd870':(Math.random()<.5?'#ff9a30':'#ff7a1e')});}
  while(SPK.length>200)SPK.shift();}function drawSparks(){if(!SPK.length)return;const now=clk();ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineWidth=1.5;
  for(let i=SPK.length-1;i>=0;i--){const s=SPK[i],e=now-s.t0,u=e/s.life;if(u>=1){SPK.splice(i,1);continue;}
    const dd=R.soft?(1-Math.exp(-3*e))/3:e,px=s.x+s.vx*dd,py=s.y+s.vy*dd,vl=Math.hypot(s.vx,s.vy)||1;ctx.globalAlpha=R.soft?Math.min(1,sm01(u/.12))*Math.pow(1-u,1.5):Math.min(1,(1-u)*1.4);ctx.strokeStyle=s.c;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-s.vx/vl*s.l,py-s.vy/vl*s.l);ctx.stroke();}
  ctx.restore();}
/* ring band: a closed ground ellipse, width follows the camera tilt (thick on the near side, thin on the far side) like the reference; polygon strip from t=a..b (turns) */
function ringStrip(w,a,b,wk,outK,inK,N){const k=KS()*w.sc,R0=w.A.R*k,Wm=R0*.46,TAU=Math.PI*2,o=[],n=[];const cx=w.cx,cy=w.cy;
  for(let j=0;j<=N;j++){const t=a+(b-a)*j/N,th=w.A.th0+w.A.s*TAU*t,sn=Math.sin(th),wid=Wm*(.07+.93*Math.pow(.5+.5*sn,1.5))*wk,e=Math.min(t-a,b-t)/.12,ramp=(b-a)>=1.15?1:Math.pow(Math.max(0,Math.min(1,e)),.7);
    const ro=R0+outK*wid*ramp,ri=R0-inK*wid*ramp,c=Math.cos(th);o.push([cx+ro*c,cy+ro*.6*sn]);n.push([cx+ri*c,cy+ri*.6*sn]);}
  return {o,n,R0,Wm};}
function fillStrip(S,fill,alpha,mode){ctx.globalCompositeOperation=mode||'source-over';ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.beginPath();S.o.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=S.n.length-1;i>=0;i--)ctx.lineTo(S.n[i][0],S.n[i][1]);ctx.closePath();ctx.fill();}
function drawRing(w,h,fade,layer){const near=layer==='over',len=1.25,a=Math.max(0,h-len),b=h,N=96,cx=w.cx,cy=w.cy;if(b-a<.02){return;}
  ctx.save();
  const S=ringStrip(w,a,b,1,.5,.5,N),R0=S.R0,Wm=S.Wm;
  if(!near){   /* far half (behind the body): thin red-orange arc + the faint dark disc inside the ring */
    const full=Math.min(1,h);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.55*fade*full;
    const gd=ctx.createRadialGradient(cx,cy,R0*.2,cx,cy,R0);gd.addColorStop(0,'rgba(6,12,38,.55)');gd.addColorStop(.8,'rgba(6,12,38,.85)');gd.addColorStop(1,'rgba(6,12,38,1)');ctx.fillStyle=gd;ctx.beginPath();ctx.ellipse(cx,cy,R0,R0*.6,0,0,Math.PI*2);ctx.fill();
    const G=ctx.createLinearGradient(0,cy-R0*.6-Wm,0,cy);G.addColorStop(0,'#ffc060');G.addColorStop(.45,'#e8321c');G.addColorStop(1,'#6a0810');
    fillStrip(ringStrip(w,a,b,3.0,.5,.5,N),'#ff3a10',.14*fade,'lighter');fillStrip(ringStrip(w,a,b,1.8,.5,.5,N),'#ff5a1a',.22*fade,'lighter');   /* feathered soft glow */
    fillStrip(S,G,.95*fade);                                                                              /* band */
    fillStrip(ringStrip(w,a,b,.22,.7,-.2,N),'#ffe0a0',.6*fade,'lighter');                                  /* hot glossy edge */
  }else{       /* near half (in front): thick glossy blue band */
    const G=ctx.createLinearGradient(0,cy,0,cy+R0*.6+Wm);G.addColorStop(0,'#9ff2ff');G.addColorStop(.3,'#2f86ff');G.addColorStop(1,'#10268f');
    fillStrip(ringStrip(w,a,b,3.0,.5,.5,N),'#1f6bff',.14*fade,'lighter');fillStrip(ringStrip(w,a,b,1.8,.5,.5,N),'#2f9bff',.24*fade,'lighter');
    fillStrip(S,G,.95*fade);
    fillStrip(ringStrip(w,a,b,.2,-.35,.9,N),'#d8f6ff',.7*fade,'lighter');                                  /* glossy highlight along the inner edge */
  }
  ctx.restore();}const STRF=()=>[[0,14,[PAL.mid,PAL.hot,PAL.core],1,0],[-9,7,[PAL.deep,PAL.mid,PAL.hot],.85,.06],[9,8,[PAL.deep,PAL.mid,PAL.hot],.85,.03],
  [-17,4,[PAL.deep,PAL.mid],.7,.12],[17,4.5,[PAL.deep,PAL.mid],.7,.09]];   /* [normal offset, width, colours, alpha, late start] = the sword wave's */
function drawWave(w,h,fade){const drift=(1-fade)*6;
  ctx.save();
  streak(w,Math.max(0,h-.9),h,drift,30,[PAL.glow,PAL.glow],.22*fade,true);                       /* soft glow: wide low-alpha 'lighter' stroke (no shadowBlur) */
  for(const s of STRF()){const ta=Math.max(0,h-.85)+s[4],tb=h-s[4]*.6;if(tb-ta<.05)continue;
    const off=s[0]+drift*(1+Math.abs(s[0])/20),wd=s[1]*(1+(1-fade)*.25);
    streak(w,ta,tb,off,wd,s[2],s[3]*fade*.55,false);                                              /* tinted body */
    streak(w,ta,tb,off,wd*.6,s[2],s[3]*fade*.6,true);}                                            /* hot light */
  ctx.restore();}
/* ---- r7c lens shapes (reference: a flat translucent disc seen from ~35 deg, 1.6:1; navy glassy fill, darker to the centre; edge band with variable width, crisp outer edge, soft inner edge, fine brushed motion lines along it).
   hit 5 = the whole disc on the ground (far half red rim behind the hero, near half thick blue band in front, red->blue blend at the left / right sides); hits 1-4 = a sector of the same disc at chest height, blue (1-2) / red (3-4), thick head, tapering tail. ---- */
R.lens=!/atk19shape=old/.test(location.search);R.soft=!/atk19soft=0/.test(location.search);R.cres=!/atk19arc=old/.test(location.search);R.v7g=!/atk19wave=r7f/.test(location.search);R.sprK=.5;try{const q=/atk19sprsize=([0-9.]+)/.exec(location.search);if(q)R.sprK=Math.max(.5,Math.min(2.5,parseFloat(q[1])));}catch(e){}R.arcK=1.7;try{const q=/atk19arcsize=([0-9.]+)/.exec(location.search);if(q)R.arcK=Math.max(.8,Math.min(3,parseFloat(q[1])));}catch(e){}R.dbgm=0;
let LF=null;const sm01=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const LCOL={bl:[['#1e3cff',.30,1.8],['#1a34e8',.95,1],['#2a78ff',.95,.7],['#5cc8ff',.95,.4],['#e4faff',1,.13]],rd:[['#e02020',.34,1.8],['#c01418',.95,1],['#f03a1a',.95,.7],['#ff8a3a',.95,.4],['#ffd0a0',1,.14]]};
function lensGeo(w){const A=w.A,k=KS()*w.sc,cx=w.cx,cy=w.cy,Rk=A.R*k,TAU=Math.PI*2,D=Math.PI/180;
  if(A.ring){const rsv=w.rs||1,Rr=Rk*rsv;return {ring:1,Rk:Rr,th:t=>A.th0+A.s*TAU*t,pt:(t,rad)=>{const th=A.th0+A.s*TAU*t;return [cx+Rr*rad*Math.cos(th),cy+Rr*.6*rad*Math.sin(th)];},
    wr:t=>{const th=A.th0+A.s*TAU*t;return .06+.22*Math.pow(Math.max(0,.5+.5*Math.cos(th-2.356)),1.4);},fc:[cx,cy]};}
  const SP=R.cres?35:75,KK=R.cres?R.arcK:1,Rk2=Rk*KK;return {Rk:Rk2,th:t=>A.phi+A.s*(-SP+2*SP*t)*D,pt:(t,rad)=>{const th=A.phi+A.s*(-SP+2*SP*t)*D;return [cx+Rk2*rad*Math.cos(th),cy+(A.R*KK*rad*.6*Math.sin(th)+A.y0+A.dy*t)*k];},wr:t=>.28,fc:[cx,cy+(A.y0+A.dy*.5)*k]};}
function drawLens(w,h,fade,layer){const G=lensGeo(w),ring=!!G.ring,under=layer==='under',cx=w.cx,cy=w.cy,Rk=G.Rk,blue=!ring&&w.k<2;
  const len=ring?1.25:.9,a=Math.max(0,h-len),b=Math.min(h,ring?1.25:1);if(b-a<.02)return;
  const settle=ring?sm01((h-1)/.25):0,gr=R.soft?sm01(h/.32):1,ft=t=>{const q=sm01((t-a)/(ring?.6:Math.max(.2,b-a)));const tp=ring?(.2+.8*q):(.16+.84*q);let v=tp+(1-tp)*settle;if(R.soft&&!(R.dbgm&16)){v*=gr;const hd=Math.sqrt(sm01((b-t)/.08));v*=1-(1-hd)*(1-settle);}return v;},breath=R.soft&&!(R.dbgm&4)?.85*(1+.07*Math.sin(clk()*8)):1;
  const N=ring?96:44,TAU=Math.PI*2;
  const strip=inK=>{const o=[],n=[];for(let j=0;j<=N;j++){const t=a+(b-a)*j/N;o.push(G.pt(t,1));n.push(G.pt(t,1-G.wr(t)*ft(t)*inK));}return {o,n};};
  const stripO=(outK,inK)=>{const o=[],n=[];for(let j=0;j<=N;j++){const t=a+(b-a)*j/N,wv=G.wr(t)*ft(t);o.push(G.pt(t,1+wv*outK));n.push(G.pt(t,1-wv*inK));}return {o,n};};
  const half=y=>{ctx.save();ctx.beginPath();if(y<0)ctx.rect(cx-4000,cy-4000,8000,4000);else ctx.rect(cx-4000,cy,8000,4000);ctx.clip();};
  /* translucent navy fill + soft outer swooshes: behind the hero (under pass only, no depth clip) */
  if(under&&!(R.dbgm&2048)){ctx.save();ctx.globalCompositeOperation='source-over';
    if(ring){const e=Math.min(h,1);
      if(typeof CanvasRenderingContext2D.prototype.createConicGradient==='function'){   /* one smooth sheet: radial navy x conic feather behind the head, composited on a cached offscreen canvas */
        const S=Math.ceil(Rk*2+4);if(!LF||LF.width!==S){LF=document.createElement('canvas');LF.width=LF.height=S;}const g=LF.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,S,S);
        const rg=g.createRadialGradient(S/2,S/2,0,S/2,S/2,Rk);if(R.cres){rg.addColorStop(0,'rgba(0,10,60,.08)');rg.addColorStop(.6,'rgba(10,30,120,.14)');rg.addColorStop(.9,'rgba(20,60,190,.28)');rg.addColorStop(1,'rgba(20,60,190,.05)');}else{rg.addColorStop(0,'rgba(0,6,40,.62)');rg.addColorStop(.7,'rgba(10,30,120,.44)');}if(!R.cres&&R.soft&&!(R.dbgm&32)){rg.addColorStop(.92,'rgba(20,50,170,.30)');rg.addColorStop(1,'rgba(20,50,170,.08)');}else if(!R.cres)rg.addColorStop(1,'rgba(20,50,170,.34)');g.fillStyle=rg;g.beginPath();g.arc(S/2,S/2,Rk,0,TAU);g.fill();
        g.globalCompositeOperation='destination-in';const cg=g.createConicGradient(((G.th(e)%TAU)+TAU)%TAU,S/2,S/2),ln=Math.min(.3,e);cg.addColorStop(0,'rgba(0,0,0,0)');cg.addColorStop(ln,'rgba(0,0,0,1)');
        if(e<.999){cg.addColorStop(e,'rgba(0,0,0,1)');cg.addColorStop(Math.min(.9999,e+.004),'rgba(0,0,0,0)');}else cg.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=cg;g.fillRect(0,0,S,S);
        ctx.translate(cx,cy);ctx.scale(1,.6);ctx.globalAlpha=Math.min(1,fade*breath);ctx.drawImage(LF,-S/2,-S/2);}
      else{ctx.translate(cx,cy);ctx.scale(1,.6);const g=ctx.createRadialGradient(0,0,0,0,0,Rk);g.addColorStop(0,'rgba(0,6,40,.62)');g.addColorStop(.7,'rgba(10,30,120,.44)');g.addColorStop(1,'rgba(20,50,170,.34)');ctx.globalAlpha=fade;ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,Rk,G.th(0),G.th(e),w.A.s<0);ctx.closePath();ctx.fill();}}    else if(!R.cres){const c=G.fc,g=ctx.createRadialGradient(c[0],c[1],0,c[0],c[1],Rk);const rgb=blue?'8,26,110':'60,6,26';g.addColorStop(0,'rgba('+rgb+',0)');g.addColorStop(.35,'rgba('+rgb+',.2)');g.addColorStop(1,'rgba('+rgb+',.68)');ctx.globalAlpha=fade;ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(c[0],c[1]);for(let j=0;j<=N;j++){const p=G.pt(a+(b-a)*j/N,1);ctx.lineTo(p[0],p[1]);}ctx.closePath();ctx.fill();}
    ctx.restore();
    ctx.save();ctx.lineCap='round';ctx.strokeStyle='#bcc2d4';ctx.lineWidth=Math.max(3,Rk*.05);
    for(const rr of (ring?[1.1,1.22]:[1.1])){const t0=Math.max(a,h-.55),t1=Math.min(b,h-.1);if(t1-t0<.05)continue;ctx.globalAlpha=.2*fade;ctx.beginPath();for(let j=0;j<=24;j++){const p=G.pt(t0+(t1-t0)*j/24,rr);j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
    ctx.restore();}
  /* edge band: nested strips share the crisp outer edge, the inner edge fades (feather -> body -> bright rim) */
  if(R.cres){   /* r7f: soft band. Slice-by-slice, ONE linear gradient across the width per slice. Hits 1-4: long thin laser-like streak (profile = measured anime slash cross-section: glow ramp 35 %, hot core 7 %, orange->red plateau 35 %, fade tail 23 %), bell taper along the length, no caps, tail erodes first when fading. Hit 5 ring: bright rim on the very outside (white-blue near / hot red far), translucent body falling inward, flowing streak texture + shimmer while held */
    let aa,bb;if(ring){aa=a;bb=b;}else{aa=0;bb=Math.min(h,1);}
    if(bb-aa>.015&&fade>.003){
    const RDs=[[0,[229,97,92],0],[.17,[229,97,92],.5],[.35,[240,118,98],.85],[.37,[255,226,189],1],[.42,[255,211,158],1],[.5,[246,153,105],.95],[.62,[213,63,52],.9],[.77,[201,52,45],.8],[.88,[174,35,36],.45],[1,[95,38,48],0]];
    const BLs=[[0,[58,123,255],0],[.17,[58,123,255],.5],[.35,[84,150,255],.85],[.37,[228,249,255],1],[.42,[190,236,255],1],[.5,[96,172,255],.95],[.62,[58,123,255],.9],[.77,[26,42,138],.8],[.88,[20,30,110],.45],[1,[10,15,60],0]];
    const RDr=[[0,[255,170,120],0],[.04,[255,205,160],.95],[.1,[255,128,76],.95],[.25,[232,44,30],.7],[.55,[150,12,20],.3],[1,[60,4,10],0]];
    const BLr=[[0,[220,245,255],0],[.04,[242,253,255],1],[.12,[150,216,255],.95],[.3,[58,123,255],.8],[.6,[26,42,138],.4],[1,[10,15,60],0]];
    const mixc=(A,B,u)=>A.map((v,i)=>Math.round(v+(B[i]-v)*u)),rgba=(c,al)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+Math.max(0,Math.min(1,al)).toFixed(3)+')';
    const gr2=ring?1:sm01(h/.3),NS=ring?110:60,sd=(w.s0*13.7)%6.28,now_=clk(),thk=(w.thk||1)*(ring?1:(.3+.7*fade));
    const prof=t=>{const x=Math.min(1,Math.max(0,t)),z=(x-.55)/(x<.55?.30:.26);return Math.exp(-z*z);};
    const wrAt=t=>ring?G.wr(t)*ft(t)*1.7*thk:.15*prof(t)*gr2*thk;
    const noise=t=>.5*Math.sin(t*37+sd)+.5*Math.sin(t*91+sd*2.3);
    half(under?-1:1);
    for(let j=0;j<NS;j++){const t0=aa+(bb-aa)*j/NS,t1=Math.min(bb,aa+(bb-aa)*(j+1)/NS+.0018),tm=(t0+t1)/2;
      let ra=ring?1:sm01((h-tm)/.2);ra*=ring?1:Math.pow(prof(tm),.5);
      if(!ring){const front=(1-fade)*1.3-.2+.05*noise(tm);ra*=sm01((tm-front)/.22);}
      if(ra<=.004)continue;
      const w0=wrAt(t0),w1=wrAt(t1),wm=(w0+w1)/2;if(wm<.002)continue;
      const o0=G.pt(t0,1),o1=G.pt(t1,1),i0=G.pt(t0,1-w0),i1=G.pt(t1,1-w1),mo=[(o0[0]+o1[0])/2,(o0[1]+o1[1])/2],mi=[(i0[0]+i1[0])/2,(i0[1]+i1[1])/2];
      const al=(ring?fade:1)*ra*(ring?(1+.1*Math.sin(now_*18+tm*11)):(.55+.45*(1-noise(tm*3+1)*.12))),gd=ctx.createLinearGradient(mo[0],mo[1],mi[0],mi[1]);
      let u=0;if(ring)u=sm01((Math.sin(G.th(tm))+.3)/.6);else if(blue)u=1;
      const SA=ring?RDr:RDs,SB=ring?BLr:BLs;
      for(let q=0;q<SA.length;q++){const col=u<=0?SA[q][1]:u>=1?SB[q][1]:mixc(SA[q][1],SB[q][1],u);gd.addColorStop(SA[q][0],rgba(col,SA[q][2]*al));}
      ctx.globalCompositeOperation='source-over';ctx.fillStyle=gd;ctx.beginPath();ctx.moveTo(o0[0],o0[1]);ctx.lineTo(o1[0],o1[1]);ctx.lineTo(i1[0],i1[1]);ctx.lineTo(i0[0],i0[1]);ctx.closePath();ctx.fill();}
    ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    const fb=(ring?fade:Math.min(1,fade*1.2));
    /* flowing streak texture inside the band (dash offsets run along the arc) */
    for(let s=0;s<(ring?6:3);s++){const f=.14+.13*s,pts=[];for(let q=0;q<=(ring?60:20);q++){const t=aa+(bb-aa)*q/(ring?60:20);pts.push(G.pt(t,1-wrAt(t)*f));}
      ctx.setLineDash([12+s*5,16+s*4]);ctx.lineDashOffset=-(now_*(70+s*16));ctx.lineWidth=1.2;ctx.globalAlpha=.2*fb*(ring?1:sm01(h/.5));ctx.strokeStyle=ring?(under?'#ffc09a':'#cfe8ff'):(blue?'#cfe8ff':'#ffc09a');ctx.beginPath();pts.forEach((p,q)=>q?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
    ctx.setLineDash([]);
    /* soft bloom + motion smear behind the sweep head */
    for(const [lw,aq,rr] of [[Rk*(ring?.12:.07),.05,.4],[Rk*(ring?.26:.14),.03,.45]]){ctx.lineWidth=lw;ctx.globalAlpha=aq*fb;const pts=[];for(let q=0;q<=24;q++){const t=aa+(bb-aa)*q/24;pts.push(G.pt(t,1-wrAt(t)*rr));}
      ctx.strokeStyle=ring?(under?'#ff5a30':'#3a8cff'):(blue?'#3a8cff':'#ff4a2a');ctx.beginPath();pts.forEach((p,q)=>q?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
    if(ring&&h<w.ext-.01){const t0=Math.max(aa,bb-.4),pts=[];for(let q=0;q<=14;q++){const t=t0+(bb-t0)*q/14;pts.push(G.pt(t,1-wrAt(t)*.3));}ctx.lineWidth=Rk*.16;ctx.globalAlpha=.16*fade;ctx.strokeStyle=under?'#ff8a60':'#8cc8ff';ctx.beginPath();pts.forEach((p,q)=>q?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
    ctx.globalAlpha=1;
    }
    ctx.restore();return;}  const span=Rk*.6*.3,mk=i=>{if(!ring)return (blue?LCOL.bl:LCOL.rd)[i][0];const g=ctx.createLinearGradient(0,cy-span,0,cy+span);g.addColorStop(0,LCOL.rd[i][0]);g.addColorStop(.4,LCOL.rd[i][0]);g.addColorStop(.6,LCOL.bl[i][0]);g.addColorStop(1,LCOL.bl[i][0]);return g;};
  const fam=blue?LCOL.bl:LCOL.rd,SOFT=R.soft&&!(R.dbgm&1);
  /* soft glow layers (outer halo + wide inner fade): drawn once, un-clipped, behind the hero, so no hard cut at the depth line */
  if(SOFT&&under&&!(R.dbgm&1024)){fillStrip(stripO(1.5,0),mk(2),.10*fade,'lighter');fillStrip(stripO(.9,.2),mk(2),.16*fade,'lighter');fillStrip(stripO(.45,.4),mk(3),.2*fade,'lighter');fillStrip(strip(fam[0][2]*.62),mk(0),fam[0][1]*.7*fade,'lighter');}
  half(under?-1:1);
  if(!(R.dbgm&512))for(let i=SOFT?1:0;i<5;i++){fillStrip(strip(fam[i][2]),mk(i),fam[i][1]*fade*(R.soft&&i===4?.8:1),i===0?'lighter':'source-over');}
  /* fine motion lines along the band, running with the sweep */
  ctx.lineWidth=1.6;ctx.lineCap='butt';ctx.globalCompositeOperation='lighter';
  for(let j=0;j<5;j++){const f=.12+.17*j,pts=[];for(let q=0;q<=N;q++){const t=a+(b-a)*q/N;pts.push(G.pt(t,1-G.wr(t)*ft(t)*f));}
    ctx.setLineDash([16+j*6,5+j*3]);ctx.lineDashOffset=-(h*(R.soft?150:260)+j*17);ctx.globalAlpha=(R.soft?.45:.6)*fade;
    if(ring){const g=ctx.createLinearGradient(0,cy-span,0,cy+span);g.addColorStop(0,'#ffe6c0');g.addColorStop(.4,'#ffe6c0');g.addColorStop(.6,'#d6f4ff');g.addColorStop(1,'#d6f4ff');ctx.strokeStyle=g;}else ctx.strokeStyle=blue?'#d6f4ff':'#ffe6c0';
    ctx.beginPath();pts.forEach((p,q)=>q?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
  ctx.setLineDash([]);
  /* head flash while the cut sweeps */
  if(h<w.ext-.01){const p=G.pt(b,1),r=Rk*(R.soft?.24:.16),g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r);{const fa=R.soft?.68:.85;g.addColorStop(0,ring?'rgba(255,240,216,'+fa+')':(blue?'rgba(214,244,255,'+fa+')':'rgba(255,226,184,'+fa+')'));}g.addColorStop(1,'rgba(255,255,255,0)');ctx.globalAlpha=fade;ctx.fillStyle=g;ctx.fillRect(p[0]-r,p[1]-r,2*r,2*r);}
  ctx.restore();}/* depth: the part above the hero's chest line on screen is behind the hero (drawn before the body), the rest in front */
const hEase=(p,w)=>R.cres?(w&&w.ring?p:1-Math.pow(1-p,2.5)):R.soft&&!(R.dbgm&128)?sm01(p):p,fEase=x=>R.soft&&!(R.dbgm&128)?sm01(x):x;
/* ---- r7f: port of the approved cloud demo (real-speed timings from DeaRz's clip): hit 5 ring baked once per size into an offscreen canvas as a per-pixel profile (outer glow, thin hot core on the outer edge, body fading inward, translucent lens fill; thick bottom-left blue, thin top red); snap-in, hold .13 s, contract .10 s, grey shockwave disc .22 s, ember dashes. Hits 1-4: long flat thin streaks (layered glow / mid / core strokes, butt caps, bell taper), head sweeps in .06 s, gone by .17 s. ---- */
const _lp=(a,b,t)=>a+(b-a)*t,_cl=(x,a,b)=>Math.max(a,Math.min(b,x)),_ss=(a,b,x)=>{const t=_cl((x-a)/(b-a),0,1);return t*t*(3-2*t);},_mx=(c1,c2,t)=>[_lp(c1[0],c2[0],t),_lp(c1[1],c2[1],t),_lp(c1[2],c2[2],t)];
const RBAKE={};
function bakeRingImg(R0){const s=Math.min(2,Math.max(1,window.devicePixelRatio||1)),key=Math.round(R0)+'@'+s;if(RBAKE[key])return RBAKE[key];
  const RX=R0*s,RY=RX*.6,PAD=RX*.45,w=Math.ceil(2*(RX+PAD)),h=Math.ceil(2*(RY+PAD)),c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d'),img=g.createImageData(w,h),d=img.data,cx=w/2,cy=h/2;
  const RED={core:[255,232,196],hot:[255,150,90],body:[226,66,48],tail:[120,22,30],glow:[235,80,60]},BLU={core:[228,246,255],hot:[140,200,255],body:[52,96,255],tail:[22,32,120],glow:[70,120,255]};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const nx=(x-cx)/RX,ny=(y-cy)/RY,r=Math.hypot(nx,ny),th=Math.atan2(ny,nx),sn=Math.sin(th),blue=_ss(-.32,.32,sn),bl=Math.max(0,Math.cos(th-2.25));
    const wPx=1.35*RX*(.035+.2*Math.pow(bl,1.3)*blue+.07*blue*Math.max(0,sn)+.06*(1-blue)*Math.max(0,-sn)),gain=.55+.45*Math.max(Math.pow(bl,1.2)*blue,(1-blue)*Math.max(0,-sn+.15)),dd=(r-1)*RX/wPx;
    const P=blue>.5?BLU:RED,Q=blue>.5?RED:BLU,m=blue>.5?1-blue:blue,pick=k=>_mx(P[k],Q[k],m);let R=0,G=0,B=0,A=0;
    if(dd>0){const gl=Math.exp(-Math.pow(dd/.55,2))*.75,c1=pick('glow');R+=c1[0]*gl;G+=c1[1]*gl;B+=c1[2]*gl;A+=gl*.85;}
    const co=Math.exp(-Math.pow(dd/.16,2));{const c1=pick('core');R+=c1[0]*co;G+=c1[1]*co;B+=c1[2]*co;A+=co;}
    if(dd<0){const tt=-dd,body=(1-_ss(.15,1.15,tt))*.95,tail=(1-_ss(.9,1.7,tt))*.45,cb=_mx(pick('hot'),pick('body'),_ss(0,.5,tt)),ct=pick('tail'),k1=body,k2=tail*(1-body);
      R+=cb[0]*k1+ct[0]*k2;G+=cb[1]*k1+ct[1]*k2;B+=cb[2]*k1+ct[2]*k2;A+=k1+k2*.9;const fb=Math.pow(Math.max(0,.5+.5*Math.sin(tt*10+th*3+Math.sin(th*5+tt*2)*1.6)),.8),st=.78+.22*fb;R*=st;G*=st;B*=st;A*=(.7+.3*fb);}
    if(r<1){const f=.36*_ss(.5,.99,r)*(.35+.65*blue)+.08*_ss(.1,.9,r),fc=_mx([120,30,40],[42,92,255],blue);R+=fc[0]*f;G+=fc[1]*f;B+=fc[2]*f;A+=f;}
    A*=gain;R*=gain;G*=gain;B*=gain;A=_cl(A,0,1);const i=(y*w+x)*4;if(A>.004){const iv=1/Math.max(A,1e-4);d[i]=_cl(R*iv,0,255);d[i+1]=_cl(G*iv,0,255);d[i+2]=_cl(B*iv,0,255);d[i+3]=A*255;}}
  g.putImageData(img,0,0);return RBAKE[key]={c,s,RX,RY,w,h};}
setTimeout(()=>{try{bakeRingImg(R.spinR);}catch(e){}},2500);   /* pre-bake once so the first spin does not hitch */
function ringLife(w){return w.H+.1+.22;}
function shockDraw(w,layer,t){if(layer!=='under'||t<0)return;const Lt=ringLife(w),sw=_cl(t/Lt,0,1),R0=w.A.R*KS()*w.sc,swR=_lp(1,1.22,1-Math.pow(1-sw,2)),swA=.16*(1-_ss(.3,1,sw));if(swA<.003)return;
  ctx.save();ctx.translate(w.cx,w.cy);ctx.scale(1,.6);const rr=R0*swR,gr=ctx.createRadialGradient(0,0,rr*.55,0,0,rr);gr.addColorStop(0,'rgba(180,185,205,0)');gr.addColorStop(.7,'rgba(180,185,205,'+swA.toFixed(3)+')');gr.addColorStop(.92,'rgba(200,205,225,'+(swA*1.3).toFixed(3)+')');gr.addColorStop(1,'rgba(200,205,225,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,rr,0,7);ctx.fill();ctx.restore();}
function ringDraw(w,layer,t){const HOLD=w.H,EXIT=.10;if(t<0||t>HOLD+EXIT)return;const B=bakeRingImg(w.A.R*KS()*w.sc),rw=B.w/B.s,rh=B.h/B.s;let sc=1,al=1;if(t>HOLD){const e=(t-HOLD)/EXIT;sc=_lp(1,.55,e*e);al=1-_ss(.6,1,e);}
  ctx.save();ctx.beginPath();if(layer==='under')ctx.rect(w.cx-4000,w.cy-4000,8000,4000);else ctx.rect(w.cx-4000,w.cy,8000,4000);ctx.clip();
  ctx.translate(w.cx,w.cy);ctx.scale(sc,sc);{const RXs=B.RX/B.s,RYs=B.RY/B.s;ctx.globalAlpha=al*.55;ctx.fillStyle='rgba(8,10,28,1)';ctx.beginPath();ctx.ellipse(0,RYs*.06,RXs*.97,RYs*.97,0,0,7);ctx.ellipse(0,-RYs*.02,RXs*.82,RYs*.78,0,0,7);ctx.fill('evenodd');}ctx.globalAlpha=al;ctx.drawImage(B.c,-rw/2,-rh/2,rw,rh);
  if(t<.04){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35*al;ctx.drawImage(B.c,-rw/2,-rh/2,rw,rh);ctx.globalCompositeOperation='source-over';}
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(let k=0;k<5;k++){const a0=k*1.26+t*9,len=.5,bs=Math.sin(a0+len/2)>0;ctx.strokeStyle=bs?'rgba(170,215,255,'+(.35*al)+')':'rgba(255,200,160,'+(.3*al)+')';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,0,B.RX/B.s*.985,B.RY/B.s*.985,0,a0,a0+len);ctx.stroke();}
  ctx.restore();}
const STK={1:{b:1,f:1,tilt:-.10},2:{b:1,f:-1,tilt:.45},3:{b:0,f:-1,tilt:.08},4:{b:0,f:1,tilt:-.5}},BA0=.1*Math.PI,BA1=.9*Math.PI;
const BBAKE={};
function bakeBladeImg(key,RB0){const s=Math.min(2,Math.max(1,window.devicePixelRatio||1)),k2=key+Math.round(RB0)+'@'+s;if(BBAKE[k2])return BBAKE[k2];
  const RB=RB0*s,pad=RB*.7,w=Math.ceil(2*(RB+pad)),h=Math.ceil(RB+pad*2),mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;},c=mk(),cs=mk();
  const g=c.getContext('2d'),img=g.createImageData(w,h),d=img.data,gs=cs.getContext('2d'),imgS=gs.createImageData(w,h),ds=imgS.data,cx=w/2,cy=pad;
  const P=key==='b'?{core:[236,250,255],hot:[150,215,255],body:[58,110,255],deep:[16,22,80],glow:[80,130,255],sh:[46,58,85]}:{core:[255,246,214],hot:[255,196,90],body:[240,92,40],deep:[80,12,26],glow:[255,110,50],sh:[60,46,72]};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=x-cx,dy=y-cy,r=Math.hypot(dx,dy),th=Math.atan2(dy,dx);if(th<BA0-.25||th>BA1+.25)continue;
    const u=_cl((th-BA0)/(BA1-BA0),0,1),bell=Math.max(0,Math.sin(Math.PI*u));if(bell<=.001)continue;
    const wPx=RB*.5*bell+.3,dd=(r-RB)/wPx;let R=0,G=0,B=0,A=0;
    if(dd>0){const gl=Math.exp(-Math.pow(dd/.35,2))*.55;R+=P.glow[0]*gl;G+=P.glow[1]*gl;B+=P.glow[2]*gl;A+=gl*.75;}
    if(dd<=.15){const tt=Math.max(0,-dd),cc=tt<.08?P.core:tt<.3?_mx(P.core,P.hot,_ss(.05,.3,tt)):tt<.65?_mx(P.hot,P.body,_ss(.3,.6,tt)):_mx(P.body,P.deep,_ss(.6,.95,tt)),a0=(1-_ss(.85,1.05,tt))*(dd>0?Math.exp(-Math.pow(dd/.06,2)):1),fib=tt<.1?1:.3+.7*Math.pow(Math.max(0,.5+.5*Math.sin(tt*17+th*4+Math.sin(th*9+tt*3)*1.3)),.7),a=a0*(tt<.1?1:_lp(1,fib,_ss(.1,.5,tt)));R+=cc[0]*a;G+=cc[1]*a;B+=cc[2]*a;A+=a;}
    const gain=.5+.5*bell;A=_cl(A*Math.min(1,gain*1.2),0,1);const i=(y*w+x)*4;if(A>.004){const inv=1/Math.max(A,1e-4);d[i]=_cl(R*inv,0,255);d[i+1]=_cl(G*inv,0,255);d[i+2]=_cl(B*inv,0,255);d[i+3]=A*255;}
    if(dd<.1&&dd>-1.05){const sa=.5*bell;ds[i]=P.sh[0];ds[i+1]=P.sh[1];ds[i+2]=P.sh[2];ds[i+3]=sa*255;}}
  g.putImageData(img,0,0);gs.putImageData(imgS,0,0);return BBAKE[k2]={c,cs,cx,cy,s};}
setTimeout(()=>{try{for(const k of ['b','r']){bakeBladeImg(k,Math.round(80*1.25));bakeBladeImg(k,Math.round(92*1.25));}}catch(e){}},3200);
const BSW=.06,BLIFE=.24;
function bladeTip(w,t){const S=STK[w.k+1],head=1-Math.pow(1-_cl(t/BSW,0,1),2),grow=1+.06*_ss(0,BLIFE,t),RBk=reachOf(w.k)*1.25,ta=_lp(BA0,BA1,Math.min(1,head)),rot=w.A.phi-Math.PI/2+S.tilt,lx=Math.cos(ta)*RBk*S.f*grow,ly=Math.sin(ta)*RBk*grow;return [w.cx+lx*Math.cos(rot)-ly*Math.sin(rot),w.cy+(lx*Math.sin(rot)+ly*Math.cos(rot))*.6];}
function bladeDraw(w,layer,t){const S=STK[w.k+1];if(!S)return;if(t<0||t>BLIFE)return;const ph=w.A.phi,front=Math.sin(ph)>-.3;if((layer==='under')===front)return;
  const RBk=Math.round(reachOf(w.k)*1.25),BL=bakeBladeImg(S.b?'b':'r',RBk),head=1-Math.pow(1-_cl(t/BSW,0,1),2),fade=1-_ss(BSW*.8,BLIFE,t),grow=1+.06*_ss(0,BLIFE,t),dw=BL.c.width/BL.s,dh=BL.c.height/BL.s,ox=-BL.cx/BL.s,oy=-BL.cy/BL.s,lag=1-Math.pow(1-_cl((t-.025)/BSW,0,1),2);
  ctx.save();ctx.translate(w.cx,w.cy);ctx.scale(1,.6);ctx.rotate(ph-Math.PI/2+S.tilt);ctx.scale(S.f*grow,grow);
  const parts=head<1?[[0,.4],[.12,.25],[.24,.2],[.36,.15]]:[[0,1]];
  for(const [back,wt] of parts){ctx.save();if(head<1){const ah=_lp(BA0-.2,BA1+.6,head)-back;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,RBk*1.8,BA0-1.2,ah);ctx.closePath();ctx.clip();}
    const k=head<1?wt/.4:1,fs=1-_ss(BSW*.4,BSW+.08,t);
    ctx.save();ctx.rotate(-.12*(1-lag)-.06);ctx.scale(.94,.94);ctx.globalAlpha=.9*fs*Math.min(1,k);ctx.drawImage(BL.cs,ox,oy,dw,dh);ctx.restore();   /* dark afterimage inside the curve, one frame behind */
    ctx.globalAlpha=fade*Math.min(1,k);ctx.drawImage(BL.c,ox,oy,dw,dh);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.3*fade*Math.min(1,k);ctx.drawImage(BL.c,ox,oy,dw,dh);ctx.restore();}
  ctx.restore();
  if(t>=BSW&&t<BSW+.08){const p=bladeTip(w,t),k=1-(t-BSW)/.08;ctx.save();ctx.globalCompositeOperation='lighter';const gr=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],30),col=S.b?'150,200,255':'255,200,120';gr.addColorStop(0,'rgba(255,255,255,'+(.9*k)+')');gr.addColorStop(.35,'rgba('+col+','+(.55*k)+')');gr.addColorStop(1,'rgba('+col+',0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p[0],p[1],30,0,7);ctx.fill();ctx.restore();}}function ringEmbers(w){const R0=w.A.R*KS()*w.sc;for(let i=0;i<26;i++){const a=Math.random()*6.283,r=R0*1.05*(.9+Math.random()*.5),sp=60+Math.random()*120;SPK.push({x:w.cx+Math.cos(a)*r,y:w.cy+Math.sin(a)*r*.6,vx:Math.cos(a)*sp*3,vy:Math.sin(a)*sp*.6*3,t0:clk(),life:.25+Math.random()*.25,l:5+Math.random()*6,c:Math.random()<.3?'#ffd870':'#ff8a2a'});}while(SPK.length>260)SPK.shift();}function drawShock(w,layer,now){if(layer!=='under')return;const ts=now-w.s0,tt=w.tt;if(ts<0)return;const R0=w.A.R*KS()*w.sc,e=sm01(Math.min(1,ts/.16)),r=R0*(1+.5*e);let a0=.2*sm01(Math.min(1,ts/.04));if(tt>w.H)a0*=1-sm01((tt-w.H)/Math.max(.1,w.ling-w.H));if(a0<.004)return;
  ctx.save();ctx.translate(w.cx,w.cy);ctx.scale(1,.6);const g=ctx.createRadialGradient(0,0,r*.2,0,0,r);g.addColorStop(0,'rgba(190,196,214,0)');g.addColorStop(.6,'rgba(190,196,214,'+(a0*.35).toFixed(3)+')');g.addColorStop(.92,'rgba(205,210,230,'+a0.toFixed(3)+')');g.addColorStop(1,'rgba(205,210,230,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,6.2832);ctx.fill();
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle='#cfd6ea';
  for(let k=0;k<4;k++){const rr=r*(.5+.13*k),st=ts*(k%2?2:-2.5)+k*1.7;ctx.lineWidth=Math.max(2,r*.05);ctx.globalAlpha=a0*.35;ctx.beginPath();ctx.arc(0,0,rr,st,st+1.1);ctx.stroke();}
  ctx.restore();}/* ---- r7g: port of the cloud demo v12 (DeaRz painted blades). Blue = hits 1-2, red = hits 3-4. Reveal tail->head (conic mask), smear copies only while sweeping, white glint along the edge, tail erodes + thins on exit, bloom; aura = blurred copy eaten by 2 scrolling noise masks, drawn additively in 2 layers drifting back inside the curve and dissolving; target impact (flash, crossed sparks, faint ring) + ember dashes. The bulge faces the locked target, the target sits in the hollow. ---- */
const SPRD={blue:'assets/20550c6fdb1d6253.png',red:'assets/a26a3b831aacda4e.png'};
R.purple=!/atk19color=orig/.test(location.search);R.purpleSame=/atk19purple=same/.test(location.search);const PIMG={};
/* r7j: violet recolour, baked ONCE per sprite at load (alpha kept, luminance mapped through one purple ramp: L 0 #1e0b33, .25 #4a1f80, .5 #7b3fd0, .75 #b98cff, .92 #e9dbff, 1 #fff). Hits 3-4 use a slightly more magenta mid (#8a3fd0 / #c98cff) so the combo still reads 1-2 vs 3-4; ?atk19purple=same = identical colour; ?atk19color=orig = original blue / red */
const PR_A=[[0,[38,14,64]],[.25,[78,34,134]],[.5,[128,70,214]],[.75,[190,146,255]],[.92,[233,219,255]],[1,[255,255,255]]],PR_B=[[0,[42,10,51]],[.25,[102,24,111]],[.5,[168,59,196]],[.75,[224,140,255]],[.92,[248,220,255]],[1,[255,255,255]]];   /* QA: 3-4 more magenta, dark end lifted for grass legibility */
function rampAt(R_,L){for(let i=1;i<R_.length;i++){if(L<=R_[i][0]){const a=R_[i-1],b=R_[i],u=(L-a[0])/(b[0]-a[0]||1);return [a[1][0]+(b[1][0]-a[1][0])*u,a[1][1]+(b[1][1]-a[1][1])*u,a[1][2]+(b[1][2]-a[1][2])*u];}}return R_[R_.length-1][1];}
function recolor(im,k){const w=im.naturalWidth,h=im.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0);const id=g.getImageData(0,0,w,h),d=id.data,RP=(k==='red'&&!R.purpleSame)?PR_B:PR_A,LUT=[];
  for(let q=0;q<=255;q++)LUT.push(rampAt(RP,q/255));
  for(let i=0;i<d.length;i+=4){if(d[i+3]<2)continue;const L=Math.min(255,Math.max(0,Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]))),c3=LUT[L];d[i]=c3[0];d[i+1]=c3[1];d[i+2]=c3[2];}
  g.putImageData(id,0,0);return c;}const OIMG={},ORA=[[0,[60,14,8]],[.25,[194,65,12]],[.5,[249,115,22]],[.75,[253,186,116]],[.92,[255,243,224]],[1,[255,255,255]]];function recolorO(im){const w=im.naturalWidth,h=im.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0);const id=g.getImageData(0,0,w,h),d=id.data,LUT=[];for(let q=0;q<=255;q++)LUT.push(rampAt(ORA,q/255));for(let i=0;i<d.length;i+=4){if(d[i+3]<2)continue;const L=Math.min(255,Math.max(0,Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]))),c3=LUT[L];d[i]=c3[0];d[i+1]=c3[1];d[i+2]=c3[2];}g.putImageData(id,0,0);return c;}const SIMG={};for(const k in SPRD){const im=new Image();im.onload=()=>{try{PIMG[k]=recolor(im,k);OIMG[k]=recolorO(im);}catch(e){R.err='recolor '+e.message;}};im.src=SPRD[k];SIMG[k]=im;}
const sprOK=im=>im&&(im.complete===undefined||im.complete)&&(im.naturalWidth||im.width)>0;
const SSTK=[{col:'b',flip:-1,tilt:-.45,from:'bottom'},{col:'b',flip:1,tilt:-2.45,from:'top'},{col:'r',flip:1,tilt:-.20,from:'top'},{col:'r',flip:-1,tilt:-2.55,from:null}];   /* r7h: shape/placement as r7g; `from` = which on-screen tip the sweep reveal starts at (hit 1 bottom, hits 2-3 top, hit 4 unchanged); decided per facing in sprDraw */
R.fromOff=/atk19sweep=old/.test(location.search);const FR_=S=>R.fromOff?null:S.from;
let OFFc=null,AUXc=null,NZc=null;
function noiseTexG(){if(NZc)return NZc;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  for(let i=0;i<70;i++){const x=Math.random()*128,y=Math.random()*128,r=6+Math.random()*22,a=.35+Math.random()*.6;
    for(const ox of[-128,0,128])for(const oy of[-128,0,128]){const gr=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,r);gr.addColorStop(0,'rgba(0,0,0,'+a+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x+ox-r,y+oy-r,r*2,r*2);}}
  return NZc=c;}
function sprPlace(w,dw){const S=SSTK[w.k],phi=w.fa||0,bx=-Math.sin(S.tilt),by=Math.cos(S.tilt),up=by<0,off=(up?.42:.28)*dw/2,fz=dw/286,
  ox=-bx*off+(up?(w.k===1?28:14)*fz:0),oy=-by*off+(up?(w.k===3?-4:6)*fz:0),tx=w.tx!=null?w.tx:Math.cos(phi)*dw*.3,ty=w.ty!=null?w.ty:Math.sin(phi)*dw*.3,cp=Math.cos(phi),sp=Math.sin(phi);
  const up_=-14;return {cx:w.cx+tx+ox*cp-oy*sp,cy:w.cy+ty+up_+ox*sp+oy*cp,tx:w.cx+tx,ty:w.cy+ty+up_,phi,sq:1-.2*Math.abs(sp)};}
const TIPD=[[[-6,-34,63,-48],[-55,-47,23,-30],[-66,-56,-4,-29],[-46,-100,-67,-53],[6,-109,-63,-81],[55,-95,-23,-100],[66,-87,4,-102],[46,-42,67,-77]],[[-14,-65,64,-61],[-43,-73,35,-34],[-65,-84,-5,-22],[-64,-112,-48,-33],[-27,-132,-63,-57],[27,-132,-42,-80],[65,-112,5,-89],[30,-66,73,-90]],[[-5,-106,64,-79],[47,-97,66,-50],[64,-52,3,-27],[53,-43,-24,-28],[5,-31,-64,-47],[-47,-40,-66,-75],[-64,-84,-3,-100],[-53,-93,24,-98]],[[29,-130,62,-55],[66,-109,46,-31],[65,-80,4,-20],[42,-70,-36,-31],[13,-63,-65,-58],[-31,-64,-75,-88],[-65,-110,-4,-86],[-26,-130,41,-77]]];   /* r7k_r4: measured dagger-tip screen path (sprite px, rel. to anchor) over the slash window of each hit x 8 facings [x0,y0,x1,y1]; index = hit-1, facing E,SE,S,SW,W,NW,N,NE */
R.wavedir='tiprot';try{const q=/atk19wavedir=(\w+)/.exec(location.search);if(q)R.wavedir=q[1];}catch(e){}   /* ?atk19wavedir=old -> previous fixed sweep rule */
function TREV(w,S,P_,old){if(R.wavedir==='old')return old;const ph=P_.phi,di=Math.round((((ph*180/Math.PI)%360)+360)%360/45)%8,T=w.sw?TIPSW[di]:(TIPD[w.k]&&TIPD[w.k][di]);if(!T)return old;const r=ph+S.tilt,nrm=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;},trav=(rr,rv)=>{const tx=S.flip*Math.cos(rr),ty=P_.sq*S.flip*Math.sin(rr);return rv?Math.atan2(-ty,-tx):Math.atan2(ty,tx);},tipA=Math.atan2(T[3]-T[1],T[2]-T[0]),RM=45*Math.PI/180;let rev=Math.cos(trav(r,false)-tipA)<0,rot=0;if(R.wavedir!=='tip'){for(let i=0;i<2;i++){const df=nrm(tipA-trav(r+rot,rev));rot=Math.max(-RM,Math.min(RM,rot+df));rev=Math.cos(trav(r+rot,false)-tipA)<0;}}P_.rot=rot;if(!w.tl){w.tl=1;(R.tipLog=R.tipLog||[]).push({hit:w.k+1,dir:di,rev,old,rot:Math.round(rot*180/Math.PI),tipAng:Math.round(tipA*180/Math.PI),waveAng:Math.round(trav(r+rot,rev)*180/Math.PI)});}return rev;}
function sprDraw(w,t){const S=SSTK[w.k];if(!S)return;const sweep=.05,hold=.1,life=.27;if(t<0||t>life)return;
  const key_=S.col==='b'?'blue':'red',im=w.sw?OIMG[key_]:((R.purple&&PIMG[key_])?PIMG[key_]:SIMG[key_]);if(!sprOK(im))return;const nW_=im.naturalWidth||im.width,nH_=im.naturalHeight||im.height;
  const c=ctx,DP=Math.max(1,Math.min(3,c.getTransform().a||1)),dw=reachOf(w.k)*2.55*R.sprK,dh=dw*nH_/nW_,P_=sprPlace(w,dw),cx=P_.cx,cy=P_.cy;
  const S_REV=TREV(w,S,P_,(FR_(S)==='bottom'?!((-S.flip*Math.sin(P_.phi+S.tilt))>0):FR_(S)==='top'?((-S.flip*Math.sin(P_.phi+S.tilt))>0):false)),head=1-Math.pow(1-_cl(t/sweep,0,1),2),ex=_cl((t-hold)/(life-hold),0,1),ow=Math.ceil(dw*1.2*DP),oh=Math.ceil(dh*1.3*DP);
  if(!OFFc||OFFc.width!==ow||OFFc.height!==oh){OFFc=document.createElement('canvas');OFFc.width=ow;OFFc.height=oh;}
  const o=OFFc.getContext('2d');o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.globalAlpha=1;o.clearRect(0,0,ow,oh);o.setTransform(DP,0,0,DP,0,0);
  const px=dw*.6,py=dh*.08,sx=px-dw/2,sy=py+dh*.03;
  o.drawImage(im,sx,sy,dw,dh);                                                                                   /* 1) the painted blade */
  const sm=1-_cl((t-sweep*.6)/.06,0,1);if(sm>0){o.globalCompositeOperation='lighter';for(const [a,al] of [[.07,.5],[.15,.28]]){o.save();o.translate(px,py);o.rotate(S_REV?-a:a);o.translate(-px,-py);o.globalAlpha=al*sm;o.drawImage(im,sx,sy,dw,dh);o.restore();}}   /* 2) smear only while sweeping */
  o.globalCompositeOperation='source-atop';o.globalAlpha=1;
  const ga0=_lp(Math.PI*.95,Math.PI*.05,_cl(t/(hold+.04),0,1)),ga=S_REV?Math.PI-ga0:ga0,gx=px+Math.cos(ga)*dw*.5,gy=py+Math.sin(ga)*dh*.9,gg=o.createRadialGradient(gx,gy,0,gx,gy,dw*.22);gg.addColorStop(0,'rgba(255,255,255,0.75)');gg.addColorStop(1,'rgba(255,255,255,0)');o.fillStyle=gg;o.fillRect(0,0,ow,oh);   /* 3) glint */
  const rr_=P_.phi+S.tilt,startLower=(-S.flip*Math.sin(rr_))>0,rev=S_REV;R.lastRev=rev;if(!w.lg){w.lg=1;const ys=P_.sq*(-S.flip*Math.sin(rr_)),xs=-S.flip*Math.cos(rr_);(R.sweepLog=R.sweepLog||[]).push({hit:w.k+1,dir:+(((w.fa||0)*180/Math.PI+360)%360).toFixed(0),from:FR_(S),rev,startTipY:+((rev?-ys:ys)).toFixed(2),endTipY:+((rev?ys:-ys)).toFixed(2),startTipX:+((rev?-xs:xs)).toFixed(2)});}   /* r7h: reveal starts at the requested screen tip */
  const hA=_lp(Math.PI+.25,-.35,head),tA=_lp(Math.PI+.55,-.1,Math.pow(ex,1.2)),f=a=>_cl(a/(Math.PI*2),0,1);
  if(o.createConicGradient){o.save();if(rev){o.translate(px,0);o.scale(-1,1);o.translate(-px,0);}const cg=o.createConicGradient(0,px,py);cg.addColorStop(f(hA-.3),'rgba(0,0,0,0)');cg.addColorStop(f(hA),'rgba(0,0,0,1)');cg.addColorStop(f(Math.max(hA,tA-.45)),'rgba(0,0,0,1)');cg.addColorStop(f(tA),'rgba(0,0,0,0)');cg.addColorStop(1,'rgba(0,0,0,0)');o.globalCompositeOperation='destination-in';o.fillStyle=cg;o.fillRect(-ow,-oh,3*ow,3*oh);o.restore();}   /* 4) soft reveal + tail erosion */
  o.globalCompositeOperation='source-over';
  const fade=1-_ss(.55,1,ex),Y0=.6*dw/2-(sy-py+dh*.93);
  if(!AUXc||AUXc.width!==ow||AUXc.height!==oh){AUXc=document.createElement('canvas');AUXc.width=ow;AUXc.height=oh;}
  const ax=AUXc.getContext('2d');ax.setTransform(1,0,0,1,0,0);ax.globalCompositeOperation='source-over';ax.globalAlpha=1;ax.clearRect(0,0,ow,oh);
  try{ax.filter='blur('+Math.round(5*DP)+'px)';}catch(e){}ax.drawImage(OFFc,0,0);try{ax.filter='none';}catch(e){}
  const q=_cl(t/life,0,1),NZ=noiseTexG();ax.globalCompositeOperation='destination-out';
  for(const [sx2,sy2,al] of [[220,-40,.4+.5*q],[-150,-60,.25+.55*q]]){const pat=ax.createPattern(NZ,'repeat');if(pat&&pat.setTransform)pat.setTransform(new DOMMatrix().translate(t*sx2*DP+(w.k+1)*37,t*sy2*DP+(w.k+1)*53).scale(DP*3.2,DP*.9));ax.globalAlpha=Math.min(1,al);ax.fillStyle=pat;ax.fillRect(0,0,ow,oh);}
  ax.globalCompositeOperation='source-over';
  const auraIn=_cl((t-.02)/.05,0,1),base=(k_)=>{c.save();c.translate(cx,cy);c.scale(1,P_.sq);c.rotate(P_.phi+S.tilt+(P_.rot||0));c.scale(S.flip*k_,(1-.25*ex)*k_);};
  for(const [d0,d1,al,sc] of [[6,30,1,.97],[16,56,.6,.92]]){const d=_lp(d0,d1,1-Math.pow(1-q,1.5)),a=al*auraIn*Math.pow(1-q,.8);if(a<=.01)continue;
    c.save();c.translate(cx,cy);c.scale(1,P_.sq);c.rotate(P_.phi+S.tilt+(P_.rot||0));c.scale(S.flip*sc,(1-.25*ex)*sc);c.translate(0,-d);c.globalCompositeOperation='lighter';c.globalAlpha=a;c.drawImage(AUXc,-px,-py+Y0,ow/DP,oh/DP);c.restore();}   /* aura: two additive layers drifting back inside the curve */
  c.save();c.translate(cx,cy);c.scale(1,P_.sq);c.rotate(P_.phi+S.tilt+(P_.rot||0));c.scale(S.flip,1-.25*ex);c.globalAlpha=fade;c.drawImage(OFFc,-px,-py+Y0,ow/DP,oh/DP);c.globalCompositeOperation='lighter';c.globalAlpha=.35*fade*(1-.6*ex);c.drawImage(OFFc,-px,-py+Y0,ow/DP,oh/DP);c.restore();   /* blade + bloom */
  /* target impact: flash, two crossed spark lines, faint ring (scaled to the game's hero size) */
  const ti=t-.03;if(ti>=0&&ti<=.26){c.save();c.translate(P_.tx,P_.ty);c.scale(.85*R.sprK,.85*R.sprK);impactG(c,0,0,{col:S.col,tilt:S.tilt+P_.phi,flip:S.flip,sw:w.sw},ti);c.restore();}}
function impactG(c,x,y,S,t){const col=S.sw?'255,150,60':R.purple?'200,160,255':(S.col==='b'?'150,200,255':'255,190,110');c.save();c.globalCompositeOperation='lighter';
  if(t<.09){const k=1-t/.09,g=c.createRadialGradient(x,y,0,x,y,46);g.addColorStop(0,'rgba(255,255,255,'+(.6*k)+')');g.addColorStop(.5,'rgba('+col+','+(.35*k)+')');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.beginPath();c.arc(x,y,46,0,7);c.fill();}
  if(t>=0&&t<.2){const e=t/.2,k=1-e,L=_lp(26,52,Math.sqrt(e));c.lineCap='butt';for(const a of [S.tilt-.9*S.flip,S.tilt+.55*S.flip]){const dx=Math.cos(a)*L,dy=Math.sin(a)*L,g=c.createLinearGradient(x-dx,y-dy,x+dx,y+dy);g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(.5,'rgba(255,250,235,'+(.9*k)+')');g.addColorStop(1,'rgba('+col+',0)');c.strokeStyle=g;c.lineWidth=2.2*k+.6;c.beginPath();c.moveTo(x-dx,y-dy);c.lineTo(x+dx,y+dy);c.stroke();}}
  if(t>.04){const e=(t-.04)/.22,r=_lp(40,66,1-Math.pow(1-e,2)),a=.11*(1-e),g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+col+','+(a*.5)+')');g.addColorStop(.7,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
  c.restore();}
function sprHitSparks(w){const S=SSTK[w.k],dw=reachOf(w.k)*2.55*R.sprK,P_=sprPlace(w,dw),dir=S.tilt+P_.phi+(S.flip>0?0:Math.PI);
  for(let i=0;i<9;i++){const a=dir+(Math.random()-.5)*1.6,sp=(140+Math.random()*180)*1.5*R.sprK;SPK.push({x:P_.tx,y:P_.ty-4*R.sprK,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40*R.sprK,t0:clk(),life:.12+Math.random()*.14,l:(5+Math.random()*7)*(.5+.5*R.sprK),c:w.sw?(Math.random()<.35?'#ffd29a':'#ff7a1e'):R.purple?(Math.random()<.35?'#c8a0ff':'#9a5aff'):(S.col==='b'?'#aad2ff':(Math.random()<.35?'#ffd870':'#ff8a2a'))});}
  while(SPK.length>260)SPK.shift();}function drawWaves(layer){if(!WL.length)return;
  for(const w of WL){if(w.cx==null)continue;const now=clk();if(now<w.s0)continue;let h,f=1;
    if(w.te==null)h=w.ext*hEase(Math.min(1,(now-w.s0)/(w.s1-w.s0)),w);else{h=w.ext;f=fEase(1-(now-w.te)/w.ling);}
    if(R.cres){const tc=w.ring?now-w.s0:now-w.t0;if(w.ring){shockDraw(w,layer,tc);ringDraw(w,layer,tc);}else if(R.v7g){if(layer==='over')sprDraw(w,tc);}else bladeDraw(w,layer,tc);R.wdrawn=(R.wdrawn||0)+1;continue;}
    if(f<=0)continue;
    if(R.lens){ctx.save();drawLens(w,h,f,layer);ctx.restore();R.wdrawn=(R.wdrawn||0)+1;continue;}ctx.save();ctx.beginPath();if(layer==='under')ctx.rect(w.cx-4000,w.cy-4000,8000,4000);else ctx.rect(w.cx-4000,w.cy,8000,4000);ctx.clip();
    if(w.ring)drawRing(w,h,f,layer);else{const _p=PAL;PAL=w.pal||PAL;drawWave(w,h,f);PAL=_p;}ctx.restore();R.wdrawn=(R.wdrawn||0)+1;}}
function stepWaves(){const now=clk();
  for(let i=WL.length-1;i>=0;i--){const w=WL[i];
    if(w.te==null){if(H.anchor&&now>=w.s0-0.05){w.cx=H.anchor.x;w.cy=H.anchor.y+(w.ring?0:(150-(HD.frame.ay||208))*KS());}
      if(R.cres&&w.ring&&w.cx!=null&&now>=w.s0&&!w.emb){w.emb=1;ringEmbers(w);}
      if(!R.cres&&w.ring&&w.cx!=null&&now>=w.s0){const h_=w.ext*hEase(Math.min(1,(now-w.s0)/(w.s1-w.s0)),w);spawnSparks(w,w.A.th0+w.A.s*2*Math.PI*h_);}
      if(R.v7g&&!w.ring&&w.cx!=null&&!w.imp&&now>=w.t0+.03){w.imp=1;try{sprHitSparks(w);}catch(e){R.err='spk '+e.message;}}
      if(R.cres&&!R.v7g&&!w.ring&&w.cx!=null&&now>=w.t0&&now<w.t0+BSW&&Math.random()<.7){const S=STK[w.k+1],p=bladeTip(w,now-w.t0);for(let q=0;q<2;q++)SPK.push({x:p[0],y:p[1],vx:((Math.random()-.5)*120+S.f*60)*3,vy:(-30-Math.random()*60)*3,t0:now,life:.12+Math.random()*.12,l:5+Math.random()*5,c:S.b?'#bfe0ff':Math.random()<.4?'#ffd870':'#ff8a2a'});while(SPK.length>260)SPK.shift();}
      if(now>=w.s1)w.te=now;}
    else if(now-w.te>=w.ling){WL.splice(i,1);}else if(R.cres&&w.ring&&w.cx!=null&&now-w.te>w.H&&now-w.te<w.H+.2&&Math.random()<.5){const a=Math.random()*6.283,rr=w.A.R*KS()*w.sc*(1.05+Math.random()*.35);SPK.push({x:w.cx+rr*Math.cos(a),y:w.cy+rr*.6*Math.sin(a),vx:Math.cos(a)*60,vy:Math.sin(a)*36-20,t0:now,life:.15+Math.random()*.15,l:4+Math.random()*4,c:'#8a1a14'});}}}
/* ---- r8 SWORD: the dagger's painted slash wave on the sword's basic attack, ORANGE (luminance ramp #3c0e08 -> #c2410c -> #f97316 -> #fdba74 -> #fff3e0 -> white).
   Size / distance = exactly the dagger wave (visual only; the sword's damage, reach and balance are untouched). The sword's own wave (HEROSW.wave) is replaced; ?swwave=old keeps it.
   Direction: TIPSW[facing] = measured sword-tip screen path over the cut (HEROSW.trail frames 19..26, [x0,y0,x1,y1]); per facing the crescent shape (one of dagger hits 1-3) with the smallest
   rotation needed is chosen, then TREV orients it (reveal side + up to 45 deg turn) along the cut. ---- */
R.swwave=!/swwave=old/.test(location.search);
const TIPSW=[[-17,-206,120,-168],[-30,-216,113,-117],[-20,-210,66,-69],[-30,-221,-23,-60],[-23,-232,-98,-87],[-2,-238,-116,-133],[20,-234,-66,-173],[30,-223,23,-183]];
function swNow(){try{return !!(P&&P.weapon&&P.weapon.t==='sword');}catch(e){return false;}}
function swBestK(di){const phi=di*Math.PI/4,sq=1-.2*Math.abs(Math.sin(phi)),T=TIPSW[di],tipA=Math.atan2(T[3]-T[1],T[2]-T[0]),RM=45*Math.PI/180;let bk=1,bd=9;
  const nrm=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
  for(let k=0;k<3;k++){const S=SSTK[k],r=phi+S.tilt,trav=(rr,rv)=>{const tx=S.flip*Math.cos(rr),ty=sq*S.flip*Math.sin(rr);return rv?Math.atan2(-ty,-tx):Math.atan2(ty,tx);};
    let rev=Math.cos(trav(r,false)-tipA)<0,rot=0;for(let i=0;i<2;i++){const df=nrm(tipA-trav(r+rot,rev));rot=Math.max(-RM,Math.min(RM,rot+df));rev=Math.cos(trav(r+rot,false)-tipA)<0;}
    const res=Math.abs(nrm(tipA-trav(r+rot,rev)))+.02*Math.abs(rot);if(res<bd){bd=res;bk=k;}}
  return bk;}
{const ob=basicAttack;basicAttack=function(){const L=window.HEROSW&&HEROSW.wave&&HEROSW.wave.list,n0=L?L.length:0,r=ob.apply(this,arguments);
  try{if(R.swwave&&R.wave&&R.on&&swNow()&&L&&L.length>n0){L.length=n0;const fa=(P.face!=null&&isFinite(P.face))?P.face:0,d=dirOf(fa),k=swBestK(d),hitT=(H.pend&&isFinite(H.pend.t)&&H.pend.t>clk()-.05)?H.pend.t:clk()+.7,A0=swordArc(DN[d])||{phi:d*Math.PI/4,R:112,y0:-40,dy:50,s:1};
    WL.push({A:{phi:A0.phi,R:A0.R,y0:A0.y0,dy:A0.dy,s:A0.s},k,fa,sw:1,ext:EXTW,pal:PALS.red,sc:(reachOf(k)*.95/(112*KS()))*R.wsize,t0:hitT,s0:hitT-.01,s1:hitT+.27,ling:.02,cx:null,cy:null});while(WL.length>6)WL.shift();R.swSpawned=(R.swSpawned||0)+1;}}catch(e){R.err='sw '+e.message;}
  return r;};}if(typeof drawPlayer==='function'){const od=drawPlayer;drawPlayer=function(){
  try{if(R.wave&&R.on&&(dagNow()||swNow()))drawWaves('under');}catch(e){R.err='wave u '+e.message;}
  const r=od.apply(this,arguments);
  try{if(R.wave&&R.on&&(dagNow()||swNow())){stepWaves();drawWaves('over');drawSparks();}else if(WL.length)WL.length=0;}catch(e){R.err='wave o '+e.message;}return r;};}function cell(fa){
  const now=clk();
  if(R.seg&&now-R.seg.t0>R.seg.T*2+0.6){R.seg=null;R.queued=false;}
  if(R.seg){const C=CL()[R.seg.c],x=(now-R.seg.t0)/R.seg.T;
    if(x<1.02){const f=Math.max(0,Math.min(C.n-1,Math.floor(frameAt(C,x)+1e-6))),dn=DN[R.seg.d];return {k:R.seg.c,r:C.rects[dn][f],f,dn,tip:C.tips[dn][f]};}
    /* the end timer has not run yet (paused game / late frame): hold the last frame */
    const f=C.n-1,dn=DN[R.seg.d];return {k:R.seg.c,r:C.rects[dn][f],f,dn,tip:C.tips[dn][f]};}
  if(P.dead||(window.DAG8&&window.DAG8.play))return null;
  const sp=Math.hypot(P.vx||0,P.vy||0);
  if((P.hurtT||0)>0||sp>25||P.dash)return null;      /* walk / run / hurt: the v7 dagger module (no weapon loco) */
  const d=fa!=null&&isFinite(fa)?dirOf(fa):dirOf(P.face||0),dn=DN[d],C=CL().stance,f=Math.floor(now*12)%C.n;
  return {k:'stance',r:C.rects[dn][f],f,dn,tip:C.tips[dn][f]};}
{const o=drawPlayerSprite;drawPlayerSprite=function(x,y,bob,fa){
  try{if(R.on&&dagNow()&&R.ready===NIM){
    if(R.seg&&(Math.hypot(P.vx||0,P.vy||0)>60||P.dash)&&clk()>R.seg.t0+R.seg.T*0.45&&!R.queued){R.seg=null;R.lastEnd=clk();}   /* running away after the slash: cancel the recovery */
    const c=cell(fa);
    if(c&&c.r){const yy=y+FY,r=c.r;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(IMG(c.k),r[0],r[1],r[2],r[3],x+(r[4]-AX)*K,yy+(r[5]-AY)*K,r[2]*K,r[3]*K);ctx.restore();
      H.anchor={x,y:yy};H.dir=DN.indexOf(c.dn);H.clip='dag_atk19_'+c.k;R.clip=c.k;R.frame=c.f;R.tips=c.tip||null;R.draws++;return;}}}
  catch(e){R.err='draw '+e.message;}
  return o.apply(this,arguments);};}
const css='position:fixed;left:14px;z-index:57;min-width:44px;min-height:40px;padding:4px 10px;border-radius:12px;border:1px solid rgba(255,190,120,.7);background:rgba(40,22,8,.88);color:#ffe2c0;font:700 13px sans-serif;';
const mkBtn=(id,top,fn)=>{const b=document.createElement('button');b.type='button';b.id=id;b.style.cssText=css+'top:calc('+top+'px + env(safe-area-inset-top,0px))';
  for(const ev of ['pointerdown','pointerup','mousedown','touchstart'])b.addEventListener(ev,e=>e.stopPropagation());
  b.addEventListener('click',e=>{e.stopPropagation();fn();});document.body.appendChild(b);return b;};
let b1=null,b2=null,b3=null,b4=null,b5=null;setInterval(()=>{try{const vis=typeof G!=='undefined'&&G.state==='play'&&dagNow();
  if(!b1){b1=mkBtn('atk19Btn',484,()=>{R.on=!R.on;R.seg=null;R.queued=null;setCoef();});
    if(D.big)b2=mkBtn('atk19SizeBtn',532,()=>{R.big=!R.big;});
    b3=mkBtn('atk19PerBtn',580,()=>{R.per=R.per<0.35?0.40:(R.per<0.45?0.50:0.30);R.seg=null;R.queued=null;});
    b4=mkBtn('atk19WaveBtn',628,()=>{R.wave=!R.wave;WL.length=0;});b5=mkBtn('atk19RangeBtn',676,()=>{R.rangeF=R.rangeF<1.2?1.35:(R.rangeF<1.45?1.5:1.0);});}
  b1.style.display=vis?'':'none';if(b2)b2.style.display=vis&&R.on?'':'none';b3.style.display=vis&&R.on?'':'none';b4.style.display=vis&&R.on?'':'none';b5.style.display=vis&&R.on?'':'none';
  const t1='คอมโบ ATK19 r7k: '+(R.on?'เปิด (ท่า '+((R.k%NSEG())+1)+'/'+NSEG()+')':'ปิด (ท่ามีด v7)');if(b1.textContent!==t1)b1.textContent=t1;const t4='คลื่นดาบ: '+(R.wave?'เปิด':'ปิด (เส้นเดิม)');if(b4.textContent!==t4)b4.textContent=t4;const t5='ระยะฟัน x'+R.rangeF.toFixed(2)+' = '+reachOf(0).toFixed(0)+'/'+reachOf(3).toFixed(0)+' px (กดสลับ 1.0/1.35/1.5)';if(b5.textContent!==t5)b5.textContent=t5;
  if(b2){const t=R.big?'ขนาดมีด: 53 ซม. (ใหญ่ ทดสอบให้เห็นชัด)':'ขนาดมีด: 38 ซม. (ตามแบบ DeaRz)';if(b2.textContent!==t)b2.textContent=t;}
  const t3='จังหวะมีด: '+R.per.toFixed(2)+' วิ/ครั้ง ≈ '+period().toFixed(2)+' วิ (กดสลับ 0.30/0.40/0.50)';if(b3.textContent!==t3)b3.textContent=t3;}catch(_){}},400);
})();
