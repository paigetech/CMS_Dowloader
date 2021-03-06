var fs = require('fs'),
  nodeUtil = require('util'),
  textract = require('textract');
var request = require('request');


module.exports = function( pdf , err ) {
  pdf = pdf + '.pdf';
  var filePath = './' + pdf;
  var config = {
   'preserveLineBreaks' : "true"
  };

  textract(filePath, config, function( err, text ) {
    if(err) {
      console.log(err);
      return;
    }
    var pdfText = '';
    var reTitle = /SUBJECT:\s(.*?)[\n\r]/;
    var reDate = /Date:\s(.*?)[\n\r]/;
    var reAttach = /IV\. ATTACHMENTS:\n\n(Recurring Update Notification|Manual Instruction|Business Requirements)[\n\r](Recurring Update Notification|Manual Instruction|Business Requirements)?[\n\r]?(Recurring Update Notification|Manual Instruction|Business Requirements)?[\n\r]?/;
    var subject = text.match(reTitle)[1];
    var date = text.match(reDate)[1];
    var attach = text.match(reAttach);
    attach.pop();
    attach.shift();
    var attachments = pdf;
    console.log("attach: " + attach);
    if ((attach.indexOf('Recurring Update Notification')) != -1) {
      console.log('Recur');
      attachments = attachments + " Recur";
    }
    if ((attach.indexOf('Manual Instruction')) != -1) {
      console.log('Manual Update');
      attachments = attachments + " Manual Update";
    }
    if ((attach.indexOf('Business Requirements')) != -1) {
      console.log('BusReq');
      attachments = attachments + " BusReq";
    }
    attachments = attachments + "\n";

    var dateParse = date.match(/([A-Za-z]+)\s(\d+),\s(\d{4})/);
    dateParse.shift();

    var months = {
      "January" : 1,
      "February" : 2,
      "March" : 3,
      "April" : 4,
      "May" : 5,
      "June" : 6,
      "July" : 7,
      "August" : 8,
      "September" : 9,
      "October" : 10,
      "November" : 11,
      "December" : 12
    };

    var month = months[dateParse[0]];
    var day = dateParse[1];
    if (day.length === 1) {
      day = "0" + day;
    }
      
    var mrDate = dateParse[2] + '-' + day + '-' + month;

    pdf = pdf.toUpperCase().slice(0,-4);
    var dateNow = function() {
      var dateNow = new Date();
      var dd = dateNow.getDate();
      var monthSingleDigit = dateNow.getMonth() + 1,
      mm = monthSingleDigit < 10 ? '0' + monthSingleDigit : monthSingleDigit;
      var yy = dateNow.getFullYear().toString();
      return (yy + '-' + mm + '-' + dd);
    };

    var transmittal = pdf.slice(1,5);

    var doc = 
    "<doc> \n\
:::date " + mrDate + "\n\
:::uid mrepm10004" + pdf + "\n\
:::index mrepm10004" + pdf + "\n\
:::file \\" + pdf + ".pdf \n\
:::wn " + dateNow() + " \n\
<h4>Transmittal #" + transmittal + " Date: " + date + " - " + subject + ". (PDF)</h4>; \n\
</doc>; \n";

    console.log(doc);
    fs.appendFileSync('allTransmittals.txt', doc);
    fs.appendFileSync('attachments.txt', attachments);
  });
};
