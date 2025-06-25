const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('js-plurge.json','utf8'));
const version = '1.0.3';
let output = cfg.header || '';
output += `/* Version: ${version} */\n`;
for(const file of cfg.files){
  const content = fs.readFileSync(file,'utf8');
  const header = (cfg.fileheader || '').replace('${filename}', file);
  output += header + '\n' + content + '\n';
}
output += cfg.footer || '';
fs.writeFileSync(cfg.out, output);
