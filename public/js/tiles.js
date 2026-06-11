/* ============ tiles.js — procedural 16px tileset + characters ============ */
const TILE = 16;

const T = {
  GRASS:0, TALL:1, TREE:2, PATH:3, WATER:4, WATER_H:5, FLOWER:6, FENCE:7, SIGN:8,
  ROCK:9, CAVE_FLOOR:10, CAVE_WALL:11, CAVE_DOOR:12, ITEM:13,
  ROOF_O:14, ROOF_O_TOP:15, WALL:16, WINDOW:17, DOOR:18,
  ROOF_G:19, ROOF_G_TOP:20, WALL_LAB:21, WINDOW_LAB:22,
  IFLOOR:23, IWALL:24, MAT:25, TABLE:26, BOOK:27, PLANT:28, BED:29, TV:30,
  BALLTABLE:31, STOOL:32, DARK:33,
};
const TILE_COUNT = 34;

const SOLID = new Set([
  T.TREE, T.WATER, T.FENCE, T.SIGN, T.ROCK, T.CAVE_WALL, T.ITEM,
  T.ROOF_O, T.ROOF_O_TOP, T.WALL, T.WINDOW, T.ROOF_G, T.ROOF_G_TOP,
  T.WALL_LAB, T.WINDOW_LAB, T.IWALL, T.TABLE, T.BOOK, T.PLANT, T.BED, T.TV,
  T.BALLTABLE, T.STOOL, T.DARK,
]);

let TILESET = null; // canvas, 2 rows (anim frames) x TILE_COUNT cols

function buildTileset(){
  TILESET = document.createElement('canvas');
  TILESET.width = TILE_COUNT*TILE; TILESET.height = 2*TILE;
  const c = TILESET.getContext('2d');

  for(let f=0; f<2; f++){
    const p = (id,x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(id*TILE+x, f*TILE+y, w, h); };
    const base = (id,col)=>p(id,0,0,16,16,col);

    const G1='#9bd97e', G2='#aee391', G3='#7cc25f';
    const grassBase = id=>{
      base(id,G1);
      [[2,3],[9,1],[13,6],[5,9],[11,11],[1,13],[14,14],[7,5]].forEach(([x,y])=>p(id,x,y,2,1,G2));
      [[4,1],[12,4],[2,8],[8,12],[14,9],[6,15]].forEach(([x,y])=>p(id,x,y,1,1,G3));
    };

    /* GRASS */ grassBase(T.GRASS);

    /* TALL grass */
    grassBase(T.TALL);
    const D1='#3f9a52', D2='#2e7a3e', D3='#5cb96c';
    for(let i=0;i<4;i++){
      const x=i*4 + (f?1:0);
      p(T.TALL,x,4,2,11,D1); p(T.TALL,x+1,2,1,4,D3); p(T.TALL,x+2,6,1,9,D2);
      p(T.TALL,x,12,3,3,D2);
    }
    p(T.TALL,0,14,16,2,D2);

    /* TREE */
    grassBase(T.TREE);
    p(T.TREE,6,12,4,4,'#7c5230'); p(T.TREE,7,12,1,4,'#9a6a40');
    p(T.TREE,2,3,12,9,'#1f6f37');
    p(T.TREE,3,1,10,3,'#1f6f37');
    p(T.TREE,3,3,10,7,'#2f9449');
    p(T.TREE,4,1,8,3,'#2f9449');
    p(T.TREE,4,2,4,2,'#4ab863'); p(T.TREE,9,4,3,2,'#4ab863');
    p(T.TREE,3,6,3,2,'#4ab863'); p(T.TREE,8,7,4,2,'#1f6f37');
    p(T.TREE,5,9,6,2,'#1f6f37');

    /* PATH */
    base(T.PATH,'#e3cc92');
    [[2,2],[9,5],[5,8],[12,11],[3,13],[13,3],[8,14],[1,7]].forEach(([x,y])=>p(T.PATH,x,y,2,1,'#cfb67c'));
    [[6,3],[11,8],[4,5],[14,13]].forEach(([x,y])=>p(T.PATH,x,y,1,1,'#f0dcaa'));

    /* WATER + hidden-path water */
    const water = (id, sparkle)=>{
      base(id,'#58a0ec');
      const o = f?2:0;
      [[1,2],[8,4],[3,9],[11,11],[6,13],[13,6]].forEach(([x,y])=>p(id,(x+o)%14,y,4,1,'#8cc4f6'));
      [[5,6],[12,2],[2,12],[9,9]].forEach(([x,y])=>p(id,(x+o)%14,y,3,1,'#3f86d4'));
      if(sparkle){ [[4,3],[10,8],[6,12],[13,13]].forEach(([x,y])=>p(id,x,y,1,1,f?'#eaf6ff':'#b8dcff')); }
    };
    water(T.WATER,false); water(T.WATER_H,true);

    /* FLOWER */
    grassBase(T.FLOWER);
    const fl = (x,y)=>{
      const o=f?1:0;
      p(T.FLOWER,x+1-o,y,2,1,'#e8483a'); p(T.FLOWER,x,y+1,1,2,'#e8483a');
      p(T.FLOWER,x+3,y+1,1,2,'#e8483a'); p(T.FLOWER,x+1,y+3,2,1,'#e8483a');
      p(T.FLOWER,x+1,y+1,2,2,'#fff4d8');
    };
    fl(2,2); fl(9,8); fl(3,10); fl(10,2);

    /* FENCE */
    grassBase(T.FENCE);
    p(T.FENCE,2,4,4,10,'#c9c9d4'); p(T.FENCE,10,4,4,10,'#c9c9d4');
    p(T.FENCE,2,4,4,2,'#e8e8f0'); p(T.FENCE,10,4,4,2,'#e8e8f0');
    p(T.FENCE,5,4,1,10,'#8a8a9a'); p(T.FENCE,13,4,1,10,'#8a8a9a');
    p(T.FENCE,0,7,16,2,'#b8b8c8'); p(T.FENCE,0,9,16,1,'#8a8a9a');

    /* SIGN */
    grassBase(T.SIGN);
    p(T.SIGN,7,9,2,6,'#7c5230');
    p(T.SIGN,2,2,12,8,'#6e4e28'); p(T.SIGN,3,3,10,6,'#d8b878');
    p(T.SIGN,4,4,8,1,'#a8854e'); p(T.SIGN,4,6,8,1,'#a8854e'); p(T.SIGN,4,8,6,1,'#a8854e');

    /* ROCK mountain wall */
    base(T.ROCK,'#a8865a');
    p(T.ROCK,0,0,16,2,'#c4a072'); p(T.ROCK,0,14,16,2,'#7c5e3c');
    p(T.ROCK,3,3,4,3,'#c4a072'); p(T.ROCK,10,7,4,3,'#c4a072');
    p(T.ROCK,7,4,1,8,'#7c5e3c'); p(T.ROCK,2,9,5,1,'#7c5e3c'); p(T.ROCK,11,3,1,4,'#7c5e3c');

    /* CAVE */
    base(T.CAVE_FLOOR,'#6e5a66');
    [[3,3],[10,6],[5,11],[13,12],[8,2],[1,8]].forEach(([x,y])=>p(T.CAVE_FLOOR,x,y,2,1,'#7e6a76'));
    [[6,6],[12,3],[2,13],[9,10]].forEach(([x,y])=>p(T.CAVE_FLOOR,x,y,1,1,'#564450'));
    base(T.CAVE_WALL,'#473949');
    p(T.CAVE_WALL,0,0,16,1,'#5d4b60'); p(T.CAVE_WALL,0,15,16,1,'#2e2430');
    p(T.CAVE_WALL,2,3,5,4,'#52425a'); p(T.CAVE_WALL,9,8,5,4,'#52425a');
    p(T.CAVE_WALL,8,2,1,5,'#2e2430'); p(T.CAVE_WALL,3,10,6,1,'#2e2430');
    base(T.CAVE_DOOR,'#a8865a');
    p(T.CAVE_DOOR,3,3,10,13,'#100a12'); p(T.CAVE_DOOR,2,2,12,2,'#7c5e3c');
    p(T.CAVE_DOOR,2,2,2,14,'#7c5e3c'); p(T.CAVE_DOOR,12,2,2,14,'#7c5e3c');

    /* ITEM ball */
    grassBase(T.ITEM);
    p(T.ITEM,4,4,8,8,'#2a2a2a');
    p(T.ITEM,5,4,6,4,'#e8285a'); p(T.ITEM,5,9,6,3,'#f0f0f0');
    p(T.ITEM,4,8,8,1,'#2a2a2a'); p(T.ITEM,7,7,2,2,'#fff');

    /* House roof (orange) */
    base(T.ROOF_O,'#e2703a');
    p(T.ROOF_O,0,3,16,1,'#b84e20'); p(T.ROOF_O,0,8,16,1,'#b84e20'); p(T.ROOF_O,0,13,16,1,'#b84e20');
    p(T.ROOF_O,0,0,16,2,'#f08a52');
    base(T.ROOF_O_TOP,'#f08a52');
    p(T.ROOF_O_TOP,0,0,16,3,'#f8a872'); p(T.ROOF_O_TOP,0,14,16,2,'#b84e20');

    /* House wall / window / door */
    base(T.WALL,'#cdd2dc');
    p(T.WALL,0,0,16,1,'#9aa2b4'); p(T.WALL,0,13,16,3,'#aab0c0');
    p(T.WALL,0,15,16,1,'#7e8698'); p(T.WALL,5,1,1,12,'#b8bece'); p(T.WALL,11,1,1,12,'#b8bece');
    base(T.WINDOW,'#cdd2dc');
    p(T.WINDOW,0,0,16,1,'#9aa2b4'); p(T.WINDOW,0,15,16,1,'#7e8698');
    p(T.WINDOW,2,3,12,9,'#3a4254');
    p(T.WINDOW,3,4,10,7,'#6c92d8'); p(T.WINDOW,3,4,10,2,'#a8c4f0'); p(T.WINDOW,7,4,1,7,'#3a4254');
    base(T.DOOR,'#cdd2dc');
    p(T.DOOR,2,1,12,15,'#5e3c1e');
    p(T.DOOR,3,2,10,13,'#9a6232'); p(T.DOOR,4,3,8,5,'#b87e48'); p(T.DOOR,11,9,2,2,'#f0d048');

    /* Lab roof (gray) + cream wall + window */
    base(T.ROOF_G,'#8fa0b4');
    p(T.ROOF_G,0,3,16,1,'#67788c'); p(T.ROOF_G,0,8,16,1,'#67788c'); p(T.ROOF_G,0,13,16,1,'#67788c');
    p(T.ROOF_G,4,0,1,16,'#67788c'); p(T.ROOF_G,11,0,1,16,'#67788c');
    p(T.ROOF_G,0,0,16,1,'#aebdd0');
    base(T.ROOF_G_TOP,'#aebdd0');
    p(T.ROOF_G_TOP,0,0,16,3,'#c6d4e4'); p(T.ROOF_G_TOP,0,14,16,2,'#67788c');
    base(T.WALL_LAB,'#e8d8a4');
    p(T.WALL_LAB,0,0,16,1,'#baa878'); p(T.WALL_LAB,0,15,16,1,'#9a8858');
    p(T.WALL_LAB,0,7,16,1,'#d0bc88'); p(T.WALL_LAB,8,0,1,16,'#d0bc88');
    base(T.WINDOW_LAB,'#e8d8a4');
    p(T.WINDOW_LAB,0,0,16,1,'#baa878'); p(T.WINDOW_LAB,0,15,16,1,'#9a8858');
    p(T.WINDOW_LAB,2,3,12,10,'#3a4254');
    p(T.WINDOW_LAB,3,4,10,8,'#6c92d8'); p(T.WINDOW_LAB,3,4,10,3,'#a8c4f0');

    /* Interior */
    base(T.IFLOOR,'#decdaa');
    p(T.IFLOOR,0,0,16,1,'#cbb88e'); p(T.IFLOOR,0,0,1,16,'#cbb88e');
    p(T.IFLOOR,8,0,1,16,'#d4c098'); p(T.IFLOOR,0,8,16,1,'#d4c098');
    base(T.IWALL,'#9ec8b4');
    p(T.IWALL,0,0,16,4,'#86b49e'); p(T.IWALL,0,12,16,4,'#b2d8c4');
    p(T.IWALL,0,11,16,1,'#6e9c86'); p(T.IWALL,0,15,16,1,'#6e9c86');
    base(T.MAT,'#decdaa');
    p(T.MAT,1,1,14,14,'#b85048'); p(T.MAT,3,3,10,10,'#d87a6a'); p(T.MAT,5,5,6,6,'#b85048');
    /* table */
    base(T.TABLE,'#decdaa');
    p(T.TABLE,1,3,14,10,'#8a5a32'); p(T.TABLE,2,4,12,7,'#b87e48');
    p(T.TABLE,2,4,12,2,'#d8a468'); p(T.TABLE,2,13,2,3,'#6e4424'); p(T.TABLE,12,13,2,3,'#6e4424');
    /* bookshelf */
    base(T.BOOK,'#9ec8b4');
    p(T.BOOK,1,0,14,16,'#7c5230'); p(T.BOOK,2,1,12,6,'#3e2a16'); p(T.BOOK,2,8,12,6,'#3e2a16');
    const spines=['#d84848','#4878d8','#48b858','#e8c848','#b858c8','#e88848'];
    spines.forEach((col,i)=>{ p(T.BOOK,2+i*2,2,2,5,col); p(T.BOOK,2+((i+2)%6)*2,9,2,5,spines[(i+3)%6]); });
    /* plant */
    base(T.PLANT,'#decdaa');
    p(T.PLANT,5,10,6,5,'#c86848'); p(T.PLANT,4,9,8,2,'#a84e34');
    p(T.PLANT,4,2,8,8,'#2f9449'); p(T.PLANT,2,4,4,4,'#2f9449'); p(T.PLANT,10,4,4,4,'#2f9449');
    p(T.PLANT,5,3,3,3,'#4ab863'); p(T.PLANT,10,5,2,2,'#4ab863');
    /* bed */
    base(T.BED,'#decdaa');
    p(T.BED,1,1,14,14,'#8a5a32'); p(T.BED,2,2,12,12,'#5878c8');
    p(T.BED,2,2,12,4,'#f0f0f0'); p(T.BED,2,7,12,1,'#3e5aa8'); p(T.BED,2,10,12,1,'#3e5aa8');
    /* tv */
    base(T.TV,'#decdaa');
    p(T.TV,1,3,14,10,'#3a3a42'); p(T.TV,3,5,10,6,'#1a242e');
    p(T.TV,4,6,4,2,'#4a90c8'); p(T.TV,5,13,6,2,'#5a5a64');
    /* starter ball table (green, like the lab) */
    base(T.BALLTABLE,'#decdaa');
    p(T.BALLTABLE,0,2,16,12,'#3e8868'); p(T.BALLTABLE,1,3,14,8,'#62b890');
    p(T.BALLTABLE,1,3,14,2,'#8ad8b4'); p(T.BALLTABLE,1,13,3,3,'#2e6e52'); p(T.BALLTABLE,12,13,3,3,'#2e6e52');
    p(T.BALLTABLE,5,4,6,6,'#2a2a2a');
    p(T.BALLTABLE,6,4,4,3,'#e8285a'); p(T.BALLTABLE,6,8,4,2,'#f0f0f0');
    p(T.BALLTABLE,5,7,6,1,'#2a2a2a'); p(T.BALLTABLE,7,6,2,2,'#fff');
    /* stool */
    base(T.STOOL,'#decdaa');
    p(T.STOOL,4,4,8,8,'#c84848'); p(T.STOOL,5,5,6,4,'#e87a6a'); p(T.STOOL,4,12,2,3,'#6e4424'); p(T.STOOL,10,12,2,3,'#6e4424');
    /* darkness (cave void) */
    base(T.DARK,'#0c0a10');
  }
}

function drawTileTo(ctx, tile, dx, dy, frame){
  ctx.drawImage(TILESET, tile*TILE, (frame%2)*TILE, TILE, TILE, dx, dy, TILE, TILE);
}

/* ---------- characters (16x20, drawn 4px above their tile) ---------- */
const PALETTES = {
  player:{skin:'#f8c08a', hair:'#3a3a3a', hat:'#e8284a', hatW:'#f8f8f8', shirt:'#d83048', pants:'#3858a0', shoe:'#2a2a2a'},
  mom:   {skin:'#f8c08a', hair:'#a85a28', hat:null, shirt:'#e88aa8', pants:'#c8c8d0', shoe:'#7a4a2a'},
  oak:   {skin:'#f0b87a', hair:'#c8c8c8', hat:null, shirt:'#f0f0f0', pants:'#8a6a4a', shoe:'#3a3a3a'},
  rival: {skin:'#f8c08a', hair:'#b85820', hat:null, shirt:'#3878c0', pants:'#2a2a32', shoe:'#3a3a3a'},
  kid:   {skin:'#f8c08a', hair:'#2a2a2a', hat:'#f0d048', hatW:'#f0d048', shirt:'#48a858', pants:'#c87838', shoe:'#3a3a3a'},
  hiker: {skin:'#e8a868', hair:'#4a3a2a', hat:null, shirt:'#a85838', pants:'#5a4a3a', shoe:'#2a2a2a'},
  fisher:{skin:'#f0b87a', hair:'#3a3a3a', hat:'#3868a8', hatW:'#3868a8', shirt:'#48a8c8', pants:'#3a5a48', shoe:'#2a2a2a'},
  girl:  {skin:'#f8c08a', hair:'#e8b838', hat:null, shirt:'#e86888', pants:'#f0f0f0', shoe:'#c84848'},
};

function drawChar(ctx, dx, dy, pal, dir, frame){
  ctx.save();
  ctx.translate(dx, dy-4);
  if(dir==='right'){ ctx.translate(16,0); ctx.scale(-1,1); dir='left'; }
  const q=(x,y,w,h,col)=>{ if(col){ ctx.fillStyle=col; ctx.fillRect(x,y,w,h);} };
  const P=pal;
  /* head */
  q(4,1,8,7,P.skin);
  q(3,2,1,4,P.skin); q(12,2,1,4,P.skin);
  if(dir==='up'){ q(3,0,10,5,P.hat||P.hair); }
  else if(P.hat){ q(3,0,10,3,P.hat); q(2,2,12,1,P.hat); q(3,3,3,1,P.hatW); }
  else { q(3,0,10,3,P.hair); q(3,2,2,3,P.hair); q(11,2,2,3,P.hair); }
  if(dir==='down'){ q(5,4,2,2,'#2a2a2a'); q(9,4,2,2,'#2a2a2a'); }
  if(dir==='left'){ q(5,4,2,2,'#2a2a2a'); q(2,2,2,4,P.hair||P.skin); }
  /* body */
  q(4,8,8,6,P.shirt);
  q(2,8,2,4,P.shirt); q(12,8,2,4,P.shirt);     /* arms */
  q(2,12,2,2,P.skin); q(12,12,2,2,P.skin);     /* hands */
  /* legs (frame alternates) */
  const lf = frame%2===0;
  q(4,14,3,4,P.pants); q(9,14,3,4,P.pants);
  if(lf){ q(4,18,3,2,P.shoe); q(9,17,3,2,P.shoe); q(9,14,3,1,P.shirt); }
  else  { q(4,17,3,2,P.shoe); q(4,14,3,1,P.shirt); q(9,18,3,2,P.shoe); }
  ctx.restore();
}

/* generic overworld creature blob — for visible rare POKéMON */
const MON_PALETTES = {
  mew:    {body:'#f8b8d8', belly:'#fcd8ea', dark:'#c87aa8', eye:'#3858c8'},
  mewtwo: {body:'#c8b8d8', belly:'#9a86b8', dark:'#7a5a9a', eye:'#7a3aa8'},
  articuno:{body:'#78b8e8', belly:'#b8dcf8', dark:'#3878b8', eye:'#c83848'},
  snorlax:{body:'#3e7068', belly:'#f0e0c0', dark:'#2a5048', eye:'#1a1a1a'},
};
function drawMonSprite(ctx, dx, dy, palName, frame){
  const P = MON_PALETTES[palName] || MON_PALETTES.mew;
  ctx.save();
  ctx.translate(dx, dy-2 + (frame%2));
  const q=(x,y,w,h,col)=>{ ctx.fillStyle=col; ctx.fillRect(x,y,w,h); };
  q(3,5,10,9,P.body);            /* body */
  q(2,6,1,7,P.dark); q(13,6,1,7,P.dark);
  q(5,9,6,5,P.belly);            /* belly */
  q(2,2,3,4,P.body); q(11,2,3,4,P.body); /* ears */
  q(3,3,1,2,P.dark); q(12,3,1,2,P.dark);
  q(5,7,2,2,P.eye); q(9,7,2,2,P.eye);    /* eyes */
  q(1,12,2,2,P.dark); q(13,12,2,2,P.dark); /* feet */
  q(13,4,2,3,P.dark);            /* tail nub */
  ctx.restore();
}
