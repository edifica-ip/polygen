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
const mobileMenuBtn =
  document.getElementById(
    'mobileMenuBtn'
  );

const tabsMenu =
  document.querySelector(
    '.ns-tabs'
  );


tabButtons.forEach(btn => {

  btn.addEventListener('click', () => {

    if(window.innerWidth <= 900){

  tabsMenu.classList.remove(
    'show'
  );

}
    
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




function generateCrossGroupingSteps(
  value,
  fromBase,
  toBase
){

  let steps =
    'Steps of Calculation:\n\n';

  /* ================================
  STEP 1
  ================================ */

  steps +=
`STEP 1:
Convert to Binary\n\n`;

  const binarySteps =
    generateGroupingSteps(
      value,
      fromBase
    );

  steps +=
    binarySteps;

  /* ================================
  GET PURE BINARY
  ================================ */

  const decimal =
    convertToDecimal(
      value,
      fromBase
    );

  const binary =
    convertFromDecimal(
      decimal,
      2
    );

  /* ================================
  STEP 2
  ================================ */

  steps += `

================================

STEP 2:
Convert Binary to ${
  toBase === 16
    ? 'Hexadecimal'
    : 'Octal'
}

\n`;

  const regroupSteps =
    generateBinaryGroupingSteps(
      binary,
      toBase
    );

  steps +=
    regroupSteps;

  return steps;

}



function generateBinaryGroupingSteps(
  value,
  toBase
){

  const chars =
    '0123456789ABCDEF';

  let steps =
    'Steps of Calculation:\n\n';

  // Group size
  const groupSize =
    toBase === 16 ? 4 : 3;

  steps +=
    toBase === 16

    ? 'Binary to Hexadecimal (4 bit grouping)\n'

    : 'Binary to Octal (3 bit grouping)\n';

  // Split decimal part
  const parts =
    value.split('.');

  let intPart =
    parts[0];

  let fracPart =
    parts[1] || '';

  /* ================================
  INTEGER PART
  ================================ */

  // Pad left side
  while(
    intPart.length % groupSize !== 0
  ){

    intPart = '0' + intPart;

  }

  const intGroups =
    intPart.match(
      new RegExp(`.{1,${groupSize}}`,'g')
    );

  steps += `
Grouped Integer Part:

${intGroups.join(' ')}

\n`;

  let result = '';

  for(let grp of intGroups){

    const digit =
      parseInt(grp,2);

    steps +=
`${grp} → ${chars[digit]}\n`;

    result += chars[digit];

  }

  /* ================================
  FRACTIONAL PART
  ================================ */

  if(fracPart){

    while(
      fracPart.length % groupSize !== 0
    ){

      fracPart += '0';

    }

    const fracGroups =
      fracPart.match(
        new RegExp(`.{1,${groupSize}}`,'g')
      );

    steps += `--------------------------------
Grouped Fractional Part:

${fracGroups.join(' ')}

\n`;

    result += '.';

    for(let grp of fracGroups){

      const digit =
        parseInt(grp,2);

      steps +=
`${grp} → ${chars[digit]}\n`;

      result += chars[digit];

    }

  }

  /* ================================
  FINAL
  ================================ */

  steps += `
  --------------------------------
Answer: ${result}
`;

  return steps;

}


function generateGroupingSteps(value, fromBase){

  value =
    value.toUpperCase();

  let steps =
    'Steps of Calculation:\n\n';

  let result = '';

  // Group size
  const groupSize =
    fromBase === 16 ? 4 : 3;

  steps +=
    fromBase === 16

    ? 'Step: Integer Part (4-bit grouping) Right to Left (←)\n--------------------------------\n'

    : 'Step: Integer Part (3-bit grouping) Right to Left (←)\n--------------------------------\n';

  for(let ch of value){

    // Ignore decimal point
    if(ch === '.'){

      result += '.';

       steps +=
    fromBase === 16

    ? '\nStep: Fractional Part (4-bit grouping) Left to Right (→)\n--------------------------------\n'

    : '\nStep: Fractional Part (3-bit grouping) Left to Right (→)\n--------------------------------\n';

      continue;

    }

    const digit =
      parseInt(ch, fromBase);

    const binary =
      digit
      .toString(2)
      .padStart(groupSize,'0');

    steps +=
`${ch} → ${binary}\n`;

    result += binary;

  }

  steps += `
--------------------------------\nAnswer: ${result}\n--------------------------------`;

  return steps;

}



function generateAnyToDecimalSteps(value, base){

  const chars =
    '0123456789ABCDEF';

  value =
    value.toUpperCase();

  let steps =
    'Steps of Calculation:\n\n';

  const parts =
    value.split('.');

  const intPart =
    parts[0];

  const fracPart =
    parts[1] || '';

  let decimal = 0;

  let expansions = [];

  let calculations = [];

  /* ================================
  INTEGER PART
  ================================ */

  steps +=
`Step: Integer Part\n--------------------------------\n`;

  for(
    let i = 0;
    i < intPart.length;
    i++
  ){

    const digit =
      chars.indexOf(intPart[i]);

    const power =
      intPart.length - 1 - i;

    const calc =
      digit * Math.pow(base, power);

    expansions.push(
      `${digit} × ${base}^${power}`
    );

    calculations.push(calc);

    steps +=
`${digit} × ${base}^${power} = ${calc}\n`;

    decimal += calc;

  }

  /* ================================
  FRACTIONAL PART
  ================================ */

  if(fracPart){

    steps += `\nStep: Fractional Part\n--------------------------------\n`;

    for(
      let i = 0;
      i < fracPart.length;
      i++
    ){

      const digit =
        chars.indexOf(fracPart[i]);

      const power =
        -(i + 1);

      const calc =
        digit * Math.pow(base, power);

      expansions.push(
        `${digit} × ${base}^(${power})`
      );

      calculations.push(calc);

      steps +=
`${digit} × ${base}^(${power}) = ${calc}\n`;

      decimal += calc;

    }

  }

  /* ================================
  FINAL
  ================================ */

  steps += `\nStep: Expanded Form (Optional)\n--------------------------------\n${expansions.join('\n+ ')}

Step: Finding Sum\n--------------------------------\n${calculations.join(' + ')}

--------------------------------
Answer: ${decimal}\n-------------------------------- `;

  return steps;

}


function generateDecimalToAnySteps(num, base){

  const chars =
    '0123456789ABCDEF';

  let number =
    parseFloat(num);

  if(isNaN(number)){

    return 'Invalid Number';

  }

  let steps =
    'Steps of Calculation:\n\n';

  // Split parts
  let integerPart =
    Math.floor(number);

  let fractionPart =
    number - integerPart;

  let remainders = [];

  /* ================================
  INTEGER PART
  ================================ */

  steps +=
`Step: Integer Part\n--------------------------------\n`;

  // Handle integer 0
  if(integerPart === 0){

    remainders.push('0');

    steps +=
`0 ÷ ${base} = 0

`;

  }

  while(integerPart > 0){

    const quotient =
      Math.floor(
        integerPart / base
      );

    const remainder =
      integerPart % base;

    const left =

      `${integerPart}` + ` ÷ ${base} = `
      + `${quotient}`.padEnd(6,' ');

    const right =

      `\nRemainder = ${chars[remainder]}`;

    steps += left + right + '\n';

    remainders.unshift(
      chars[remainder]
    );

    integerPart = quotient;

  }

  /* ================================
  FRACTIONAL PART
  ================================ */

  let fractionalDigits = [];

  if(fractionPart > 0){

    steps += `\nStep: Fractional Part\n--------------------------------\n`;

    let limit = 10;

    while(
      fractionPart > 0 &&
      limit > 0
    ){

      const product =
        fractionPart * base;

      const digit =
        Math.floor(product);

     const fracLeft =

  `${fractionPart.toFixed(10)} × ${base} = `
  + `${product.toFixed(10)}`
      .padEnd(15,' ');

const fracRight =

  `\nInteger = ${chars[digit]}`;

steps +=
  fracLeft + fracRight + '\n';

      fractionalDigits.push(
        chars[digit]
      );

      fractionPart =
  Number(
    (product - digit)
    .toFixed(12)
  );

      limit--;

    }

  }

  /* ================================
  FINAL ANSWER
  ================================ */

  const finalAnswer =

    fractionalDigits.length > 0

    ? `${remainders.join('')}.${fractionalDigits.join('')}`

    : remainders.join('');

  steps += `\nStep: Reading the Remainder(s)\n--------------------------------\nUpwards (↑): ${remainders.join('')}\n`
  
  if(fractionPart > 0)
  steps += `\nStep: Reading the Integer(s)\n--------------------------------\nDownwards (↓): ${fractionalDigits.join('')}\n`

  steps += `\n--------------------------------\nAnswer: ${finalAnswer}\n--------------------------------`;

  return steps;

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
    document.getElementById('globalResult');

  const stepsDiv =
    document.getElementById('globalSteps');

  resultDiv.innerHTML = "";
    stepsDiv.innerHTML = "";

  
    if(fromBase === toBase){
 
resultDiv.innerHTML =
    '⚠️ Same Base Selected';

  stepsDiv.innerHTML =
    'Choose different bases for conversion.';
  return;

}
  
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

    let detailedSteps = '';

    
if(
  fromBase === 10 ){

  detailedSteps =
    generateDecimalToAnySteps(
      input,toBase
    );

}
  else if(
  toBase === 10 ){

  detailedSteps =
    generateAnyToDecimalSteps(
      input,fromBase
    );

}
     else if(
  toBase === 2 && (fromBase===8 ||fromBase===16) ){

  detailedSteps =
    generateGroupingSteps(
      input,fromBase
    );

}
 else if(
  fromBase === 2 && (toBase===8 || toBase===16) ){

  detailedSteps =
    generateBinaryGroupingSteps(
      input,toBase
    );

}

   else if(

  (
    fromBase === 8 &&
    toBase === 16
  )

  ||

  (
    fromBase === 16 &&
    toBase === 8
  )

){

  detailedSteps =

    generateCrossGroupingSteps(
      input,
      fromBase,
      toBase
    );

}
else{

  detailedSteps = `
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

stepsDiv.innerHTML =
  detailedSteps;

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

  const resultDiv = document.getElementById('globalResult');
  const stepsDiv = document.getElementById('globalSteps');

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
        if(dec2 === 0){
  throw new Error(
    "Division By Zero"
  );
}
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

  const resultDiv = document.getElementById('globalResult');
  const stepsDiv = document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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
    document.getElementById('globalResult');

  const steps =
    document.getElementById('globalSteps');

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

  if(
  ['AX','BX','CX','DX']
  .includes(value)
){

    return REG[value];

  }

  const parsed =
    parseInt(value);

  if(isNaN(parsed)){

    throw new Error(
      `Invalid Operand: ${value}`
    );

  }

  return parsed;

}
/* =========================================
SIGNED 8-BIT CONVERSION
========================================= */

function toSigned8Bit(value){

  value &= 255;

  return value > 127
    ? value - 256
    : value;

}



/* =========================================
RESOLVE MEMORY ADDRESS
========================================= */

function resolveAddress(addr, REG){

  addr =
    addr.trim().toUpperCase();

  // REGISTER INDIRECT
  if(
  ['AX','BX','CX','DX']
  .includes(addr)
){

    return REG[addr] & 255;

  }

  // DIRECT ADDRESS
  const parsed =
    parseInt(addr);

  if(isNaN(parsed)){

    throw new Error(
      `Invalid Memory Address: ${addr}`
    );

  }

  return parsed & 255;

}




/* =========================================
VALIDATE REGISTER
========================================= */

function validateRegister(reg){

  const validRegisters = [

    'AX',
    'BX',
    'CX',
    'DX'

  ];

  if(!validRegisters.includes(reg)){

    throw new Error(
      `Invalid Register: ${reg}`
    );

  }

}

function runCPUProgram(){

  const code =
    document.getElementById('cpuProgram')
    .value
    .trim();

  const resultDiv =
    document.getElementById('globalResult');

  const stepsDiv =
    document.getElementById('globalSteps');

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
let STACK = [];

let SP = 255;

let PC = 0;
  let FLAGS = {

    CF: 0,
    ZF: 0,
    OF: 0

  };

  let clockCycles = 0;
let executionCount = 0;
  let instructionQueue = [];
let LABELS = {};
  let output = '';
let halted = false;
const STACK_LIMIT = 256;

  
  const lines =
    code
    .split('\n')
    .map(x => x.trim())
    .filter(Boolean);

  /* =====================================
  EXECUTION LOOP
  ===================================== */

 /* =====================================
LABEL PREPROCESSOR
===================================== */

for(let i=0; i<lines.length; i++){

  const rawLine =
  lines[i];

const line =
  rawLine
    .split(';')[0]
    .trim();

  if(!line){

  continue;

}

  // LABEL
 if(
  line.indexOf(':') !== -1
){

    const colonIndex =
  line.indexOf(':');

const label =
  line
    .substring(0, colonIndex)
    .trim()
    .toUpperCase();

LABELS[label] =
  instructionQueue.length;

const remaining =
  line
    .substring(colonIndex + 1)
    .trim();


if(remaining){

  instructionQueue.push(
    remaining
  );

}
  }
  // NORMAL INSTRUCTION
  else{

    instructionQueue.push(line);

  }

}

  output += `
================================
PROGRAM LOADED
================================

Instruction Queue:
${instructionQueue.join('\n')}

================================

`;

  try{


    
  for(
  PC = 0;
  PC < instructionQueue.length && !halted;
  PC++
){

    executionCount++;

if(executionCount > 1000){

  throw new Error(
    "Infinite Loop Detected"
  );

}
    const rawLine =
  instructionQueue[PC];

const line =
  rawLine
    .split(';')[0]
    .trim();

    if(!line){

  continue;

}

    output += `
--------------------------------
EXECUTING:
${line}
--------------------------------
`;

const parts =
  line
    .replace(/,/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

    const instruction =
      parts[0]?.toUpperCase();

    if(!instruction){

  continue;

}
    
    const op1 =
      parts[1]?.toUpperCase();


    
    const op2 =
      parts[2]?.toUpperCase();


        

    /* =================================
    MOV
    ================================= */

    if(instruction === 'MOV'){

      // MEMORY WRITE
      if(op1 && op1.startsWith('[')){

        const rawAddr =
  op1.replace('[','')
     .replace(']','');

const addr =
  resolveAddress(rawAddr, REG);

        if(op2 && op2.startsWith('[')){

  throw new Error(
    "Memory-to-Memory MOV Not Supported"
  );

}
        if(
  isNaN(parseInt(op2))
){

  validateRegister(op2);

}
       MEMORY[addr] =
  resolveValue(op2, REG) & 255;

      }

// MEMORY READ
// MEMORY READ
else if(
  op2 &&
  typeof op2 === 'string' &&
  op2.startsWith('[')
){

  validateRegister(op1);

  const rawAddr =
    op2.replace('[','')
       .replace(']','');

  const addr =
    resolveAddress(rawAddr, REG);

  REG[op1] =
    (MEMORY[addr] || 0) & 255;

}
        
      // REGISTER WRITE
      else{
validateRegister(op1);
        REG[op1] =
          resolveValue(op2, REG) & 255;
      }

      clockCycles += 2;

    }

    /* =================================
    ADD
    ================================= */

  else if(instruction === 'ADD'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;
validateRegister(op1);
  const val1 =
    REG[op1];

  const val2 =
    resolveValue(op2, REG) & 255;

  const signed1 =
    toSigned8Bit(val1);

  const signed2 =
    toSigned8Bit(val2);

  let result =
    val1 + val2;

  // Carry flag
  if(result > 255){

    FLAGS.CF = 1;

  }

  result &= 255;

  REG[op1] = result;

  const signedResult =
    toSigned8Bit(result);

  // Signed overflow detection
  if(

    (signed1 > 0 &&
     signed2 > 0 &&
     signedResult < 0)

    ||

    (signed1 < 0 &&
     signed2 < 0 &&
     signedResult > 0)

  ){

    FLAGS.OF = 1;

  }

  if(result === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += 1;

}


      /* =================================
MUL
================================= */

/* =================================
MUL
================================= */

else if(instruction === 'MUL'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;
validateRegister(op1);
  const val1 =
    REG[op1];

  const val2 =
    resolveValue(op2, REG) & 255;

  const signed1 =
    toSigned8Bit(val1);

  const signed2 =
    toSigned8Bit(val2);

  const fullResult =
    signed1 * signed2;

  // Signed overflow
  if(
    fullResult > 127 ||
    fullResult < -128
  ){

    FLAGS.OF = 1;
    FLAGS.CF = 1;

  }

  REG[op1] =
    fullResult & 255;

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += 2;

}


  /* =================================
DIV
================================= */

else if(instruction === 'DIV'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;

  const divisor =
    resolveValue(op2, REG);

  if(divisor === 0){

    throw new Error(
      "Division By Zero"
    );

  }
validateRegister(op1);
  REG[op1] =
    Math.trunc(
      toSigned8Bit(REG[op1]) /
toSigned8Bit(divisor)
    ) & 255;

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += 2;

}

    /* =================================
    SUB
    ================================= */

   else if(instruction === 'SUB'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;
validateRegister(op1);
  const val1 =
    REG[op1];

  const val2 =
    resolveValue(op2, REG) & 255;

  const signed1 =
    toSigned8Bit(val1);

  const signed2 =
    toSigned8Bit(val2);

  let result =
    val1 - val2;

  if(result < 0){

    FLAGS.CF = 1;

    result += 256;

  }

  result &= 255;

  REG[op1] = result;

  const signedResult =
    toSigned8Bit(result);

  // Signed overflow
  if(

    (signed1 > 0 &&
     signed2 < 0 &&
     signedResult < 0)

    ||

    (signed1 < 0 &&
     signed2 > 0 &&
     signedResult > 0)

  ){

    FLAGS.OF = 1;

  }

  if(result === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += 1;

}



      /* =================================
CMP
================================= */

else if(instruction === 'CMP'){

FLAGS.CF = 0;
FLAGS.ZF = 0;
FLAGS.OF = 0;
  validateRegister(op1);
  const val1 =
    REG[op1];

  const val2 =
    resolveValue(op2, REG);

  const temp =
    val1 - val2;

  // ZERO FLAG
  if(temp === 0){

    FLAGS.ZF = 1;

  }

  // CARRY FLAG
  if(temp < 0){

    FLAGS.CF = 1;

  }

  // OVERFLOW FLAG
  const signed1 =
  toSigned8Bit(val1);

const signed2 =
  toSigned8Bit(val2);

const signedTemp =
  toSigned8Bit(temp);

if(

  (signed1 > 0 &&
   signed2 < 0 &&
   signedTemp < 0)

  ||

  (signed1 < 0 &&
   signed2 > 0 &&
   signedTemp > 0)

){

  FLAGS.OF = 1;

}

  clockCycles += 1;

}


  /* =================================
JMP
================================= */

else if(instruction === 'JMP'){

  const label =
    op1;

  if(LABELS[label] !== undefined){

    PC = LABELS[label] - 1;

  }
  else{

  throw new Error(
    `Unknown Label: ${label}`
  );

}

  clockCycles += 1;

}

  /* =================================
JZ
================================= */

else if(instruction === 'JZ'){

  if(FLAGS.ZF === 1){

    const label = op1;

    if(LABELS[label] !== undefined){

      PC = LABELS[label] - 1;

    }
    else{

  throw new Error(
    `Unknown Label: ${label}`
  );

}

  }

  clockCycles += 1;

}


  /* =================================
JNZ
================================= */

else if(instruction === 'JNZ'){

  if(FLAGS.ZF === 0){

    const label = op1;

    if(LABELS[label] !== undefined){

      PC = LABELS[label] - 1;

    }
    else{

  throw new Error(
    `Unknown Label: ${label}`
  );

}

  }

  clockCycles += 1;

}


  /* =================================
JC
================================= */

else if(instruction === 'JC'){

  if(FLAGS.CF === 1){

    const label = op1;

    if(LABELS[label] !== undefined){

      PC = LABELS[label] - 1;

    }
    else{

  throw new Error(
    `Unknown Label: ${label}`
  );

}

  }

  clockCycles += 1;

}


  /* =================================
JO
================================= */

else if(instruction === 'JO'){

  if(FLAGS.OF === 1){

    const label = op1;

    if(LABELS[label] !== undefined){

      PC = LABELS[label] - 1;

    }
    else{

  throw new Error(
    `Unknown Label: ${label}`
  );

}

  }

  clockCycles += 1;

}


  
    /* =================================
    INC
    ================================= */

   else if(instruction === 'INC'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;
validateRegister(op1);
  const oldVal =
    REG[op1];

  REG[op1]++;

  REG[op1] &= 255;

  const oldSigned =
    toSigned8Bit(oldVal);

  const newSigned =
    toSigned8Bit(REG[op1]);

  if(
    oldSigned > 0 &&
    newSigned < 0
  ){
    FLAGS.OF = 1;
  }

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += 1;

}

    /* =================================
    DEC
    ================================= */

   else if(instruction === 'DEC'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;
validateRegister(op1);
  const oldVal =
    REG[op1];

  REG[op1]--;

  if(REG[op1] < 0){

    REG[op1] = 255;

  }

  const oldSigned =
    toSigned8Bit(oldVal);

  const newSigned =
    toSigned8Bit(REG[op1]);

  if(
    oldSigned < 0 &&
    newSigned > 0
  ){
    FLAGS.OF = 1;
  }

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += 1;

}



/* =================================
PUSH
================================= */

else if(instruction === 'PUSH'){

  if(isNaN(parseInt(op1))){

  validateRegister(op1);

}

const value =
  resolveValue(op1, REG);

  if(STACK.length >= STACK_LIMIT){

  throw new Error(
    "Stack Overflow"
  );

}
  STACK.push({

  type: 'DATA',

  value: value & 255

});

  SP--;

  clockCycles += 2;

}

  /* =================================
PUSHF
================================= */

else if(instruction === 'PUSHF'){

  if(STACK.length >= STACK_LIMIT){

    throw new Error(
      "Stack Overflow"
    );

  }

  STACK.push({

    type: 'FLAGS',

    value: {

      CF: FLAGS.CF,
      ZF: FLAGS.ZF,
      OF: FLAGS.OF

    }

  });

  SP--;

  clockCycles += 2;

}


  
  /* =================================
POP
================================= */

else if(instruction === 'POP'){

  
  if(STACK.length === 0){

    throw new Error(
      "Stack Underflow"
    );

  }

  const item =
  STACK.pop();

if(item.type !== 'DATA'){

  throw new Error(
    "Cannot POP Non-Data Value"
  );

}
validateRegister(op1);
REG[op1] =
  item.value;

  SP++;

  clockCycles += 2;

}

  /* =================================
POPF
================================= */

else if(instruction === 'POPF'){

  if(STACK.length === 0){

    throw new Error(
      "Stack Underflow"
    );

  }

  const item =
    STACK.pop();

  if(item.type !== 'FLAGS'){

    throw new Error(
      "Cannot POPF Non-Flag Data"
    );

  }

  FLAGS.CF =
    item.value.CF;

  FLAGS.ZF =
    item.value.ZF;

  FLAGS.OF =
    item.value.OF;

  SP++;

  clockCycles += 2;

}

  /* =================================
CALL
================================= */

else if(instruction === 'CALL'){

  const label =
    op1;

  if(LABELS[label] === undefined){

    throw new Error(
      `Unknown Label: ${label}`
    );

  }

  if(STACK.length >= STACK_LIMIT){

  throw new Error(
    "Stack Overflow"
  );

}
  // Save return address
  STACK.push({

  type: 'RETURN',

  value: PC+1

});

  SP--;

  // Jump
  PC =
    LABELS[label] - 1;

  clockCycles += 3;

}

  /* =================================
RET
================================= */

else if(instruction === 'RET'){

  if(STACK.length === 0){

    throw new Error(
      "Stack Underflow"
    );

  }

  const item =
  STACK.pop();

if(item.type !== 'RETURN'){

  throw new Error(
    "Invalid Return Address"
  );

}

const returnAddress =
  item.value;

if(
  returnAddress < 0 ||
  returnAddress >= instructionQueue.length
){

  throw new Error(
    "Invalid Return Address"
  );

}

PC = returnAddress - 1;
  SP++;

  clockCycles += 3;

}

  /* =================================
NOP
================================= */

else if(instruction === 'NOP'){

  clockCycles += 1;

}


  /* =================================
HLT
================================= */

else if(instruction === 'HLT'){

  halted = true;

  clockCycles += 1;

}

      /* =================================
BREAK
================================= */

else if(instruction === 'BREAK'){

  halted = true;

  output += `
================================
BREAKPOINT REACHED
================================
`;

  clockCycles += 1;

}
    /* =================================
    AND
    ================================= */

    else if(instruction === 'AND'){
FLAGS.CF = 0;
FLAGS.ZF = 0;
FLAGS.OF = 0;
      validateRegister(op1);
      REG[op1] &=
        resolveValue(op2, REG) & 255;

      clockCycles += 1;
if(REG[op1] === 0){

  FLAGS.ZF = 1;

}
    }

    /* =================================
    OR
    ================================= */

    else if(instruction === 'OR'){
FLAGS.CF = 0;
FLAGS.ZF = 0;
FLAGS.OF = 0;
      validateRegister(op1);
      REG[op1] |=
        resolveValue(op2, REG) & 255;
      clockCycles += 1;
if(REG[op1] === 0){

  FLAGS.ZF = 1;

}
    }

    /* =================================
    XOR
    ================================= */

    else if(instruction === 'XOR'){
FLAGS.CF = 0;
FLAGS.ZF = 0;
FLAGS.OF = 0;
      validateRegister(op1);
      REG[op1] ^=
        resolveValue(op2, REG) & 255;

      clockCycles += 1;
if(REG[op1] === 0){

  FLAGS.ZF = 1;

}
    }

    /* =================================
    SHL
    ================================= */

    else if(instruction === 'SHL'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;

  const rawCount =
  resolveValue(op2 || 1, REG);

const count =
 Math.abs(rawCount % 8);
validateRegister(op1);
  for(let i=0; i<count; i++){

    FLAGS.CF =
      (REG[op1] & 128)
      ? 1
      : 0;

    REG[op1] =
      (REG[op1] << 1) & 255;

  }

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += count;

}


      /* =================================
ROL
================================= */

else if(instruction === 'ROL'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;

  const rawCount =
  resolveValue(op2 || 1, REG);

const count =
  Math.abs(rawCount % 8);
  validateRegister(op1);
  for(let i=0; i<count; i++){

    const msb =
      (REG[op1] & 128)
      ? 1
      : 0;

    REG[op1] =
      (
        ((REG[op1] << 1) & 255)
        | msb
      ) & 255;

    FLAGS.CF = msb;

  }

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += count;

}

  /* =================================
ROR
================================= */

else if(instruction === 'ROR'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;

  const rawCount =
  resolveValue(op2 || 1, REG);

const count =
  Math.abs(rawCount % 8);
validateRegister(op1);
  for(let i=0; i<count; i++){

    const lsb =
      (REG[op1] & 1);

    REG[op1] =
      (
        (REG[op1] >> 1)
        | (lsb << 7)
      ) & 255;

    FLAGS.CF = lsb;

  }

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += count;

}
    /* =================================
    SHR
    ================================= */

 else if(instruction === 'SHR'){

  FLAGS.CF = 0;
  FLAGS.ZF = 0;
  FLAGS.OF = 0;

  const rawCount =
  resolveValue(op2 || 1, REG);

const count =
  Math.abs(rawCount % 8);
validateRegister(op1);
  for(let i=0; i<count; i++){

    FLAGS.CF =
      (REG[op1] & 1)
      ? 1
      : 0;

    REG[op1] =
      (REG[op1] >> 1) & 255;

  }

  if(REG[op1] === 0){

    FLAGS.ZF = 1;

  }

  clockCycles += count;

}

    /* =================================
UNKNOWN INSTRUCTION
================================= */

else{

  throw new Error(
    `Unknown Instruction: ${instruction}`
  );

}

    /* =================================
8-BIT REGISTER WRAP
================================= */

for(let reg in REG){

  REG[reg] &= 255;

}
    
   
    /* =================================
    REGISTER DUMP
    ================================= */

    output += `
REGISTERS

PC:
${PC}

SP:
${SP}

--------------------------------
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

  }


  catch(err){

  resultDiv.innerHTML =
    "❌ CPU Execution Error";

  stepsDiv.innerHTML =
    `
Error:
${err.message}
`;

  return;

}


  /* =====================================
STACK DUMP
===================================== */

output += `
================================
STACK MEMORY
================================
`;

if(STACK.length === 0){

  output += `
EMPTY STACK
`;

}
else{

  for(let i=STACK.length-1; i>=0; i--){

    output += `
[${i}]
TYPE:
${STACK[i].type}

VALUE:
${
  typeof STACK[i].value === 'object'
  ? JSON.stringify(STACK[i].value)
  : STACK[i].value
}

--------------------------------
`;

  }

}
  
  /* =====================================
  MEMORY DUMP
  ===================================== */

  output += `
================================
MEMORY DUMP
================================
`;

Object
  .keys(MEMORY)
  .sort((a,b)=>a-b)
  .forEach(addr=>{

    output += `
[${addr}] = ${MEMORY[addr]}
`;

});

  resultDiv.innerHTML =
    `✅ Program Executed`;

  stepsDiv.innerHTML =
    output;

}







if(
  mobileMenuBtn &&
  tabsMenu
){

  mobileMenuBtn.addEventListener(
    'click',
    ()=>{

      tabsMenu.classList.toggle(
        'show'
      );

    }
  );

}
