/* =========================================
FILE: frontend/js/number-system.js
========================================= */


/* =========================================
TAB SWITCHING
========================================= */

/* =========================================
TAB SWITCHING
========================================= */

const tabButtons = document.querySelectorAll('.ns-tab');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {

  btn.addEventListener('click', () => {

    // Remove active state
    tabButtons.forEach(b => {
      b.classList.remove('active');
    });

    // Hide all tabs
    tabContents.forEach(content => {
      content.classList.add('hidden');
    });

    // Activate clicked tab
    btn.classList.add('active');

    // Show target tab
    const target =
      document.getElementById(btn.dataset.tab);

    if(target){
      target.classList.remove('hidden');
    }

  });

});

/* =========================================
NUMBER CONVERSION
========================================= */

/* =========================================
VALIDATE NUMBER FOR BASE
========================================= */

function isValidForBase(value, base){

  const patterns = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9A-Fa-f]+$/
  };

  return patterns[base].test(value);

}


function convertNumber(){

  const input = document.getElementById('convertInput').value.trim();
  const fromBase = parseInt(document.getElementById('fromBase').value);
  const toBase = parseInt(document.getElementById('toBase').value);

  const resultDiv = document.getElementById('convertResult');
  const stepsDiv = document.getElementById('convertSteps');

  try{

   /* Validate input properly */

if(!isValidForBase(input, fromBase)){
  throw new Error("Invalid number for selected base");
}

const decimal = parseInt(input, fromBase);

    let result = decimal.toString(toBase).toUpperCase();

    resultDiv.innerHTML = `✅ Result: ${result}`;

    let explanation = `
STEP 1:
Convert ${input} from base ${fromBase} to Decimal

Decimal Value = ${decimal}

STEP 2:
Convert Decimal (${decimal}) to Base ${toBase}

Final Answer = ${result}
`;

    if(toBase === 2){

      explanation += `

Binary Grouping:
${groupBinary(result)}
`;

    }

    stepsDiv.innerHTML = explanation;

  }

  catch(err){

    resultDiv.innerHTML = "❌ Invalid Input";
    stepsDiv.innerHTML = "";

  }

}


/* =========================================
GROUP BINARY
========================================= */

function groupBinary(binary){

  let grouped4 = binary.match(/.{1,4}/g)?.join(' ') || binary;
  let grouped3 = binary.match(/.{1,3}/g)?.join(' ') || binary;

  return `
Grouped into 4 bits (Hex):
${grouped4}

Grouped into 3 bits (Octal):
${grouped3}
`;

}


/* =========================================
ARITHMETIC
========================================= */

function calculateArithmetic(){

  const num1 = document.getElementById('num1').value.trim();
  const num2 = document.getElementById('num2').value.trim();

  const base = parseInt(document.getElementById('arithBase').value);
  const operation = document.getElementById('operation').value;

  const resultDiv = document.getElementById('arithResult');
  const stepsDiv = document.getElementById('arithSteps');

  try{

    if(
  !isValidForBase(num1, base) ||
  !isValidForBase(num2, base)
){
  throw new Error("Invalid number for selected base");
}

const dec1 = parseInt(num1, base);
const dec2 = parseInt(num2, base);

    if(isNaN(dec1) || isNaN(dec2)){
      throw new Error("Invalid");
    }

    let answer;

    switch(operation){

      case '+':
        answer = dec1 + dec2;
        break;

      case '-':
        answer = dec1 - dec2;
        break;

      case '*':
        answer = dec1 * dec2;
        break;

      case '/':
        answer = Math.floor(dec1 / dec2);
        break;

    }

    let finalAnswer = answer.toString(base).toUpperCase();

    resultDiv.innerHTML = `✅ Result: ${finalAnswer}`;

    stepsDiv.innerHTML = `
Number 1 = ${num1} (Base ${base})
= ${dec1} in Decimal

Number 2 = ${num2} (Base ${base})
= ${dec2} in Decimal

Operation:
${dec1} ${operation} ${dec2}

Decimal Result:
${answer}

Converted back to Base ${base}:
${finalAnswer}
`;

  }

  catch(err){

    resultDiv.innerHTML = "❌ Invalid Input";
    stepsDiv.innerHTML = "";

  }

}


/* =========================================
COMPLEMENTS
========================================= */

function findComplements(){

  const input = document.getElementById('compInput').value.trim();

  const resultDiv = document.getElementById('compResult');
  const stepsDiv = document.getElementById('compSteps');

  try{

    if(!/^[01]+$/.test(input)){
      throw new Error("Binary only");
    }

    let ones = '';

    for(let bit of input){

      ones += bit === '0' ? '1' : '0';

    }

    let twosDecimal = parseInt(ones, 2) + 1;

    let twos = twosDecimal
      .toString(2)
      .padStart(input.length, '0');

    resultDiv.innerHTML = `✅ Complement Generated`;

    stepsDiv.innerHTML = `
Original Binary:
${input}

--------------------------------

1's Complement:
Invert all bits

${ones}

--------------------------------

2's Complement:
Add 1 to 1's complement

${ones}
+ 1
----------------
${twos}
`;

  }

  catch(err){

    resultDiv.innerHTML = "❌ Invalid Binary Input";
    stepsDiv.innerHTML = "";

  }

}

















/* =========================================
SIGNED NUMBER REPRESENTATION
========================================= */

function generateSignedBinary(){

  const num =
    parseInt(
      document.getElementById('signedInput').value
    );

  const bits =
    parseInt(
      document.getElementById('signedBits').value
    );

  const result =
    document.getElementById('signedResult');

  const steps =
    document.getElementById('signedSteps');

  if(isNaN(num)){
    result.innerHTML = "❌ Invalid";
    return;
  }

  let magnitude =
  Math.abs(num)
  .toString(2)
  .padStart(bits - 1, '0');

let binary =
  (num < 0 ? '1' : '0') + magnitude;

  let ones =
    binary.replace(/0/g,'x')
          .replace(/1/g,'0')
          .replace(/x/g,'1');

  let twos =
    (parseInt(ones,2)+1)
    .toString(2)
    .padStart(bits,'0');

  result.innerHTML =
    `✅ ${num} Representation`;

  steps.innerHTML = `
Signed Magnitude:
${binary}

1's Complement:
${ones}

2's Complement:
${twos}
`;

}

/* =========================================
SHIFT OPERATIONS
========================================= */

function performShift(){

  const input =
    document.getElementById('shiftInput')
    .value.trim();

  const type =
    document.getElementById('shiftType')
    .value;

  const count =
    parseInt(
      document.getElementById('shiftCount')
      .value
    );

  const result =
    document.getElementById('shiftResult');

  const steps =
    document.getElementById('shiftSteps');

  if(!/^[01]+$/.test(input)){

    result.innerHTML =
      "❌ Invalid Binary";

    return;
  }

  const decimal =
    parseInt(input, 2);

  let shiftedDecimal;

  if(type === 'left'){

    shiftedDecimal =
      decimal << count;

  }
  else{

    shiftedDecimal =
      decimal >> count;

  }

  const shiftedBinary =
    shiftedDecimal.toString(2);

  result.innerHTML =
    `✅ Shifted Result: ${shiftedBinary}`;

  steps.innerHTML = `
Original Binary:
${input}

Decimal Value:
${decimal}

Shift Type:
${type}

Shift Count:
${count}

Operation:

${decimal}
${type === 'left' ? '<<' : '>>'}
${count}

Shifted Decimal:
${shiftedDecimal}

Final Binary:
${shiftedBinary}
`;

}

/* =========================================
BITWISE OPERATIONS
========================================= */

function performBitwise(){

  const a =
    document.getElementById('bit1')
    .value.trim();

  const b =
    document.getElementById('bit2')
    .value.trim();

  const op =
    document.getElementById('bitOp')
    .value;

  const result =
    document.getElementById('bitResult');

  const steps =
    document.getElementById('bitSteps');

  if(
    !/^[01]+$/.test(a) ||
    !/^[01]+$/.test(b)
  ){
    result.innerHTML = "❌ Invalid Binary";
    return;
  }

  let x = parseInt(a,2);
  let y = parseInt(b,2);

  let ans;

  switch(op){

    case 'AND':
      ans = x & y;
      break;

    case 'OR':
      ans = x | y;
      break;

    case 'XOR':
      ans = x ^ y;
      break;

  }

  let finalAns =
    ans.toString(2);

  result.innerHTML =
    `✅ Result: ${finalAns}`;

  steps.innerHTML = `
${a}
${op}
${b}

Result:
${finalAns}
`;

}

/* =========================================
IEEE754
========================================= */

function convertIEEE754(){

  const num =
    parseFloat(
      document.getElementById('floatInput')
      .value
    );

  const result =
    document.getElementById('floatResult');

  const steps =
    document.getElementById('floatSteps');

  if(isNaN(num)){
    result.innerHTML = "❌ Invalid";
    return;
  }

  const buffer = new ArrayBuffer(4);

  const floatView =
    new Float32Array(buffer);

  const intView =
    new Uint32Array(buffer);

  floatView[0] = num;

  const binary =
    intView[0]
    .toString(2)
    .padStart(32,'0');

  result.innerHTML =
    `✅ IEEE754 Generated`;

  steps.innerHTML = `
Binary Representation:

${binary}

Sign Bit:
${binary[0]}

Exponent:
${binary.substring(1,9)}

Mantissa:
${binary.substring(9)}
`;

}

/* =========================================
ASCII HEX CONVERTER
========================================= */

function convertAsciiHex(){

  const text =
    document.getElementById('asciiInput')
    .value;

  const result =
    document.getElementById('asciiResult');

  const steps =
    document.getElementById('asciiSteps');

  if(!text){

    result.innerHTML =
      "❌ Enter Text";

    steps.innerHTML = "";

    return;
  }

  let hexOutput = '';
  let binaryOutput = '';
  let decimalOutput = '';

  for(let ch of text){

    const decimal =
      ch.charCodeAt(0);

    const hex =
      decimal
      .toString(16)
      .toUpperCase();

    const binary =
      decimal
      .toString(2)
      .padStart(8,'0');

    hexOutput += hex + ' ';
    binaryOutput += binary + ' ';
    decimalOutput += decimal + ' ';

  }

  result.innerHTML =
    `✅ Conversion Generated`;

  steps.innerHTML = `
Original Text:
${text}

--------------------------------

ASCII Decimal:
${decimalOutput}

--------------------------------

HEX:
${hexOutput}

--------------------------------

Binary:
${binaryOutput}
`;

}
