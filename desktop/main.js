// 강호행을 프로그램 창으로 띄운다. 게임 코드는 웹판과 같은 것을 그대로 쓴다.
const { app, BrowserWindow, Menu, net, protocol, screen } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const GAME = path.join(__dirname, 'game');

// file:// 에서는 ES 모듈과 fetch가 막힌다. 그래서 전용 주소(game://)로 파일을 내준다.
// 저장(localStorage)도 이 주소에 묶이므로 프로그램을 새로 깔아도 그대로 남는다.
protocol.registerSchemesAsPrivileged([{ scheme: 'game', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

let win = null;

function serve() {
  protocol.handle('game', req => {
    const rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.normalize(path.join(GAME, rel));
    if (!file.startsWith(GAME + path.sep)) return new Response('', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
}

function open() {
  // 화면이 작거나 배율이 높은 노트북에서도 창이 넘치지 않게 줄인다
  const area = screen.getPrimaryDisplay().workAreaSize;
  const k = Math.min(1, (area.width - 40) / 1280, (area.height - 80) / 720);
  win = new BrowserWindow({
    width: Math.round(1280 * k), height: Math.round(720 * k), minWidth: 640, minHeight: 360,
    useContentSize: true, backgroundColor: '#000000', title: '강호행', show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, autoplayPolicy: 'no-user-gesture-required' },
  });
  win.once('ready-to-show', () => win.show());
  win.on('page-title-updated', e => e.preventDefault());
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.on('closed', () => { win = null; });
  win.loadURL('game://gangho/index.html');
}

// 두 번 실행하면 저장이 서로 덮이므로 이미 뜬 창을 앞으로 가져온다
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => { Menu.setApplicationMenu(null); serve(); open(); });
  app.on('window-all-closed', () => app.quit());
}
