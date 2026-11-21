import {G,TS,Sound} from './core.js';
import {MAPS} from './maps.js';
import {Story,ctx,say,narr,choice} from './ctx.js';
import {WHO} from './dialog.js';
import {FOES} from './foes.js';
import {save} from './state.js';
import {chapters,episodes,position,pageNumber} from './main-chapters.js';
import {warTestimony} from './main-branches.js';
import {mainTrip,roadAnchors} from './main-road-scenes.js';
import {maneuvers} from './main-command.js';

Object.assign(WHO,{
 munok:{name:'뱃사공 문옥',face:'Woman'},hangyu:{name:'창운문 집사 한규',face:'Inspector'},
 porter:{name:'길잡이 임칠',face:'Villager3'},seam:{name:'돛장이 여씨',face:'Villager4'},
 mok:{name:'쇄강도 목진악',face:'Caveman2'}
});
FOES.mokjinak={...FOES.lion,name:'쇄강도 목진악',spr:'chars/Caveman2',title:'쇄강채의 주인',hp:3650,atk:40,def:12,spd:65,exp:430,silver:90,scale:1.28,poise:320,wpn:'BigSword',
 moves:['heavy','lunge','spin','quake'],phases:[{hp:.68,say:'키를 잡아라! 내 칼이 강줄기다!',add:['charge','flurry'],pause:.84},{hp:.31,say:'노꾼들이 다 가도 이 갑판은 내 것이다!',add:['tide'],pause:.75}]};
const live=()=>G.S&&G.S.mode!=='free'&&!G.S.flags.ended&&!G.S.flags.awaitingRoadEnding;
const fresh=(done=0)=>({done,unlocked:done,parts:{},decisions:{},active:null,pending:null,seconds:0});
const s=()=>G.S.mainRoad;
function resumeState(){
 if(!live())return;
 if(!s()){
  const match=G.S.chapter?.match(/제(\d+)부(?:[^·]*·\s*제(\d+)장)?/);
  const p=Number(match?.[1]||1),ch=Number(match?.[2]||1);
  const done=pageNumber(p,ch)-1;G.S.mainRoad=fresh(done);s().unlocked=done+(match?1:0);s().inherited=done;
 }
}
function card(part,name,raw,first){
 if(!live()||!raw||raw==='끝')return raw;
 resumeState();const d=s(),entry=d.parts[part]??={seen:[],by:{}};
 const numbered=raw.match(/^제(\d+)장(?:\s+(.*))?/);
 let slot;
 if(numbered)slot=Number(numbered[1]);
 else if(part===6)slot=5;
 else if(entry.by[raw])slot=entry.by[raw];
 else{
  const settled=part===5&&['정천맹의 균열','패천도','남문','비질 소리'].includes(raw);
  slot=first?1:settled?5:Math.min(5,entry.seen.length+1);
 }
 if(!entry.seen.includes(raw))entry.seen.push(raw);entry.by[raw]=slot;
 d.unlocked=Math.max(d.unlocked,pageNumber(part,slot));
 const id=pageNumber(part,slot)-1,sub=numbered?numbered[2]:raw;
 return '제'+slot+'장 '+chapters[id].title+(sub&&sub!==chapters[id].title?' · '+sub:'');
}
function hold(page,key){
 if(!live())return false;
 resumeState();const d=s();
 if(d.done>=page)return false;
 d.unlocked=Math.max(d.unlocked,page);d.pending=key;return true;
}
function siteOf(a){
 const c=chapters[a.id],site=c.sites[a.site],{part,chapter}=position(a.id);
 const branch=a.site===0&&[4,5].includes(part)&&warTestimony(part,chapter,G.S.side);
 const trip=mainTrip(a.id,a.site);
 if(trip&&!a.localSite)return {...site,map:'world',trip};
 return branch?{...site,who:branch[0],map:branch[1],extra:branch[2],extraTrace:branch[3]}:site;
}
// Native walkable lanes, including clear midpoints. Keep the same four anchors after a save/load.
const lanes=new WeakMap();
function laneFor(m){
 if(lanes.has(m))return lanes.get(m);
 const n=m.w*m.h,valid=new Uint8Array(n),visited=new Uint8Array(n),edges=new Uint8Array(n),dirs=[1,m.w,-1,-m.w];
 const point=i=>[(i%m.w+.5)*TS,(Math.floor(i/m.w)+.5)*TS];
 for(let i=0;i<n;i++){const [x,y]=point(i);valid[i]=!m.blocked(x,y);}
 let largest=[];
 for(let start=0;start<n;start++){
  if(visited[start]||!valid[start])continue;
  const queue=[start];visited[start]=1;
  for(let j=0;j<queue.length;j++){
   const k=queue[j],[x,y]=point(k);
   for(let dir=0;dir<4;dir++){
    const v=k+dirs[dir];if(!valid[v]||Math.abs(v%m.w-k%m.w)>1)continue;
    const [X,Y]=point(v);
    if([.25,.5,.75].some(t=>m.blocked(x+(X-x)*t,y+(Y-y)*t)))continue;
    edges[k]|=1<<dir;if(!visited[v]){visited[v]=1;queue.push(v);}
   }
  }
  if(queue.length>largest.length)largest=queue;
 }
 if(largest.length<4)throw Error('본편 진행 지점이 부족합니다 '+m.id);
 const lane={cells:largest,edges,dirs,point};lanes.set(m,lane);return lane;
}
function anchors(m,seed){
 const {cells,edges,dirs,point}=laneFor(m),d=new Int32Array(m.w*m.h),result=[cells[(seed*179+13)%cells.length]];
 function distances(start){
  d.fill(-1);const q=[start];d[start]=0;
  for(let j=0;j<q.length;j++){const i=q[j];for(let dir=0;dir<4;dir++)if(edges[i]&(1<<dir)){const v=i+dirs[dir];if(d[v]<0){d[v]=d[i]+1;q.push(v);}}}
 }
 const spread=new Int32Array(d.length);spread.fill(100000);
 while(result.length<4){
  distances(result.at(-1));let best=-1,score=-1;
  for(const i of cells){spread[i]=Math.min(spread[i],d[i]);const s=spread[i]+((i*17+seed)%23)/100;if(s>score){best=i;score=s;}}
  result.push(best);
 }
 return result.map(point);
}
const persistPos=()=>{const f=G.field,k=f.m.k||1;G.S.px=f.p.x/k;G.S.py=f.p.y/k;G.S.dir=f.p.dir;};
function place(id,x,y,dir){
 const f=G.field,m=MAPS[id],k=m.k||1;
 f.load(id,x/(TS*k),y/(TS*k),dir);f.p.x=x;f.p.y=y;f.p.dir=dir;f.camera(1);persistPos();
}
function enter(a,fromSave=false){
 const site=siteOf(a);G.world.ensure(site.map);
 const m=MAPS[site.map];
 if(!a.anchors){
  if(site.trip){
   a.anchors=roadAnchors(m,site.trip,[6,26,34,40].includes(a.id),TS);
   if(!a.anchors){a.localSite=true;return enter(a,fromSave);}
  }else a.anchors=anchors(m,a.id*3+a.site);
 }
 const p=fromSave&&G.S.map===site.map&&Number.isFinite(G.S.px)?[G.S.px*(m.k||1),G.S.py*(m.k||1)]:a.anchors[0];
 place(site.map,p[0],p[1],fromSave?G.S.dir:0);goal();save();
}
function goal(){
 const a=s().active;if(!a)return;
 const site=siteOf(a),{part,chapter}=position(a.id),who=WHO[site.who]?.name||G.S.name;
 const next=a.mask===3?site.place+'에서 행동':[(a.mask&1)?'':who+' 만나기',(a.mask&2)?'':site.place+' 조사'].filter(Boolean).join(' · ');
 ctx.goal('본편 '+part+'부 '+chapter+'장　'+(site.trip?site.trip[1]:chapters[a.id].title)+'　'+(a.site+1)+'/3　'+next);
}
function arrive(){
 if(!live()||G.scene!=='field'||G.field.busy||G.menuOpen)return false;
 resumeState();const d=s();
 if(d.active)return true;
 if(d.done===0&&!d.pending&&[undefined,'p0','p0a'].includes(G.S.flags.step))return false;
 if(d.done<d.unlocked){
  const f=G.field;d.active={id:d.done,site:0,mask:0,intro:false,anchors:null,home:{map:f.m.id,x:f.p.x,y:f.p.y,dir:f.p.dir,goal:G.S.goal}};
  enter(d.active);return true;
 }
 if(d.pending){
  const key=d.pending,fn=Story.entries[key];
  if(!fn)throw Error('알 수 없는 본편 장면 '+key);
  // The preceding save retains the gate until the resumed native scene reaches its next safe field return.
  d.pending=null;void G.field.run(fn);return true;
 }
 return false;
}
const callbacks={4:0,8:2,14:3,19:0,22:7,24:12,27:1,28:3,30:4,32:9,34:24,36:12,39:29,40:4,42:9,43:28,44:0};
async function intro(a){
 if(a.intro)return;
 const c=chapters[a.id];
 if(!a.site){await narr(c.opening);const id=callbacks[a.id],decision=s().decisions[id];if(decision!==undefined)await narr('문득 그날이 생각났다. '+chapters[id].effects[decision]);}
 a.intro=true;save();
}
async function inspect(a,key){
 if(s().active!==a)return;
 await intro(a);const t=siteOf(a);
 if(key===1){
  if(t.trip&&!(a.mask&1))for(let i=2;i<t.trip.length;i+=2)await say(t.trip[i],t.trip[i+1]);
  if(t.extra)await say(t.who,t.extra);await say(t.extra?chapters[a.id].sites[a.site].who:t.who,t.speech);
 }
 else{await narr(t.trace);if(t.extraTrace)await narr(t.extraTrace);}
 a.mask|=key;goal();save();Sound.sfx('select',.5);
}
async function resolve(a){
 if(s().active!==a||a.mask!==3)return;
 const c=chapters[a.id],t=siteOf(a),{part,chapter}=position(a.id);
 if(!a.answered){
  const flip=(a.id+a.site*3)%2,opts=flip?[t.distractor,t.answer]:[t.answer,t.distractor];
  if(await choice(t.question,opts)!==flip){await narr(t.trace);return;}
  a.answered=true;save();
 }
 if(a.site!==1&&!a.maneuver){
  if(!await maneuvers(a,a.id,a.site===2?1:0,part+'부 '+chapter+'장 '+c.title,t.place))return;
  a.maneuver=true;save();
 }
 if(t.foes.length&&!a.fought){
  const boss=t.foes.includes('BOSS');
  await ctx.duel({foes:boss?['mokjinak']:t.foes,arena:G.field.m.arena||'yard',bgm:boss?'boss':'fight',title:boss?'쇄강도 목진악':t.place,noLoot:true,expMul:boss?1:.18});
  a.fought=true;save();
 }
 await narr(t.outcome);
 if(a.site<2){
  a.site++;a.mask=0;a.answered=a.maneuver=a.fought=false;a.anchors=a.board=null;a.localSite=false;a.intro=false;enter(a);return;
 }
 const decision=await choice(c.title,c.choices);await narr(c.effects[decision]);
 const d=s(),home=a.home;d.decisions[a.id]=decision;d.done=a.id+1;d.active=null;
 G.S.notes.push('본편 '+part+'부 '+chapter+'장 「'+c.title+'」 '+c.effects[decision]);
 G.S.goal=home.goal;place(home.map,home.x,home.y,home.dir);save();
}
function content(id){
 const a=G.S?.mainRoad?.active;if(!a||!live())return null;
 const t=siteOf(a);if(id!==t.map||!a.anchors)return null;
 const {who,place}=t,witness=who==='me'?G.S.look:WHO[who]?.face||'Villager';
 const pin=(i,base)=>({id:'main_'+i,x:a.anchors[i][0]/TS,y:a.anchors[i][1]/TS,ghost:true,mainMarker:true,reach:7,...base});
 const npcs=[pin(1,{role:who,spr:witness,hint:(WHO[who]?.name||G.S.name)+'의 이야기',mark:()=>!(a.mask&1),talk:()=>inspect(a,1)}),
 pin(2,{spr:'',stamp:['sign','jar','tablet'][a.site],hint:place+' 조사',mark:()=>!(a.mask&2),talk:()=>inspect(a,2)})];
 if(a.mask===3)npcs.push(pin(3,{spr:'',stamp:'sign',hint:place+'에서 행동',mark:()=>true,talk:()=>resolve(a)}));
 return {npcs,spots:[],trigs:[],roam:[],hunt:[]};
}
let lastInput=0;
for(const event of ['pointerdown','keydown','touchstart'])document.addEventListener(event,()=>{lastInput=performance.now();},{passive:true,capture:true});
function tick(dt){
 if(safeActive()&&!document.hidden&&!G.menuOpen&&performance.now()-lastInput<75000&&!G.auto)s().seconds+=dt;
}
function safeActive(){return !!(live()&&G.S.mainRoad?.active);}
G.mainPlot={start(){G.S.mainRoad=fresh();},resume(){resumeState();if(safeActive())enter(s().active,true);else arrive();},hold,card,arrive,content,tick,active:safeActive};
