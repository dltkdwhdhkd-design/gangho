import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { volumes,cases } from '../../js/chronicle-books.js';
import { councils } from '../../js/chronicle-council.js';
import { boardFor,newWalk,move,visit,canVisit,reachable,neighbors,near,orders,rulesFor,fits } from '../../js/chronicle-rules.js';
import { provisionPlan,loadMatches } from '../../js/chronicle-stores.js';
import { possibleDuties,dutyFits,dutyTrial,sealTrial,sealSolutions,courierTrial,courierResult,trialType } from '../../js/chronicle-trials.js';
import { eveningFor } from '../../js/chronicle-evenings.js';

// Find a route using only firm ground; changing signals can only open additional paths.
function route(board,start,actor,target){
  const initial={...start,pos:[...start.pos],actor},q=[[initial,[]]],seen=new Set([initial.pos[actor]]);
  for(let i=0;i<q.length;i++){
    const [s,path]=q[i];
    if(s.pos[actor]===target)return [s,path];
    for(const p of reachable(board,s)){
      if(seen.has(p)||!['.','+'].includes(board.cells[p]))continue;
      // Tests also exercise the runtime move validator.
      const t={...s,pos:[...s.pos]};if(!move(board,t,p))continue;
      seen.add(p);q.push([t,[...path,p]]);
    }
  }
  return null;
}
export function solveWalk(board){
  let s=newWalk(board);const solution=[];
  function travel(actor,p){
    const result=route(board,s,actor,p);
    if(!result)return false;
    const [next,path]=result;
    solution.push('actor-'+actor,...path.map(k=>'step-'+k));s=next;return true;
  }
  for(const i of [0,1]){
    if(!travel(i,board.sites[i]))return null;
    assert(visit(board,s,i));solution.push('visit-'+i);
  }
  const checkpoint={...s,pos:[...s.pos]},count=solution.length;
  const meet=[board.sites[2],...neighbors(board.sites[2])].filter(p=>['.','+'].includes(board.cells[p]));
  for(const first of [0,1])for(const a of meet)for(const b of meet){
    if(a===b)continue;s={...checkpoint,pos:[...checkpoint.pos]};solution.length=count;
    if(travel(first,a)&&travel(1-first,b)&&canVisit(board,s,2)){
      assert(visit(board,s,2));solution.push('visit-2');return solution;
    }
  }
  return null;
}
export function allocation(plan){
  const result=[-1,-1,-1,-1,-1,-1];
  function tryBag(k){
    if(k===6)return loadMatches(plan,result).every(Boolean);
    for(let v=0;v<3;v++){
      if(result.filter(n=>n===v).length>=2)continue;
      result[k]=v;if(tryBag(k+1))return true;result[k]=-1;
    }
    return false;
  }
  assert(tryBag(0));return result;
}
export function validate(){
  assert.equal(volumes.length,9);assert.equal(cases.length,72);assert.equal(new Set(cases.map(c=>c.title)).size,72);
  const report={volumes:9,cases:0,boards:0,verdicts:0,uniqueSequences:0,allocations:0,regional:{duty:0,seal:0,courier:0},evenings:0,navigation:[],clues:[],words:0};
  for(const [i,v] of volumes.entries()){
    assert.equal(v.cases.length,8);assert.equal(councils[i].length,13);
    for(const c of v.cases){
      assert.equal(c.id,i*8+c.index);assert.equal(c.tasks.length,5);assert.equal(new Set(c.tasks).size,5);
      assert(c.scenes.every(s=>s.place&&s.speaker&&s.line.length>10));assert(c.answers.every(s=>s?.length>1));
      assert(c.verdicts.every(e=>e.label&&e.after?.length>5));report.cases++;
      const rules=rulesFor(c.id);const solutions=orders.filter(seq=>rules.every(r=>fits(r,seq)));
      const type=trialType(c);report.regional[type]++;
      if(type==='duty'){const d=dutyTrial(c.id);assert.deepEqual(possibleDuties.filter(s=>d.rules.every(r=>dutyFits(r,s))),[d.solution]);}
      if(type==='seal'){const t=sealTrial(c.id);assert.deepEqual(sealSolutions(t.lines),[t.cells]);}
      if(type==='courier'){const p=courierTrial(c.id);for(const a of p.answers){const s=courierResult(p,a);assert(s.late<0&&s.total<=p.limit);}}
      if(eveningFor(c)){assert.equal(eveningFor(c).length,4);report.evenings++;}
      assert.deepEqual(solutions,[[0,1,2,3,4]],c.title);report.uniqueSequences++;report.clues.push(rules.length);
      const out=solveWalk(boardFor(c.id));assert(out,c.title+'/탐문');report.boards++;
      for(const k of [0,1]){
        const back=solveWalk(boardFor(c.id,true,k));assert(back,c.title+'/인계'+k);report.boards++;
        const plan=provisionPlan(c.id,k),a=allocation(plan);assert(loadMatches(plan,a).every(Boolean));report.allocations++;report.verdicts++;
        report.navigation.push(out.length+back.length);
      }
      report.words+=c.scenes.map(s=>s.line).join('').length+c.verdicts.map(e=>e.after).join('').length;
    }
  }
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const r=validate(),avg=x=>(x.reduce((a,b)=>a+b,0)/x.length).toFixed(1);
  console.log(JSON.stringify({...r,navigation:{min:Math.min(...r.navigation),mean:avg(r.navigation),max:Math.max(...r.navigation)},clues:{min:Math.min(...r.clues),mean:avg(r.clues),max:Math.max(...r.clues)}},null,2));
}
