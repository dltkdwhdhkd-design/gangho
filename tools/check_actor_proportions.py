"""Check the shipped walking sheets against each character's three-head design."""
import json

from PIL import Image

from field_sprites import DEST, ROOT, Figure


def main():
    people = json.loads((ROOT / 'tools/field_people.json').read_text(encoding='utf8'))
    walking = json.loads((DEST / 'walk.json').read_text(encoding='utf8'))
    motion = json.loads((DEST / 'motions.json').read_text(encoding='utf8'))
    heights = set()
    pages = {}
    frames = 0
    for person in people:
        identity = person[0]
        figure = Figure(person)
        unit = figure.head
        heights.add(unit * 3)
        crown, chin, sole = (figure.point(27, y)[1] for y in (6, 21, 53))
        assert chin - crown + 1 == unit, identity
        assert sole - crown + 1 == unit * 3, identity
        assert motion['figures'][identity] == f'{unit}-{figure.build}', identity
        page, row = walking[identity]
        if page not in pages:
            with Image.open(DEST / (page + '.webp')) as atlas:
                pages[page] = atlas.getchannel('A')
        for direction in range(4):
            for phase in range(4):
                x, y = direction * 56, (4 * row + phase) * 56
                silhouette = pages[page].crop((x, y, x + 56, y + 56)).getbbox()
                assert silhouette and silhouette[1] == crown and silhouette[3] == sole + 1, (identity, direction, phase)
                frames += 1
    assert len(heights) > 1, 'A shared head-to-body ratio must preserve differences in stature'
    assert set(walking) == set(motion['figures']) == {p[0] for p in people}
    print(f'{len(people)} designs, {frames} frames, visible heights {sorted(heights)}')


if __name__ == '__main__':
    main()
