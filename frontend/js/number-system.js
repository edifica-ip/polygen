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

    document.getElementById(
  'globalResult'
).innerHTML = '';

document.getElementById(
  'globalSteps'
).innerHTML = '';

    
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

  let steps =    '';

  /* ================================
  STEP 1
  ================================ */

  steps +=
`Step 1: Convert to Binary\n\n`;

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

Step 2: Convert Binary to ${
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

    ? 'Step: Integer Part\n4-bit grouping R-L (←)\n--------------------------------\n'

    : 'Step: Integer Part\n3-bit grouping R-L (←)\n--------------------------------\n';

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

  
  steps += `${intGroups.join('  ')}\n\n`;

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

     steps +=
    toBase === 16

    ? '\nStep: Fractional Part\n4-bit grouping L-R (→)\n--------------------------------\n'

    : '\nStep: Fractional Part\n3-bit grouping L-R (→)\n--------------------------------\n';

    
    steps += `${fracGroups.join(' ')}\n\n`;

    result += '.';

    for(let grp of fracGroups){

      const digit =
        parseInt(grp,2);

      steps +=`${grp} → ${chars[digit]}\n`;

      result += chars[digit];

    }

  }

  /* ================================
  FINAL
  ================================ */

  steps += `\n--------------------------------\nAnswer: ${result}\n--------------------------------`;

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

    ? 'Step: Integer Part\nIn 4-bits L-R (→)\n--------------------------------\n'

    : 'Step: Integer Part\nIn 3-bits L-R (→)\n--------------------------------\n';

  for(let ch of value){

    // Ignore decimal point
    if(ch === '.'){

      result += '.';

       steps +=
    fromBase === 16

    ? '\nStep: Fractional Part\nIn 4-bits L-R (→)\n--------------------------------\n'

    : '\nStep: Fractional Part\nIn 3-bits L-R (→)\n--------------------------------\n';

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

  steps += `\n--------------------------------\nAnswer: ${result}\n--------------------------------`;

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



/* =========================================
BASE DIGIT HELPERS
========================================= */

function charToValue(ch){

  return '0123456789ABCDEF'
    .indexOf(ch.toUpperCase());

}

function valueToChar(val){

  return '0123456789ABCDEF'[val];

}

/* =========================================
COMPARE TWO BASE NUMBERS
Returns:
1  => a > b
0  => equal
-1 => a < b
========================================= */

function compareBaseNumbers(a,b){

  a =
    a.replace(/^0+/,'') || '0';

  b =
    b.replace(/^0+/,'') || '0';

  if(a.length > b.length){

    return 1;

  }

  if(a.length < b.length){

    return -1;

  }

  for(let i=0;i<a.length;i++){

    const d1 =
      charToValue(a[i]);

    const d2 =
      charToValue(b[i]);

    if(d1 > d2){

      return 1;

    }

    if(d1 < d2){

      return -1;

    }

  }

  return 0;

}

function spaced(str){

  return str.split('').join(' ');

}

/* =========================================
TRUE BASE ADDITION
========================================= */

function convertDecimalToBaseLocal(
  num,
  base
){
  return num.toString(base)
    .toUpperCase();
}

function addInBase(a,b,base){

a = a.toUpperCase();
b = b.toUpperCase();

/* ================================
SPLIT DECIMAL PARTS
================================ */

let aParts =
  a.split('.');

let bParts =
  b.split('.');

let aInt =
  aParts[0];

let aFrac =
  aParts[1] || '';

let bInt =
  bParts[0];

let bFrac =
  bParts[1] || '';

  /* ================================
SAVE ORIGINAL DISPLAY VALUES
================================ */

const displayA =

  aFrac.length > 0

  ? aInt + '.' + aFrac

  : aInt;

const displayB =

  bFrac.length > 0

  ? bInt + '.' + bFrac

  : bInt;

/* ================================
EQUALIZE FRACTION LENGTH
================================ */

const fracLen =
  Math.max(
    aFrac.length,
    bFrac.length
  );

aFrac =
  aFrac.padEnd(fracLen,'0');

bFrac =
  bFrac.padEnd(fracLen,'0');

/* ================================
REBUILD WITHOUT DOT
================================ */

a =
  aInt + aFrac;

b =
  bInt + bFrac;

/* ================================
PAD INTEGERS
================================ */

const maxLen =
  Math.max(
    a.length,
    b.length
  );

a = a.padStart(maxLen,'0');

b = b.padStart(maxLen,'0');

  let carry = 0;

  let answer = [];

  let carryRow = [];

  let steps = 'Explanation:\n';

  /* ================================
  MAIN ADDITION LOOP
  ================================ */

  for(let i=maxLen-1;i>=0;i--){

    const d1 =
      charToValue(a[i]);

    const d2 =
      charToValue(b[i]);

    const incomingCarry =
  carry;

const sum =
  d1 + d2 + incomingCarry;

    const digit =
      sum % base;

    carry =
      Math.floor(sum/base);

    answer.unshift(
      valueToChar(digit)
    );

    carryRow.unshift(carry);

let x=``;
    let baseExplanation = `${sum}₁₀`;
if(base===8)x=`₈`;
    if(base===2)x=`₂`;
    if(base===16)x=`₁₆`;
if(base !== 10){

  baseExplanation = `(${sum})₁₀ = (${convertDecimalToBaseLocal(sum, base)})${x}`;

}
    

   steps += `
${a[i]} + ${b[i]} ${incomingCarry > 0 ? `+ Carry(${incomingCarry})`: ''} = ${baseExplanation}
Write: ${valueToChar(digit)}, Carry: ${carry}\n`;

  }

  /* ================================
  FINAL CARRY
  ================================ */

  if(carry){

    answer.unshift(
      valueToChar(carry)
    );

  }

  /* ================================
  SPACING HELPER
  ================================ */

  function spaced(str){

    return str.split('').join(' ');

  }

  /* ================================
  RAW VALUES
  ================================ */

  const rawA = displayA;

  const rawB = displayB;

let rawAnswer =
  answer.join('');

/* ================================
REINSERT DECIMAL POINT
================================ */

if(fracLen > 0){

  rawAnswer =

    rawAnswer.slice(
      0,
      rawAnswer.length - fracLen
    )

    +

    '.'

    +

    rawAnswer.slice(
      rawAnswer.length - fracLen
    );

}

  const rawCarry =
    carryRow.join('');


  /* ================================
INSERT DECIMAL IN CARRY ROW
================================ */

let formattedCarryRaw =
  rawCarry;

if(fracLen > 0){

  formattedCarryRaw =

    formattedCarryRaw.slice(
      0,
      formattedCarryRaw.length - fracLen + 1
    )

    +

    ' '

    +

    formattedCarryRaw.slice(
      formattedCarryRaw.length - fracLen + 1
    );

}

  
  /* ================================
  WIDTH CALCULATION
  ================================ */

  const totalDigits =
    Math.max(

      rawA.length,

      rawB.length + 1,

      rawAnswer.length

    );

  /* ================================
  VISUAL OUTPUT
  ================================ */

  return {

    result:
      rawAnswer,

    visual: `Base ${base} Addition:\n${rawA}  +  ${rawB} →

Carry (↓)
${spaced(
  formattedCarryRaw.padStart(totalDigits - 1)
)}
${spaced(
  rawA.padStart(totalDigits)
)}
+ ${spaced(
  rawB.padStart(totalDigits - 1)
)}
${'-'.repeat(totalDigits * 2 + 2 )}
${spaced(
  rawAnswer.padStart(totalDigits)
)}
${'-'.repeat(totalDigits * 2 + 2 )}

${steps}

`

  };

}

/* =========================================
TRUE BASE SUBTRACTION
========================================= */

function subtractInBase(a,b,base){

a = a.toUpperCase();
b = b.toUpperCase();

/* ================================
SPLIT DECIMAL PARTS
================================ */

let aParts =
  a.split('.');

let bParts =
  b.split('.');

let aInt =
  aParts[0];

let aFrac =
  aParts[1] || '';

let bInt =
  bParts[0];

let bFrac =
  bParts[1] || '';

/* ================================
SAVE DISPLAY VALUES
================================ */

const displayA =

  aFrac.length > 0

  ? aInt + '.' + aFrac

  : aInt;

const displayB =

  bFrac.length > 0

  ? bInt + '.' + bFrac

  : bInt;

  /* ================================
VISUAL DISPLAY VALUES
================================ */

let visualA =
  displayA;

let visualB =
  displayB;

  
/* ================================
EQUALIZE FRACTIONS
================================ */

const fracLen =
  Math.max(
    aFrac.length,
    bFrac.length
  );

aFrac =
  aFrac.padEnd(fracLen,'0');

bFrac =
  bFrac.padEnd(fracLen,'0');

/* ================================
REMOVE DOT
================================ */

a =
  aInt + aFrac;

b =
  bInt + bFrac;

/* ================================
NEGATIVE HANDLING
================================ */

let negative = false;

if(
  compareBaseNumbers(a,b) < 0
){

  negative = true;

  let temp = a;
  a = b;
  b = temp;

   let tempVisual =
    visualA;

  visualA =
    visualB;

  visualB =
    tempVisual;
}

/* ================================
PAD
================================ */

const maxLen =
  Math.max(
    a.length,
    b.length
  );

a =
  a.padStart(maxLen,'0');

b =
  b.padStart(maxLen,'0');

/* ================================
SPACING HELPER
================================ */

function spaced(str){

  return str.split('').join(' ');

}

/* ================================
MAIN SUBTRACTION
================================ */

let borrow = 0;

let answer = [];

let borrowRow = [];

let steps =
  'Explanation:\n\n';

  /* ================================
NEGATIVE EXPLANATION
================================ */

if(negative){

  steps += `Note: (${displayA} < ${displayB}, so we swap the numbers to find ${visualA} - ${visualB}. Answer will be negative.)\n\n`;

}
  
  /* ================================
NEGATIVE EXPLANATION
================================ */



for(let i=maxLen-1;i>=0;i--){

  let d1 =
    charToValue(a[i]);
const originalD1 =
  d1;
  
  const d2 =
    charToValue(b[i]);

  const incomingBorrow =
    borrow;

  d1 -= incomingBorrow;

  borrow = 0;

  let borrowed = false;

  if(d1 < d2){

    d1 += base;

    borrow = 1;

    borrowed = true;

  }

  const diff =
    d1 - d2;

  answer.unshift(
    valueToChar(diff)
  );

  borrowRow.unshift(borrow);

  let x = ``;

  if(base===2)x=`₂`;
  if(base===8)x=`₈`;
  if(base===16)x=`₁₆`;

  let baseExplanation =
    `${diff}₁₀`;

  if(base !== 10){

    baseExplanation =
`(${diff})₁₀ = (${convertDecimalToBaseLocal(diff,base)})${x}`;

  }

 steps += `${a[i]} - ${b[i]} ${incomingBorrow > 0? `- Borrow (${incomingBorrow})`: ''} ${borrowed? `Borrow from next digit (+${base})`: ''} = ${baseExplanation}
Write: ${valueToChar(diff)}, Borrow: ${borrow}

`;

}

/* ================================
REMOVE LEADING ZEROS
================================ */

while(

  answer.length > 1
  &&
  answer[0] === '0'

){

  answer.shift();

}

/* ================================
FINAL ANSWER
================================ */

let rawAnswer =
  answer.join('');

/* ================================
REINSERT DOT
================================ */

if(fracLen > 0){

  rawAnswer =

    rawAnswer.slice(
      0,
      rawAnswer.length - fracLen
    )

    +

    '.'

    +

    rawAnswer.slice(
      rawAnswer.length - fracLen
    );

}

/* ================================
NEGATIVE
================================ */

let finalDisplayAnswer =
  rawAnswer;

if(negative){

  finalDisplayAnswer =
    '-' + rawAnswer;

}
/* ================================
BORROW DISPLAY
================================ */

const rawBorrow =
  borrowRow.join('');

let formattedBorrowRaw =
  rawBorrow;

if(fracLen > 0){

  formattedBorrowRaw =

    formattedBorrowRaw.slice(
      0,
      formattedBorrowRaw.length - fracLen + 1
    )

    +

    ' '

    +

    formattedBorrowRaw.slice(
      formattedBorrowRaw.length - fracLen + 1
    );

}

/* ================================
VISUAL WIDTH
================================ */

const totalDigits =
  Math.max(

    displayA.length,

    displayB.length + 1,

    rawAnswer.length

  ) + 1;

/* ================================
FINAL VISUAL
================================ */

return {

  result:
    rawAnswer,

  visual: `Base ${base} Subtraction:\n${displayA}  -  ${displayB} = ${negative ? `- (${visualA} - ${visualB}) →` : ''}

Borrow (↓)
${spaced(
  formattedBorrowRaw.padStart(totalDigits - 1)
)}

${spaced(
  visualA.padStart(totalDigits)
)}
- ${spaced(
  visualB.padStart(totalDigits - 1)
)}
${'-'.repeat(totalDigits * 2 + 2)}
${spaced(
  rawAnswer.padStart(totalDigits)
)}
${'-'.repeat(totalDigits * 2 + 2)}
${
negative? `Final Answer = ${finalDisplayAnswer} (-ve for the initial swap)`: `Final Answer = ${finalDisplayAnswer}`}

${steps}

`

};

}







function subtractInBase2(a,b,base){

  a = a.toUpperCase();
  b = b.toUpperCase();

  let negative = false;

  if(compareBaseNumbers(a,b) < 0){

    negative = true;

    let temp = a;

    a = b;
    b = temp;

  }

  const maxLen =
    Math.max(a.length,b.length);

  a = a.padStart(maxLen,'0');
  b = b.padStart(maxLen,'0');

  let borrow = 0;

  let answer = [];

  let borrowRow = [];

  let steps = '';

  for(let i=maxLen-1;i>=0;i--){

    let d1 =
      charToValue(a[i]) - borrow;

    const d2 =
      charToValue(b[i]);

    borrow = 0;

    if(d1 < d2){

      d1 += base;

      borrow = 1;

    }

    const diff =
      d1 - d2;

    answer.unshift(
      valueToChar(diff)
    );

    borrowRow.unshift(borrow);

    steps += `
${a[i]} - ${b[i]}

Write:
${valueToChar(diff)}

Borrow:
${borrow}

--------------------------------
`;

  }

  while(
    answer.length > 1 &&
    answer[0] === '0'
  ){

    answer.shift();

  }

  const formattedA =a;

const formattedB =b;

const formattedAnswer =
  answer.join('');

const formattedBorrow =
  borrowRow.join('');

const totalWidth =
  Math.max(

    formattedA.length,

    formattedB.length + 2,

    formattedAnswer.length + 2,

    formattedBorrow.length

  );

return {

  result:
    (negative ? '-' : '')
    + answer.join(''),

  visual: `

Borrow:
${formattedBorrow.padStart(totalWidth)}

${formattedA.padStart(totalWidth)}

- ${formattedB.padStart(totalWidth - 1)}

${'-'.repeat(totalWidth)}

${(
  (
    negative
    ? '- '
    : ''
  ) + formattedAnswer
).padStart(totalWidth)}

================================

${steps}

`

};

}

/* =========================================
TRUE BASE MULTIPLICATION
NO DECIMAL CONVERSION
========================================= */

function multiplyInBase(a,b,base){

a = a.toUpperCase();
b = b.toUpperCase();

/* ================================
SPLIT DECIMAL PARTS
================================ */

let aParts =
  a.split('.');

let bParts =
  b.split('.');

let aInt =
  aParts[0];

let aFrac =
  aParts[1] || '';

let bInt =
  bParts[0];

let bFrac =
  bParts[1] || '';

/* ================================
SAVE DISPLAY VALUES
================================ */

const displayA =

  aFrac.length > 0

  ? aInt + '.' + aFrac

  : aInt;

const displayB =

  bFrac.length > 0

  ? bInt + '.' + bFrac

  : bInt;

/* ================================
TOTAL FRACTION LENGTH
================================ */

const totalFracLen =
  aFrac.length + bFrac.length;

/* ================================
REMOVE DECIMAL POINTS
================================ */

a =
  aInt + aFrac;

b =
  bInt + bFrac;

/* ================================
SPACING HELPER
================================ */

function spaced(str){

  return str.split('').join(' ');

}

/* ================================
EXPLANATION
================================ */

let steps =
  'Explanation:\n';

/* ================================
PARTIAL PRODUCTS
================================ */

let partials = [];

let shift = 0;

for(let i=b.length-1;i>=0;i--){

  const digitB =
    charToValue(b[i]);

  let carry = 0;

  let partial = [];

  steps += `
================================
Multiplying by ${b[i]}
================================
`;

  for(let j=a.length-1;j>=0;j--){

    const digitA =
      charToValue(a[j]);

    const product =
      digitA * digitB + carry;

    const digit =
      product % base;

    carry =
      Math.floor(product/base);

    partial.unshift(
      valueToChar(digit)
    );

    let x = ``;

    if(base===2)x=`₂`;
    if(base===8)x=`₈`;
    if(base===16)x=`₁₆`;

    let baseExplanation =
      `${product}₁₀`;

    if(base !== 10){

      baseExplanation =
`(${product})₁₀ = (${convertDecimalToBaseLocal(product,base)})${x}`;

    }

    steps += `${a[j]} × ${b[i]} ${carry > 0 ? `+ Carry(${carry})` : ''} = ${baseExplanation}
Write: ${valueToChar(digit)}, Carry: ${carry}

`;

  }

  if(carry){

    partial.unshift(
      valueToChar(carry)
    );

  }

  partial =
    partial.join('')
    + '0'.repeat(shift);

  partials.push(partial);

  shift++;

}

/* ================================
FINAL ADDITION
================================ */

let finalAnswer = '0';

for(let p of partials){

  finalAnswer =
    addInBase(
      finalAnswer,
      p,
      base
    ).result.replace('.','');

}

/* ================================
REINSERT DECIMAL POINT
================================ */

if(totalFracLen > 0){

  finalAnswer =

    finalAnswer.slice(
      0,
      finalAnswer.length - totalFracLen
    )

    +

    '.'

    +

    finalAnswer.slice(
      finalAnswer.length - totalFracLen
    );

}

/* ================================
VISUAL ALIGNMENT
================================ */

const visualPartials =
  partials.map(x=>x);

const totalDigits =
  Math.max(

    displayA.length,

    displayB.length + 1,

    finalAnswer.length,

    ...visualPartials.map(
      x => x.length
    )

  ) + 1;

/* ================================
FINAL VISUAL
================================ */

return {

  result:
    finalAnswer,

  visual: `Base ${base} Multiplication:\n${displayA}  ×  ${displayB} →

${spaced(
  displayA.padStart(totalDigits)
)}
× ${spaced(
  displayB.padStart(totalDigits - 1)
)}
${'-'.repeat(totalDigits * 2 + 2)}
${visualPartials.map(x => spaced(x.padStart(totalDigits))).join('\n')}
${'-'.repeat(totalDigits * 2 + 2)}
${spaced(
  finalAnswer.padStart(totalDigits)
)}
${'-'.repeat(totalDigits * 2 + 2)}`

};

}



function multiplyInBase2(a,b,base){

  a = a.toUpperCase();
  b = b.toUpperCase();

  let partials = [];

  let workSteps = '';

  let shift = 0;

  /* =====================================
  PARTIAL PRODUCTS
  ===================================== */

  for(let i=b.length-1;i>=0;i--){

    const digitB =
      charToValue(b[i]);

    let carry = 0;

    let partial = [];

    workSteps += `
================================
Multiplying by ${b[i]}
================================
`;

    for(let j=a.length-1;j>=0;j--){

      const digitA =
        charToValue(a[j]);

      const product =
        digitA * digitB + carry;

      const digit =
        product % base;

      carry =
        Math.floor(product / base);

      partial.unshift(
        valueToChar(digit)
      );

      workSteps += `
${a[j]} × ${b[i]}

= ${product}

Write:
${valueToChar(digit)}

Carry:
${carry}

--------------------------------
`;

    }

    if(carry){

      partial.unshift(
        valueToChar(carry)
      );

    }

    /* SHIFT */

    partial =
      partial.join('')
      + '0'.repeat(shift);

    partials.push(partial);

    shift++;

  }

  /* =====================================
  FINAL ADDITION
  ===================================== */

  let finalResult = '0';

  for(let p of partials){

    finalResult =
      addInBase(
        finalResult,
        p,
        base
      ).result;

  }

const formattedA =a;

const formattedB =b;

const formattedResult =
  finalResult.split('').join('');

const formattedPartials =
  partials.map(
    x => x.split('').join('')
  );

const totalWidth =
  Math.max(

    formattedA.length,

    formattedB.length + 2,

    formattedResult.length,

    ...formattedPartials.map(
      x => x.length
    )

  );

return {

  result:
    finalResult,

  visual: `

PROCESS 1:
DIRECT BASE MULTIPLICATION

${formattedA.padStart(totalWidth)}

× ${formattedB.padStart(totalWidth - 1)}

${'-'.repeat(totalWidth)}

${formattedPartials.map(
x => x.padStart(totalWidth)
).join('\n')}

${'-'.repeat(totalWidth)}

${formattedResult.padStart(totalWidth)}

================================

${workSteps}

`

};

}














function divideInBase(a,b,base){

a = a.toUpperCase();
b = b.toUpperCase();

/* ================================
DIVIDE BY ZERO
================================ */

if(
  b === '0'
  ||
  b === '0.0'
){

  throw new Error(
    'Division by zero not allowed'
  );

}

/* ================================
REMOVE DECIMAL
================================ */

let aParts =
  a.split('.');

let bParts =
  b.split('.');

let aFrac =
  aParts[1] || '';

let bFrac =
  bParts[1] || '';

const shift =
  Math.max(
    aFrac.length,
    bFrac.length
  );

a =
  a.replace('.','')
  .padEnd(
    a.replace('.','').length
    + (shift - aFrac.length),
    '0'
  );

b =
  b.replace('.','')
  .padEnd(
    b.replace('.','').length
    + (shift - bFrac.length),
    '0'
  );

/* ================================
HELPERS
================================ */

function spaced(str){

  return str.split('').join(' ');

}

function removeLeadingZeros(str){

  while(
    str.length > 1
    &&
    str[0] === '0'
  ){

    str =
      str.slice(1);

  }

  return str;

}

/* ================================
LONG DIVISION
================================ */

let quotient = '';

let current = '';



let explanation =
  'Explanation:\n\n';

   let divisionVisual = '';

 
for(let i=0;i<a.length;i++){

  current += a[i];

  current =
    removeLeadingZeros(current);

  let qDigit = 0;

  let tempCurrent =
    current;

  /* ================================
  FIND QUOTIENT DIGIT
  ================================ */

  while(
    compareBaseNumbers(
      tempCurrent,
      b
    ) >= 0
  ){

    tempCurrent =
      subtractInBase(
        tempCurrent,
        b,
        base
      )
      .result
      .replace('-','');

    tempCurrent =
      removeLeadingZeros(
        tempCurrent
      );

    qDigit++;

  }

  quotient +=
    valueToChar(qDigit);

  /* ================================
  MULTIPLICATION ROW
  ================================ */

  let product =
    multiplyInBase(
      b,
      valueToChar(qDigit),
      base
    )
    .result
    .replace('.','');

  /* ================================
  SUBTRACTION
  ================================ */

  let remainder =
    subtractInBase(
      current,
      product,
      base
    )
    .result
    .replace('-','');

  remainder =
    removeLeadingZeros(
      remainder
    );

  /* ================================
  VISUAL ALIGNMENT
  ================================ */

 /* ================================
VISUAL ALIGNMENT
================================ */
 const previousCurrent =
  current;


  
if(qDigit > 0){

  let offset =
    spaced(b).length
    + 3
    + ((i - previousCurrent.length + 1) * 2);

  divisionVisual += `${' '.repeat(offset)}${spaced(product)}
${' '.repeat(offset)}${'-'.repeat(spaced(product).length)}
${' '.repeat(offset+2)}${spaced(i < a.length - 1  ? remainder + a[i + 1]  : remainder)}
`;



}

/* ================================
UPDATE CURRENT
================================ */

current =
  remainder;

  /* ================================
  EXPLANATION
  ================================ */

  explanation += `
Step ${i + 1}

Current Number:
${previousCurrent  || '0'}

${b} goes into current number

${valueToChar(qDigit)} time(s)

Subtract:
${previousCurrent} - ${product}

Remainder:
${remainder}

================================

`;

}

 

/* ================================
REMOVE LEADING ZEROS
================================ */

quotient =
  removeLeadingZeros(
    quotient
  );

if(quotient === ''){

  quotient = '0';

}


divisionVisual =
`${spaced(b)} ) ${spaced(a)} ( ${spaced(quotient)}\n`
+ divisionVisual;


  
/* ================================
FINAL WIDTH
================================ */

const width =
  Math.max(
    a.length,
    b.length,
    quotient.length
  ) * 2 + 10;

 
/* ================================
FINAL VISUAL
================================ */

return {

  result:
    quotient,

  
visual: `Base ${base} Division:\n${a} ÷ ${b} →\n
${divisionVisual}${'-'.repeat(width)}
Quotient:
${spaced(quotient)}
Remainder:
${spaced(current || '0')}
`

};

}














function divideInBase3(a,b,base){

a = a.toUpperCase();
b = b.toUpperCase();

/* ================================
DIVIDE BY ZERO
================================ */

if(
  b === '0'
  ||
  b === '0.0'
){

  throw new Error(
    'Division by zero not allowed'
  );

}

/* ================================
REMOVE DECIMAL
================================ */

let aParts =
  a.split('.');

let bParts =
  b.split('.');

let aFrac =
  aParts[1] || '';

let bFrac =
  bParts[1] || '';

const shift =
  Math.max(
    aFrac.length,
    bFrac.length
  );

a =
  a.replace('.','')
  .padEnd(
    a.replace('.','').length
    + (shift - aFrac.length),
    '0'
  );

b =
  b.replace('.','')
  .padEnd(
    b.replace('.','').length
    + (shift - bFrac.length),
    '0'
  );

/* ================================
HELPERS
================================ */

function spaced(str){

  return str.split('').join(' ');

}

function removeLeadingZeros(str){

  while(
    str.length > 1
    &&
    str[0] === '0'
  ){

    str =
      str.slice(1);

  }

  return str;

}

/* ================================
LONG DIVISION
================================ */

let quotient = '';

let current = '';

let steps =
  'Explanation:\n\n';

let visualSteps = '';

for(let i=0;i<a.length;i++){

  current += a[i];

  current =
    removeLeadingZeros(current);

  let qDigit = 0;

  let subtractionSteps = '';

  /* ================================
  REPEATED SUBTRACTION
  ================================ */

  while(
    compareBaseNumbers(
      current,
      b
    ) >= 0
  ){

    subtractionSteps += `
${current}
- ${b}
${'-'.repeat(
Math.max(
current.length,
b.length
) + 2
)}
`;

    current =
      subtractInBase(
        current,
        b,
        base
      )
      .result
      .replace('-','');

    current =
      removeLeadingZeros(current);

    subtractionSteps += `
${current}

`;

    qDigit++;

  }

  quotient +=
    valueToChar(qDigit);

  /* ================================
  VISUAL STEP
  ================================ */

  visualSteps += `

================================

Step ${i + 1}

Current Dividend:
${spaced(current || '0')}

${valueToChar(qDigit)} × ${b}

Repeated Subtraction:

${subtractionSteps}

Quotient Digit:
${valueToChar(qDigit)}

Remainder:
${current || '0'}

`;

  /* ================================
  EXPLANATION
  ================================ */

  let x = ``;

  if(base===2)x=`₂`;
  if(base===8)x=`₈`;
  if(base===16)x=`₁₆`;

  let baseExplanation =
    `${qDigit}₁₀`;

  if(base !== 10){

    baseExplanation =
`(${qDigit})₁₀ = (${convertDecimalToBaseLocal(qDigit,base)})${x}`;

  }

  steps += `

Bring down:
${a[i]}

Current Working Number:
${current || '0'}

${b} goes into current number

${baseExplanation} times

Remainder:
${current || '0'}

--------------------------------

`;

}

/* ================================
REMOVE LEADING ZEROS
================================ */

quotient =
  removeLeadingZeros(
    quotient
  );

if(quotient === ''){

  quotient = '0';

}




  
/* ================================
FINAL VISUAL WIDTH
================================ */

const totalDigits =
  Math.max(
    a.length,
    b.length,
    quotient.length
  ) + 2;

/* ================================
FINAL VISUAL
================================ */

return {

  result:
    quotient,

  visual: `

Base ${base} Division:

${a} ÷ ${b}

${'='.repeat(totalDigits * 2)}

Quotient:
${spaced(quotient)}

Divisor:
${spaced(b)}

Dividend:
${spaced(a)}

Final Remainder:
${spaced(current || '0')}

${'='.repeat(totalDigits * 2)}

${visualSteps}

${'='.repeat(totalDigits * 2)}

${steps}

`

};

}



function divideInBase1(a,b,base){

a = a.toUpperCase();
b = b.toUpperCase();

/* ================================
DIVIDE BY ZERO
================================ */

if(
  b === '0'
  ||
  b === '0.0'
){

  throw new Error(
    'Division by zero not allowed'
  );

}

/* ================================
REMOVE DECIMALS
================================ */

let aParts =
  a.split('.');

let bParts =
  b.split('.');

let aFrac =
  aParts[1] || '';

let bFrac =
  bParts[1] || '';

const shift =
  Math.max(
    aFrac.length,
    bFrac.length
  );

a =
  a.replace('.','')
  .padEnd(
    a.replace('.','').length
    + (shift - aFrac.length),
    '0'
  );

b =
  b.replace('.','')
  .padEnd(
    b.replace('.','').length
    + (shift - bFrac.length),
    '0'
  );

/* ================================
SPACING HELPER
================================ */

function spaced(str){

  return str.split('').join(' ');

}

/* ================================
LONG DIVISION
================================ */

let quotient = '';

let current = '';

let steps =
  'Explanation:\n\n';

let stepVisuals = [];

for(let i=0;i<a.length;i++){

  current += a[i];

  current =
    removeLeadingZeros(current);

  let qDigit = 0;

  while(
    compareBaseNumbers(
      current,
      b
    ) >= 0
  ){

    current =
      subtractInBase(
        current,
        b,
        base
      ).result.replace('-','');

    qDigit++;

  }

  quotient +=
    valueToChar(qDigit);

  stepVisuals.push(`
Current Dividend:
${current || '0'}

Quotient Digit:
${valueToChar(qDigit)}

--------------------------------
`);

  let x = ``;

  if(base===2)x=`₂`;
  if(base===8)x=`₈`;
  if(base===16)x=`₁₆`;

  let baseExplanation =
    `${qDigit}₁₀`;

  if(base !== 10){

    baseExplanation =
`(${qDigit})₁₀ = (${convertDecimalToBaseLocal(qDigit,base)})${x}`;

  }

  steps += `
Bring down:
${a[i]}

Current:
${current || '0'}

Quotient digit:
${baseExplanation}

Remainder:
${current || '0'}

================================
`;

}

/* ================================
REMOVE LEADING ZEROS
================================ */

quotient =
  removeLeadingZeros(
    quotient
  );

if(quotient === ''){

  quotient = '0';

}

/* ================================
FINAL VISUAL WIDTH
================================ */

const totalDigits =
  Math.max(
    a.length,
    b.length,
    quotient.length
  ) + 2;

/* ================================
FINAL VISUAL
================================ */

return {

  result:
    quotient,

  visual: `Base ${base} Division:

${a} ÷ ${b}

${'-'.repeat(totalDigits * 2)}

Quotient:
${spaced(quotient)}

Divisor:
${spaced(b)}

Dividend:
${spaced(a)}

Remainder:
${spaced(current || '0')}

${'-'.repeat(totalDigits * 2)}

${steps}

`

};

}

/* ================================
HELPER
================================ */

function removeLeadingZeros(str){

  while(
    str.length > 1
    &&
    str[0] === '0'
  ){

    str =
      str.slice(1);

  }

  return str;

}















/* =========================================
TRUE BASE DIVISION
LONG DIVISION
NO DECIMAL CONVERSION
========================================= */

function divideInBase2(a,b,base){

  a = a.toUpperCase();
  b = b.toUpperCase();

  if(b === '0'){

    return {

      result: 'Undefined',

      visual:
        'Division By Zero'

    };

  }

  let quotient = '';

  let current = '';

  let steps = '';

  /* =====================================
  LONG DIVISION
  ===================================== */

  for(let i=0;i<a.length;i++){

    current += a[i];

    current =
      current.replace(/^0+/,'')
      || '0';

    let count = 0;

    while(

      compareBaseNumbers(
        current,
        b
      ) >= 0

    ){

      current =
        subtractInBase(
          current,
          b,
          base
        ).result
        .replace('-','');

      count++;

    }

    quotient +=
      valueToChar(count);

    steps += `
Current Portion:
${current}

Quotient Digit:
${valueToChar(count)}

Remainder:
${current}

--------------------------------
`;

  }

  quotient =
    quotient.replace(/^0+/,'')
    || '0';

 const divisionLine =
  `${b} ) ${a}`;

const totalWidth =
  Math.max(

    divisionLine.length,

    quotient.length,

    current.length

  );

return {

  result:
    quotient,

  remainder:
    current,

  visual: `

PROCESS 1:
DIRECT BASE DIVISION

${divisionLine.padStart(totalWidth)}

${'-'.repeat(totalWidth)}

Quotient:
${quotient.padStart(totalWidth)}

Remainder:
${current.padStart(totalWidth)}

================================

${steps}

`

};

}



/* =========================================
ARITHMETIC
TRUE BASE ARITHMETIC
NO DECIMAL CONVERSION
========================================= */

function calculateArithmetic(){

  const num1 =
    document.getElementById('num1')
    .value
    .trim()
    .toUpperCase();

  const num2 =
    document.getElementById('num2')
    .value
    .trim()
    .toUpperCase();

  const base =
    parseInt(
      document.getElementById(
        'arithBase'
      ).value
    );

  const operation =
    document.getElementById(
      'operation'
    ).value;

  const resultDiv =
    document.getElementById(
      'globalResult'
    );

  const stepsDiv =
    document.getElementById(
      'globalSteps'
    );

  try{

    /* ================================
    VALIDATION
    ================================ */

    if(
      !isValidForBase(num1, base)
      ||
      !isValidForBase(num2, base)
    ){

      throw new Error(
        'Invalid Input'
      );

    }

    let finalAnswer = '';

    let visualSteps = '';

    /* ================================
    ADDITION
    ================================ */

    if(operation === '+'){

      const res =
        addInBase(
          num1,
          num2,
          base
        );

      finalAnswer =
        res.result;

      visualSteps =
        res.visual;

    }

    /* ================================
    SUBTRACTION
    ================================ */

    else if(operation === '-'){

      const res =
        subtractInBase(
          num1,
          num2,
          base
        );

      finalAnswer =
        res.result;

      visualSteps =
        res.visual;

    }

    /* ================================
    MULTIPLICATION
    ================================ */

    else if(operation === '*'){

      const res =
        multiplyInBase(
          num1,
          num2,
          base
        );

      finalAnswer =
        res.result;

      visualSteps =
        res.visual;

    }

    /* ================================
    DIVISION
    ================================ */

    else if(operation === '/'){

      const res =
        divideInBase(
          num1,
          num2,
          base
        );

      finalAnswer =
        res.result;

      visualSteps =
        res.visual;

      if(res.remainder !== undefined){

        visualSteps += `

================================

FINAL ANSWER

Quotient:
${res.result}

Remainder:
${res.remainder}
`;

      }

    }

    else{

      throw new Error(
        'Unsupported Operation'
      );

    }

    /* ================================
    RESULT
    ================================ */

    resultDiv.innerHTML =
      `✅ Result: ${finalAnswer}`;

    stepsDiv.textContent  =
      visualSteps;

  }

  catch(err){

    resultDiv.innerHTML =
      '❌ Invalid Input';

    stepsDiv.innerHTML =
      err.message;

  }

}















function calculateArithmetic2(){

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
