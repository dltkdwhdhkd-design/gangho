import {chapters,position} from '../../js/main-chapters.js';
import {warTestimony} from '../../js/main-branches.js';
import {layout,beginManeuver,availableMoves,moveUnit,canOperate,operate,reached} from '../../js/main-maneuvers.js';
export function solve(b,initial=beginManeuver(b)){
 const key=s=>s.pos+'/'+s.mask+'/'+(s.turn%4),queue=[initial],paths=new Map([[key(initial),null]]);
 for(let i=0;i<queue.length;i++){
  const s=queue[i],prev=key(s);
  if(reached(b,s)){const path=[];let at=prev;while(paths.get(at)){const [last,cmd]=paths.get(at);path.push(cmd);at=last;}return path.reverse();}
  const cmds=[...availableMoves(b,s),'wait'];if(canOperate(b,s))cmds.push('do');
  for(const cmd of cmds){const next={...s};if(cmd==='do')operate(b,next);else moveUnit(b,next,cmd==='wait'?s.pos:cmd);
   const k=key(next);if(!paths.has(k)){paths.set(k,[prev,cmd]);queue.push(next);}
  }
 }
 throw Error('Unreachable mission '+b.id+'/'+b.sector);
}
export function verify(){
 const assert=(v,k)=>{if(!v)throw Error(k);};let turns=0,sites=0,battles=0,variants=0;
 assert(chapters.length===45,'chapter count');const names=new Set();
 for(const [id,c] of chapters.entries()){
  assert(!names.has(c.title)&&c.opening&&c.choices.length===2&&c.effects.every(Boolean)&&c.sites.length===3,c.title);names.add(c.title);
  for(const t of c.sites){assert(t.map&&t.who&&t.question&&t.answer!==t.distractor&&t.outcome,c.title);sites++;if(t.foes.length)battles++;}
  for(let stage=0;stage<2;stage++)turns+=solve(layout(id,stage)).length;
  const {part,chapter}=position(id);if(part===4||part===5)for(const side of ['jeong','sa','ma','free']){assert(warTestimony(part,chapter,side)?.length===4,c.title+' '+side);variants++;}
 }
 assert(chapters[24].sites[1].foes[0]==='BOSS','midpoint');return {chapters:45,sites,battles,variants,operations:90,minimumOrders:turns};
}
if(typeof process!=='undefined'&&process.argv[1]?.endsWith('main_story_test.mjs'))console.log(verify());
