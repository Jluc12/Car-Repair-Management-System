const fs=require('fs');
function w(p,a){fs.writeFileSync(p,a.join('\n'),'utf8');console.log('OK '+p+' ('+a.length+'L)');}
