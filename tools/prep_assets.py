# CC0 Ninja Adventure 팩에서 게임에 쓰는 것만 골라 assets/ 로 복사하고 소리를 변환한다
import os, shutil, subprocess, sys
P = sys.argv[1]; O = 'assets'
def cp(a, b):
    os.makedirs(os.path.dirname(b), exist_ok=True); shutil.copy(os.path.join(P, a), b)
T = 'Backgrounds/Tilesets/'
for n in ['Floor', 'Nature', 'House', 'Element', 'Water', 'Relief', 'FloorDetail']:
    cp(f'{T}Tileset{n}.png', f'{O}/tiles/{n}.png')
for a, b in [('TilesetInterior', 'Interior'), ('TilesetInteriorFloor', 'InteriorFloor'), ('TilesetWallSimple', 'WallSimple'), ('Elements', 'InteriorElements')]:
    cp(f'{T}Interior/{a}.png', f'{O}/tiles/{b}.png')
C = 'Actor/Characters/'
for n in sorted(os.listdir(os.path.join(P, C))):
    d = C + n
    if not os.path.isdir(os.path.join(P, d)): continue
    sheet = next((f for f in ('SpriteSheet.png', 'redsamurai.png') if os.path.exists(os.path.join(P, d, f))), None)
    if not sheet:
        print('스프라이트 없음', n, os.listdir(os.path.join(P, d))); continue
    cp(f'{d}/{sheet}', f'{O}/chars/{n}.png')
    for f in ('Faceset.png', 'Faceset1.png'):
        if os.path.exists(os.path.join(P, d, f)): cp(f'{d}/{f}', f'{O}/faces/{n}.png')
cp(C + 'Shadow.png', f'{O}/chars/_Shadow.png')
M = 'Actor/Monsters/'
for n in ['Beast', 'Snake', 'Snake2', 'Bamboo', 'Spirit', 'Spirit2', 'Skull', 'Racoon', 'Mole', 'Cyclope', 'Flam', 'Slime', 'Eye', 'Butterfly', 'Owl', 'Lizard']:
    a = f'{M}{n}/SpriteSheet.png'
    if not os.path.exists(os.path.join(P, a)): a = f'{M}{n}.png'
    cp(a, f'{O}/mon/{n}.png')
B = 'Actor/Boss/'
for n, fs in {'GiantRacoon': ['Idle', 'Attack'], 'DemonCyclop': ['Idle', 'Hit'], 'GiantSpirit': ['Idle']}.items():
    for f in fs: cp(f'{B}{n}/{f}.png', f'{O}/boss/{n}{f}.png')
    cp(f'{B}{n}/Faceset.png', f'{O}/faces/{n}.png')
F = 'FX/'
for a, b in {'SlashFx/Slash': 'slash', 'SlashFx/SlashCurved': 'curve', 'SlashFx/SlashDouble': 'double', 'SlashFx/SlashDoubleCurved': 'double2', 'SlashFx/CircularSlash': 'circle', 'SlashFx/Cut': 'cut', 'SlashFx/Claw': 'claw',
             'Smoke/Smoke': 'smoke', 'Elemental/Flam': 'flam', 'Elemental/Thunder': 'thunder', 'Elemental/Rock': 'rock', 'Magic/Spark': 'spark', 'Magic/Spirit': 'spirit'}.items():
    cp(f'{F}{a}/SpriteSheet.png', f'{O}/fx/{b}.png')
for a, b in {'Magic/Spirit/SpriteSheetBlue': 'spiritb', 'Magic/Aura/SpriteSheetWhite': 'aura', 'Magic/Aura/SpriteSheetPurple': 'aurap', 'Magic/Circle/SpriteSheetOrange': 'ring', 'Magic/Circle/SpriteSheetWhite': 'ringw', 'Magic/Shield/SpriteSheetYellow': 'shieldy', 'Magic/Shield/SpriteSheetBlue': 'shieldb',
             'Projectile/Arrow': 'p_arrow', 'Projectile/Kunai': 'p_kunai', 'Projectile/Shuriken': 'p_shuriken', 'Projectile/EnergyBall': 'p_energy', 'Projectile/Fireball': 'p_fire', 'Projectile/BigEnergyBall': 'p_bigenergy', 'Projectile/IceSpike': 'p_ice',
             'Particle/LeafPink': 'leafpink', 'Particle/Leaf': 'leaf', 'Particle/Snow': 'snow', 'Particle/Spark': 'psprk'}.items():
    cp(f'{F}{a}.png', f'{O}/fx/{b}.png')
for n in ['Sword', 'Katana', 'BigSword', 'Lance', 'Lance2', 'Stick', 'Sai', 'Axe', 'Club', 'Ninjaku', 'Rapier']:
    cp(f'Items/Weapons/{n}/SpriteInHand.png', f'{O}/wpn/{n}.png')
    cp(f'Items/Weapons/{n}/Sprite.png', f'{O}/wpn/{n}_icon.png')
for a, b in {'Potion/LifePot': 'hp', 'Potion/WaterPot': 'mp', 'Scroll/ScrollEmpty': 'scroll', 'Other/Letter': 'letter', 'Treasure/SilverCoin': 'silver', 'Treasure/GoldCoin': 'gold', 'Treasure/GoldKey': 'key', 'Treasure/LittleTreasureChest': 'chest'}.items():
    cp(f'Items/{a}.png', f'{O}/items/{b}.png')
BGM = {'1 - Adventure Begin': 'begin', '4 - Village': 'village', '5 - Peaceful': 'peaceful', '6 - Story': 'story', '7 - Sad Theme': 'sad', '8 - End Theme': 'end', '9 - Quiet': 'quiet',
       '10 - Dark Castle': 'dark', '12 - Temple': 'temple', '13 - Mystical': 'mystic', '14 - Curse': 'curse', '16 - Melancholia': 'melancholy', '17 - Fight': 'fight', '19 - Ascension': 'ascension', '20 - Good Time': 'good', '21 - Dungeon': 'dungeon', '23 - Road': 'road', '24 - Final Area': 'boss', '2 - The Cave': 'cave', '3 - Revelation': 'reveal'}
for a, b in BGM.items():
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(P, 'Musics', a + '.ogg'), '-ac', '2', '-b:a', '72k', f'{O}/audio/bgm/{b}.mp3'], check=True)
SFX = {'Game/Hit': 'hit', 'Game/Hit1': 'hit1', 'Game/Hit2': 'hit2', 'Game/Hit3': 'hit3', 'Game/Hit4': 'hit4', 'Game/MiniImpact': 'mini', 'Game/Sword': 'sword', 'Game/Sword2': 'sword2', 'Game/Kill': 'kill', 'Game/Jump': 'jump', 'Game/Fx': 'fx',
       'Game/Magic1': 'magic1', 'Game/Magic2': 'magic2', 'Game/Magic3': 'magic3', 'Game/PowerUp1': 'power1', 'Game/PowerUp2': 'power2', 'Game/Explosion': 'boom', 'Game/Explosion2': 'boom2', 'Game/Fireball': 'fireball', 'Game/Spirit': 'spirit', 'Game/Strange': 'strange',
       'Game/Bonus': 'bonus', 'Game/Coin': 'coin', 'Game/Success1': 'ok1', 'Game/Success2': 'ok2', 'Game/Success3': 'ok3', 'Game/GameOver': 'over', 'Game/Secret1': 'secret', 'Game/Alert': 'alert', 'Menu/Accept': 'accept', 'Menu/Cancel': 'cancel', 'Menu/Menu1': 'tick', 'Menu/Menu2': 'select', 'Menu/Menu5': 'text'}
for a, b in SFX.items():
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(P, 'Sounds', a + '.wav'), '-ac', '1', '-b:a', '64k', f'{O}/audio/sfx/{b}.mp3'], check=True)
