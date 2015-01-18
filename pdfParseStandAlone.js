var fs = require('fs'),
  nodeUtil = require('util'),
  textract = require('textract');
var request = require('request');

var myArgs = process.argv.slice(2);
var pdf = myArgs[0];

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
  var reTitle = /SUBJECT:\s([\S\s]*?)\n{2}/;
  var reDate = /Date:\s(.*?)[\n\r]/;
  var reAttach = /IV\. ATTACHMENTS:[\S\s]*?(Recurring Update Notification|Manual Instruction|Business Requirements)[\n\r](Recurring Update Notification|Manual Instruction|Business Requirements)?[\n\r]?(Recurring Update Notification|Manual Instruction|Business Requirements)?[\n\r]?/;
  var reRecinds = /(Transmittal\s\d+, dated[\S\s]*?rescinded[\S\s]*?)\n{2}/g;
  var subject = text.match(reTitle)[1];
  var date = text.match(reDate)[1];
  var attach = text.match(reAttach);
  var recindReplace = text.match(reRecinds);

  if (recindReplace) {
    console.log("RECINDS: " + recindReplace);
    var reReplace = /Transmittal\s(\d+),\sdated\s([A-Z]\w+\s\d\d?,\s\d{4})/;
    var trans = reReplace.exec(recindReplace)[1];
    var dates = reReplace.exec(recindReplace)[2];
    subject += " *Rescinds and Replaces Transmittal " + trans + ", dated " + dates + "*";
  }

  subject = subject.replace(/\n/g, " ");

  fs.writeFileSync('textract.txt', text);

  var dateParse = date.match(/([A-Za-z]+)\s(\d+),\s(\d{4})/);
  dateParse.shift();

  var months = {
    "January" : 01,
    "February" : 02,
    "March" : 03,
    "April" : 04,
    "May" : 05,
    "June" : 06,
    "July" : 07,
    "August" : 08,
    "September" : 09,
    "October" : 10,
    "November" : 11,
    "December" : 12
  };

  var month = months[dateParse[0]];
  var day = dateParse[1];
  if (day.length === 1) {
    day = "0" + day;
  }
    
  var mrDate = dateParse[2] + '-' + month + '-' + day;

  pdf = pdf.toUpperCase().slice(0,-4);

  var dateNow = function() {
    var dateNow = new Date();
    var dateSingleDigit = dateNow.getDate(), 
    dd = dateSingleDigit < 10 ? '0' + dateSingleDigit : dateSingleDigit;
    var monthSingleDigit = dateNow.getMonth() + 1,
    mm = monthSingleDigit < 10 ? '0' + monthSingleDigit : monthSingleDigit;
    var yy = dateNow.getFullYear().toString();
    return (yy + '-' + mm + '-' + dd);
  };
  var dateNowStandard = function() {
    var dateNow = new Date();
    var dd = dateNow.getDate();
    var monthSingleDigit = dateNow.getMonth() + 1,
    mm = monthSingleDigit < 10 ? '0' + monthSingleDigit : monthSingleDigit;
    var yy = dateNow.getFullYear().toString();
    return (mm + "/" + dd + "/" + yy.slice(2,0));
  };

  //var transmittal = pdf.slice(1,5);
  //match for this instead
  var re = /r(\d+)\w+/gi;
  var transmittal = re.exec(pdf)[1];

  var collection;
  re = /r\d+([\S\s]*)/gi;
  pdf = pdf.toLowerCase();
  switch(re.exec(pdf)[1]){
    case "cp":
      collection = "mrepm10004";
      break;
    case "pi":
      collection = "mrpm10008";
      break;
    case "otn":
      collection = "mrepm10020";
      break;
    case "bp":
      collection = "mrepm10002";
      break;
    case "soma":
      collection = "mrepm10007";
      break;
    case "demo":
      collection = "mremrpm10019";
      break;
    case "msp":
      collection = "mremrmspm";
      break;
    case "ncd":
      collection = "mrepm10003";
      break;
    case "gi":
      collection = "mrpm10001";
      break;
    case "mcm":
      collection = "mrpm10016";
      break;
    case "fm":
      collection = "mrpm1006";
      break;
  }

  console.log("PDF: " + pdf + " COLLECTION: " + collection);


  var doc = 
  "<doc> \n\
:::date " + mrDate + "\n\
:::uid " + collection + pdf + "\n\
:::index " + collection + pdf + "\n\
:::file \\" + pdf + ".pdf\n\
:::wn " + dateNow() + "\n\
<h4>Transmittal #" + transmittal + " Date: " + date + " - " + subject + ". (PDF)</h4>\n\
</doc>\n";


  if (collection === "mrepm10004") {
    if (attach) {
      attach.pop();
      attach.shift();
      var attachments = pdf;
      if ((attach.indexOf('Recurring Update Notification')) != -1) {
        attachments = attachments + " Recur \n";
        attachments = attachments + "<tr><td><!!img><a href=\"" + pdf + "recur.pdf\">" + dateNowStandard() + " Transmittal #" + transmittal + " " + subject + " (PDF)</a></td></tr>\n";
      }
      if ((attach.indexOf('Manual Instruction')) != -1) {
        attachments = attachments + " Manual Update\n";
      }
      if ((attach.indexOf('Business Requirements')) != -1) {
        attachments = attachments + " BusReq \n";
        attachments = attachments + "<li><!!img><a href=\"" + pdf + "busreq.pdf\">" + dateNowStandard() + " Transmittal #" + transmittal + " " + subject + " (PDF)</a></li>\n";
      }
      attachments = attachments + "\n";
    }
  } else if (attach) {
      attach.pop();
      attach.shift();
      var attachments = pdf;
      if ((attach.indexOf('Recurring Update Notification')) != -1) {
        attachments = attachments + " Recur \n";
        attachments = attachments + "<tr><td><!!img><a href=\"" + pdf + "recur.pdf\">" + dateNowStandard() + " Transmittal #" + transmittal + " " + subject + " (PDF)</a></td></tr>\n";
      }
      if ((attach.indexOf('Manual Instruction')) != -1) {
        attachments = attachments + " Manual Update";
        attachments = attachments + "<doc> \n:::date " + mrDate + "\n:::uid " + collection + pdf + "recur\n:::index " + collection + pdf + "recur\n:::file \\" + pdf + ".pdf\n:::wn " + dateNow() + "\n<h4>" + dateNowStandard() + " Transmittal #" + transmittal + subject + " "  + " (PDF)</h4>\n</doc>\n";
      }
      if ((attach.indexOf('Business Requirements')) != -1) {
        attachments = attachments + " BusReq \n";
        attachments = attachments + "<doc> \n:::date " + mrDate + "\n:::uid " + collection + pdf + "busreq\n:::index " + collection + pdf + "busreq\n:::file \\" + pdf + ".pdf\n:::wn " + dateNow() + "\n<h4>" + dateNowStandard() + " Transmittal #" + transmittal + " " + subject + " (PDF)</h4>\n</doc>\n";
      }
      attachments = attachments + "\n";
      fs.appendFileSync('attachments.txt', attachments);
    }

  fs.appendFileSync('allTransmittals.txt', doc);
});
