import { shuffled } from './chronicle-rules.js';

const six = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
export const possibleDuties=six.flatMap(time=>six.map(hand=>({time,hand})));
const when=['아침','한낮','해질녘'];
export { when };
export function dutyFits([kind,a,b],s){
  if(kind==='at')return s.time[a]===b;
  if(kind==='absent')return s.hand[a]!==b;
  if(kind==='before')return s.time[a]<s.time[b];
  if(kind==='handBefore')return s.time[s.hand.indexOf(a)]<s.time[s.hand.indexOf(b)];
  if(kind==='notHour')return s.time[s.hand.indexOf(a)]!==b;
  return s.hand[a]===b;
}
export function dutyTrial(id){
  const solution=shuffled(possibleDuties,317+id)[0],pool=[];
  for(const kind of ['absent','before','handBefore','notHour','at','hand']){
    for(const a of [0,1,2])for(const b of [0,1,2]){
      if((kind==='before'||kind==='handBefore')&&a===b)continue;
      const rule=[kind,a,b];if(dutyFits(rule,solution))pool.push(rule);
    }
  }
  const rules=[];let candidates=possibleDuties;
  for(const rule of shuffled(pool,id+89)){
    const left=candidates.filter(s=>dutyFits(rule,s));if(left.length===candidates.length)continue;
    candidates=left;rules.push(rule);if(left.length===1)break;
  }
  return {rules,solution};
}
export function dutyWords([kind,a,b],places,hands){
  if(kind==='at')return places[a]+' 쪽 인계는 '+when[b]+'에 있었다.';
  if(kind==='absent')return hands[b]+'의 서명은 '+places[a]+'에서 나오지 않았다.';
  if(kind==='before')return places[a]+'의 회답이 '+places[b]+'보다 먼저 왔다.';
  if(kind==='handBefore')return hands[a]+'에게서 답을 받은 뒤에야 '+hands[b]+'의 차례가 왔다.';
  if(kind==='notHour')return hands[a]+'의 인계 시각은 '+when[b]+'이 아니었다.';
  return places[a]+'에는 '+hands[b]+'의 표가 남았다.';
}
function runs(line){
  const seq=[];let n=0;for(const v of [...line,false]){if(v)n++;else if(n){seq.push(n);n=0;}}return seq.length?seq:[0];
}
const binary=Array.from({length:32},(_,n)=>Array.from({length:5},(_,j)=>Number(Boolean(n&(1<<j)))));
const signature=a=>runs(a).join(',');
export function sealLines(bits){
  return {rows:Array.from({length:5},(_,r)=>runs(bits.slice(r*5,r*5+5))),cols:Array.from({length:5},(_,c)=>runs([0,1,2,3,4].map(r=>bits[r*5+c])))};
}
export function sealSolutions(lines,max=2){
  const targets=lines.cols.map(s=>binary.filter(b=>signature(b)===s.join(',')));
  const rows=lines.rows.map(s=>binary.filter(b=>signature(b)===s.join(','))), answers=[];
  function place(r,chosen,cols){
    if(answers.length>=max)return;
    if(r===5){answers.push(chosen.flat());return;}
    for(const row of rows[r]){
      const next=cols.map((list,c)=>list.filter(line=>line[r]===row[c]));
      if(next.every(list=>list.length))place(r+1,[...chosen,row],next);
    }
  }
  place(0,[],targets);return answers;
}
const seals=new Map();
export function sealTrial(id){
  if(seals.has(id))return seals.get(id);
  for(let round=0;;round++){
    const count=11+(id+round)%6,ones=new Set(shuffled(Array.from({length:25},(_,i)=>i),id*193+round*53+9001).slice(0,count));
    const cells=Array.from({length:25},(_,i)=>Number(ones.has(i))),lines=sealLines(cells);
    if([...lines.rows,...lines.cols].some(l=>l[0]===0||l[0]===5))continue;
    if(sealSolutions(lines).length!==1)continue;
    const result={lines,cells};seals.set(id,result);return result;
  }
}
const five=[0,1,2,3,4];
function perm(a){return a.length?a.flatMap(i=>perm(a.filter(j=>j!==i)).map(seq=>[i,...seq])):[[]];}
export const routes=perm(five);
export function courierResult(plan,order){
  let t=0,prior=5;const times=[];
  for(const i of order){t+=plan.cost[prior][i];times.push(t);prior=i;}
  const late=order.findIndex((p,i)=>times[i]<plan.windows[p][0]||times[i]>plan.windows[p][1]);
  return {times,late,total:t+plan.cost[prior][5]};
}
const couriers=new Map();
export function courierTrial(id){
  if(couriers.has(id))return couriers.get(id);
  for(let attempt=0;;attempt++){
    const seed=51+id*97+attempt*17,seq=shuffled(five,seed+27);
    const lengths=shuffled([1,1,2,2,2,3,3,3,4,4,4,5,5,5,6],seed);
    const cost=Array.from({length:6},()=>[0,0,0,0,0,0]);
    for(let a=0,n=0;a<6;a++)for(let b=a+1;b<6;b++)cost[b][a]=cost[a][b]=lengths[n++];
    const plan={cost,windows:five.map(()=>[0,99]),limit:99};
    const trial=courierResult(plan,seq);
    for(const [j,i] of seq.entries())plan.windows[i]=[Math.max(0,trial.times[j]-3-(j%2)),trial.times[j]+2+(id%3)];
    plan.limit=trial.total+1;
    const answers=routes.filter(r=>{const res=courierResult(plan,r);return res.late<0&&res.total<=plan.limit;});
    if(answers.length>0&&answers.length<=4){const out={...plan,answers};couriers.set(id,out);return out;}
  }
}
export const trialType=c=>['duty','seal','courier'][c.volume%3];
