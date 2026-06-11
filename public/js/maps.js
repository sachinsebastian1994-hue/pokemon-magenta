/* ============ maps.js — world construction ============ */
/* Map: {w,h,t:tiles, enc:encounter-table per tile, warps, npcs, statics, items, signs, outdoor} */

const MAPS = {};

function newMap(id, w, h, fill){
  const m = {
    id, w, h,
    t: new Int16Array(w*h).fill(fill),
    enc: new Uint8Array(w*h),
    warps: {}, signs: {}, npcs: [], statics: [], items: [], outdoor: true,
  };
  MAPS[id] = m;
  return m;
}
const MI = (m,x,y)=>y*m.w+x;
function mset(m,x,y,t){ if(x>=0&&y>=0&&x<m.w&&y<m.h) m.t[MI(m,x,y)]=t; }
function mget(m,x,y){ if(x<0||y<0||x>=m.w||y>=m.h) return T.TREE; return m.t[MI(m,x,y)]; }
function mrect(m,x,y,w,h,t,enc){
  for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++){
    mset(m,i,j,t);
    if(enc!==undefined && i>=0&&j>=0&&i<m.w&&j<m.h) m.enc[MI(m,i,j)]=enc;
  }
}
function warp(m,x,y,dest,dx,dy){ m.warps[`${x},${y}`]={map:dest,x:dx,y:dy}; }
function sign(m,x,y,text){ mset(m,x,y,T.SIGN); m.signs[`${x},${y}`]=text; }
function npc(m,o){ m.npcs.push(o); }
function staticMon(m,o){ m.statics.push(o); }
function groundItem(m,x,y,item,qty){
  mset(m,x,y,T.ITEM);
  m.items.push({x,y,item,qty:qty||1,flag:`itm_${m.id}_${x}_${y}`});
}

function buildMaps(){
  /* ================= OVERWORLD 60x60 ================= */
  const w = newMap('world', 60, 60, T.GRASS);
  w.name = 'MAGENTA TOWN';

  /* map border (note: west border is 2 wide ONLY at x0..1 — x2 stays open for the secret) */
  mrect(w,0,0,60,2,T.TREE); mrect(w,0,58,60,2,T.TREE);
  mrect(w,0,0,2,60,T.TREE); mrect(w,58,0,2,60,T.TREE);

  /* ---- region walls ---- */
  mrect(w,2,38,35,2,T.TREE);            /* route/town divider, x2..36 */
  mrect(w,19,38,2,2,T.GRASS);           /* town gate x19..20 */
  mrect(w,13,20,45,2,T.TREE);           /* route/north-field divider x13..57 */
  mrect(w,23,20,2,2,T.GRASS);           /* main gap */
  mrect(w,33,20,1,2,T.GRASS);           /* snorlax shortcut gap */
  mrect(w,13,22,1,16,T.TREE);           /* route west wall */
  mrect(w,37,22,1,16,T.TREE);           /* route east wall */
  mrect(w,37,32,1,2,T.GRASS);           /* gap to lake */
  mrect(w,2,40,4,18,T.TREE);            /* west of town */
  mrect(w,35,44,23,14,T.TREE);          /* east+south-east fill */
  mrect(w,35,40,3,4,T.TREE);            /* seal town's east edge */
  mrect(w,13,2,45,2,T.TREE);            /* thicken north border over the field */

  /* ---- ROUTE 1 (enc 1) ---- */
  mrect(w,15,31,7,5,T.TALL,1);
  mrect(w,26,24,8,4,T.TALL,1);
  [[24,30],[31,31],[17,25],[28,35],[34,28]].forEach(([x,y])=>mset(w,x,y,T.TREE));
  mrect(w,19,22,2,16,T.PATH);           /* path through route */
  groundItem(w,15,23,'POKEBALL',2);
  groundItem(w,35,36,'POTION',2);
  sign(w,21,37,'ROUTE 1\nWild POKéMON live in tall grass!');

  /* ---- MAGENTA WOODS (enc 3) — west forest with the hidden corridor ---- */
  mrect(w,2,4,11,34,T.TREE);            /* x2..12, y4..37 solid trees */
  mrect(w,4,30,10,1,T.GRASS);           /* entrance corridor (y30) x4..13 */
  mrect(w,2,30,2,1,T.GRASS);            /* ...continues to the far west wall */
  mrect(w,4,22,1,9,T.GRASS);            /* up x4 */
  mrect(w,4,22,6,1,T.GRASS);            /* west spur y22 */
  groundItem(w,10,22,'GREATBALL',2);
  mrect(w,7,16,1,7,T.GRASS);            /* up x7 */
  mrect(w,7,16,6,1,T.GRASS);            /* east y16 */
  mrect(w,8,10,5,6,T.GRASS);            /* clearing */
  mrect(w,9,11,4,4,T.TALL,3);           /* pikachu grass */
  mrect(w,5,24,2,5,T.TALL,3);           /* grass by the path */
  /* the secret: a 1-tile corridor hugging the western map edge */
  mrect(w,2,6,1,25,T.GRASS);
  mrect(w,3,5,6,4,T.GRASS);             /* hidden clearing */
  groundItem(w,3,5,'ULTRABALL',2);
  staticMon(w,{x:5,y:6,id:151,lv:50,pal:'mew',flag:'st_mew',
    lines:'MEW is floating playfully...\nIt looks delighted you found it!'});
  sign(w,12,29,"MAGENTA WOODS\nDon't get lost! Old tale:\n'The west wall hides a path.'");

  /* ---- NORTH FIELD (enc 2) ---- */
  mrect(w,20,6,8,5,T.TALL,2);
  mrect(w,30,8,9,6,T.TALL,2);
  mrect(w,22,14,12,4,T.TALL,2);
  [[16,8],[18,15],[40,6],[42,16],[36,18]].forEach(([x,y])=>mset(w,x,y,T.TREE));
  groundItem(w,30,15,'SUPER_POTION',2);
  npc(w,{x:29,y:13,pal:'girl',dir:'down',name:'LASS',
    lines:"SCYTHER and PINSIR hide in this field! They're SUPER rare.\nCHANSEY too... I've never once seen one."});
  staticMon(w,{x:33,y:21,id:143,lv:30,pal:'snorlax',flag:'st_snorlax',
    lines:'A huge POKéMON is sleeping and blocking the gap...\nZZZ... ZZZ...'});

  /* ---- MOUNTAIN + CAVE ENTRANCE ---- */
  mrect(w,44,4,13,12,T.ROCK);
  mset(w,50,15,T.CAVE_DOOR); warp(w,50,15,'cave',3,17);
  groundItem(w,45,16,'ULTRABALL',2);
  npc(w,{x:49,y:17,pal:'hiker',dir:'down',name:'HIKER',
    lines:'This cavern goes DEEP.\nTrainers whisper about a man-made POKéMON sulking in the deepest chamber... brrr.'});

  /* ---- LAKE (enc 4) with hidden water path ---- */
  mrect(w,40,26,13,14,T.WATER);
  mrect(w,49,32,3,3,T.GRASS);           /* island */
  staticMon(w,{x:50,y:33,id:144,lv:50,pal:'articuno',flag:'st_articuno',
    lines:'The legendary bird ARTICUNO stands proudly on the island!'});
  mrect(w,40,33,9,1,T.WATER_H);         /* invisible walkway: shore → island */
  mrect(w,53,26,3,10,T.TALL,4);         /* east shore grass */
  mrect(w,38,40,12,3,T.TALL,4);         /* south shore grass */
  groundItem(w,47,41,'RARE_CANDY',1);
  groundItem(w,54,28,'GREATBALL',2);
  npc(w,{x:38,y:36,pal:'fisher',dir:'up',name:'FISHERMAN',
    lines:'Some days the lake SHIMMERS in a line, straight out to that island.\nAlmost like... you could walk on it?'});

  /* ---- TOWN ---- */
  mrect(w,19,40,2,8,T.PATH);            /* main street */
  mrect(w,8,46,21,2,T.PATH);            /* cross street */
  mrect(w,14,54,15,1,T.PATH);           /* lab front street */
  mrect(w,23,48,2,7,T.PATH);            /* connector */
  stampHouse(w,9,42);  warp(w,11,45,'home',4,6);
  stampHouse(w,21,42); warp(w,23,45,'rival',4,6);
  stampLab(w,15,49);   warp(w,18,53,'lab',5,8);
  mrect(w,7,51,6,5,T.WATER);            /* town pond */
  mrect(w,5,48,9,1,T.FENCE);
  mrect(w,6,49,7,2,T.FLOWER);
  mrect(w,26,42,2,2,T.FLOWER);
  mrect(w,28,50,3,2,T.FLOWER);
  sign(w,7,46,'MAGENTA TOWN\nWhere every journey begins.');
  sign(w,13,54,'OAK POKéMON RESEARCH LAB');
  npc(w,{x:26,y:48,pal:'kid',dir:'down',name:'YOUNGSTER',
    lines:'I heard a PINK POKéMON sings deep inside MAGENTA WOODS!\nGrandpa says: when the woods feel endless, trust the western wall.'});

  /* ================= CAVE 26x22 ================= */
  const c = newMap('cave', 26, 22, T.CAVE_WALL);
  c.name = 'MAGENTA CAVERN';
  c.outdoor = false;
  const F = T.CAVE_FLOOR, E = 5;
  mrect(c,3,10,1,9,F,E);                /* entrance column */
  mrect(c,3,10,10,1,F,E);
  mrect(c,12,4,1,15,F,E);
  mrect(c,12,18,9,1,F,E); groundItem(c,20,18,'ULTRABALL',2);
  mrect(c,8,4,5,1,F,E);   groundItem(c,8,4,'SUPER_POTION',2);
  mrect(c,12,14,12,1,F,E);
  mrect(c,23,9,1,6,F,E);
  mrect(c,18,9,6,1,F,E);
  mrect(c,18,6,1,4,F,E);
  mrect(c,17,3,5,3,F,E);                /* deepest chamber */
  mrect(c,23,14,1,5,F,E); groundItem(c,23,18,'RARE_CANDY',1);
  mset(c,3,18,T.MAT); warp(c,3,18,'world',50,16);
  staticMon(c,{x:19,y:4,id:150,lv:70,pal:'mewtwo',flag:'st_mewtwo',
    lines:'A cold, intelligent gaze pierces the dark...\nMEWTWO!'});

  /* ================= INTERIORS ================= */
  const home = interiorBase('home', 10, 8);
  home.name = 'YOUR HOUSE';
  mset(home,1,2,T.BED); mset(home,4,2,T.TV); mset(home,7,2,T.BOOK);
  mset(home,3,4,T.TABLE); mset(home,8,6,T.PLANT);
  mset(home,4,7,T.MAT); warp(home,4,7,'world',11,46);
  npc(home,{x:6,y:4,pal:'mom',dir:'down',name:'MOM',fn:'mom'});

  const rv = interiorBase('rival', 10, 8);
  rv.name = "RIVAL'S HOUSE";
  mset(rv,2,2,T.BOOK); mset(rv,3,2,T.BOOK); mset(rv,6,2,T.TV);
  mset(rv,5,4,T.TABLE); mset(rv,1,6,T.PLANT); mset(rv,8,2,T.PLANT);
  mset(rv,4,7,T.MAT); warp(rv,4,7,'world',23,46);
  npc(rv,{x:3,y:4,pal:'girl',dir:'down',name:'DAISY',fn:'sister'});

  const lab = interiorBase('lab', 12, 10);
  lab.name = 'POKéMON LAB';
  [1,2,3,8,9,10].forEach(x=>mset(lab,x,2,T.BOOK));
  mset(lab,4,5,T.BALLTABLE); mset(lab,5,5,T.BALLTABLE); mset(lab,6,5,T.BALLTABLE);
  mset(lab,1,8,T.PLANT); mset(lab,10,8,T.PLANT);
  mset(lab,5,9,T.MAT); mset(lab,6,9,T.MAT);
  warp(lab,5,9,'world',18,54); warp(lab,6,9,'world',18,54);
  npc(lab,{x:5,y:3,pal:'oak',dir:'down',name:'PROF. OAK',fn:'oak'});
  npc(lab,{x:8,y:6,pal:'rival',dir:'left',name:'GARY',fn:'rival', hideFlag:'rivalGone'});
}

function stampHouse(m,x,y){
  mrect(m,x,y,5,1,T.ROOF_O_TOP);
  mrect(m,x,y+1,5,1,T.ROOF_O);
  mrect(m,x,y+2,5,2,T.WALL);
  mset(m,x+1,y+3,T.WINDOW); mset(m,x+3,y+3,T.WINDOW);
  mset(m,x+2,y+3,T.DOOR);
}
function stampLab(m,x,y){
  mrect(m,x,y,7,1,T.ROOF_G_TOP);
  mrect(m,x,y+1,7,1,T.ROOF_G);
  mrect(m,x,y+2,7,3,T.WALL_LAB);
  mset(m,x+1,y+3,T.WINDOW_LAB); mset(m,x+5,y+3,T.WINDOW_LAB);
  mset(m,x+1,y+4,T.WINDOW_LAB); mset(m,x+5,y+4,T.WINDOW_LAB);
  mset(m,x+3,y+4,T.DOOR);
}
function interiorBase(id,w,h){
  const m = newMap(id, w, h, T.IFLOOR);
  m.outdoor = false;
  mrect(m,0,0,w,2,T.IWALL);
  mrect(m,0,0,1,h,T.IWALL); mrect(m,w-1,0,1,h,T.IWALL);
  mrect(m,0,h-1,w,1,T.IWALL);
  return m;
}
