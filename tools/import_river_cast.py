"""Import the two original river cast sheets and their location illustrations."""
import argparse
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageOps

from painted_actors import (ART, FIELD, ROOT, F, LANCZOS, clean_image, combat_actor,
                            cut_cells, read, scaled, walking_actor, webp, write)

# Coordinates in a 190-pixel-wide preview of each original. Framing uses
# the midpoint of the pupils and their separation, independent of hair or clothing.
CAST = [
    ('hero', 'type_JadeRunner', 'JadeRunner', [
        (90.8, 76, 25.3), (89, 85, 32.5), (89, 85, 32), (89, 87, 32), (88, 87, 32)],
     ['hero', 'pony', 'black', 'jade', 'wine', 'warm', 'gold', 'sharp', 'none', 'pin', 16, 'regular']),
    ('lover', 'igyeom', 'Igyeom', [
        (99.4, 49.1, 21.5), (96, 46.2, 27), (96, 47, 26), (96, 46.8, 26.5), (96, 47.3, 27)],
     ['worker', 'pony', 'brown', 'navy', 'wine', 'tan', 'brown', 'smile', 'none', 'staff', 16, 'regular']),
]
POSES = ['w0','w1','w2','w3'] + [group + str(i) for group in 'abc' for i in range(4)]
PAGE = 'walk28'
GALLERY = {
    'journey': ['camp', 'exile', 'dock', 'end_free'],
    'ending': ['end_jeong', 'end_sa', 'end_ma', 'trap'],
}

def portrait(image, eyes):
    x, y, distance = eyes
    unit = 92 / distance
    body = scaled(image, unit * 190 / image.width)
    result = Image.new('RGBA', (432,648))
    result.alpha_composite(body, (round(216-x*unit), round(350-y*unit)))
    return result

def place(body, size, height, bottom):
    body = scaled(body, min(height/body.height, (size-2)/body.width))
    result = Image.new('RGBA', (size,size))
    result.alpha_composite(body, ((size-body.width)//2, bottom-body.height))
    return result

def compatibility_sheets(name, walk, poses):
    # Stock renderer uses four directions, four gait rows, then strike, leap and fall.
    sheet = Image.new('RGBA',(128,224))
    for d in range(4):
        for r in range(4):
            tile = walk.crop((d*F,r*F,(d+1)*F,(r+1)*F))
            body = tile.crop(tile.getbbox())
            sheet.alpha_composite(place(body,32,30,31),(32*d,32*r))
        for r,pose in enumerate([poses['a3'],poses['b3'],poses['w1'].rotate(-75,expand=True)],4):
            if d == 3: pose = ImageOps.mirror(pose)
            sheet.alpha_composite(place(pose,32,25 if r!=6 else 14,31),(32*d,32*r))
    webp(ROOT/'assets/hd/chars'/(name+'.webp'),sheet)
    sheet.resize((64,112),LANCZOS).save(ROOT/'assets/chars'/(name+'.png'))
    quarter = Image.new('RGBA',(128,384))
    for d,source_dir in enumerate([0,1]):
        for r,source_row in enumerate([0,1,3,4,5,6]):
            body=sheet.crop((source_dir*32,source_row*32,(source_dir+1)*32,(source_row+1)*32))
            body=body.crop(body.getbbox())
            quarter.alpha_composite(place(body,64,44 if r!=5 else 25,61),(64*d,64*r))
    webp(ROOT/'assets/hd/chars'/(name+'_q.webp'),quarter)

def pack(source):
    records=read(ROOT/'tools/field_people.json')
    keys={row[0] for row in records}
    slots=read(FIELD/'walk.json')
    layout=read(FIELD/'motions.json')
    old_hd=read(ROOT/'assets/hd/list.json')
    old_art=read(ART/'list.json')
    hd=set()
    portraits={'lead_f', 'lead_m'}
    atlas=Image.new('RGBA',(448,896))
    battle=Image.new('RGBA',(960,864))
    with TemporaryDirectory() as directory:
        cuts=Path(directory)
        for row,(tag,key,name,eyes,data) in enumerate(CAST):
            expressions=[clean_image(source/(tag+'.png'))]+cut_cells(source/(tag+'-em.png'),2,2)
            for expression,image,features in zip('nhasb',expressions,eyes):
                framed=portrait(image,features)
                artkey=key+'_'+expression
                webp(ART/(artkey+'.webp'),framed)
                portraits.add(artkey)
                if expression=='n':
                    framed.crop((73,203,359,489)).resize((38,38),LANCZOS).save(ROOT/'assets/faces'/(name+'.png'))
            poses=dict(zip(POSES,cut_cells(source/(tag+'-sprite.png'),4,4)))
            for pose,image in poses.items():image.save(cuts/(key+'_'+pose+'.png'))
            walk=walking_actor(cuts,key,data[10])
            # A hand-drawn side stride complements the front and back gait cycles.
            stride=poses['w3']
            stride=place(stride,F,6*data[10],108)
            for d,im in [(2,stride),(3,ImageOps.mirror(stride))]:
                walk.paste(im,(d*F,F))
            attacks,hands=combat_actor(cuts,key,data[10])
            atlas.alpha_composite(walk,(0,row*448))
            battle.alpha_composite(attacks,(0,row*432))
            if key not in keys:records.append([key,*data])
            slots[key]=[PAGE,row]
            layout['hands'][key]=hands
            layout['figures'][key]=layout['figures']['type_BlueSamurai']
            compatibility_sheets(name,walk,poses)
            hd.update(['chars/'+name,'chars/'+name+'_q'])
    for sex,stem in [('m','male-selection'),('f','hero')]:
        lead=clean_image(source/(stem+'.png'))
        lead.thumbnail((624,912),LANCZOS)
        webp(ART/('lead_'+sex+'.webp'),lead)
    for stem,names in GALLERY.items():
        with Image.open(source/(stem+'.png')) as sheet:
            w,h=sheet.size
            for i,key in enumerate(names):
                x,y=i%2,i//2
                panel=sheet.crop((x*w//2+1,y*h//2+1,(x+1)*w//2-1,(y+1)*h//2-1))
                name='cg_'+key+'_f'
                webp(ART/(name+'.webp'),panel)
                portraits.add(name)
    with Image.open(source/'river.png') as river:
        river.thumbnail((1440,810),LANCZOS)
        webp(ART/'cg_bond_igyeom.webp',river)
    portraits.add('cg_bond_igyeom')
    webp(FIELD/(PAGE+'.webp'),atlas)
    webp(FIELD/(PAGE.replace('walk','combat')+'.webp'),battle)
    write(FIELD/'walk.json',slots)
    write(FIELD/'motions.json',layout)
    write(ROOT/'tools/field_people.json',records)
    write(ROOT/'assets/hd/list.json',old_hd+sorted(hd-set(old_hd)))
    write(ART/'list.json',old_art+sorted(portraits-set(old_art)))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path)
    pack(parser.parse_args().source)
