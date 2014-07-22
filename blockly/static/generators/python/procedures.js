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
 * @fileoverview Generating Python for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Python.procedures = {};

Blockly.Python.procedures_defreturn = function() {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is assigned.
  var globals = Blockly.Variables.allVariables(this);
  for (var i = globals.length - 1; i >= 0; i--) {
    var varName = globals[i];
    if (this.arguments_.indexOf(varName) == -1) {
      globals[i] = Blockly.Python.variableDB_.getName(varName,
          Blockly.Variables.NAME_TYPE);
    } else {
      // This variable is actually a parameter name.  Do not include it in
      // the list of globals, thus allowing it be of local scope.
      globals.splice(i, 1);
    }
  }
  globals = globals.length ? '  global ' + globals.join(', ') + '\n' : '';
  var funcName = '_'+Blockly.Python.variableDB_.getName(this.getTitleValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Python.statementToCode(this, 'STACK');
  if (Blockly.Python.INFINITE_LOOP_TRAP) {
    branch = Blockly.Python.INFINITE_LOOP_TRAP.replace(/%1/g,
        '"' + this.id + '"') + branch;
  }
  var returnValue = Blockly.Python.valueToCode(this, 'RETURN',
      Blockly.Python.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + '\n';
  } else if (!branch) {
    branch = '  pass';
  }
  var args = [];
  for (var x = 0; x < this.arguments_.length; x++) {
    args[x] = Blockly.Python.variableDB_.getName(this.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'def ' + funcName + '(self,' + args.join(', ') + '):\n' +
      globals + branch + returnValue;
  code = Blockly.Python.scrub_(this, code);
  Blockly.Python.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Python.procedures_defnoreturn =
    Blockly.Python.procedures_defreturn;

Blockly.Python.procedures_callreturn = function() {
  // Call a procedure with a return value.
  var funcName = '_'+Blockly.Python.variableDB_.getName(this.getTitleValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < this.arguments_.length; x++) {
    args[x] = Blockly.Python.valueToCode(this, 'ARG' + x,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  var code = 'self.' + funcName + '(' + args.join(', ') + ')';
  console.log(self);
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python.procedures_callnoreturn = function() {
  // Call a procedure with no return value.
  var funcName = '_'+Blockly.Python.variableDB_.getName(this.getTitleValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < this.arguments_.length; x++) {
    args[x] = Blockly.Python.valueToCode(this, 'ARG' + x,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  var code = 'self.' + funcName + '(' + args.join(', ') + ')\n';
  console.log(code);
  return code;
};

Blockly.Python.procedures_ifreturn = function() {
  // Conditionally return value from a procedure.
  var condition = Blockly.Python.valueToCode(this, 'CONDITION',
      Blockly.Python.ORDER_NONE) || 'False';
  var code = 'if ' + condition + ':\n';
  if (this.hasReturnValue_) {
    var value = Blockly.Python.valueToCode(this, 'VALUE',
        Blockly.Python.ORDER_NONE) || 'None';
    code += '  return ' + value + '\n';
  } else {
    code += '  return\n';
  }
  return code;
};
