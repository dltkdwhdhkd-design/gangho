"""Paint faction cloth, woven hems, belts and insignia on the game's registered movement cels."""
import json
from pathlib import Path
import numpy as np
from PIL import Image

DEST = Path(__file__).resolve().parents[1] / "assets/hd2d/field"
# Figure, robe midtone, piping, sash, construction. Full sheets retain the figure's fitted limbs and hand anchors.
DESIGNS = {
    "shaolin": ("monk","b17632","edcb85","654135","kasaya"),
    "wudang": ("disc","728c91","d3dbbf","394854","cloud"),
    "hwasan": ("mob_jeong","49404b","ddb7b6","854752","plum"),
    "jongnam": ("type_BlueNinja","526079","bdbbc5","444259","sword"),
    "emei": ("type_EggGirl","839588","ddd3c0","675b70","lotus"),
    "gonryun": ("type_EskimoNinja","8091a4","e1dac8","4d5366","peak"),
    "gongdong": ("type_GreenNinja","765b46","ccaa78","514a3e","bracer"),
    "jeomchang": ("type_Samurai","65756a","c4c3a2","4c4a39","sword"),
    "cheongseong": ("disc","6c8975","d7cea2","4e6153","cloud"),
    "gaebang": ("type_Villager3","80755b","baa177","65583e","patch"),
    "namgung": ("mob_jeong","6a809c","dedcc9","384965","sword"),
    "moyong": ("disc","59758c","ccb27b","4a5164","wave"),
    "jegal": ("type_Inspector","8c998d","d2c9a2","515866","star"),
    "dang": ("type_GreenNinja","486459","bdc1a1","453f56","pouch"),
    "paeng": ("type_Knight","685e61","bb9573","764f43","plate"),
    "changun": ("mob_jeong","738a9a","d9d7be","5a606b","peak"),
    "nokrim": ("mob_bandit","726848","c4a470","664937","patch"),
    "janggang": ("mob_pirate","4d6f78","c9b990","854d3c","wave"),
    "haomun": ("type_Samurai","665864","ac9a86","504350","pouch"),
    "odok": ("type_GreenNinja","546c52","b49bb0","573d51","pouch"),
    "hyeoleui": ("drill","5f404a","bb8382","713b43","sword"),
    "cheonma": ("type_RedArmor","493e4c","ac7061","72413c","plate"),
    "haenam": ("type_Samurai","508087","d6d4a6","536c74","wave"),
    "cheonsan": ("type_EskimoNinja","abb6bc","e0e0c7","6e7586","peak"),
    "jeonjin": ("type_Inspector","627a79","d2bd83","465552","star"),
    "mosan": ("type_Inspector","81725f","d7b56b","684b49","star"),
    "jangbaek": ("type_Samurai","69756e","cbb695","534f48","peak"),
    "pota": ("type_EggGirl","718493","d7ceb3","626d7b","lotus"),
    "hwangbo": ("type_GoldKnight","93734c","d7b577","62463a","bracer"),
    "ak": ("type_Knight","777e88","c2b998","8b524b","plate"),
    "yang": ("type_RedArmor","6e5862","cdb888","814e4b","plate"),
    "eon": ("type_GreenNinja","865f4c","beaa80","584335","bracer"),
    "jin": ("type_Villager","69787d","c3b39a","535365","bracer"),
    "bukhae": ("type_EskimoNinja","94a5ac","e2dfcc","65798b","wave"),
    "noeum": ("type_Monk","9a774c","d6b377","785442","kasaya"),
    "podalra": ("monk","9e614e","dfb474","73493f","kasaya"),
}
LEADER = ("clan_jongnam","605671","d9c6a0","514263","peak")
COLS, ROWS = 5, 3

def rgb(h):
    return np.array(tuple(bytes.fromhex(h)),dtype=float)

def dye_frame(im, design, facing):
    rgba=np.array(im)
    alpha=rgba[:,:,3]
    ys,xs=np.where(alpha>110)
    if not len(xs): return im
    y,x=np.indices(alpha.shape)
    nx=(x-(xs.min()+xs.max())/2)/max(1,xs.max()-xs.min())
    ny=(y-ys.min())/max(1,ys.max()-ys.min())
    original=rgba[:,:,:3].astype(float)
    r,g,b=original.transpose(2,0,1)
    light=.25*r+.55*g+.2*b
    skin=(r>g*1.08)&(g>b*1.06)&(r-b>19)&(light>122)&((ny<.53)|(abs(nx)>.26))
    cloth=(alpha>90)&(ny>.365)&(ny<.887)&(light>26)&~skin
    if not np.any(cloth): return im
    _,body,border,belt,style=design
    slope=np.clip((light-94)/120,-.67,.80)[:,:,None]
    def shade(h):
        c=rgb(h)
        return np.clip(c+(np.where(slope<0,c,np.array([247,239,224])-c))*slope,0,255)
    ink=shade(body)
    # Existing dark outlines, seams and per-pixel painted shading stay registered in every pose.
    def sew(mask,h,amount):
        ink[mask]=ink[mask]*(1-amount)+shade(h)[mask]*amount
    sash=(ny>.59)&(ny<.626)
    sew(sash,belt,.95)
    back=facing==1
    wrapped=abs(ny-(.43+nx*(.39 if facing!=2 else -.39)))<.013
    if not back: sew((abs(nx)<.26)&wrapped,border,.65)
    sew((ny>.837)&(ny<.853),border,.63)
    if style=='kasaya':
        sew((abs(ny-.57-nx*.44)<.055)&(ny<.77),belt,.88)
        sew((abs(ny-.51-nx*.44)<.013)&(ny<.77),border,.8)
    elif style in ('plate','bracer'):
        arm=(abs(nx)>.23)&(ny>.42)&(ny<.62)
        sew(arm&((np.floor(y/4)%2)==0),border,.56)
    elif style in ('cloud','wave','peak'):
        weave=np.abs(ny-(.79+.019*(np.cos(nx*32) if style!='peak' else np.abs(np.sin(nx*15)))))<.013
        sew(weave,border,.91)
    elif style in ('plum','lotus','star'):
        for cx,cy in [(-.18,.77),(-.10,.725),(.18,.47)]:
            dx=(nx-cx)*.62;dy=ny-cy
            ang=np.arctan2(dy,dx);radius=np.hypot(dx,dy)
            sew(radius<(.014+.008*np.cos(ang*(6 if style=='star' else 5))),border,.97)
    elif style=='sword':
        sew((abs(abs(nx)-.126)<.019)&(ny>.66)&(ny<.834),border,.7)
    elif style=='pouch':
        for cx in (-.16,.15):
            sew((abs(nx-cx)<.074)&(ny>.615)&(ny<.69),belt,.94)
            sew((abs(nx-cx)<.071)&(ny>.62)&(ny<.638),border,.7)
    elif style=='patch':
        sew((abs(nx+.15)<.085)&(ny>.7)&(ny<.77),border,.62)
    rgba[:,:,:3][cloth]=np.rint(ink[cloth]).astype(np.uint8)
    return Image.fromarray(rgba)

def build():
    index=json.loads((DEST/'walk.json').read_text())
    layout=json.loads((DEST/'motions.json').read_text())
    designs=[('uniform_'+k,d) for k,d in DESIGNS.items()]
    layout['wardrobes']={key:d[0] for key,d in designs}
    if not layout.get('jongnamRobe'):
        page,row=index['clan_jongnam']
        for mode,cols,rows,w,h in [('walk',4,4,112,112),('combat',COLS,ROWS,192,144)]:
            dest=DEST/(page.replace('walk',mode)+'.webp')
            with Image.open(dest) as art: sheet=art.convert('RGBA')
            for cy in range(rows):
                for cx in range(cols):
                    l,t=cx*w,(row*rows+cy)*h
                    cel=sheet.crop((l,t,l+w,t+h))
                    sheet.paste(dye_frame(cel,LEADER,cx if mode=='walk' else 2),(l,t))
            sheet.save(dest,lossless=True,method=4)
        layout['jongnamRobe']=1
    for start in range(0,len(designs),8):
        group=designs[start:start+8]; page='walk_sect'+str(start//8)
        wa=Image.new('RGBA',(448,448*len(group)))
        ca=Image.new('RGBA',(960,432*len(group)))
        for row,(key,d) in enumerate(group):
            base=d[0]; source,slot=index[base]
            for kind,cols,rows,w,h,target in [('walk',4,4,112,112,wa),('combat',COLS,ROWS,192,144,ca)]:
                with Image.open(DEST/(source.replace('walk',kind)+'.webp')) as sheet:
                    for cy in range(rows):
                        for cx in range(cols):
                            l,t=cx*w,(slot*rows+cy)*h
                            cel=sheet.crop((l,t,l+w,t+h)).convert('RGBA')
                            target.paste(dye_frame(cel,d,cx if kind=='walk' else 2),(l,(row*rows+cy)*h))
            index[key]=[page,row]
            layout['figures'][key]=layout['figures'][base]
            if base in layout['hands']:layout['hands'][key]=layout['hands'][base]
        wa.save(DEST/(page+'.webp'),lossless=True,method=4)
        ca.save(DEST/(page.replace('walk','combat')+'.webp'),lossless=True,method=4)
    for name,data in [('walk',index),('motions',layout)]:
        (DEST/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
if __name__=='__main__':build()
