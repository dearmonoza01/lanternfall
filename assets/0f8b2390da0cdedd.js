
/* ---- racelines-r1 (TEST, 11 Nov 2026): race-conditional lines for Ch1-2 (race_lines_ch1_ch2_v1.json, Story, approved) as a PATCH LAYER ----
   Applied at load time, in memory, on top of quests_v3_1_ch1 (__QDATA), quests_v4_1_ch2 (__QDATA2 / __QDATA2_CH2) etc.; the source data files stay unchanged. Lines carry "if" (race=..., !done:...), evaluated by the quest engine's condOk (patched for race=a|b|c in this build).
   Modes: insert_first = before the first line of the block; insert_after = right after the line containing the anchor text (anchor missing: logged and skipped, except pro_02 which goes at the end of Lysel's talk as Story's note says);
   greet_first (Mali, monk Suri) = shown once per character the first time the hero talks to that NPC (flag stored per character slot), before the NPC's own talk.
   A block / quest that is not found is logged in RACELINES.log and skipped (no crash). Flag ?racelines=off disables. Debug: window.RACELINES (applied / skipped / table). ---- */
(function(){'use strict';
const Q=String(location.search),OFF=/[?&]racelines=off\b/.test(Q);
const RL=window.RACELINES={ver:'racelines-r1',on:!OFF,err:null,applied:[],skipped:[],log:[],greet:{}};
if(OFF)return;
const D=window.__RACELINES_DATA;if(!D||!D.entries){RL.err='no data';return}
const ERR=(w,e)=>{RL.err=w+': '+((e&&e.message)||e);try{console.error('[RACELINES]',w,e)}catch(_){}};
const SRC=()=>[window.__QDATA,window.__QDATA2,window.__QDATA2_CH2].filter(Boolean);
function findQuest(id){for(const S of SRC())for(const q of (S.quests||[]))if(q.id===id||q.id.indexOf(id+'_')===0)return q;return null}
function lineObj(l,who){const o={who:l.who||who,say:l.say};if(l.if)o.if=l.if;return o}
function targetArr(q,block){if(/^Lysel talk/.test(block)&&q.dialogue&&Array.isArray(q.dialogue.talk))return q.dialogue.talk;let m=/objectives\[talk (\w+)\]\.say/.exec(block);if(m){const ob=(q.objectives||[]).find(o=>o.kind==='talk'&&o.npc===m[1]);return ob&&ob.say||null}
  if(/dialogue\.before/.test(block))return q.dialogue&&q.dialogue.before||null;
  m=/first talk with (\w+)/.exec(block);if(m){const ob=(q.objectives||[]).find(o=>o.kind==='talk'&&o.npc===m[1]);return ob&&ob.say||null}
  return null}
function findLysel(q){const cand=[];const add=(arr,p)=>{if(Array.isArray(arr))for(const l of arr)if(l&&typeof l==='object'&&/ไลเซล/.test(l.who||''))cand.push({arr,p})};
  add(q.dialogue&&q.dialogue.after,'dialogue.after');add(q.dialogue&&q.dialogue.before,'dialogue.before');for(const ob of (q.objectives||[]))add(ob.say,'objectives.say');return cand.length?cand[cand.length-1]:null}
function apply(){for(const e of D.entries){if(e.mode==='greet_first'){RL.greet[e.npc]=e;RL.applied.push({id:e.npc,mode:e.mode,n:e.lines.length});continue}
    try{const q=findQuest(e.quest);if(!q){RL.skipped.push({id:e.quest,why:'quest not found'});RL.log.push('skip '+e.quest+': quest not found');continue}if(q._rlDone){continue}
      const add=e.lines.map(l=>lineObj(l,e.who));let arr=targetArr(q,e.block||'');
      if(!arr){RL.skipped.push({id:e.quest,why:'block not found: '+e.block});RL.log.push('skip '+e.quest+': block not found ('+e.block+')');continue}
      let at;if(e.mode==='insert_first')at=0;else{const i=arr.findIndex(l=>String(typeof l==='string'?l:(l&&l.say)||'').indexOf(e.anchor||'\u0000')>=0);
        if(i>=0)at=i+1;else{RL.skipped.push({id:e.quest,why:'anchor not found: '+e.anchor});RL.log.push('skip '+e.quest+': anchor "'+e.anchor+'" not found');continue}}
      if(arr.length&&typeof arr[0]==='string'){/* plain-string talk (Lysel pro_05, rendered by lines(giver,talk) as Lysel's talk box): dynamic getter, race lines as strings, evaluated when the talk opens */
        const base=arr.slice(),parent=q.dialogue,key='talk';at=Math.min(at,base.length);
        Object.defineProperty(parent,key,{configurable:true,enumerable:true,get(){const ins=add.filter(l=>!l.if||(window.RACE?RACE.cond(l.if,{},()=>false):true)).map(l=>l.say);return base.slice(0,at).concat(ins,base.slice(at))}});RL.dyn=RL.dyn||[];RL.dyn.push(q.id+'.dialogue.'+key)}
      else arr.splice(at,0,...add);q._rlDone=1;RL.applied.push({id:e.quest,mode:e.mode,at,n:add.length,block:e.block})}catch(er){RL.skipped.push({id:e.quest||e.npc,why:'error '+er.message});ERR('apply '+(e.quest||e.npc),er)}}}
/* run once the quest data exists (modules load in this order); retry for a few seconds */
let tries=0;const iv=setInterval(()=>{try{if(SRC().length>=2||tries>40){clearInterval(iv);apply()}tries++}catch(e){ERR('apply',e)}},250);
/* ---- greet_first: Mali (npc_mali) and monk Suri: once per character, before the NPC's own talk ---- */
const GK='lanternfall_racegreet_v1';
const charKey=()=>{try{if(typeof CH!=='undefined'&&CH&&CH.cur>=0&&CH.list&&CH.list[CH.cur])return CH.cur+':'+(CH.list[CH.cur].name||'')}catch(_){}return 'solo'};
const gread=()=>{try{return JSON.parse(localStorage.getItem(GK)||'{}')||{}}catch(_){return {}}};
RL.valid=(e)=>e.lines.filter(l=>!l.if||(window.RACE?RACE.cond(l.if,{},id=>{try{const C=window.CH1Q;return !!(C&&C.isDone&&C.isDone(id))}catch(_){return false}}):true));
function greet(npcId,who){const e=RL.greet[npcId];if(!e)return false;const all=gread(),k=charKey()+'|'+npcId;if(all[k])return false;all[k]=1;try{localStorage.setItem(GK,JSON.stringify(all))}catch(_){}
  const ls=RL.valid(e);for(const l of ls){try{log('['+(l.who||e.who||who)+'] '+l.say,'v')}catch(_){}}RL.last={npc:npcId,lines:ls.map(l=>l.say)};return true}
RL.greetNow=greet;
try{const _i=interact;interact=function(){try{const it=G.interact;if(it&&it.k==='npc'&&it.n&&G.state==='play'){if(it.n.c1n==='npc_mali'||it.n.kind==='mali')greet('npc_mali','มะลิ');else if(it.n.kind==='monk')greet('npc_monk_suri','หลวงตาสุริ')}}catch(e){ERR('greet',e)}return _i.apply(this,arguments)}}catch(e){ERR('hook interact',e)}
console.info('[RACELINES] patch layer ready');
})();
