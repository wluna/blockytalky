var start, end, diff
var startUp = new Date().getTime()

start = new Date().getTime()

page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

var url = 'file:///home/pi/blockytalky/blockly/static/apps/code/code2.html';

// read xml from file, set 'data' to be the string of xml
var fs = require('fs');
var data = fs.read('rawxml.txt');

end = new Date().getTime();
diff = end - start
console.log(">>> Opening sequence took " + diff + " ms")

page.open(url, function () {
    var pageLoaded = new Date().getTime()
    console.log(">>> FROM START TO PAGE LOADED took " +
        (pageLoaded - startUp) +
        " ms")

    start = new Date().getTime();

    // takes in the xml, runs a blockly converter function on it and returns python
    var converted = page.evaluate(function(data) {
        	return toPython(data);
        }, data);

    end = new Date().getTime();
    diff = end - start
    console.log(">>> toPython() took " + diff + " ms")

    start = new Date().getTime();

    // cleans up <, > character bug
    converted = converted.replace(/&lt;/g, "<");
    converted = converted.replace(/&gt;/g, ">");

    end = new Date().getTime();
    diff = end - start
    console.log(">>> < > replacement took " + diff + " ms")

    start = new Date().getTime();

    // builds structure of run function for usercode.py
    converted = 'def run(self, ws):\nprint ""\n' + converted;
    tabbed = '\n  '
    converted = converted.replace(/\n/g, tabbed);
    converted = 'from message import *\nimport time\nimport RPi.GPIO as GPIO\nimport pyttsx\n\n' + converted;

    end = new Date().getTime();
    diff = end - start
    console.log(">>> Tabbing took " + diff + " ms")

    // print out python function for debugging
    //console.log(" ");
    console.log(converted);

    start = new Date().getTime();

    // writes to script that is then called by us.py
    fs.write('usercode.py', converted, 'w');

    end = new Date().getTime();
    diff = end - start
    console.log(">>> fs.write() took " + diff + " ms")

    end = new Date().getTime();
    diff = end - startUp
    console.log(">>> Total pjsblockly took " + diff + " ms")
    phantom.exit();
});
