var fs = require('fs');

var data = JSON.parse(fs.readFileSync("replacements.json", 'utf8'));

console.log(data);
