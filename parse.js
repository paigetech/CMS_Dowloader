var pdfParse = require('./pdfParse');
var fs = require('fs');
var exec = require('child_process').exec;


var loadedFile = fs.readFileSync('files.txt', 'utf8');
//get the file names
var filesToGet = loadedFile.split("\n");

//for each file name
console.log(filesToGet);

filesToGet.forEach(function(fileName, err) {
  if (err) return err;
  exec('node pdfParseStandAlone.js ' + fileName + ".pdf" , function(error, stdout, stderr) {
    console.log('stdout: ', stdout);
    console.log('stderr: ', stderr);
    if (error !== null) {
      console.log('exec error: ', error);
    }
  });
});
