
/* ---- candidate_map4_trio_r2: p257 Moss Turtle, Stone Boar, Gale Feather in the Animation & Combat Studio (TEST, Studio only) ---- */
/* p257 r2 — (r2: Gale blade drawn without the engine projectile glow / trail / hit ring; art cut unchanged)
   p257 r1 — the three existing Map 4 monsters (art approved by DeaRz 17 Oct 2026 "ผ่านหมดส่งได้เลย", all poses; spec
   art/monsters/map4-trio-handoff.md). STUDIO ONLY: every sprite record has scope:'studio', so the art draws only inside the Animation &
   Combat Studio scene. No spawn point, no Map 4 placement, no stat / AI / drop / save change. Map 4 and the 3→4 gate are untouched.
   - Art: the source sheets (SHA256-checked against each manifest; disabled rows never read; override sheets replace whole directions)
     re-cut into one WebP sheet per pose, rows S,SW,W,NW,N,NE,E,SE (never mirrored), every frame placed on its foot point.
   - Size: one uniform scale per monster (per source sheet, matched on the standing body, never per frame):
     Moss Turtle shell width ~70 units, Stone Boar W/E body length ~80, Gale Feather crest height ~55 (hero 78).
   - Game types: the art draws over the existing Map 2 species of the same monster ('mossback' Mossback Tortoise, 'stoneboar',
     'galefeather'); their stats, AI and spawns are left exactly as they are, and outside the Studio they keep the engine shape.
   - Attack (all three): frames 1-3 stretched over the engine wind-up, frame 4 = the engine's damage moment (Gale: the wind blade leaves),
     5-6 follow-through, 7-8 recover; side locked for the whole attack (shared p182 renderer rules).
   - Gale Feather ranged attack (Studio only): the game already has ranged monsters (enemyShoot → an orb that hurts the player when it
     reaches them). For this type in the Studio the shot is held for the 3 wind-up frames (0.36 s) so the blade leaves on frame 4, then the
     engine's own projectile flies (same speed, damage and hit test) and is drawn with the approved wind FX rotated to its flight direction:
     FX frames 1-2 form, 3-4 fly, 5-6 fade where it hits or expires. Damage is on arrival, as before.
   - Hurt only on direct hits (no DoT); death plays once, holds frame 6, then fades (shared p182 rules).
   - Name + HP bar lifted per type (labelLift) so the bar clears the top of the standing art by 8 units.
   - The p182 renderer builds its sprite list once at load, so this module re-runs that renderer's own source for these three types only
     (no second set of engine hooks) and adds them to MON_SPRITES. */
(function(){
'use strict';
const ART=/* art data (5 WebP sheets per monster + Gale wind strip) is in the patch */ {"turtle":{"sheets":[{"src":"assets/1790f0e021778070.webp","cell":[173,126],"anchor":[88,119]},{"src":"assets/78d2d19caf996340.webp","cell":[173,126],"anchor":[88,119]},{"src":"assets/243ec2a6fcd02e72.webp","cell":[173,126],"anchor":[88,119]},{"src":"assets/62c08bc89e9db886.webp","cell":[173,126],"anchor":[88,119]},{"src":"assets/26a73e04542030bd.webp","cell":[173,126],"anchor":[88,119]}],"files":[{"name":"moss_turtle_idle_A.png","sha256":"b94ede3a401c5548d6ab2a097582b415cc50db38544304925b4e07653bdc917a"},{"name":"moss_turtle_idle_B.png","sha256":"31f940cc51061128abd2cde41fafe43eb31695ced2243740c81ae33f294d0ccc"},{"name":"moss_turtle_move_A.png","sha256":"1b22f0ea667562d6bb6ab815cbd1e485788e07452c1314d5402de8465121ba5b"},{"name":"moss_turtle_move_B.png","sha256":"dd574118b5aede6bed8009b0df18af475fc59e4a2e16cbc03e0ebdb92ad8a42d"},{"name":"moss_turtle_attack_A.png","sha256":"54ef8f725969d25c99bcd54a8440822943066d0c2825503b397a683389d95db0"},{"name":"moss_turtle_attack_B.png","sha256":"253f4ff72670f3928b49c155670b9ddfb5421fc20aaa33bc7df43388e3bf27df"},{"name":"moss_turtle_hurt_A.png","sha256":"ea45f790288061cc8f1d56d59d3f7ed5792dc00a3367b8956d5d1ff7573e8955"},{"name":"moss_turtle_hurt_B.png","sha256":"6501b8e6cffaca98259b7a79bbaad3b7e13715f7c36f66ffd2d56fcaf12aa1fb"},{"name":"moss_turtle_death_A.png","sha256":"359cbe7f38267feeab4e2a81dd77053ea8da37915cb2efc25cf0ea7b68137816"},{"name":"moss_turtle_death_B.png","sha256":"eff68d6e344977db14f1d4b3b9dd5ac6fa9e62675e9df8abb2403f088d90f3ab"},{"name":"moss_turtle_death_S_override.png","sha256":"330d2ef8c844e1695dc15c37b0147da43526ff1bfad073e92845f2896a015887"}],"factors":{"moss_turtle_idle_A.png":1.0,"moss_turtle_idle_B.png":0.8347,"moss_turtle_move_A.png":1.0362,"moss_turtle_move_B.png":1.0072,"moss_turtle_attack_A.png":1.0806,"moss_turtle_attack_B.png":1.1527,"moss_turtle_hurt_A.png":0.6217,"moss_turtle_hurt_B.png":0.6264,"moss_turtle_death_A.png":0.9007,"moss_turtle_death_B.png":0.8597,"moss_turtle_death_S_override.png":0.444},"K":0.56,"cell":[173,126],"anchor":[88,119],"srcrow":{"idle_S":["moss_turtle_idle_A.png",1],"idle_SW":["moss_turtle_idle_A.png",2],"idle_W":["moss_turtle_idle_A.png",3],"idle_NW":["moss_turtle_idle_A.png",4],"idle_N":["moss_turtle_idle_B.png",1],"idle_NE":["moss_turtle_idle_B.png",2],"idle_E":["moss_turtle_idle_B.png",3],"idle_SE":["moss_turtle_idle_B.png",4],"move_S":["moss_turtle_move_A.png",1],"move_SW":["moss_turtle_move_A.png",2],"move_W":["moss_turtle_move_A.png",3],"move_NW":["moss_turtle_move_A.png",4],"move_N":["moss_turtle_move_B.png",1],"move_NE":["moss_turtle_move_B.png",2],"move_E":["moss_turtle_move_B.png",3],"move_SE":["moss_turtle_move_B.png",4],"attack_S":["moss_turtle_attack_A.png",1],"attack_SW":["moss_turtle_attack_A.png",2],"attack_W":["moss_turtle_attack_A.png",3],"attack_NW":["moss_turtle_attack_A.png",4],"attack_N":["moss_turtle_attack_B.png",1],"attack_NE":["moss_turtle_attack_B.png",2],"attack_E":["moss_turtle_attack_B.png",3],"attack_SE":["moss_turtle_attack_B.png",4],"hurt_S":["moss_turtle_hurt_A.png",1],"hurt_SW":["moss_turtle_hurt_A.png",2],"hurt_W":["moss_turtle_hurt_A.png",3],"hurt_NW":["moss_turtle_hurt_A.png",4],"hurt_N":["moss_turtle_hurt_B.png",1],"hurt_NE":["moss_turtle_hurt_B.png",2],"hurt_E":["moss_turtle_hurt_B.png",3],"hurt_SE":["moss_turtle_hurt_B.png",4],"death_SW":["moss_turtle_death_A.png",2],"death_W":["moss_turtle_death_A.png",3],"death_NW":["moss_turtle_death_A.png",4],"death_N":["moss_turtle_death_B.png",1],"death_NE":["moss_turtle_death_B.png",2],"death_E":["moss_turtle_death_B.png",3],"death_SE":["moss_turtle_death_B.png",4],"death_S":["moss_turtle_death_S_override.png","override"]},"idleTop":9,"refPx":112.0,"units":70,"type":"mossback","grounded":{"S":[1,2,3,5],"SW":[0,1,2,7],"W":[1,2,3,5],"NW":[2,4,6,7],"N":[0,1,3,4],"NE":[1,3,4,5],"E":[0,4,5,6],"SE":[0,2,4,7]}},"boar":{"sheets":[{"src":"assets/7328d84136ed52fa.webp","cell":[253,141],"anchor":[126,133]},{"src":"assets/7a1d05604a688ee1.webp","cell":[253,141],"anchor":[126,133]},{"src":"assets/ed294c49303ce8c9.webp","cell":[253,141],"anchor":[126,133]},{"src":"assets/3ebe350d61c4bfc5.webp","cell":[253,141],"anchor":[126,133]},{"src":"assets/bdb3863e1ecb8a93.webp","cell":[253,141],"anchor":[126,133]}],"files":[{"name":"stone_boar_idle_A.png","sha256":"81fcfe86de6c5675cd012f5923dcb59732598da9c41bbaf00de823f94e116840"},{"name":"stone_boar_idle_B.png","sha256":"eff0b779fffe4258ab60cb12f1541dc2679bb4b8e9c2096ae3a5b7fc4b749b8b"},{"name":"stone_boar_move_A.png","sha256":"31dab9097897a98a3b2a13729c001c0e9ee5a51655ea45d1b56d60f356872e05"},{"name":"stone_boar_move_B.png","sha256":"72302eeee8e6f164328bb81ddfa0b22f8707492b51b3c22e7287723d952bd13f"},{"name":"stone_boar_attack_A.png","sha256":"e9724b5f94cb628863424a8723cc08f76edee4e224ae59a1d8759d454555c52d"},{"name":"stone_boar_attack_B.png","sha256":"1f25f90dde274a1a767bc345519ee78e11352946cd2b15457c3cdf13f19783c0"},{"name":"stone_boar_hurt_A.png","sha256":"1d086bd597a050e0c7d4e5335b437cde10aa81e3a6448dfb5da1fca64677b551"},{"name":"stone_boar_hurt_B.png","sha256":"f15b09dd9e1749840509678f14ec11eaca65206ce05837e48e87f2024ff630a8"},{"name":"stone_boar_death_A.png","sha256":"7687578230f825efe8df247d174cc6b06ec27018388d2fbbede3273ff7d1ac6b"},{"name":"stone_boar_death_B.png","sha256":"0d586f3c559367629be4dbe439e5d143e9b589546e5214817b3dd8c9bafb8e92"},{"name":"stone_boar_death_S_override.png","sha256":"33afca5fadb7ba09cd31dbb3590a2783c7f7ff92eeb5a416740b059471ad707d"},{"name":"stone_boar_attack_W_override.png","sha256":"57c26f9d1adad80ce6445ad0f698652b8c208bf1f96cc300a692ebff4fd575a7"},{"name":"stone_boar_death_E_override.png","sha256":"a6ee3493a0dbc5b9970c2495d90ebc6f0539d1a896282e5cab8d578283a9b4fd"}],"factors":{"stone_boar_idle_A.png":1.0,"stone_boar_idle_B.png":0.988,"stone_boar_move_A.png":1.1751,"stone_boar_move_B.png":1.0967,"stone_boar_attack_A.png":1.1874,"stone_boar_attack_B.png":1.1577,"stone_boar_hurt_A.png":0.8049,"stone_boar_hurt_B.png":0.8233,"stone_boar_death_A.png":0.9735,"stone_boar_death_B.png":0.9674,"stone_boar_death_S_override.png":0.4457,"stone_boar_attack_W_override.png":0.9537,"stone_boar_death_E_override.png":0.7037},"K":0.540084388185654,"cell":[253,141],"anchor":[126,133],"srcrow":{"idle_S":["stone_boar_idle_A.png",1],"idle_SW":["stone_boar_idle_A.png",2],"idle_W":["stone_boar_idle_A.png",3],"idle_NW":["stone_boar_idle_A.png",4],"idle_N":["stone_boar_idle_B.png",1],"idle_NE":["stone_boar_idle_B.png",2],"idle_E":["stone_boar_idle_B.png",3],"idle_SE":["stone_boar_idle_B.png",4],"move_S":["stone_boar_move_A.png",1],"move_SW":["stone_boar_move_A.png",2],"move_W":["stone_boar_move_A.png",3],"move_NW":["stone_boar_move_A.png",4],"move_N":["stone_boar_move_B.png",1],"move_NE":["stone_boar_move_B.png",2],"move_E":["stone_boar_move_B.png",3],"move_SE":["stone_boar_move_B.png",4],"attack_S":["stone_boar_attack_A.png",1],"attack_SW":["stone_boar_attack_A.png",2],"attack_NW":["stone_boar_attack_A.png",4],"attack_N":["stone_boar_attack_B.png",1],"attack_NE":["stone_boar_attack_B.png",2],"attack_E":["stone_boar_attack_B.png",3],"attack_SE":["stone_boar_attack_B.png",4],"hurt_S":["stone_boar_hurt_A.png",1],"hurt_SW":["stone_boar_hurt_A.png",2],"hurt_W":["stone_boar_hurt_A.png",3],"hurt_NW":["stone_boar_hurt_A.png",4],"hurt_N":["stone_boar_hurt_B.png",1],"hurt_NE":["stone_boar_hurt_B.png",2],"hurt_E":["stone_boar_hurt_B.png",3],"hurt_SE":["stone_boar_hurt_B.png",4],"death_SW":["stone_boar_death_A.png",2],"death_W":["stone_boar_death_A.png",3],"death_NW":["stone_boar_death_A.png",4],"death_N":["stone_boar_death_B.png",1],"death_NE":["stone_boar_death_B.png",2],"death_SE":["stone_boar_death_B.png",4],"death_S":["stone_boar_death_S_override.png","override"],"attack_W":["stone_boar_attack_W_override.png","override"],"death_E":["stone_boar_death_E_override.png","override"]},"idleTop":12,"refPx":128.0,"units":80,"type":"stoneboar","grounded":{"S":[0,3,5,7],"SW":[0,1,2,3],"W":[0,4,5,6],"NW":[0,3,5,7],"N":[0,2,5,7],"NE":[0,1,2,4],"E":[0,1,6,7],"SE":[3,4,5,6]}},"gale":{"sheets":[{"src":"assets/10a5e8a0a453a02f.webp","cell":[151,123],"anchor":[80,116]},{"src":"assets/2a1e6024d452e9c4.webp","cell":[151,123],"anchor":[80,116]},{"src":"assets/bd30339246a7fe21.webp","cell":[151,123],"anchor":[80,116]},{"src":"assets/14abb99bafa0ad43.webp","cell":[151,123],"anchor":[80,116]},{"src":"assets/1d56b6fb34ee3d37.webp","cell":[151,123],"anchor":[80,116]}],"files":[{"name":"gale_idle_A.png","sha256":"00eceef98928b1cdafefaaec6ed64743595c402a70f2e92d82158ea3baf81e5c"},{"name":"gale_idle_B.png","sha256":"4bc866ec5380dcd71a74edb44a768209b99d4d76168af41ad2e1312de8be37b3"},{"name":"gale_move_A.png","sha256":"b056c433a3517d790e6a03b7a5491906929c0ce230a570a2fa4fa98567f14ae7"},{"name":"gale_move_B.png","sha256":"e6287f36e2de0806205e17dd2d2c80e174d844e87648a4236d5dac78085040b5"},{"name":"gale_attack_A.png","sha256":"e08d484711fa0b12afa4e20fee2065c659b5aba72ec111d92738f3e6da4ffc4b"},{"name":"gale_attack_B.png","sha256":"d28e24d8a8ce4a226f9b2e958b530eb88989bed51a53e86b80203081a27ff286"},{"name":"gale_hurt_A.png","sha256":"58984523aa3b7dae3124bab07e9b34816e7855e6c5b6ffff14037f46a117689d"},{"name":"gale_hurt_B.png","sha256":"105293d6acfdac8fb5f5eb91299b88b3e750f1aab33b1d816681ab81a124fd75"},{"name":"gale_death_A.png","sha256":"8d6a34f7f58c1816b23e2e490c69f6437b9e8e8c793934660c94f594d37f2c26"},{"name":"gale_death_B.png","sha256":"92e5e19d5c37defb224b0827bee91eb5a468086fccd6c98795ed6b6d3a746c2d"},{"name":"gale_idle_N_override.png","sha256":"85d46978c0c487a9a35d32307cb2ec8bbe4b5ad22ec1a2f5b2c1bea29257d755"},{"name":"gale_hurt_N_override.png","sha256":"d08dcbefc10676e6e047f46bdfe291536dcef7578669efcf8ce7383ed617d7cd"},{"name":"gale_death_N_override.png","sha256":"d8a1e76963a94b69c88dc5db9dbd5b59f4818db41cda7e12afafbcea6fac4d57"},{"name":"gale_move_N_override.png","sha256":"7a2d0b0ce8f10b08ff3e0bbc8fb4fc17c193e69e73e1d04e994c20f2b1ef0519"},{"name":"gale_attack_S_override.png","sha256":"8bf243d255888ef749ddd2aa6723d5f193289e5af1e2a732a994090c3def83e7"},{"name":"gale_wind_E.png","sha256":"b09b7bbf3a5e9589eeae956e43a55a9eb6b1b200289c40c08861f8b60adf1dd6"}],"factors":{"gale_idle_A.png":1.0,"gale_idle_B.png":1.0099,"gale_idle_N_override.png":0.4653,"gale_move_A.png":1.1212,"gale_move_B.png":1.0579,"gale_attack_A.png":1.2844,"gale_attack_B.png":1.211,"gale_hurt_A.png":0.86,"gale_hurt_B.png":0.8911,"gale_death_A.png":1.0016,"gale_death_B.png":0.9919,"gale_hurt_N_override.png":0.3513,"gale_death_N_override.png":0.5144,"gale_move_N_override.png":0.6173,"gale_attack_S_override.png":0.7128},"K":0.3562753036437247,"cell":[151,123],"anchor":[80,116],"srcrow":{"idle_S":["gale_idle_A.png",1],"idle_SW":["gale_idle_A.png",2],"idle_W":["gale_idle_A.png",3],"idle_NW":["gale_idle_A.png",4],"idle_NE":["gale_idle_B.png",2],"idle_E":["gale_idle_B.png",3],"idle_SE":["gale_idle_B.png",4],"move_S":["gale_move_A.png",1],"move_SW":["gale_move_A.png",2],"move_W":["gale_move_A.png",3],"move_NW":["gale_move_A.png",4],"move_NE":["gale_move_B.png",2],"move_E":["gale_move_B.png",3],"move_SE":["gale_move_B.png",4],"attack_SW":["gale_attack_A.png",2],"attack_W":["gale_attack_A.png",3],"attack_NW":["gale_attack_A.png",4],"attack_N":["gale_attack_B.png",1],"attack_NE":["gale_attack_B.png",2],"attack_E":["gale_attack_B.png",3],"attack_SE":["gale_attack_B.png",4],"hurt_S":["gale_hurt_A.png",1],"hurt_SW":["gale_hurt_A.png",2],"hurt_W":["gale_hurt_A.png",3],"hurt_NW":["gale_hurt_A.png",4],"hurt_NE":["gale_hurt_B.png",2],"hurt_E":["gale_hurt_B.png",3],"hurt_SE":["gale_hurt_B.png",4],"death_S":["gale_death_A.png",1],"death_SW":["gale_death_A.png",2],"death_W":["gale_death_A.png",3],"death_NW":["gale_death_A.png",4],"death_NE":["gale_death_B.png",2],"death_E":["gale_death_B.png",3],"death_SE":["gale_death_B.png",4],"idle_N":["gale_idle_N_override.png","override"],"hurt_N":["gale_hurt_N_override.png","override"],"death_N":["gale_death_N_override.png","override"],"move_N":["gale_move_N_override.png","override"],"attack_S":["gale_attack_S_override.png","override"]},"idleTop":25,"refPx":88.0,"units":55,"type":"galefeather","grounded":{"S":[1,3,4,5],"SW":[2,3,5,7],"W":[1,2,5,6],"NW":[2,3,5,7],"N":[0,1,4,5],"NE":[1,3,5,7],"E":[2,3,4,6],"SE":[0,2,3,7]},"wind":{"src":"assets/89769cf6ab4e2e05.webp","cell":[182,182],"n":6}}};
const DIRS=['S','SW','W','NW','N','NE','E','SE'];
const BAR_GAP=8;
const T={turtle:{type:'mossback',name:'Moss Turtle',sz:26,moveMs:130},
         boar:{type:'stoneboar',name:'Stone Boar',sz:22,moveMs:95},
         gale:{type:'galefeather',name:'Gale Feather',sz:16,moveMs:95}};
const GALE_WIND=.36;                                  // 3 wind-up frames × 120 ms before the blade leaves (Studio only)
function record(key){
  const A=ART[key],M=T[key],AN=A.anchor,refH=A.refPx,hK=A.units/M.sz;   // world size per art px = 1/1.6 at the species' own sz
  const clips={};
  DIRS.forEach((d,r)=>{
    clips['idle_'+d]={s:0,row:r,n:6,ms:[220,200,220,220,200,240],loop:true};
    clips['move_'+d]={s:1,row:r,n:8,ms:new Array(8).fill(M.moveMs),loop:true,grounded:A.grounded[d]};
    clips['atk_windup_'+d]={s:2,row:r,n:3,ms:[120,120,120],c0:0};
    clips['atk_strike_'+d]={s:2,row:r,n:3,ms:[50,50,50],c0:3};
    clips['atk_recover_'+d]={s:2,row:r,n:2,ms:[140,160],c0:6};
    clips['hurt_'+d]={s:3,row:r,n:3,ms:[80,100,120]};
    clips['death_'+d]={s:4,row:r,n:6,ms:[120,120,130,140,160,200]};});
  return {version:'map4-trio-'+key+'-r2',target:M.type,scope:'studio',offKey:M.type,
    status:'TEST MODE — Studio only; art approved by DeaRz 17 Oct 2026, gameplay not approved',
    sheets:A.sheets,sheet:A.sheets[0].src,cell:A.cell,anchor:AN,
    hK,refH,drawK:1,barSh:'elemental',strikeWin:.15,dirs:DIRS,defDir:'S',dirHys:8,
    view:'8 authored views per pose (one sheet per pose, rows S,SW,W,NW,N,NE,E,SE); never mirrored',clips,
    slots:{attack:{status:'installed (test)',sync:'frames 1-3 wind-up stretched over the engine wind-up; frame 4 = damage moment'+(key==='gale'?' (wind blade leaves)':'')+'; 5-6 strike; 7-8 recover; side locked'},
      hurt:{status:'installed (test)'},death:{status:'installed (test)',hold:.6,fade:.5}},
    source:{pack:M.name+' (Chatgpt Monster/'+key+' zips)',files:A.files,factors:A.factors},
    labelLift:e=>{const s=e.sz||M.sz,sc=s*hK/refH,head=s*.35-(AN[1]-A.idleTop)*sc,barBottom=-s*2.4-12+6+2.5;return Math.max(0,barBottom-(head-BAR_GAP));},
    size:M.name+': '+A.units+' world units = '+refH+' art px at sz '+M.sz,missing:['knock-back','fall']};}
const TR={recs:{},ok:false,err:null,R:{},wind:{shots:0,ends:0,held:0,hits:0}};window.__MAP4_TRIO=TR;
try{
  for(const k in T)TR.recs[T[k].type]=record(k);
  window.__MON_SPRITES=window.__MON_SPRITES||{};for(const t in TR.recs)window.__MON_SPRITES[t]=TR.recs[t];
  const REG=window.MON_SPRITES;if(!REG||!REG.byType)throw new Error('p182 renderer missing');
  let src=null;for(const s of document.scripts){const t=s.text;if(t&&t.indexOf('p182 (r3) — data-driven monster sprite renderer')>=0&&t.indexOf('function makeSprite(D)')>=0){src=t;break;}}
  if(!src)throw new Error('p182 source not found');
  const swap=(a,b)=>{const i=src.indexOf(a);if(i<0||src.indexOf(a,i+1)>=0)throw new Error('p182 text changed: '+a.slice(0,40));src=src.slice(0,i)+b+src.slice(i+a.length);};
  swap("const SRC=Object.assign({},window.__MON_SPRITES||{});if(window.__SLIME_CHIBI&&!SRC[window.__SLIME_CHIBI.target])SRC[window.__SLIME_CHIBI.target]=window.__SLIME_CHIBI;","const SRC=Object.assign({},window.__MAP4_TRIO.recs);");
  swap("const REG={byType:{},list:[]};window.MON_SPRITES=REG;","const REG=window.MON_SPRITES;");
  swap("window.SLIME_CHIBI=REG.byType.slime||null;","");
  // name + HP bar lift (same as Ruin Warden r2): everything the engine draws after the body is lifted for these types
  swap("m.sh=bs;SHAPES[bs]=function(e2,x,y,s,t){let ok=false;try{ok=drawBody(e2,x,s);}catch(er){if(R.stats.errors.length<20)R.stats.errors.push(String(er&&er.message||er));}if(!ok){R.stats.fallback++;fb(e2,x,y,s,t);}};",
       "const lift=D.labelLift?D.labelLift(e):0,ftOwn=Object.prototype.hasOwnProperty.call(ctx,'fillText');let rrO=null,ftO=null;"+
       "m.sh=bs;SHAPES[bs]=function(e2,x,y,s,t){let ok=false;try{ok=drawBody(e2,x,s);}catch(er){if(R.stats.errors.length<20)R.stats.errors.push(String(er&&er.message||er));}if(!ok){R.stats.fallback++;fb(e2,x,y,s,t);}"+
       "if(lift>0&&!rrO){rrO=rrect;ftO=ctx.fillText;rrect=function(a,b,c,d,r_){return rrO.call(this,a,b-lift,c,d,r_);};ctx.fillText=function(tx,a,b,mw){return mw===undefined?ftO.call(this,tx,a,b-lift):ftO.call(this,tx,a,b-lift,mw);};R.stats.labelLift=lift;}};");
  swap("try{return v1.apply(self,args);}finally{m.sh=orig;SHAPES[bs]=keep;if(restoreEll)restoreEll();}}",
       "try{return v1.apply(self,args);}finally{m.sh=orig;SHAPES[bs]=keep;if(restoreEll)restoreEll();if(rrO){rrect=rrO;if(ftOwn)ctx.fillText=ftO;else delete ctx.fillText;}}}");
  // Gale cast (render side): e._gw = held wind-up left, e._gwT = its length, e._ga = aim, e._gs = end of the release window
  swap("const atk=e.wind>0||e.strikeT>0||e.lunge>0;","const gw=e._gw>0?e._gw:0,gs=e._gs>time,atk=e.wind>0||gw>0||e.strikeT>0||e.lunge>0||gs;");
  swap("const a=e.atkAng!=null&&e.wind>0?e.atkAng:e.face;","const a=gw>0&&e._ga!=null?e._ga:(e.atkAng!=null&&e.wind>0?e.atkAng:e.face);");
  swap("if(e.wind>0){const nm=pick('atk_windup',d);if(!nm)return null;const C=D.clips[nm],wt=e.windT||.42,k=Math.max(0,Math.min(.9999,1-e.wind/wt))",
       "if(e.wind>0||gw>0){const nm=pick('atk_windup',d);if(!nm)return null;const C=D.clips[nm],wt=gw>0?e._gwT:(e.windT||.42),k=Math.max(0,Math.min(.9999,1-(gw>0?gw:e.wind)/wt))");
  swap("if(e.strikeT>0||e.lunge>0){if(r.strikeT0==null)","if(e.strikeT>0||e.lunge>0||gs){if(r.strikeT0==null)");
  swap("setTimeout(()=>{try{install();}catch(er){console.warn('[p182] install',er);}},0);","");   // the hooks are already installed once by the original
  (0,eval)(src);
  for(const t in TR.recs)TR.R[t]=REG.byType[t];
  TR.ok=Object.keys(TR.recs).every(t=>!!REG.byType[t]);
}catch(er){TR.err=er.message;console.warn('[p257] map4 trio',er);}
/* ---- Gale Feather wind blade (Studio only) ---- */
try{
  const GR=()=>TR.R.galefeather;
  const live=e=>e&&e.type==='galefeather'&&GR()&&GR().cfg.enabled&&GR().ready&&GR().inScope();
  const W=ART.gale.wind,WIM=new Image();let wOk=false;WIM.onload=()=>{wOk=true;};WIM.src=W.src;
  const hK=TR.recs.galefeather.hK,refH=TR.recs.galefeather.refH;
  let releasing=false;
  const _es=enemyShoot;enemyShoot=function(e,ang,spd){
    if(!releasing&&ang==null&&live(e)&&!e.dead){   // hold the engine's shot for the 3 wind-up frames; the projectile itself is unchanged
      if(e._gw>0)return;e._gwT=GALE_WIND;e._gw=GALE_WIND;e._ga=Math.atan2(P.y-e.y,P.x-e.x);e.face=e._ga;TR.wind.held++;return;}
    const n0=projs.length,r=_es.apply(this,arguments);
    if(releasing&&projs.length>n0){const p=projs[projs.length-1];p.m4g={t0:time,sc:e.sz*hK/refH};TR.wind.shots++;}
    return r;};
  const _ue=updEnemies;updEnemies=function(dt){const r=_ue.apply(this,arguments);
    for(const e of enemies){if(!(e._gw>0)||e.type!=='galefeather')continue;
      if(e.dead||!live(e)||(e.st&&(e.st.stun||e.st.silence))){e._gw=0;continue;}
      e._gw-=dt;if(e._gw<=0){e._gw=0;e._gs=time+.15;releasing=true;try{enemyShoot(e);}finally{releasing=false;}}}
    return r;};
  // r2: the Gale blade is moved here with the engine's own enemy-projectile rules (flight, player dome, hit test, damage, map edge) but
  // without the engine's glow particles and hit ring, so only the approved 6-frame wind FX is seen (art rule: no glow).
  const _up=updProjs;updProjs=function(dt){const g=projs.filter(p=>p.m4g);if(g.length)projs=projs.filter(p=>!p.m4g);let r;
    try{r=_up.apply(this,arguments);}finally{if(g.length){const Z=ZONES[G.zone],keep=[];
      for(const p of g){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
        if(P.dome&&d2(P.x,P.y,p.x,p.y)<P.dome.r){p.life=0;emitThemed(p.x,p.y,P.dome.pl,6,140);}
        else if(!P.dead&&d2(P.x,P.y-10,p.x,p.y)<P.r+p.size){hurtPlayer(p.dmg,p.src);p.life=0;TR.wind.hits++;}
        if(p.x<-50||p.y<-50||p.x>Z.w+50||p.y>Z.h+50)p.life=0;
        if(p.life>0)keep.push(p);else{fx.push({k:'m4gale',x:p.x,y:p.y,a:Math.atan2(p.vy,p.vx),sc:p.m4g.sc,t:0,dur:.24});TR.wind.ends++;}}
      for(const p of keep)projs.push(p);}}
    return r;};
  const cw=W.cell[0],ch=W.cell[1];
  function blade(x,y,a,sc,i){ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.translate(x,y);ctx.rotate(a);
    const sm=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=true;ctx.drawImage(WIM,i*cw,0,cw,ch,-cw*sc/2,-ch*sc/2,cw*sc,ch*sc);ctx.imageSmoothingEnabled=sm;ctx.restore();}
  const _dp=drawProj;drawProj=function(p){
    if(p.m4g&&wOk){const age=time-p.m4g.t0,i=age<.08?0:age<.16?1:2+(Math.floor((age-.16)/.09)%2);blade(p.x,p.y,Math.atan2(p.vy,p.vx),p.m4g.sc,i);return;}
    return _dp.apply(this,arguments);};
  const _df=drawFx;drawFx=function(f){
    if(f.k==='m4gale'){if(wOk)blade(f.x,f.y,f.a,f.sc,f.t<f.dur/2?4:5);return;}
    return _df.apply(this,arguments);};
  TR.windOk=true;
}catch(er){TR.windErr=er.message;console.warn('[p257] gale wind',er);}
})();

