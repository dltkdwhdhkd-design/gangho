// 시험이 chromium.launch()만 부르니, 여기 깔린 크롬을 쓰게 한다
const pw = require('playwright');
const orig = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = (o = {}) => orig({ executablePath: '/usr/bin/google-chrome', ...o, args: [...(o.args || []), '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
