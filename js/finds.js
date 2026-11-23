import { G, Keys, TS, Sound, toast } from './core.js';
import { DB } from './items.js';
import { WEAPONS } from './data.js';
import { give } from './state.js';
import { awardStudy } from './martial-study.js';

// The positions are in the map author's tile coordinates (before map.k).
// Keep keys stable: they are also the identity of the object in a save.
export const FINDS = {
  cheongha: [
    ['dock', '나루의 찻상자', 21,25.2,'tea',2],
    ['quay', '뱃사공의 수련함', 24.8,23.4,'study',40],
    ['well', '돌확 뒤의 약초', 32,16.7,'herb',3],
    ['alley', '골목의 돈궤', 11.4,22.7,'silver',32],
    ['yard', '담 너머 약상자', 6.8,24.5,'ginseng',1,1,9.8,24.5],
  ],
  bamboo: [
    ['bend','죽순 바구니',19.5,27,'shoot',3], ['bridge','대숲길 나무함',29,23,'silver',28],
    ['brook','돌틈의 수련단',23,15.8,'study',40], ['stone','석상 아래 약주',26,7.5,'plum_wine',1],
    ['bank','둔덕 위의 옥돌',12,9,'fist_wrap',1,1,12,12],
  ],
  pass: [
    ['relay','역졸의 약합',5,12.7,'herb',3], ['fork','갈림길 행낭',17,12.8,'silver',35],
    ['ledge','축대 위의 비단 주머니',28,7,'iron_blade',1,2,28,11.8],
    ['cairn','돌탑의 수련단',30,18,'study',40], ['pine','마른 솔 아래 철광석',35,5.5,'ore_iron',3],
  ],
  cloudmt: [
    ['gate','산문 앞의 차통',22.8,32,'tea',3], ['yard','연무장 수련함',22.8,20,'study',80],
    ['wall','담장 뒤 선물함',13,23,'poem',1,1,13,28.3], ['hall','본전 계단 약합',23,10,'ginseng',1],
    ['library','서고 옆 전낭',7,20.8,'silver',54],
  ],
  guhwa: [
    ['ferry','남문 짐궤',24.8,28.6,'silver',60], ['market','시장 다과함',15.8,17,'sweets',3],
    ['square','비무대 수련함',24.8,15.6,'study',80], ['pond','연못가 약초',36,25.4,'herb',3],
    ['terrace','돌담 너머 비단함',33.5,12.8,'iron_spear',1,2,33.5,16],
  ],
};
export const findCount = (s,map) => (FINDS[map] || []).filter(([id])=>s.finds?.[map+':'+id]).length;
export const leapRank = s => s.lv >= 6 && s.flags.footwork ? 2 : 1;
function landmark(m,x,y) {
  const unit = TS*(m.k || 1);
  return m.freeNear(x*unit,y*unit);
}
function spot(px,py,props) {
  return {x:px/TS-.35,y:py/TS-.35,w:.7,h:.7,px,py,...props};
}
export function discoverySpots(m,s) {
  const out=[];
  for (const [id,name,x,y,item,amount,need,fromX,fromY] of FINDS[m.id] || []) {
    const key=m.id+':'+id, [px,py]=landmark(m,x,y), done=!!s.finds?.[key];
    const open=() => {
      if (s.finds?.[key]) return toast('이미 열어 본 곳이다.');
      if (need && !s.crossings?.[key]) return toast('발자국이 있는 자리에서 경공으로 건너오자.');
      const owned=WEAPONS[item] && s.weapons.includes(item);
      if (item==='silver' || (item==='study' && !s.study)) s.silver+=amount;
      else if (item==='study') awardStudy(s,amount);
      else if (WEAPONS[item]) {
        if (!s.weapons.includes(item)) s.weapons.push(item);
        else {s.silver+=Math.round(WEAPONS[item].price/4);}
      } else give(item,amount);
      (s.finds ??= {})[key]=1;
      const reward=item==='silver'||(item==='study'&&!s.study) ? '은자 '+amount+'냥' : item==='study' ? '무학 '+amount : WEAPONS[item] ? (owned?'은자 '+Math.round(WEAPONS[item].price/4)+'냥':WEAPONS[item].name) : DB[item].name+' × '+amount;
      Sound.sfx('bonus'); toast(name+' · '+reward,3);
      if (key==='cheongha:dock') s.notes.push('나루 찻상자의 쪽지 · 표사 하진에게 첫물차를 돌려주자.');
    };
    out.push(spot(px,py,{kind:'find',key,done,hint:name+(done?' · 비어 있음':' 열기'),act:open}));
    if (!need) continue;
    const origin=landmark(m,fromX,fromY);
    for (const [at,to,back] of [[origin,[px,py],false],[[px,py],origin,true]]) {
      if (back && !s.crossings?.[key]) continue;
      out.push(spot(...at,{kind:'leap',key,need,to,back,hint:'경공 '+need+'단계 · '+Keys.label('dash'),act:()=>leap(G.field,key,need,to)}));
    }
  }
  if (m.id==='cheongha') {
    const [x,y]=landmark(m,9.8,24.5);
    out.unshift(spot(x,y,{kind:'training',hint:'신법 수련 · '+(G.touch?'경공 단추':Keys.label('dash'))+'로 담 넘기',act:()=>{
      s.flags.footwork=true;
      if (s.daily.footwork) return toast('오늘의 발디딤 수련을 마쳤다.');
      s.daily.footwork=1;awardStudy(s,10);
      toast('낮은 담 앞에서 발디딤을 익혔다. 레벨 6부터 경공 2단계를 쓸 수 있다.',4);
    }}));
  }
  return out;
}
export async function leap(field,key,need,to) {
  const s=G.S, start=[field.p.x,field.p.y];
  (s.leapSeen ??= {})[key]=1;
  if (leapRank(s)<need) return toast('경공 '+need+'단계부터 · 레벨 6과 신법 수련 1회가 필요하다.',3);
  if (field.m.blocked(...to)) return toast('내려설 자리가 막혔다.');
  Sound.sfx('jump');
  await new Promise(resolve=>{
    const begin=performance.now();
    function frame(now) {
      const t=Math.min(1,(now-begin)/500);
      field.p.x=start[0]+(to[0]-start[0])*t;
      field.p.y=start[1]+(to[1]-start[1])*t;
      field.p.leapHeight=14*4*t*(1-t);
      if (t<1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
  (s.crossings ??= {})[key]=1;
}
export function nearLeap(f) {
  const radius=TS*(f.m.k || 1)*1.25;
  return f.spots.find(s=>s.kind==='leap' && Math.hypot(s.px-f.p.x,s.py-f.p.y)<radius);
}
export function paintFinds(c,spots,project,scale) {
  for (const s of spots) {
    if (!s.kind || (s.kind!=='find' && s.kind!=='leap')) continue;
    if (s.back) continue;
    const [x,y]=project(s.px,s.py);
    c.save(); c.translate(Math.round(x),Math.round(y)); c.scale(scale,scale);
    if (s.kind==='leap') {
      c.fillStyle=leapRank(G.S)>=s.need?'#ebcf90':'#a6a49c';
      c.fillRect(-3,-2,2,4); c.fillRect(1,-5,2,4);
    } else {
      c.fillStyle='#382b27'; c.fillRect(-5,-5,10,5);
      c.fillStyle='#966438'; c.fillRect(-4,-4,8,3);
      c.fillStyle=s.done?'#463625':'#c28b51'; c.fillRect(-5,s.done?-8:-6,10,s.done?2:3);
      c.fillStyle='#e9c780'; c.fillRect(-3,-5,1,4); c.fillRect(2,-5,1,4);
    }
    c.restore();
  }
}
