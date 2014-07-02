'use strict';

if(!Blockly.Language) Blockly.Language= {};

Blockly.Language.facebook_msg= {
    category: 'Facebook',
    helpUrl: '',
    init: function() {
	this.setColour(200);
	this.appendDummyInput("")
	    .appendTitle("Facebook Message")
	this.setOutput(true,'String');
        this.setInputsInline(true);
	this.setPreviousStatement(false);
	this.setNextStatement(false);
	this.setTooltip('get facebook message');
    }
};

Blockly.Language.send_osc = {
category: 'Messaging',
    helpUrl: 'http://www.google.com',
    init: function() {
        this.setColour(200);
        this.appendDummyInput('')
            .appendTitle('Send over OSC:');
        this.appendDummyInput('')
            .appendTitle(new Blockly.FieldTextInput('/path/'), 'target');
        this.appendDummyInput('')
            .appendTitle('Value: ')
            .appendTitle(new Blockly.FieldTextInput('1'), 'value');
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    this.setTooltip('Send message of value to /path/ via OSC');
    }
};

Blockly.Language.facebook_poke= {
    category: 'Facebook',
    helpUrl: 'http://www.google.com',
    init: function() {
	this.setColour(200);
	this.appendDummyInput("")
	    .appendTitle("Facebook Poke:")
	this.setInputsInline(true);
	this.setOutput(true);
	this.setPreviousStatement(false);
	this.setNextStatement(false);
    this.setTooltip('Facebook Poke');
    }
};

Blockly.Language.messaging_tell= {
    category: 'Messaging',
    helpUrl: 'http://www.google.com',
    init: function() {
	this.setColour(200);
	this.appendDummyInput("")
	    .appendTitle("Tell:")
	this.appendDummyInput("")
            .appendTitle(new Blockly.FieldTextInput('mystique'), 'target');
	this.appendDummyInput("")
	    .appendTitle(" ")
            .appendTitle(new Blockly.FieldTextInput('go'), 'command');
	this.setInputsInline(true);
	this.setOutput(false);
	this.setPreviousStatement(true);
	this.setNextStatement(true);
    this.setTooltip('send a text command to another robot (by name)');
    }
};


Blockly.Language.messaging_source= {
    category: 'Messaging',
    helpUrl: 'http://www.google.com',
    init: function() {
	this.setColour(200);
	this.appendDummyInput("")
	    .appendTitle("Message From:")
	this.appendDummyInput("")
            .appendTitle(new Blockly.FieldTextInput('mystique'), 'src');
	this.setInputsInline(true);
	this.setOutput(true, 'Boolean');
	this.setPreviousStatement(false);
	this.setNextStatement(false);
    this.setTooltip('Returns true if a message has been received from the specified robot');
    }
};

Blockly.Language.messaging_content= {
    category: 'Messaging',
    helpUrl: 'http://www.google.com',
    init: function() {
	this.setColour(200);
	this.appendDummyInput("")
	    .appendTitle("Message that says:");
	this.appendDummyInput("")
            .appendTitle(new Blockly.FieldTextInput('go'), 'msg');
	this.setInputsInline(true);
	this.setOutput(true, 'Boolean');
	this.setPreviousStatement(false);
	this.setNextStatement(false);
    this.setTooltip('returns true if a message of the desired content has been received.');
    }
};

Blockly.Language.messaging_say= {
category: 'Messaging',
  helpUrl: 'http://www.google.com',
  init: function() {
    this.setColour(200);
    this.appendDummyInput("")
        .appendTitle("Say:");
    this.appendDummyInput("")
        .appendTitle(new Blockly.FieldTextInput('Hello'), 'speak');
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('BTU speaks this text');
  }
};

// Constructing an OSC message
Blockly.Language.create_osc_message = {
category: 'Messaging',
  helpUrl: 'opensoundcontrol.org',
  init: function() {
    this.setColour(120);
    this.appendDummyInput("")
        .appendTitle("Create OSC message with address pattern")
        .appendTitle(new Blockly.FieldTextInput("/example/address"), "address_pattern");
    this.appendValueInput("message_content")
        .setCheck("null")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle("containing this content:");
    this.setOutput(true, "OSCMessage");
    this.setTooltip('Construct an OSC message containing arbitrary data.');
  }
};

// Sending an OSC message (that actually works)
Blockly.Language.send_osc_message = {
category: 'Messaging',
  helpUrl: 'opensoundcontrol.org',
  init: function() {
    this.setColour(120);
    this.appendValueInput("message_input")
        .setCheck("OSCMessage")
        .appendTitle("Send an OSC message:");
    this.appendDummyInput("")
        .appendTitle("to")
        .appendTitle(new Blockly.FieldTextInput("127.0.0.1"), "hostname")
        .appendTitle("on port")
        .appendTitle(new Blockly.FieldTextInput("1111"), "port_as_string");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Send a constructed OSC message to another machine on the network');
  }
};



//
//Define generators
//


Blockly.Python= Blockly.Generator.get('Python');

Blockly.Python.facebook_msg= function() {
    var code = 'facebook message code'+'\n';
    return code;
};


Blockly.Python.send_osc= function() {
    var target = this.getTitleValue('target')
    var value = this.getTitleValue('value')
    var code = 'client.send(OSCMessage("'+target+'", '+value+'))'+'\n';
    return code;
};


Blockly.Python.facebook_poke= function() {
    var code= 'facebook poke code'+'\n';
    return code;
};

Blockly.Python.messaging_tell= function() {
    var target= this.getTitleValue('target');
    var command= this.getTitleValue('command');
    var code= 'toSend = Message(self.hostname, "'+target+'", "Message", "'+command+'")'+'\n'+ 'toSend = Message.encode(toSend)' + '\n' +
	'channel2.basic_publish(exchange="", routing_key="Message", body=toSend)'+'\n'+'time.sleep(.01)'+'\n';
    return code;
};

Blockly.Python.messaging_source= function() {
    var source= this.getTitleValue('src');
    var code= 'self.checkSource("'+source+'")';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.messaging_content= function() {
    var content= this.getTitleValue('msg');
    var code= 'self.checkContent("'+content+'")';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.messaging_say= function() {
    var content= this.getTitleValue('speak');
    var code= 'engine=pyttsx.init()\nengine.say("'+content+'")\nengine.runAndWait()\n';
    return code;
};

Blockly.Python.create_osc_message = function() {
  // message content can be anything, but to send more than one
  // kind of thing at a time one should use a list.
  var value_message_content = Blockly.Python.valueToCode(this, 'message_content', Blockly.JavaScript.ORDER_ATOMIC);
  // The address pattern is a proper OSC-formatted address pattern string. /example/of/formatting
  var text_address_pattern = this.getTitleValue('address_pattern');
  // TODO: Assemble Python into code variable.
  var code = "(\"" + text_address_pattern + "\", " + value_message_content +  ")";
  console.log("Just constructed an OSC message:\n" + code);
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python.send_osc_message = function() {
  // Get the message_input object from the block connected
  // as a value. This should only be an "OSCMessage"-type
  // value as generated by the create_osc_message block,
  // which consists of a list containing first an address
  // pattern followed by the message content (itself another
  // list of arbitrary length).
  var value_message_input = Blockly.Python.valueToCode(this, 'message_input', Blockly.Python.ORDER_NONE);
  console.log("Value of OSC message input was " + value_message_input);
  // Hostname and port.
  var value_hostname = this.getTitleValue('hostname');
  var value_port_as_string = this.getTitleValue('port_as_string');
  /*
    The following Python code does a few things
    in order to attempt to be robust.
    1) It constructs the message to be sent.
    2) It imports OSC if OSC hasn't been imported yet.
    3) It checks if an OSC client has been created,
    and if not, it creates one.
    4) It checks if the client is connected to the right address
    If not, it connects to the argument address and port.
    5) Finally, it sends the message.
  */
  var code = "try:\n";
  code += "\tmessage = OSC.OSCMessage()\n";
  code += "except NameError:\n"
  code += "\timport OSC\n"
  code += "\tmessage = OSC.OSCMessage()\n"
  code += "message.setAddress(" + value_message_input + "[0])\n"
  code += "message.append(" + value_message_input + "[1])\n"
  code += "try:\n"
  code += "\tosc_client\n"
  code += "except NameError:\n"
  code += "\tosc_client = OSC.OSCClient()\n"
  code += "if (osc_client.address() != \"" + value_hostname + "\"):\n"
  code += "\tosc_client.connect( (\"" + value_hostname + "\", " + value_port_as_string + ") )\n"
  code += "osc_client.send(message)\n";
  
  // For now, print this code to the console so it can be looked over if something goes wrong.
  console.log('Just tried to send OSC message.\n' + code);
  return code;
};

