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

    2: /^[01]+(\.[01]+)?$/,

    8: /^[0-7]+(\.[0-7]+)?$/,

    10: /^[0-9]+(\.[0-9]+)?$/,

    16: /^[0-9A-Fa-f]+(\.[0-9A-Fa-f]+)?$/

  };

  return patterns[base].test(value);

}


function convertNumber(){

  const input =
    document.getElementById('convertInput')
    .value.trim();

  const fromBase =
    parseInt(
      document.getElementById('fromBase').value
    );

  const toBase =
    parseInt(
      document.getElementById('toBase').value
    );

  const resultDiv =
    document.getElementById('convertResult');

  const stepsDiv =
    document.getElementById('convertSteps');

  try{

    if(!isValidForBase(input, fromBase)){

      throw new Error(
        "Invalid number for selected base"
      );

    }

    const decimal =
      convertToDecimal(input, fromBase);

    const result =
      convertFromDecimal(decimal, toBase);

    resultDiv.innerHTML =
      `✅ Result: ${result}`;

    stepsDiv.innerHTML = `
STEP 1:
Convert ${input} from Base ${fromBase}
to Decimal

Decimal Value:
${decimal}

--------------------------------

STEP 2:
Convert Decimal (${decimal})
to Base ${toBase}

Final Answer:
${result}
`;

  }

  catch(err){

    resultDiv.innerHTML =
      "❌ Invalid Input";

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
CONVERT ANY BASE → DECIMAL
========================================= */

function convertToDecimal(value, base){

  const chars =
    '0123456789ABCDEF';

  value = value.toUpperCase();

  const parts =
    value.split('.');

  const intPart =
    parts[0];

  const fracPart =
    parts[1] || '';

  let decimal = 0;

  // Integer Part
  for(let i=0;i<intPart.length;i++){

    const digit =
      chars.indexOf(intPart[i]);

    decimal =
      decimal * base + digit;

  }

  // Fractional Part
  for(let i=0;i<fracPart.length;i++){

    const digit =
      chars.indexOf(fracPart[i]);

    decimal +=
      digit /
      Math.pow(base, i+1);

  }

  return decimal;

}


/* =========================================
CONVERT DECIMAL → ANY BASE
========================================= */

function convertFromDecimal(decimal, base){

  const chars =
    '0123456789ABCDEF';

  const integerPart =
    Math.floor(decimal);

  let fractionPart =
    decimal - integerPart;

  fractionPart =
  Number(fractionPart.toFixed(12));

  let intResult =
    integerPart.toString(base)
    .toUpperCase();

  // No fraction
  if(fractionPart === 0){

    return intResult;

  }

  let fracResult = '';

  let limit = 10;

  while(
    fractionPart > 0 &&
    limit > 0
  ){

    fractionPart *= base;

    const digit =
      Math.floor(fractionPart);

    fracResult += chars[digit];

    fractionPart -= digit;

    limit--;

  }

  return intResult + '.' + fracResult;

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

const dec1 =
  convertToDecimal(num1, base);

const dec2 =
  convertToDecimal(num2, base);

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
        answer = dec1 / dec2;
        break;

    }

   let finalAnswer =
  convertFromDecimal(answer, base);

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

  // Positive magnitude binary
  let positiveBinary =
    Math.abs(num)
    .toString(2)
    .padStart(bits,'0');

  // Signed magnitude
  let signedMagnitude =
    (num < 0 ? '1' : '0') +
    positiveBinary.substring(1);

  // 1's complement
  let ones = '';

  for(let bit of positiveBinary){

    ones += bit === '0'
      ? '1'
      : '0';
  }

  // 2's complement
  let twos =
    (parseInt(ones,2)+1)
    .toString(2)
    .padStart(bits,'0');

  result.innerHTML =
    `✅ ${num} Representation`;

  steps.innerHTML = `
Signed Magnitude:
${signedMagnitude}

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





/* =========================================
OVERFLOW DETECTION
========================================= */

function detectOverflow(){

  const a =
    document.getElementById('overflowNum1')
    .value.trim();

  const b =
    document.getElementById('overflowNum2')
    .value.trim();

  const bits =
    parseInt(
      document.getElementById('overflowBits')
      .value
    );

  const result =
    document.getElementById('overflowResult');

  const steps =
    document.getElementById('overflowSteps');

  if(
    !/^[01]+$/.test(a) ||
    !/^[01]+$/.test(b)
  ){

    result.innerHTML =
      "❌ Invalid Binary";

    return;
  }

  const decA =
    parseInt(a,2);

  const decB =
    parseInt(b,2);

  const sum =
    decA + decB;

  const max =
    Math.pow(2,bits)-1;

  const overflow =
    sum > max;

  const binarySum =
    sum.toString(2);

  const trimmed =
    binarySum.slice(-bits);

  result.innerHTML =
    overflow
      ? "⚠️ Overflow Detected"
      : "✅ No Overflow";

  steps.innerHTML = `
First Number:
${a}

Second Number:
${b}

--------------------------------

Decimal Calculation:

${decA} + ${decB} = ${sum}

--------------------------------

Binary Addition:

  ${a.padStart(bits,'0')}
+ ${b.padStart(bits,'0')}

= ${binarySum}

Stored ${bits}-bit Result:
${trimmed}

--------------------------------

Maximum ${bits}-bit Value:
${max}

Overflow:
${overflow ? 'YES' : 'NO'}
`;

}








/* =========================================
BINARY ADDITION VISUALIZER
========================================= */

function visualizeBinaryOperation(){

  let a =
    document.getElementById('visualNum1')
    .value.trim();

  let b =
    document.getElementById('visualNum2')
    .value.trim();

  const operation =
  document.getElementById(
    'visualOperation'
  ).value;

  

  const result =
    document.getElementById('visualResult');

  const steps =
    document.getElementById('visualSteps');

  if(
    !/^[01]+$/.test(a) ||
    !/^[01]+$/.test(b)
  ){

    result.innerHTML =
      "❌ Invalid Binary";

    return;
  }

  if(operation === 'multiply'){

  return visualizeBinaryMultiplication(a,b);

}

if(operation === 'sub1'){

  return visualizeOnesComplementSubtraction(a,b);

}

if(operation === 'sub2'){

  return visualizeTwosComplementSubtraction(a,b);

}

  
  const maxLen =
    Math.max(a.length, b.length);

  a = a.padStart(maxLen,'0');
  b = b.padStart(maxLen,'0');

  let carry = 0;

  let carryRow = '';
  let answer = '';

  for(let i=maxLen-1; i>=0; i--){

    const bitA = parseInt(a[i]);
    const bitB = parseInt(b[i]);

    const sum =
      bitA + bitB + carry;

    answer =
      (sum % 2) + answer;

    carryRow =
      carry + carryRow;

    carry =
      Math.floor(sum / 2);

  }

  if(carry){

    answer = carry + answer;
    carryRow = carry + carryRow;

  }
  else{
    carryRow = ' ' + carryRow;
  }

  result.innerHTML =
    `✅ Binary Addition Complete`;

  steps.innerHTML = `
Carry:
${carryRow}

  ${a}
+ ${b}
${'-'.repeat(maxLen + 2)}

 ${answer}

--------------------------------

Decimal Verification:

${parseInt(a,2)}
+
${parseInt(b,2)}

=

${parseInt(answer,2)}
`;

}


/* =========================================
BINARY MULTIPLICATION VISUALIZER
========================================= */

function visualizeBinaryMultiplication(a,b){

  const result =
    document.getElementById('visualResult');

  const steps =
    document.getElementById('visualSteps');

  const decA =
    parseInt(a,2);

  const decB =
    parseInt(b,2);

  const final =
    decA * decB;

  const binaryFinal =
    final.toString(2);

  let work = '';

  let shift = 0;

  for(let i=b.length-1; i>=0; i--){

    const bit = b[i];

    if(bit === '1'){

      const partial =
        a + '0'.repeat(shift);

      work +=
        partial + '\n';

    }
    else{

      work +=
        '0'.repeat(a.length + shift)
        + '\n';

    }

    shift++;

  }

  result.innerHTML =
    `✅ Binary Multiplication Complete`;

  steps.innerHTML = `
       ${a}
×      ${b}
----------------

${work}

----------------

Result:
${binaryFinal}

--------------------------------

Decimal Verification:

${decA}
×
${decB}

=

${final}
`;

}




/* =========================================
1's COMPLEMENT SUBTRACTION
========================================= */

function visualizeOnesComplementSubtraction(a,b){

  const result =
    document.getElementById('visualResult');

  const steps =
    document.getElementById('visualSteps');

  const bits =
    Math.max(a.length,b.length);

  a = a.padStart(bits,'0');
  b = b.padStart(bits,'0');

  let ones = '';

  for(let bit of b){

    ones += bit === '0'
      ? '1'
      : '0';

  }

  const sum =
    parseInt(a,2)
    +
    parseInt(ones,2);

  let binary =
    sum.toString(2);

  let carry = false;

  // End-around carry exists
  if(binary.length > bits){

    carry = true;

    binary =
      binary.slice(1);

    binary =
      (
        parseInt(binary,2) + 1
      )
      .toString(2)
      .padStart(bits,'0');

  }

  // No carry → negative answer
  else{

    let corrected = '';

    for(let bit of binary.padStart(bits,'0')){

      corrected +=
        bit === '0'
        ? '1'
        : '0';

    }

    binary = corrected;

  }

  result.innerHTML =
    `✅ 1's Complement Subtraction`;

  steps.innerHTML = `
Minuend:
${a}

Subtrahend:
${b}

--------------------------------

1's Complement of Subtrahend:
${ones}

--------------------------------

Binary Sum:
${sum.toString(2)}

--------------------------------

Carry Generated:
${carry ? 'YES' : 'NO'}

${
carry
? `
Positive Result:
${binary}
`
: `
Negative Result

1's Complement of Sum:
${binary}

Final Answer:
-${binary}
`
}
`;

}





/* =========================================
2's COMPLEMENT SUBTRACTION
========================================= */

function visualizeTwosComplementSubtraction(a,b){

  const result =
    document.getElementById('visualResult');

  const steps =
    document.getElementById('visualSteps');

  const bits =
    Math.max(a.length,b.length);

  a = a.padStart(bits,'0');
  b = b.padStart(bits,'0');

  let ones = '';

  for(let bit of b){

    ones += bit === '0'
      ? '1'
      : '0';

  }

  let twos =
    (
      parseInt(ones,2) + 1
    )
    .toString(2)
    .padStart(bits,'0');

  const sum =
    parseInt(a,2)
    +
    parseInt(twos,2);

  let binary =
    sum.toString(2);

  let carry = false;

  // Carry exists
  if(binary.length > bits){

    carry = true;

    binary =
      binary.slice(1);

  }

  // No carry → negative
  else{

    let inverted = '';

    for(let bit of binary.padStart(bits,'0')){

      inverted +=
        bit === '0'
        ? '1'
        : '0';

    }

    binary =
      (
        parseInt(inverted,2) + 1
      )
      .toString(2)
      .padStart(bits,'0');

  }

  result.innerHTML =
    `✅ 2's Complement Subtraction`;

  steps.innerHTML = `
Minuend:
${a}

Subtrahend:
${b}

--------------------------------

1's Complement:
${ones}

2's Complement:
${twos}

--------------------------------

Binary Sum:
${sum.toString(2)}

--------------------------------

Carry Generated:
${carry ? 'YES' : 'NO'}

${
carry
? `
Positive Result:
${binary}
`
: `
Negative Result

2's Complement of Sum:
${binary}

Final Answer:
-${binary}
`
}
`;

}




/* =========================================
DIGITAL CODES
========================================= */

function convertDigitalCodes(){

  const input =
    document.getElementById('digitalInput')
    .value.trim();

  const type =
    document.getElementById('digitalType')
    .value;

  const result =
    document.getElementById('digitalResult');

  const steps =
    document.getElementById('digitalSteps');

  let output = '';

  /* =====================================
  BINARY → GRAY
  ===================================== */

  if(type === 'binaryToGray'){

    if(!/^[01]+$/.test(input)){

      result.innerHTML =
        "❌ Invalid Binary";

      steps.innerHTML = "";

      return;
    }

    output += input[0];

    for(let i=1;i<input.length;i++){

      output +=
        input[i-1] === input[i]
        ? '0'
        : '1';

    }

    result.innerHTML =
      `✅ Gray Code: ${output}`;

    steps.innerHTML = `
Binary:
${input}

--------------------------------

Gray Code:
${output}
`;

  }

  /* =====================================
  GRAY → BINARY
  ===================================== */

  else if(type === 'grayToBinary'){

    if(!/^[01]+$/.test(input)){

      result.innerHTML =
        "❌ Invalid Gray Code";

      steps.innerHTML = "";

      return;
    }

    output += input[0];

    for(let i=1;i<input.length;i++){

      output +=
        output[i-1] === input[i]
        ? '0'
        : '1';

    }

    result.innerHTML =
      `✅ Binary Code: ${output}`;

    steps.innerHTML = `
Gray Code:
${input}

--------------------------------

Recovered Binary:
${output}
`;

  }

  /* =====================================
  DECIMAL → BCD
  ===================================== */

  else if(type === 'decimalToBCD'){

    if(!/^[0-9]+$/.test(input)){

      result.innerHTML =
        "❌ Decimal Only";

      steps.innerHTML = "";

      return;
    }

    let bcd = '';

    for(let digit of input){

      bcd +=
        parseInt(digit)
        .toString(2)
        .padStart(4,'0')
        + ' ';

    }

    result.innerHTML =
      `✅ BCD Generated`;

    steps.innerHTML = `
Decimal Number:
${input}

--------------------------------

BCD Representation:
${bcd}
`;

  }

  /* =====================================
  DECIMAL → EXCESS-3
  ===================================== */

  else if(type === 'decimalToExcess3'){

    if(!/^[0-9]+$/.test(input)){

      result.innerHTML =
        "❌ Decimal Only";

      steps.innerHTML = "";

      return;
    }

    let excess3 = '';

    for(let digit of input){

      const val =
        parseInt(digit) + 3;

      excess3 +=
        val.toString(2)
        .padStart(4,'0')
        + ' ';

    }

    result.innerHTML =
      `✅ Excess-3 Generated`;

    steps.innerHTML = `
Decimal Number:
${input}

--------------------------------

Excess-3 Representation:
${excess3}
`;

  }

}












/* =========================================
MINI CPU EMULATOR
========================================= */
/* =========================================
RESOLVE OPERAND
========================================= */

function resolveValue(value, REG){

  if(REG[value] !== undefined){

    return REG[value];

  }

  return parseInt(value);

}

function runCPUProgram(){

  const code =
    document.getElementById('cpuProgram')
    .value
    .trim();

  const resultDiv =
    document.getElementById('cpuResult');

  const stepsDiv =
    document.getElementById('cpuSteps');

  /* =====================================
  CPU STATE
  ===================================== */

  let REG = {

    AX: 0,
    BX: 0,
    CX: 0,
    DX: 0

  };

  let MEMORY = {};

  let FLAGS = {

    CF: 0,
    ZF: 0,
    OF: 0

  };

  let clockCycles = 0;

  let instructionQueue = [];

  let output = '';

  const lines =
    code
    .split('\n')
    .map(x => x.trim())
    .filter(Boolean);

  /* =====================================
  EXECUTION LOOP
  ===================================== */

  for(let line of lines){

    instructionQueue.push(line);

  }

  output += `
================================
PROGRAM LOADED
================================

Instruction Queue:
${instructionQueue.join('\n')}

================================

`;

  for(let pc=0; pc<instructionQueue.length; pc++){

    const line =
      instructionQueue[pc];

    output += `
--------------------------------
EXECUTING:
${line}
--------------------------------
`;

    const parts =
      line
      .replace(',', ' ')
      .split(/\s+/);

    const instruction =
      parts[0]?.toUpperCase();

    const op1 =
      parts[1]?.toUpperCase();


    
    const op2 =
      parts[2]?.toUpperCase();


        FLAGS.CF = 0;
FLAGS.ZF = 0;
FLAGS.OF = 0;

    /* =================================
    MOV
    ================================= */

    if(instruction === 'MOV'){

      // MEMORY WRITE
      if(op1.startsWith('[')){

        const addr =
          op1.replace('[','')
             .replace(']','');

        MEMORY[addr] =
         resolveValue(op2, REG)

      }

// MEMORY READ
else if(op2 && op2.startsWith('[')){

  const addr =
    op2.replace('[','')
       .replace(']','');

  REG[op1] =
    MEMORY[addr] || 0;

}
        
      // REGISTER WRITE
      else{

        REG[op1] =
          resolveValue(op2, REG)
      }

      clockCycles += 2;

    }

    /* =================================
    ADD
    ================================= */

    else if(instruction === 'ADD'){

      REG[op1] +=
        resolveValue(op2, REG)

      if(REG[op1] > 255){

        FLAGS.CF = 1;

        REG[op1] &= 255;

      }

      clockCycles += 1;

    }

    /* =================================
    SUB
    ================================= */

    else if(instruction === 'SUB'){

      REG[op1] -=
        resolveValue(op2, REG)

      if(REG[op1] < 0){

        FLAGS.OF = 1;

        REG[op1] =
          256 + REG[op1];

      }

      clockCycles += 1;

    }

    /* =================================
    INC
    ================================= */

    else if(instruction === 'INC'){

      REG[op1]++;

      REG[op1] &= 255;

      clockCycles += 1;

    }

    /* =================================
    DEC
    ================================= */

    else if(instruction === 'DEC'){

      REG[op1]--;

      if(REG[op1] < 0){

        REG[op1] = 255;

      }

      clockCycles += 1;

    }

    /* =================================
    AND
    ================================= */

    else if(instruction === 'AND'){

      REG[op1] &=
        resolveValue(op2, REG)

      clockCycles += 1;

    }

    /* =================================
    OR
    ================================= */

    else if(instruction === 'OR'){

      REG[op1] |=
        resolveValue(op2, REG)
      clockCycles += 1;

    }

    /* =================================
    XOR
    ================================= */

    else if(instruction === 'XOR'){

      REG[op1] ^=
        resolveValue(op2, REG)

      clockCycles += 1;

    }

    /* =================================
    SHL
    ================================= */

    else if(instruction === 'SHL'){

      FLAGS.CF =
        (REG[op1] & 128)
        ? 1
        : 0;

      REG[op1] =
        (REG[op1] << 1) & 255;

      clockCycles += 1;

    }


      /* =================================
ROL
================================= */

else if(instruction === 'ROL'){

  const msb =
    (REG[op1] & 128)
    ? 1
    : 0;

  REG[op1] =
    ((REG[op1] << 1) & 255)
    | msb;

  FLAGS.CF = msb;

  clockCycles += 1;

}

  /* =================================
ROR
================================= */

else if(instruction === 'ROR'){

  const lsb =
    (REG[op1] & 1);

  REG[op1] =
    (REG[op1] >> 1)
    | (lsb << 7);

  FLAGS.CF = lsb;

  clockCycles += 1;

}
    /* =================================
    SHR
    ================================= */

    else if(instruction === 'SHR'){

      FLAGS.CF =
        (REG[op1] & 1)
        ? 1
        : 0;

      REG[op1] >>= 1;

      clockCycles += 1;

    }

    /* =================================
    ZERO FLAG
    ================================= */

   if(
  REG[op1] !== undefined &&
  REG[op1] === 0
){
  FLAGS.ZF = 1;
}
    /* =================================
    REGISTER DUMP
    ================================= */

    output += `
REGISTERS

AX:
${REG.AX}
(${REG.AX.toString(2).padStart(8,'0')})

BX:
${REG.BX}
(${REG.BX.toString(2).padStart(8,'0')})

CX:
${REG.CX}
(${REG.CX.toString(2).padStart(8,'0')})

DX:
${REG.DX}
(${REG.DX.toString(2).padStart(8,'0')})

--------------------------------

FLAGS

CF:
${FLAGS.CF}

ZF:
${FLAGS.ZF}

OF:
${FLAGS.OF}

--------------------------------

CLOCK CYCLES:
${clockCycles}

`;

  }

  /* =====================================
  MEMORY DUMP
  ===================================== */

  output += `
================================
MEMORY DUMP
================================
`;

  for(let addr in MEMORY){

    output += `
[${addr}] = ${MEMORY[addr]}
`;

  }

  resultDiv.innerHTML =
    `✅ Program Executed`;

  stepsDiv.innerHTML =
    output;

}
