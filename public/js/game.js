/* ============ game.js — overworld engine, menus, save ============ */

const Game = {
  state:'boot',            // boot | title | world | battle | busy
  name:'RED', rivalName:'GARY',
  party:[], pc:[], bag:{}, flags:{},
  seen:new Set(), caught:new Set(),
  map:null, x:4, y:4, dir:'down',
  ox:0, oy:0, moving:false, walkFrame:0,
  tick:0,
  worldCtx:null,

  markSeen(id){ this.seen.add(id); },
  markCaught(id){ this.seen.add(id); this.caught.add(id); },
  addItem(k,q=1){ this.bag[k]=(this.bag[k]||0)+q; },
  takeItem(k,q=1){ this.bag[k]=Math.max(0,(this.bag[k]||0)-q); if(!this.bag[k]) delete this.bag[k]; },
  healAll(){ this.party.forEach(m=>{ m.hp=m.stats.hp; m.status=null; m.sleepTurns=0; m.moves.forEach(s=>s.pp=MOVES[s.id].pp); }); },

  enterMap(id,x,y,dir){
    this.map = MAPS[id];
    this.x=x; this.y=y; this.ox=0; this.oy=0; this.moving=false;
    this.bannerTick = this.tick;
    if(dir) this.dir=dir;
  },
};

/* ---------------- collision ---------------- */
function tileWalkable(m,x,y){
  if(x<0||y<0||x>=m.w||y>=m.h) return false;
  const t = mget(m,x,y);
  if(SOLID.has(t)) return false;
  for(const n of m.npcs) if(!isHidden(n) && n.x===x && n.y===y) return false;
  for(const s of m.statics) if(!Game.flags[s.flag] && s.x===x && s.y===y) return false;
  return true;
}
const isHidden = n => n.hideFlag && Game.flags[n.hideFlag];

/* ---------------- main loop ---------------- */
let CTX=null;
function startLoop(){
  const cv = document.getElementById('game');
  CTX = cv.getContext('2d');
  CTX.imageSmoothingEnabled = false;
  requestAnimationFrame(loop);
}
function loop(){
  Game.tick++;
  if(Game.state==='world'){ updateWorld(); drawWorld(); }
  requestAnimationFrame(loop);
}

function worldInputActive(){
  return Game.state==='world' && Input.stack[Input.stack.length-1]===Game.worldCtx;
}

function updateWorld(){
  if(Game.moving){
    const SPEED = 2;
    if(Game.dir==='up') Game.oy-=SPEED;
    if(Game.dir==='down') Game.oy+=SPEED;
    if(Game.dir==='left') Game.ox-=SPEED;
    if(Game.dir==='right') Game.ox+=SPEED;
    Game.walkFrame = Math.abs(Game.ox+Game.oy)>=8 ? 1 : 0;
    if(Math.abs(Game.ox)>=16 || Math.abs(Game.oy)>=16){
      if(Game.dir==='up') Game.y--;
      if(Game.dir==='down') Game.y++;
      if(Game.dir==='left') Game.x--;
      if(Game.dir==='right') Game.x++;
      Game.ox=0; Game.oy=0; Game.moving=false;
      onStep();
    }
    return;
  }
  if(!worldInputActive()) return;
  const h = Input.held;
  let dir = null;
  if(h.up) dir='up'; else if(h.down) dir='down';
  else if(h.left) dir='left'; else if(h.right) dir='right';
  if(!dir) return;
  Game.dir = dir;
  const [tx,ty] = facing(dir);
  if(tileWalkable(Game.map, tx, ty)) Game.moving = true;
}

function facing(dir){
  const d = dir||Game.dir;
  return [
    Game.x + (d==='right') - (d==='left'),
    Game.y + (d==='down') - (d==='up'),
  ];
}

async function onStep(){
  const m = Game.map;
  const w = m.warps[`${Game.x},${Game.y}`];
  if(w){
    Game.state='busy';
    SFX.sel();
    await fadeOut();
    Game.enterMap(w.map, w.x, w.y);
    drawWorld();
    await fadeIn();
    Game.state='world';
    return;
  }
  /* wild encounters */
  const z = m.enc[MI(m,Game.x,Game.y)];
  if(z && Game.party.length && Game.party.some(p=>p.hp>0)){
    const table = ENCOUNTERS[z];
    if(Math.random() < table.rate){
      let r = Math.random() * table.slots.reduce((a,s)=>a+s.w,0);
      let slot = table.slots[0];
      for(const s of table.slots){ r-=s.w; if(r<=0){ slot=s; break; } }
      const lv = slot.lv[0] + Math.floor(Math.random()*(slot.lv[1]-slot.lv[0]+1));
      await runEncounter({wild:makeMon(slot.id, lv)});
    }
  }
}

async function runEncounter(opts){
  Game.state='battle';
  const res = await startBattle(opts);
  Game.state='world';
  if(res==='lose') await whiteout();
  return res;
}

async function whiteout(){
  Game.state='busy';
  await showText(`${Game.name} is out of usable POKéMON!\n${Game.name} blacked out!`);
  await fadeOut();
  Game.healAll();
  Game.enterMap('home',4,5,'down');
  drawWorld();
  await fadeIn();
  Game.state='world';
}

/* ---------------- drawing ---------------- */
function drawWorld(){
  const m = Game.map; if(!m) return;
  const ctx = CTX;
  const VW=240, VH=160;
  ctx.fillStyle='#101418';
  ctx.fillRect(0,0,VW,VH);

  const mapW = m.w*TILE, mapH = m.h*TILE;
  const px = Game.x*TILE + Game.ox, py = Game.y*TILE + Game.oy;
  let camX = Math.round(px - VW/2 + 8), camY = Math.round(py - VH/2 + 8);
  if(mapW<=VW) camX = -(VW-mapW)/2; else camX = Math.max(0, Math.min(mapW-VW, camX));
  if(mapH<=VH) camY = -(VH-mapH)/2; else camY = Math.max(0, Math.min(mapH-VH, camY));

  const frame = Math.floor(Game.tick/32)%2;
  const x0 = Math.floor(camX/TILE), y0 = Math.floor(camY/TILE);
  for(let ty=y0; ty<=y0+Math.ceil(VH/TILE); ty++){
    for(let tx=x0; tx<=x0+Math.ceil(VW/TILE); tx++){
      if(tx<0||ty<0||tx>=m.w||ty>=m.h) continue;
      drawTileTo(ctx, m.t[MI(m,tx,ty)], tx*TILE-camX, ty*TILE-camY, frame);
    }
  }

  /* entities sorted by y */
  const ents = [];
  for(const n of m.npcs) if(!isHidden(n)) ents.push({y:n.y*TILE, draw:()=>drawChar(ctx, n.x*TILE-camX, n.y*TILE-camY, PALETTES[n.pal], n.dir, 0)});
  for(const s of m.statics) if(!Game.flags[s.flag]) ents.push({y:s.y*TILE, draw:()=>drawMonSprite(ctx, s.x*TILE-camX, s.y*TILE-camY, s.pal, frame)});
  ents.push({y:py, draw:()=>drawChar(ctx, px-camX, py-camY, PALETTES.player, Game.dir, Game.moving?Game.walkFrame+Math.floor(Game.tick/8)%2:0)});
  ents.sort((a,b)=>a.y-b.y);
  ents.forEach(e=>e.draw());

  /* location banner */
  if(Game.tick - (Game.bannerTick||0) < 150 && m.name){
    ctx.fillStyle='rgba(248,248,240,.92)';
    ctx.fillRect(4,4,m.name.length*6+12,16);
    ctx.fillStyle='#383030';
    ctx.font='8px monospace';
    ctx.fillText(m.name, 10, 15);
  }
}

/* ---------------- interactions ---------------- */
async function interact(){
  const m = Game.map;
  const [fx,fy] = facing();

  /* NPCs */
  for(const n of m.npcs){
    if(isHidden(n) || n.x!==fx || n.y!==fy) continue;
    n.dir = {up:'down',down:'up',left:'right',right:'left'}[Game.dir];
    Game.state='busy';
    if(n.fn) await NPC_FN[n.fn](n);
    else await showText(`${n.name}: ${n.lines}`);
    Game.state='world';
    return;
  }
  /* static rare POKéMON */
  for(const s of m.statics){
    if(Game.flags[s.flag] || s.x!==fx || s.y!==fy) continue;
    Game.state='busy';
    await engageStatic(s);
    Game.state='world';
    return;
  }
  const t = mget(m,fx,fy);
  /* signs */
  if(t===T.SIGN){
    const txt = m.signs[`${fx},${fy}`];
    if(txt){ Game.state='busy'; await showText(txt); Game.state='world'; }
    return;
  }
  /* ground items */
  if(t===T.ITEM){
    const it = m.items.find(i=>i.x===fx&&i.y===fy);
    if(it && !Game.flags[it.flag]){
      Game.state='busy';
      Game.flags[it.flag]=true;
      mset(m,fx,fy, m.outdoor?T.GRASS:T.CAVE_FLOOR);
      Game.addItem(it.item, it.qty);
      SFX.catchOk();
      await showText(`${Game.name} found ${ITEMS[it.item].n}${it.qty>1?' x'+it.qty:''}!`);
      Game.state='world';
    }
    return;
  }
  /* starter table */
  if(t===T.BALLTABLE && m.id==='lab'){
    Game.state='busy';
    await starterTable(fx);
    Game.state='world';
    return;
  }
  if(t===T.WATER){
    Game.state='busy';
    await showText('The water is a deep, clear blue...');
    Game.state='world';
  }
  if(t===T.BED && m.id==='home'){
    Game.state='busy';
    await showText('Your bed looks comfy. A quick rest healed your POKéMON!');
    Game.healAll(); SFX.heal();
    Game.state='world';
  }
}

async function engageStatic(s){
  if(!Game.party.length){
    await showText("It's a wild POKéMON! Without your own POKéMON,\nyou must not disturb it!");
    return;
  }
  if(!Game.party.some(p=>p.hp>0)){ await whiteout(); return; }
  await showText(s.lines);
  const res = await runEncounter({wild:makeMon(s.id, s.lv)});
  if(res==='caught' || res==='win'){
    Game.flags[s.flag]=true;
    if(res==='win') await showText(`The ${SPECIES[s.id].name} fled into the wild...`);
  }
}

/* ---------------- scripted NPCs ---------------- */
const NPC_FN = {
  async mom(){
    await showText("MOM: Oh, sweetie! Off on an adventure?\nLet me rest your POKéMON first.");
    if(Game.party.length){ SFX.heal(); Game.healAll(); await showText('MOM: There! All rested and ready.\nDon\'t forget to SAVE with the START menu!'); }
    else await showText('MOM: PROF. OAK was looking for you!\nHis lab is just south, past the crossing.');
  },
  async sister(){
    if(!Game.flags.sisterGift && Game.flags.starter){
      Game.flags.sisterGift=true;
      Game.addItem('POKEBALL',5); Game.addItem('POTION',3);
      SFX.catchOk();
      await showText("DAISY: My brother ran off so fast he forgot these.\nYou take them! Got 5 POKé BALLS and 3 POTIONS!");
    } else if(!Game.flags.starter){
      await showText("DAISY: My brother is at PROF. OAK's lab.\nHe couldn't stop talking about POKéMON all morning!");
    } else {
      await showText('DAISY: Rare POKéMON hide where nobody thinks to look.\nMy brother never listens to that advice.');
    }
  },
  async oak(){
    if(!Game.flags.starter){
      await showText("OAK: Welcome! It's finally time.\nOn that table sit three POKé BALLS — go on, pick your very first POKéMON!");
    } else {
      await showText('OAK: How is the POKéDEX coming along?\nLegends speak of THREE phantom POKéMON in this region... a song in the woods, a shadow in the cave, a light on the lake.');
    }
  },
  async rival(){
    if(!Game.flags.starter) await showText(`${Game.rivalName}: Heh, I'm picking the strongest one.\nHurry up and choose, slowpoke!`);
  },
};

const STARTER_BY_X = {4:1, 5:4, 6:7};
const RIVAL_COUNTER = {1:4, 4:7, 7:1};

async function starterTable(x){
  if(Game.flags.starter){
    await showText('The remaining POKéMON must stay with PROF. OAK.');
    return;
  }
  const id = STARTER_BY_X[x];
  if(!id) return;
  const sp = SPECIES[id];
  await showText(`It's ${sp.name}, the ${sp.types[0]}-type POKéMON!`);
  await showText(`Take ${sp.name} as your partner?`);
  if(!(await askYesNo())){ await showText('OAK: Take your time. It\'s a big choice!'); return; }

  const mon = makeMon(id,5);
  Game.party.push(mon);
  Game.markCaught(id);
  Game.flags.starter = id;
  SFX.catchOk();
  await showText(`${Game.name} received ${sp.name}!`);
  Game.addItem('POKEBALL',5); Game.addItem('POTION',2);
  await showText('OAK: Splendid choice! Take these 5 POKé BALLS and 2 POTIONS too.\nEvery journey begins with a choice... and yours begins now!');

  /* rival ambush */
  const rid = RIVAL_COUNTER[id];
  await showText(`${Game.rivalName}: Then I'll take ${SPECIES[rid].name} — it beats yours!\nLet's see what you've got, right here, right now!`);
  /* scripted battle: no whiteout on loss — OAK patches you up */
  Game.state='battle';
  const res = await startBattle({trainer:{name:Game.rivalName, party:[makeMon(rid,5)]}});
  Game.state='busy';
  Game.flags.rivalGone = true;
  if(res==='win'){
    await showText(`${Game.rivalName}: WHAT?! I picked the wrong one...\nSmell ya later!`);
  } else {
    Game.healAll();
    await showText(`${Game.rivalName}: Heh, told you! Train harder!\nOAK healed your POKéMON back to full.`);
  }
  await showText('OAK: Ho ho! What energy.\nNow go — the tall grass north of town is full of POKéMON. Fill that POKéDEX!');
}

/* ---------------- START menu ---------------- */
async function openMenu(){
  Game.state='busy';
  SFX.sel();
  while(true){
    const pick = await showMenu(['POKéDEX','POKéMON','BAG','SAVE','EXIT'], {top:'10px', right:'8px', bottom:'auto', width:'170px'});
    if(pick===0) await dexPanel();
    else if(pick===1) await partyPanel();
    else if(pick===2) await bagPanel();
    else if(pick===3){
      saveGame();
      SFX.catchOk();
      await showText(`${Game.name} saved the game!`);
    }
    else break;
  }
  Game.state='world';
}

/* ----- party panel (overworld) ----- */
function partyRows(panel){
  return Game.party.map(m=>{
    const r=document.createElement('div');
    r.className='party-row';
    const pct = m.hp/m.stats.hp;
    r.innerHTML = `<img alt=""><div class="pr-main">
      <div class="pr-name"><span>${SPECIES[m.id].name}</span><span class="${m.hp===0?'faint':''}">${m.hp===0?'FNT':'Lv'+m.lv}</span></div>
      <div class="hp-outer"><div class="hp-fill" style="width:${pct*100}%;background:${hpPercentColor(pct)}"></div></div>
      <div class="pr-hp">${m.hp}/${m.stats.hp}${m.status?' '+m.status:''}</div></div>`;
    setMonSprite(r.querySelector('img'), m.id, false);
    panel.appendChild(r);
    return r;
  });
}
function pickFromParty(title){
  return new Promise(resolve=>{
    if(!Game.party.length){ resolve(-1); return; }
    const panel=document.createElement('div');
    panel.className='full-panel';
    panel.innerHTML=`<h3>${title}</h3>`;
    UIL().appendChild(panel);
    const rows = partyRows(panel);
    let sel=0; rows[0].classList.add('sel');
    const paint=()=>rows.forEach((r,i)=>r.classList.toggle('sel',i===sel));
    const ctx=Input.push({onKey:k=>{
      if(k==='up'){ sel=(sel+rows.length-1)%rows.length; SFX.blip(); paint(); }
      else if(k==='down'){ sel=(sel+1)%rows.length; SFX.blip(); paint(); }
      else if(k==='a'){ SFX.sel(); Input.pop(ctx); panel.remove(); resolve(sel); }
      else if(k==='b'){ SFX.blip(); Input.pop(ctx); panel.remove(); resolve(-1); }
    }});
  });
}
async function partyPanel(){
  while(true){
    const idx = await pickFromParty('POKéMON');
    if(idx<0) return;
    const act = await showMenu(['SUMMARY','SWITCH','CANCEL'], {bottom:'12px', right:'12px'});
    if(act===0) await summaryPanel(Game.party[idx]);
    else if(act===1){
      const j = await pickFromParty('Switch with which POKéMON?');
      if(j>=0 && j!==idx) [Game.party[idx],Game.party[j]]=[Game.party[j],Game.party[idx]];
    }
  }
}
function summaryPanel(m){
  return new Promise(resolve=>{
    const sp=SPECIES[m.id];
    const card=document.createElement('div');
    card.className='win summary-card';
    const lo=expForLevel(m.lv), hi=expForLevel(m.lv+1);
    card.innerHTML=`<img alt="">
      <div class="big">${sp.name} <small>Lv${m.lv}</small></div>
      <div>${sp.types.join(' / ')}${m.status?' — '+m.status:''}</div>
      <div>HP ${m.hp}/${m.stats.hp} &nbsp; EXP ${m.exp} (next: ${hi-m.exp})</div>
      <div>ATK ${m.stats.atk} &nbsp; DEF ${m.stats.def}</div>
      <div>SPC ${m.stats.spc} &nbsp; SPE ${m.stats.spe}</div>
      ${m.moves.map(s=>`<div class="mv"><span>${MOVES[s.id].n}</span><span>${s.pp}/${MOVES[s.id].pp} PP</span></div>`).join('')}`;
    setMonSprite(card.querySelector('img'), m.id, false);
    UIL().appendChild(card);
    const ctx=Input.push({onKey:k=>{
      if(k==='a'||k==='b'){ SFX.blip(); Input.pop(ctx); card.remove(); resolve(); }
    }});
  });
}

/* ----- bag ----- */
async function bagPanel(){
  while(true){
    const entries = Object.entries(Game.bag);
    if(!entries.length){ await showText('The BAG is empty.'); return; }
    const pick = await showMenu(entries.map(([k,q])=>`${ITEMS[k].n} x${q}`).concat(['CLOSE BAG']),
      {top:'10px', right:'8px', bottom:'auto', width:'250px'});
    if(pick<0 || pick===entries.length) return;
    const key = entries[pick][0], item=ITEMS[key];
    await showText(item.desc);
    if(item.kind==='ball'){ await showText('Best used during a wild battle!'); continue; }
    const idx = await pickFromParty('Use on which POKéMON?');
    if(idx<0) continue;
    const m = Game.party[idx];
    if(item.kind==='heal'){
      if(m.hp===0 || m.hp===m.stats.hp){ await showText("It won't have any effect."); continue; }
      m.hp = Math.min(m.stats.hp, m.hp+item.amt);
      SFX.heal(); Game.takeItem(key);
      await showText(`${SPECIES[m.id].name}'s HP was restored!`);
    } else if(item.kind==='cure'){
      if(!m.status){ await showText("It won't have any effect."); continue; }
      m.status=null; m.sleepTurns=0;
      SFX.heal(); Game.takeItem(key);
      await showText(`${SPECIES[m.id].name} became healthy!`);
    } else if(item.kind==='candy'){
      if(m.lv>=100){ await showText("It won't have any effect."); continue; }
      Game.takeItem(key);
      await levelUpOutside(m);
    }
  }
}

async function levelUpOutside(m){
  m.lv++; m.exp = Math.max(m.exp, expForLevel(m.lv));
  const old=m.stats;
  m.stats=calcStats(m.id,m.lv);
  m.hp=Math.min(m.stats.hp, m.hp+(m.stats.hp-old.hp));
  SFX.lvl();
  await showText(`${SPECIES[m.id].name} grew to Lv${m.lv}!`);
  for(const [l,mid] of SPECIES[m.id].learn){
    if(l===m.lv && !m.moves.some(s=>s.id===mid)){
      if(m.moves.length<4){
        m.moves.push({id:mid,pp:MOVES[mid].pp});
        await showText(`${SPECIES[m.id].name} learned ${MOVES[mid].n}!`);
      } else {
        await showText(`${SPECIES[m.id].name} wants to learn ${MOVES[mid].n}!\nForget an old move?`);
        const pick = await showMenu([...m.moves.map(s=>MOVES[s.id].n),'GIVE UP'], {bottom:'100px', right:'8px'});
        if(pick>=0&&pick<4){
          m.moves[pick]={id:mid,pp:MOVES[mid].pp};
          await showText(`${SPECIES[m.id].name} learned ${MOVES[mid].n}!`);
        }
      }
    }
  }
  const evo = SPECIES[m.id].evo;
  if(evo && m.lv>=evo.lv){
    const oldName = SPECIES[m.id].name;
    await showText(`What? ${oldName} is evolving!`);
    const pct=m.hp/m.stats.hp;
    m.id=evo.to;
    m.stats=calcStats(m.id,m.lv);
    m.hp=Math.max(1,Math.round(m.stats.hp*pct));
    Game.markCaught(m.id);
    SFX.catchOk();
    await showText(`${oldName} evolved into ${SPECIES[m.id].name}!`);
  }
}

/* ----- pokédex ----- */
function dexPanel(){
  return new Promise(resolve=>{
    const ids = Object.keys(SPECIES).map(Number).sort((a,b)=>a-b);
    const panel=document.createElement('div');
    panel.className='full-panel';
    panel.style.overflow='hidden';
    panel.innerHTML=`<h3>MAGENTA POKéDEX — seen ${Game.seen.size} / caught ${Game.caught.size}</h3><div id="dexlist"></div>`;
    UIL().appendChild(panel);
    const list=panel.querySelector('#dexlist');
    let sel=0;
    const VISIBLE=9;
    const paint=()=>{
      list.innerHTML='';
      const start=Math.max(0, Math.min(sel-4, ids.length-VISIBLE));
      ids.slice(start,start+VISIBLE).forEach((id,i)=>{
        const seen = Game.seen.has(id);
        const r=document.createElement('div');
        r.className='dex-row'+(start+i===sel?' sel':'');
        r.innerHTML=`<span class="dno">No.${String(id).padStart(3,'0')}</span>
          ${Game.caught.has(id)?'<span class="ball-mini"></span>':'<span class="nope"></span>'}
          <span>${seen?SPECIES[id].name:'-----'}</span>`;
        list.appendChild(r);
      });
    };
    paint();
    const ctx=Input.push({onKey:k=>{
      if(k==='up'){ sel=Math.max(0,sel-1); SFX.blip(); paint(); }
      else if(k==='down'){ sel=Math.min(ids.length-1,sel+1); SFX.blip(); paint(); }
      else if(k==='a'||k==='b'){ SFX.blip(); Input.pop(ctx); panel.remove(); resolve(); }
    }});
  });
}

/* ---------------- save / load ---------------- */
const SAVE_KEY='magenta_save_v1';
function saveGame(){
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    name:Game.name, map:Game.map.id, x:Game.x, y:Game.y, dir:Game.dir,
    party:Game.party, pc:Game.pc, bag:Game.bag, flags:Game.flags,
    seen:[...Game.seen], caught:[...Game.caught],
  }));
}
function loadGame(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return false;
  try{
    const s = JSON.parse(raw);
    Game.name=s.name; Game.party=s.party; Game.pc=s.pc||[];
    Game.bag=s.bag; Game.flags=s.flags;
    Game.seen=new Set(s.seen); Game.caught=new Set(s.caught);
    /* re-remove collected ground items */
    for(const m of Object.values(MAPS))
      for(const it of m.items)
        if(Game.flags[it.flag]) mset(m,it.x,it.y, m.outdoor?T.GRASS:T.CAVE_FLOOR);
    Game.enterMap(s.map, s.x, s.y, s.dir);
    return true;
  }catch(e){ console.error('bad save',e); return false; }
}

/* ---------------- world input context ---------------- */
function pushWorldCtx(){
  Game.worldCtx = Input.push({onKey:k=>{
    if(Game.state!=='world' || Game.moving) return;
    if(k==='a') interact();
    else if(k==='start') openMenu();
    else if(k==='b'){ /* quick party peek */ }
  }});
}
