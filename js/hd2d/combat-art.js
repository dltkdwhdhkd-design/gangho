// Each row specifies anticipation, contact poses (one per hit), and recovery.
const forms = {
  slash: ['coil', 'edge', ['cut'], 'low', 'return'],
  reverse: ['low', 'return', ['highpoint'], 'edge', 'ready'],
  combo: ['ready', 'coil', ['edge', 'cut', 'highpoint'], 'low', 'return'],
  flurry: ['chamber', 'step', ['point', 'highpoint', 'cross'], 'step', 'return'],
  pierce: ['ready', 'chamber', ['point'], 'step', 'return'],
  dash: ['low', 'chamber', ['point'], 'low', 'return'],
  spin: ['cover', 'rear', ['sweep','edge','cut'], 'low', 'return'],
  wave: ['seal', 'lift', ['edge'], 'point', 'ready'],
  dart: ['ready', 'rear', ['throw','cross','throw'], 'open', 'return'],
  fan: ['seal', 'coil', ['throw','open','edge'], 'open', 'ready'],
  bow: ['ready','draw',['loose'],'loose','return'],
  palm: ['seal', 'chamber', ['palm','cross','palm'], 'step', 'seal'],
  fist: ['cover', 'chamber', ['cross','palm','kick'], 'cover', 'ready'],
  heavy: ['coil', 'lift', ['cut','low'], 'plant', 'return'],
  crush: ['seal', 'lift', ['plant'], 'low', 'return'],
  leap: ['low', 'air', ['fallcut'], 'plant', 'return'],
  kick: ['cover', 'low', ['kick','cross','kick'], 'low', 'cover'],
  stomp: ['seal','air',['plant'],'low','ready'],
  blink: ['cover','low',['air','edge'],'rear','return'],
  mine: ['seal','low',['plant','open'],'seal','ready'],
  mend: ['ready','seal',['open'],'seal','ready'],
  counter: ['ready','highguard',['cover'],'highguard','ready'],
  staff: ['low','rear',['sweep','highpoint','point'],'chamber','return'],
  moonfall: ['seal','air',['fallcut','point','sweep','highpoint','cut'],'plant','ready'],
};
const techniques = {
  cloud_flash:'dash',flow_three:'combo',wind_turn:'spin',swallow_qi:'wave',fall_flower:'leap',sky_sword:'moonfall',
  break_mount:'heavy',mad_wind:'combo',blood_fan:'spin',tiger_roar:'crush',one_point:'pierce',
  dragon_pass:'dash',sweep_army:'staff',hundred_flower:'flurry',sky_pierce:'leap',iron_fist:'fist',
  chain_kick:'kick',earth_stomp:'stomp',diamond_body:'counter',tathagata:'palm',luohan:'fist',
  taiji:'spin',plum:'flurry',zhongnan:'pierce',emei:'mend',kunlun:'wave',kongtong:'crush',
  diancang:'dash',qingcheng:'wave',tagu:'staff',hangryong:'palm',ihwa:'counter',palmun:'mine',
  manchen:'fan',moon1:'blink',moon2:'blink',moon3:'wave',moon4:'counter',moon5:'spin',moon6:'mine',moon7:'moonfall',
  breath:'mend',tray:'dart',dart:'dart',punch:'fist',heavy:'heavy',charge:'dash',lunge:'pierce',double:'combo',
  arrow:'bow',dart3:'dart',quick:'reverse',spin:'spin'
};
const ult = {ult_line:'dash',ult_arc:'heavy',ult_ring:'spin',ult_fan:'fan',ult_pull:'mine'};
const glyph = {Sword:'sword',Rapier:'rapier',Katana:'sabre',Ninjaku:'sabre',BigSword:'blade',Axe:'glaive',Lance:'spear',Lance2:'dragon',Stick:'staff',Club:'club',Sai:'claw'};
const personal = {
  cheongmyeong:'coil', yuseol:'highguard', baekcheon:'ready', yunjong:'cover', jogeol:'step',
  dangsoso:'highguard', dangbo:'rear', maengso:'chamber', hyeonjong:'seal', hyeonyeong:'cover',
  hyeonsang:'highguard', ungeom:'cover', unam:'seal', ungak:'ready', baeksang:'chamber',
  jingeumryong:'highguard', isongbaek:'ready', jongseohan:'coil', gohwi:'step', gimokseung:'cover', samaseung:'highguard',
  heodo:'seal', heowon:'cover', heosan:'ready', muyeon:'highguard', mujin:'chamber', jinhyeon:'step', jinmu:'ready',
  danggunak:'highguard', dangho:'cover', danghwa:'rear', dangjan:'coil', dangpae:'ready',
  hongdaegwang:'low', guchil:'step', jongpal:'chamber', wiripsan:'cover', wisoheng:'ready', yeompyeong:'step'
};
const plans = new WeakMap();
function analyze(skill) {
  let plan = plans.get(skill);
  if (plan) return plan;
  const steps = skill.steps || [];
  const beats = steps.filter(q => q.hit || q.proj || q.rush || q.zone || q.moonstrike || q.heal || q.buff || q.counter || q.slow);
  const proj = beats.find(q => q.proj)?.proj?.img;
  const hit = beats.find(q => q.hit)?.hit;
  const inferred = proj === 'p_arrow' ? 'bow' : /kunai|shuriken|tray/.test(proj || '') ? 'dart'
    : steps.some(q => q.heal) ? 'mend' : steps.some(q => q.counter || q.buff) ? 'counter'
    : steps.some(q => q.jump) ? 'leap' : steps.some(q => q.blink) ? 'blink'
    : steps.some(q => q.zone) ? 'mine' : proj ? 'wave' : steps.some(q => q.rush) ? 'dash'
    : hit?.shape === 'circle' ? 'spin' : hit?.shape === 'line' ? 'pierce' : beats.length > 1 ? 'combo' : 'slash';
  plan = { times:[...new Set(beats.map(q => q.t))], proj, inferred };
  if (!plan.times.length) plan.times.push((skill.dur || .4) * .48);
  plans.set(skill, plan);
  return plan;
}
const specialGear = {
  stick:'wood',mop:'staff',ghost_blade:'blade',ring_blade:'ringblade',tiger_claw:'claw',fist_wrap:'fist',
  iron_gauntlet:'ironfist',diamond_fist:'goldfist',vajra_fist:'goldfist',leg_fist:'goldfist',
  w_jegal:'fan',w_dang:'dagger',w_noeum:'staff',w_podalra:'vajra',w_emei:'piercer'
};
function equipment(actor, equipped, identity) {
  if (actor.isPlayer) {
    if (specialGear[equipped]) return specialGear[equipped];
    if(actor.wpn==='Club')return 'ironfist';
  }
  if (!actor.wpn && personal[identity]) {
    if (identity==='maengso') return 'fist';
    if (identity.startsWith('dang') && identity!=='dangsoso') return 'dart';
    if (['guchil','hongdaegwang','jongpal'].includes(identity)) return 'staff';
    return 'sword';
  }
  return glyph[actor.wpn] || 'palm';
}
const typeGear = {'검':'sword','도':'blade','창':'spear','권':'palm'};
const gearType = {sword:'검',wood:'검',sabre:'검',rapier:'검',blade:'도',ringblade:'도',dagger:'도',glaive:'도',spear:'창',dragon:'창',fist:'권',claw:'권',palm:'권',goldfist:'권',ironfist:'권',vajra:'권',fan:'권',piercer:'권'};
export function motionFor(actor,identity,equipped) {
  const sk = actor.sk, id = actor.skKey || sk?.id;
  let gear = equipment(actor,equipped,identity);
  if (actor.dead) return ['down',gear];
  if (actor.st === 'stun') return ['reel',gear];
  if (actor.st === 'guard') return ['cover',gear];
  if (actor.st === 'dash' || (!sk && actor.jumpT > 0)) return ['air',gear];
  if (actor.st !== 'skill' || !sk) return null;
  const plan = analyze(sk);
  let kind = sk.arch || techniques[id] || plan.inferred;
  kind = ult[kind] || kind;
  if (id === 'tray') gear = 'tray';
  else if (plan.proj === 'p_arrow') gear = 'bow';
  else if (/kunai|shuriken/.test(plan.proj || '') || (['dart','fan'].includes(kind) && sk.w !== '검')) gear = 'dart';
  else if (id === 'tagu') gear = 'staff';
  else if (['mend','mine','kick'].includes(kind)) gear = 'palm';
  else if (typeGear[sk.w] && sk.w !== gearType[gear] && gear !== 'staff') gear = typeGear[sk.w];
  if (sk.basic) {
    const chain = actor.basicFrame || 0;
    kind = gear==='fan' ? ['reverse','spin','palm'][chain%3] : gear==='dagger' || gear==='piercer' ? ['pierce','reverse','flurry'][chain%3]
      : gearType[gear]==='권' ? ['fist','palm','kick'][chain%3]
      : ['spear','dragon'].includes(gear) ? ['pierce','flurry','staff'][chain%3]
      : ['glaive','blade','ringblade','club'].includes(gear) ? ['heavy','spin','crush'][chain%3]
      : gear === 'staff' ? 'staff' : ['slash','reverse','combo'][chain%3];
  } else if (kind === 'slash' && gearType[gear] === '권') kind='fist';
  else if (kind === 'combo' && gearType[gear] === '권') kind='fist';
  const [open,wind,contacts,follow,rest] = forms[kind] || forms.slash;
  const t=actor.skT || 0, beats=plan.times;
  let index=-1;
  while (index+1<beats.length && t>=beats[index+1]) index++;
  if (index<0) return [t < beats[0]*.34 ? personal[identity] || open : wind,gear];
  const start=beats[index], next=beats[index+1] ?? sk.dur ?? start+.2;
  const f=(t-start)/Math.max(.001,next-start);
  if (f<.42) return [contacts[index%contacts.length],gear];
  if (index+1<beats.length) return [f<.72 ? follow : wind,gear];
  return [f<.77 ? follow : rest,gear];
}

export function drawMotion(c,images,layout,slot,motion,flip,x,y,height,white,identity) {
  if (!layout || !slot || !motion) return false;
  const body = images['field_'+slot[0].replace('walk','combat')], weapons=images.field_weapons;
  if (!body || !weapons) return false;
  const i=layout.poses.indexOf(motion[0]), w=layout.gear.indexOf(motion[1]);
  if (i<0 || w<0) return false;
  const [ox,oy]=layout.origin, scale=height/48;
  c.save();c.imageSmoothingEnabled=false;
  if (white) c.filter='brightness(0) invert(1)';
  c.translate(x,y+1);c.scale(flip?-scale:scale,scale);
  const [bw,bh]=layout.body;
  c.drawImage(body,(i%layout.cols)*bw,(slot[1]*layout.rows+Math.floor(i/layout.cols))*bh,bw,bh,-bw/2,-56-(bh-56)/2,bw,bh);
  const [px,py]=layout.pivots[i], [mx,my,lx,ly]=layout.builds[layout.figures[identity]][i];
  const at=(dx,dy)=>c.drawImage(weapons,i*layout.width,w*layout.height,layout.width,layout.height,-28-ox+dx,-56-oy+dy,layout.width,layout.height);
  if(motion[0]==='down') at(0,0);
  else {
    at(mx-px,my-py);
    if(['fist','claw','ironfist','goldfist'].includes(motion[1])) at(lx-px,ly-py);
  }
  c.restore();return true;
}
