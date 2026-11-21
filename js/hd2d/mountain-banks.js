import { boulder } from './bedrock.js';
// Render each pair of mountain terraces as one eroded bank. The paved stair is a separate structure.
export function mountainBanks(map,cx){
  const k=map.k,stepLeft=Math.round((cx-1)*k),stepRight=Math.round((cx+5)*k);
  const rows=[[9,10,6],[22,23,4],[44,45,2]];
  map.banks=rows.map(([a,b,h],i)=>({
    north:Math.floor(a*k-1.45*k-1),south:Math.ceil(b*k+1.48*k+1),
    upper:Math.round(a*k),lower:Math.round(b*k),high:h,phase:i*1.7+map.id.length*.37,
    left:Math.max(0,stepLeft-2),right:Math.min(map.w,stepRight+2)
  }));
}
export function bankAt(map,x,y){
  return map.banks?.find(b=>y>=b.north&&y<b.south&&(x<b.left||x>=b.right));
}
function section(map,b,x){
  const k=map.k,span=b.lower-b.upper;
  const distance=x<b.left?b.left-x:x-b.right;
  const ease=Math.min(1,Math.max(0,distance/(3*k)));
  const wave=ease*k*(.75*Math.sin(x/k*.28+b.phase)+.32*Math.sin(x/k*.65-b.phase));
  const crown=b.upper+wave,foot=b.lower+wave;
  const lean=(.44+.17*Math.sin(x*.55+b.phase)+.09*Math.cos(x*1.19))*ease*k;
  const fault=.5+.5*Math.sin(x*.26+b.phase);
  const tooth=Math.sin(x*.91+b.phase)*.045*ease;
  return [[b.north,1],[crown-.53*k,1],[crown-.22*k,.99],[crown+.05*k,.94+tooth*.42],
    [crown+lean*.80+.13*k,.76+tooth],[crown+span*.51+lean*.55,.56+fault*.12+tooth],
    [foot-.14*k+lean*.48,.37+tooth],[foot+.19*k+lean*.26,.14+tooth*.58],
    [foot+.40*k,.050],[foot+.64*k,.012],[b.south,0]];
}
export function bankHeight(map,x,y,level){
  const b=bankAt(map,x,y);if(!b)return;
  const p=section(map,b,x);
  for(let i=1;i<p.length;i++)if(y<=p[i][0]){
    const t=Math.max(0,Math.min(1,(y-p[i-1][0])/Math.max(.001,p[i][0]-p[i-1][0])));
    return (b.high-2+2*(p[i-1][1]*(1-t)+p[i][1]*t))*level;
  }
  return (b.high-2)*level;
}
export function exposedFace(map,x,y){
  const b=bankAt(map,x,y);if(!b)return false;
  const profile=section(map,b,x);return y>profile[3][0]&&y<profile[8][0];
}
export function drawBanks(T,group,map,groundMap,granite,tile,level,hs,zs){
  if(!map.banks)return;
  const tops={pos:[],uv:[],col:[],ind:[]},stone={pos:[],uv:[],col:[],ind:[]};
  function strip(points,a,z,buffer,turf,b){
    const offset=buffer.pos.length/3;
    for(const [i,row] of points.entries())for(let l=a;l<=z;l++){
      const [x,y,h]=row[l];const n=.5+.5*Math.sin(x*.46+b.phase)*Math.cos(x*.13-l*.76);
      buffer.pos.push(x*tile,h*hs,y*tile*zs);
      if(turf){buffer.uv.push(x/map.w,1-y/map.h);const shade=.87+.12*n;buffer.col.push(shade,shade,shade);}
      else{
        buffer.uv.push(x*.41+y*.09,h*.086-y*.42);
        const v=.85+.24*n+.15*(l===3||l===7?0:1);const moss=(l<=3||l>=8)?.26*n:0;
        buffer.col.push(v*(1-moss*.16),v*(1+moss*.16),v*(1-moss*.46));
      }
      if(i&&l>a){
        const width=z-a+1,N=offset+i*width+l-a;
        buffer.ind.push(N-width-1,N-width,N-1,N-width,N,N-1);
      }
    }
  }
  const knobs=new Map(),transform=new T.Object3D();
  for(const b of map.banks)for(const [start,end] of [[0,b.left],[b.right,map.w]]){
    if(end<=start)continue;
    const points=[],n=Math.ceil((end-start)*2.6);
    for(let i=0;i<=n;i++){const x=start+(end-start)*i/n;points.push(section(map,b,x).map(([y,v])=>[x,y,(b.high-2+2*v)*level]));}
    strip(points,0,3,tops,true,b);strip(points,3,9,stone,false,b);strip(points,9,10,tops,true,b);
    // Join a curved bank to the two level stone landings at the stair cheek.
    const edge=start===0?end:start,side=start===0?-.0001:.0001;
    const breaks=[...new Set([...section(map,b,edge).map(p=>p[0]),b.upper,b.lower])].sort((a,c)=>a-c);
    for(let j=0;j<breaks.length-1;j++){
      const y=breaks[j],Y=breaks[j+1],half=(y+Y)/2,native=(b.high-(half>=b.upper?1:0)-(half>=b.lower?1:0))*level;
      const A=bankHeight(map,edge+side,y,level)??native,B=bankHeight(map,edge+side,Y-.00001,level)??native;
      if(Math.abs(A-native)+Math.abs(B-native)<.01)continue;
      const n=stone.pos.length/3;
      for(const [row,height] of [[y,A],[Y,B],[y,native],[Y,native]]){
        stone.pos.push(edge*tile,height*hs,row*tile*zs);stone.uv.push(row*.49,height*.086);
        stone.col.push(.86,.85,.81);
      }
      if(start===0)stone.ind.push(n,n+1,n+2,n+1,n+3,n+2);
      else stone.ind.push(n,n+2,n+1,n+1,n+2,n+3);
    }
    for(let t=start+1.4,i=0;t<end-1.5;i++){
      const wave=Math.sin(t*7.38+b.phase*5.1)*4269.37,v=wave-Math.floor(wave);
      const row=section(map,b,t),toe=row[v>.50?7:6],h=(b.high-2+toe[1]*2)*level;
      for(let n=0;n<(v>.4?3:1);n++){
        const seed=(Math.floor(v*37)+n*7+i)%17,geo=boulder(T,seed);
        const f=n===0?1:n===1?.55:.36;
        transform.position.set((t+n*.53)*tile,(h-2.8-n*.53)*hs,(toe[0]+n*.17)*tile*zs);
        transform.scale.set((.83+v*.52)*tile*f,(.54+v*.51)*level*f*hs,(.39+v*.22)*tile*f*zs);
        transform.rotation.y=(v-.5)*.64;transform.updateMatrix();
        if(!knobs.has(geo))knobs.set(geo,[]);
        knobs.get(geo).push(transform.matrix.clone());
      }
      t+=1.8+v*4.1;
    }
  }
  for(const [buf,tex] of [[tops,groundMap],[stone,granite]]){
    if(!buf.ind.length)continue;
    const g=new T.BufferGeometry();g.setIndex(buf.ind);
    g.setAttribute('position',new T.Float32BufferAttribute(buf.pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(buf.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(buf.col,3));g.computeVertexNormals();g.computeBoundingSphere();
    const mat=new T.MeshLambertMaterial({map:tex,vertexColors:true,side:T.DoubleSide});
    if(buf===stone){mat.color.set(map.biome==='snow'?'#d8e0d6':map.biome==='sand'?'#cfb497':'#c3c8b4');}
    const mesh=new T.Mesh(g,mat);mesh.name='eroded-mountain-bank';mesh.castShadow=mesh.receiveShadow=true;mesh.userData={bank:true,disposePaint:true};group.add(mesh);
    if(buf===stone)for(const [geo,matrices] of knobs){
      const out=new T.InstancedMesh(geo,mat,matrices.length);
      matrices.forEach((m,i)=>out.setMatrixAt(i,m));out.computeBoundingSphere();
      out.name='exposed-granite';out.castShadow=out.receiveShadow=true;out.userData={shared:true};group.add(out);
    }
  }
}
