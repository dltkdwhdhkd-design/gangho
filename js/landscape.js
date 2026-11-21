// Continuous land cover and elevation shared by travel, encounter stages and both renderers.
export const cover = { meadow:0, forest:1, road:2, rock:3, snow:4, sand:5, yard:6, wood:7, slab:8 };
export const wildPlaces = { valley:'forest', bamboo:'forest', pass:'rock', cloudmt:'rock', hwasan:'rock',
  wolha:'forest', silk:'sand', snowpeak:'snow', tiangate:'snow' };
export const wildProps = ['spire','shelf','snowcrag','mesa','oldpine','riverwillow','canes','goldtree','teahut','cairn','reedbed','riverstone'];
const miniatures = ['miniGrove','miniFirs','miniBamboo','miniPlum','miniKarst','miniSlate','miniSnow','miniMesa','miniBank','miniReeds','miniArch','miniHamlet'];
const art = { grounds:[], travelGrounds:[], props:{}, horizons:[], settlements:[], ready:false };
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
  const tiles=(sheet,cols,rows)=>Array.from({length:cols*rows},(_,i)=>{ const tile=cut(sheet,cols,rows,i);
      return tile.getContext('2d').getImageData(0,0,tile.width,tile.height); });
  const cutProps=(p,names)=>names.forEach((key,i)=>{
      const sq=cut(p,4,3,i),pix=sq.getContext('2d').getImageData(0,0,sq.width,sq.height).data;
      let x0=sq.width,y0=sq.height,x1=0,y1=0;
      for(let y=0;y<sq.height;y++)for(let x=0;x<sq.width;x++)if(pix[(y*sq.width+x)*4+3]>35){
        x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
      }
      const image=canvas(x1-x0+1,y1-y0+1);image.getContext('2d').drawImage(sq,-x0,-y0);art.props[key]=image;
    });
  loading=Promise.all(['ground','scenery','horizons','settlements','travel-miniatures','travel-materials'].map(image)).then(([g,p,h,town,mini,soil])=>{
    art.grounds=tiles(g,3,3);art.travelGrounds=tiles(soil,3,2);
    cutProps(p,wildProps);cutProps(mini,miniatures);
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
function channelBanks(w,h,water,land){
  const row=new Float32Array(w*h),smoothed=new Float32Array(w*h),weights=[1,2,3,2,1];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let v=0;for(let j=-2;j<=2;j++){const i=y*w+limit(x+j,w);v+=(water[i]-land[i])*weights[j+2];}
    row[y*w+x]=v/27;
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let v=0;for(let j=-2;j<=2;j++)v+=row[limit(y+j,h)*w+x]*weights[j+2];
    const i=y*w+x,raw=(water[i]-land[i])/3;
    smoothed[i]=mix(raw,v/9,.78);
    if(raw<0)smoothed[i]=Math.min(-.28,smoothed[i]);
  }
  return smoothed;
}
const routesByRegion={cheongha:1,hwasan:2,wudang:3,seongdo:4,silk:5,tiangate:6};
function routeClimate(map){
  const {w,h}=map,region=new Uint8Array(w*h),strength=new Uint8Array(w*h);
  for(const stop of map.scenicStops||[]){
    const id=routesByRegion[stop.from];
    for(const [cx,cy] of stop.trail)for(let y=Math.max(0,cy-19);y<Math.min(h,cy+20);y++)for(let x=Math.max(0,cx-19);x<Math.min(w,cx+20);x++){
      const dx=x-cx,dy=y-cy,d=(dx*dx+dy*dy)/360;
      if(d>=1)continue;
      const s=Math.round((1-ease(.06,1,d))*255),i=y*w+x;
      if(s>strength[i]){strength[i]=s;region[i]=id;}
    }
  }
  return {region,strength};
}
// Reduce broad painted roads to connected centre lines so the verge and wheel tracks can have their own widths.
function roadCentre(map,classes){
  const {w,h,g}=map,mask=new Uint8Array(w*h),work=[];
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const i=y*w+x;
    if((classes?classes[i]===8||classes[i]===9:g[y][x]===1)||g[y][x]===4){mask[i]=1;work.push(i);}
  }
  const links=[-w,1-w,1,1+w,w,w-1,-1,-1-w],ring=new Uint8Array(8),remove=[];
  let changed=1;
  while(changed){
    changed=0;
    for(let pass=0;pass<2;pass++){
      remove.length=0;
      for(const i of work){
        if(!mask[i])continue;
        let count=0,starts=0;
        for(let d=0;d<8;d++){ring[d]=mask[i+links[d]];count+=ring[d];}
        if(count<2||count>6)continue;
        for(let d=0;d<8;d++)if(!ring[d]&&ring[(d+1)%8])starts++;
        if(starts!==1)continue;
        const [n,e,s,west]=[ring[0],ring[2],ring[4],ring[6]];
        if(pass?(n*e*west||n*s*west):(n*e*s||e*s*west))continue;
        remove.push(i);
      }
      for(const i of remove)mask[i]=0;
      changed+=remove.length;
    }
  }
  for(const stop of map.scenicStops||[])for(const [x,y] of stop.trail)mask[y*w+x]=1;
  return distances(w,h,i=>mask[i]);
}
export function buildLandscape(map,{classes,biomes,sites=[],seed=17,kind='meadow'}={}) {
  const {w,h,g}=map,n=w*h,isWorld=map.id==='world',hasClasses=!!classes,riverBridge=isWorld||map.encounter?.bridges;
  const wet=(i,x,y)=>g[y][x]===2 || (riverBridge && g[y][x]===4);
  const white=i=>classes?.[i]===6 || classes?.[i]===13;
  const mount=(i,x,y)=>hasClasses ? classes[i]===5 || classes[i]===6 :
    g[y][x]===6 || (Math.min(x,y,w-1-x,h-1-y)<3 && g[y][x]===0 && ['rock','snow','sand'].includes(kind));
  const waterDist=distances(w,h,wet),landDist=distances(w,h,(i,x,y)=>!wet(i,x,y));
  const banks=channelBanks(w,h,waterDist,landDist);
  const ridge=distances(w,h,mount),valley=distances(w,h,(i,x,y)=>!mount(i,x,y));
  const roads=distances(w,h,(i,x,y)=>[1,3,4,5].includes(g[y][x]));
  const regional=isWorld?routeClimate(map):null;
  const tracks=isWorld&&classes?distances(w,h,(i,x,y)=>classes[i]===8||classes[i]===9||g[y][x]===4):roads;
  const centre=isWorld?roadCentre(map,classes):tracks;
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
    const ds=banks[i], rm=(valley[i]-ridge[i])/3;
    if(ds<=0){bottom[i]=-1.5-Math.min(8,-ds)*1.44;continue;}
    const a=noiseLand(x,y,17,seed), b0=noiseLand(x,y,6,seed+3), coarse=noiseLand(x,y,61,seed+1);
    const grass=2.0+9*coarse+4.5*a;
    let ht=grass+(1-ease(0,9,-rm))*(9+8*a);
    const peak=ease(-1.8,6,rm);
    ht+=peak*(28+72*a+20*b0+Math.min(18,Math.max(0,rm))*1.5);
    if(isWorld){
      // Fold the uplands into long spines and leave a saddle where a mapped road cuts through.
      const fold=1-Math.abs(2*noiseLand(x*.82+y*.52,y*.42-x*.25,9,seed+12)-1);
      const rise=ease(-5,6,rm),spine=fold*fold,alpine=climate==='snow'?1.28:climate==='sand'?.77:1;
      ht=grass+rise*(20+alpine*(24*a+98*spine+Math.min(26,Math.max(0,rm))*1.8));
      ht=mix(ht,grass+rise*(11+16*coarse),.76*(1-ease(.5,4.5,roads[i]/3)));
      const id=regional.region[i],flank=ease(.9,7.2,tracks[i]/3)*regional.strength[i]/255;
      const flankHeight=id===2?57:id===6?68:id===5?29:id===4?18:10;
      ht+=flank*flankHeight*(.34+.66*spine);
    }else{
      const north=1-y/Math.max(1,h-1);
      ht+=north*north*(kind==='snow'?41:kind==='rock'?27:kind==='sand'?9:12);
      ht+=Math.max(0,Math.sin(x*.14+y*.065))*((kind==='sand'?11:3)*b0);
    }
    if(building)ht*=ease(0,4.5,building[i]/3);
    if(isWorld && g[y][x]===4)ht=-4;
    bottom[i]=mix(-1.5+Math.min(2.2,ds)*1.44,ht,ease(.65,5.0,ds));
  }
  const field={
    w,h,kind,isWorld,material,roads,tracks,centre,regional,waterDist,landDist,ridge,valley,settlementDistance:building,heights:bottom,seed,
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
    shore(x,y){return this.sample(banks,x,y);},
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
// Compose the regional map at walking scale. Mixtures live at grid nodes and interpolate across tile and texture-chunk boundaries.
function regionalPainter(field,cx,cy,buf,S,C) {
  const size=C*S,tex=art.grounds.map(t=>t.data),sheets=art.travelGrounds.map(t=>t.data);
  const tw=art.grounds[0].width,mw=art.travelGrounds[0].width;
  const node=[],stride=C+1;
  for(let j=0;j<=C;j++)for(let i=0;i<=C;i++){
    const x=cx*C+i,y=cy*C+j,index=field.index(x,y),regional=field.regional;
    let wood=0,snow=0,sand=0,paved=0,road=0;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const weight=(3-Math.abs(dx))*(3-Math.abs(dy))/81;
      const k=field.index(x+dx-.35,y+dy-.35),mat=field.material[k];
      wood+=(mat===1)*weight;snow+=(mat===4)*weight;sand+=(mat===5)*weight;paved+=(mat>=6)*weight;
    }
    for(const [dx,dy,w] of [[0,0,.56],[-.55,0,.11],[.55,0,.11],[0,-.55,.11],[0,.55,.11]])road+=field.sample(field.centre,x+dx,y+dy)*w/3;
    const ridge=(field.sample(field.valley,x,y)-field.sample(field.ridge,x,y))/3,bank=field.shore(x,y);
    const n=noiseLand(x,y,5,14),grain=noiseLand(x,y,21,7),warp=noiseLand(x+37,y,8,43);
    const influence=regional.strength[index]/255,region=regional.region[index];
    if(region===6){snow=mix(snow,.97,influence);sand*=1-influence;}
    if(region===5){sand=mix(sand,.96,influence);snow*=1-influence;}
    if(region===4)wood=mix(wood,.86,influence);
    if(region===1||region===2||region===3){wood*=1-.2*influence;sand*=1-.8*influence;}
    const farm=(1-ease(5,20,(field.settlementDistance?.[index]??240)/3))*ease(.34,.56,grain)*(1-ease(-2,1,ridge))*ease(1,4,bank)*(1-wood)*(1-sand)*(1-snow);
    const slope=Math.hypot(field.height(x-1,y)-field.height(x+1,y),field.height(x,y-1)-field.height(x,y+1))/32;
    const bare=ease(.16,.74,slope)*((region===2||region===5||region===6)?.80:.55);
    node.push([road,ridge,bank,wood,snow,sand,paved,farm,n,grain,warp,bare]);
  }
  const value=new Float32Array(12),data=buf.data;
  return (first,last)=>{for(let y=first,k=first*size*4;y<last;y++)for(let x=0;x<size;x++,k+=4){
    const tx=x/S,ty=y/S,ix=Math.floor(tx),iy=Math.floor(ty),u=tx-ix,v=ty-iy,index=iy*stride+ix;
    const a=node[index],b=node[index+1],c=node[index+stride],d=node[index+stride+1];
    const u0=(1-u)*(1-v),u1=u*(1-v),u2=(1-u)*v,u3=u*v;
    for(let h=0;h<12;h++)value[h]=a[h]*u0+b[h]*u1+c[h]*u2+d[h]*u3;
    const X=cx*size+x,Y=cy*size+y,n=value[8],broad=value[9],bend=value[10];
    const coverNoise=.14*(n-.5)+.07*(bend-.5),snow=ease(.10,.9,value[4]+coverNoise),sand=ease(.08,.90,value[5]+coverNoise),wood=ease(.08,.92,value[3]+coverNoise);
    const stone=Math.max(ease(-1.5,2.8,value[1]+(n-.5)*2.3),value[11]),farm=value[7];
    const offset=(n-.5)*14+(bend-.5)*17;
    const pixel=(Math.floor(Y*2.85-X*.21+offset)&(tw-1))*tw+(Math.floor(X*2.85+Y*.14+offset)&(tw-1));
    const detail=(Math.floor(Y*1.94-X*.34+bend*17)&(mw-1))*mw+(Math.floor(X*1.94+Y*.32+n*17)&(mw-1));
    const road=value[0]+(n-.5)*.37+(bend-.5)*.24+(hashLand(X,Y,19)-.5)*.07;
    const path=1-ease(.52,1.65,road),rut=1-ease(.055,.18,Math.abs(road-.73));
    const shelf=1-ease(-.8,1.8,value[2]),beach=(1-ease(.15,2.8,Math.abs(value[2]-.65)))*(1-stone);
    const yard=ease(.17,.85,value[6]),grassLight=.90+.18*broad+.07*n;
    for(let ch=0;ch<3;ch++){
      const f=pixel*4+ch,m=detail*4+ch;
      let grass=mix(tex[0][f],sheets[1][m]*[.84,.98,.83][ch],.33);
      grass=mix(grass,sheets[0][m]*[.90,.99,.84][ch],farm*.72);
      grass=mix(grass,mix(tex[1][f],grass,.22),wood*.88);
      let natural=mix(grass,mix(tex[3][f],sheets[2][m],.70),stone);
      natural=mix(natural,mix(tex[5][f],sheets[4][m],.74),sand);
      natural=mix(natural,mix(tex[4][f],sheets[3][m],.54),snow);
      natural=mix(natural,sheets[5][m]*[.95,1,.90][ch],beach*.65);
      const soil=mix(mix(mix([164,147,102][ch],tex[2][f],.49),sheets[4][m],.18),mix(tex[4][f],sheets[3][m],.45)*.77,snow);
      natural=mix(natural,soil*(.96+.095*rut+.06*bend),path);
      natural=mix(natural,tex[6][f],yard*.82);
      data[k+ch]=mix(natural*grassLight,sheets[5][m]*[.63,.81,.79][ch],shelf*.72);
    }
    data[k+3]=255;
  }};
}
function chunkImage(field,cx,cy) {
  let lru=chunks.get(field);if(!lru)chunks.set(field,lru=new Map());
  const key=cx+','+cy+','+Number(art.ready);if(lru.has(key)){const old=lru.get(key);lru.delete(key);lru.set(key,old);return old;}
  const S=field.isWorld?12:pixelsPerTile,C=chunkSize,w=S*C,im=canvas(w,w),ctx=im.getContext('2d'),buf=ctx.createImageData(w,w);
  if(field.isWorld&&art.travelGrounds.length){
    regionalPainter(field,cx,cy,buf,S,C)(0,w);ctx.putImageData(buf,0,0);lru.set(key,im);
    if(lru.size>66)lru.delete(lru.keys().next().value);return im;
  }
  const stride=C+1, nodes=[];
  for(let j=0;j<=C;j++)for(let i=0;i<=C;i++){
    const x=cx*C+i,y=cy*C+j;
    const road=field.sample(field.roads,x,y)/3, rock=(field.sample(field.valley,x,y)-field.sample(field.ridge,x,y))/3;
    const shore=field.shore(x,y),m=field.climate(x,y);
    const farm=field.settlementDistance?field.sample(field.settlementDistance,x,y)/3:100;
    nodes.push([road,rock,shore,m,noiseLand(x,y,5,5),noiseLand(x,y,16,31),farm]);
  }
  const tex=art.grounds,tw=tex[0]?.width||128,travel=art.travelGrounds,macroW=travel[0]?.width||256;
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
    const farm=field.isWorld&&mat===cover.meadow&&stone<.2&&shore>2&&a[6]<16&&broad>.40;
    const macro=shore<.45?5:snow?3:mat===cover.sand?4:stone>.52?2:farm?0:1;
    const scale=field.isWorld?1.82:.79;
    const mx=Math.floor((wx+.22*wy)*scale+n*15)&(macroW-1),my=Math.floor((wy-.24*wx)*scale+broad*22)&(macroW-1);
    const mi=(my*macroW+mx)*4,amount=(built||!travel.length)?0:(field.isWorld?(farm?.80:macro===1?.48:.72):.30)*(1-path);
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
      if(amount)g=mix(g,travel[macro].data[mi+ch],amount);
      buf.data[di+ch]=g*variation;
    }
    if(shore<.2 && !built){
      const t=1-ease(-2.4,.2,shore);
      for(let ch=0;ch<3;ch++)buf.data[di+ch]=mix(buf.data[di+ch],[48,105,99][ch],t*.73);
    }
    buf.data[di+3]=255;
  }
  ctx.putImageData(buf,0,0);lru.set(key,im);if(lru.size>(field.isWorld?66:42))lru.delete(lru.keys().next().value);return im;
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

// Prepare the next strip while the party walks. Small row slices keep keyboard input and the render loop responsive.
let warming=0;
export function warmTravelEdges(field,area){
  const job=++warming,lru=chunks.get(field);
  if(!field?.isWorld||!art.ready||!lru)return;
  const C=chunkSize,S=12,size=C*S,queue=[];
  const left=Math.floor(area.x0/C),right=Math.ceil(area.x1/C)-1,top=Math.floor(area.y0/C),bottom=Math.ceil(area.y1/C)-1;
  for(let y=top-1;y<=bottom+1;y++)for(let x=left-1;x<=right+1;x++){
    if(x>=left&&x<=right&&y>=top&&y<=bottom)continue;
    if(x<0||y<0||x*C>=field.w||y*C>=field.h)continue;
    const key=x+','+y+',1';if(!lru.has(key))queue.push({x,y,key});
  }
  const defer=cb=>typeof requestIdleCallback==='function'?requestIdleCallback(cb,{timeout:240}):setTimeout(cb,28);
  let tile=null;
  function advance(){
    if(job!==warming)return;
    const until=performance.now()+3.4;
    do{
      if(!tile){
        tile=queue.shift();if(!tile)return;
        if(lru.has(tile.key)){tile=null;continue;}
        tile.im=canvas(size,size);tile.ctx=tile.im.getContext('2d');tile.buf=tile.ctx.createImageData(size,size);
        tile.paint=regionalPainter(field,tile.x,tile.y,tile.buf,S,C);tile.row=0;
      }
      const end=Math.min(size,tile.row+5);tile.paint(tile.row,end);tile.row=end;
      if(end===size){
        tile.ctx.putImageData(tile.buf,0,0);lru.set(tile.key,tile.im);
        if(lru.size>66)lru.delete(lru.keys().next().value);tile=null;
      }
    }while(performance.now()<until);
    defer(advance);
  }
  if(queue.length)defer(advance);
}
