var fs = require('fs');
var request = require('request');
var myArgs = process.argv.slice(2);

//load the file from the argument
var loadedFile = fs.readFileSync(myArgs[0], 'utf8');
//get the file names
var filesToGet = loadedFile.split("\n");

//for each file name

filesToGet.forEach(function(fileName, err) {
  fileName = fileName + ".pdf";
  var url = "http://www.cms.gov/Regulations-and-Guidance/Guidance/Transmittals/Downloads/" + fileName;
  console.log(url);

  //save/download the file
  request(url).pipe(fs.createWriteStream(fileName));


  if (err) console.log(err);

});


