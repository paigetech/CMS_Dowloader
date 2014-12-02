var fs = require('fs');

function replace_text(string_to_mod, find, rep) {

  return string_to_mod.replace(find , rep);
}

//call this sync so that we know the file is loaded in
var loaded_file = fs.readFileSync("test.txt", 'utf8');

var replacements = JSON.parse(fs.readFileSync("replacements.json", 'utf8'));
//var replacements = {
//  'Hello World!': /hello/g,
//  'Goodbye World!': /goodbye/g
//}
console.log(replacements);
console.log('This is the loaded file :\n' + loaded_file);

for (var key in replacements) {
    if (replacements.hasOwnProperty(key))
      var find_regex = RegExp(replacements[key], 'g');
      var loaded_file = replace_text(loaded_file, find_regex, key);
    console.log("this is the find: " + find_regex);
    console.log("this is the replace: " + key);
    console.log('made a replacment');
}
//var loaded_file = replace_text(loaded_file, key , value);

fs.writeFileSync('helloworld.txt', loaded_file);

console.log('Wrote into file: \n' + loaded_file);

