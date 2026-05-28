const fs = require('fs');
let data = fs.readFileSync('routes/courseRoutes.js', 'utf8');
data = data.replace(/model: 'gemini-[a-zA-Z0-9.-]+'/g, "model: 'gemini-2.5-flash'");
fs.writeFileSync('routes/courseRoutes.js', data);
console.log("Fixed!");
