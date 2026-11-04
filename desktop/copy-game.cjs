// 웹판 파일을 프로그램 안으로 복사한다. 게임을 고칠 곳은 언제나 저장소 맨 위의 js, css, assets 이다.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(__dirname, 'game');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
for (const f of ['index.html', 'css', 'js', 'assets']) fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
console.log('game copied');
