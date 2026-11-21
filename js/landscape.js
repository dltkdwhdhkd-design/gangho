// Continuous land cover and elevation shared by travel, encounter stages and both renderers.
export const cover = { meadow:0, forest:1, road:2, rock:3, snow:4, sand:5, yard:6, wood:7, slab:8 };
export const wildPlaces = { valley:'forest', bamboo:'forest', pass:'rock', cloudmt:'rock', hwasan:'rock',
  wolha:'forest', silk:'sand', snowpeak:'snow', tiangate:'snow' };
export const wildProps = ['spire','shelf','snowcrag','mesa','oldpine','riverwillow','canes','goldtree','teahut','cairn','reedbed','riverstone'];
const art = { grounds:[], props:{}, horizons:[], settlements:[], ready:false };
export const wildernessArt = art;
const cache = new WeakMap();
let loading;
function canvas(w,h) { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
export function loadWildernessArt() {
  if (loading) return loading;
  const image = async name => {
    const im = new Image(); im.src='assets/hd2d/landscape/'+name+'.webp'; await im.decode(); return im;
  };
  const cut=(im,cols,rows,i)=>{
    const w=im.width/cols,h=im.height/rows,c=canvas(w,h);
    c.getContext('2d').drawImage(im,(i%cols)*w,Math.floor(i/cols)*h,w,h,0,0,w,h);return c;
  };
  loading=Promise.all(['ground','scenery','horizons','settlements'].map(image)).then(([g,p,h,town])=>{
    art.grounds=Array.from({length:9},(_,i)=>{ const tile=cut(g,3,3,i);
      return tile.getContext('2d').getImageData(0,0,tile.width,tile.height); });
    wildProps.forEach((key,i)=>{
      const sq=cut(p,4,3,i),pix=sq.getContext('2d').getImageData(0,0,sq.width,sq.height).data;
      let x0=sq.width,y0=sq.height,x1=0,y1=0;
      for(let y=0;y<sq.height;y++)for(let x=0;x<sq.width;x++)if(pix[(y*sq.width+x)*4+3]>35){
        x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
      }
      const image=canvas(x1-x0+1,y1-y0+1);image.getContext('2d').drawImage(sq,-x0,-y0);art.props[key]=image;
    });
    art.horizons=Array.from({length:4},(_,i)=>cut(h,1,4,i));
    art.settlements=Array.from({length:4},(_,i)=>cut(town,1,4,i));art.ready=true;return art;
  }).catch(()=>{loading=null;return art;});
  return loading;
}
export const clamp01 = t=>Math.max(0,Math.min(1,t));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=(a,b,t)=>{const f=clamp01((t-a)/(b-a));return f*f*(3-2*f);};
export function hashLand(x,y,s=0) {
  let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,144269);
  n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
}
export function noiseLand(x,y,scale,seed) {
  x/=scale;y/=scale;const a=Math.floor(x),b=Math.floor(y);
  const u=ease(0,1,x-a),v=ease(0,1,y-b);
  return mix(mix(hashLand(a,b,seed),hashLand(a+1,b,seed),u),mix(hashLand(a,b+1,seed),hashLand(a+1,b+1,seed),u),v);
}
// Distance in thirds of a tile. The two sweeps are linear in map area and run only on entry.
function distances(w,h,test) {
  const d=new Uint8Array(w*h);
  for(let y=0,i=0;y<h;y++)for(let x=0;x<w;x++,i++){
    if(test(i,x,y))continue;
    let n=240;
    if(x)n=Math.min(n,d[i-1]+3);
    if(y){n=Math.min(n,d[i-w]+3);if(x)n=Math.min(n,d[i-w-1]+4);if(x+1<w)n=Math.min(n,d[i-w+1]+4);}
    d[i]=n;
  }
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){
    const i=y*w+x;let n=d[i];if(!n)continue;
    if(x+1<w)n=Math.min(n,d[i+1]+3);
    if(y+1<h){n=Math.min(n,d[i+w]+3);if(x)n=Math.min(n,d[i+w-1]+4);if(x+1<w)n=Math.min(n,d[i+w+1]+4);}
    d[i]=n;
  }
  return d;
}
const limit=(i,n)=>Math.max(0,Math.min(n-1,i));
export function buildLandscape(map,{classes,biomes,sites=[],seed=17,kind='meadow'}={}) {
  const {w,h,g}=map,n=w*h,isWorld=map.id==='world',hasClasses=!!classes,riverBridge=isWorld||map.encounter?.bridges;
  const wet=(i,x,y)=>g[y][x]===2 || (riverBridge && g[y][x]===4);
  const white=i=>classes?.[i]===6 || classes?.[i]===13;
  const mount=(i,x,y)=>hasClasses ? classes[i]===5 || classes[i]===6 :
    g[y][x]===6 || (Math.min(x,y,w-1-x,h-1-y)<3 && g[y][x]===0 && ['rock','snow','sand'].includes(kind));
  const waterDist=distances(w,h,wet),landDist=distances(w,h,(i,x,y)=>!wet(i,x,y));
  const ridge=distances(w,h,mount),valley=distances(w,h,(i,x,y)=>!mount(i,x,y));
  const roads=distances(w,h,(i,x,y)=>[1,3,4,5].includes(g[y][x]));
  const terrace=new Uint8Array(n);
  for(const s of sites)for(let y=limit(s.y0,h);y<=limit(s.y1,h);y++)
    terrace.fill(1,y*w+limit(s.x0,w),y*w+limit(s.x1,w)+1);
  const building=sites.length?distances(w,h,i=>!!terrace[i]):null;
  const bottom=new Float32Array(n),material=new Uint8Array(n);
  const at=(a,x,y)=>a[limit(y,h)*w+limit(x,w)];
  // A vertex lives at the center of a map tile; physical queries and the triangle mesh share this convention.
  for(let y=0,i=0;y<h;y++)for(let x=0;x<w;x++,i++){
    const c=classes?.[i], b=biomes?.[y]?.[x],v=g[y][x];
    const climate=hasClasses ? white(i)||b===4?'snow':c===7||b===2?'sand':c===4||b===1||b===5?'forest':'meadow':kind;
    material[i]=climate==='rock'?cover.meadow:cover[climate]??0;
    if(v===3)material[i]=cover.yard;else if(v===5)material[i]=cover.slab;else if(v===4&&!riverBridge)material[i]=cover.wood;
    const ds=(waterDist[i]-landDist[i])/3, rm=(valley[i]-ridge[i])/3;
    if(ds<0){bottom[i]=-2.8-Math.min(7,-ds)*1.3;continue;}
    const a=noiseLand(x,y,17,seed), b0=noiseLand(x,y,6,seed+3), coarse=noiseLand(x,y,61,seed+1);
    const grass=2.0+9*coarse+4.5*a;
    let ht=grass+(1-ease(0,9,-rm))*(9+8*a);
    const peak=ease(-1.8,6,rm);
    ht+=peak*(28+72*a+20*b0+Math.min(18,Math.max(0,rm))*1.5);
    if(!isWorld){
      const north=1-y/Math.max(1,h-1);
      ht+=north*north*(kind==='snow'?41:kind==='rock'?27:kind==='sand'?9:12);
      ht+=Math.max(0,Math.sin(x*.14+y*.065))*((kind==='sand'?11:3)*b0);
    }
    if(building)ht*=ease(0,4.5,building[i]/3);
    if(isWorld && g[y][x]===4)ht=-4;
    bottom[i]=mix(.05,ht,ease(.4,5.0,ds));
  }
  const field={
    w,h,kind,isWorld,material,roads,waterDist,landDist,ridge,valley,heights:bottom,seed,
    index(x,y){return limit(Math.floor(y),h)*w+limit(Math.floor(x),w);},
    sample(array,x,y){
      x-=.5;y-=.5;const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j;
      return mix(mix(at(array,i,j),at(array,i+1,j),u),mix(at(array,i,j+1),at(array,i+1,j+1),u),v);
    },
    height(x,y){
      x-=.5;y-=.5;const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j;
      const a=at(bottom,i,j),b=at(bottom,i+1,j),c=at(bottom,i,j+1),d=at(bottom,i+1,j+1);
      return u+v<=1 ? a+u*(b-a)+v*(c-a) : d+(1-u)*(c-d)+(1-v)*(b-d);
    },
    shore(x,y){return (this.sample(waterDist,x,y)-this.sample(landDist,x,y))/3;},
    climate(x,y){return material[this.index(x,y)];}
  };
  return field;
}
export function landscapeOf(map) {
  if(!map)return null;
  if(map.landscape)return map.landscape;
  if(!wildPlaces[map.id])return null;
  if(!cache.has(map))cache.set(map,buildLandscape(map,{kind:wildPlaces[map.id],seed:map.id.length*17}));
  return cache.get(map);
}
const pixelsPerTile=22,chunkSize=24;
const chunks=new WeakMap();
const baseColors=[[106,119,68],[64,88,67],[167,142,111],[123,126,117],[207,218,222],[188,154,107],[139,135,118],[141,109,80],[148,148,134]];
function chunkImage(field,cx,cy) {
  let lru=chunks.get(field);if(!lru)chunks.set(field,lru=new Map());
  const key=cx+','+cy+','+Number(art.ready);if(lru.has(key)){const old=lru.get(key);lru.delete(key);lru.set(key,old);return old;}
  const S=pixelsPerTile,C=chunkSize,w=S*C,im=canvas(w,w),ctx=im.getContext('2d'),buf=ctx.createImageData(w,w);
  const stride=C+1, nodes=[];
  for(let j=0;j<=C;j++)for(let i=0;i<=C;i++){
    const x=cx*C+i,y=cy*C+j;
    const road=field.sample(field.roads,x,y)/3, rock=(field.sample(field.valley,x,y)-field.sample(field.ridge,x,y))/3;
    const shore=field.shore(x,y),m=field.climate(x,y);
    nodes.push([road,rock,shore,m,noiseLand(x,y,5,5),noiseLand(x,y,16,31)]);
  }
  const tex=art.grounds,tw=tex[0]?.width||128;
  for(let y=0,di=0;y<w;y++)for(let x=0;x<w;x++,di+=4){
    const tx=Math.floor(x/S),ty=Math.floor(y/S),u=(x%S+.5)/S,v=(y%S+.5)/S;
    const k=ty*stride+tx,a=nodes[k],b=nodes[k+1],c=nodes[k+stride],d=nodes[k+stride+1];
    const aa=(1-u)*(1-v),bb=u*(1-v),cc=(1-u)*v,dd=u*v;
    const gridX=cx*w+x,gridY=cy*w+y,wx=gridX+(field.offsetX||0)*S,wy=gridY+(field.offsetY||0)*S;
    const n=a[4]*aa+b[4]*bb+c[4]*cc+d[4]*dd, broad=a[5]*aa+b[5]*bb+c[5]*cc+d[5]*dd;
    const grain=hashLand(wx>>1,wy>>1,19);
    const road=a[0]*aa+b[0]*bb+c[0]*cc+d[0]*dd+(n-.5)*.38+(grain-.5)*.24;
    const r=a[1]*aa+b[1]*bb+c[1]*cc+d[1]*dd;
    const shore=a[2]*aa+b[2]*bb+c[2]*cc+d[2]*dd;
    const mat=field.climate(gridX/S,gridY/S),built=mat>=6,snow=mat===cover.snow;
    const path=built?0:1-ease(.17,1.12,road),stone=built?0:Math.max(ease(-1.9,1.4,r),.72*(1-ease(.15,1.8,Math.abs(shore))));
    const ox=built?0:Math.floor(54*n+23*broad),oy=built?0:Math.floor(43*broad-27*n);
    const ix=((wx+ox)%tw+tw)%tw,iy=((wy+oy)%tw+tw)%tw,ti=(iy*tw+ix)*4;
    const jx=((Math.floor(wx*.69+wy*.56+37)%tw)+tw)%tw,jy=((Math.floor(wy*.69-wx*.56+81)%tw)+tw)%tw,tj=(jy*tw+jx)*4;
    const ia=a[3],ib=b[3],ic=c[3],id=d[3],rc=(snow?cover.snow:cover.rock),pt=snow?cover.snow:cover.road;
    const variation=(.84+.24*broad+.07*n)*(snow?1.04:1.03);
    for(let ch=0;ch<3;ch++){
      let g;
      if(tex.length){
        const si=ti+ch;
        g=built?tex[mat].data[si]:tex[ia].data[si]*aa+tex[ib].data[si]*bb+tex[ic].data[si]*cc+tex[id].data[si]*dd;
        if(!built)g=mix(g,tex[mat].data[tj+ch],.26+.15*broad);
        g=mix(g,tex[rc].data[si]*(snow?.92:.91),stone);
        g=mix(g,tex[pt].data[si]*(snow?.78:1.08),path);
      }else{g=mix(mix(baseColors[mat][ch],baseColors[rc][ch],stone),baseColors[pt][ch],path);}
      buf.data[di+ch]=g*variation;
    }
    if(shore<.2 && !built){
      const t=1-ease(-2.4,.2,shore);
      for(let ch=0;ch<3;ch++)buf.data[di+ch]=mix(buf.data[di+ch],[48,105,99][ch],t*.73);
    }
    buf.data[di+3]=255;
  }
  ctx.putImageData(buf,0,0);lru.set(key,im);if(lru.size>42)lru.delete(lru.keys().next().value);return im;
}
export function paintLandscape(ctx,field,area,tile=16) {
  const C=chunkSize;
  ctx.save();ctx.beginPath();ctx.rect(0,0,(area.x1-area.x0)*tile,(area.y1-area.y0)*tile);ctx.clip();
  for(let j=Math.floor(area.y0/C);j<Math.ceil(area.y1/C);j++)for(let i=Math.floor(area.x0/C);i<Math.ceil(area.x1/C);i++){
    const im=chunkImage(field,i,j);
    ctx.drawImage(im,(i*C-area.x0)*tile,(j*C-area.y0)*tile,C*tile,C*tile);
  }
  ctx.restore();
}
