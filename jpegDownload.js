var fs = require('fs');
var request = require('request');
var http = require('http');
var Scraper = require('image-scraper');
var scraper = new Scraper("");

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var i = 1;
while (i < 2){
  var url = "http://www.bikeforums.net/singlespeed-fixed-gear/71698-show-tell-your-ink-" + i + ".html";
  scraper.address = url;
  scraper.on("image", function(image) {
    image.save();
  });

//
  i++;

}

