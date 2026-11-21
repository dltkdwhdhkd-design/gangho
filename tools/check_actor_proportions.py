"""Validate the shipped cast atlases, including proportions, transparency and gear anchors."""
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
FIELD=ROOT/'assets/hd2d/field'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
def check_cheong_gaze(sheet, row, cell):
    # Pupil and adjacent sclera at the native walking resolution for each facing.
    samples = [(0, 51, 1), (0, 59, -1), (2, 50, -1), (3, 60, 1)]
    for phase, eye_y in enumerate((42, 42, 40, 42)):
        y = (4 * row + phase) * cell + eye_y
        for direction, eye_x, inward in samples:
            x = direction * cell + eye_x
            iris = sheet.getpixel((x, y))
            sclera = sheet.getpixel((x + inward, y))
            assert min(sclera[:3]) - max(iris[:3]) > 74, (direction, phase, 'gaze contrast')
            assert iris[0] - iris[1] < 48 and max(iris[:3]) < 127, (direction, phase, 'iris')

def main():
    people=read(ROOT/'tools/field_people.json')
    walking=read(FIELD/'walk.json')
    layout=read(FIELD/'motions.json')
    people_by_id={p[0]:p for p in people}
    assert set(walking)==set(layout['hands'])==set(people_by_id)
    groups={}
    for key,(page,row) in walking.items():groups.setdefault(page,[]).append((row,key))
    statures=set();walks,actions=0,0
    for page,entries in groups.items():
        with Image.open(FIELD/(page+'.webp')) as im:
            cell=im.width//4; mask=im.getchannel('A').point(lambda a:255 if a>100 else 0)
            assert cell==112 and im.height==len(entries)*4*cell
            for row,key in entries:
                head=people_by_id[key][11];statures.add(head*3)
                if key == 'cheongmyeong':
                    check_cheong_gaze(im, row, cell)
                for d in range(4):
                    poses=set()
                    for j in range(4):
                        x=d*cell;y=(4*row+j)*cell
                        patch=mask.crop((x,y,x+cell,y+cell));box=patch.getbbox()
                        assert box and 0<=box[1]<box[3]<=cell, (key,d,j,box)
                        height=box[3]-box[1];expected=3*head*cell/56
                        assert abs(height-expected)<=max(5,expected*.09),(key,height,expected)
                        assert patch.getpixel((0,0))==patch.getpixel((cell-1,0))==0,(key,d,j)
                        poses.add(patch.tobytes());walks+=1
                    assert len(poses)>=3,(key,d,'walk strides')
        with Image.open(FIELD/(page.replace('walk','combat')+'.webp')) as im:
            w,h=[layout['resolution']*q for q in layout['body']]
            assert im.size==(layout['cols']*w,len(entries)*layout['rows']*h)
            mask=im.getchannel('A').point(lambda a:255 if a>90 else 0)
            for row,key in entries:
                assert len(layout['hands'][key])==15
                for tile,grips in enumerate(layout['hands'][key]):
                    x=tile%layout['cols']*w;y=(row*layout['rows']+tile//layout['cols'])*h
                    box=mask.crop((x,y,x+w,y+h)).getbbox()
                    assert box and 0<box[0] and box[2]<w and box[1]>=0 and box[3]<h,(key,tile,box)
                    for gx,gy in zip(grips[::2],grips[1::2]):
                        rx=round((gx-28+layout['bodyAnchor'][0])*layout['resolution'])
                        ry=round((gy-56+layout['bodyAnchor'][1])*layout['resolution'])
                        assert mask.crop((x+rx-2,y+ry-2,x+rx+3,y+ry+3)).getbbox(),(key,tile,'hand')
                    actions+=1
    assert len(statures)>1
    names=set(read(ROOT/'assets/art/list.json'))
    for key in walking:
        assert key+'_n' in names,key
        with Image.open(ROOT/'assets/art'/(key+'_n.webp')) as portrait:
            a=portrait.getchannel('A')
            assert portrait.size==(432,648) and a.getextrema()==(0,255) and a.getpixel((0,0))==0,key
            assert sum(a.histogram()[155:])>portrait.width*portrait.height*.15,(key,'missing portrait ink')
    print(f'{len(people)} people, {walks} walking frames, {actions} combat frames, designed heights {sorted(statures)}')
if __name__=='__main__':main()

