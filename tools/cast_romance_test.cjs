const assert=require('node:assert/strict');
async function inspectRomance() {
  const G=window.__G,{BONDS}=await import('./js/bonds.js'),{tickDialog}=await import('./js/dialog.js');
  const {canRomance,LEAD_LOOK}=await import('./js/state.js');
  G.manual=G.noSave=true;G.speedup=100;G.S=G.dbg.newState('서린','BlueSamurai','m','normal');G.scene='field';
  G.field.load('cheongha',22,25);G.S.flags.cross=true;
  const fail=[],check=(v,label)=>{if(!v)fail.push(label);}, sleep=()=>new Promise(r=>setTimeout(r,0));
  const report={candidates:0,chapters:0,confessions:0,outings:0,proposals:0,weddings:0,oaths:0,battleReturns:0,fail};
  const decoded=new Map();
  async function decode(src) {
    if(!src)return false;
    if(!decoded.has(src))decoded.set(src,(async()=>{const im=new Image();im.src=src;try{await im.decode();return im.naturalWidth>0;}catch{return false;}})());
    return decoded.get(src);
  }
  async function drive(fn,choice,inspect=()=>{}) {
    let done=false,error;const complete=Promise.resolve().then(fn).then(()=>done=true,e=>{error=e;done=true;});
    G.auto=true;G.autoPick=c=>{
      if(!choice)return 0;const i=choice(c.opts);
      if(i<0)throw Error('선택지 누락 '+c.opts);return i;
    };
    const until=performance.now()+45000;
    while(!done && performance.now()<until){
      const layer=document.querySelector('#cg.on');
      if(layer)await inspect(layer);
      if(G.battle){
        check(!layer,'전투 중 인연 장면 해제');const b=G.battle;
        b.end('win');b.finish();report.battleReturns++;
      }
      tickDialog(.25);if(!done)await sleep();
    }
    G.auto=false;if(!done)throw Error('진행 정지 '+document.querySelector('#dialog')?.textContent);
    await complete;if(error)throw error;
  }
  async function art(layer,id,phase) {
    if(layer.dataset.actor!==id||layer.dataset.phase!==String(phase))return false;
    const painting=layer.querySelector('.bond-paint img');
    if(!painting){
      const bg=layer.style.backgroundImage;
      const url=bg.startsWith('url(')?bg.slice(4,-1).replaceAll('"','').replaceAll("'",""):'';
      return Number.isInteger(phase) && layer.dataset.art==='painting' &&
        url.includes('cg_bond_'+id) && await decode(url);
    }
    const cover=painting.parentElement;
    if (cover.hidden) {
      const fallback=layer.querySelector('img.bond-actor');
      check(fallback && await decode(fallback.src),id+' 원화 로딩 중 인물');
    }
    try {await painting.decode();} catch {return false;}
    await Promise.resolve();
    check(!cover.hidden && ['painting','atlas'].includes(layer.dataset.art),id+' 원화 표시');
    if(!await decode(painting.src))return false;
    if(/\/bonds\//.test(painting.src)) {
      if(typeof phase==='number'){
        check(painting.src.endsWith('/'+id+'.webp'),id+' 장별 원화');
        check(painting.style.left===(phase%2?'-100%':'0px')&&painting.style.top===(phase>=2?'-100%':'0px'),id+' 그림 영역 '+phase);
      } else check(painting.src.endsWith('/'+id+'_courtship.webp'),id+' 연애 원화 '+phase);
    }
    return true;
  }
  const s=G.S;
  for(const [id,c] of Object.entries(G.life.cand).filter(([,c])=>c.confess?.length)){
    report.candidates++;s.partner=null;s.married=null;s.sworn=null;s.swornBonds=[];s.daily={};
    s.flags['met_'+id]=1;s.love[id]=100;s.bonds[id]=0;
    s.gender='m';if(!canRomance(id,s))s.gender='f';
    s.look=LEAD_LOOK[s.gender];
    const valid=s.gender,select=name=>o=>o.indexOf(name);
    const chapter=async i=>{
      let seen=false;
      await drive(()=>G.bond.play(id),null,async layer=>{seen ||=await art(layer,id,i);});
      check(seen && s.bonds[id]===i+1,id+' 인연 '+i);report.chapters++;
    };
    for(let i=0;i<3;i++)await chapter(i);
    s.gender=valid==='m'?'f':'m';let declined=false;
    await drive(()=>G.life.bondTalk(id),opts=>{declined=!opts.includes('마음을 전한다')&&!opts.includes('혼인을 청한다');return opts.indexOf('그만둔다');});
    check(declined,id+' 이성 조건');s.gender=valid;
    if(c.fan){
      let seen=false;
      await drive(()=>G.life.bondTalk(id),o=>o.findIndex(x=>x.includes('를 맺는다')),async l=>{seen ||=await art(l,id,'oath');});
      check(seen && G.life.isSworn(id),id+' 결의');s.sworn=null;s.swornBonds=[];report.oaths++;
    }
    let seen=false;
    await drive(()=>G.life.bondTalk(id),select('마음을 전한다'),async l=>{seen ||=await art(l,id,'confess');});
    check(seen&&s.partner===id,id+' 고백');report.confessions++;
    for(let i=3;i<BONDS[id].length;i++)await chapter(i);
    const rand=Math.random;
    try{for(let i=0;i<c.date.length;i++){
      Math.random=()=>(i+.25)/c.date.length;s.daily={};seen=false;
      await drive(()=>G.life.bondTalk(id),select('나들이를 간다'),async l=>{
        if(!await art(l,id,'outing'))return;
        const im=l.querySelector('.bond-paint img'),f=1+i;
        seen ||=im.style.left===(f%2?'-100%':'0px')&&im.style.top===(f>=2?'-100%':'0px');
      });
      check(seen,id+' 나들이 '+i);report.outings++;
    }}finally{Math.random=rand;}
    s.flags.own_house=false;s.inv.jade_ring=1;seen=false;
    await drive(()=>G.life.bondTalk(id),select('혼인을 청한다'),()=>{seen=true;});
    check(!seen&&!s.married&&s.inv.jade_ring===1,id+' 집 마련 전');
    s.flags.own_house=true;s.house.lv=1;
    for(const rebuilt of [false,true]){
      s.married=null;s.partner=id;s.inv.jade_ring=1;s.flags.inn_rebuilt=rebuilt;
      let proposal=false,ceremony=false;
      await drive(()=>G.life.bondTalk(id),select('혼인을 청한다'),async l=>{
        if(l.dataset.phase==='proposal')proposal ||=await art(l,id,'proposal');
        if(l.dataset.phase!=='wedding')return;
        const people=Array.from(l.querySelectorAll('.bond-actor img, img.bond-actor'));
        const place=rebuilt?'inn_wedding':'home_wedding';
        ceremony ||=l.dataset.place===place && people.length===2 &&
          people[0].src.includes('type_'+s.look) && people[1].src.includes('/'+id+'_') &&
          (await Promise.all([...people.map(im=>decode(im.src)),decode('assets/art/scenes/'+place+'.webp')])).every(Boolean);
      });
      check(proposal && ceremony && s.married===id&&!s.inv.jade_ring,id+' 혼례 '+rebuilt);
      if(!rebuilt)report.proposals++;report.weddings++;
    }
  }
  check(report.candidates===21,'연애 인원');check(report.chapters===84,'인연 장수');
  return report;
}
module.exports={inspectRomance};
if(require.main===module)(async()=>{
 const {chromium}=require('playwright'),browser=await chromium.launch();
 try{const p=await browser.newPage();await p.goto(process.env.GAME_URL);await p.waitForFunction(()=>window.__G?.dbg);
 const result=await p.evaluate(inspectRomance);console.log(JSON.stringify(result));assert.deepEqual(result.fail,[]);}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
