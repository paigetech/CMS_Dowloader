var fs = require('fs');
var request = require('request');


//call this sync so that we know the file is loaded in
var loadedFile = fs.readFileSync('source.html', 'utf8');

var re = /src=\"(https:\/\/s\d\.amazonaws\.com\/images\.federalregister\.gov\/.*?\/\w+\.\w{3})\"/ig;

var captures = [];
while (match = re.exec(loadedFile)) {
      captures.push(match[1]);
}
//captures = captures.join('\n');

//console.log(captures);

fs.writeFileSync('images.txt', captures);

console.log('complete');


captures.forEach(function(url) {
  var re = /https:\/\/s\d\.amazonaws\.com\/images\.federalregister\.gov\/([\d\w\.]+)\/\w+\.\w{3}/ig;
  var fileVar = re.exec(url);
  var fileName = fileVar[1].toLowerCase() + '.png';

  request(url).pipe(fs.createWriteStream(fileName));

});
