// Run against a served game with GAME_URL set to its index page.
async function checkCourtship() {
  const G = window.__G, st = G.dbg.state, dlg = G.dbg.dialog;
  const saved = {state:G.S,auto:G.auto,pick:G.autoPick,noSave:G.noSave,manual:G.manual};
  const female = ['yun','so','clan_dang','clan_moyong','clan_namgung','baekrang','hyeok'];
  const male = ['igyeom','mugyeong','yeonjae','jaeha'];
  const ids = [...female,...male,'cheol'];
  const assert = (ok,reason) => { if (!ok) throw Error(reason); };
  const sleep = () => new Promise(resolve=>setTimeout(resolve,0));
  // Exercise the same menu used by the stationary NPC, travelling party and house.
  async function talk(id, target = '그만둔다') {
    let done=false, failure, options;
    G.autoPick = c => {
      options = c.opts.slice();
      const i = options.indexOf(target);
      assert(i>=0,id+' missing '+target+': '+options);
      return i;
    };
    G.life.bondTalk(id).then(()=>{done=true;},e=>{failure=e;done=true;});
    for(let i=0;!done && i<80;i++){
      if(dlg.talking())dlg.tickDialog(.2);
      await sleep();
    }
    if(failure)throw failure;
    assert(done && options,'unresolved conversation '+id);
    return options;
  }
  try {
    G.manual=G.noSave=G.auto=true;
    assert(ids.length===Object.keys(G.life.cand).length,'update the test when adding a candidate');
    const counts={m:0,f:0};
    for(const g of ['m','f']){
      for(const id of ids){
        const s=G.S=st.newState('강호객',st.LEAD_LOOK[g],g,'normal');
        const allowed=g==='m'?female.includes(id):male.includes(id);
        const ctx=g+'/'+id;
        assert(st.canRomance(id,s)===allowed,ctx+' eligibility');
        s.love[id]=100;s.bonds[id]=3;s.flags.cross=true;s.flags.cheol_dead=true;
        const fresh=await talk(id);assert(fresh.includes('마음을 전한다')===allowed,ctx+' confession menu');
        assert(!fresh.includes('나들이를 간다')&&!fresh.includes('혼인을 청한다'),ctx+' single');
        if(id==='cheol') { assert(fresh.includes('의형제를 맺는다'),ctx+' sworn friendship');continue; }
        s.partner=id;
        assert(!!G.bond.next(id)===allowed,ctx+' lover-only chapter');
        assert(G.bond.total(id)===(allowed?4:3),ctx+' visible chapters');
        s.bonds[id]=4;
        const partnered=await talk(id);
        assert(partnered.includes('나들이를 간다')===allowed,ctx+' date');
        assert(partnered.includes('혼인을 청한다')===allowed,ctx+' proposal');
        if(allowed){ counts[g]++; }
        else {
          assert(G.life.stageOf(id)==='막역한 벗',ctx+' status');
          assert(await G.bond.join('jeong',[])===null,ctx+' romantic reinforcement');
          await G.bond.ending();
        }
      }
    }
    // Complete an original male/female pairing as well as the new female/male pairing.
    for(const [g,id] of [['m','yun'],...male.map(id=>['f',id])]){
      const s=G.S=st.newState('낭인',st.LEAD_LOOK[g],g,'normal');
      if(!G.field.m) G.field.load('cheongha',22,25,1);
      s.love[id]=100;s.bonds[id]=3;s.house.lv=1;s.flags.own_house=true;s.inv.jade_ring=1;
      await talk(id,'마음을 전한다');assert(s.partner===id,'valid confession '+id);
      s.bonds[id]=4;
      await talk(id,'혼인을 청한다');assert(s.married===id && !s.inv.jade_ring,'valid marriage '+id);
    }
    for(const [g,id] of [['m','igyeom'],['f','yun']]){
      const old=st.newState('예전 낭인',st.LEAD_LOOK[g],g,'normal');
      Object.assign(old,{v:4,partner:id,married:id,love:{[id]:98},bonds:{[id]:4},pt:{in:[id]},silver:520});
      old.inv.jade_ring=2;old.accs=['b_igyeom'];old.notes=['나루에서 길을 물었다.'];
      const read=s=>st.readSaveFile(new File([JSON.stringify(s)],'강호행.json'));
      const now=await read(old),twice=await read(now);
      assert(now.v===5&&!now.partner&&!now.married&&now.bonds[id]===3,'old pairing '+g);
      assert(now.love[id]===98&&now.pt.in[0]===id&&now.silver===520&&now.accs[0]==='b_igyeom','old friendship '+g);
      assert(now.inv.jade_ring===3&&twice.inv.jade_ring===3,'single ring reimbursement '+g);
      const valid={...old,gender:g==='m'?'f':'m'};
      const intact=await read(valid);
      assert(intact.partner===id&&intact.married===id&&intact.bonds[id]===4&&intact.inv.jade_ring===2,'existing eligible marriage '+id);
    }
    return {pairings:ids.length*2,maleRomances:counts.m,femaleRomances:counts.f,legacy:true};
  } finally {
    G.S=saved.state;G.auto=saved.auto;G.autoPick=saved.pick;G.noSave=saved.noSave;G.manual=saved.manual;
    dlg.stageClear();G.hideCG?.();
  }
}
module.exports=checkCourtship;
if(require.main===module){
  (async()=>{
    const {chromium}=require('playwright');
    const browser=await chromium.launch();
    try {
      const page=await browser.newPage();
      await page.goto(process.env.GAME_URL);
      await page.waitForFunction(()=>window.__G?.dbg,null,{timeout:60000});
      const r=await page.evaluate(checkCourtship);
      console.log(r);
    } finally { await browser.close(); }
  })().catch(e=>{console.error(e);process.exitCode=1;});
}
