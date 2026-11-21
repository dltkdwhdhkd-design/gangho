// Outdoor illumination is sampled in map coordinates, so cloud shadows stay on the landscape as the camera follows the party.
const atmosphere = {
  morning: { sun:[.86,.48,-.32], sunC:'#ffe1ad', sunI:3.75, sky:'#b2cad9', gnd:'#63553e', hemI:.94, fill:.15, fillC:'#b6c8cf', fog:'#c7c8af', skyT:'#b1c6ce', tint:[1.02,1,.96], expo:1.17, sat:.89, con:1.11, vig:.43, warm:0, lamp:0 },
  day: { sun:[-.58,.88,-.42], sunC:'#fff0c9', sunI:3.85, sky:'#b6c9d2', gnd:'#5d5741', hemI:.87, fill:.14, fillC:'#c3cfd2', fog:'#bcc7ba', skyT:'#aac1cc', tint:[1,1.015,.98], expo:1.17, sat:.89, con:1.12, vig:.43, warm:0, lamp:0 },
  evening: { sun:[-.93,.32,.28], sunC:'#ffba76', sunI:3.85, sky:'#a7b8d3', gnd:'#53464b', hemI:1.04, fill:.13, fillC:'#aab7db', fog:'#baa6a1', skyT:'#a7a9be', tint:[1.02,.99,1.01], expo:1.16, sat:.93, con:1.10, vig:.51, warm:0, lamp:.48 },
  night: { sun:[.39,.65,-.69], sunC:'#b8cff7', sunI:1.02, sky:'#879cc3', gnd:'#454e60', hemI:.69, fill:.14, fillC:'#9bacbe', fog:'#586b7e', skyT:'#506981', tint:[.88,.99,1.12], expo:.91, sat:.66, con:1.09, vig:.62, warm:0, lamp:1.12 }
};
const periods=['morning','day','evening','night'];
const ridges=['#979f96','#899a91','#947e84','#47566e'];
periods.forEach((name,i)=>{atmosphere[name].mtn=ridges[i];});
let cachedPhase=-1,blended;
export function daylight(when,clock){
  if(!Number.isFinite(clock))return atmosphere[when];
  const phase=((Math.round(clock*1800)%1800)+1800)%1800;
  if(phase===cachedPhase)return blended;
  cachedPhase=phase;
  const p=phase/1800,edges=[0,.25,.55,.75];
  for(let i=0;i<4;i++){
    const d=(p-edges[i]+1.5)%1-.5;if(Math.abs(d)>.029)continue;
    const a=atmosphere[periods[(i+3)%4]],b=atmosphere[periods[i]],t=(d+.029)/.058,k=t*t*(3-2*t);
    const mix=(x,y)=>x+(y-x)*k;
    const color=(x,y)=>'#'+[1,3,5].map(n=>Math.round(mix(parseInt(x.slice(n,n+2),16),parseInt(y.slice(n,n+2),16))).toString(16).padStart(2,'0')).join('');
    blended={};
    for(const key of Object.keys(a)){
      const v=a[key],next=b[key];
      blended[key]=typeof v==='string'?color(v,next):Array.isArray(v)?v.map((n,j)=>mix(n,next[j])):mix(v,next);
    }
    return blended;
  }
  blended=atmosphere[when];return blended;
}
const uniforms = { travelSun:{value:null}, travelWeather:{value:null} };
export function outdoorUniforms(T,profile,weather,world) {
  (uniforms.travelSun.value ||= new T.Vector3()).set(...profile.sun).normalize();
  (uniforms.travelWeather.value ||= new T.Vector3()).set(weather,performance.now()*.000038,world?1:.58);
}
// Preserve each underlying material's alpha cutout, depth and texel filtering.
export function outdoorMaterial(material,hills=false) {
  const compile=material.onBeforeCompile,previousKey=material.customProgramCacheKey();
  material.onBeforeCompile=function(shader,renderer){
    compile.call(this,shader,renderer);
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader='varying vec3 travelPlace;\n'+(hills?'attribute vec4 skyline; varying vec4 travelRim;\n':'')+shader.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\ntravelPlace=(modelMatrix*vec4(transformed,1.)).xyz;'+(hills?'travelRim=skyline;':''));
    shader.fragmentShader='uniform vec3 travelSun, travelWeather; varying vec3 travelPlace;\n'+(hills?'varying vec4 travelRim;\n':'')+`
      float weatherHash(vec2 p){return fract(sin(dot(mod(p,321.),vec2(41.71,97.43)))*4375.17);}
      float cloudLayer(vec2 q){vec2 p=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(weatherHash(p),weatherHash(p+vec2(1,0)),f.x),mix(weatherHash(p+vec2(0,1)),weatherHash(p+vec2(1)),f.x),f.y);}
    `+shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
      if(travelWeather.x>.001){
        vec2 q=travelPlace.xz/(195.*travelWeather.z)+vec2(travelWeather.y,-travelWeather.y*.33);
        float cloud=smoothstep(.33,.77,.72*cloudLayer(q)+.28*cloudLayer(2.37*q+3.5));
        float shade=1.-.39*cloud*min(travelWeather.x,1.);
        `+(hills?`
        vec2 a=abs(travelSun.xz); vec2 horizon=vec2(travelSun.x<0.?travelRim.x:travelRim.y,travelSun.z<0.?travelRim.z:travelRim.w);
        float rim=dot(horizon,a)/(a.x+a.y+.001);
        float solar=travelSun.y/max(.05,length(travelSun.xz));
        float lee=smoothstep(solar-.13,solar+.15,rim);
        shade*=1.-.56*lee;
        float basin=dot(travelRim,vec4(.25));
        reflectedLight.indirectDiffuse*=1.-.23*smoothstep(.06,.7,basin);
        `:'')+`
        reflectedLight.directDiffuse*=vec3(shade,shade+.035*(1.-shade),shade+.12*(1.-shade));
      }`);
  };
  material.customProgramCacheKey=()=>previousKey+(hills?'-terrain-skyline':'-outdoor-cloud');
  return material;
}
// Four horizons store the steepest neighbouring slope on each side. The light samples the pair facing the sun.
export function terrainHorizons(T,geo,field,midX,midY,tile,hs,zs) {
  const p=geo.attributes.position,sky=new Float32Array(p.count*4),ground=field.heights,w=field.w,h=field.h;
  const memo=new Map(),clamp=(a,n)=>Math.max(0,Math.min(n-1,a));
  for(let i=0;i<p.count;i++){
    const x=clamp(Math.floor(midX+p.getX(i)/tile),w),y=clamp(Math.floor(midY+p.getZ(i)/(tile*zs)),h),cell=y*w+x;
    let horizon=memo.get(cell);
    if(!horizon){
      horizon=[0,0,0,0];
      for(const r of [2,6,14]){
        const scale=hs/(r*tile),height=ground[cell];
        horizon[0]=Math.max(horizon[0],(ground[y*w+clamp(x-r,w)]-height)*scale);
        horizon[1]=Math.max(horizon[1],(ground[y*w+clamp(x+r,w)]-height)*scale);
        horizon[2]=Math.max(horizon[2],(ground[clamp(y-r,h)*w+x]-height)*scale/zs);
        horizon[3]=Math.max(horizon[3],(ground[clamp(y+r,h)*w+x]-height)*scale/zs);
      }
      memo.set(cell,horizon);
    }
    sky.set(horizon,i*4);
  }
  geo.setAttribute('skyline',new T.BufferAttribute(sky,4));
}
