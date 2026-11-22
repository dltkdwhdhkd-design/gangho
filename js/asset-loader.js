// The initial maps need hundreds of small textures. Read their release packs first.
// Keep requests for everything else bounded, including when a server asks us to wait.
const packed=new Map(), images=new Map(), waiting=[];
const limit=6;
let occupied=0, resumeAt=0, warm;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function withSlot(task) {
  if(occupied<limit)occupied++;
  else await new Promise(resolve=>waiting.push(resolve));
  try {return await task();}
  finally {const next=waiting.shift();if(next)next();else occupied--;}
}

async function read(url,method) {
  return withSlot(async()=>{
    for(let attempt=0;;attempt++){
      while(resumeAt>Date.now())await delay(Math.min(60000,resumeAt-Date.now()));
      const response=await fetch(url);
      if(response.ok)return response[method]();
      const transient=response.status===429 || response.status===503;
      const error=new Error('HTTP '+response.status+' '+url);
      if(!transient)throw error;
      const retry=response.headers.get('Retry-After');
      const seconds=retry!==null && /^\d+(?:\.\d+)?$/.test(retry.trim())?Number(retry):NaN;
      const server=Number.isFinite(seconds)?Date.now()+seconds*1000:Date.parse(retry||'');
      resumeAt=Math.max(resumeAt,Number.isFinite(server)?server:0,Date.now()+1500*2**attempt);
      await response.body?.cancel();
      if(attempt>=3)throw error;
    }
  });
}
export const assetJSON=url=>read(url,'json');
export const assetBytes=url=>read(url,'arrayBuffer');

export function warmStartupArt() {
  if(!warm)warm=Promise.all(Array.from({length:24},async(_,i)=>{
    const url='assets/hd/startup/'+String(i).padStart(2,'0')+'.json';
    try {for(const entry of Object.entries(await assetJSON(url)))packed.set(...entry);}
    catch(error){console.warn('그림 묶음을 개별 파일로 읽습니다',url,error);}
  }));
  return warm;
}

export function assetImage(url) {
  if(images.has(url))return images.get(url);
  const task=(async()=>{
    const embedded=packed.get(url);
    const src=embedded || URL.createObjectURL(await read(url,'blob'));
    const image=new Image();image.src=src;
    try {await image.decode();return image;}
    catch(error){if(!embedded)URL.revokeObjectURL(src);throw error;}
  })().catch(error=>{images.delete(url);throw error;});
  images.set(url,task);return task;
}

// Portraits keep their regular URL for CSS and dialogue. Recover a failed first request
// through the same rate-limited reader while the affected element is still in use.
export async function showImage(image,url) {
  image.src=url;
  try {await image.decode();}
  catch {const restored=await assetImage(url);image.src=restored.src;await image.decode();}
  return image;
}
