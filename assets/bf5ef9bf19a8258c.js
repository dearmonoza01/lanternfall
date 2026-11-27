
/* ---- m11clean-r1 (TEST allin_r89, 14 Nov 2026): Map 11 CLEAN ground (Art map11_clean_r1: the painted grass tufts / flowers / small rocks are gone) + walk map r4 (no plant circles; cliffs, water, bank boulders, borders still blocked). DeaRz 14 Nov 16:33.
   The 16 tiles are cut from M11G4_clean_ground_5496x4580.jpg at exactly the map11_pack_r1 boxes (4 x 4, 1374 x 1145). ?m11clean=off = the old painted ground + the r3 walk map. Debug: window.__M11CLEAN ---- */
window.__M11_TILES_R4={W:5496,H:4580,tiles:[
{x:0,y:0,w:1374,h:1145,src:'assets/1051a987b2515503.jpg'},
{x:1374,y:0,w:1374,h:1145,src:'assets/d44c69dd6c2dfe1c.jpg'},
{x:2748,y:0,w:1374,h:1145,src:'assets/31a8b53772ae8b7d.jpg'},
{x:4122,y:0,w:1374,h:1145,src:'assets/285dc0f584e39429.jpg'},
{x:0,y:1145,w:1374,h:1145,src:'assets/465d10be07042161.jpg'},
{x:1374,y:1145,w:1374,h:1145,src:'assets/a5c589336035d14d.jpg'},
{x:2748,y:1145,w:1374,h:1145,src:'assets/0ee269713043ba6a.jpg'},
{x:4122,y:1145,w:1374,h:1145,src:'assets/302809d2596966e8.jpg'},
{x:0,y:2290,w:1374,h:1145,src:'assets/09f3ae43a7757b73.jpg'},
{x:1374,y:2290,w:1374,h:1145,src:'assets/d8c7b9f733a707b0.jpg'},
{x:2748,y:2290,w:1374,h:1145,src:'assets/ecdd1076ef403938.jpg'},
{x:4122,y:2290,w:1374,h:1145,src:'assets/1189a1ec22476ea8.jpg'},
{x:0,y:3435,w:1374,h:1145,src:'assets/c89a5a0048179eee.jpg'},
{x:1374,y:3435,w:1374,h:1145,src:'assets/4643adb1c979b1d3.jpg'},
{x:2748,y:3435,w:1374,h:1145,src:'assets/55b364f2fc3c5e9d.jpg'},
{x:4122,y:3435,w:1374,h:1145,src:'assets/1008e67f0f0b312f.jpg'},
]};
window.__M11_MASK3_R4={walk:'assets/e6c4cc4e464b3740.png',w:3600,h:3000,src:'map11_walk_r4_3600_noplants.png (Art, no plant circles)'};
/* ---- m11g5 (TEST allin_r90, 14 Nov 2026): Map 11 SHARP ground G5 (Art, 16 ChatGPT per-tile repaints, M11G5_sharp_5496x4580.jpg, same layout as G4 so the r4 walk mask stays valid), cut at the same 4 x 4 boxes (1374 x 1145), JPEG q95. Default ground = G5; ?m11g=4 = the soft G4 ground; ?m11clean=off = the old painted ground (G2) + r3 mask. ---- */
window.__M11_TILES_R5={W:5496,H:4580,tiles:[
{x:0,y:0,w:1374,h:1145,src:'assets/ace736b57046df47.jpg'},
{x:1374,y:0,w:1374,h:1145,src:'assets/a0513ff5513d1795.jpg'},
{x:2748,y:0,w:1374,h:1145,src:'assets/4f6854f1ab38e70c.jpg'},
{x:4122,y:0,w:1374,h:1145,src:'assets/ca704e2c29064df5.jpg'},
{x:0,y:1145,w:1374,h:1145,src:'assets/f2d1f36593b4045b.jpg'},
{x:1374,y:1145,w:1374,h:1145,src:'assets/3e67bf6fbb0bfa26.jpg'},
{x:2748,y:1145,w:1374,h:1145,src:'assets/f2030a65629160b2.jpg'},
{x:4122,y:1145,w:1374,h:1145,src:'assets/2e1d3a17df547f61.jpg'},
{x:0,y:2290,w:1374,h:1145,src:'assets/46a71afa5dc583b0.jpg'},
{x:1374,y:2290,w:1374,h:1145,src:'assets/5980611f9d394486.jpg'},
{x:2748,y:2290,w:1374,h:1145,src:'assets/d6840df6897145bf.jpg'},
{x:4122,y:2290,w:1374,h:1145,src:'assets/4fa66caf6d87a1d4.jpg'},
{x:0,y:3435,w:1374,h:1145,src:'assets/3cdff736b25c9932.jpg'},
{x:1374,y:3435,w:1374,h:1145,src:'assets/d06f1a4ca4a3622e.jpg'},
{x:2748,y:3435,w:1374,h:1145,src:'assets/ffbeb8d11536368d.jpg'},
{x:4122,y:3435,w:1374,h:1145,src:'assets/326b80f572fe8d56.jpg'},
]};
/* ---- m11mask-d1 (TEST allin_r91, 15 Nov 2026): DeaRz's own painted Map 11 collision (map11_walk_dearz_20261115.png, 3600 x 3000, exact green / grey / blue) = the DEFAULT walk mask now (replaces Art r4; r4 stays as the reset target of the paint editor; ?m11mask=r4 = r4). A browser save older than 15 Nov 00:00 UTC is ignored and removed (superseded); a newer save still wins. ---- */
window.__M11_MASK3_D1={walk:'assets/db0cafab85ef80f0.png',w:3600,h:3000,src:'map11_walk_dearz_20261115.png (DeaRz painted collision)'};
(function(){const Q=location.search,off=/[?&]m11clean=off\b/.test(Q),g4=/[?&]m11g=4\b/.test(Q),r4=/[?&]m11mask=r4\b/.test(Q);window.__M11CLEAN={on:!off,ver:'m11clean-r3',ground:off?'G2 (old painted)':g4?'G4 (soft clean)':'G5 (sharp clean)',mask:off?'r3':r4?'r4 (Art)':'DeaRz painted 15 Nov'};if(off){window.__M11_TILES_R4=null;window.__M11_TILES_R5=null;window.__M11_MASK3_R4=null;window.__M11_MASK3_D1=null;return}window.__M11_R4_SRC=window.__M11_MASK3_R4.walk;window.__M11_TILES=g4?window.__M11_TILES_R4:window.__M11_TILES_R5;window.__M11_MASK3=r4?window.__M11_MASK3_R4:window.__M11_MASK3_D1;window.__M11_TILES_R4=null;window.__M11_TILES_R5=null;window.__M11_MASK3_R4=null;window.__M11_MASK3_D1=null})();
