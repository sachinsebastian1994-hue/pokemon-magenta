/* ================= POKéMON MAGENTA — data ================= */
/* Gen-1 type chart. Only non-neutral matchups listed. */
const TYPE_CHART = {
  NORMAL:  {ROCK:.5, GHOST:0},
  FIRE:    {FIRE:.5, WATER:.5, GRASS:2, ICE:2, BUG:2, ROCK:.5, DRAGON:.5},
  WATER:   {FIRE:2, WATER:.5, GRASS:.5, GROUND:2, ROCK:2, DRAGON:.5},
  ELECTRIC:{WATER:2, ELECTRIC:.5, GRASS:.5, GROUND:0, FLYING:2, DRAGON:.5},
  GRASS:   {FIRE:.5, WATER:2, GRASS:.5, POISON:.5, GROUND:2, FLYING:.5, BUG:.5, ROCK:2, DRAGON:.5},
  ICE:     {WATER:.5, GRASS:2, ICE:.5, GROUND:2, FLYING:2, DRAGON:2},
  FIGHTING:{NORMAL:2, ICE:2, POISON:.5, FLYING:.5, PSYCHIC:.5, BUG:.5, ROCK:2},
  POISON:  {GRASS:2, POISON:.5, GROUND:.5, BUG:2, ROCK:.5},
  GROUND:  {FIRE:2, ELECTRIC:2, GRASS:.5, POISON:2, FLYING:0, BUG:.5, ROCK:2},
  FLYING:  {ELECTRIC:.5, GRASS:2, FIGHTING:2, BUG:2, ROCK:.5},
  PSYCHIC: {FIGHTING:2, POISON:2, PSYCHIC:.5},
  BUG:     {FIRE:.5, GRASS:2, FIGHTING:.5, POISON:2, FLYING:.5, PSYCHIC:2},
  ROCK:    {FIRE:2, ICE:2, FIGHTING:.5, GROUND:.5, FLYING:2, BUG:2},
  GHOST:   {NORMAL:0, PSYCHIC:0, GHOST:2},
  DRAGON:  {DRAGON:2},
};
/* Gen-1: damage category is decided by the move's type. */
const SPECIAL_TYPES = new Set(['FIRE','WATER','GRASS','ELECTRIC','ICE','PSYCHIC','DRAGON']);

function effectiveness(atkType, defTypes){
  let m = 1;
  for(const d of defTypes){
    const row = TYPE_CHART[atkType];
    if(row && row[d] !== undefined) m *= row[d];
  }
  return m;
}

/* Moves: n=name t=type p=power acc(0-100) pp, fx = optional effect */
const MOVES = {
  TACKLE:{n:'TACKLE',t:'NORMAL',p:40,acc:100,pp:35},
  SCRATCH:{n:'SCRATCH',t:'NORMAL',p:40,acc:100,pp:35},
  POUND:{n:'POUND',t:'NORMAL',p:40,acc:100,pp:35},
  QUICK_ATTACK:{n:'QUICK ATTACK',t:'NORMAL',p:40,acc:100,pp:30,fx:{prio:1}},
  BITE:{n:'BITE',t:'NORMAL',p:60,acc:100,pp:25},
  HYPER_FANG:{n:'HYPER FANG',t:'NORMAL',p:80,acc:90,pp:15},
  BODY_SLAM:{n:'BODY SLAM',t:'NORMAL',p:85,acc:100,pp:15,fx:{status:'PAR',chance:.3}},
  HORN_ATTACK:{n:'HORN ATTACK',t:'NORMAL',p:65,acc:100,pp:25},
  FURY_ATTACK:{n:'FURY ATTACK',t:'NORMAL',p:30,acc:85,pp:20},
  SLAM:{n:'SLAM',t:'NORMAL',p:80,acc:75,pp:20},
  SLASH:{n:'SLASH',t:'NORMAL',p:70,acc:100,pp:20,fx:{crit:4}},
  HYPER_BEAM:{n:'HYPER BEAM',t:'NORMAL',p:150,acc:90,pp:5},
  SWIFT:{n:'SWIFT',t:'NORMAL',p:60,acc:999,pp:20},
  HEADBUTT:{n:'HEADBUTT',t:'NORMAL',p:70,acc:100,pp:15},
  DOUBLE_SLAP:{n:'DOUBLESLAP',t:'NORMAL',p:40,acc:85,pp:10},
  TAKE_DOWN:{n:'TAKE DOWN',t:'NORMAL',p:85,acc:85,pp:20},
  MEGA_PUNCH:{n:'MEGA PUNCH',t:'NORMAL',p:80,acc:85,pp:20},
  VICE_GRIP:{n:'VICE GRIP',t:'NORMAL',p:55,acc:100,pp:30},
  SPLASH:{n:'SPLASH',t:'NORMAL',p:0,acc:999,pp:40,fx:{splash:1}},
  SING:{n:'SING',t:'NORMAL',p:0,acc:55,pp:15,fx:{status:'SLP'}},
  GROWL:{n:'GROWL',t:'NORMAL',p:0,acc:100,pp:40,fx:{stat:'atk',d:-1,who:'foe'}},
  TAIL_WHIP:{n:'TAIL WHIP',t:'NORMAL',p:0,acc:100,pp:30,fx:{stat:'def',d:-1,who:'foe'}},
  LEER:{n:'LEER',t:'NORMAL',p:0,acc:100,pp:30,fx:{stat:'def',d:-1,who:'foe'}},
  SCREECH:{n:'SCREECH',t:'NORMAL',p:0,acc:85,pp:40,fx:{stat:'def',d:-2,who:'foe'}},
  HARDEN:{n:'HARDEN',t:'NORMAL',p:0,acc:999,pp:30,fx:{stat:'def',d:1,who:'self'}},
  DEFENSE_CURL:{n:'DEFENSE CURL',t:'NORMAL',p:0,acc:999,pp:40,fx:{stat:'def',d:1,who:'self'}},
  WITHDRAW:{n:'WITHDRAW',t:'WATER',p:0,acc:999,pp:40,fx:{stat:'def',d:1,who:'self'}},
  SWORDS_DANCE:{n:'SWORDS DANCE',t:'NORMAL',p:0,acc:999,pp:20,fx:{stat:'atk',d:2,who:'self'}},
  AGILITY:{n:'AGILITY',t:'PSYCHIC',p:0,acc:999,pp:30,fx:{stat:'spe',d:2,who:'self'}},
  GROWTH:{n:'GROWTH',t:'NORMAL',p:0,acc:999,pp:40,fx:{stat:'spc',d:1,who:'self'}},
  STRING_SHOT:{n:'STRING SHOT',t:'BUG',p:0,acc:95,pp:40,fx:{stat:'spe',d:-1,who:'foe'}},
  VINE_WHIP:{n:'VINE WHIP',t:'GRASS',p:45,acc:100,pp:25},
  RAZOR_LEAF:{n:'RAZOR LEAF',t:'GRASS',p:55,acc:95,pp:25,fx:{crit:4}},
  ABSORB:{n:'ABSORB',t:'GRASS',p:20,acc:100,pp:25,fx:{drain:.5}},
  MEGA_DRAIN:{n:'MEGA DRAIN',t:'GRASS',p:40,acc:100,pp:15,fx:{drain:.5}},
  PETAL_DANCE:{n:'PETAL DANCE',t:'GRASS',p:70,acc:100,pp:20},
  SLEEP_POWDER:{n:'SLEEP POWDER',t:'GRASS',p:0,acc:75,pp:15,fx:{status:'SLP'}},
  POISON_POWDER:{n:'POISONPOWDER',t:'POISON',p:0,acc:75,pp:35,fx:{status:'PSN'}},
  STUN_SPORE:{n:'STUN SPORE',t:'GRASS',p:0,acc:75,pp:30,fx:{status:'PAR'}},
  HYPNOSIS:{n:'HYPNOSIS',t:'PSYCHIC',p:0,acc:60,pp:20,fx:{status:'SLP'}},
  EMBER:{n:'EMBER',t:'FIRE',p:40,acc:100,pp:25},
  FLAMETHROWER:{n:'FLAMETHROWER',t:'FIRE',p:90,acc:100,pp:15},
  FIRE_SPIN:{n:'FIRE SPIN',t:'FIRE',p:35,acc:85,pp:15},
  WATER_GUN:{n:'WATER GUN',t:'WATER',p:40,acc:100,pp:25},
  BUBBLE_BEAM:{n:'BUBBLEBEAM',t:'WATER',p:65,acc:100,pp:20},
  SURF:{n:'SURF',t:'WATER',p:90,acc:100,pp:15},
  WATERFALL:{n:'WATERFALL',t:'WATER',p:80,acc:100,pp:15},
  HYDRO_PUMP:{n:'HYDRO PUMP',t:'WATER',p:110,acc:80,pp:5},
  THUNDER_SHOCK:{n:'THUNDERSHOCK',t:'ELECTRIC',p:40,acc:100,pp:30},
  THUNDERBOLT:{n:'THUNDERBOLT',t:'ELECTRIC',p:90,acc:100,pp:15},
  THUNDER_WAVE:{n:'THUNDER WAVE',t:'ELECTRIC',p:0,acc:90,pp:20,fx:{status:'PAR'}},
  AURORA_BEAM:{n:'AURORA BEAM',t:'ICE',p:65,acc:100,pp:20},
  ICE_BEAM:{n:'ICE BEAM',t:'ICE',p:90,acc:100,pp:10},
  BLIZZARD:{n:'BLIZZARD',t:'ICE',p:110,acc:90,pp:5},
  GUST:{n:'GUST',t:'FLYING',p:40,acc:100,pp:35},
  PECK:{n:'PECK',t:'FLYING',p:35,acc:100,pp:35},
  WING_ATTACK:{n:'WING ATTACK',t:'FLYING',p:60,acc:100,pp:35},
  DRILL_PECK:{n:'DRILL PECK',t:'FLYING',p:80,acc:100,pp:20},
  KARATE_CHOP:{n:'KARATE CHOP',t:'FIGHTING',p:50,acc:100,pp:25,fx:{crit:4}},
  LOW_KICK:{n:'LOW KICK',t:'FIGHTING',p:50,acc:90,pp:20},
  DOUBLE_KICK:{n:'DOUBLE KICK',t:'FIGHTING',p:60,acc:100,pp:30},
  SUBMISSION:{n:'SUBMISSION',t:'FIGHTING',p:80,acc:80,pp:25},
  POISON_STING:{n:'POISON STING',t:'POISON',p:25,acc:100,pp:35,fx:{status:'PSN',chance:.2}},
  ACID:{n:'ACID',t:'POISON',p:40,acc:100,pp:30},
  SLUDGE:{n:'SLUDGE',t:'POISON',p:65,acc:100,pp:20,fx:{status:'PSN',chance:.3}},
  CONFUSION:{n:'CONFUSION',t:'PSYCHIC',p:50,acc:100,pp:25},
  PSYBEAM:{n:'PSYBEAM',t:'PSYCHIC',p:65,acc:100,pp:20},
  PSYCHIC_M:{n:'PSYCHIC',t:'PSYCHIC',p:90,acc:100,pp:10},
  RECOVER:{n:'RECOVER',t:'NORMAL',p:0,acc:999,pp:10,fx:{heal:.5}},
  LEECH_LIFE:{n:'LEECH LIFE',t:'BUG',p:20,acc:100,pp:15,fx:{drain:.5}},
  TWINEEDLE:{n:'TWINEEDLE',t:'BUG',p:50,acc:100,pp:20,fx:{status:'PSN',chance:.2}},
  PIN_MISSILE:{n:'PIN MISSILE',t:'BUG',p:40,acc:95,pp:20},
  ROCK_THROW:{n:'ROCK THROW',t:'ROCK',p:50,acc:90,pp:15},
  ROCK_SLIDE:{n:'ROCK SLIDE',t:'ROCK',p:75,acc:90,pp:10},
  DIG:{n:'DIG',t:'GROUND',p:80,acc:100,pp:10},
  EARTHQUAKE:{n:'EARTHQUAKE',t:'GROUND',p:100,acc:100,pp:10},
  DRAGON_RAGE:{n:'DRAGON RAGE',t:'DRAGON',p:0,acc:100,pp:10,fx:{fixed:40}},
};

/* Species: bs=[hp,atk,def,spc,spe] (gen-1 Special), cr=catch rate,
   learn=[[level,moveId]...], evo={lv,to} */
const SPECIES = {
  1:{name:'BULBASAUR',types:['GRASS','POISON'],bs:[45,49,49,65,45],cr:45,evo:{lv:16,to:2},
     learn:[[1,'TACKLE'],[1,'GROWL'],[7,'VINE_WHIP'],[13,'SLEEP_POWDER'],[20,'RAZOR_LEAF'],[27,'MEGA_DRAIN']]},
  2:{name:'IVYSAUR',types:['GRASS','POISON'],bs:[60,62,63,80,60],cr:45,evo:{lv:32,to:3},
     learn:[[1,'TACKLE'],[1,'GROWL'],[1,'VINE_WHIP'],[13,'SLEEP_POWDER'],[22,'RAZOR_LEAF'],[30,'MEGA_DRAIN']]},
  3:{name:'VENUSAUR',types:['GRASS','POISON'],bs:[80,82,83,100,80],cr:45,
     learn:[[1,'TACKLE'],[1,'GROWL'],[1,'VINE_WHIP'],[22,'RAZOR_LEAF'],[30,'MEGA_DRAIN'],[43,'PETAL_DANCE']]},
  4:{name:'CHARMANDER',types:['FIRE'],bs:[39,52,43,50,65],cr:45,evo:{lv:16,to:5},
     learn:[[1,'SCRATCH'],[1,'GROWL'],[7,'EMBER'],[13,'LEER'],[20,'SLASH'],[27,'FLAMETHROWER']]},
  5:{name:'CHARMELEON',types:['FIRE'],bs:[58,64,58,65,80],cr:45,evo:{lv:36,to:6},
     learn:[[1,'SCRATCH'],[1,'GROWL'],[1,'EMBER'],[13,'LEER'],[24,'SLASH'],[33,'FLAMETHROWER']]},
  6:{name:'CHARIZARD',types:['FIRE','FLYING'],bs:[78,84,78,85,100],cr:45,
     learn:[[1,'SCRATCH'],[1,'EMBER'],[24,'SLASH'],[33,'FLAMETHROWER'],[36,'WING_ATTACK'],[50,'FIRE_SPIN']]},
  7:{name:'SQUIRTLE',types:['WATER'],bs:[44,48,65,50,43],cr:45,evo:{lv:16,to:8},
     learn:[[1,'TACKLE'],[1,'TAIL_WHIP'],[7,'WATER_GUN'],[13,'WITHDRAW'],[18,'BITE'],[25,'BUBBLE_BEAM']]},
  8:{name:'WARTORTLE',types:['WATER'],bs:[59,63,80,65,58],cr:45,evo:{lv:36,to:9},
     learn:[[1,'TACKLE'],[1,'TAIL_WHIP'],[1,'WATER_GUN'],[13,'WITHDRAW'],[20,'BITE'],[28,'BUBBLE_BEAM']]},
  9:{name:'BLASTOISE',types:['WATER'],bs:[79,83,100,85,78],cr:45,
     learn:[[1,'TACKLE'],[1,'WATER_GUN'],[20,'BITE'],[28,'BUBBLE_BEAM'],[42,'HYDRO_PUMP']]},
  10:{name:'CATERPIE',types:['BUG'],bs:[45,30,35,20,45],cr:255,evo:{lv:7,to:11},
     learn:[[1,'TACKLE'],[1,'STRING_SHOT']]},
  11:{name:'METAPOD',types:['BUG'],bs:[50,20,55,25,30],cr:120,evo:{lv:10,to:12},
     learn:[[1,'TACKLE'],[1,'HARDEN']]},
  12:{name:'BUTTERFREE',types:['BUG','FLYING'],bs:[60,45,50,80,70],cr:45,
     learn:[[1,'TACKLE'],[12,'CONFUSION'],[15,'SLEEP_POWDER'],[21,'GUST'],[32,'PSYBEAM']]},
  13:{name:'WEEDLE',types:['BUG','POISON'],bs:[40,35,30,20,50],cr:255,evo:{lv:7,to:14},
     learn:[[1,'POISON_STING'],[1,'STRING_SHOT']]},
  14:{name:'KAKUNA',types:['BUG','POISON'],bs:[45,25,50,25,35],cr:120,evo:{lv:10,to:15},
     learn:[[1,'POISON_STING'],[1,'HARDEN']]},
  15:{name:'BEEDRILL',types:['BUG','POISON'],bs:[65,80,40,45,75],cr:45,
     learn:[[1,'POISON_STING'],[12,'FURY_ATTACK'],[20,'TWINEEDLE'],[30,'PIN_MISSILE']]},
  16:{name:'PIDGEY',types:['NORMAL','FLYING'],bs:[40,45,40,35,56],cr:255,evo:{lv:18,to:17},
     learn:[[1,'TACKLE'],[7,'GUST'],[15,'QUICK_ATTACK'],[23,'WING_ATTACK']]},
  17:{name:'PIDGEOTTO',types:['NORMAL','FLYING'],bs:[63,60,55,50,71],cr:120,evo:{lv:36,to:18},
     learn:[[1,'TACKLE'],[1,'GUST'],[15,'QUICK_ATTACK'],[31,'WING_ATTACK']]},
  18:{name:'PIDGEOT',types:['NORMAL','FLYING'],bs:[83,80,75,70,91],cr:45,
     learn:[[1,'GUST'],[15,'QUICK_ATTACK'],[31,'WING_ATTACK'],[44,'SWIFT']]},
  19:{name:'RATTATA',types:['NORMAL'],bs:[30,56,35,25,72],cr:255,evo:{lv:20,to:20},
     learn:[[1,'TACKLE'],[1,'TAIL_WHIP'],[7,'QUICK_ATTACK'],[14,'HYPER_FANG']]},
  20:{name:'RATICATE',types:['NORMAL'],bs:[55,81,60,50,97],cr:90,
     learn:[[1,'TACKLE'],[1,'QUICK_ATTACK'],[14,'HYPER_FANG'],[30,'BODY_SLAM']]},
  21:{name:'SPEAROW',types:['NORMAL','FLYING'],bs:[40,60,30,31,70],cr:255,evo:{lv:20,to:22},
     learn:[[1,'PECK'],[1,'GROWL'],[9,'LEER'],[15,'FURY_ATTACK'],[22,'WING_ATTACK']]},
  22:{name:'FEAROW',types:['NORMAL','FLYING'],bs:[65,90,65,61,100],cr:90,
     learn:[[1,'PECK'],[1,'LEER'],[15,'FURY_ATTACK'],[34,'DRILL_PECK']]},
  23:{name:'EKANS',types:['POISON'],bs:[35,60,44,40,55],cr:255,evo:{lv:22,to:24},
     learn:[[1,'POISON_STING'],[1,'LEER'],[10,'BITE'],[17,'ACID']]},
  24:{name:'ARBOK',types:['POISON'],bs:[60,85,69,65,80],cr:90,
     learn:[[1,'POISON_STING'],[1,'BITE'],[17,'ACID'],[30,'SLUDGE']]},
  25:{name:'PIKACHU',types:['ELECTRIC'],bs:[35,55,30,50,90],cr:190,
     learn:[[1,'THUNDER_SHOCK'],[1,'GROWL'],[9,'QUICK_ATTACK'],[16,'THUNDER_WAVE'],[26,'THUNDERBOLT']]},
  27:{name:'SANDSHREW',types:['GROUND'],bs:[50,75,85,30,40],cr:255,evo:{lv:22,to:28},
     learn:[[1,'SCRATCH'],[6,'DEFENSE_CURL'],[17,'SLASH'],[24,'DIG']]},
  28:{name:'SANDSLASH',types:['GROUND'],bs:[75,100,110,55,65],cr:90,
     learn:[[1,'SCRATCH'],[1,'DEFENSE_CURL'],[17,'SLASH'],[24,'DIG'],[42,'EARTHQUAKE']]},
  29:{name:'NIDORAN♀',types:['POISON'],bs:[55,47,52,40,41],cr:235,
     learn:[[1,'GROWL'],[1,'SCRATCH'],[8,'DOUBLE_KICK'],[14,'POISON_STING'],[21,'BITE']]},
  32:{name:'NIDORAN♂',types:['POISON'],bs:[46,57,40,40,50],cr:235,
     learn:[[1,'LEER'],[1,'TACKLE'],[8,'DOUBLE_KICK'],[14,'POISON_STING'],[23,'HORN_ATTACK']]},
  41:{name:'ZUBAT',types:['POISON','FLYING'],bs:[40,45,35,40,55],cr:255,evo:{lv:22,to:42},
     learn:[[1,'LEECH_LIFE'],[12,'BITE'],[19,'WING_ATTACK'],[28,'SCREECH']]},
  42:{name:'GOLBAT',types:['POISON','FLYING'],bs:[75,80,70,75,90],cr:90,
     learn:[[1,'LEECH_LIFE'],[1,'BITE'],[19,'WING_ATTACK'],[28,'SCREECH']]},
  43:{name:'ODDISH',types:['GRASS','POISON'],bs:[45,50,55,75,30],cr:255,evo:{lv:21,to:44},
     learn:[[1,'ABSORB'],[13,'POISON_POWDER'],[17,'SLEEP_POWDER'],[23,'ACID'],[28,'MEGA_DRAIN']]},
  44:{name:'GLOOM',types:['GRASS','POISON'],bs:[60,65,70,85,40],cr:120,
     learn:[[1,'ABSORB'],[13,'POISON_POWDER'],[17,'SLEEP_POWDER'],[23,'ACID'],[28,'MEGA_DRAIN'],[38,'PETAL_DANCE']]},
  50:{name:'DIGLETT',types:['GROUND'],bs:[10,55,25,45,95],cr:255,evo:{lv:26,to:51},
     learn:[[1,'SCRATCH'],[1,'GROWL'],[19,'DIG'],[31,'SLASH']]},
  51:{name:'DUGTRIO',types:['GROUND'],bs:[35,80,50,70,120],cr:50,
     learn:[[1,'SCRATCH'],[19,'DIG'],[31,'SLASH'],[40,'EARTHQUAKE']]},
  54:{name:'PSYDUCK',types:['WATER'],bs:[50,52,48,50,55],cr:190,evo:{lv:33,to:55},
     learn:[[1,'SCRATCH'],[1,'TAIL_WHIP'],[10,'WATER_GUN'],[16,'CONFUSION'],[28,'PSYBEAM']]},
  55:{name:'GOLDUCK',types:['WATER'],bs:[80,82,78,80,85],cr:75,
     learn:[[1,'SCRATCH'],[1,'WATER_GUN'],[16,'CONFUSION'],[28,'PSYBEAM'],[40,'HYDRO_PUMP']]},
  56:{name:'MANKEY',types:['FIGHTING'],bs:[40,80,35,35,70],cr:190,evo:{lv:28,to:57},
     learn:[[1,'SCRATCH'],[1,'LEER'],[9,'LOW_KICK'],[15,'KARATE_CHOP'],[21,'FURY_ATTACK']]},
  57:{name:'PRIMEAPE',types:['FIGHTING'],bs:[65,105,60,60,95],cr:75,
     learn:[[1,'SCRATCH'],[9,'LOW_KICK'],[15,'KARATE_CHOP'],[35,'SUBMISSION']]},
  60:{name:'POLIWAG',types:['WATER'],bs:[40,50,40,40,90],cr:255,evo:{lv:25,to:61},
     learn:[[1,'WATER_GUN'],[16,'HYPNOSIS'],[19,'DOUBLE_SLAP'],[26,'BUBBLE_BEAM']]},
  61:{name:'POLIWHIRL',types:['WATER'],bs:[65,65,65,50,90],cr:120,
     learn:[[1,'WATER_GUN'],[16,'HYPNOSIS'],[26,'BUBBLE_BEAM'],[38,'BODY_SLAM']]},
  63:{name:'ABRA',types:['PSYCHIC'],bs:[25,20,15,105,90],cr:200,evo:{lv:16,to:64},
     learn:[[1,'CONFUSION']]},
  64:{name:'KADABRA',types:['PSYCHIC'],bs:[40,35,30,120,105],cr:100,evo:{lv:36,to:65},
     learn:[[1,'CONFUSION'],[21,'PSYBEAM'],[26,'RECOVER'],[38,'PSYCHIC_M']]},
  65:{name:'ALAKAZAM',types:['PSYCHIC'],bs:[55,50,45,135,120],cr:50,
     learn:[[1,'CONFUSION'],[21,'PSYBEAM'],[26,'RECOVER'],[38,'PSYCHIC_M']]},
  69:{name:'BELLSPROUT',types:['GRASS','POISON'],bs:[50,75,35,70,40],cr:255,evo:{lv:21,to:70},
     learn:[[1,'VINE_WHIP'],[1,'GROWTH'],[13,'SLEEP_POWDER'],[23,'ACID'],[30,'RAZOR_LEAF']]},
  70:{name:'WEEPINBELL',types:['GRASS','POISON'],bs:[65,90,50,85,55],cr:120,
     learn:[[1,'VINE_WHIP'],[1,'GROWTH'],[13,'SLEEP_POWDER'],[23,'ACID'],[30,'RAZOR_LEAF']]},
  74:{name:'GEODUDE',types:['ROCK','GROUND'],bs:[40,80,100,30,20],cr:255,evo:{lv:25,to:75},
     learn:[[1,'TACKLE'],[1,'DEFENSE_CURL'],[11,'ROCK_THROW'],[26,'ROCK_SLIDE']]},
  75:{name:'GRAVELER',types:['ROCK','GROUND'],bs:[55,95,115,45,35],cr:120,
     learn:[[1,'TACKLE'],[11,'ROCK_THROW'],[26,'ROCK_SLIDE'],[36,'EARTHQUAKE']]},
  79:{name:'SLOWPOKE',types:['WATER','PSYCHIC'],bs:[90,65,65,40,15],cr:190,evo:{lv:37,to:80},
     learn:[[1,'TACKLE'],[1,'GROWL'],[15,'CONFUSION'],[20,'WATER_GUN'],[29,'PSYBEAM']]},
  80:{name:'SLOWBRO',types:['WATER','PSYCHIC'],bs:[95,75,110,80,30],cr:75,
     learn:[[1,'TACKLE'],[15,'CONFUSION'],[20,'WATER_GUN'],[29,'PSYBEAM'],[44,'PSYCHIC_M']]},
  95:{name:'ONIX',types:['ROCK','GROUND'],bs:[35,45,160,30,70],cr:45,
     learn:[[1,'TACKLE'],[1,'SCREECH'],[13,'ROCK_THROW'],[25,'ROCK_SLIDE'],[30,'SLAM']]},
  113:{name:'CHANSEY',types:['NORMAL'],bs:[250,5,5,105,50],cr:30,
     learn:[[1,'POUND'],[1,'SING'],[30,'RECOVER'],[35,'PSYBEAM']]},
  123:{name:'SCYTHER',types:['BUG','FLYING'],bs:[70,110,80,55,105],cr:45,
     learn:[[1,'QUICK_ATTACK'],[1,'LEER'],[17,'WING_ATTACK'],[24,'SLASH'],[30,'SWORDS_DANCE']]},
  127:{name:'PINSIR',types:['BUG'],bs:[65,125,100,55,85],cr:45,
     learn:[[1,'VICE_GRIP'],[18,'HARDEN'],[25,'SLASH'],[36,'SWORDS_DANCE']]},
  129:{name:'MAGIKARP',types:['WATER'],bs:[20,10,55,15,80],cr:255,evo:{lv:20,to:130},
     learn:[[1,'SPLASH'],[15,'TACKLE']]},
  130:{name:'GYARADOS',types:['WATER','FLYING'],bs:[95,125,79,100,81],cr:45,
     learn:[[1,'BITE'],[20,'WATERFALL'],[30,'HYDRO_PUMP'],[40,'HYPER_BEAM']]},
  131:{name:'LAPRAS',types:['WATER','ICE'],bs:[130,85,80,95,60],cr:45,
     learn:[[1,'WATER_GUN'],[1,'SING'],[16,'BODY_SLAM'],[25,'AURORA_BEAM'],[38,'ICE_BEAM'],[46,'HYDRO_PUMP']]},
  143:{name:'SNORLAX',types:['NORMAL'],bs:[160,110,65,65,30],cr:25,
     learn:[[1,'HEADBUTT'],[1,'DEFENSE_CURL'],[25,'BODY_SLAM'],[40,'EARTHQUAKE']]},
  144:{name:'ARTICUNO',types:['ICE','FLYING'],bs:[90,85,100,125,85],cr:3,
     learn:[[1,'GUST'],[13,'AURORA_BEAM'],[33,'ICE_BEAM'],[45,'AGILITY'],[51,'BLIZZARD']]},
  147:{name:'DRATINI',types:['DRAGON'],bs:[41,64,45,50,50],cr:45,evo:{lv:30,to:148},
     learn:[[1,'TACKLE'],[1,'LEER'],[10,'DRAGON_RAGE'],[20,'SLAM'],[28,'AGILITY']]},
  148:{name:'DRAGONAIR',types:['DRAGON'],bs:[61,84,65,70,70],cr:45,evo:{lv:55,to:149},
     learn:[[1,'TACKLE'],[10,'DRAGON_RAGE'],[20,'SLAM'],[35,'BODY_SLAM']]},
  149:{name:'DRAGONITE',types:['DRAGON','FLYING'],bs:[91,134,95,100,80],cr:45,
     learn:[[1,'DRAGON_RAGE'],[20,'SLAM'],[35,'BODY_SLAM'],[55,'HYPER_BEAM']]},
  150:{name:'MEWTWO',types:['PSYCHIC'],bs:[106,110,90,154,130],cr:3,
     learn:[[1,'CONFUSION'],[1,'SWIFT'],[40,'PSYCHIC_M'],[55,'RECOVER']]},
  151:{name:'MEW',types:['PSYCHIC'],bs:[100,100,100,100,100],cr:5,
     learn:[[1,'POUND'],[20,'CONFUSION'],[30,'MEGA_PUNCH'],[40,'PSYCHIC_M'],[50,'RECOVER']]},
};

/* Encounter tables: id, lv range, weight */
const ENCOUNTERS = {
  1:{name:'ROUTE 1', rate:.13, slots:[
    {id:16,lv:[2,4],w:32},{id:19,lv:[2,4],w:32},{id:21,lv:[3,5],w:14},
    {id:29,lv:[3,5],w:8},{id:32,lv:[3,5],w:8},{id:63,lv:[4,6],w:6}]},
  2:{name:'NORTH FIELD', rate:.13, slots:[
    {id:21,lv:[6,9],w:24},{id:23,lv:[6,9],w:20},{id:27,lv:[6,9],w:20},
    {id:56,lv:[7,10],w:15},{id:16,lv:[7,10],w:11},
    {id:123,lv:[12,13],w:4},{id:127,lv:[12,13],w:4},{id:113,lv:[10,10],w:2}]},
  3:{name:'MAGENTA WOODS', rate:.14, slots:[
    {id:10,lv:[4,7],w:24},{id:13,lv:[4,7],w:24},{id:11,lv:[5,7],w:5},{id:14,lv:[5,7],w:5},
    {id:43,lv:[5,8],w:17},{id:69,lv:[5,8],w:17},{id:25,lv:[6,9],w:8}]},
  4:{name:'LAKESIDE', rate:.13, slots:[
    {id:60,lv:[8,12],w:30},{id:54,lv:[8,12],w:25},{id:79,lv:[8,12],w:20},
    {id:129,lv:[5,10],w:18},{id:147,lv:[10,15],w:5},{id:131,lv:[15,15],w:2}]},
  5:{name:'MAGENTA CAVERN', rate:.08, slots:[
    {id:41,lv:[10,14],w:40},{id:74,lv:[10,14],w:30},{id:50,lv:[10,14],w:18},{id:95,lv:[12,16],w:12}]},
};

const ITEMS = {
  POKEBALL:{n:'POKé BALL', kind:'ball', mult:1, desc:'A device for catching wild POKéMON.'},
  GREATBALL:{n:'GREAT BALL', kind:'ball', mult:1.5, desc:'A good, high-performance BALL.'},
  ULTRABALL:{n:'ULTRA BALL', kind:'ball', mult:2, desc:'An ultra-performance BALL.'},
  POTION:{n:'POTION', kind:'heal', amt:20, desc:'Restores 20 HP.'},
  SUPER_POTION:{n:'SUPER POTION', kind:'heal', amt:50, desc:'Restores 50 HP.'},
  HYPER_POTION:{n:'HYPER POTION', kind:'heal', amt:200, desc:'Restores 200 HP.'},
  FULL_HEAL:{n:'FULL HEAL', kind:'cure', desc:'Heals all status problems.'},
  RARE_CANDY:{n:'RARE CANDY', kind:'candy', desc:'Raises a POKéMON one level.'},
};

/* ---------- mon helpers ---------- */
function expForLevel(lv){ return lv*lv*lv; }

function calcStats(id, lv){
  const b = SPECIES[id].bs;
  return {
    hp:  Math.floor(2*b[0]*lv/100) + lv + 10,
    atk: Math.floor(2*b[1]*lv/100) + 5,
    def: Math.floor(2*b[2]*lv/100) + 5,
    spc: Math.floor(2*b[3]*lv/100) + 5,
    spe: Math.floor(2*b[4]*lv/100) + 5,
  };
}

function movesAtLevel(id, lv){
  const known = SPECIES[id].learn.filter(([l])=>l<=lv).map(([,m])=>m);
  const uniq = [...new Set(known)];
  return uniq.slice(-4);
}

function makeMon(id, lv){
  const st = calcStats(id, lv);
  return {
    id, lv,
    exp: expForLevel(lv),
    stats: st,
    hp: st.hp,
    moves: movesAtLevel(id, lv).map(m=>({id:m, pp:MOVES[m].pp})),
    status: null,        // 'PSN' | 'PAR' | 'SLP'
    sleepTurns: 0,
  };
}

function baseExpYield(id){
  const b = SPECIES[id].bs;
  return Math.floor((b[0]+b[1]+b[2]+b[3]+b[4]) / 3);
}

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
function spriteURL(id, back){
  return `${SPRITE_BASE}/versions/generation-iii/firered-leafgreen/${back?'back/':''}${id}.png`;
}
function spriteURLFallback(id, back){
  return `${SPRITE_BASE}/${back?'back/':''}${id}.png`;
}
/* attach to an <img>: try FRLG art, fall back to default sprite */
function setMonSprite(img, id, back){
  img.onerror = ()=>{ img.onerror = null; img.src = spriteURLFallback(id, back); };
  img.src = spriteURL(id, back);
}
