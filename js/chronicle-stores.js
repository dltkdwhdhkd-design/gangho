import { shuffled } from './chronicle-rules.js';
export function provisionPlan(id,decision){
  // Each departure has two small loads. The serial number is unrelated to the intended destination.
  const seed=127+id*17+decision*29;
  const weights=shuffled(Array.from({length:25},(_,i)=>[1+i%5,1+Math.floor(i/5)]),seed).slice(0,6);
  const pairs=shuffled([0,1,2,3,4,5],seed+19);
  const wants=[0,1,2].map((_,i)=>sumLoads(weights,pairs.slice(i*2,i*2+2)));
  return {weights,wants,order:shuffled([0,1,2,3,4,5],seed+11)};
}
export function sumLoads(weights,indices){
  return indices.reduce(([a,b],i)=>[a+weights[i][0],b+weights[i][1]],[0,0]);
}
export function loadMatches(plan,assignment){
  return plan.wants.map((wanted,i)=>{
    const ids=assignment.flatMap((dest,k)=>dest===i?[k]:[]);
    const got=sumLoads(plan.weights,ids);
    return ids.length===2&&got.every((n,j)=>n===wanted[j]);
  });
}
