"""Import transparent, individually illustrated cast sheets into the game atlases."""
import argparse
import json
import os
from pathlib import Path
from shutil import copyfile

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
FIELD = ROOT / 'assets/hd2d/field'
ART = ROOT / 'assets/art'
MAIN = ['type_BlueSamurai', 'yuseol', 'dangsoso', 'cheongmyeong']
EMOTIONS = ['h', 'a', 's', 'b']
F = 112
BW, BH = 96, 72
R = 2
POSE_TILE = {'ready':0,'coil':1,'lift':2,'edge':3,'cut':4,'low':4,'return':0,
             'chamber':1,'step':1,'point':3,'highpoint':2,'rear':2,'sweep':4,
             'highguard':2,'cover':1,'palm':3,'cross':3,'draw':5,'loose':3,
             'throw':3,'seal':6,'open':5,'plant':4,'air':7,'fallcut':7,
             'kick':8,'reel':9,'down':10}
# Fist locations in each original pose, normalized to its own silhouette.
GRIPS = [[.32,.51,.62,.54],[.31,.50,.66,.53],[.73,.32,.17,.52],
         [.11,.49,.59,.54],[.14,.62,.62,.53],[.12,.42,.53,.38],
         [.44,.52,.56,.53],[.30,.23,.62,.46],[.37,.39,.54,.33],
         [.31,.45,.64,.49],[.21,.49,.53,.52],[.21,.48,.62,.50],
         [.43,.22,.52,.26],[.19,.62,.62,.50],[.23,.25,.77,.56]]
LANCZOS = Image.Resampling.LANCZOS

# Pupil centers in Cheongmyeong's source drawings, measured before atlas reduction.
# The sign is the outer corner of the eyelid. Zero marks a partly hidden far eye.
CHEONG_GAZE = {
    'w0': [(0.383, 0.221, -1), (0.631, 0.218, 1)],
    'w1': [(0.331, 0.221, 1)],
    'a0': [(0.416, 0.276, 1)], 'a1': [(0.427, 0.268, 1)],
    'a2': [(0.393, 0.320, 1)], 'a3': [(0.279, 0.361, 1)],
    'b0': [(0.446, 0.300, 0), (0.532, 0.284, 1)],
    'b1': [(0.374, 0.311, 0), (0.449, 0.287, 1)],
    'b2': [(0.361, 0.271, 0), (0.439, 0.255, 1)],
    'b3': [(0.581, 0.253, 0), (0.654, 0.239, 1)],
    'c0': [(0.480, 0.274, 1)], 'c1': [(0.363, 0.268, 1)],
    'c2': [(0.324, 0.294, 1)], 'c3': [(0.417, 0.221, 1)],
}

def ink_cheong_eyes(body, pose, reflected=False):
    # Re-establish the eyelid, iris and sclera on the final pixel grid.
    # The source fringe covers the far eye in most three-quarter poses.
    pixels = body.load()
    for u, v, outer in CHEONG_GAZE.get(pose, ()):
        x = round(u * body.width - 0.5)
        y = round(v * body.height - 0.5)
        if reflected:
            x = body.width - 1 - x
            outer = -outer
        iris = (94, 64, 71)
        lid = (66, 47, 51)
        ivory = (237, 213, 199)
        if outer:
            strokes = [(0,-1,lid), (outer,-1,lid), (outer*2,-1,(103,75,76)),
                       (-outer,0,ivory), (0,0,iris), (outer,0,(213,190,180))]
        else:
            strokes = [(0,-1,(88,60,64)), (0,0,iris), (1,0,(211,183,172))]
        for dx, dy, rgb in strokes:
            px, py = x + dx, y + dy
            if 0 <= px < body.width and 0 <= py < body.height:
                old = pixels[px, py]
                if old[3] > 220:
                    pixels[px, py] = (*rgb, old[3])

def read(path):
    return json.loads(path.read_text(encoding='utf8'))

def write(path, value):
    temp=path.with_suffix('.'+str(os.getpid())+'.tmp')
    temp.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
    os.replace(temp,path)

def webp(path,image):
    temp=path.with_suffix('.'+str(os.getpid())+'.tmp')
    image.save(temp,format='WEBP',quality=92,method=4)
    os.replace(temp,path)

def clean_image(path):
    with Image.open(path) as image:
        raw = np.array(image.convert('RGBA'))
    a = raw[:,:,3].astype(float)
    if np.percentile(a,1)>245:
        # Some exported sheets have an opaque flat grey or green matte.
        border = np.concatenate((raw[0,:,:3],raw[-1,:,:3],raw[:,0,:3],raw[:,-1,:3]))
        bg = np.median(border,axis=0)
        distance = np.max(np.abs(raw[:,:,:3].astype(float)-bg),axis=2)
        a = np.clip((distance-9)*9,0,255)
    hist = np.bincount(a.astype('uint8').ravel(),minlength=256)
    w = np.cumsum(hist,dtype=float)
    m = np.cumsum(hist*np.arange(256))
    score = (float(m[-1])*w-m*w[-1])**2 / np.maximum(w.astype(float)*(w[-1]-w),1)
    cut = np.clip(np.argmax(score),30,226)
    if np.percentile(a,5)>30:
        cut = max(cut,np.percentile(a,12)+9)
    raw[:,:,3] = np.clip((a-cut+4)*20,0,255).astype('uint8')
    return Image.fromarray(raw)

def seams(axis_counts,n):
    length = len(axis_counts)
    base = length/n
    bounds = [0]
    for j in range(1,n):
        center = int(j*base)
        search = np.arange(max(bounds[-1]+1,int(center-base*.23)),min(length,int(center+base*.23)+1))
        density = np.convolve(axis_counts,np.ones(5)/5,'same')[search]
        rank = density+abs(search-center)*max(1,axis_counts.max())/base*.11
        bounds.append(int(search[np.argmin(rank)]))
    return bounds+[length]

def cut_cells(path,cols,rows):
    im=clean_image(path)
    mask=np.asarray(im.getchannel('A'))>64
    xs,ys=seams(mask.sum(0),cols),seams(mask.sum(1),rows)
    panels=[]
    for j in range(rows):
        for i in range(cols):
            part=im.crop((xs[i],ys[j],xs[i+1],ys[j+1]))
            mat=np.array(part.getchannel('A'))
            # Keep the subject when a neighboring sleeve or frame protrudes across a gutter.
            for axis in [0,1]:
                used=np.flatnonzero((mat>85).sum(axis=axis)>0)
                if not len(used):continue
                spans=np.split(used,np.flatnonzero(np.diff(used)>2)+1)
                largest=max(spans,key=len)
                for span in spans:
                    if len(span)<len(largest)*.23 and (span[0]<4 or span[-1]>=mat.shape[1-axis]-4):
                        if axis==0:mat[:,span]=0
                        else:mat[span,:]=0
            part.putalpha(Image.fromarray(mat))
            bounds=part.getbbox()
            if not bounds or bounds[2]-bounds[0]<12 or bounds[3]-bounds[1]<18:
                raise ValueError(f'Empty panel {path.name} at {i},{j}')
            panels.append(part.crop(bounds))
    return panels

def scaled(im,factor):
    return im.resize((max(1,round(im.width*factor)),max(1,round(im.height*factor))),LANCZOS)

def face(key,im):
    # Identical camera framing for all dialogue busts, allowing broad shoulders to crop.
    im=im.copy()
    im.putalpha(im.getchannel('A').point(lambda a: 0 if a<5 else 255 if a>=242 else a))
    framed=Image.new('RGBA',(432,648))
    pic=scaled(im,min(591/im.height,494/im.width))
    framed.alpha_composite(pic,((432-pic.width)//2,648-pic.height))
    webp(ART/(key+'.webp'),framed)
    if key.startswith('type_') and key.endswith('_n'):
        icon=ROOT/'assets/faces'/(key[5:-2]+'.png')
        if icon.exists():
            side=min(im.width,round(im.height*.77))
            x=(im.width-side)//2
            im.crop((x,0,x+side,side)).resize((38,38),LANCZOS).save(icon)

def cut_source(source,cache,tag,keys,cols,rows,kind):
    path=source/(tag+'.png')
    if not path.exists():return
    stamp=cache/(tag+'.done')
    if stamp.exists() and stamp.stat().st_mtime>=path.stat().st_mtime:return
    cells=cut_cells(path,cols,rows)
    if kind=='face':
        for key,im in zip(keys,cells):
            face(key,im)
            im.thumbnail((420,450),LANCZOS)
            im.save(cache/(key+'.png'))
    else:
        for j in range(rows):
            for i,key in enumerate(keys):
                im=cells[j*cols+i]
                im.thumbnail((420,380),LANCZOS)
                im.save(cache/(key+'_'+kind+str(j)+'.png'))
    stamp.touch()

def gait(im,d,phase,H):
    if not phase:return im
    arr=np.asarray(im)
    y,x=np.indices(arr.shape[:2]); t=np.clip((y-(108-H))/H,0,1)
    swing=[0,1,0,-1][phase]
    side=np.sign(x-(F-1)/2); foot=np.clip((t-.58)/.40,0,1)
    arm=np.clip((t-.30)/.12,0,1)*np.clip((.70-t)/.20,0,1)*np.clip(abs(x-56)/(H*.18),0,1)
    dx=swing*side*(foot*(H*(.082 if d>=2 else .026))-arm*H*.026)
    dy=-np.clip(swing*side,0,1)*foot*H*.074-(phase==2)*(1-foot)*max(1,H*.022)
    sx=np.rint(x-dx).astype(int);sy=np.rint(y-dy).astype(int)
    valid=(sx>=0)&(sx<F)&(sy>=0)&(sy<F)
    out=np.zeros_like(arr);out[valid]=arr[sy[valid],sx[valid]]
    return Image.fromarray(out)

def walking_actor(cache,key,head):
    block=Image.new('RGBA',(4*F,4*F));H=head*3*R
    imgs=[Image.open(cache/(key+'_w'+str(i)+'.png')).convert('RGBA') for i in [0,2,1]]
    imgs.append(ImageOps.mirror(imgs[2]))
    for d,im in enumerate(imgs):
        body=scaled(im,min(H/im.height,(F-4)/im.width))
        if key == 'cheongmyeong':
            ink_cheong_eyes(body, ('w0', None, 'w1', 'w1')[d], reflected=d == 3)
        still=Image.new('RGBA',(F,F))
        still.alpha_composite(body,((F-body.width)//2,108-body.height))
        for phase in range(4):
            block.alpha_composite(gait(still,d,phase,H),(d*F,phase*F))
    return block

def grip(im,fx,fy):
    a=np.asarray(im)
    y,x=np.indices(a.shape[:2]);r,g,b,alpha=a.astype(float).transpose(2,0,1)
    dist=((x/im.width-fx)/.16)**2+((y/im.height-fy)/.12)**2
    skin=(r>g+5)&(g>b+3)&(r>92)&(r-b>19)
    cost=dist+(~skin)*.95+(alpha<150)*100
    iy,ix=np.unravel_index(cost.argmin(),cost.shape)
    return int(ix),int(iy)

def combat_actor(cache,key,head):
    def pic(kind,i):return Image.open(cache/(key+'_'+kind+str(i)+'.png')).convert('RGBA')
    base=pic('w',1); A=[pic('a',i) for i in range(4)];B=[pic('b',i) for i in range(4)]
    C=[pic('c',i) for i in range(4)]
    upright=3*head*R
    sizes=[upright/base.height]+[upright*.94/A[0].height]*4+[upright*.88/B[0].height]*4
    imgs=[base]+A+B+[A[0].rotate(-18,Image.Resampling.BICUBIC,expand=True),base.rotate(77,Image.Resampling.BICUBIC,expand=True)]
    imgs.extend(C)
    sizes.extend([sizes[1],sizes[0]]+[upright*.90/C[0].height]*4)
    block=Image.new('RGBA',(BW*R*5,BH*R*3)); hands=[]
    for i,(im,size) in enumerate(zip(imgs,sizes)):
        im=im.crop(im.getbbox())
        body=scaled(im,min(size,(BW*R-8)/im.width,(BH*R-12)/im.height))
        mask=np.asarray(body.getchannel('A'))>90
        yy,xx=np.where(mask[int(body.height*.32):max(int(body.height*.72),int(body.height*.32)+1)])
        core=float(np.median(xx)) if xx.size else body.width/2
        left=int(np.clip(round(BW*R/2-core),2,BW*R-body.width-2))
        bottom=(BH-6)*R-(8 if i==7 else 0)
        top=bottom-body.height
        pairs=[]
        for fx,fy in np.array(GRIPS[i]).reshape(2,2):
            x,y=grip(body,fx,fy)
            pairs.extend([round((left+x)/R-BW/2+28,1),round((top+y)/R-(BH-6)+56,1)])
        hands.append(pairs)
        if key == 'cheongmyeong':
            poses = ('w1', 'a0', 'a1', 'a2', 'a3', 'b0', 'b1', 'b2', 'b3',
                     None, None, 'c0', 'c1', 'c2', 'c3')
            ink_cheong_eyes(body, poses[i])
        block.alpha_composite(body,((i%5)*BW*R+left,(i//5)*BH*R+top))
    return block,hands

def pack(source,groups):
    cache=source/'cuts'
    cache.mkdir(exist_ok=True)
    for g in groups:
        ids=g['ids'];s=f"{g['index']:02d}"
        cut_source(source,cache,'gaze'+s,[k+'_n' for k in ids],3,2 if len(ids)>3 else 1,'face')
        for name,rows,kind in [('field',3,'w'),('battlea',4,'a'),('battleb',4,'b'),('battlec',4,'c')]:
            cut_source(source,cache,name+s,ids,len(ids),rows,kind)
    for name,rows,kind in [('field-main',3,'w'),('battlea-main',4,'a'),('battleb-main',4,'b'),('battlec-main',4,'c')]:
        cut_source(source,cache,name,MAIN,4,rows,kind)
    if (source/'field-eyes.png').exists() and not (cache/'cm-eye.done').exists():
        frames=cut_cells(source/'field-eyes.png',4,3)
        for i in range(3): frames[4*i+3].save(cache/('cheongmyeong_w'+str(i)+'.png'))
        (cache/'cm-eye.done').touch()
    cut_source(source,cache,'main-direct',['cheongmyeong_n','cheongmyeong_h','yuseol_n','dangsoso_n'],4,1,'face')
    blue=source/'blue-direct.png'
    cut_source(source,cache,'blue-direct' if blue.exists() else 'blue-expr',['type_BlueSamurai_'+e for e in ['n','h','a','s','b','focus']],3,2,'face')
    for f in source.glob('expr-*.png'):
        k=f.stem[5:];cut_source(source,cache,f.stem,[k+'_'+e for e in EMOTIONS],2,2,'face')
    for name,kind,cols,rows in [('walk','w',3,1),('a','a',2,2),('b','b',2,2),('c','c',2,2)]:
        inf=source/('cm-'+name+'-final.png');marker=cache/('cm-'+name+'-final.done')
        if inf.exists() and (not marker.exists() or marker.stat().st_mtime<inf.stat().st_mtime):
            for i,frame in enumerate(cut_cells(inf,cols,rows)):
                frame.save(cache/('cheongmyeong_'+kind+str(i)+'.png'))
            marker.touch()
    for inf in (source/'trimmed').glob('*.png'):
        marker=cache/('trim2-'+inf.stem+'.done')
        if marker.exists() and marker.stat().st_mtime>=inf.stat().st_mtime:continue
        with Image.open(inf) as im:
            frame=im.convert('RGBA')
        face(inf.stem,frame)
        frame.thumbnail((420,450),LANCZOS);frame.save(cache/(inf.stem+'.png'))
        marker.touch()
    for inf in (source/'ink').glob('*.png'):
        marker=cache/('ink-'+inf.stem+'.done')
        if marker.exists() and marker.stat().st_mtime>=inf.stat().st_mtime:continue
        copyfile(inf,cache/inf.name)
        marker.touch()
    people=read(ROOT/'tools/field_people.json'); roster={p[0]:p for p in people}
    slots=read(FIELD/'walk.json');layout=read(FIELD/'motions.json')
    from combat_sprites import POSES
    layout['angles']=[POSES[k].angle for k in layout['poses']]
    layout.update(body=[BW,BH],bodyAnchor=[BW/2,BH-6],cols=5,rows=3,resolution=R,poseTiles=[POSE_TILE[n] for n in layout['poses']])
    layout.setdefault('hands',{})
    for pg in sorted({v[0] for v in slots.values()}):
        keys=sorted((k for k,v in slots.items() if v[0]==pg),key=lambda k:slots[k][1])
        for kind,out in [('walk',pg),('combat',pg.replace('walk','combat'))]:
            srcs=[cache/(k+'_'+p+'.png') for k in keys for p in (['w0','w1','w2'] if kind=='walk' else ['w1','a0','a1','a2','a3','b0','b1','b2','b3','c0','c1','c2','c3'])]
            if 'cheongmyeong' in keys:
                srcs.append(Path(__file__))
            stamp=cache/(out+'.packed')
            if not all(p.is_file() for p in srcs):continue
            if stamp.exists() and stamp.stat().st_mtime>=max(p.stat().st_mtime for p in srcs):continue
            cw,ch=(F*4,F*4) if kind=='walk' else (BW*R*5,BH*R*3)
            atlas=Image.new('RGBA',(cw,ch*len(keys)))
            for i,k in enumerate(keys):
                if kind=='walk':sheet=walking_actor(cache,k,roster[k][11])
                else:sheet,layout['hands'][k]=combat_actor(cache,k,roster[k][11])
                atlas.alpha_composite(sheet,(0,i*ch))
            webp(FIELD/(out+'.webp'),atlas)
            if kind=='combat':write(FIELD/'motions.json',layout)
            stamp.touch()
    if layout.get('hands'):write(FIELD/'motions.json',layout)
    write(ART/'list.json',sorted(p.stem for p in ART.glob('*.webp')))
    current={k:sum(1 for _ in cache.glob(pattern)) for k,pattern in [('neutral','*_n.png'),('walk','walk*.packed'),('combat','combat*.packed')]}
    print(current,flush=True)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path)
    parser.add_argument('groups',type=Path,nargs='?',default=ROOT/'tools/painted_groups.json')
    args=parser.parse_args()
    pack(args.source,read(args.groups))

if __name__=='__main__':main()
