import { G, toast } from './core.js';
import { choice, say, ctx } from './ctx.js';
import { SKILLS, HEARTS, rankOf } from './data.js';
import { FOES } from './foes.js';
import { DB } from './items.js';
import { take, learn } from './state.js';
import { panel } from './life.js';
import { meetingActions } from './people.js';
import { faceCanvas } from './dialog.js';
import { awardStudy, studyPrice } from './martial-study.js';

const affection=(s,id)=>s.love[id] || 0;
const bond=(s,id,n)=>{s.love[id]=Math.max(0,Math.min(100,affection(s,id)+n));};
const goods=s=>Object.keys(s.inv).filter(k=>s.inv[k]>0 && ['선물','요리','물고기','재료','보물'].includes(DB[k]?.kind));
const treasures=p=>[p.likes,p.skill?'silver_cup':'sweets'].filter((k,i,a)=>a.indexOf(k)===i);
const nameOf=id=>(SKILLS[id] || HEARTS[id]).name;
function available(s,p) {
  return [p.skill,p.heart].filter(id=>id && !(HEARTS[id]?s.hearts:s.skills).includes(id));
}
async function present(s,p,tie) {
  const ids=goods(s), n=await choice('무엇을 건넬까?', [...ids.map(k=>DB[k].name+' × '+s.inv[k]),'돌아가기']);
  if (!ids[n] || s.daily['gift_'+p.id]) return;
  const id=ids[n], pref=G.life.cand[p.id];
  let value=id===p.likes || pref?.loves.includes(id)?12:pref?.likes.includes(id)?6:pref?.hates.includes(id)?-3:2;
  if (value>0 && tie.lastGift===id) value=Math.floor(value/2);
  take(id); tie.lastGift=id; s.daily['gift_'+p.id]=1; bond(s,p.id,value);
  await say(null,p.name+'에게 '+DB[id].name+'을 건넸다. 호감 '+(value>0?'+':'')+value);
}
async function spar(s,p,tie) {
  if (s.daily['meet_spar_'+p.id]) return;
  s.daily['meet_spar_'+p.id]=1;
  const foe='meet_'+p.id, tier=p.id==='dock_tutor'?1:Math.min(4,Math.max(1,Math.ceil(s.lv/6)));
  FOES[foe]={...FOES.wanderer,name:p.name,spr:'chars/'+(G.field.npcs.find(n=>n.id===p.id)?.spr || 'Samurai'),hp:45+tier*20,atk:4+tier*2,exp:0,silver:0};
  const won=await ctx.duel({foes:[foe],arena:G.field.m.arena,title:p.name+'와의 비무',bgm:'fight',optional:true,noIntro:true,spar:true,yieldAt:.3,noLoot:true,noFollow:true});
  if (!won) return;
  bond(s,p.id,3); awardStudy(s,tier*20);
  const remaining=treasures(p).filter(k=>!tie.taken.includes(k));
  if (remaining.length) {
    await G.life.lootPick(p.name,remaining,item=>tie.taken.push(item));
  }
}
async function lessons(s,p) {
  const choices=available(s,p);
  const i=await choice('어떤 가르침을 청할까?', [...choices.map(id=>nameOf(id)+' · 호감 '+(HEARTS[id]?60:40)+' · 무학 '+studyPrice(s,id,true)), '돌아가기']);
  const id=choices[i]; if (!id) return;
  const price=studyPrice(s,id,true);
  if (affection(s,p.id)<(HEARTS[id]?60:40) || s.study.points<price) return toast('가르침을 받을 조건이 부족하다.');
  if (HEARTS[id]) {s.hearts.push(id);if (s.heart==='none') s.heart=id;}
  else learn(id);
  s.study.points-=price;
  await say(null,p.name+'에게 '+nameOf(id)+' 1성을 배웠다. 메뉴의 초식 탭에서 무학으로 성을 올릴 수 있다.');
}
export async function meet(npc) {
  const p=npc.person,s=G.S, id=p.id;
  const tie=(s.ties ??= {})[id] ??= {taken:[]};
  const love=affection(s,id), arts=available(s,p), learnable=arts.some(k=>love>=(HEARTS[k]?60:40));
  tie.noticed=(tie.noticed || 0) | meetingActions(s,p);
  const opts=[
    ['말 걸기','',async()=>{
      if (id==='dock_tutor' && s.finds?.['cheongha:dock'] && !tie.returned && s.inv.tea>0) {
        const answer=await choice('하진이 찻잎을 알아본다. “어머니께 올릴 첫물차요.”',['차 한 봉을 돌려준다','다음에']);
        if (!answer) {take('tea'); tie.returned=true; bond(s,id,25); await say(null,'하진이 허리를 숙였다. 호감 +25. 남은 차를 선물하거나 비무를 청할 수 있다.');}
      } else if (id==='dock_tutor' && tie.returned) {
        await say(null,'하진이 찻잔을 내려놓았다. “비도의 첫 수는 호감 40에 가르쳐 주겠소. 배운 뒤에도 무학을 남겨 두시오.”');
      } else await npc.talk();
    }],
    ['살피기','',async()=>{tie.inspected=true; tie.place=G.field.m.name; await say(null,p.name+' · '+p.role+' · '+rankOf(p.skill?6:1)+' · 호감 '+love+'/100\n취향 '+(love>=20 || id==='dock_tutor'?DB[p.likes].name:'아직 모름')+' · 가르침 '+([p.skill,p.heart].filter(Boolean).map(nameOf).join(', ')||'없음'));}],
    ['선물',s.daily['gift_'+id]?'오늘은 이미 건넴':goods(s).length?'':'선물할 물건 필요',()=>present(s,p,tie)],
    ['비무',!p.skill?'무인만 가능':love<20?'호감 20부터':s.daily['meet_spar_'+id]?'오늘은 이미 겨룸':'',()=>spar(s,p,tie)],
    ['가르침 청하기',!arts.length?'배울 무공 없음':!s.study?'기존 수련 방식':!learnable?'호감 '+(arts.some(k=>SKILLS[k])?40:60)+'부터':'',()=>lessons(s,p)],
    ['동행 청하기',!p.companion?'동행 후보 아님':love<60?'호감 60부터':G.party.members().includes(id)?'이미 동행 중':G.party.members().length>=2?'동행 두 명까지':'',()=>G.party.join(id)],
  ];
  const i=await panel(p.name+' · '+p.role+' · 호감 '+love,(body,redraw,close)=>{
    const portrait=faceCanvas(npc.spr.replace('chars/',''),64), status=document.createElement('div');
    status.className='meet-status';status.append(portrait, '호감 '+love+' / 100');
    const meter=document.createElement('progress');meter.max=100;meter.value=love;meter.ariaLabel='호감';
    status.append(meter);body.append(status);
    for (const [index,[label,reason]] of opts.entries()) {
      const b=document.createElement('button'); b.className='item'; b.dataset.meet=String(index);
      b.disabled=!!reason; b.textContent=label+(reason?' · '+reason:''); b.onclick=()=>close(index); body.appendChild(b);
    }
  },460);
  if (i!==undefined && !opts[i][1]) await opts[i][2]();
}
