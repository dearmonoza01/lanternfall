
/* ---- candidate_balance_v1_r40: p274 r2 Map 2 roster = Slime, Leaf Bunny, Walking Seedling at every live site (DeaRz 19 Oct 18:27 + BALANCE_map2_population_v1; replaces p274 r1 of r39; TEST only) ---- */
/* p274 r2 — Map 2 (cartroad_plains) = Slime, Leaf Bunny, Walking Seedling only, with every live spawn site kept filled
   (DeaRz 19 Oct 18:27 order + balance/approved/BALANCE_map2_population_v1.md). Replaces p274 r1 (r39: other species removed, 20 mobs, Lv1-5).
   - The spec lists the 14 r5 sites; the live game has those sites split into single-mob points (p206) plus lowland_* and m2lv79_* (p215, east hamlet).
     So every live site keeps its position, band and respawn; only the species changes:
       r5 site points (<base>_<i>) take the spec's species list for <base>, spread evenly; lowland_* keep their species (already slime/leafbun/seedling);
       m2lv79_* (Lv7-9, east) take the spec's farmyard mix.
   - The 3 species' level caps are widened to Lv1-10 so a site's band is used (r39 clamped them to Lv1-5).
   - Sites with band >= 7 are aggressive (no "only fight back"), detect = species aggro 0.7 (balance per-site override).
   - Banner / gate text "Lv 3-10" -> "Lv 1-10" (lowest live band is lowland 1-3).
   ?m2mobs=all = old roster. TEST only. */
(function(){'use strict';
  if(/[?&]m2mobs=all\b/.test(location.search))return;
  const KEEP=new Set(['slime','leafbun','seedling']),LV=[1,10],AGG_BAND=7,AGG=0.7;
  const X=(o)=>{const a=[];for(const [t,n] of o)for(let i=0;i<n;i++)a.push(t);return a;};
  const SPEC={meadow_pups_a:X([['slime',3]]),meadow_pups_b:X([['slime',2],['leafbun',1]]),west_slimes:X([['slime',2],['leafbun',2]]),
    ridge_slimes:X([['seedling',2],['leafbun',1]]),wolves_west:X([['leafbun',3]]),nw_woods:X([['seedling',2],['slime',2]]),
    inn_goblins:X([['slime',2],['seedling',2],['leafbun',2]]),cottage_clearing:X([['seedling',3],['leafbun',2],['slime',1]]),
    marsh_edge:X([['slime',3],['seedling',3]]),farmyard:X([['slime',3],['seedling',3],['leafbun',2]]),ne_hollow:X([['seedling',4],['leafbun',3]]),
    wolves_east:X([['leafbun',3]]),ridge_hollow:X([['seedling',2],['slime',2]]),quarry_ruins:X([['seedling',3],['slime',3]]),
    m2lv79:X([['slime',3],['seedling',3],['leafbun',2]])};
  const BANNER='Lv 1–10';
  const ST={changed:{},kept:{},sites:0,aggSites:[],aggApplied:0,err:null};window.M2ROSTER={keep:[...KEEP],spec:SPEC,stats:ST};
  try{const PD=window.__W22_DATA&&window.__W22_DATA.population;if(!PD)throw new Error('no population');
    const base=id=>id.replace(/_\d+$/,''),byBase={};
    for(const g of PD.groups)(byBase[base(g.id)]=byBase[base(g.id)]||[]).push(g);
    for(const b in byBase){const gs=byBase[b],L=SPEC[b];
      gs.forEach((g,i)=>{const n=g.core!=null?g.core:g.m.length;const m=[];
        for(let j=0;j<g.m.length;j++){const t=g.m[j];
          if(L){const k=Math.floor((i*n+j)*L.length/(gs.length*n))%L.length;m.push(L[k]);}
          else m.push(KEEP.has(t)?t:'slime');}
        for(let j=0;j<g.m.length;j++){if(m[j]!==g.m[j])ST.changed[g.m[j]+'>'+m[j]]=(ST.changed[g.m[j]+'>'+m[j]]||0)+1;else ST.kept[m[j]]=(ST.kept[m[j]]||0)+1;}
        g.m=m;if(g.band&&g.band[0]>=AGG_BAND){g.p274agg=1;ST.aggSites.push(g.id);}ST.sites++;});}
    for(const s of PD.species)if(KEEP.has(s.id))s.lv=LV.slice();
    if(window.W22){W22.pop=null;if(W22.species)for(const k of KEEP)if(W22.species[k])W22.species[k].lv=LV.slice();}
    // per-site aggressive override: applied to each Map 2 mob once, right after it appears
    const agg=new Set(ST.aggSites);
    const ou=update;update=function(){try{if(G.zone==='cartroad_plains')for(const e of enemies){if(e.p274||!e.w22m)continue;e.p274=1;
      if(agg.has(e.gid)){e.retal=false;e.w22am=AGG*((PD.aggro||{}).scale||1);ST.aggApplied++;}}}catch(_){}
      return ou.apply(this,arguments);};
  }catch(e){ST.err='pop '+e.message;console.warn('[p274]',e);}
  // banner + gate text
  try{const Z=ZONES.cartroad_plains;if(Z&&Z.sub)Z.sub=Z.sub.replace(/Lv 3–10/g,BANNER);if(Z&&Array.isArray(Z.range))Z.range=[1,10];
    const og=gatesFor;gatesFor=function(){const out=og.apply(this,arguments);try{for(const g of out)if(g&&g.sub&&g.sub.indexOf('Lv 3–10')>=0)g.sub=g.sub.replace(/Lv 3–10/g,BANNER);}catch(_){}return out;};
  }catch(e){ST.err=(ST.err||'')+' banner '+e.message;}
})();

