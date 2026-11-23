import { G, TS } from './core.js';
import { say } from './dialog.js';
// Existing residents retain their original story schedules. Entries with a
// position are residents introduced on this route.
const existing=(id,name,role,likes,skill,heart,companion=false)=>({id,name,role,likes,skill,heart,companion});
const resident=(id,name,role,likes,skill,heart,spr,x,y,line)=>({
  ...existing(id,name,role,likes,skill,heart),spr,x,y,line,
});
export const PEOPLE = {
  cheongha:[
    existing('igyeom','서이겸','나루지기','poem','one_point','tonap',true),
    existing('boat','노 사공','뱃사공','tea'),existing('kid','아람','나루 아이','sweets'),
    existing('town','상복','그물장이','wood'),resident('linen','연실','포목상','sachet',null,null,'Villager4',11,17.6,'나루에 내린 옷감은 짠 기운부터 털어 내야 해요.'),
    resident('guest_blade','한유','비무객','plum_wine','chain_kick',null,'Samurai',27,15.5,'발길이 급할수록 돌부리를 차게 되지. 한 수 겨뤄 보겠나?'),
    resident('basket_maker','장 영감','바구니 장인','silver_cup',null,null,'OldMan',18,22.5,'날실은 굵게, 가로대는 가늘게. 그래야 짐을 내려도 주저앉지 않아.'),
    resident('dock_tutor','하진','은퇴한 표사','tea','dart','tonap','Samurai',24,26,'나루 계단 서쪽에 차가 든 상자를 두고 왔소. 찻잎 한 봉만 찾아 주겠소? 동쪽 짐궤에는 수련단도 남았을 거요.'),
    resident('reed_weaver','죽란','삿갓장이','shoot',null,null,'Woman',17,24.1,'강바람이 센 날에는 삿갓 챙에 실을 한 줄 더 감지요.'),
    resident('herb_runner','초빈','약초꾼','herb','breath',null,'Villager4',35,16.2,'둥근 돌확 뒤로 그늘이 지면 약초 냄새가 더 짙어져요.'),
    resident('night_watch','진강','야경꾼','plum_wine','iron_fist',null,'Inspector',39.8,14.7,'동쪽 길을 가려면 초소 불빛이 보일 때까지 큰길을 따라가시오.'),
  ],
  bamboo:[
    resident('flute','소청','피리 장인','shoot','breath','tonap','Villager',20.8,26,'속이 빈 대를 두드려 보시오. 맑게 울리는 것이 피리가 되지.'),
    resident('bamboo_guard','담유','산지기','tea','one_point',null,'GreenNinja',28,16.7,'굽이에서는 먼저 발자국부터 보시오. 비탈을 넘어간 자국이 있을 거요.'),
    resident('sap','연우','채약꾼','herb',null,null,'Woman',11,8.8,'동물들이 밟고 지나간 자리는 어린 죽순이 잘 올라와요.'),
  ],
  pass:[
    resident('relay','마준','역졸','tea','chain_kick',null,'Villager',7.8,13.7,'말은 쉬게 하고 나는 산길을 뛰지. 처음엔 낮은 턱부터 넘어 보게.'),
    resident('stone','석경','석공','ore_iron',null,null,'Caveman2',19,14,'비가 오면 내가 찍어 둔 돌계단이 가장 먼저 마르지.'),
    resident('pass_guard','설진','표사','jade','swallow_qi','swift','Samurai',34,19.6,'축대 위에 은잔이 든 주머니를 봤소. 발이 가벼워지면 다시 오시오.'),
  ],
  cloudmt:[
    existing('go','고진','창운문 사형','tea','cloud_flash','swift'),
    existing('disc','정수','연무장 제자','plum_wine','flow_three'),
    existing('smith2','곽철','병기장이','ore_iron','iron_fist'),
    resident('gate_keeper','도현','산문지기','poem','one_point',null,'Inspector',25,29,'입산하는 날엔 걸음을 줄이고 나갈 때는 시야를 넓히게.'),
    resident('scribe','명서','필사승','poem','breath','tonap','Monk',7.8,19,'초식 이름 곁에 스승 이름도 적어 두면 다음 길이 보이오.'),
    resident('drill','서령','연무 사범','jade','wind_turn','iron_shirt','RedSamurai',25.5,21.5,'발꿈치가 먼저 뜨면 회풍검의 마지막 바퀴가 흔들리네.'),
  ],
  guhwa:[
    existing('judge','구화 판관','비무 판관','silver_cup','break_mount'),
    existing('yun','윤설','의원','ginseng','breath','tonap',true),
    existing('so','소연하','검객','plum_wine','swallow_qi','swift',true),
    existing('cheol','철우','행각승','meat','iron_fist','iron_shirt',true),
    resident('lantern','채영','등롱장이','sweets',null,null,'Villager4',16,19.2,'해가 지면 연못에 뜨는 붉은 등부터 세어 봐요.'),
    resident('ring_guard','위정','비무대 호위','tea','sweep_army',null,'Inspector',27.5,17,'창끝과 발끝이 같은 곳을 향해야 창을 거둘 때도 흐트러지지 않지.'),
    resident('broker','문교','약재상','herb',null,null,'Noble',34.5,24,'남문 나루 짐궤에는 젖으면 안 되는 짐만 따로 싣소.'),
  ],
};

export function addResidents(m, content) {
  const entries=PEOPLE[m.id];
  if (!entries || G.mainPlot?.active()) return;
  for (const person of entries) {
    let npc=content.npcs.find(n=>n.id===person.id);
    if (!npc && person.spr) {
      const unit=TS*(m.k || 1), [x,y]=m.freeNear(person.x*unit,person.y*unit);
      npc={id:person.id,spr:person.spr,x:x/TS,y:y/TS,dir:0,life:'still',hint:person.name,talk:()=>say(null,person.line)};
      content.npcs.push(npc);
    }
    if (npc) npc.person=person;
  }
}

// An option is announced once when it becomes available. Quest marks keep
// priority when a resident also has a story event.
export function meetingActions(s,p) {
  if (!p) return 0;
  const love=s.love[p.id] || 0;
  let flags=p.skill && love>=20 && !s.daily['meet_spar_'+p.id] ? 1 : 0;
  if (s.study && ((p.skill && love>=40 && !s.skills.includes(p.skill)) ||
      (p.heart && love>=60 && !s.hearts.includes(p.heart)))) flags|=2;
  if (p.companion && love>=60 && !s.pt?.in?.includes(p.id) && (s.pt?.in?.length || 0)<2) flags|=4;
  return flags;
}
export function paintMeetingMark(c,n,x,y,scale) {
  if (!n.person) return;
  const flags=meetingActions(G.S,n.person) & ~(G.S.ties?.[n.id]?.noticed || 0);
  if (!flags || n.mark?.()) return;
  c.save();c.translate(x,y);c.scale(scale,scale);
  c.fillStyle='#312b24';c.fillRect(-4,-5,9,9);c.fillStyle='#edce83';
  if (flags&2) {c.fillRect(-3,-3,3,5);c.fillRect(1,-3,3,5);c.fillRect(0,-2,1,5);}
  else if (flags&4) {c.strokeStyle='#edce83';c.lineWidth=1;c.strokeRect(-2,-3,4,4);c.fillRect(-2,1,1,2);c.fillRect(2,1,1,2);}
  else {c.rotate(.65);c.fillRect(-.7,-4,1.4,6);c.fillRect(-2,1,4,1);c.fillRect(-.6,2,1.2,2);}
  c.restore();
}
