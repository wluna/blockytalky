 /**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Python for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 */
//'use strict';

if(!Blockly.Language) Blockly.Language= {};

var prefix = 'message.getContent()';

var unique_id = 0;

Blockly.Language.sensor_touch={
    category:"Sensors",
    helpUrl:"",
    init:function() {
    this.setColour(50);
    this.appendDummyInput("")
        .appendTitle("Touch Sensor:");
    this.appendDummyInput("")
        .appendTitle("Port")
        .appendTitle(new Blockly.FieldDropdown([["1","1"],["2","2"],
            ["3","3"],["4","4"]]),"port");
    this.appendDummyInput("")
        .appendTitle(new Blockly.FieldDropdown([["is pressed","1"],["is released","0"]]),"status");
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip("Returns the status of a touch sensor");
    }
};

Blockly.Language.sensor_light={
    category:"Sensors",
    helpUrl:"",
    init:function() {
    this.setColour(50);
    this.appendDummyInput("")
        .appendTitle("Light Sensor:");
    this.appendDummyInput("")
        .appendTitle("Port")
        .appendTitle(new Blockly.FieldDropdown([["1","1"],["2","2"],
            ["3","3"],["4","4"]]),"port");
    this.setInputsInline(!0);
    this.setOutput(!0,"Number");
    this.setTooltip("Returns the value of a light sensor");
    }
};

Blockly.Language.sensor_ultrasonic={
    category:"Sensors",
    helpUrl:"",
    init:function() {
    this.setColour(50);
    this.appendDummyInput("")
        .appendTitle("Ultrasonic Sensor:");
    this.appendDummyInput("")
        .appendTitle("Port")
        .appendTitle(new Blockly.FieldDropdown([["1","1"],["2","2"],
            ["3","3"],["4","4"]]),"port");
    this.setInputsInline(!0);
    this.setOutput(!0,"Number");
    this.setTooltip("Returns the value of an ultrasonic sensor");
    }
};

Blockly.Language.sensor_sound={
    category:"Sensors",
    helpUrl:"",
    init:function() {
    this.setColour(50);
    this.appendDummyInput("")
        .appendTitle("Sound Sensor:");
    this.appendDummyInput("")
        .appendTitle("Port")
        .appendTitle(new Blockly.FieldDropdown([["1","1"],["2","2"],
            ["3","3"],["4","4"]]),"port");
    this.setInputsInline(!0);
    this.setOutput(!0,"Number");
    this.setTooltip("Returns the value of a sound sensor");
    }
};


Blockly.Language.motor_set= {
    category: 'Motors',
    helpUrl: 'http://www.google.com',
    init: function() {
    this.setColour(300);
    this.appendDummyInput("")
        .appendTitle("set motor")
            .appendTitle(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], 
                ["3","3"],["4","4"],["All","All"]]), 'motor_num');
      /*this.appendDummyInput()
        .appendTitle(' MotorPower')
            .appendTitle(new Blockly.FieldTextInput('100',
            Blockly.Language.math_number.validator), 'motor_power');*/
    this.appendDummyInput("")
            .appendTitle(" to power");
    this.appendValueInput('motor_power')
            .setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Motor 1-4, Power -100 to 100');
    }
};

Blockly.Language.light_set= {
    category: 'Lights',
    helpUrl: 'http://www.google.com',
    init: function() {
    this.setColour(300);
    this.appendDummyInput("")
        .appendTitle("set light on motor port")
            .appendTitle(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], 
                ["3","3"],["4","4"],["All","All"]]), 'motor_num');
      /*this.appendDummyInput()
        .appendTitle(' MotorPower')
            .appendTitle(new Blockly.FieldTextInput('100',
            Blockly.Language.math_number.validator), 'motor_power');*/
    this.appendDummyInput("")
            .appendTitle(" to power");
    this.appendValueInput('motor_power')
            .setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Light in motor port 1-4, Power 0 to 100');
    }
};

Blockly.Language.motor_all_stop= {
    category: 'Motors',
    helpUrl: 'www.google.com',
    init: function() {
	this.setColour(300);
	this.appendDummyInput("")
	    .appendTitle("stop all motors");
	this.setOutput(false);
	this.setPreviousStatement(true);
	this.setNextStatement(true);
	this.setTooltip('stop all motors');
    }
};

Blockly.Language.motor_get_encoder= {
    category: 'Motors',
    helpUrl: '',
    init: function() {
    this.setColour(300);
    this.appendDummyInput("")
        .appendTitle("encoder value of motor");
    this.appendDummyInput("")
        .appendTitle(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3","3"], ["4","4"]]), 'enc');
    this.setInputsInline(true);
    this.setOutput(true,'Number');
    this.setTooltip('Returns absolute rotation of specified motor');
    }
};

Blockly.Language.pin_in= {
    category: 'GPIO',
    helpUrl: '',
    init: function() {
    this.setColour(0);
    this.appendDummyInput("")
        .appendTitle("GPIO In Pin:")
        .appendTitle(new Blockly.FieldDropdown([["12", "12"], ["16", "16"],
                            ["18", "18"],["22", "22"]]), 'gpio_in_pin');
    this.appendDummyInput("")
        .appendTitle("Value:")
            .appendTitle(new Blockly.FieldDropdown([["HIGH", "1"], ["LOW", "0"]]), 'gpio_in_value');
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.Language.pin_out= {
    category: 'GPIO',
    helpUrl: '',
    init: function() {
    this.setColour(0);
    this.appendDummyInput("")
        .appendTitle("GPIO Out Pin:")
        .appendTitle(new Blockly.FieldDropdown([["7", "7"], ["11", "11"],
                            ["13","13"],["15","15"]]), 'gpio_out_pin');
    this.appendDummyInput("")
        .appendTitle("Value:")
            .appendTitle(new Blockly.FieldDropdown([["HIGH", "1"], ["LOW", "0"]]), 'gpio_out_value');
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};


Blockly.Language.sensor_new_val= {
    category: 'Sensors',
    helpUrl: '',
    init: function() {
    this.setColour(300)
    this.appendDummyInput("")
        .appendTitle("Unread Data On:");
    this.appendDummyInput("")
        .appendTitle(new Blockly.FieldDropdown([["Sensor 1", "sensor1"], 
						["Sensor 2", "sensor2"],
                                                ["Sensor 3", "sensor3"],
						["Sensor 4", "sensor4"],
						["Sensor 5", "sensor5"],
						["Encoder 1", "encoder1"],
						["Encoder 2", "encoder2"],
						["Encoder 3", "encoder3"],
						["Encoder 4", "encoder4"]]), 'port');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setTooltip('Returns true if there is unread data on the specified port');
    }

}

Blockly.Language.led_set= {
  category: 'LED',
  helpUrl: '',
  init: function() {
    this.setColour(300);
    this.appendDummyInput("")
    .appendTitle("Set LEDs:");
    this.appendDummyInput("")
    .appendTitle("LED1")
        .appendTitle(new Blockly.FieldDropdown([["On", "On"], ["Off", "Off"]]), 'led1');
    this.appendDummyInput("")
    .appendTitle("LED2")
        .appendTitle(new Blockly.FieldDropdown([["On", "On"], ["Off", "Off"]]), 'led2');
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Set LEDs');
  }
};  

Blockly.Language.time_sleep= {
    category: 'Time',
    helpUrl: '',
    init: function() {
	this.setColour(300);
	this.appendDummyInput("")
	    .appendTitle('Wait for')
            .appendTitle(new Blockly.FieldTextInput('1000', Blockly.Language.math_number.validator), 'time_sleep');
     this.appendDummyInput("")
	    .appendTitle('ms');
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Pause for ___ milliseconds');
  }
};

Blockly.Language.print_print= {
category: 'Print',
  helpUrl: '',
  init: function() {
    this.setColour(300);
    this.appendDummyInput("")
          .appendTitle("Print: ");
    this.appendValueInput('to_print')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Prints to terminal on Pi');
  }
};


Blockly.Language.controls_inf_loop = {
  //Infinite loop.                                                              
    helpUrl: '',
    init: function() {
        this.setColour(120);
        this.appendDummyInput("")
            .appendTitle('repeat forever');
        this.appendStatementInput('DO')
            .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.Language.events_on_start = {
    // Run on start
    helpUrl: '',
    init: function() {
	this.setColour(30);
	this.appendDummyInput("")
	    .appendTitle('when i start');
	this.appendStatementInput('DO')
            .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setPreviousStatement(false);
	this.setNextStatement(false);
    }
};

Blockly.Language.events_run_continuously = {
    // Repeat continuously
    helpUrl: '',
    init: function() {
	this.setColour(100);
	this.appendDummyInput("")
	    .appendTitle('run continuously');
	this.appendStatementInput('DO')
            .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setPreviousStatement(false);
	this.setNextStatement(false);
    }
};


Blockly.Language.events_while_touch= {
    helpUrl: '',
    init: function() {
	this.setColour(100);
	this.appendDummyInput("")
            .appendTitle("while touch sensor on port")
            .appendTitle(new Blockly.FieldDropdown([["1", "1"], 
						    ["2", "2"],
						    ["3","3"],
						    ["4","4"]]), 'p_num');
	this.appendDummyInput("")
            .appendTitle("is")
            .appendTitle(new Blockly.FieldDropdown([["pressed", "1"], 
						    ["not pressed", "0"]]), 
			 'touch_val');
	this.appendStatementInput('DO')
	    .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setInputsInline(true);
	this.setPreviousStatement(false);
        this.setNextStatement(false);
    }
};


Blockly.Language.events_when_touch= {
    category: 'Events',
    helpUrl: '',
    init: function() {
	this.setColour(30);
	this.appendDummyInput("")
            .appendTitle("when touch sensor on port")
            .appendTitle(new Blockly.FieldDropdown([["1", "1"],
						    ["2", "2"],
						    ["3","3"],
						    ["4","4"]]), 'p_num');
	this.appendDummyInput("")
            .appendTitle("is")
            .appendTitle(new Blockly.FieldDropdown([["pressed", "1"],
						    ["released", "0"]]),
			 'touch_val');
	this.appendStatementInput('DO')
	    .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setInputsInline(true);
	this.setPreviousStatement(false);
        this.setNextStatement(false);
    }
};


Blockly.Language.events_while_sensor_value= {
    category: 'Events',
    helpUrl: '',
    init: function() {
	this.setColour(100);
	this.appendDummyInput("")
            .appendTitle("while")
            .appendTitle(new Blockly.FieldDropdown([["sensor 1","1"],
						    ["sensor 2","2"],
						    ["sensor 3","3"],
						    ["sensor 4","4"],
						    ["encoder 1","5"],
						    ["encoder 2","6"],
						    ["encoder 3","7"],
						    ["encoder 4","8"]]),
			 's_num');
	this.appendDummyInput("")
            .appendTitle("value is")
            .appendTitle(new Blockly.FieldDropdown([['=', "=="],
						    ['\u2260', "!="],
						    ['<', "<"],
						    ['\u2264', "<="],
						    ['>', ">"],
						    ['\u2265', ">="]]),'op');
	this.appendValueInput('comp')
            .setCheck('Number');
	this.appendStatementInput('DO')
	    .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setInputsInline(true);
	this.setPreviousStatement(false);
        this.setNextStatement(false);
    }
};

Blockly.Language.events_when_sensor_value= {
    category: 'Events',
    helpUrl: '',
    init: function() {
	this.setColour(30);
	this.appendDummyInput("")
            .appendTitle("when")
            .appendTitle(new Blockly.FieldDropdown([["sensor 1", "1"],
						    ["sensor 2", "2"],
						    ["sensor 3","3"],
						    ["sensor 4","4"],
						    ["encoder 1", "5"],
						    ["encoder 2", "6"],
						    ["encoder 3", "7"],
						    ["encoder 4", "8"]]),
			 's_num');
	this.appendDummyInput("")
            .appendTitle("value is")
            .appendTitle(new Blockly.FieldDropdown([['=', "=="],
						    ['\u2260', "!="],
						    ['<', "<"],
						    ['\u2264', "<="],
						    ['>', ">"],
						    ['\u2265', ">="]]),'op');
	this.appendValueInput('comp')
            .setCheck('Number');
	this.appendStatementInput('DO')
	    .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setInputsInline(true);
	this.setPreviousStatement(false);
        this.setNextStatement(false);
    }
};


Blockly.Language.events_while_sensor_range= {
    category: 'Events',
    helpUrl: '',
    init: function() {
	this.setColour(100);
	this.appendDummyInput("")
            .appendTitle("while")
            .appendTitle(new Blockly.FieldDropdown([["sensor 1", "1"],
						    ["sensor 2", "2"],
						    ["sensor 3","3"],
						    ["sensor 4","4"],
						    ["encoder 1", "5"],
						    ["encoder 2", "6"],
						    ["encoder 3", "7"],
						    ["encoder 4", "8"]]),
			 's_num');
	this.appendDummyInput("")
            .appendTitle("is in range")
     	this.appendValueInput('lo')
            .setCheck('Number');
	this.appendDummyInput("")
	    .appendTitle("to");
	this.appendValueInput('hi')
	    .setCheck('Number');
	this.appendStatementInput('DO')
	    .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setInputsInline(true);
	this.setPreviousStatement(false);
        this.setNextStatement(false);
    }
};


Blockly.Language.events_when_sensor_range= {
    category: 'Events',
    helpUrl: '',
    init: function() {
	this.setColour(30);
	this.appendDummyInput("")
            .appendTitle("when")
            .appendTitle(new Blockly.FieldDropdown([["sensor 1", "1"],
						    ["sensor 2", "2"],
						    ["sensor 3","3"],
						    ["sensor 4","4"],
						    ["encoder 1", "5"],
						    ["encoder 2", "6"],
						    ["encoder 3", "7"],
						    ["encoder 4", "8"]]),
			 's_num');
	this.appendDummyInput("")
            .appendTitle("is in range")
     	this.appendValueInput('lo')
            .setCheck('Number');
	this.appendDummyInput("")
	    .appendTitle("to");
	this.appendValueInput('hi')
	    .setCheck('Number');
	this.appendStatementInput('DO')
	    .appendTitle(Blockly.LANG_CONTROLS_WHILEUNTIL_INPUT_DO);
	this.setInputsInline(true);
	this.setPreviousStatement(false);
        this.setNextStatement(false);
    }
};


//DEFINE GENERATORS:

Blockly.Python= Blockly.Generator.get('Python');

Blockly.Python.motor_set = function() {
    //var value_motor_number = Blockly.Python.valueToCode(this, 'motor_num', Blockly.Python.ORDER_ATOMIC);
    var value_motor_power = Blockly.Python.valueToCode(this, 'motor_power', Blockly.Python.ORDER_NONE);
    var code;
    var value_motor_number= this.getTitleValue('motor_num');
    //var value_motor_power = parseInt(this.getTitleValue('motor_power'));
    if(value_motor_number=="All") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor1=' +value_motor_power+ ', motor2=' + value_motor_power + ', motor3=' + value_motor_power + ', motor4=' + value_motor_power + '))'+'\n'
    }
    else if(value_motor_number=="1") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor1=' +value_motor_power+ '))'+'\n'
    }
    else if(value_motor_number=="2") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor2=' +value_motor_power+ '))'+'\n'
    }
    else if(value_motor_number=="3") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor3=' +value_motor_power+ '))'+'\n'
    }
    else if(value_motor_number=="4") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor4=' +value_motor_power+ '))'+'\n'
    }
    code = code + 'toSend = Message.encode(toSend)' + '\n'
    code= code + 'self.hwcmd_channel.basic_publish(exchange="HwCmd", routing_key="", body=toSend)'+'\n';
    return code;
};

Blockly.Python.light_set = function() {
    //var value_motor_number = Blockly.Python.valueToCode(this, 'motor_num', Blockly.Python.ORDER_ATOMIC);
    var value_motor_power = Blockly.Python.valueToCode(this, 'motor_power', Blockly.Python.ORDER_NONE);
    var code;
    var value_motor_number= this.getTitleValue('motor_num');
    //var value_motor_power = parseInt(this.getTitleValue('motor_power'));
    if(value_motor_number=="All") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor1=' +value_motor_power+ ', motor2=' + value_motor_power + ', motor3=' + value_motor_power + '))'+'\n'
    }
    else if(value_motor_number=="1") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor1=' +value_motor_power+ '))'+'\n'
    }
    else if(value_motor_number=="2") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor2=' +value_motor_power+ '))'+'\n'
    }
    else if(value_motor_number=="3") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor3=' +value_motor_power+ '))'+'\n'
    }
    else if(value_motor_number=="4") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor4=' +value_motor_power+ '))'+'\n'
    }
    code = code + 'toSend = Message.encode(toSend)' + '\n'
    code= code + 'self.hwcmd_channel.basic_publish(exchange="HwCmd", routing_key="", body=toSend)'+'\n'+'time.sleep(.01)'+'\n'
    return code;
};

Blockly.Python.pin_in = function() {
    var value_pin_value = Blockly.Python.valueToCode(this, 'gpio_in_value', Blockly.Python.ORDER_NONE);
    var pin_value;
    
    pin_value= this.getTitleValue('gpio_in_value');

    var code;
    var value_pin_number= this.getTitleValue('gpio_in_pin');
    if(value_pin_number=="12") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin12=' +pin_value+ '))'+'\n'
    }
    else if(value_pin_number=="16") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin16=' +pin_value+ '))'+'\n'
    }
    else if(value_pin_number=="18") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin18=' +pin_value+ '))'+'\n'
    }
    else if(value_pin_number=="22") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin22=' +pin_value+ '))'+'\n'
    }
    code = code + 'toSend = Message.encode(toSend)' + '\n'
    code= code + 'self.hwcmd_channel.basic_publish(exchange="HwCmd", routing_key="", body=toSend)'+'\n';
    return code;
};

Blockly.Python.pin_out = function() {
    var value_pin_value = Blockly.Python.valueToCode(this, 'gpio_out_value', Blockly.Python.ORDER_NONE);
    var pin_value;
    
    pin_value= this.getTitleValue('gpio_out_value');

    var code;
    var value_pin_number= this.getTitleValue('gpio_out_pin');    
    if(value_pin_number=="7") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin7=' +pin_value+ '))'+'\n'
    }
    else if(value_pin_number=="11") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin11=' +pin_value+ '))'+'\n'
    }
    else if(value_pin_number=="13") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin13=' +pin_value+ '))'+'\n'
    }
    else if(value_pin_number=="15") {
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin15=' +pin_value+ '))'+'\n'
    }
    code = code + 'toSend = Message.encode(toSend)' + '\n'
    code= code + 'self.hwcmd_channel.basic_publish(exchange="HwCmd", routing_key="", body=toSend)'+'\n';
    return code;
};

Blockly.Python.motor_all_stop= function() {
    var code= 'toSend= Message(self.hostname, None, "HwCmd", Message.createImage(motor1=0, motor2=0, motor3=0, motor4=0))'+
    '\n' + 'toSend = Message.encode(toSend)' + '\n' 
	+ 'self.hwcmd_channel.basic_publish(exchange="HwCmd", routing_key="", body=toSend)'+'\n';
    return code;
};

Blockly.Python.motor_get_encoder= function() {
    var value_encoder= this.getTitleValue('enc');
    value_encoder-=1;
    var code = 'self.robot["encoders"][' + value_encoder + ']';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.sensor_new_val= function() {
    var port= this.getTitleValue('port');
    var code= 'self.sensorStatus["'+port+'"]';
    return [code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Python.led_set= function() {
  var value_led1;
  var value_led2;
  if(this.getTitleValue('led1') =="On") {
    value_led1= 1;
  }
  else {
    value_led1= 0;
  }
   if(this.getTitleValue('led2') =="On") {
    value_led2= 1;
  }
  else {
    value_led2= 0;
  }
    code= 'toSend = Message(self.hostname, None, "HwCmd", Message.createImage(led1=' +value_led1+ ', led2=' +value_led2+ '))'+'\n'+'channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)'+'\n'+'time.sleep(.01)'+'\n';
  return code;
};

Blockly.Python.time_sleep= function() {
  var value_sleep = parseInt(this.getTitleValue('time_sleep'));
  value_sleep= value_sleep/1000;
  var code = 'time.sleep('+value_sleep+')'+'\n';
  return code;
};

Blockly.Python.print_print= function() {
   var value_print = Blockly.Python.valueToCode(this, 'to_print', Blockly.Python.ORDER_NONE);
  var code = 'print '+value_print+'\n';
  return code;
};


Blockly.Python.controls_inf_loop= function () {
    var branch = Blockly.Python.statementToCode(this, 'DO') || '  pass\n';
    var code= 'while True:'+'\n'+ branch;
    return code;
};

Blockly.Python.sensor_touch=function() {
    var b=this.getTitleValue("port");
    var a=this.getTitleValue("status");
    if (a == 1){
        return['self.robot["sensors"]['+(b-1)+'] == 1',Blockly.Python.ORDER_ATOMIC];}
    if (a == 0){
        return['self.robot["sensors"]['+(b-1)+'] == 0',Blockly.Python.ORDER_ATOMIC];}
};

Blockly.Python.sensor_light=function() {
    var b=this.getTitleValue("port");;

        return['self.robot["sensors"]['+(b-1)+']',Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.sensor_ultrasonic=function() {
    var b=this.getTitleValue("port");;

        return['self.robot["sensors"]['+(b-1)+']',Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.sensor_sound=function() {
    var b=this.getTitleValue("port");;

        return['self.robot["sensors"]['+(b-1)+']',Blockly.Python.ORDER_ATOMIC];
};


Blockly.Python.events_on_start=function () {
    var branch = Blockly.Python.statementToCode(this, 'DO') || '  pass\n';
    var code= 'def run_on_start(self):'+'\n'+ branch;
    return code;
};

Blockly.Python.events_on_sensor_change=function () {
    var branch = Blockly.Python.statementToCode(this, 'DO') || '  pass\n';
    var code= 'def on_sensor_change(self):'+'\n'+ branch;
    return code;
};

Blockly.Python.events_run_continuously=function () {
    var branch = Blockly.Python.statementToCode(this, 'DO') || '  pass\n';
    var code= 'def run_continuously(self):'+'\n'+ branch;
    return code;
};

Blockly.Python.events_while_touch = function() {
    var branch2 = Blockly.Python.statementToCode(this, 'DO') || '  pass\n'; 
    branch2 = branch2.split("\n");
    var branch = "";
    for(var i = 0; i < branch2.length; i ++) {
	branch += "  " + branch2[i] + '\n';
    }
    var port= this.getTitleValue('p_num');    
    var value = this.getTitleValue('touch_val');
    var code = 'def '+'wlt'+port+ unique_id + '(self):'+'\n';
    if (value == 1) {
	code += '  if self.robot["sensors"]['+ (port-1) + '] == 1: \n'+ branch;
    } else if (value == 0) {
	code += '  if self.robot["sensors"]['+ (port-1) + '] == 0: \n'+ branch;
    }
    unique_id += 1;
    return code;
};


Blockly.Python.events_when_touch = function() {
    var branch2 = Blockly.Python.statementToCode(this, 'DO') || '  pass\n'; 
    branch2 = branch2.split("\n");
    var branch = "";
    for(var i = 0; i < branch2.length; i ++) {
	branch += "  " + branch2[i] + '\n';
    }
    var port= this.getTitleValue('p_num');    
    var value = this.getTitleValue('touch_val');
    var code = 'def '+'wnt'+port+unique_id+'(self):'+'\n';
    if (value == 1) {
	code += '  if self.robot["sensors"]['+ (port-1) + '] == 1 and self.last_robot["sensors"]['+(port-1)+'] == 0: \n'+ branch;
    } else if (value == 0) {
	code += '  if self.robot["sensors"]['+ (port-1) + '] == 0 and self.last_robot["sensors"]['+(port-1)+'] == 1: \n'+ branch;

    }
    unique_id += 1;
    return code;
};


Blockly.Python.events_while_sensor_value = function() {
    var branch2 = Blockly.Python.statementToCode(this, 'DO') || '  pass\n'; 
    branch2 = branch2.split("\n");
    var branch = "";
    for(var i = 0; i < branch2.length; i ++) {
	branch += "  " + branch2[i] + '\n';
    }
    var sensor= this.getTitleValue('s_num');    
    var op = this.getTitleValue('op');
    var comp = Blockly.Python.valueToCode(this, 'comp', Blockly.Python.ORDER_NONE);
    var code = 'def '+'wls'+sensor+unique_id+'(self):'+'\n';
    if (sensor >= 1 && sensor <= 4) {
	code += '  if self.robot["sensors"]['+(sensor-1)+'] '+op+' '+comp+': \n'; 
    } else if (sensor >= 5 && sensor <= 8) {
	code += '  if self.robot["encoders"]['+(sensor-5)+'] '+op+' '+comp+': \n';
  
    }

    unique_id += 1;
    return code + branch;
};



Blockly.Python.events_when_sensor_value = function() {
    var branch2 = Blockly.Python.statementToCode(this, 'DO') || '  pass\n'; 
    branch2 = branch2.split("\n");
    var branch = "";
    for(var i = 0; i < branch2.length; i ++) {
	branch += "  " + branch2[i] + '\n';
    }
    var sensor= this.getTitleValue('s_num');    
    var op = this.getTitleValue('op');
    var comp = Blockly.Python.valueToCode(this, 'comp', Blockly.Python.ORDER_NONE);
    var code = 'def '+'wns'+sensor+unique_id+'(self):'+'\n';
    if (sensor >= 1 && sensor <= 4) {
	code += '  if self.robot["sensors"]['+(sensor-1)+'] '+op+' '+comp; 
	code += ' and not self.last_robot["sensors"]['+(sensor-1)+'] '; 
	code += op+' '+comp+': \n' + branch;
    } else if (sensor >= 5 && sensor <= 8) {
	code += '  if self.robot["encoders"]['+(sensor-5)+'] '+op+' '+comp;  
	code += ' and not self.last_robot["encoders"]['+(sensor-5)+'] ';
	code += op+' '+comp+': \n'+ branch;
    }

    unique_id += 1;
    return code;
};


Blockly.Python.events_while_sensor_range = function() {
    var branch2 = Blockly.Python.statementToCode(this, 'DO') || '  pass\n'; 
    branch2 = branch2.split("\n");
    var branch = "";
    for(var i = 0; i < branch2.length; i ++) {
	branch += "  " + branch2[i] + '\n';
    }
    var sensor= this.getTitleValue('s_num');    
    var lo = Blockly.Python.valueToCode(this, 'lo', Blockly.Python.ORDER_NONE);
    var hi = Blockly.Python.valueToCode(this, 'hi', Blockly.Python.ORDER_NONE);
    var code = 'def '+'wlr'+sensor+unique_id+'(self):'+'\n';
    if (sensor >= 1 && sensor <= 4) {
	code += '  if self.robot["sensors"]['+(sensor-1)+'] in range(int('; 
	code += lo+'),int('+hi+')): \n' + branch;
    } else if (sensor >= 5 && sensor <= 8) {
	code += '  if self.robot["encoders"]['+(sensor-5)+'] in range(int('; 
	code += lo+'),int('+hi+')): \n' + branch;
    }

    unique_id += 1;
    return code;
};

Blockly.Python.events_when_sensor_range = function() {
    var branch2 = Blockly.Python.statementToCode(this, 'DO') || '  pass\n'; 
    branch2 = branch2.split("\n");
    var branch = "";
    for(var i = 0; i < branch2.length; i ++) {
	branch += "  " + branch2[i] + '\n';
    }
    var sensor= this.getTitleValue('s_num');    
    var lo = Blockly.Python.valueToCode(this, 'lo', Blockly.Python.ORDER_NONE);
    var hi = Blockly.Python.valueToCode(this, 'hi', Blockly.Python.ORDER_NONE);
    var code = 'def '+'wnr'+sensor+unique_id+'(self):'+'\n';
    if (sensor >= 1 && sensor <= 4) {
	code += '  if self.robot["sensors"]['+(sensor-1)+'] in range(int('; 
	code += lo+'),int('+hi+')) and self.last_robot["sensors"]['+(sensor-1);
	code += '] not in range(int('+lo+'),int('+hi+')): \n' + branch;
    } else if (sensor >= 5 && sensor <= 8) {
	code += '  if self.robot["encoders"]['+(sensor-5)+'] in range(int('; 
	code += lo+'),int('+hi+')) and self.last_robot["encoders"]['+(sensor-5);
	code += '] not in range(int('+lo+'),int('+hi+')): \n' + branch;
    }

    unique_id += 1;
    return code;
};

