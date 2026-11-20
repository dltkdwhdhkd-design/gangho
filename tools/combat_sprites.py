"""Native actor poses and registered weapon overlays for the battle compositor."""
import json
import math
from pathlib import Path
from typing import NamedTuple
from PIL import Image, ImageDraw
from field_sprites import DEST, INK, Figure, draw_actor


class Pose(NamedTuple):
    lean: int
    drop: int
    legs: tuple
    main: tuple
    off: tuple
    angle: int


SQUARE=(((23,44),(21,52)),((33,45),(35,52)))
WIDE=(((19,43),(15,52)),((34,44),(40,52)))
LUNGE=(((15,43),(16,52)),((35,43),(44,52)))
BACK=(((24,44),(18,52)),((35,42),(36,52)))
AIR=(((19,42),(23,46)),((30,41),(36,43)))
KNEEL=(((18,43),(16,52)),((32,48),(39,51)))
POSES={
    'ready':Pose(0,0,SQUARE,((24,31),(18,28)),((32,29),(26,31)),48),
    'coil':Pose(3,2,BACK,((34,29),(34,23)),((23,29),(18,26)),132),
    'lift':Pose(2,0,WIDE,((33,17),(26,12)),((29,23),(26,18)),150),
    'edge':Pose(-3,1,WIDE,((18,22),(12,20)),((32,30),(35,30)),34),
    'cut':Pose(-5,3,LUNGE,((16,28),(11,33)),((29,30),(33,27)),-26),
    'low':Pose(-3,5,KNEEL,((18,33),(13,37)),((28,32),(30,29)),-12),
    'return':Pose(0,1,WIDE,((24,32),(22,33)),((31,28),(27,26)),10),
    'chamber':Pose(4,3,BACK,((36,32),(32,31)),((27,29),(21,30)),2),
    'step':Pose(-2,2,WIDE,((22,30),(17,28)),((30,30),(25,30)),6),
    'point':Pose(-6,3,LUNGE,((15,28),(8,26)),((23,30),(18,27)),4),
    'highpoint':Pose(-4,1,LUNGE,((16,24),(11,19)),((27,30),(21,26)),26),
    'rear':Pose(3,1,BACK,((34,24),(37,19)),((30,29),(24,28)),156),
    'sweep':Pose(-4,4,WIDE,((17,31),(12,32)),((24,33),(20,32)),-5),
    'highguard':Pose(0,1,SQUARE,((21,22),(18,18)),((30,26),(24,25)),68),
    'cover':Pose(2,4,BACK,((24,28),(23,20)),((30,28),(24,23)),76),
    'palm':Pose(-4,3,LUNGE,((16,28),(10,25)),((30,30),(30,26)),4),
    'cross':Pose(-2,1,WIDE,((20,25),(14,22)),((20,30),(16,29)),20),
    'draw':Pose(2,1,WIDE,((19,26),(14,25)),((34,23),(29,23)),4),
    'loose':Pose(-2,1,WIDE,((17,26),(11,25)),((35,24),(36,23)),3),
    'throw':Pose(-4,2,LUNGE,((17,21),(12,18)),((32,30),(35,32)),16),
    'seal':Pose(0,3,SQUARE,((21,31),(25,25)),((31,31),(27,24)),55),
    'open':Pose(-1,1,WIDE,((19,23),(15,18)),((34,23),(37,18)),53),
    'plant':Pose(-2,6,KNEEL,((18,34),(15,41)),((28,32),(30,29)),-68),
    'air':Pose(-2,-3,AIR,((19,19),(19,12)),((31,20),(34,16)),115),
    'fallcut':Pose(-4,2,AIR,((17,28),(14,34)),((24,25),(20,27)),-62),
    'kick':Pose(3,1,(((18,37),(8,34)),((31,44),(35,52))),((26,26),(23,22)),((35,29),(38,26)),35),
    'reel':Pose(5,2,BACK,((32,31),(28,32)),((37,24),(39,21)),25),
    'down':Pose(0,0,SQUARE,((24,31),(18,32)),((31,29),(34,29)),0),
}
GEAR=['sword','wood','rapier','sabre','blade','glaive','spear','dragon','staff','fist','claw','club','bow','dart','palm','tray','fan','dagger','vajra','piercer','goldfist','ironfist','ringblade']
W,H=128,104
OX,OY=36,30
COLS=6
BODY_W,BODY_H=80,72


def draw_gear(kind,name,pose):
    canvas=Image.new('RGBA',(W,H));g=ImageDraw.Draw(canvas)
    x,y=pose.main[1];x+=OX;y+=OY
    angle=math.radians(pose.angle)
    if name=='down':
        x,y=43,82;angle=math.radians(9)
    dx,dy=-math.cos(angle),-math.sin(angle)
    def pt(along,across):
        return round(x+along*dx-across*dy),round(y+along*dy+across*dx)
    def line(color,coords,width=1):g.line([pt(a,b) for a,b in coords],fill=color,width=width)
    def shape(color,coords):g.polygon([pt(a,b) for a,b in coords],fill=color)
    steel='#a6bec1';shine='#e6e8d5';gold='#c3a373';red='#a75a56';wood='#87654d'
    if kind=='palm':return canvas
    if kind=='tray':
        if name not in ('throw','loose'):
            g.ellipse((x-7,y-3,x+7,y+2),fill=INK)
            g.ellipse((x-6,y-3,x+6,y),fill=steel,outline=shine)
        return canvas
    if kind in ('fist','claw','goldfist','ironfist'):
        for hand in (pose.main[1],):
            hx,hy=hand[0]+OX,hand[1]+OY
            if name=='down':continue
            metal=shine if kind=='fist' else gold if kind=='goldfist' else steel
            if kind!='fist':g.rectangle((hx-2,hy-2,hx+1,hy+1),fill=metal,outline=INK)
            g.line([(hx-1,hy+1),(hx+1,hy+1)],fill=metal)
            if kind=='claw':
                for i in (0,2):g.line([(hx-1,hy+i),(hx-5,hy+i-2)],fill=steel)
        return canvas
    if kind=='fan':
        shape(INK,[(0,0),(8,-8),(13,-6),(15,-2),(15,3),(12,7)])
        shape(steel,[(2,0),(9,-7),(13,-4),(14,1),(12,6)])
        for edge in (-6,-3,1,4):line('#54626c',[(1,0),(12,edge)])
        line(gold,[(-3,0),(8,-6)])
        return canvas
    if kind=='vajra':
        line(INK,[(-6,0),(11,0)],3)
        for sign in (-1,1):
            shape(gold,[(4,0),(7,3*sign),(10,2*sign),(13,0),(8,sign)])
        line(shine,[(1,0),(12,0)]);return canvas
    if kind=='bow':
        a=12 if name=='draw' else 4
        line(INK,[(-5,-13),(1,-11),(4,-7),(0,0),(3,6),(1,11),(-4,14)],3)
        line(gold,[(-5,-13),(1,-10),(3,-7),(0,0),(2,7),(1,10),(-4,14)])
        line('#d7c9ae',[(-5,-13),(-a,0),(-4,14)])
        if name in ('draw','ready','step'):
            line(wood,[(-a,0),(16,0)]);shape(steel,[(20,0),(15,-2),(15,1)])
        return canvas
    if kind=='dart':
        if name not in ('throw','loose','open'):
            shape(INK,[(-2,0),(2,-2),(8,0),(2,2)]);line(shine,[(1,-1),(7,0)])
        return canvas
    pole=kind in ('spear','dragon','staff','glaive')
    base=-15 if pole else -4
    line(INK,[(base,0),(25 if pole else 8,0)],3)
    line(wood,[(base,0),(25 if pole else 7,0)])
    line(gold,[(base,-1),(base,1)])
    if pole:
        for p in (-10,-8,7,9):line(gold,[(p,-1),(p,0)])
        if kind=='staff':
            line(gold,[(21,-1),(26,-1)],2);return canvas
        if kind=='glaive':
            shape(INK,[(18,0),(23,-4),(29,-4),(37,-2),(31,2),(22,2)])
            shape(steel,[(20,0),(24,-3),(30,-3),(35,-2),(28,1)])
        else:
            shape(INK,[(22,0),(27,-3),(37,0),(27,2)])
            shape(steel,[(24,0),(28,-2),(35,0),(28,1)])
        line(shine,[(25,-1),(33,0)]);shape(red,[(21,-1),(19,3),(15,5),(18,1)])
        if kind=='dragon':line(gold,[(3,-1),(13,-1)])
    elif kind=='club':
        shape(INK,[(4,-1),(8,-3),(18,-3),(20,0),(18,3),(8,3),(4,1)])
        line(wood,[(7,0),(17,0)],4);line(gold,[(9,-2),(9,1)])
    else:
        length={'sword':24,'wood':20,'rapier':29,'sabre':24,'blade':26,'ringblade':26,'dagger':12,'piercer':14}[kind]
        wide=3 if kind in ('blade','ringblade') else 1 if kind in ('rapier','piercer') else 2
        curve=-3 if kind in ('sabre','blade','ringblade') else 0
        shape(INK,[(3,-1),(6,-wide),(length-5,-wide+curve),(length+1,curve),(length-4,wide-1),(5,wide)])
        shape(wood if kind=='wood' else steel,[(5,-1),(length-5,1-wide+curve),(length,curve),(length-5,wide-1),(6,wide-1)])
        line(gold if kind=='wood' else shine,[(7,-1),(length-5,1-wide+curve),(length,curve)])
        line(gold,[(4,-3),(3,3)],2);line(red,[(-2,-1),(0,-1)])
        if kind=='ringblade':
            ex,ey=pt(-5,0);g.ellipse((ex-2,ey-2,ex+2,ey+2),outline=gold)
    # A finger curls in front of the handle. The native body supplies its skin tone.
    g.rectangle((x-1,y-1,x,y),fill=(0,0,0,0))
    return canvas


def main():
    people=json.loads(Path(__file__).with_name('field_people.json').read_text(encoding='utf8'))
    poses=list(POSES.items());rows=(len(poses)+COLS-1)//COLS
    for offset in range(0,len(people),8):
        group=people[offset:offset+8]
        sheet=Image.new('RGBA',(COLS*BODY_W,len(group)*rows*BODY_H))
        for row,person in enumerate(group):
            for i,(name,pose) in enumerate(poses):
                body=draw_actor(person,2,0,pose)
                if name=='down':
                    silhouette=body.transpose(Image.Transpose.ROTATE_90)
                    landed=Image.new('RGBA',(BODY_W,BODY_H));landed.alpha_composite(silhouette,(4,62-silhouette.getbbox()[3]));body=landed
                left,top,right,bottom=body.getbbox()
                assert left>0 and top>0 and right<BODY_W and bottom<BODY_H,(person[0],name,body.getbbox())
                sheet.alpha_composite(body,((i%COLS)*BODY_W,(row*rows+i//COLS)*BODY_H))
        sheet.save(DEST/f'combat{offset//8:02}.webp',lossless=True,method=4)
    gear=Image.new('RGBA',(len(poses)*W,len(GEAR)*H))
    for row,kind in enumerate(GEAR):
        for i,(name,pose) in enumerate(poses):
            gear.alpha_composite(draw_gear(kind,name,pose),(i*W,row*H))
    gear.save(DEST/'weapons.webp',lossless=True,method=5)
    builds={};figures={}
    for p in people:
        fig=Figure(p);profile=f'{fig.head}-{fig.build}';figures[p[0]]=profile
        if profile not in builds:
            builds[profile]=[[*fig.point(*v.main[1]),*fig.point(*v.off[1])] for v in POSES.values()]
    pivots=[list(v.main[1]) for v in POSES.values()]
    data=dict(poses=list(POSES),gear=GEAR,cols=COLS,rows=rows,width=W,height=H,origin=[OX,OY],body=[BODY_W,BODY_H],figures=figures,builds=builds,pivots=pivots)
    (DEST/'motions.json').write_text(json.dumps(data,separators=(',',':'))+'\n',encoding='utf8')


if __name__ == '__main__':
    from painted_actors import main as import_painted_cast
    import_painted_cast()
