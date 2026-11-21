"""Pack the three hand-illustrated road companions into existing game atlases."""
import argparse
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageOps
from painted_actors import ART, FIELD, ROOT, F, LANCZOS, combat_actor, cut_cells, read, walking_actor, webp, write
from import_river_cast import POSES, compatibility_sheets, place, portrait

CAST = [
    ('mugyeong', 'Mugyeong', (95.5,58.8,27), ['worker','bun','black','brown','wine','tan','brown','sharp','none','band',16,'regular']),
    ('yeonjae', 'Yeonjae', (97.2,64.8,31.8), ['scholar','pony','gray','purple','wine','pale','gray','sharp','none','pin',16,'regular']),
    ('jaeha', 'Jaeha', (101.4,69.4,27), ['worker','pony','brown','jade','gold','warm','brown','smile','none','scarf',16,'regular']),
]

def pack(source):
    roster = read(ROOT/'tools/field_people.json')
    slots, motions = read(FIELD/'walk.json'), read(FIELD/'motions.json')
    art_keys, hd_keys = read(ART/'list.json'), read(ROOT/'assets/hd/list.json')
    art_add, hd_add = set(), set()
    walks, attacks = Image.new('RGBA',(448,448*3)), Image.new('RGBA',(960,432*3))
    with TemporaryDirectory() as tmp:
        directory = Path(tmp)
        for row,(key,name,eyes,design) in enumerate(CAST):
            for expression,cut in zip('nhasb',cut_cells(source/(key+'-faces.png'),3,2)):
                framed = portrait(cut,eyes)
                art_key = key+'_'+expression
                webp(ART/(art_key+'.webp'),framed)
                art_add.add(art_key)
                if expression=='n':
                    framed.crop((73,203,359,489)).resize((38,38),LANCZOS).save(ROOT/'assets/faces'/(name+'.png'))
            poses = dict(zip(POSES,cut_cells(source/(key+'-sprite.png'),4,4)))
            for pose,cut in poses.items():
                cut.save(directory/(key+'_'+pose+'.png'))
            walk = walking_actor(directory,key,design[10])
            stride = place(poses['w3'],F,6*design[10],108)
            walk.paste(stride,(2*F,F))
            walk.paste(ImageOps.mirror(stride),(3*F,F))
            combat,hands = combat_actor(directory,key,design[10])
            walks.alpha_composite(walk,(0,row*448))
            attacks.alpha_composite(combat,(0,row*432))
            slots[key] = ['walk29',row]
            motions['hands'][key] = hands
            motions['figures'][key] = motions['figures']['type_BlueSamurai']
            if not any(r[0]==key for r in roster):
                roster.append([key,*design])
            compatibility_sheets(name,walk,poses)
            hd_add.update(['chars/'+name,'chars/'+name+'_q'])
            with Image.open(source/(key+'-scene.png')) as scene:
                scene.thumbnail((1440,810),LANCZOS)
                webp(ART/('cg_bond_'+key+'.webp'),scene)
            art_add.add('cg_bond_'+key)
    webp(FIELD/'walk29.webp',walks)
    webp(FIELD/'combat29.webp',attacks)
    write(FIELD/'walk.json',slots)
    write(FIELD/'motions.json',motions)
    write(ROOT/'tools/field_people.json',roster)
    write(ART/'list.json',art_keys+sorted(art_add-set(art_keys)))
    write(ROOT/'assets/hd/list.json',hd_keys+sorted(hd_add-set(hd_keys)))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path)
    pack(parser.parse_args().source)
