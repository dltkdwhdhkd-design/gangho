import east from './main-east.js';
import river from './main-river.js';
import west from './main-west.js';
export const chapters=[];
for(const source of [east,river,west])for(const raw of source.trim().split('\n')){
  const fields=raw.split('|');
  if(raw.startsWith('#')){
    const [title,opening,first,afterFirst,second,afterSecond]=fields;
    chapters.push({title:title.slice(1),opening,choices:[first,second],effects:[afterFirst,afterSecond],sites:[]});
  }else{
    const [map,who,place,speech,trace,question,answer,distractor,outcome,foes]=fields;
    chapters.at(-1).sites.push({map,who,place,speech,trace,question,answer,distractor,outcome,foes:foes?foes.split(' '):[]});
  }
}
export const episodes=['객잔의 낭인','구름 위의 칼','강호 유람','금 간 깃발','장강의 전쟁','달이 진 골짜기','붉은 달','서역의 달','낙월'];
export function position(id){return {part:Math.floor(id/5)+1,chapter:id%5+1};}
export const pageNumber=(part,chapter)=>(part-1)*5+chapter;
