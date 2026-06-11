/* ============ ui.js — input stack, dialog, choices, fade, sfx ============ */
const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* ---------------- input ---------------- */
const Input = {
  held:{up:false,down:false,left:false,right:false,a:false,b:false,start:false},
  stack:[],
  push(ctx){ this.stack.push(ctx); return ctx; },
  pop(ctx){
    if(ctx){ const i=this.stack.indexOf(ctx); if(i>=0) this.stack.splice(i,1); }
    else this.stack.pop();
  },
  dispatch(k){
    const top = this.stack[this.stack.length-1];
    if(top && top.onKey) top.onKey(k);
  },
  init(){
    const keymap = e=>{
      switch(e.key){
        case 'ArrowUp': case 'w': case 'W': return 'up';
        case 'ArrowDown': case 's': case 'S': return 'down';
        case 'ArrowLeft': case 'a': case 'A': return 'left';
        case 'ArrowRight': case 'd': case 'D': return 'right';
        case 'z': case 'Z': case ' ': return 'a';
        case 'x': case 'X': case 'Backspace': case 'Escape': return 'b';
        case 'Enter': return 'start';
      }
      return null;
    };
    addEventListener('keydown', e=>{
      const k = keymap(e); if(!k) return;
      e.preventDefault();
      SFX.unlock();
      if(!e.repeat){ this.held[k]=true; this.dispatch(k); }
    });
    addEventListener('keyup', e=>{
      const k = keymap(e); if(k) this.held[k]=false;
    });
    /* touch / mouse buttons */
    document.querySelectorAll('[data-k]').forEach(btn=>{
      const k = btn.dataset.k;
      const down = e=>{ e.preventDefault(); SFX.unlock(); if(!Input.held[k]){ Input.held[k]=true; Input.dispatch(k); } };
      const up = e=>{ e.preventDefault(); Input.held[k]=false; };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('pointercancel', up);
    });
  }
};

/* ---------------- sfx (tiny WebAudio chiptunes) ---------------- */
const SFX = {
  ctx:null,
  unlock(){ if(!this.ctx){ try{ this.ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } },
  tone(freq, dur, type='square', vol=.04, when=0){
    if(!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t+dur);
  },
  blip(){ this.tone(880,.04,'square',.02); },
  sel(){ this.tone(660,.06); this.tone(990,.06,'square',.04,.06); },
  bump(){ this.tone(140,.08,'square',.03); },
  hit(){ this.tone(220,.1,'sawtooth',.05); this.tone(160,.12,'sawtooth',.05,.06); },
  superHit(){ this.tone(330,.08,'sawtooth',.06); this.tone(220,.1,'sawtooth',.06,.06); this.tone(150,.14,'sawtooth',.06,.13); },
  faint(){ [392,330,262,196].forEach((f,i)=>this.tone(f,.12,'square',.05,i*.1)); },
  heal(){ [523,659,784,1047].forEach((f,i)=>this.tone(f,.09,'square',.04,i*.07)); },
  lvl(){ [523,523,784,1047].forEach((f,i)=>this.tone(f,.1,'square',.05,i*.09)); },
  ball(){ this.tone(740,.07); this.tone(520,.09,'square',.04,.08); },
  catchOk(){ [392,523,659,784,1047].forEach((f,i)=>this.tone(f,.12,'square',.05,i*.1)); },
  run(){ [880,740,620].forEach((f,i)=>this.tone(f,.06,'square',.04,i*.05)); },
  encounter(){ [200,300,250,350,300,400].forEach((f,i)=>this.tone(f,.06,'sawtooth',.04,i*.05)); },
};

/* ---------------- fade ---------------- */
const fadeEl = ()=>document.getElementById('fade');
async function fadeOut(){ fadeEl().style.opacity=1; await sleep(300); }
async function fadeIn(){ fadeEl().style.opacity=0; await sleep(300); }

/* ---------------- dialog ---------------- */
const UIL = ()=>document.getElementById('ui');

function showText(text, host){
  return new Promise(resolve=>{
    const root = host || UIL();
    let box = root.querySelector('#dialog-box');
    if(!box){
      box = document.createElement('div');
      box.id='dialog-box'; box.className='win';
      root.appendChild(box);
    }
    box.classList.remove('hidden');
    const pages = paginate(text);
    let pi=0, ci=0, typing=true, txt=pages[0];
    const span=document.createElement('span'), arrow=document.createElement('div');
    arrow.className='arrow'; arrow.textContent='▼';
    box.innerHTML=''; box.appendChild(span); box.appendChild(arrow);
    arrow.style.visibility='hidden';
    let timer = setInterval(()=>{
      ci+=2;
      if(ci % 10 === 0) SFX.blip();
      if(ci>=txt.length){ ci=txt.length; typing=false; clearInterval(timer); arrow.style.visibility='visible'; }
      span.textContent = txt.slice(0,ci);
    }, 16);
    const ctx = Input.push({onKey:k=>{
      if(k!=='a'&&k!=='b') return;
      if(typing){ clearInterval(timer); typing=false; ci=txt.length; span.textContent=txt; arrow.style.visibility='visible'; return; }
      SFX.blip();
      pi++;
      if(pi<pages.length){
        txt=pages[pi]; ci=0; typing=true; arrow.style.visibility='hidden';
        timer=setInterval(()=>{
          ci+=2;
          if(ci>=txt.length){ ci=txt.length; typing=false; clearInterval(timer); arrow.style.visibility='visible'; }
          span.textContent=txt.slice(0,ci);
        },16);
      } else {
        Input.pop(ctx);
        box.classList.add('hidden');
        resolve();
      }
    }});
  });
}
function paginate(text){
  /* split on explicit newlines, pack 2 lines per page */
  const lines = String(text).split('\n');
  const pages=[];
  for(let i=0;i<lines.length;i+=2) pages.push(lines.slice(i,i+2).join('\n'));
  return pages.length?pages:[''];
}

/* ---------------- choice menu ---------------- */
function showMenu(items, opts={}){
  return new Promise(resolve=>{
    const root = opts.host || UIL();
    const el = document.createElement('div');
    el.className = 'win menu-list';
    el.style.right = opts.right ?? '8px';
    if(opts.left!==undefined) { el.style.left=opts.left; el.style.right='auto'; }
    el.style.top = opts.top ?? 'auto';
    el.style.bottom = opts.bottom ?? '100px';
    if(opts.width) el.style.width = opts.width;
    root.appendChild(el);
    let sel = opts.start||0;
    const rows = items.map((it,i)=>{
      const d=document.createElement('div');
      d.className='mi'+(i===sel?' sel':'')+(it.dim?' dim':'');
      d.textContent = it.label ?? it;
      el.appendChild(d);
      return d;
    });
    const paint=()=>rows.forEach((r,i)=>r.classList.toggle('sel',i===sel));
    const ctx = Input.push({onKey:k=>{
      if(k==='up'){ sel=(sel+items.length-1)%items.length; SFX.blip(); paint(); }
      else if(k==='down'){ sel=(sel+1)%items.length; SFX.blip(); paint(); }
      else if(k==='a'){ SFX.sel(); Input.pop(ctx); el.remove(); resolve(sel); }
      else if(k==='b' && opts.canCancel!==false){ SFX.blip(); Input.pop(ctx); el.remove(); resolve(-1); }
    }});
  });
}

/* yes/no helper */
async function askYesNo(){
  return (await showMenu(['YES','NO'], {bottom:'100px', right:'8px'})) === 0;
}

function hpPercentColor(pct){
  return pct>.5 ? 'var(--hp-green)' : pct>.2 ? 'var(--hp-yellow)' : 'var(--hp-red)';
}
