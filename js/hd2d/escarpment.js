// Exposed bedrock follows each contiguous height contour, including the cuts beside stairways.
import { outdoorMaterial } from './outdoor-light.js';

const paints=new WeakMap();
function rockPaint(T,texture){
  if(paints.has(T))return paints.get(T);
  function paint(options){
    const surface=new T.MeshLambertMaterial({map:texture('field_crag'),vertexColors:true,side:T.DoubleSide,...options});
    surface.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
        #ifdef USE_MAP
        vec3 grain=texture2D(map,vMapUv).rgb;
        diffuseColor.rgb*=mix(vec3(.90),grain,.33);
        #endif
      `);
    };
    surface.customProgramCacheKey=()=>'escarpment-grain';
    return outdoorMaterial(surface);
  }
  const m=paint({}),f=paint({transparent:true,opacity:.30,depthWrite:false});
  const pair={m,f};paints.set(T,pair);return pair;
}
function noise(x,y,s){
  let v=Math.imul(x+14893,1597334677)^Math.imul(y+3643,3812015801)^Math.imul(s+7,2654435761);
  v=Math.imul(v^(v>>>15),2246822519);
  return ((v^(v>>>13))>>>0)/4294967296;
}

export function addEscarpments(T,group,map,tile,level,hs,zs,texture){
  if(map.face!=='rock'||!map.hgt)return;
  const M=rockPaint(T,texture),palette=map.biome==='snow'?
    ['#879296','#b5c1c2','#c8d2cc','#e1e3da','#89968e','#9ba693']:
    map.biome==='sand'?
    ['#847362','#a38e74','#c6ae8e','#cdb98c','#91865c','#a49767']:
    ['#788082','#949c97','#b1b4a4','#c4c1a8','#7d8961','#98a279'];
  const colors=palette.map(c=>new T.Color(c));
  function faceRun(x,y,dx,dy,nx,ny,count,high,low){
    const d=(high-low)*level;
    const stacks=Math.max(2,Math.min(5,Math.round(d/(level*.84))));
    const seed=(x*193+y*83+nx*7+ny*17)|0;
    const pos=[],uv=[],ink=[];
    const point=(s,out,z)=>[(x+s*dx+nx*out)*tile,(low*level+z)*hs,(y+s*dy+ny*out)*tile*zs];
    function tri(a,b,c,col,tone=1){
      for(const p of [a,b,c]){
        pos.push(...p);uv.push((p[0]+p[2]*.55)/27,(p[1]+p[2]*.21)/18);
        ink.push(col.r*tone,col.g*tone,col.b*tone);
      }
    }
    function quad(a,b,c,e,col,tone){tri(a,b,c,col,tone);tri(a,c,e,col,tone);}
    // A shallow common dip makes the bedding planes continue through irregular vertical cracks.
    const seam=(s,k)=>k===0?0:k===stacks?d:d*k/stacks+
      (Math.sin(s*.81+seed*.07+k*.33)+.32*Math.sin(s*1.9+k*.55))*Math.min(3.8,d*.19);
    for(let k=0;k<stacks;k++){
      let start=0,index=0;
      while(start<count-.001){
        const r=noise(seed,k,index), jitter=noise(seed,k+37,index);
        let end=Math.min(count,start+.54+(k===0?2.2:2.85)*r*r);
        if(count-end<.34)end=count;
        const gap=Math.min(.014,(end-start)*.024),l=start+gap,rgt=end-gap;
        const taper=s=>Math.min(1,Math.max(0,s/.18),Math.max(0,(count-s)/.18));
        const depth=.075+jitter*.18+(stacks-1-k)*.022;
        const lip=s=>depth*taper(s)+.012;
        const bottom=s=>seam(s,k), top=s=>seam(s,k+1);
        const edge=(s,f,h)=>point(s,lip(s)*f,h);
        const left=edge(l,.67,bottom(l)+.15),right=edge(rgt,.64,bottom(rgt)+.29);
        const lean=Math.min((rgt-l)*.21,.19);
        const upperL=l+lean*(.26+jitter),upperR=rgt-lean*(1.08-jitter);
        const A=edge(upperL,.95,top(upperL)-.69),B=edge(upperR,.87,top(upperR)-.51);
        const mid=(l+rgt)/2+(jitter-.5)*(rgt-l)*.27;
        const C=edge(mid,1.16,top(mid)-.96),E=edge(mid,.92,bottom(mid)-.06);
        const stone=colors[1+(r>.64?1:0)],tone=.83+jitter*.20;
        quad(left,E,C,A,stone,tone);quad(E,right,B,C,stone,tone*.94);
        const a=edge(upperL+.004,.55,top(upperL)-.03),b=edge(mid,.47,top(mid)+.03),c=edge(upperR-.004,.51,top(upperR)-.04);
        quad(A,C,b,a,colors[2],tone*1.03);quad(C,B,c,b,colors[2],tone);
        quad(left,A,a,point(l,0,bottom(l)),colors[0],tone);
        quad(B,right,point(rgt,0,bottom(rgt)),c,colors[0],tone*.93);
        if(k===stacks-1){
          const p=point(upperL,-.045,d+.05),q=point(mid,-.053,d+.11),z=point(upperR,-.046,d+.05);
          quad(a,b,q,p,jitter>.25?colors[4]:colors[3],.99);quad(b,c,z,q,jitter>.55?colors[5]:colors[4],.99);
        }
        if(k===0&&end-start>.75&&jitter>.46){
          const t=l+(end-start)*.42,rad=.11+.16*r;
          const v=[point(t-rad,.10,.02),point(t-.03,.23+rad*.35,.08),point(t+rad,.15,.03),point(t+rad*.39,.06,.05)];
          const peak=point(t-.028,.166,1.05+1.64*jitter);
          for(let i=0;i<4;i++)tri(v[i],v[(i+1)%4],peak,colors[i%3],1.01);
        }
        start=end;index++;
      }
    }
    // Larger buttresses interrupt the thin bedding at faults. Their crowns and chips soften the grassy edge.
    for(let t=.52,i=0;t<count-.24;i++){
      const r=noise(seed,67,i),w=Math.min(.44+r*.46,t-.04,count-t-.04);
      const toe=.24+.23*r,ht=d*(.51+.51*noise(seed,86,i));
      const sketch=[[-1,.07],[-.72,.70],[-.18,1],[.52,.88],[1,.26],[.48,.04]];
      const rings=[[0,1,.97],[ht*.34,.88,1.10],[ht*.76,.78,.94],[ht,.64,.67]];
      const shape=rings.map(([z,size,out],j)=>sketch.map(([u,v],k)=>{
        const along=t+u*w*size+(j*.025),rough=noise(seed,i*5+j,k);
        return point(along,v*toe*out+.012,z+(j?(.5-rough)*Math.min(2.2,d*.15):0));
      }));
      for(let j=0;j<shape.length-1;j++)for(let k=0;k<sketch.length;k++){
        const n=(k+1)%sketch.length;
        quad(shape[j][k],shape[j][n],shape[j+1][n],shape[j+1][k],colors[k===1||k===4?2:1],.84+.13*j+.07*k/sketch.length);
      }
      const cap=shape[shape.length-1],summit=point(t+.06,toe*.33,Math.min(d+.95,ht+.75));
      for(let k=0;k<cap.length;k++)tri(cap[k],cap[(k+1)%cap.length],summit,colors[ht>d*.91?4:2],1.08);
      t+=1.35+r*1.85;
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geo.setAttribute('color',new T.Float32BufferAttribute(ink,3));
    geo.computeVertexNormals();geo.computeBoundingSphere();
    const out=new T.Mesh(geo,M.m);
    out.name='weathered-rock-face';out.castShadow=out.receiveShadow=true;
    out.userData={M,owner:out,cliff:true};group.add(out);
  }
  for(const [nx,ny] of [[0,1],[0,-1],[1,0],[-1,0]]){
    const dx=ny?1:0,dy=nx?1:0;
    const rows=ny?map.h:map.w,cols=ny?map.w:map.h;
    function cut(p,row){
      const x=dx?p:row,y=dy?p:row,X=x+nx,Y=y+ny;
      const hi=map.hgt[y]?.[x],lo=map.hgt[Y]?.[X];
      if(lo==null||!(hi>lo)||map.stair?.[x+','+y]||map.stair?.[X+','+Y])return null;
      return [hi,lo];
    }
    for(let row=0;row<rows;row++)for(let p=0;p<cols;){
      const h=cut(p,row);if(!h){p++;continue;}
      let end=p+1;
      while(end<cols&&end-p<8){const next=cut(end,row);if(!next||next[0]!==h[0]||next[1]!==h[1])break;end++;}
      const x=(dx?p:row)+Math.max(0,nx),y=(dy?p:row)+Math.max(0,ny);
      faceRun(x,y,dx,dy,nx,ny,end-p,h[0],h[1]);p=end;
    }
  }
}
