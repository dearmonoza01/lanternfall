
/* p218 — grass r3 (user 10 Oct 2026 20:15 screenshot "grass stacked" + 20:19 brief). Replaces p217 r1 (which drew a band of the WHOLE clump a
   second time over the hero, at half strength at the top — that double draw is what looked like stacked / glassy grass). p216 removed in r3.
   Causes found in the running game (headless audit, not a real device):
   - no clump is created twice at the same spot and re-entering a map does not add clumps (counts identical after leave / re-enter);
   - but p157 converts every old decor piece (bush, flowering bush, fern, flower patch, grass) into the same 5 Chibi grass clumps, and the old
     generator had planted bush + flower + fern clusters a few px apart -> identical clumps piled on each other (Map 1: 37 pairs < 8 px apart,
     415 pairs whose boxes overlap > 35 %, 30 of them between big clumps; Map 2: 72 / 8);
   - the tall-prop see-through rule (d.h*s > 120) never hits these clumps (largest = 119.4), so no clump-wide alpha came from it.
   1) SPACING (grass only, after p157 converted the map and after the gate tufts): clumps are kept biggest first; each clump's footprint is an
      ellipse from its VISIBLE art size (opaque width of the art x scale, visible height): pair spacing rx = .45 (W1+W2), ry = .30 (H1+H2). A clump whose footprint overlaps an already
      kept one is pushed away along the centre line until the ellipses only touch (+6 % gap), at most .6 W and only onto free ground; if that
      is impossible it is not placed (it was a pile-up of the same clump). Deterministic, same result on every entry. Other props never move; Map 3 (hand-placed layout) is left as is.
   2) (r3, user 21:22) the front / back split of r2 is removed: the whole clump covers the hero by the root rule of p219 (no masks, no layers).
   3) grass clumps are marked nofade so the tall-prop see-through can never turn a whole clump into glass.
   Walk-through as before (no collision), no sharpening, no global opacity change. Debug window.__P218. */
(function(){'use strict';const ST={ver:'p218-r3',spacing:{},err:null};window.__P218=ST;
const VIS={svChCG1:.86,svChCG2:.88,svChCG3:.87,svChCG4:.86,svChCG5:.86};   // opaque width / art width (measured from the p157 art)
const isCG=t=>typeof t==='string'&&Object.prototype.hasOwnProperty.call(VIS,t);
if(typeof drawPlayer!=='function'||typeof drawProp!=='function'||typeof ctx==='undefined'||typeof loadPropsFor!=='function'){ST.err='hooks missing';return;}
try{for(const t in VIS)if(PROP_DEFS[t])PROP_DEFS[t].nofade=1;}catch(_){}
/* ---------- 1) spacing ---------- */
const visW=q=>{const d=PROP_DEFS[q.t];return d?d.w*(q.s||1)*VIS[q.t]:0;};
const visH=q=>{const d=PROP_DEFS[q.t];return d?d.h*(q.s||1)*.92/.866:0;};   // visible height in world units (leaves reach this far north of the root)
let SOL=[];function solidsOf(list){SOL=[];for(const q of list){const d=q&&PROP_DEFS[q.t];if(!d||!d.solid||!d.solid.length)continue;const s=q.s||1;for(const o of d.solid)SOL.push([q.x+o.dx*s*(q.f<0?-1:1),q.y+o.dy*s,o.r*s]);}}
function freeAt(x,y){for(const [sx,sy,r] of SOL)if(Math.abs(sx-x)<r+8&&Math.abs(sy-y)<r+8&&Math.hypot(sx-x,sy-y)<r+4)return false;return true;}   // never onto a solid (built from the same list, not the stale grid)
const KEEP_ZONES=new Set(['astoria_capital']);   // Map 3 layout is hand-placed and approved: never moved here
function space(list,zid){if(KEEP_ZONES.has(zid))return list;solidsOf(list);const g=list.filter(q=>q&&isCG(q.t)&&PROP_DEFS[q.t]);if(g.length<2)return list;
  g.sort((a,b)=>visW(b)-visW(a)||a.x-b.x||a.y-b.y);const kept=[],drop=new Set();let moved=0;
  const hit=(x,y,w,k,q)=>{const W2=visW(k),rx=.45*(w+W2),ry=.30*(visH(q)+visH(k)),dx=(x-k.x)/rx,dy=(y-k.y)/ry;return dx*dx+dy*dy<1.06*1.06;};
  for(const q of g){const w=visW(q);let bad=kept.find(k=>Math.abs(k.x-q.x)<300&&Math.abs(k.y-q.y)<200&&hit(q.x,q.y,w,k,q));
    if(!bad){kept.push(q);continue;}
    let ok=false;for(let tries=0;tries<3&&!ok;tries++){const W2=visW(bad),rx=.45*(w+W2),ry=.30*(visH(q)+visH(bad));let vx=q.x-bad.x,vy=q.y-bad.y;if(Math.hypot(vx,vy)<.5){vx=1;vy=0;}
      const n=Math.hypot(vx/rx,vy/ry),f=1.07/n,nx=bad.x+vx*f,ny=bad.y+vy*f;   // point on the touching ellipse along the centre line
      if(Math.hypot(nx-q.__ox0,ny-q.__oy0)>.6*w||!freeAt(nx,ny)){break;}
      q.x=Math.round(nx);q.y=Math.round(ny);bad=kept.find(k=>Math.abs(k.x-q.x)<300&&Math.abs(k.y-q.y)<300&&hit(q.x,q.y,w,k,q));if(!bad)ok=true;}
    if(ok){kept.push(q);moved++;}else drop.add(q);}
  ST.spacing[zid||'?']={clumps:g.length,moved,dropped:drop.size};(ST.passes=ST.passes||[]).push({zone:zid||'?',in:g.length,moved,dropped:drop.size});
  return drop.size?list.filter(q=>!drop.has(q)):list;}
function mark(list){for(const q of list)if(q&&isCG(q.t)&&q.__ox0===undefined){q.__ox0=q.x;q.__oy0=q.y;}}
const oL=loadPropsFor;
loadPropsFor=function(zid){let out=oL.apply(this,arguments);try{if(Array.isArray(out)){mark(out);const r=space(out,zid);if(r!==out){out.length=0;for(const q of r)out.push(q);}out.sort((a,b)=>a.y-b.y);}}catch(e){ST.err='space '+e.message;}return out;};
if(typeof w22PlaceSigns==='function'){const oP=w22PlaceSigns;w22PlaceSigns=function(){const r=oP.apply(this,arguments);
  try{mark(PROPS);const n=PROPS.length,s=space(PROPS,(typeof G!=='undefined'&&G.zone)||'?')||PROPS;if(s.length!==n){PROPS.length=0;for(const q of s)PROPS.push(q);}PROPS.sort((a,b)=>a.y-b.y);}catch(e){ST.err='space2 '+e.message;}return r;};}
})();
