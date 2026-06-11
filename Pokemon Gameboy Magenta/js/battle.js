/* ============ battle.js — FRLG-style battle engine ============ */

const Battle = { el:null, allyImg:null, enemyImg:null, textEl:null, running:false };

function stageMult(s){ return s>=0 ? (2+s)/2 : 2/(2-s); }

function combatant(mon){ return { mon, stages:{atk:0,def:0,spc:0,spe:0} }; }
function effStat(cb, key){
  let v = cb.mon.stats[key] * stageMult(cb.stages[key]);
  if(key==='spe' && cb.mon.status==='PAR') v *= .25;
  return Math.max(1, Math.floor(v));
}

function calcDamage(att, def, mv){
  if(mv.fx && mv.fx.fixed) return {dmg:mv.fx.fixed, eff:1, crit:1};
  if(!mv.p) return {dmg:0, eff:1, crit:1};
  const special = SPECIAL_TYPES.has(mv.t);
  const a = effStat(att, special?'spc':'atk');
  const d = effStat(def, special?'spc':'def');
  const L = att.mon.lv;
  let dmg = Math.floor(Math.floor(Math.floor(2*L/5+2)*mv.p*a/d)/50)+2;
  const stab = SPECIES[att.mon.id].types.includes(mv.t) ? 1.5 : 1;
  const eff = effectiveness(mv.t, SPECIES[def.mon.id].types);
  const crit = Math.random() < ((mv.fx&&mv.fx.crit)?0.125:0.0625) ? 2 : 1;
  dmg = Math.floor(dmg * stab * eff * crit * (0.85 + Math.random()*0.15));
  if(eff>0) dmg = Math.max(1,dmg);
  return {dmg, eff, crit};
}

/* ---------- battle text (auto-advancing) ---------- */
function bmsg(text, wait){
  return new Promise(resolve=>{
    const el = Battle.textEl;
    el.textContent='';
    let ci=0;
    const timer = setInterval(()=>{
      ci+=2;
      if(ci>=text.length){
        el.textContent=text; clearInterval(timer);
        if(wait){
          const ctx = Input.push({onKey:k=>{ if(k==='a'||k==='b'){ Input.pop(ctx); resolve(); } }});
        } else setTimeout(resolve, 550);
      } else el.textContent = text.slice(0,ci);
    },14);
  });
}

/* ---------- grid menu (2-col) ---------- */
function gridMenu(el, items, opts={}){
  return new Promise(resolve=>{
    el.classList.remove('hidden');
    el.innerHTML='';
    const rows = items.map((it,i)=>{
      const d=document.createElement('div');
      d.className='mi'+(i===0?' sel':'');
      d.textContent=it;
      el.appendChild(d);
      return d;
    });
    let sel=0;
    const cols=2, n=items.length;
    const paint=()=>{ rows.forEach((r,i)=>r.classList.toggle('sel',i===sel)); if(opts.onMove) opts.onMove(sel); };
    if(opts.onMove) opts.onMove(0);
    const ctx = Input.push({onKey:k=>{
      let s=sel;
      if(k==='left') s = sel-1>=0 && sel%cols!==0 ? sel-1 : sel;
      else if(k==='right') s = sel+1<n && sel%cols!==cols-1 ? sel+1 : sel;
      else if(k==='up') s = sel-cols>=0 ? sel-cols : sel;
      else if(k==='down') s = sel+cols<n ? sel+cols : sel;
      else if(k==='a'){ SFX.sel(); Input.pop(ctx); el.classList.add('hidden'); resolve(sel); return; }
      else if(k==='b' && opts.canCancel!==false){ SFX.blip(); Input.pop(ctx); el.classList.add('hidden'); resolve(-1); return; }
      if(s!==sel){ sel=s; SFX.blip(); paint(); }
    }});
  });
}

/* ---------- info boxes ---------- */
function infoBox(side, mon){
  const div = document.createElement('div');
  div.className = 'b-info '+side;
  div.innerHTML = `
    <div class="n"><span class="nm"></span><span class="lv"></span></div>
    <div class="hp-row"><span class="tag">HP</span><div class="hp-outer"><div class="hp-fill"></div></div></div>
    ${side==='ally' ? '<div class="hp-num"></div><div class="exp-outer"><div class="exp-fill"></div></div>' : ''}`;
  Battle.el.appendChild(div);
  return div;
}
function refreshInfo(div, mon, animFromPct){
  div.querySelector('.nm').innerHTML = SPECIES[mon.id].name +
    (mon.status?` <span class="st-badge ${mon.status.toLowerCase()}">${mon.status}</span>`:'');
  div.querySelector('.lv').textContent = 'Lv'+mon.lv;
  const pct = Math.max(0, mon.hp/mon.stats.hp);
  const fill = div.querySelector('.hp-fill');
  fill.style.width = (pct*100)+'%';
  fill.style.background = hpPercentColor(pct);
  const num = div.querySelector('.hp-num');
  if(num) num.textContent = `${mon.hp}/${mon.stats.hp}`;
  const exp = div.querySelector('.exp-fill');
  if(exp){
    const lo = expForLevel(mon.lv), hi = expForLevel(mon.lv+1);
    exp.style.width = Math.min(100, Math.max(0,(mon.exp-lo)/(hi-lo)*100))+'%';
  }
}
async function animateHP(div, mon, from, to){
  const steps = 22;
  for(let i=1;i<=steps;i++){
    mon.hp = Math.round(from + (to-from)*i/steps);
    refreshInfo(div, mon);
    await sleep(18);
  }
  mon.hp = to;
  refreshInfo(div, mon);
}

/* ============ main battle ============ */
async function startBattle(opts){
  Battle.running = true;
  const result = await runBattle(opts);
  Battle.running = false;
  return result;
}

async function runBattle(opts){
  const el = Battle.el = document.getElementById('battle');
  el.innerHTML=''; el.classList.remove('hidden');
  SFX.encounter();

  const isTrainer = !!opts.trainer;
  let enemyParty = isTrainer ? opts.trainer.party : [opts.wild];
  let eIdx = 0;
  let enemy = combatant(enemyParty[0]);
  let aIdx = Game.party.findIndex(m=>m.hp>0);
  let ally = combatant(Game.party[aIdx]);
  Game.markSeen(enemy.mon.id);

  /* scenery */
  el.insertAdjacentHTML('beforeend',
    `<div class="b-plat enemy"></div><div class="b-plat ally"></div>`);
  const eImg = document.createElement('img'); eImg.className='b-spr enemy';
  const aImg = document.createElement('img'); aImg.className='b-spr ally';
  setMonSprite(eImg, enemy.mon.id, false);
  setMonSprite(aImg, ally.mon.id, true);
  el.appendChild(eImg); el.appendChild(aImg);
  const eInfo = infoBox('enemy', enemy.mon);
  const aInfo = infoBox('ally', ally.mon);
  refreshInfo(eInfo, enemy.mon); refreshInfo(aInfo, ally.mon);

  const textEl = document.createElement('div');
  textEl.id='b-text'; el.appendChild(textEl); Battle.textEl=textEl;
  const menuEl = document.createElement('div');
  menuEl.id='b-menu'; menuEl.className='win hidden'; el.appendChild(menuEl);
  const movesEl = document.createElement('div');
  movesEl.id='b-moves'; movesEl.className='win hidden'; el.appendChild(movesEl);
  const mvInfoEl = document.createElement('div');
  mvInfoEl.id='b-mvinfo'; mvInfoEl.className='win hidden'; el.appendChild(mvInfoEl);

  const pendingEvos = [];
  let runAttempts = 0;

  const swapAllySprite = ()=>{ setMonSprite(aImg, ally.mon.id, true); aImg.classList.remove('faintdrop'); refreshInfo(aInfo, ally.mon); };
  const swapEnemySprite = ()=>{ setMonSprite(eImg, enemy.mon.id, false); eImg.classList.remove('faintdrop'); refreshInfo(eInfo, enemy.mon); };

  if(isTrainer) await bmsg(`${opts.trainer.name} wants to battle!`, true);
  else await bmsg(`Wild ${SPECIES[enemy.mon.id].name} appeared!`, true);
  await bmsg(`Go! ${SPECIES[ally.mon.id].name}!`);

  /* ---------- helpers ---------- */
  const aliveParty = ()=>Game.party.filter(m=>m.hp>0);

  async function applyMove(att, def, mvSlot, attName, defName, attImg, defImg, defInfo, attInfo){
    const mv = MOVES[mvSlot.id];

    /* status gates */
    if(att.mon.status==='SLP'){
      if(att.mon.sleepTurns>0){
        att.mon.sleepTurns--;
        await bmsg(`${attName} is fast asleep.`);
        return;
      }
      att.mon.status=null;
      refreshInfo(attInfo, att.mon);
      await bmsg(`${attName} woke up!`);
    }
    if(att.mon.status==='PAR' && Math.random()<.25){
      await bmsg(`${attName} is fully paralyzed!`);
      return;
    }

    mvSlot.pp = Math.max(0, mvSlot.pp-1);
    await bmsg(`${attName} used ${mv.n}!`);

    if(mv.fx && mv.fx.splash){ await bmsg('But nothing happened!'); return; }

    /* accuracy */
    if(mv.acc<999 && Math.random()*100 >= mv.acc){
      await bmsg(`${attName}'s attack missed!`);
      return;
    }

    /* pure status moves */
    if(!mv.p && !(mv.fx&&mv.fx.fixed)){
      const fx = mv.fx||{};
      if(fx.stat){
        const target = fx.who==='self' ? att : def;
        const tName = fx.who==='self' ? attName : defName;
        const cur = target.stages[fx.stat];
        const next = Math.max(-6, Math.min(6, cur+fx.d));
        if(next===cur){ await bmsg('But it failed!'); return; }
        target.stages[fx.stat]=next;
        const statName = {atk:'ATTACK',def:'DEFENSE',spc:'SPECIAL',spe:'SPEED'}[fx.stat];
        await bmsg(`${tName}'s ${statName} ${fx.d>0?'rose':'fell'}${Math.abs(fx.d)>1?' sharply':''}!`);
      } else if(fx.status){
        if(def.mon.status){ await bmsg('But it failed!'); return; }
        def.mon.status = fx.status;
        if(fx.status==='SLP') def.mon.sleepTurns = 1+Math.floor(Math.random()*3);
        refreshInfo(defInfo, def.mon);
        await bmsg(`${defName} ${fx.status==='SLP'?'fell asleep!':fx.status==='PAR'?'is paralyzed!':'was poisoned!'}`);
      } else if(fx.heal){
        const heal = Math.floor(att.mon.stats.hp*fx.heal);
        const to = Math.min(att.mon.stats.hp, att.mon.hp+heal);
        if(to===att.mon.hp){ await bmsg('But it failed!'); return; }
        SFX.heal();
        await animateHP(attInfo, att.mon, att.mon.hp, to);
        await bmsg(`${attName} regained health!`);
      }
      return;
    }

    /* damage */
    const {dmg, eff, crit} = calcDamage(att, def, mv);
    if(eff===0){ await bmsg(`It doesn't affect ${defName}...`); return; }
    defImg.classList.remove('hit'); void defImg.offsetWidth; defImg.classList.add('hit');
    eff>1 ? SFX.superHit() : SFX.hit();
    const from = def.mon.hp;
    const to = Math.max(0, def.mon.hp - dmg);
    await animateHP(defInfo, def.mon, from, to);
    if(crit>1) await bmsg('A critical hit!');
    if(eff>1) await bmsg("It's super effective!");
    if(eff<1) await bmsg("It's not very effective...");
    if(mv.fx && mv.fx.drain && to<from){
      const heal = Math.max(1, Math.floor((from-to)*mv.fx.drain));
      const aTo = Math.min(att.mon.stats.hp, att.mon.hp+heal);
      if(aTo>att.mon.hp){ await animateHP(attInfo, att.mon, att.mon.hp, aTo); await bmsg(`${defName} had its energy drained!`); }
    }
    if(mv.fx && mv.fx.status && !def.mon.status && def.mon.hp>0 && Math.random()<(mv.fx.chance||1)){
      def.mon.status = mv.fx.status;
      if(mv.fx.status==='SLP') def.mon.sleepTurns=1+Math.floor(Math.random()*3);
      refreshInfo(defInfo, def.mon);
      await bmsg(`${defName} ${mv.fx.status==='PAR'?'is paralyzed!':'was poisoned!'}`);
    }
  }

  async function poisonTick(cb, name, info){
    if(cb.mon.status==='PSN' && cb.mon.hp>0){
      const to = Math.max(0, cb.mon.hp - Math.max(1,Math.floor(cb.mon.stats.hp/16)));
      await animateHP(info, cb.mon, cb.mon.hp, to);
      await bmsg(`${name} is hurt by poison!`);
    }
  }

  async function gainExpAndLevel(mon, info){
    const gained = Math.max(1, Math.floor(baseExpYield(enemy.mon.id)*enemy.mon.lv/7 * (isTrainer?1.5:1)));
    await bmsg(`${SPECIES[mon.id].name} gained ${gained} EXP. Points!`);
    mon.exp += gained;
    refreshInfo(info, mon);
    while(mon.lv<100 && mon.exp >= expForLevel(mon.lv+1)){
      mon.lv++;
      const old = mon.stats;
      mon.stats = calcStats(mon.id, mon.lv);
      mon.hp = Math.min(mon.stats.hp, mon.hp + (mon.stats.hp-old.hp));
      SFX.lvl();
      refreshInfo(info, mon);
      await bmsg(`${SPECIES[mon.id].name} grew to Lv${mon.lv}!`, true);
      /* learn moves */
      for(const [l,mid] of SPECIES[mon.id].learn){
        if(l===mon.lv && !mon.moves.some(s=>s.id===mid)){
          if(mon.moves.length<4){
            mon.moves.push({id:mid, pp:MOVES[mid].pp});
            await bmsg(`${SPECIES[mon.id].name} learned ${MOVES[mid].n}!`, true);
          } else {
            await bmsg(`${SPECIES[mon.id].name} wants to learn ${MOVES[mid].n}!`, true);
            await bmsg(`Forget an old move to make room?`, true);
            const pick = await showMenu(
              [...mon.moves.map(s=>MOVES[s.id].n), 'GIVE UP'],
              {host:Battle.el, bottom:'100px', right:'8px'});
            if(pick>=0 && pick<4){
              const oldMv = MOVES[mon.moves[pick].id].n;
              mon.moves[pick] = {id:mid, pp:MOVES[mid].pp};
              await bmsg(`1, 2 and... poof! ${SPECIES[mon.id].name} forgot ${oldMv} and learned ${MOVES[mid].n}!`, true);
            } else {
              await bmsg(`${SPECIES[mon.id].name} did not learn ${MOVES[mid].n}.`);
            }
          }
        }
      }
      const evo = SPECIES[mon.id].evo;
      if(evo && mon.lv>=evo.lv && !pendingEvos.includes(mon)) pendingEvos.push(mon);
    }
  }

  async function handleEvolutions(){
    for(const mon of pendingEvos){
      const evo = SPECIES[mon.id].evo;
      if(!evo || mon.lv<evo.lv) continue;
      const oldName = SPECIES[mon.id].name;
      await bmsg(`What? ${oldName} is evolving!`, true);
      const hpPct = mon.hp/mon.stats.hp;
      mon.id = evo.to;
      mon.stats = calcStats(mon.id, mon.lv);
      mon.hp = Math.max(1, Math.round(mon.stats.hp*hpPct));
      Game.markCaught(mon.id);
      SFX.catchOk();
      if(ally.mon===mon) swapAllySprite();
      await bmsg(`Congratulations! Your ${oldName} evolved into ${SPECIES[mon.id].name}!`, true);
    }
    pendingEvos.length=0;
  }

  async function enemyFaints(){
    SFX.faint();
    eImg.classList.add('faintdrop');
    await bmsg(`${isTrainer?'Foe ':'Wild '}${SPECIES[enemy.mon.id].name} fainted!`, true);
    await gainExpAndLevel(ally.mon, aInfo);
    if(isTrainer && eIdx+1<enemyParty.length){
      eIdx++;
      enemy = combatant(enemyParty[eIdx]);
      Game.markSeen(enemy.mon.id);
      swapEnemySprite();
      await bmsg(`${opts.trainer.name} sent out ${SPECIES[enemy.mon.id].name}!`);
      return false;
    }
    return true;
  }

  async function allyFaints(){
    SFX.faint();
    aImg.classList.add('faintdrop');
    await bmsg(`${SPECIES[ally.mon.id].name} fainted!`, true);
    const alive = aliveParty();
    if(alive.length===0) return true;
    /* forced switch */
    while(true){
      const idx = await battlePartyPick('Choose next POKéMON.', false);
      if(idx>=0 && Game.party[idx].hp>0){
        ally = combatant(Game.party[idx]);
        swapAllySprite();
        await bmsg(`Go! ${SPECIES[ally.mon.id].name}!`);
        return false;
      }
    }
  }

  /* party picker rendered over the battle */
  function battlePartyPick(prompt, canCancel=true){
    return new Promise(async resolve=>{
      const panel = document.createElement('div');
      panel.className='full-panel';
      panel.innerHTML = `<h3>${prompt}</h3>`;
      Battle.el.appendChild(panel);
      const rows = Game.party.map((m,i)=>{
        const r=document.createElement('div');
        r.className='party-row'+(i===0?' sel':'');
        const pct = m.hp/m.stats.hp;
        r.innerHTML = `<img alt=""><div class="pr-main">
          <div class="pr-name"><span>${SPECIES[m.id].name}</span><span class="${m.hp===0?'faint':''}">${m.hp===0?'FNT':'Lv'+m.lv}</span></div>
          <div class="hp-outer"><div class="hp-fill" style="width:${pct*100}%;background:${hpPercentColor(pct)}"></div></div>
          <div class="pr-hp">${m.hp}/${m.stats.hp}</div></div>`;
        setMonSprite(r.querySelector('img'), m.id, false);
        panel.appendChild(r);
        return r;
      });
      let sel=0;
      const paint=()=>rows.forEach((r,i)=>r.classList.toggle('sel',i===sel));
      const ctx = Input.push({onKey:k=>{
        if(k==='up'){ sel=(sel+Game.party.length-1)%Game.party.length; SFX.blip(); paint(); }
        else if(k==='down'){ sel=(sel+1)%Game.party.length; SFX.blip(); paint(); }
        else if(k==='a'){ SFX.sel(); Input.pop(ctx); panel.remove(); resolve(sel); }
        else if(k==='b' && canCancel){ SFX.blip(); Input.pop(ctx); panel.remove(); resolve(-1); }
      }});
    });
  }

  async function throwBall(itemKey){
    const item = ITEMS[itemKey];
    Game.takeItem(itemKey,1);
    await bmsg(`${Game.name} used ${item.n}!`);
    const ball = document.createElement('div');
    ball.className='ball-fx toss';
    ball.style.right='95px'; ball.style.top='60px';
    Battle.el.appendChild(ball);
    SFX.ball();
    await sleep(600);
    eImg.style.visibility='hidden';
    const mon = enemy.mon;
    const maxHp = mon.stats.hp;
    const statusBonus = mon.status==='SLP'?2 : mon.status?1.5 : 1;
    const a = Math.min(255, (3*maxHp-2*mon.hp) * SPECIES[mon.id].cr * item.mult * statusBonus / (3*maxHp));
    const caught = Math.random()*255 < a;
    const shakes = caught ? 3 : Math.min(2, Math.floor((a/255)*3*Math.random()+ (a>80?1:0)));
    for(let i=0;i<shakes;i++){
      ball.classList.remove('shake'); void ball.offsetWidth; ball.classList.add('shake');
      SFX.ball();
      await sleep(850);
    }
    if(caught){
      SFX.catchOk();
      await bmsg(`Gotcha! ${SPECIES[mon.id].name} was caught!`, true);
      Game.markCaught(mon.id);
      mon.status = mon.status==='PSN'||mon.status==='PAR' ? mon.status : null;
      if(Game.party.length<6){
        Game.party.push(mon);
        await bmsg(`${SPECIES[mon.id].name} was added to your party!`, true);
      } else {
        await bmsg(`${SPECIES[mon.id].name} was sent to the PC. (Party is full!)`, true);
        Game.pc.push(mon);
      }
      ball.remove();
      return true;
    }
    ball.classList.remove('shake'); void ball.offsetWidth; ball.classList.add('burst');
    await sleep(320);
    ball.remove();
    eImg.style.visibility='visible';
    await bmsg(shakes>=2 ? 'Shoot! It was so close, too!' : `Oh no! The POKéMON broke free!`);
    return false;
  }

  async function battleBag(){
    const usable = Object.entries(Game.bag).filter(([k,q])=>q>0);
    if(!usable.length){ await bmsg('The BAG is empty!'); return null; }
    const pick = await showMenu(
      usable.map(([k,q])=>`${ITEMS[k].n} x${q}`),
      {host:Battle.el, bottom:'100px', right:'8px', width:'230px'});
    if(pick<0) return null;
    const key = usable[pick][0];
    const item = ITEMS[key];
    if(item.kind==='ball'){
      if(isTrainer){ await bmsg("You can't catch a trainer's POKéMON!"); return null; }
      return {type:'ball', key};
    }
    if(item.kind==='heal' || item.kind==='cure'){
      const idx = await battlePartyPick('Use on which POKéMON?');
      if(idx<0) return null;
      const target = Game.party[idx];
      if(target.hp===0){ await bmsg("It won't have any effect."); return null; }
      return {type:'heal', key, idx};
    }
    if(item.kind==='candy'){ await bmsg("Not now — save it for the overworld!"); return null; }
    return null;
  }

  /* ---------- main loop ---------- */
  while(true){
    refreshInfo(eInfo, enemy.mon); refreshInfo(aInfo, ally.mon);
    textEl.textContent = `What will\n${SPECIES[ally.mon.id].name} do?`;
    const choice = await gridMenu(menuEl, ['FIGHT','BAG','POKéMON','RUN'], {canCancel:false});

    let playerAction = null;
    if(choice===0){
      const labels = ally.mon.moves.map(s=>MOVES[s.id].n);
      const mi = await gridMenu(movesEl, labels, {onMove:i=>{
        const s = ally.mon.moves[i];
        mvInfoEl.classList.remove('hidden');
        mvInfoEl.innerHTML = `PP ${s.pp}/${MOVES[s.id].pp}<br><span class="tp">${MOVES[s.id].t}</span>`;
      }});
      mvInfoEl.classList.add('hidden');
      if(mi<0) continue;
      if(ally.mon.moves[mi].pp<=0){ await bmsg('There is no PP left for this move!'); continue; }
      playerAction = {type:'move', slot:ally.mon.moves[mi]};
    }
    else if(choice===1){
      const act = await battleBag();
      if(!act) continue;
      playerAction = act;
    }
    else if(choice===2){
      const idx = await battlePartyPick('Switch to which POKéMON?');
      if(idx<0) continue;
      if(Game.party[idx]===ally.mon){ await bmsg(`${SPECIES[ally.mon.id].name} is already out!`); continue; }
      if(Game.party[idx].hp===0){ await bmsg("It has no energy left to battle!"); continue; }
      playerAction = {type:'switch', idx};
    }
    else {
      if(isTrainer){ await bmsg("No! There's no running from a TRAINER battle!"); continue; }
      runAttempts++;
      const mySpe = effStat(ally,'spe'), foeSpe = effStat(enemy,'spe');
      const odds = mySpe>=foeSpe ? 1 : (mySpe*128/foeSpe + 30*runAttempts)/256;
      if(Math.random()<odds){
        SFX.run();
        await bmsg('Got away safely!', true);
        return endBattle('ran');
      }
      await bmsg("Can't escape!");
      /* enemy gets a free move */
      const eMove = pickEnemyMove();
      await applyMove(enemy, ally, eMove, 'Foe '+SPECIES[enemy.mon.id].name, SPECIES[ally.mon.id].name, eImg, aImg, aInfo, eInfo);
      if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
      await poisonTick(ally, SPECIES[ally.mon.id].name, aInfo);
      if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
      continue;
    }

    function pickEnemyMove(){
      const dmgMoves = enemy.mon.moves.filter(s=>s.pp>0);
      if(!dmgMoves.length) return {id:'TACKLE', pp:1};
      /* prefer effective damaging moves */
      const scored = dmgMoves.map(s=>{
        const mv=MOVES[s.id];
        let score = Math.random();
        if(mv.p) score += 1 + (mv.p/100) + effectiveness(mv.t, SPECIES[ally.mon.id].types);
        return {s, score};
      });
      scored.sort((x,y)=>y.score-x.score);
      return scored[0].s;
    }

    /* --- resolve the turn --- */
    const eName = 'Foe '+SPECIES[enemy.mon.id].name;
    const aName = SPECIES[ally.mon.id].name;

    if(playerAction.type==='ball'){
      const caught = await throwBall(playerAction.key);
      if(caught) return endBattle('caught');
      const eMove = pickEnemyMove();
      await applyMove(enemy, ally, eMove, eName, aName, eImg, aImg, aInfo, eInfo);
      if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
      continue;
    }
    if(playerAction.type==='heal'){
      const t = Game.party[playerAction.idx];
      const item = ITEMS[playerAction.key];
      Game.takeItem(playerAction.key,1);
      if(item.kind==='cure'){ t.status=null; t.sleepTurns=0; await bmsg(`${SPECIES[t.id].name} became healthy!`); }
      else {
        SFX.heal();
        const to = Math.min(t.stats.hp, t.hp+item.amt);
        if(t===ally.mon) await animateHP(aInfo, t, t.hp, to); else t.hp=to;
        await bmsg(`${SPECIES[t.id].name}'s HP was restored!`);
      }
      refreshInfo(aInfo, ally.mon);
      const eMove = pickEnemyMove();
      await applyMove(enemy, ally, eMove, eName, aName, eImg, aImg, aInfo, eInfo);
      if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
      await poisonTick(ally, aName, aInfo);
      if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
      continue;
    }
    if(playerAction.type==='switch'){
      await bmsg(`${aName}, come back!`);
      ally = combatant(Game.party[playerAction.idx]);
      swapAllySprite();
      await bmsg(`Go! ${SPECIES[ally.mon.id].name}!`);
      const eMove = pickEnemyMove();
      await applyMove(enemy, ally, eMove, eName, SPECIES[ally.mon.id].name, eImg, aImg, aInfo, eInfo);
      if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
      await poisonTick(ally, SPECIES[ally.mon.id].name, aInfo);
      if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
      continue;
    }

    /* both use moves: order by priority then speed */
    const eMove = pickEnemyMove();
    const pPrio = (MOVES[playerAction.slot.id].fx||{}).prio||0;
    const ePrio = (MOVES[eMove.id].fx||{}).prio||0;
    let playerFirst;
    if(pPrio!==ePrio) playerFirst = pPrio>ePrio;
    else {
      const ps = effStat(ally,'spe'), es = effStat(enemy,'spe');
      playerFirst = ps===es ? Math.random()<.5 : ps>es;
    }

    const seq = playerFirst
      ? [['p',playerAction.slot],['e',eMove]]
      : [['e',eMove],['p',playerAction.slot]];

    let battleOver = false;
    for(const [who, slot] of seq){
      if(who==='p'){
        if(ally.mon.hp===0) continue;
        await applyMove(ally, enemy, slot, SPECIES[ally.mon.id].name, eName, aImg, eImg, eInfo, aInfo);
        if(enemy.mon.hp===0){
          if(await enemyFaints()){ battleOver=true; break; }
        }
      } else {
        if(enemy.mon.hp===0) continue;
        await applyMove(enemy, ally, slot, eName, SPECIES[ally.mon.id].name, eImg, aImg, aInfo, eInfo);
        if(ally.mon.hp===0){
          if(await allyFaints()){ return endBattle('lose'); }
        }
      }
    }
    if(battleOver){
      if(isTrainer) await bmsg(`You defeated ${opts.trainer.name}!`, true);
      await handleEvolutions();
      return endBattle('win');
    }
    /* end-of-turn poison */
    await poisonTick(ally, SPECIES[ally.mon.id].name, aInfo);
    if(ally.mon.hp===0){ if(await allyFaints()) return endBattle('lose'); }
    await poisonTick(enemy, eName, eInfo);
    if(enemy.mon.hp===0){
      if(await enemyFaints()){
        if(isTrainer) await bmsg(`You defeated ${opts.trainer.name}!`, true);
        await handleEvolutions();
        return endBattle('win');
      }
    }
  }

  async function endBattle(outcome){
    if(outcome==='caught' || outcome==='win' || outcome==='ran') await handleEvolutions();
    document.getElementById('battle').classList.add('hidden');
    document.getElementById('battle').innerHTML='';
    return outcome;
  }
}
