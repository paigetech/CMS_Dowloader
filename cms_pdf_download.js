var fs = require('fs');
var request = require('request');
var myArgs = process.argv.slice(2);
var pdfParse = require('./pdfParse');
var exec = require('child_process').exec;

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
  var r = request(url).pipe(fs.createWriteStream(fileName));

  r.on('finish', function(){

    //run the pdfparse to have the text outputs
    exec('node pdfParseStandAlone.js ' + fileName , function(error, stdout, stderr) {
      console.log('stdout: ', stdout);
      console.log('stderr: ', stderr);
      if (error !== null) {
        console.log('exec error: ', error);
      }
    });
  
  });



  if (err) console.log(err);

});
