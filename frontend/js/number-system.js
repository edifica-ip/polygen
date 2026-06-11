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



    /* =================================
AUTO FOCUS
================================= */

setTimeout(() => {

  switch(btn.dataset.tab){

    case 'octal':{

  const arithmeticVisible =
    document.getElementById(
      'octalArithmeticGroup'
    ).style.display === 'block';

  if(arithmeticVisible){

    document.getElementById(
      'octalNum1'
    )?.focus();

  }

  else{

    document.getElementById(
      'octalConvertInput'
    )?.focus();

  }

  break;
}



    case 'decimal':{

      const arithmeticVisible =
        document.getElementById(
          'decimalArithmeticGroup'
        ).style.display === 'block';

      if(arithmeticVisible){

        document.getElementById(
          'decimalNum1'
        )?.focus();

      }

      else{

        document.getElementById(
          'decimalConvertInput'
        )?.focus();

      }

      break;
    }

    case 'binary':{

      const arithmeticVisible =
        document.getElementById(
          'binaryArithmeticGroup'
        ).style.display === 'block';

      if(arithmeticVisible){

        document.getElementById(
          'binaryNum1'
        )?.focus();

      }

      else{

        document.getElementById(
          'binaryConvertInput'
        )?.focus();

      }

      break;
    }



  }

}, 50);

  });

});


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
`Step 1: Convert to Binary\n`;

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
Step 2: Convert Binary to ${
  toBase === 16
    ? 'Hexadecimal'
    : 'Octal'
}
`;

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

  let subscript =
  {
    2:'₂',
    8:'₈',
    10:'₁₀',
    16:'₁₆'
  };
  let steps =
    `(${value})₂ → ( ? )${subscript[toBase]}\n\n`;


  // Group size
  const groupSize =
    toBase === 16 ? 4 : 3;


      const parts =
    value.split('.');

  let intPart =
    parts[0];

  let fracPart =
    parts[1] || '';



  steps +=
    toBase === 16

    ? `Step: Integer Part (${intPart})\n4-bit grouping R-L (←)\n----------------------\n`

    : `Step: Integer Part (${intPart})\n3-bit grouping R-L (←)\n----------------------\n`;

  // Split decimal part

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

    ? `\nStep: Fractional Part (${fracPart})\n4-bit grouping L-R (→)\n----------------------\n`

    : `\nStep: Fractional Part (${fracPart})\n3-bit grouping L-R (→)\n----------------------\n`;

    
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

      const parts =
    value.split('.');

  let intPart =
    parts[0];

  let fracPart =
    parts[1] || '';


    let subscript =
  {
    2:'₂',
    8:'₈',
    10:'₁₀',
    16:'₁₆'
  };
  let steps =
    `(${value})${subscript[fromBase]} → (?)₂\n\n`;


  let result = '';

  // Group size
  const groupSize =
    fromBase === 16 ? 4 : 3;

  steps +=
    fromBase === 16

    ? `Step: Integer Part (${intPart})\nIn 4-bits L-R (→)\n-----------------\n`

    : `Step: Integer Part (${intPart})\nIn 3-bits L-R (→)\n-----------------\n`;

  for(let ch of value){

    // Ignore decimal point
    if(ch === '.'){

      result += '.';

       steps +=
    fromBase === 16

    ? `\nStep: Fractional Part (${fracPart})\nIn 4-bits L-R (→)\n-----------------\n`

    : `\nStep: Fractional Part (${fracPart})\nIn 3-bits L-R (→)\n-----------------\n`;

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

  steps += `--------------------------------\nAnswer: ${result}\n--------------------------------\n`;

  return steps;

}



function generateAnyToDecimalSteps(value, base){

  const chars =
    '0123456789ABCDEF';

  value =
    value.toUpperCase();

    let subscript =
  {
    2:'₂',
    8:'₈',
    10:'₁₀',
    16:'₁₆'
  };

  let steps =
    `(${value})${subscript[base]} → ( ? )₁₀\n\n`;

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
`Step: Integer Part
------------------\n`;

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

    steps += `
Step: Fractional Part
---------------------\n`;

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

  steps += `\nStep: Expanded Form (Optional)\n------------------------------\n${expansions.join('\n+ ')}

Step: Finding Sum
-----------------\n${calculations.join(' + ')}

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
let subscript =
  {
    2:'₂',
    8:'₈',
    10:'₁₀',
    16:'₁₆'
  };
  let steps =
    `(${num})₁₀ → ( ? )${subscript[base]}\n\n`;

  // Split parts
  let integerPart =
    Math.floor(number);

  let fractionPart =
    number - integerPart;

    let ofp = fractionPart;

  let remainders = [];

  /* ================================
  INTEGER PART
  ================================ */

  steps +=
`Step: Integer Part
-------------------\n`;

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

    steps += 
`\nStep: Fractional Part
---------------------\n`;

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

  `\t Integer = ${chars[digit]}`;

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

  steps += `\nStep: Read the Remainder(s)\n------------------------------\nUpwards (↑): ${remainders.join('')}\n`
  
  if(ofp > 0)
  steps += `\nStep: Read the Integer(s)\n----------------------------\nDownwards (↓): ${fractionalDigits.join('')}\n`

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

  let steps = 'Explanation:';

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
${a[i]} + ${b[i]} ${incomingCarry > 0 ? `+ Carry(${incomingCarry})`: ''} = ${baseExplanation}\nWrite: ${valueToChar(digit)}, Carry: ${carry}`;  }

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

/* ================================
RAW VALUES (ALIGNED DISPLAY)
================================ */

const rawA =
  fracLen > 0
    ? a.slice(0, maxLen - fracLen)
      + '.'
      + a.slice(maxLen - fracLen)
    : a;

const rawB =
  fracLen > 0
    ? b.slice(0, maxLen - fracLen)
      + '.'
      + b.slice(maxLen - fracLen)
    : b;

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
  carryRow
    .slice(
      carryRow[0] === 0 ? 1 : 0
    )
    .join('');


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

    rawAnswer.length,

    formattedCarryRaw.length + 1

  );

  /* ================================
  VISUAL OUTPUT
  ================================ */

  return {

    result:
      rawAnswer,
    visual: `${rawA}  +  ${rawB} →

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

${steps}`

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

const originalA =
  aFrac.length > 0
  ? aInt + '.' + aFrac
  : aInt;

const originalB =
  bFrac.length > 0
  ? bInt + '.' + bFrac
  : bInt;
  /* ================================
VISUAL DISPLAY VALUES
================================ */


  
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

  const displayA =
  fracLen > 0
    ? a.slice(0, maxLen - fracLen)
      + '.'
      + a.slice(maxLen - fracLen)
    : a;

const displayB =
  fracLen > 0
    ? b.slice(0, maxLen - fracLen)
      + '.'
      + b.slice(maxLen - fracLen)
    : b;

    
let visualA = displayA;
let visualB = displayB;

if(negative){

  visualA = displayB;
  visualB = displayA;

}
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
  'Explanation:\n';

  /* ================================
NEGATIVE EXPLANATION
================================ */

if(negative){

  //steps += `Note: (${displayA} < ${displayB}, so we swap the numbers to find ${visualA} - ${visualB}. Answer will be negative.)\n\n`;
  steps += `Note: (${originalA} < ${originalB}), so we swap the numbers to find ${visualA} - ${visualB}. Answer will be negative.\n\n`;

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

 steps += `${a[i]} - ${b[i]} ${incomingBorrow > 0? `- Borrow (${incomingBorrow})`: ''} ${borrowed? `Borrow from next digit (+${base})`: ''} = ${baseExplanation}\nWrite: ${valueToChar(diff)}, Borrow: ${borrow}\n`;

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
    rawAnswer.length,
    formattedBorrowRaw.length + 1
  ) + 1;

/* ================================
FINAL VISUAL
================================ */

return {

  result:
    rawAnswer,

  visual: `${displayA}  -  ${displayB} → ${negative ? `- (${visualA} - ${visualB}) →` : ''}

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

${steps}`

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

const originalA =
  aFrac.length > 0
  ? aInt + '.' + aFrac
  : aInt;

const originalB =
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




const maxIntLen =
  Math.max(
    aInt.length,
    bInt.length
  );

const maxFracLen =
  Math.max(
    aFrac.length,
    bFrac.length
  );

/* Equalize lengths */

aInt =
  aInt.padStart(
    maxIntLen,
    '0'
  );

bInt =
  bInt.padStart(
    maxIntLen,
    '0'
  );

aFrac =
  aFrac.padEnd(
    maxFracLen,
    '0'
  );

bFrac =
  bFrac.padEnd(
    maxFracLen,
    '0'
  );

/* Display */

const displayA =
  aInt +
  (
    maxFracLen > 0
      ? '.' + aFrac
      : ''
  );

const displayB =
  bInt +
  (
    maxFracLen > 0
      ? '.' + bFrac
      : ''
  );

/* Values used for multiplication */

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

  while(
    finalAnswer.length <= totalFracLen
  ){

    finalAnswer =
      '0' + finalAnswer;

  }

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

  visual: `${displayA}  ×  ${displayB} →

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

function divideInBaseDecimal(a,b,base){

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
CONFIG
================================ */

const maxDecimalPlaces = 10;

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
NORMALIZE DECIMALS
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

a =
  removeLeadingZeros(a);

b =
  removeLeadingZeros(b);

/* ================================
LONG DIVISION
================================ */

let quotient = '';

let current = '';

let divisionVisual = '';

let explanation =
  'Explanation:\n\n';

let decimalInserted =
  false;

let decimalCount = 0;

let i = 0;

/* ================================
MAIN DIVISION LOOP
================================ */

while(

  i < a.length
  ||
  (
    current !== '0'
    &&
    decimalCount < maxDecimalPlaces
  )

){

  /* ================================
  BRING DOWN DIGIT
  ================================ */

  if(i < a.length){

    current += a[i];

  }else{

    if(!decimalInserted){

      quotient += '.';

      decimalInserted = true;

    }

    current += '0';

    decimalCount++;

  }

  current =
    removeLeadingZeros(current);

  const previousCurrent =
    current;

  /* ================================
  FIND QUOTIENT DIGIT
  ================================ */

  let qDigit = 0;

  let tempCurrent =
    current;

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
  PRODUCT
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
  REMAINDER
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
  VISUAL
  ================================ */

 if(quotient.replace('.','').length > 1){

  let offset =
    spaced(b).length
    + 3
    + ((i - previousCurrent.length + 1) * 2);

  divisionVisual += `
${' '.repeat(offset)}${spaced(product === '0' ? '0':
  product.padStart(
    previousCurrent.length,
    '0'
  )
)}
${' '.repeat(offset)}${'-'.repeat(
  Math.max(
    3,
    spaced(product === '0'  ? '0':
      product.padStart(
        previousCurrent.length,
        '0'
      )
    ).length
  )
)}
${' '.repeat(
  offset
  +
  (
    spaced(product === '0'  ? '0':
      product.padStart(
        previousCurrent.length,
        '0'
      )
    ).length
    -
    spaced(
      (
        i < a.length - 1
      )
      ? remainder + a[i + 1]
      : remainder
    ).length
  )
  +
  (
    i < a.length - 1
    ? 2
    : 0
  )
)}${spaced(
  (
    i < a.length - 1
  )
  ? remainder + a[i + 1]
  : remainder
)}
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
${previousCurrent}

${b} goes into current number

${valueToChar(qDigit)} time(s)

Subtract:
${previousCurrent} - ${product}

Remainder:
${remainder}

================================
`;

  i++;

}

/* ================================
CLEANUP QUOTIENT
================================ */

quotient =
  quotient.replace(/^0+(?!\.)/,'');

if(
  quotient.startsWith('.')
){

  quotient =
    '0' + quotient;

}

if(quotient === ''){

  quotient = '0';

}

/* ================================
HEADER
================================ */

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
FINAL OUTPUT
================================ */

return {

  result:
    quotient,

  visual: `Base ${base} Decimal Division:\n${a} ÷ ${b} →\n
${divisionVisual}
${'-'.repeat(width)}
Quotient: ${spaced(quotient)}
Remainder: ${spaced(current || '0')}
${'-'.repeat(width)}
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

  const hasDecimalInput =
  a.includes('.')
  ||
  b.includes('.');

if(hasDecimalInput){

  return divideInBaseDecimal(
    a,
    b,
    base
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



/* ================================
LONG DIVISION
================================ */

let quotient = '';

let current = '';
let steps = [];



   

 
for(let i=0;i<a.length;i++){

  current += a[i];
let rawCurrent = current;
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

steps.push({

  rawCurrent,
  displayCurrent: current,

  current,

  qDigit: valueToChar(qDigit),

  currentStart:
    i - current.length + 1,

  displayProduct:
    product.padStart(current.length, '0'),

 displayRemainder:
  remainder.padStart(current.length, '0'),

nextCurrent:
  removeLeadingZeros(remainder),

  product,

  remainder

});

    
/* ================================
UPDATE CURRENT
================================ */

current =
  remainder;

 }

 

/* ================================
REMOVE LEADING ZEROS
================================ */

quotient =
  removeLeadingZeros(quotient);

if (!quotient || /^0+$/.test(quotient)) {

  quotient = '0';

}


/* =========================================
VISUAL LONG DIVISION
========================================= */

let divisionVisual = '';

const header =
  `${spaced(b)} ) ${spaced(a)} ( ${spaced(quotient)}`;

divisionVisual += header + '\n';

let started = false;

for(let i = 0; i < steps.length; i++){

  const step =
    steps[i];

 const currentText =
  spaced(step.displayCurrent);

  const qDigit =
    charToValue(step.qDigit);

const productText =
  spaced(step.displayProduct);

 let nextValue =
     step.remainder || '0'
  ;

/*
Bring down digits until
value becomes >= divisor
*/

let nextIndex =
  step.currentStart
  + step.current.length;

while(nextIndex < a.length){

  if(nextValue === '0'){

    nextValue =
      '0' + a[nextIndex];

  }else{

    nextValue += a[nextIndex];

  }

  nextIndex++;

  /*
  Stop after first brought-down
  digit for zero quotient step
  */

  break;

}

let visualNext =
  step.nextCurrent || '0';

let bringIndex =
  step.currentStart
  + step.current.length;

if(bringIndex < a.length){

  visualNext += a[bringIndex];

}

visualNext =
  removeLeadingZeros(visualNext);

const remainderText =
  spaced(visualNext);
  /*
  Skip useless leading zero stages
  */

  /*
Skip only leading useless zeros
*/

if(!started && qDigit === 0){

  continue;

}

started = true;

/*
If quotient digit is 0,
show ONLY the brought-down number
without subtraction rows
*/

 const position =
  spaced(a.slice(0, step.currentStart)).length;

const baseOffset =
  spaced(b).length + 3;

const productIndent =
  baseOffset
  + position
  + currentText.length
  - productText.length;


if(qDigit === 0){

 const zeroText =
  spaced(
    step.displayRemainder +
    a[
      step.currentStart +
      step.current.length
    ]
  );

  const zeroIndent =
    productIndent;

  /*
  Find next brought-down value
  */

let nextValue =
  step.nextCurrent || '0';

  let nextIndex =
    step.currentStart
    + step.current.length;

  while(
    nextIndex < a.length &&
    compareBaseNumbers(
      nextValue || '0',
      b
    ) < 0
  ){

    

  nextValue += a[nextIndex];



    nextIndex++;

  }

  divisionVisual +=
`${' '.repeat(zeroIndent)}${zeroText}
${' '.repeat(zeroIndent)}${'-'.repeat(
  Math.max(
    zeroText.length,
    3
  )
)}
${' '.repeat(
  zeroIndent +
  zeroText.length -
  spaced(nextValue).length
)}${spaced(nextValue)}
`;

  continue;

}


const lineLength =
  Math.max(
    productText.length,
    3
  );

const remainderIndent =
  productIndent +
  currentText.length -
  remainderText.length;

divisionVisual +=
`${' '.repeat(productIndent)}${productText}
${' '.repeat(productIndent)}${'-'.repeat(lineLength)}
${' '.repeat(remainderIndent)}${remainderText}
`;

}

  
/* ================================
FINAL WIDTH
================================ */

const width =
  Math.max(
    divisionVisual
      .split('\n')
      .reduce(
        (m,l)=>Math.max(m,l.length),
        0
      ),
    30
  );

 
/* ================================
FINAL VISUAL
================================ */

return {

  result:
    quotient,

  
visual: `Base ${base} Division:\n${a} ÷ ${b} →\n
${divisionVisual}
${'-'.repeat(width)}
Quotient: ${spaced(quotient)}
Remainder: ${spaced(current || '0')}
${'-'.repeat(width)}
`

};

}











//#region CPU Process

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


//#endregion









function toggleBinaryMode(mode){

  const conversion =
    document.getElementById(
      'binaryConversionGroup'
    );

  const arithmetic =
    document.getElementById(
      'binaryArithmeticGroup'
    );

  if(mode === 'conversion'){

    conversion.style.display =
      'block';

    arithmetic.style.display =
      'none';

    document
      .getElementById(
        'binaryConvertInput'
      )
      .focus();

  }

  else{

    conversion.style.display =
      'none';

    arithmetic.style.display =
      'block';

    document
      .getElementById(
        'binaryNum1'
      )
      .focus();

  }

}








/* =========================================
DECIMAL TAB TOGGLE
========================================= */

function toggleOctalMode(mode){

  const conversion =
    document.getElementById(
      'octalConversionGroup'
    );

  const arithmetic =
    document.getElementById(
      'octalArithmeticGroup'
    );

  if(mode === 'conversion'){

    conversion.style.display =
      'block';

    arithmetic.style.display =
      'none';

    document
      .getElementById(
        'octalConvertInput'
      )
      .focus();

  }

  else{

    conversion.style.display =
      'none';

    arithmetic.style.display =
      'block';

    document
      .getElementById(
        'octalNum1'
      )
      .focus();

  }

}


function toggleDecimalMode(mode){

  const conversion =
    document.getElementById(
      'decimalConversionGroup'
    );

  const arithmetic =
    document.getElementById(
      'decimalArithmeticGroup'
    );

  if(mode === 'conversion'){

    conversion.style.display =
      'block';

    arithmetic.style.display =
      'none';
document
    .getElementById('decimalConvertInput')
    .focus();
  }

  else{

    conversion.style.display =
      'none';

    arithmetic.style.display =
      'block';

      document
    .getElementById('decimalNum1')
    .focus();

  }

  
 
}























function onesComplementBinary(value){

  return value
    .split('')
    .map(
      ch =>
        ch === '.'
          ? '.'
          : (1 - parseInt(ch))
    )
    .join('');

}

function twosComplementBinary(value){

  const oneComp =
    onesComplementBinary(value);

  const increment =
    value.includes('.')
      ? '0.' +
        '0'.repeat(
          value.split('.')[1].length - 1
        ) +
        '1'
      : '1';

  return addInBase(
    oneComp,
    increment,
    2
  ).result;

}






//#region Binary Arithmetic and Conversion


function isBinaryNumber(value){

  return /^-?[01]+(\.[01]+)?$/.test(value);

}

function findBinaryConversion(){

  let value =
    document.getElementById(
      'binaryConvertInput'
    ).value.trim();

  const type =
    document.getElementById(
      'binaryConvertType'
    ).value;

  const resultDiv =
    document.getElementById(
      'globalResult'
    );

  const stepsDiv =
    document.getElementById(
      'globalSteps'
    );

  if(!isBinaryNumber(value)){

    resultDiv.innerHTML =
      '❌ Invalid Binary Number';

    stepsDiv.innerHTML = '';

    return;

  }

  const isNegative =
    value.startsWith('-');

  const absValue =
    value.replace(/^-/,'');

  let result = '';
  let steps = '';

  switch(type){

    case 'Decimal':

      result =
        convertToDecimal(
          absValue,
          2
        );

      if(isNegative)
        result = '-' + result;

      steps =
        generateAnyToDecimalSteps(
          absValue,
          2
        );


         if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the result)

${steps}

Final Answer = -${result.replace('-','')}`;

}


      break;

    case 'Octal':

      result =
        convertFromDecimal(
          convertToDecimal(
            absValue,
            2
          ),
          8
        );

      if(isNegative)
        result = '-' + result;

      steps =
        generateBinaryGroupingSteps(
          absValue,
          8
        );

         if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the result)

${steps}

Final Answer = -${result.replace('-','')}`;

}


      break;

    case 'Hexadecimal':

      result =
        convertFromDecimal(
          convertToDecimal(
            absValue,
            2
          ),
          16
        );

      if(isNegative)
        result = '-' + result;

      steps =
        generateBinaryGroupingSteps(
          absValue,
          16
        );


         if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the result)

${steps}

Final Answer = -${result.replace('-','')}`;

}

      break;

case "1s complement":
let ovalue1 = value;
value = absValue;
result =
  value
    .split('')
    .map(
      b => b === '.'
        ? '.'
        : 1 - parseInt(b)
    )
    .join('');

const onesMask =
  value.replace(/[01]/g,'1');

steps =
`Finding 1's Complement of ${value} →

Step 1: Subtract all bits from 1
--------------------------------

  ${onesMask.split('').join(' ')}
- ${value.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${result.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
`;

if(isNegative){

  steps =
`Input Number = ${ovalue1}
(Please Note: 1's Complement representation of a negative decimal number is obtained by finding the 1's Complement of its magnitude.)
Magnitude = ${absValue}

${steps}
`;

}

break;

case "2s complement":

let ovalue2 = value;
value = absValue;
const oneComp =
  value
    .split('')
    .map(
      b => b === '.'
        ? '.'
        : 1 - parseInt(b)
    )
    .join('');

const increment =
  value.includes('.')
    ? '0.' +
      '0'.repeat(
        value.split('.')[1].length - 1
      ) +
      '1'
    : '1';

const addRes =
  addInBase(
    oneComp,
    increment,
    2
  );

result =
  addRes.result;

const onesMask2 =
  value.replace(/[01]/g,'1');

const displayIncrement =
  increment.padStart(
    oneComp.length,
    ' '
  );

steps =
`Finding 2's Complement of ${value} →

Step 1: Subtract all bits from 1
--------------------------------

  ${onesMask2.split('').join(' ')}
- ${value.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${oneComp.split('').join(' ')}

Step 2: Add 1 to the LSB (Least Significant Bit)
------------------------------------------------

  ${oneComp.split('').join(' ')}
+ ${displayIncrement.split('').join(' ')}
${'-'.repeat(
  Math.max(
    oneComp.length,
    increment.length
  ) * 2 + 2
)}
  ${result.split('').join(' ')}
${'-'.repeat(
  Math.max(
    oneComp.length,
    increment.length
  ) * 2 + 2
)}
`;


if(isNegative){

  steps =
`Input Number = ${ovalue2}
(Please Note: 2's Complement representation of a negative decimal number is obtained by finding the 2's Complement of its magnitude.)
Magnitude = ${absValue}

${steps}
`;

}
break;



case 'BCD (Binary Coded Decimal)':{


value = absValue;
  const decimal =
    convertToDecimal(
      value,
      2
    ).toString();

  let bcd = '';

  let bcdSteps =
`BCD Representation of ${value}₂ →

Step 1: Convert Binary to Decimal
---------------------------------
${value}₂ = ${decimal}₁₀

Step 2: Separate each decimal digit from left to right
------------------------------------------------------
`;

  let arr = [];

  for(let d of decimal){

    if(d === '.')
      continue;

    arr.push(d);

  }

  bcdSteps += arr.join(', ');

  bcdSteps +=
`

Step 3: Find 4-bit binary code (nibble) of each digit
-----------------------------------------------------
`;

  for(let d of decimal){

    if(d === '.'){

      bcd += '. ';

      bcdSteps +=
`Decimal Point(.)\n`;

      continue;

    }

    const code =
      parseInt(d)
      .toString(2)
      .padStart(4,'0');

    bcd += code + ' ';

    bcdSteps +=
`Digit ${d} → ${code}
`;

  }

  result =
    bcd.trim();

  steps =
`${bcdSteps}
Step 4: Combine all the 4-bit nibbles side-by-side
--------------------------------------------------
${result}
--------------------------------------------------
`;


if(isNegative)
  result = '1101     ' + result;

if(isNegative){

  steps =
`Input Number = -${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its BCD form and prefix '1101' as sign block (Packed Style) to the result)

${steps}
Final Answer = ${result}`;

}

  break;
}



case 'Excess 3':{

value = absValue;

  const decimal =
    convertToDecimal(
      value,
      2
    ).toString();

  let excess3 = '';

  let excessSteps =
`Excess-3 Representation of ${value}₂ →

Step 1: Convert Binary to Decimal
---------------------------------
${value}₂ = ${decimal}₁₀

Step 2: Separate each decimal digit from left to right
------------------------------------------------------
`;

  let digits = [];

  for(let d of decimal){

    if(d === '.')
      continue;

    digits.push(d);

  }

  excessSteps += digits.join(', ');

  excessSteps +=
`

Step 3: Add 3 to each digit (Excess-3 form)
-------------------------------------------
`;

  let excessDigits = [];

  for(let d of decimal){

    if(d === '.')
      continue;

    const digit =
      parseInt(d);

    const digitPlus3 =
      digit + 3;

    excessDigits.push(
      digitPlus3
    );

    excessSteps +=
`Digit ${digit} in Excess-3 form → ${digit} + 3 = ${digitPlus3}
`;

  }

  excessSteps +=
`\nExcess-3 digits are:\n${excessDigits.join(', ')}`;

  excessSteps +=
`

Step 4: Find 4-bit binary code (nibble) of each Excess-3 digit
--------------------------------------------------------------
`;

  for(let d of decimal){

    if(d === '.'){

      excess3 += '. ';

      excessSteps +=
`Decimal Point(.)\n`;

      continue;

    }

    const digit =
      parseInt(d);

    const digitPlus3 =
      digit + 3;

    const code =
      digitPlus3
      .toString(2)
      .padStart(4,'0');

    excess3 +=
      code + ' ';

    excessSteps +=
`Digit ${digitPlus3} → ${code}
`;

  }

  result =
    excess3.trim();

  steps =
`${excessSteps}
Step 5: Combine all the 4-bit nibbles side-by-side
--------------------------------------------------
${result}
--------------------------------------------------
`;


if(isNegative)
  result = '1101     ' + result;

if(isNegative){

  steps =
`Input Number = -${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its Excess-3 form and prefix '1101' as sign block (Packed Style) to the result)

${steps}
Final Answer = ${result}`;

}
  break;
}

case 'Gray':

let binary =
  absValue;

/* Ensure at least one extra fractional position
   so right-shifted fractional bits are preserved */

if(binary.includes('.')){

  const parts =
    binary.split('.');

  binary =
    parts[0] +
    '.' +
    parts[1] +
    '0';

}

const bits =
  binary.replace('.','');

let shifted =
  '0' +
  bits.slice(0,-1);

let grayBits = '';

let graySteps =
`Binary to Gray Conversion of ${value} →

Step 1: Take the Binary Number
------------------------------
${binary}₂

Step 2: Shift Binary Right by 1 Bit
-----------------------------------
${bits}
${shifted}

Step 3: XOR corresponding bits
------------------------------
`;

for(
  let i = 0;
  i < bits.length;
  i++
){

  const g =
    bits[i] === shifted[i]
      ? '0'
      : '1';

  grayBits += g;

  graySteps +=
`${bits[i]} XOR ${shifted[i]} = ${g}
`;

}

/* Restore binary point */

const pointPos =
  binary.indexOf('.');

let gray;

if(pointPos !== -1){

  gray =
    grayBits.slice(
      0,
      pointPos
    )
    +
    '.'
    +
    grayBits.slice(
      pointPos
    );

}else{

  gray = grayBits;

}

result = gray;

if(isNegative)
  result = '1     ' + result;

steps =
`${graySteps}
Step 4: Combine all Gray bits
-----------------------------
${gray.split('').join(' ')}

-----------------------------
Gray Code = ${gray}
-----------------------------
`;

const grayUnsigned =
  result;

if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its Gray Code form and prefix '1' as sign bit to the result)

${steps}
Final Answer = ${grayUnsigned}`;

}

break;






case 'Sign Magnitude':{

  const negative =
    value.startsWith('-');

  const absValue =
    value.replace(/^-/,'');

  const signBit =
    negative ? '1' : '0';

  const isReal =
    absValue.includes('.');

  const parts =
    absValue.split('.');

  const intPart =
    parts[0];

  const fracPart =
    parts[1] || '';

  function signMagnitude(
    totalBits
  ){

    if(!isReal){

      const magBits =
        totalBits - 1;

      if(
        intPart.length >
        magBits
      ){

        return 'Overflow';

      }

      return (
        signBit +
        intPart.padStart(
          magBits,
          '0'
        )
      );

    }

    const intBits =
      Math.floor(
        (totalBits - 1) / 2
      );

    const fracBits =
      totalBits - 1 - intBits;

    if(
      intPart.length >
      intBits
    ){

      return 'Overflow';

    }

    return (
      signBit
      + ' '
      + intPart.padStart(
          intBits,
          '0'
        )
      + ' '
      + fracPart.padEnd(
          fracBits,
          '0'
        )
        .slice(
          0,
          fracBits
        )
    );

  }

  const sm8 =
    signMagnitude(8);

  const sm16 =
    signMagnitude(16);

  const sm32 =
    signMagnitude(32);

  const sm64 =
    signMagnitude(64);

  result =
`<br>8-bit  : ${sm8}<br>
16-bit : ${sm16}<br>
32-bit : ${sm32}<br>`;

  steps =
`Sign Magnitude Representation of ${value}

Step 1: Determine Sign Bit
--------------------------
${negative
  ? 'Negative Number → Sign Bit = 1'
  : 'Positive Number → Sign Bit = 0'}

Step 2: Find Magnitude
----------------------
|${value}| = ${absValue}

Step 3: Binary Magnitude
------------------------
Integer Part:
${intPart}
${
  isReal
  ?
`Fractional Part:
${fracPart}`
  : ''
}

Step 4: Sign Magnitude Representation
-------------------------------------
8-bit  : ${sm8}
16-bit : ${sm16}
32-bit : ${sm32}
${
  isReal
  ?
`
Please Note:
8-bit  = 1 Sign + 3 Integer + 4 Fraction
16-bit = 1 Sign + 7 Integer + 8 Fraction
32-bit = 1 Sign + 15 Integer + 16 Fraction`
  :
`
Please Note:
8-bit  = 1 Sign + 7 Magnitude
16-bit = 1 Sign + 15 Magnitude
32-bit = 1 Sign + 31 Magnitude`
}
`;

  break;

}




case 'Fixed Point':{

  const negative =
    value.startsWith('-');

  const absValue =
    value.replace(/^-/,'');

  const parts =
    absValue.split('.');

  const intPart =
    parts[0];

  const fracPart =
    parts[1] || '';

  function fixedPoint(
    intBits,
    fracBits
  ){

    if(
      intPart.length >
      intBits
    ){

      return 'Overflow';

    }

    const intBinary =
      intPart.padStart(
        intBits,
        '0'
      );

    const fracBinary =
      fracPart
        .padEnd(
          fracBits,
          '0'
        )
        .slice(
          0,
          fracBits
        );

    return (
      (negative ? '-' : '')
      +
      intBinary
      +
      '.'
      +
      fracBinary
    );

  }

  const fp8 =
    fixedPoint(4,4);

  const fp16 =
    fixedPoint(8,8);

  const fp32 =
    fixedPoint(16,16);

  result =
`<br>8-bit  : ${fp8}<br>
16-bit : ${fp16}<br>
32-bit : ${fp32}<br>`;

  steps =
`Fixed Point Representation of ${value}

Step 1: Separate Integer and Fraction Parts
-------------------------------------------
Integer Part  = ${intPart}
Fraction Part = ${fracPart || '0'}

Step 2: Binary Number
---------------------
${absValue}

Step 3: Fixed Point Representations
-----------------------------------
8-bit  (4 Integer + 4 Fraction)
${fp8}

16-bit (8 Integer + 8 Fraction)
${fp16}

32-bit (16 Integer + 16 Fraction)
${fp32}

Please Note:
-------------
Fixed Point uses a fixed location for the radix point.
Unlike IEEE Floating Point, the radix point never moves.
`;

  break;

}



case 'Mantissa Exponent':{

  const negative =
    value.startsWith('-');

  const absValue =
    value.replace(/^-/,'');

  if(
    absValue === '0' ||
    absValue === '0.0'
  ){

    result = '0 × 2^0';

    steps =
`Mantissa-Exponent Form

0 has no normalization.

Answer = 0 × 2^0`;

    break;

  }

  const binary =
    absValue;

  let exponent = 0;

  let mantissa = '';

  if(binary.includes('.')){

    const parts =
      binary.split('.');

    if(parts[0] !== '0'){

      exponent =
        parts[0].length - 1;

      mantissa =
        '1.' +
        parts[0].slice(1) +
        parts[1];

    }

    else{

      const firstOne =
        parts[1].indexOf('1');

      exponent =
        -(firstOne + 1);

      mantissa =
        '1.' +
        parts[1].slice(
          firstOne + 1
        );

    }

  }

  else{

    exponent =
      binary.length - 1;

    mantissa =
      '1.' +
      binary.slice(1);

  }

  const sign =
    negative ? '-' : '';

  result =
`${sign}${mantissa} × 2^${exponent}`;

  steps =
`Mantissa-Exponent Form of ${value}

Step 1: Take the Binary Number
------------------------------
${binary}

Step 2: Normalize Binary Number
-------------------------------
${result}

Mantissa = ${sign}${mantissa}
Exponent = ${exponent}`;

  break;

}


case 'IEEE-754 Floating Point (32-bit)':{

  const negative =
    value.startsWith('-');

  const absValue =
    value.replace(/^-/,'');

  const decimalValue =
    convertToDecimal(
      absValue,
      2
    );

  const num =
    negative
      ? -decimalValue
      : decimalValue;

  const buffer =
    new ArrayBuffer(4);

  const view =
    new DataView(buffer);

  view.setFloat32(
    0,
    num
  );

  let bits = '';

  for(let i=0;i<4;i++){

    bits +=
      view
        .getUint8(i)
        .toString(2)
        .padStart(8,'0');

  }

  const sign =
    bits[0];

  const exponent =
    bits.slice(1,9);

  const mantissa =
    bits.slice(9);

  result =
`${sign} ${exponent} ${mantissa}`;

  steps =
`IEEE-754 Single Precision (32-bit)

Step 1: Convert Binary to Decimal
---------------------------------
${value}₂ = ${num}₁₀

Step 2: IEEE-754 Fields
-----------------------

Sign Bit
--------
${sign}

Exponent
--------
${exponent}

Mantissa
--------
${mantissa}

Final Representation
--------------------
${result}`;

  break;

}




case 'IEEE-754 Floating Point (64-bit)':{

  const negative =
    value.startsWith('-');

  const absValue =
    value.replace(/^-/,'');

  const decimalValue =
    convertToDecimal(
      absValue,
      2
    );

  const num =
    negative
      ? -decimalValue
      : decimalValue;

  const buffer =
    new ArrayBuffer(8);

  const view =
    new DataView(buffer);

  view.setFloat64(
    0,
    num
  );

  let bits = '';

  for(let i=0;i<8;i++){

    bits +=
      view
        .getUint8(i)
        .toString(2)
        .padStart(8,'0');

  }

  const sign =
    bits[0];

  const exponent =
    bits.slice(1,12);

  const mantissa =
    bits.slice(12);

  result =
`${sign} ${exponent} ${mantissa}`;

  steps =
`IEEE-754 Double Precision (64-bit)

Step 1: Convert Binary to Decimal
---------------------------------
${value}₂ = ${num}₁₀

Step 2: IEEE-754 Fields
-----------------------

Sign Bit
--------
${sign}

Exponent
--------
${exponent}

Mantissa
--------
${mantissa}

Final Representation
--------------------
${result}`;

  break;

}
  }

  resultDiv.innerHTML =
    `Answer: ${result}`;

  stepsDiv.textContent =
    steps;
}

function binaryToTwosComplement(
  binary,
  width
){

  const abs =
    binary.replace('-','');

  const padded =
    abs.padStart(
      width,
      '0'
    );

  const oneComp =
    onesComplementBinary(
      padded
    );

  const twoComp =
    addInBase(
      oneComp,
      '1',
      2
    ).result;

  if(
  twoComp.length > width
){
  return twoComp.slice(1);
}

return twoComp;

}
function prepareSignedBinary(
  num1,
  num2
){

  const bits1 =
    num1.replace('-','')
      .replace('.','')
      .length;

  const bits2 =
    num2.replace('-','')
      .replace('.','')
      .length;

  let width =
  Math.max(
    bits1,
    bits2
  );

if(width <= 8){

  width = 8;

}
else if(width <= 16){

  width = 16;

}
else if(width <= 32){

  width = 32;

}
else{

  width =
    Math.ceil(width / 8) * 8;

}

  let a = num1;
  let b = num2;

  let note = '';

  if(num1.startsWith('-')){

  const abs =
    num1.replace('-','');

  const padded =
    abs.padStart(
      width,
      '0'
    );

  const oneComp =
    onesComplementBinary(
      padded
    );

  const addOne =
    addInBase(
      oneComp,
      '1',
      2
    );

  const tc =
    binaryToTwosComplement(
      num1,
      width
    );

  note += `Input 1 is negative → ${num1}
Therefore, convert to its 2s Complement form (in ${width} bits):
a) Find 1s Complement:
${padded} → ${oneComp}
b) Add 1: ${addOne.visual}

2s Complement Form:
${tc}
`;

  a = tc;

}

if(num2.startsWith('-')){

  const abs =
    num2.replace('-','');

  const padded =
    abs.padStart(
      width,
      '0'
    );

  const oneComp =
    onesComplementBinary(
      padded
    );

  const addOne =
    addInBase(
      oneComp,
      '1',
      2
    );

  const tc =
    binaryToTwosComplement(
      num2,
      width
    );

  note +=
`Input 2 is negative → ${num2}
Therefore, convert to its 2s Complement form (in ${width} bits):
a) Find 1s Complement:
${padded} → ${oneComp}
b) Add 1: ${addOne.visual}

2s Complement Form:
${tc}
`;

  b = tc;

}

  return {
    a,
    b,
    width,
    note
  };

}

function alignBinaryNumbers(a,b){

  const aParts = a.split('.');
  const bParts = b.split('.');

  const aInt  = aParts[0];
  const bInt  = bParts[0];

  const aFrac = aParts[1] || '';
  const bFrac = bParts[1] || '';

  const intLen =
    Math.max(
      aInt.length,
      bInt.length
    );

  const fracLen =
    Math.max(
      aFrac.length,
      bFrac.length
    );

  const alignedA =
    aInt.padStart(intLen,'0')
    +
    (fracLen
      ? '.' + aFrac.padEnd(fracLen,'0')
      : '');

  const alignedB =
    bInt.padStart(intLen,'0')
    +
    (fracLen
      ? '.' + bFrac.padEnd(fracLen,'0')
      : '');

  return {
    a: alignedA,
    b: alignedB
  };

}
function findBinaryArithmetic(){

  const num1 =
    document.getElementById(
      'binaryNum1'
    ).value.trim();

  const num2 =
    document.getElementById(
      'binaryNum2'
    ).value.trim();

  const operation =
    document.getElementById(
      'binaryOperation'
    ).value;

  const resultDiv =
    document.getElementById(
      'globalResult'
    );

  const stepsDiv =
    document.getElementById(
      'globalSteps'
    );




    const unaryOps = [
  'Bitwise NOT (~)'
];

if(
  unaryOps.includes(operation)
){

  if(!isBinaryNumber(num1)){

    resultDiv.innerHTML =
      '❌ Invalid Binary Number';

    stepsDiv.innerHTML = '';

    return;

  }

}
else{

  if(!isBinaryNumber(num1)){

    resultDiv.innerHTML =
      '❌ Invalid Binary Number';

    stepsDiv.innerHTML = '';

    return;

  }

  /*
  Shift operations use decimal count
  */

  const shiftOps = [

    'Left Shift (<<)',

    'Right Shift (>>)',

    'Zero Fill Right Shift (>>>)'

  ];

  if(
    shiftOps.includes(operation)
  ){

    if(!isDecimalNumber(num2)){

      resultDiv.innerHTML =
        '❌ Invalid Shift Count';

      stepsDiv.innerHTML = '';

      return;

    }

  }
  else{

    if(!isBinaryNumber(num2)){

      resultDiv.innerHTML =
        '❌ Invalid Binary Number';

      stepsDiv.innerHTML = '';

      return;

    }

  }

}

  let result = '';
  let steps = '';

  switch(operation){

    /* ============================
       ADDITION
    ============================ */

    case 'Addition':{

      const neg1 =
        num1.startsWith('-');

      const neg2 =
        num2.startsWith('-');

      const abs1 =
        num1.replace('-','');

      const abs2 =
        num2.replace('-','');

      if(neg1 === neg2){

        const add =
          addInBase(
            abs1,
            abs2,
            2
          );

        result =
          neg1
            ? '-' + add.result
            : add.result;

        steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1:
-------
Both input numbers have the same sign. Therefore, we find: ${abs1} + ${abs2} and apply ${neg1 ? '(-)' : '(+)'} sign to the answer.

Step 2:
-------
${add.visual}

Step 3:
-------
Apply ${neg1 ? '(-)' : '(+)'} sign.

Answer = ${result}
`;
      }

      else{

        const d1 =
          convertToDecimal(
            abs1,
            2
          );

        const d2 =
          convertToDecimal(
            abs2,
            2
          );

        let big =
          abs1;

        let small =
          abs2;

        let resultNegative =
          neg1;

        if(d2 > d1){

          big =
            abs2;

          small =
            abs1;

          resultNegative =
            neg2;

        }

        const sub =
          subtractInBase(
            big,
            small,
            2
          );

        result =
          resultNegative
            ? '-' + sub.result
            : sub.result;

        steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1:
-------
The input numbers have different signs. Therefore, addition is converted into subtraction. We find: ${big} - ${small} and apply sign ${resultNegative ? '(-)' : '(+)'} of the larger magnitude number.

Step 2:
-------
${sub.visual}

Step 3:
-------
Apply ${resultNegative ? '(-)' : '(+)'} sign.

Answer = ${result}`;
      }

      break;
    }

    /* ============================
       SUBTRACTION
    ============================ */

    case 'Subtraction':{

      const neg1 =
        num1.startsWith('-');

      const neg2 =
        num2.startsWith('-');

      const abs1 =
        num1.replace('-','');

      const abs2 =
        num2.replace('-','');




        let explanation = '';

if(neg2){

  explanation =
`The 2nd input number ${num2} is negative. Therefore:
${num1} - (${num2}) = ${abs1} + ${abs2}`;
}
else{
  explanation = `The 1st input number ${num1} is negative. Therefore:
${num1} - ${num2} = -(${abs1} + ${abs2})`;
}



      if(neg1 !== neg2){

        const add =
          addInBase(
            abs1,
            abs2,
            2
          );

        result =
          neg1
            ? '-' + add.result
            : add.result;

        steps =
`Input Number 1 = ${num1}
Input Number 2 = ${num2}

Step 1:
-------
${explanation}

Step 2:
-------
${add.visual}

Step 3:
-------
Apply ${neg1 ? '(-)' : '(+)'} sign.

Answer = ${result}`;
      }

      else{

        const d1 =
          convertToDecimal(
            abs1,
            2
          );

        const d2 =
          convertToDecimal(
            abs2,
            2
          );

        let big =
          abs1;

        let small =
          abs2;

        let resultNegative =
          false;

        if(d1 >= d2){

          resultNegative =
            neg1;

        }

        else{

          big =
            abs2;

          small =
            abs1;

          resultNegative =
            !neg1;
        }


let sameSignExplanation = '';

if(!neg1 && !neg2){

  sameSignExplanation =
`Both input numbers are positive and ${big} > ${small}:
Therefore, we find:
${big} - ${small} and apply ${resultNegative ? '(-)' : '(+)'} sign to the answer.`;
}

else{

  sameSignExplanation =
`Both input numbers are negative. ${num1} - (${num2}) is evaluated by comparing magnitudes.
Since ${big} > ${small}, therefore, we find: ${big} - ${small} and apply ${resultNegative ? '(-)' : '(+)'} sign to the answer.`;

}


        const sub =
          subtractInBase(
            big,
            small,
            2
          );

        result =
          resultNegative
            ? '-' + sub.result
            : sub.result;

        steps =
`Input Number 1 = ${num1}
Input Number 2 = ${num2}

Step 1:
-------
${sameSignExplanation}

Step 2:
-------
${sub.visual}

Step 3:
-------
Apply
${resultNegative ? '(-)' : '(+)'}
sign.

Answer = ${result}
`;
      }

      break;
    }

    /* ============================
       MULTIPLICATION
    ============================ */

    case 'Multiplication':{

      const neg1 =
        num1.startsWith('-');

      const neg2 =
        num2.startsWith('-');

      const abs1 =
        num1.replace('-','');

      const abs2 =
        num2.replace('-','');

      const negative =
        neg1 !== neg2;

      const mul =
        multiplyInBase(
          abs1,
          abs2,
          2
        );

      result =
        negative
          ? '-' + mul.result
          : mul.result;

steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1: Determine Sign
----------------------
Number 1: ${neg1 ? '(-ve)' : '(+ve)'}
Number 2: ${neg2 ? '(-ve)' : '(+ve)'}
${
negative
? 'Signs are different → Answer will be negative (-ve)'
: 'Signs are same → Answer will be positive (+ve)'
}

Step 2: Multiply Magnitudes
---------------------------
${mul.visual}

Step 3: Apply Sign
------------------
${negative
? 'Apply (-) sign.'
: 'Apply (+) sign.'}

Answer = ${result}
`;
      break;
    }


    case 'Bitwise AND (&)':{

const signedData =
  prepareSignedBinary(
    num1,
    num2
  );

let a =
  signedData.a;

let b =
  signedData.b;

const negativeNote =
  signedData.note;

  const aligned =
  alignBinaryNumbers(
    a,
    b
  );

a = aligned.a;
b = aligned.b;

const width = a.length;

  let resultBits = '';

  for(let i=0;i<width;i++){

    if(
    a[i] === '.'
    &&
    b[i] === '.'
  ){

    resultBits += '.';

    continue;

  }

    resultBits +=
      (
        a[i] === '1'
        &&
        b[i] === '1'
      )
      ? '1'
      : '0';

  }

  result = resultBits;

 steps =
 `Input Number 1 = ${num1}
Input Number 2 = ${num2}
Operation = Bitwise AND (&)

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Align the Binary numbers
---------------------------------
${a}
${b}

Step 2: AND Rule
----------------
1 AND 1 = 1
1 AND 0 = 0
0 AND 1 = 0
0 AND 0 = 0

Step 3: Perform Bitwise AND
---------------------------
  ${a}
& ${b}
${'-'.repeat(width + 2)}
  ${resultBits}

Answer = ${result}
`;


  break;
}

case 'Bitwise OR (|)':{

const signedData =
  prepareSignedBinary(
    num1,
    num2
  );

let a =
  signedData.a;

let b =
  signedData.b;

const negativeNote =
  signedData.note;

const aligned =
  alignBinaryNumbers(
    a,
    b
  );

a = aligned.a;
b = aligned.b;

const width =
  a.length;

let resultBits = '';

for(
  let i = 0;
  i < width;
  i++
){

  if(
    a[i] === '.'
    &&
    b[i] === '.'
  ){

    resultBits += '.';

    continue;

  }

  resultBits +=
    (
      a[i] === '1'
      ||
      b[i] === '1'
    )
    ? '1'
    : '0';

}

result =
  resultBits;

steps =
`Input Number 1 = ${num1}
Input Number 2 = ${num2}
Operation = Bitwise OR (|)

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Align the Binary Numbers
--------------------------------
${a}
${b}

Step 2: OR Rule
---------------
1 OR 1 = 1
1 OR 0 = 1
0 OR 1 = 1
0 OR 0 = 0

Step 3: Perform Bitwise OR
--------------------------
  ${a}
| ${b}
${'-'.repeat(width + 2)}
  ${resultBits}

Answer = ${result}
`;

break;
}

case 'Bitwise XOR (^)':{

const signedData =
  prepareSignedBinary(
    num1,
    num2
  );

let a =
  signedData.a;

let b =
  signedData.b;

const negativeNote =
  signedData.note;

const aligned =
  alignBinaryNumbers(
    a,
    b
  );

a = aligned.a;
b = aligned.b;

const width =
  a.length;

let resultBits = '';

for(
  let i = 0;
  i < width;
  i++
){

  if(
    a[i] === '.'
    &&
    b[i] === '.'
  ){

    resultBits += '.';

    continue;

  }

  resultBits +=
    a[i] === b[i]
      ? '0'
      : '1';

}

result =
  resultBits;

steps =
`Input Number 1 = ${num1}
Input Number 2 = ${num2}
Operation = Bitwise XOR (^)

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Align the Binary Numbers
--------------------------------
${a}
${b}

Step 2: XOR Rule
----------------
1 XOR 1 = 0
1 XOR 0 = 1
0 XOR 1 = 1
0 XOR 0 = 0

Step 3: Perform Bitwise XOR
---------------------------
  ${a}
^ ${b}
${'-'.repeat(width + 2)}
  ${resultBits}

Answer = ${result}
`;

break;
}

case 'Bitwise XNOR':{

const signedData =
  prepareSignedBinary(
    num1,
    num2
  );

let a =
  signedData.a;

let b =
  signedData.b;

const negativeNote =
  signedData.note;

const aligned =
  alignBinaryNumbers(
    a,
    b
  );

a = aligned.a;
b = aligned.b;

const width =
  a.length;

let resultBits = '';

for(
  let i = 0;
  i < width;
  i++
){

  if(
    a[i] === '.'
    &&
    b[i] === '.'
  ){

    resultBits += '.';

    continue;

  }

  resultBits +=
    a[i] === b[i]
      ? '1'
      : '0';

}

result =
  resultBits;

steps =
`Input Number 1 = ${num1}
Input Number 2 = ${num2}
Operation = Bitwise XNOR

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Align the Binary Numbers
--------------------------------
${a}
${b}

Step 2: XNOR Rule
-----------------
1 XNOR 1 = 1
1 XNOR 0 = 0
0 XNOR 1 = 0
0 XNOR 0 = 1

Step 3: Perform Bitwise XNOR
----------------------------
  ${a}
XNOR
  ${b}
${'-'.repeat(width + 2)}
  ${resultBits}

Answer = ${result}
`;

break;
}



case 'Bitwise NAND':{

const signedData =
  prepareSignedBinary(
    num1,
    num2
  );

let a =
  signedData.a;

let b =
  signedData.b;

const negativeNote =
  signedData.note;

const aligned =
  alignBinaryNumbers(
    a,
    b
  );

a = aligned.a;
b = aligned.b;

const width =
  a.length;

let resultBits = '';

for(
  let i = 0;
  i < width;
  i++
){

  if(
    a[i] === '.'
    &&
    b[i] === '.'
  ){

    resultBits += '.';

    continue;

  }

  const andBit =
    (
      a[i] === '1'
      &&
      b[i] === '1'
    )
    ? '1'
    : '0';

  resultBits +=
    andBit === '1'
      ? '0'
      : '1';

}

result =
  resultBits;

steps =
`Input Number 1 = ${num1}
Input Number 2 = ${num2}
Operation = Bitwise NAND

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Align the Binary Numbers
--------------------------------
${a}
${b}

Step 2: NAND Rule
-----------------
1 NAND 1 = 0
1 NAND 0 = 1
0 NAND 1 = 1
0 NAND 0 = 1

Step 3: Perform Bitwise NAND
----------------------------
  ${a}
NAND
  ${b}
${'-'.repeat(width + 2)}
  ${resultBits}

Answer = ${result}
`;

break;
}

case 'Bitwise NOR':{

const signedData =
  prepareSignedBinary(
    num1,
    num2
  );

let a =
  signedData.a;

let b =
  signedData.b;

const negativeNote =
  signedData.note;

const aligned =
  alignBinaryNumbers(
    a,
    b
  );

a = aligned.a;
b = aligned.b;

const width =
  a.length;

let resultBits = '';

for(
  let i = 0;
  i < width;
  i++
){

  if(
    a[i] === '.'
    &&
    b[i] === '.'
  ){

    resultBits += '.';

    continue;

  }

  const orBit =
    (
      a[i] === '1'
      ||
      b[i] === '1'
    )
    ? '1'
    : '0';

  resultBits +=
    orBit === '1'
      ? '0'
      : '1';

}

result =
  resultBits;

steps =
`Input Number 1 = ${num1}
Input Number 2 = ${num2}
Operation = Bitwise NOR

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Align the Binary Numbers
--------------------------------
${a}
${b}

Step 2: NOR Rule
----------------
1 NOR 1 = 0
1 NOR 0 = 0
0 NOR 1 = 0
0 NOR 0 = 1

Step 3: Perform Bitwise NOR
---------------------------
  ${a}
NOR
  ${b}
${'-'.repeat(width + 2)}
  ${resultBits}

Answer = ${result}
`;

break;
}

case 'Bitwise NOT (~)':{

  if(
    !isBinaryNumber(num1)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Binary Number';

    stepsDiv.innerHTML = '';

    return;

  }

  const signedData =
    prepareSignedBinary(
      num1,
      '0'
    );

  let a =
    signedData.a;

  const negativeNote =
    signedData.note;

  let resultBits = '';

  for(let bit of a){

    if(bit === '.'){

      resultBits += '.';

    }
    else if(bit === '0'){

      resultBits += '1';

    }
    else{

      resultBits += '0';

    }

  }

  result =
    resultBits;

  steps =
`Input Number = ${num1}
Operation = Bitwise NOT (~)

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Binary Number Used
--------------------------
${a}

Step 2: NOT Rule
----------------
0 → 1
1 → 0

Step 3: Perform Bitwise NOT
---------------------------
${a}
${'-'.repeat(a.length)}
${resultBits}

Answer = ${result}
`;

  break;
}


case 'Left Shift (<<)':{

  if(!isIntegerNumber(num2) || num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const shift =
    parseInt(num2);

  const signedData =
    prepareSignedBinary(
      num1,
      '0'
    );

  const negativeNote =
    signedData.note;

  const originalBinary =
    signedData.a;

  const shiftedBinary =
    originalBinary +
    '0'.repeat(shift);

  result =
    shiftedBinary;

  steps =
`Input Number = ${num1}
Shift Count = ${shift}
Operation = Left Shift (<<)

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Binary Number Used
--------------------------
${originalBinary}

Step 2: Left Shift
------------------
${originalBinary}
← ${shift} position${shift !== 1 ? 's' : ''}
${shiftedBinary}

(${shift} zero${shift !== 1 ? 's' : ''} appended at LSB)

Step 3: Result
--------------
${shiftedBinary}

Answer = ${shiftedBinary}`;

  break;
}

case 'Right Shift (>>)':{

  if(!isIntegerNumber(num2) || num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const shift =
    parseInt(num2);

  const signedData =
    prepareSignedBinary(
      num1,
      '0'
    );

  const negativeNote =
    signedData.note;

  let binary =
    signedData.a;

  const originalBinary =
    binary;

  const signBit =
    binary[0];

  let shiftedBinary;

  if(
    shift >= binary.length
  ){

    shiftedBinary =
      signBit.repeat(
        binary.length
      );

  }
  else{

    shiftedBinary =
      binary;

    for(
      let i = 0;
      i < shift;
      i++
    ){

      shiftedBinary =
        signBit +
        shiftedBinary.slice(
          0,
          -1
        );

    }

  }

  result =
    shiftedBinary;

  steps =
`Input Number = ${num1}
Shift Count = ${shift}
Operation = Right Shift (>>)

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Binary Number Used
--------------------------
${originalBinary}

Step 2: Arithmetic Right Shift
------------------------------
${originalBinary}
↓ ${shift} position${shift !== 1 ? 's' : ''}
${shiftedBinary}

(MSB / Sign Bit is preserved)

Step 3: Result
--------------
${shiftedBinary}

Answer = ${shiftedBinary}`;

  break;
}

case 'Zero Fill Right Shift (>>>)':{

  if(!isIntegerNumber(num2) || num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const shift =
    parseInt(num2);

  const signedData =
    prepareSignedBinary(
      num1,
      '0'
    );

  const negativeNote =
    signedData.note;

  const originalBinary =
    signedData.a;

  let shiftedBinary =
    originalBinary;

  let shiftSteps = '';

  for(
    let i = 1;
    i <= shift;
    i++
  ){

    shiftedBinary =
      '0' +
      shiftedBinary.slice(
        0,
        -1
      );

    shiftSteps +=
`
Shift ${i}:
${shiftedBinary}
`;

  }

  result =
    shiftedBinary;

  steps =
`Input Number = ${num1}
Shift Count = ${shift}
Operation = Zero Fill Right Shift (>>>)

${negativeNote ? negativeNote + '\n' : ''}
Step 1: Binary Number Used
--------------------------
${originalBinary}

Step 2: Zero Fill Right Shift
-----------------------------
Fill MSB with 0 and discard LSB on every shift.

${shiftSteps}

Step 3: Result
--------------
${shiftedBinary}

Answer = ${shiftedBinary}`;

  break;
}


case 'Subtraction (1s Complement)':{

let signStep = '';

let workingNum1 = num1;
let workingNum2 = num2;

const neg1 =
  num1.startsWith('-');

const neg2 =
  num2.startsWith('-');


  if(neg1 && neg2){

  const abs1 =
    num1.slice(1);

  const abs2 =
    num2.slice(1);

  signStep =
`Step 0: Simplify Signs
----------------------
${num1} - (${num2})

= ${abs2} - ${abs1}

Now apply 1's Complement subtraction.

`;

  workingNum1 = abs2;
  workingNum2 = abs1;

}
else if(!neg1 && neg2){

  const abs2 =
    num2.slice(1);

  const add =
    addInBase(
      num1,
      abs2,
      2
    );

  result =
    add.result;

  steps = `Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${num1} + ${abs2}

${add.visual}

Answer = ${result}
`;

  break;

}
else if(neg1 && !neg2){

  const abs1 =
    num1.slice(1);

  const add =
    addInBase(
      abs1,
      num2,
      2
    );

  result =
    '-' + add.result;

  steps =`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - ${num2} = -(${abs1} + ${num2})

${add.visual}

Answer = ${result}
`;

  break;

}


  const fracLen =
    Math.max(
      (workingNum1.split('.')[1] || '').length,
      (workingNum2.split('.')[1] || '').length
    );

  const intDigits =
    Math.max(
      workingNum1.split('.')[0].length,
      workingNum2.split('.')[0].length
    );


    let paddedN1;

if(fracLen){

  const parts =
    workingNum1.split('.');

  paddedN1 =
    parts[0]
      .padStart(intDigits,'0')
    +
    '.'
    +
    parts[1].padEnd(fracLen,'0');

}
else{

  paddedN1 =
    workingNum1.padStart(
      intDigits,
      '0'
    );

}



  let paddedN2;

  if(fracLen){

    const parts =
      workingNum2.split('.');

    paddedN2 =
      parts[0]
        .padStart(intDigits,'0')
      +
      '.'
      +
      parts[1].padEnd(fracLen,'0');

  }
  else{

    paddedN2 =
      workingNum2.padStart(intDigits,'0');

  }

  const oneComp =
    onesComplementBinary(
      paddedN2
    );

  const addRes =
    addInBase(
      paddedN1,
      oneComp,
      2
    );

  const sum =
    addRes.result;

  let finalStep = '';

  const carry =
    sum.split('.')[0].length >
    intDigits;

  if(carry){

    let withoutCarry;

    if(sum.includes('.')){

      const parts =
        sum.split('.');

      withoutCarry =
        parts[0].slice(1)
        +
        '.'
        +
        parts[1];

    }
    else{

      withoutCarry =
        sum.slice(1);

    }

    const increment =
      fracLen
        ? (
            '0.' +
            '0'.repeat(
              fracLen - 1
            ) +
            '1'
          )
        : '1';

    const finalAdd =
      addInBase(
        withoutCarry,
        increment,
        2
      );

    result =
      finalAdd.result;

    finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D
${withoutCarry}

b) Find E = Add 1 to LSB (Least Significant Bit) of D
${finalAdd.visual}

Answer = ${result}`;

  }
  else{

let magnitude =
  onesComplementBinary(sum);

magnitude =
  magnitude.replace(
    /^0+(?=[01])/,
    ''
  );

if(magnitude.startsWith('.')){
  magnitude = '0' + magnitude;
}

result =
  /^0*\.?0*$/.test(magnitude)
    ? '0'
    : '-' + magnitude;

      const onesForSum =
  sum.replace(/[01]/g,'1');

    finalStep =
`Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 1's Complement of D

  ${onesForSum.split('').join(' ')}
- ${sum.split('').join(' ')}
${'-'.repeat(sum.length * 2 + 2)}
  ${magnitude
    .padStart(sum.length,'0')
    .split('')
    .join(' ')}

b) Add a negative sign to E

Answer = ${result}`;

  }

  steps =
`${signStep}Finding ${paddedN1} - ${paddedN2} using 1's Complement →

Let A = ${paddedN1}
Let B = ${paddedN2}

Step 1: Find C = 1's Complement of B
------------------------------------
  ${paddedN2.replace(/[01]/g,'1').split('').join(' ')}
- ${paddedN2.split('').join(' ')}
${'-'.repeat(paddedN2.length * 2 + 2)}
  ${oneComp.split('').join(' ')}

Step 2: Find D = A + C
----------------------
${addRes.visual}

${finalStep}
`;

  break;

}

case 'Subtraction (2s Complement)':{


let signStep = '';

let workingNum1 = num1;
let workingNum2 = num2;

const neg1 =
  num1.startsWith('-');

const neg2 =
  num2.startsWith('-');

if(neg1 && neg2){

  const abs1 =
    num1.slice(1);

  const abs2 =
    num2.slice(1);

  signStep = `Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${abs2} - ${abs1}
Now apply 2's Complement subtraction.
`;

  workingNum1 = abs2;
  workingNum2 = abs1;

}
else if(!neg1 && neg2){

  const abs2 =
    num2.slice(1);

  const add =
    addInBase(
      num1,
      abs2,
      2
    );

  result =
    add.result;

  steps = `Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${num1} + ${abs2}

${add.visual}

Answer = ${result}
`;

  break;

}
else if(neg1 && !neg2){

  const abs1 =
    num1.slice(1);

  const add =
    addInBase(
      abs1,
      num2,
      2
    );

  result =
    '-' + add.result;

  steps = `Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - ${num2} = -(${abs1} + ${num2})

${add.visual}

Answer = ${result}
`;

  break;

}

  const fracLen =
    Math.max(
      (workingNum1.split('.')[1] || '').length,
      (workingNum2.split('.')[1] || '').length
    );

  const intDigits =
    Math.max(
      workingNum1.split('.')[0].length,
      workingNum2.split('.')[0].length
    );



    let paddedN1;

if(fracLen){

  const parts =
    workingNum1.split('.');

  paddedN1 =
    parts[0]
      .padStart(intDigits,'0')
    +
    '.'
    +
    parts[1].padEnd(fracLen,'0');

}
else{

  paddedN1 =
    workingNum1.padStart(
      intDigits,
      '0'
    );

}



  let paddedN2;

  if(fracLen){

    const parts =
      workingNum2.split('.');

    paddedN2 =
      parts[0]
        .padStart(intDigits,'0')
      +
      '.'
      +
      parts[1].padEnd(fracLen,'0');

  }
  else{

    paddedN2 =
      workingNum2.padStart(intDigits,'0');

  }

  const oneComp =
    onesComplementBinary(
      paddedN2
    );

  const increment =
    fracLen
      ? (
          '0.' +
          '0'.repeat(
            fracLen - 1
          ) +
          '1'
        )
      : '1';

  const twoCompAdd =
    addInBase(
      oneComp,
      increment,
      2
    );
let twoComp =
  twoCompAdd.result;

if(
  twoComp.length >
  paddedN2.length
){

  twoComp =
    twoComp.slice(1);

}

  const addRes =
    addInBase(
      paddedN1,
      twoComp,
      2
    );

  const sum =
    addRes.result;

  let finalStep = '';

  const carry =
    sum.split('.')[0].length >
    intDigits;

  if(carry){

    let withoutCarry;

    if(sum.includes('.')){

      const parts =
        sum.split('.');

      withoutCarry =
        parts[0].slice(1)
        +
        '.'
        +
        parts[1];

    }
    else{

      withoutCarry =
        sum.slice(1);

    }

    result =
      withoutCarry;

    finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D

${withoutCarry}

b) Result is positive
`;

  }
  else{

    const onesForSum =
      sum.replace(
        /[01]/g,
        '1'
      );

    const oneCompSum =
      onesComplementBinary(
        sum
      );

    const twoCompResult =
      addInBase(
        oneCompSum,
        increment,
        2
      );

let magnitude =
  twoCompResult.result;

magnitude =
  magnitude.replace(
    /^0+(?=[01])/,
    ''
  );

if(magnitude.startsWith('.')){
  magnitude = '0' + magnitude;
}

result =
  /^0*\.?0*$/.test(magnitude)
    ? '0'
    : '-' + magnitude;

    finalStep =
`
Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 2's Complement of D

  ${onesForSum
      .split('')
      .join(' ')}

- ${sum
      .split('')
      .join(' ')}

${'-'.repeat(
  sum.length * 2 + 2
)}

  ${oneCompSum
      .split('')
      .join(' ')}

+ ${increment
      .padStart(
        oneCompSum.length,
        ' '
      )
      .split('')
      .join(' ')}

${'-'.repeat(
  oneCompSum.length * 2 + 2
)}

${twoCompResult.result
      .padStart(
        oneCompSum.length,
        '0'
      )
      .split('')
      .join(' ')}

b) Add a negative sign to E: ${result}
`;

  }

  steps =
`${signStep}Finding ${paddedN1} - ${paddedN2} using 2's Complement →

Let A = ${paddedN1}
Let B = ${paddedN2}

Step 1: Find C = 2's Complement of B
------------------------------------
a) Find 1's Complement of B

  ${paddedN2
      .replace(/[01]/g,'1')
      .split('')
      .join(' ')}

- ${paddedN2
      .split('')
      .join(' ')}

${'-'.repeat(
  paddedN2.length * 2 + 2
)}

  ${oneComp
      .split('')
      .join(' ')}

b) Add 1 to LSB

${twoCompAdd.visual}

C = ${twoComp}

Step 2: Find D = A + C
----------------------
${addRes.visual}

D = ${sum}

${finalStep}

Answer = ${result}
`;

  break;

}


  }

  resultDiv.innerHTML =
    `Answer: ${result}`;

  stepsDiv.textContent =
    steps;
}


//#endregion









function updateUnaryOperationUI(
  operationId,
  input1Id,
  input2Id
){

  const operation =
    document.getElementById(
      operationId
    );

  const input1 =
    document.getElementById(
      input1Id
    );

  const input2 =
    document.getElementById(
      input2Id
    );

  if(
    !operation ||
    !input2
  ) return;

  const unaryOperations = [

    'Bitwise NOT (~)'

  ];

  if(
    unaryOperations.includes(
      operation.value
    )
  ){

    input2.disabled = true;

    input2.value = '';

    input2.placeholder =
      'Not Required';

    input2.style.opacity =
      '0.5';

  }

  else{

    input2.disabled = false;

    input2.placeholder =
      '';

    input2.style.opacity =
      '1';

  }
  input1.focus();

}

document
  .getElementById(
    'binaryOperation'
  )
  ?.addEventListener(
    'change',
    () => {

      updateUnaryOperationUI(
        'binaryOperation', 'binaryNum1',
        'binaryNum2'
      );

    }
  );

  document
  .getElementById(
    'decimalOperation'
  )
  ?.addEventListener(
    'change',
    () => {

      updateUnaryOperationUI(
        'decimalOperation', 'decimalNum1',
        'decimalNum2'
      );

    }
  );

document
  .getElementById(
    'octalOperation'
  )
  ?.addEventListener(
    'change',
    () => {

      updateUnaryOperationUI(
        'octalOperation', 'octalNum1',
        'octalNum2'
      );

    }
  );














//#region Decimal Conversions & Arithmetic


function isDecimalNumber(value){

  return /^-?[0-9]+(\.[0-9]+)?$/.test(value);

}

function isIntegerNumber(value){

  return /^-?[0-9]+$/.test(value);

}

function findDecimalConversion(){

  let value =
    document.getElementById(
      'decimalConvertInput'
    ).value.trim();

  const type =
    document.getElementById(
      'decimalConvertType'
    ).value;

  const resultDiv =
    document.getElementById(
      'globalResult'
    );

  const stepsDiv =
    document.getElementById(
      'globalSteps'
    );

  if(!isDecimalNumber(value)){

    resultDiv.innerHTML =
      '❌ Invalid Decimal Number';

    stepsDiv.innerHTML = '';

    return;

  }

  let result = '';
  let steps = '';

  const isNegative =
  value.startsWith('-');

const absValue =
  value.replace(/^[-]/,'');




  switch(type){

    case 'Binary':

      result =
        convertFromDecimal(
          parseFloat(absValue),
          2
        );
        if(isNegative)
  result = '-' + result;

      steps =
        generateDecimalToAnySteps(
          absValue,
          2
        );


        if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the result)

${steps}

Final Answer = -${result.replace('-','')}`;

}
      break;

    case 'Octal':

      result =
        convertFromDecimal(
          parseFloat(absValue),
          8
        );
        if(isNegative)
  result = '-' + result;

      steps =
        generateDecimalToAnySteps(
          absValue,
          8
        );

        if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the result)

${steps}

Final Answer = -${result.replace('-','')}`;

}

      break;

    case 'Hexadecimal':

      result =
        convertFromDecimal(
          parseFloat(absValue),
          16
        );
        if(isNegative)
  result = '-' + result;

      steps =
        generateDecimalToAnySteps(
          absValue,
          16
        );

        if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the result)

${steps}

Final Answer = -${result.replace('-','')}`;

}
      break;

    case '9s complement':
let ovalue9 = value;
value = absValue;
  result =
    value
      .split('')
      .map(
        d => d === '.'
          ? '.'
          : 9 - parseInt(d)
      )
      .join('');

  const nines =
    value.replace(/[0-9]/g,'9');

  steps =
`Finding 9's Complement of ${value} →

Step 1: Subtract all digits from 9
----------------------------------

  ${nines.split('').join(' ')}
- ${value.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${result.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
`;

if(isNegative){

  steps =
`Input Number = ${ovalue9}
(Please Note: 9's Complement representation of a negative decimal number is obtained by finding the 9's Complement of its magnitude.)
Magnitude = ${absValue}

${steps}
`;

}
  break;

case '10s complement':

let ovalue = value;
value = absValue;
  const nineCompResult =
    value
      .split('')
      .map(
        d => d === '.'
          ? '.'
          : 9 - parseInt(d)
      )
      .join('');

  const increment =
    value.includes('.')
      ? '0.' +
        '0'.repeat(
          value.split('.')[1].length - 1
        ) +
        '1'
      : '1';

  const addRes =
    addInBase(
      nineCompResult,
      increment,
      10
    );

  result =
    addRes.result;

  const nines2 =
    value.replace(/[0-9]/g,'9');

  const displayIncrement =
    increment.padStart(
      nineCompResult.length,
      ' '
    );

  steps =
`Finding 10's Complement of ${value} →

Step 1: Subtract all digits from 9
----------------------------------

  ${nines2.split('').join(' ')}
- ${value.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${nineCompResult.split('').join(' ')}

Step 2: Add 1 to the LSD (Least Significant Digit)
--------------------------------------------------

  ${nineCompResult.split('').join(' ')}
+ ${displayIncrement.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${result.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
`;


if(isNegative){

  steps =
`Input Number = ${ovalue}
(Please Note: 10's Complement representation of a negative decimal number is obtained by finding the 10's Complement of its magnitude.)
Magnitude = ${absValue}

${steps}
`;

}
  break;








case 'BCD (Binary Coded Decimal)':

  let bcd = '';
  let bcdSteps =
`BCD Representation of ${absValue} → 

Step 1: Separate each digit from left to right
----------------------------------------------
`;

let arr = [];
for(let d of absValue){
  if(d === '.')
    continue;

  arr.push(d);}

bcdSteps += arr.join(', ');



bcdSteps += 
`

Step 2: Find 4-bit binary code (nibble) of each digit
-----------------------------------------------------
`;

  for(let d of absValue){

    if(d === '.'){

      bcd += '. ';

      bcdSteps +=
`Decimal Point(.)\n`;

      continue;

    }

    const code =
      parseInt(d)
      .toString(2)
      .padStart(4,'0');

    bcd += code + ' ';

    bcdSteps +=
`Digit ${d} → ${code}
`;
  }
  result =
    bcd.trim();

  steps =`${bcdSteps}
Step 3: Combine all the 4-bit nibbles side-by-side
--------------------------------------------------
${result}
--------------------------------------------------
`;


if(isNegative)
  result = '1101     ' + result;

if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its BCD form and prefix '1101' as sign block (Packed Style) to the result)

${steps}
Final Answer = ${result}`;

}

  break;

case 'Excess 3':


  let excess3 = '';

  let excessSteps =
`Excess-3 Representation of ${absValue} →

Step 1: Separate each digit from left to right
----------------------------------------------
`;

  let digits = [];

  for(let d of absValue){

    if(d === '.')
      continue;

    digits.push(d);

  }

  excessSteps += digits.join(', ');

excessSteps +=
`

Step 2: Add 3 to each digit (Excess-3 form)
--------------------------------------------------
`;
  digits = [];

  for(let d of absValue){

    if(d === '.')
      continue;

    digits.push(parseInt(d)+3);

    const digit =
      parseInt(d);

    const digitPlus3 =
      digit + 3;

    const code =
      digitPlus3
      .toString(2)
      .padStart(4,'0');

     excessSteps +=
`Digit ${digit} in Excess-3 form → ${digit} + 3 = ${digitPlus3}\n`

  }

  excessSteps += `\nExcess-3 digits are:\n` + digits.join(', ');


  excessSteps +=
`

Step 3: Find 4-bit binary code (nibble) of each Excess-3 digit
--------------------------------------------------------------
`;

  for(let d of absValue){

    if(d === '.'){

      excess3 += '. ';

      excessSteps +=
`Decimal Point(.)\n`;

      continue;

    }

    const digit =
      parseInt(d);

    const digitPlus3 =
      digit + 3;

    const code =
      digitPlus3
      .toString(2)
      .padStart(4,'0');

    excess3 += code + ' ';

    excessSteps +=
`Digit ${digitPlus3} → ${code}\n`;
  }

  result =
    excess3.trim();

   

  steps =
`${excessSteps}
Step 4: Combine all the 4-bit nibbles side-by-side
--------------------------------------------------
${result}
--------------------------------------------------
`;

 if(isNegative)
  result = '1101     ' + result;

if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its Excess-3 form and prefix '1101' as sign block (Packed Style) to the result)

${steps}
Final Answer = ${result}`;

}

  break;

case 'Gray':

let binary =
  convertFromDecimal(
    absValue,
    2
  );

/* Ensure at least one extra fractional position
   so right-shifted fractional bits are preserved */

if(binary.includes('.')){

  const parts =
    binary.split('.');

  binary =
    parts[0] +
    '.' +
    parts[1] +
    '0';

}

const bits =
  binary.replace('.','');

let shifted =
  '0' +
  bits.slice(0,-1);

let grayBits = '';

let graySteps =
`Decimal to Gray Conversion of ${value} →

Step 1: Convert Decimal to Binary
---------------------------------
${value}₁₀ = ${binary}₂

Step 2: Shift Binary Right by 1 Bit
-----------------------------------
${bits}
${shifted}

Step 3: XOR corresponding bits
------------------------------
`;

for(
  let i = 0;
  i < bits.length;
  i++
){

  const g =
    bits[i] === shifted[i]
      ? '0'
      : '1';

  grayBits += g;

  graySteps +=
`${bits[i]} XOR ${shifted[i]} = ${g}
`;

}

/* Restore binary point */

const pointPos =
  binary.indexOf('.');

let gray;

if(pointPos !== -1){

  gray =
    grayBits.slice(
      0,
      pointPos
    )
    +
    '.'
    +
    grayBits.slice(
      pointPos
    );

}else{

  gray = grayBits;

}

result = gray;
if(isNegative)
  result = '1     ' + result;

steps =
`${graySteps}
Step 4: Combine all Gray bits
-----------------------------
${gray.split('').join(' ')}
-----------------------------
Gray Code = ${gray}
-----------------------------
`;



const grayUnsigned =
  result;

  if(isNegative){

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its Gray Code form and prefix '1' as sign bit to the result)

${steps}
Final Answer = ${grayUnsigned}`;

}



break;












  case 'Sign Magnitude':{

  if(!isDecimalNumber(value)){

    resultDiv.innerHTML =
      '❌ Invalid Decimal Number';

    stepsDiv.innerHTML = '';

    return;

  }

  const num =
    parseFloat(value);

  const signBit =
    num < 0 ? '1' : '0';

  const magnitude =
    Math.abs(num);

  const isReal =
    value.includes('.');

  const intPart =
    Math.floor(magnitude);

  const fracPart =
    magnitude - intPart;

  function fracToBinary(
    frac,
    bits
  ){

    let result = '';

    let f = frac;

    for(
      let i=0;
      i<bits;
      i++
    ){

      f *= 2;

      if(f >= 1){

        result += '1';

        f -= 1;

      }

      else{

        result += '0';

      }

    }

    return result;

  }

  function signMagnitude(
    totalBits
  ){

    if(!isReal){

      const magBits =
        totalBits - 1;

      const binary =
        magnitude
          .toString(2);

      if(
        binary.length >
        magBits
      ){

        return 'Overflow';

      }

      return (
        signBit +
        binary.padStart(
          magBits,
          '0'
        )
      );

    }

    const intBits =
      Math.floor(
        (totalBits - 1) / 2
      );

    const fracBits =
      totalBits - 1 - intBits;

    const intBinary =
      intPart.toString(2);

    if(
      intBinary.length >
      intBits
    ){

      return 'Overflow';

    }

    const fracBinary =
      fracToBinary(
        fracPart,
        fracBits
      );

    return (
      signBit
      + ' '
      + intBinary.padStart(
          intBits,
          '0'
        )
      + ' '
      + fracBinary
    );

  }

  const sm8 =
    signMagnitude(8);

  const sm16 =
    signMagnitude(16);

  const sm32 =
    signMagnitude(32);

  const sm64 =
    signMagnitude(64);

  result =
`<br>8-bit  : ${sm8}<br>
16-bit : ${sm16}<br>
32-bit : ${sm32}<br>`;

  steps =
`Sign Magnitude Representation of ${value}

Step 1: Determine Sign Bit
--------------------------
${num < 0  ? 'Negative Number → Sign Bit = 1'  : 'Positive Number → Sign Bit = 0'}

Step 2: Find Magnitude
----------------------
|${value}| = ${magnitude}

Step 3: Convert Magnitude to Binary
-----------------------------------
Integer Part:
(${intPart})₁₀ = (${intPart.toString(2)})₂
${
  isReal
  ?
`Fractional Part:
(${fracPart})₁₀ =  (${fracToBinary(
        fracPart,
        8
      )})₂`  :''
}

Step 4: Sign Magnitude Representation
-------------------------------------
8-bit  : ${sm8}
16-bit : ${sm16}
32-bit : ${sm32}
${  isReal  ?`
Please Note:
8-bit  = 1 Sign + 3 Integer + 4 Fraction
16-bit = 1 Sign + 7 Integer + 8 Fraction
32-bit = 1 Sign + 15 Integer + 16 Fraction`
  :`
  Please Note:
8-bit  = 1 Sign + 7 Magnitude
16-bit = 1 Sign + 15 Magnitude
32-bit = 1 Sign + 31 Magnitude`
}
`;

  break;

}

case 'Mantissa Exponent':{

  const num =
    parseFloat(value);

  if(num === 0){

    result = '0 × 2^0';

    steps =
`Mantissa-Exponent Form

0 has no normalization.

Answer = 0 × 2^0`;

    break;

  }

  const sign =
    num < 0 ? '-' : '';

  const absNum =
    Math.abs(num);

  const binary =
    convertFromDecimal(
      absNum,
      2
    );

  let exponent = 0;
  let mantissa = '';

  if(binary.includes('.')){

    const parts =
      binary.split('.');

    if(parts[0] !== '0'){

      exponent =
        parts[0].length - 1;

      mantissa =
        '1.' +
        parts[0].slice(1) +
        parts[1];

    }

    else{

      const firstOne =
        parts[1].indexOf('1');

      exponent =
        -(firstOne + 1);

      mantissa =
        '1.' +
        parts[1].slice(firstOne + 1);

    }

  }

  else{

    exponent =
      binary.length - 1;

    mantissa =
      '1.' +
      binary.slice(1);

  }

  result =
`${sign}${mantissa} × 2^${exponent}`;

  steps =
`Mantissa-Exponent Form of ${value}

Step 1: Convert to Binary
-------------------------
${binary}

Step 2: Normalize Binary Number
-------------------------------
${result}

Mantissa = ${sign}${mantissa}
Exponent = ${exponent}`;

  break;

}

case 'IEEE-754 Floating Point (32-bit)':{

  const num =
    parseFloat(value);

  const buffer =
    new ArrayBuffer(4);

  const view =
    new DataView(buffer);

  view.setFloat32(
    0,
    num
  );

  let bits = '';

  for(let i=0;i<4;i++){

    bits +=
      view
        .getUint8(i)
        .toString(2)
        .padStart(8,'0');

  }

  const sign =
    bits[0];

  const exponent =
    bits.slice(1,9);

  const mantissa =
    bits.slice(9);

  result =
`${sign} ${exponent} ${mantissa}`;

  steps =
`IEEE-754 Single Precision (32-bit)

Input = ${value}

Sign Bit
--------
${sign}

Exponent
--------
${exponent}

Mantissa
--------
${mantissa}

Final Representation
--------------------
${result}`;

  break;

}

case 'IEEE-754 Floating Point (64-bit)':{

  const num =
    parseFloat(value);

  const buffer =
    new ArrayBuffer(8);

  const view =
    new DataView(buffer);

  view.setFloat64(
    0,
    num
  );

  let bits = '';

  for(let i=0;i<8;i++){

    bits +=
      view
        .getUint8(i)
        .toString(2)
        .padStart(8,'0');

  }

  const sign =
    bits[0];

  const exponent =
    bits.slice(1,12);

  const mantissa =
    bits.slice(12);

  result =
`${sign} ${exponent} ${mantissa}`;

  steps =
`IEEE-754 Double Precision (64-bit)

Input = ${value}

Sign Bit
--------
${sign}

Exponent
--------
${exponent}

Mantissa
--------
${mantissa}

Final Representation
--------------------
${result}`;

  break;

}


case 'Fixed Point':{

  const num =
    parseFloat(value);

  const negative =
    num < 0;

  const absNum =
    Math.abs(num);

  const intPart =
    Math.floor(absNum);

  const fracPart =
    absNum - intPart;

  function fracToBinary(
    frac,
    bits
  ){

    let result = '';

    let f = frac;

    for(
      let i=0;
      i<bits;
      i++
    ){

      f *= 2;

      if(f >= 1){

        result += '1';

        f -= 1;

      }

      else{

        result += '0';

      }

    }

    return result;

  }

  function fixedPoint(
    intBits,
    fracBits
  ){

 const rawInt =
  intPart.toString(2);

if(
  rawInt.length > intBits
){

  return 'Overflow';

}

const intBinary =
  rawInt.padStart(
    intBits,
    '0'
  );

const fracBinary =
  fracToBinary(
    fracPart,
    fracBits
  );

return (
  (negative ? '-' : '')
  +
  intBinary
  +
  '.'
  +
  fracBinary
);

  }

  const fp8 =
    fixedPoint(4,4);

  const fp16 =
    fixedPoint(8,8);

  const fp32 =
    fixedPoint(16,16);

  result =
`<br>8-bit  : ${fp8}<br>
16-bit : ${fp16}<br>
32-bit : ${fp32}<br>`;

  steps =
`Fixed Point Representation of ${value}

Step 1: Separate Integer and Fraction Parts
-------------------------------------------
Integer Part  = ${intPart}
Fraction Part = ${fracPart}

Step 2: Convert Integer Part to Binary
--------------------------------------
${intPart}₁₀ = ${intPart.toString(2)}₂

Step 3: Convert Fraction Part to Binary
---------------------------------------
${fracPart}₁₀ → ${fracToBinary(fracPart,16)}...

Step 4: Fixed Point Representations
-----------------------------------
8-bit  (4 Integer + 4 Fraction)
${fp8}

16-bit (8 Integer + 8 Fraction)
${fp16}

32-bit (16 Integer + 16 Fraction)
${fp32}

Please Note:
-------------
Fixed Point uses a fixed location for the radix point.
Unlike IEEE Floating Point, the radix point never moves.
`;

  break;

}
  }

  resultDiv.innerHTML =
    `Answer: ${result}`;

  stepsDiv.textContent =
    steps;

}

function findDecimalArithmetic(){

  const num1 =
    document.getElementById(
      'decimalNum1'
    ).value.trim();

  const num2 =
    document.getElementById(
      'decimalNum2'
    ).value.trim();

  const operation =
    document.getElementById(
      'decimalOperation'
    ).value;

  const resultDiv =
    document.getElementById(
      'globalResult'
    );

  const stepsDiv =
    document.getElementById(
      'globalSteps'
    );

if(
  operation ===
  'Bitwise NOT (~)'
){

 }


else{
  if(
    !isDecimalNumber(num1)
    ||
    !isDecimalNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Decimal Number';

    stepsDiv.innerHTML = '';

    return;

  }}

  let result = '';
  let steps = '';

  switch(operation){

    case 'Addition':{

  const n1 =
    parseFloat(num1);

  const n2 =
    parseFloat(num2);

  const abs1 =
    String(Math.abs(n1));

  const abs2 =
    String(Math.abs(n2));

  const neg1 =
    n1 < 0;

  const neg2 =
    n2 < 0;

  
  if(
    neg1 === neg2
  ){

    const add =
      addInBase(
        abs1,
        abs2,
        10
      );

    result =
      neg1
        ? '-' + add.result
        : add.result;

    steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1: 
-------
Both the numbers have same signs. Therefore, we find: ${abs1} + ${abs2}, and apply the (${neg1 ? '-' : '+'}) sign.

Step 2:
-------
${add.visual}

Step 3:
-------
${
  neg1  ? 'Apply (-) sign to the answer.'  : 'Apply (+) sign to the answer.'
}

Answer = ${result}
`;

  }

  else{

    let bigws = n1;
    let big =
      abs1;

    let small =
      abs2;

    let resultNegative =
      neg1;

    if(
      Math.abs(n2)
      >
      Math.abs(n1)
    ){
      bigws = n2;
      big =
        abs2;

      small =
        abs1;

      resultNegative =
        neg2;

    }

    const sub =
      subtractInBase(
        big,
        small,
        10
      );

    result =
      resultNegative
        ? '-' + sub.result
        : sub.result;

    steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1:
-------
The numbers have different signs, so we convert addition into subtraction. Thus, we find: ${big} - ${small} and apply sign (${bigws<0 ? '-' : '+'}) of the larger magnitude ${big}.

Step 2:
-------
${sub.visual}
Step 3:
-------
${
  bigws<0  ? 'Apply (-) sign'  : 'Apply (+) sign' } of the larger magnitude ${big}, to the answer.

Answer = ${result}`;
  
}
break;
    }

case 'Subtraction':{

  const n1 =
    parseFloat(num1);

  const n2 =
    parseFloat(num2);

  const abs1 =
    String(Math.abs(n1));

  const abs2 =
    String(Math.abs(n2));

  const neg1 =
    n1 < 0;

  const neg2 =
    n2 < 0;

  /*
   * A - B
   * =
   * A + (-B)
   */

  let explanation = '';

if(neg2){

  explanation =
`The 2nd input number ${num2} is negative. Therefore, we find:
${num1} - (${num2}) = ${abs1} + ${abs2}`;

}
else{

  explanation =
`The 1st input number ${num1} is negative. Therefore, we find:
${num1} - ${num2} = -(${abs1} + ${abs2})`;

}





  if(
    neg1 !== neg2
  ){

    const add =
      addInBase(
        abs1,
        abs2,
        10
      );

    result =
      neg1
        ? '-' + add.result
        : add.result;

    steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1:
-------
${explanation}

Step 2:
-------
${add.visual}

Step 3:
-------
${
  neg1
  ? 'Apply (-) sign.'  : 'Apply (+) sign.'
}

Answer = ${result}
`;

  }

  else{

    let bigwss = n1;
    let big =
      abs1;

    let small =
      abs2;

    let resultNegative =
      false;

    if(
      Math.abs(n1)
      >=
      Math.abs(n2)
    ){

      resultNegative =
        neg1;

    }

    else{

      bigwss = n2;
      big =
        abs2;

      small =
        abs1;

      resultNegative =
        !neg1;

    }

    let sameSignExplanation = '';

if(!neg1 && !neg2){

  sameSignExplanation =
`Both the input numbers are positive and ${big} > ${small}.
Therefore, we find:
${big} - ${small} and apply ${resultNegative     ? '(-)'    : '(+)'} sign to the answer.`;

}

else{

  sameSignExplanation =
`Both input numbers are negative:
${num1} - (${num2}) = ${num1} + ${abs2}

Now since, ${big} > ${small} we find: 
${big} - ${small} and apply ${resultNegative    ? '(-)'    : '(+)'} sign to the answer.`;

}


    const sub =
      subtractInBase(
        big,
        small,
        10
      );

    result =
      resultNegative
        ? '-' + sub.result
        : sub.result;

    steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1:
-------
${sameSignExplanation}

Step 2:
-------
${sub.visual}
Step 3:
-------
Apply ${resultNegative    ? '(-)'    : '(+)'} sign to the answer.

Answer = ${result}
`;

  }

  break;

}

case 'Multiplication':{

  const n1 =
    parseFloat(num1);

  const n2 =
    parseFloat(num2);

  const abs1 =
    String(
      Math.abs(n1)
    );

  const abs2 =
    String(
      Math.abs(n2)
    );

  const negative =
    (n1 < 0)
    !==
    (n2 < 0);

  const mul =
    multiplyInBase(
      abs1,
      abs2,
      10
    );

  result =
    negative
      ? '-' + mul.result
      : mul.result;

  steps =
`Input Number 1 = ${num1}\nInput Number 2 = ${num2}\n
Step 1: Determine Sign of the Answer
------------------------------------
Number 1: ${n1 < 0 ? '(- ve)' : '(+ ve)'}
Number 2: ${n2 < 0 ? '(- ve)' : '(+ ve)'}
${
  negative
  ? 'Signs are different → Answer will be negative (- ve)'
  : 'Signs are same → Answer will be positive (+ ve)'
}

Step 2: Multiply Magnitudes
---------------------------
${mul.visual}

Step 3: Apply Sign
------------------
Answer = ${result}
`;

  break;

}










case 'Subtraction (91s Complement)':{

  if(
    !isDecimalNumber(num1)
    ||
    !isDecimalNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Decimal Number';

    stepsDiv.innerHTML = '';

    return;

  }

  if(
  num1.startsWith('-')
  ||
  num2.startsWith('-')
){

  resultDiv.innerHTML =
    '❌ Positive numbers only';

  stepsDiv.innerHTML =
    "9's Complement subtraction supports positive numbers only.";

  return;

}

  const fracLen =
    Math.max(
      (num1.split('.')[1] || '').length,
      (num2.split('.')[1] || '').length
    );

  const n1 =
    fracLen
      ? Number(num1).toFixed(fracLen)
      : num1;

  const n2 =
    fracLen
      ? Number(num2).toFixed(fracLen)
      : num2;

  const intDigits =
    Math.max(
      n1.split('.')[0].length,
      n2.split('.')[0].length
    );

  let paddedN2;

  if(fracLen){

    const parts =
      n2.split('.');

    paddedN2 =
      parts[0]
        .padStart(
          intDigits,
          '0'
        )
      +
      '.'
      +
      parts[1];

  }

  else{

    paddedN2 =
      n2.padStart(
        intDigits,
        '0'
      );

  }

  const nineComp =
    paddedN2
      .split('')
      .map(
        ch =>
          ch === '.'
            ? '.'
            : (
                9 -
                parseInt(ch)
              )
      )
      .join('');

  const addRes =
    addInBase(
      n1,
      nineComp,
      10
    );

  const sum9 =
    addRes.result;

  result = '';

  let finalStep = '';

  const carry =
    sum9.split('.')[0].length >
    intDigits;

  if(carry){

    let withoutCarry;

    if(sum9.includes('.')){

      const parts =
        sum9.split('.');

      withoutCarry =
        parts[0].slice(1)
        +
        '.'
        +
        parts[1];

    }

    else{

      withoutCarry =
        sum9.slice(1);

    }

    const increment =
      fracLen
        ? (
            '0.' +
            '0'.repeat(
              fracLen - 1
            ) +
            '1'
          )
        : '1';

    const finalAdd =
      addInBase(
        withoutCarry,
        increment,
        10
      );

    result =
      String(
        parseFloat(
          finalAdd.result
        )
      );

    finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D
${withoutCarry}

b) Find E = Add 1 to LSD of D
${finalAdd.visual}
`;

  }

  else{

    const comp =
      sum9
        .split('')
        .map(
          ch =>
            ch === '.'
              ? '.'
              : (
                  9 -
                  parseInt(ch)
                )
        )
        .join('');

    const ninesForSum =
      sum9.replace(
        /[0-9]/g,
        '9'
      );

    const magnitude =
      parseFloat(comp);

    result =
      magnitude === 0
        ? '0'
        : '-' + magnitude;

    finalStep =
`
Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 9's Complement of D
  ${ninesForSum
      .split('')
      .join(' ')}
- ${sum9
      .split('')
      .join(' ')}
${'-'.repeat(
  sum9.length * 2 + 2
)}
  ${comp
      .split('')
      .join(' ')}
b) Add a negative sign to E: ${result}`;

  }

  steps =
`Finding ${n1} - ${n2} using 9's Complement →

Let A = ${n1}
Let B = ${n2}

Step 1: Find C = 9's Complement of B
------------------------------------
  ${paddedN2
      .replace(/[0-9]/g,'9')
      .split('')
      .join(' ')}
- ${paddedN2
      .split('')
      .join(' ')}
${'-'.repeat(
  paddedN2.length * 2 + 2
)}
  ${nineComp
      .split('')
      .join(' ')}

Step 2: Find D = A + C
----------------------
${addRes.visual}
${finalStep}

Answer = ${result}

`;

  break;

  }


case 'Subtraction (9s Complement)':{

  if(
    !isDecimalNumber(num1)
    ||
    !isDecimalNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Decimal Number';

    stepsDiv.innerHTML = '';

    return;

  }

let signStep = '';

let workingNum1 = num1;
let workingNum2 = num2;

const neg1 =
  num1.startsWith('-');

const neg2 =
  num2.startsWith('-');


  if(neg1 && neg2){

  const abs1 =
    num1.slice(1);

  const abs2 =
    num2.slice(1);

  signStep =
`Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${abs2} - ${abs1}
Now apply 9's Complement subtraction.
`;

  workingNum1 = abs2;
  workingNum2 = abs1;

}
else if(!neg1 && neg2){

  const abs2 =
    num2.slice(1);

  const add =
    addInBase(
      num1,
      abs2,
      10
    );

  result =
    add.result;

  steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${num1} + ${abs2}

${add.visual}

Answer = ${result}
`;

  break;

}
else if(neg1 && !neg2){

  const abs1 =
    num1.slice(1);

  const add =
    addInBase(
      abs1,
      num2,
      10
    );

  result =
    '-' + add.result;

  steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - ${num2} = -(${abs1} + ${num2})

${add.visual}

Answer = ${result}
`;

  break;

}





  const fracLen =
    Math.max(
      (workingNum1.split('.')[1] || '').length,
      (workingNum2.split('.')[1] || '').length
    );

  const n1 =
    fracLen
      ? Number(workingNum1).toFixed(fracLen)
      : workingNum1;

  const n2 =
    fracLen
      ? Number(workingNum2).toFixed(fracLen)
      : workingNum2;

  const intDigits =
    Math.max(
      n1.split('.')[0].length,
      n2.split('.')[0].length
    );


    let paddedN1;

if(fracLen){

  const parts =
    n1.split('.');

  paddedN1 =
    parts[0]
      .padStart(intDigits,'0')
    +
    '.'
    +
    parts[1];

}
else{

  paddedN1 =
    n1.padStart(
      intDigits,
      '0'
    );

}


  let paddedN2;

  if(fracLen){

    const parts =
      n2.split('.');

    paddedN2 =
      parts[0]
        .padStart(
          intDigits,
          '0'
        )
      +
      '.'
      +
      parts[1];

  }

  else{

    paddedN2 =
      n2.padStart(
        intDigits,
        '0'
      );

  }

  const nineComp =
    paddedN2
      .split('')
      .map(
        ch =>
          ch === '.'
            ? '.'
            : (
                9 -
                parseInt(ch)
              )
      )
      .join('');

  const addRes =
    addInBase(
      paddedN1,
      nineComp,
      10
    );

  const sum9 =
    addRes.result;

  result = '';

  let finalStep = '';

  const carry =
    sum9.split('.')[0].length >
    intDigits;

  if(carry){

    let withoutCarry;

    if(sum9.includes('.')){

      const parts =
        sum9.split('.');

      withoutCarry =
        parts[0].slice(1)
        +
        '.'
        +
        parts[1];

    }

    else{

      withoutCarry =
        sum9.slice(1);

    }

    const increment =
      fracLen
        ? (
            '0.' +
            '0'.repeat(
              fracLen - 1
            ) +
            '1'
          )
        : '1';

    const finalAdd =
      addInBase(
        withoutCarry,
        increment,
        10
      );

    result =
      String(
        parseFloat(
          finalAdd.result
        )
      );

    finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D
${withoutCarry}

b) Find E = Add 1 to LSD of D
${finalAdd.visual}
`;

  }

  else{

    const comp =
      sum9
        .split('')
        .map(
          ch =>
            ch === '.'
              ? '.'
              : (
                  9 -
                  parseInt(ch)
                )
        )
        .join('');

    const ninesForSum =
      sum9.replace(
        /[0-9]/g,
        '9'
      );

    const magnitude =
      parseFloat(comp);

    result =
      magnitude === 0
        ? '0'
        : '-' + magnitude;

    finalStep =
`
Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 9's Complement of D
  ${ninesForSum
      .split('')
      .join(' ')}
- ${sum9
      .split('')
      .join(' ')}
${'-'.repeat(
  sum9.length * 2 + 2
)}
  ${comp
      .split('')
      .join(' ')}
b) Add a negative sign to E: ${result}`;

  }

  steps =
`${signStep}Finding ${paddedN1} - ${paddedN2} using 9's Complement →

Let A = ${paddedN1}
Let B = ${paddedN2}

Step 1: Find C = 9's Complement of B
------------------------------------
  ${paddedN2
      .replace(/[0-9]/g,'9')
      .split('')
      .join(' ')}
- ${paddedN2
      .split('')
      .join(' ')}
${'-'.repeat(
  paddedN2.length * 2 + 2
)}
  ${nineComp
      .split('')
      .join(' ')}

Step 2: Find D = A + C
----------------------
${addRes.visual}
${finalStep}

Answer = ${result}

`;

  break;

  }











case 'Subtraction (100s Complement)':{

  if(
    !isDecimalNumber(num1)
    ||
    !isDecimalNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Decimal Number';

    stepsDiv.innerHTML = '';

    return;

  }

  if(
  num1.startsWith('-')
  ||
  num2.startsWith('-')
){

  resultDiv.innerHTML =
    '❌ Positive numbers only';

  stepsDiv.innerHTML =
    "10's Complement subtraction supports positive numbers only.";

  return;

}

  const fracLen =
    Math.max(
      (num1.split('.')[1] || '').length,
      (num2.split('.')[1] || '').length
    );

  const n1 =
    fracLen
      ? Number(num1).toFixed(fracLen)
      : num1;

  const n2 =
    fracLen
      ? Number(num2).toFixed(fracLen)
      : num2;

  const intDigits =
    Math.max(
      n1.split('.')[0].length,
      n2.split('.')[0].length
    );

  let paddedN2;

  if(fracLen){

    const parts =
      n2.split('.');

    paddedN2 =
      parts[0]
        .padStart(
          intDigits,
          '0'
        )
      +
      '.'
      +
      parts[1];

  }

  else{

    paddedN2 =
      n2.padStart(
        intDigits,
        '0'
      );

  }

  const nineComp =
    paddedN2
      .split('')
      .map(
        ch =>
          ch === '.'
            ? '.'
            : (
                9 -
                parseInt(ch)
              )
      )
      .join('');

  const increment =
    fracLen
      ? (
          '0.' +
          '0'.repeat(
            fracLen - 1
          ) +
          '1'
        )
      : '1';

  const tenCompAdd =
    addInBase(
      nineComp,
      increment,
      10
    );

  const tenComp =
    tenCompAdd.result;

  const addRes =
    addInBase(
      n1,
      tenComp,
      10
    );

  const sum10 =
    addRes.result;

  result = '';

  let finalStep = '';

  const carry =
    sum10.split('.')[0].length >
    intDigits;

  if(carry){

    let withoutCarry;

    if(sum10.includes('.')){

      const parts =
        sum10.split('.');

      withoutCarry =
        parts[0].slice(1)
        +
        '.'
        +
        parts[1];

    }

    else{

      withoutCarry =
        sum10.slice(1);

    }

    result =
      String(
        parseFloat(
          withoutCarry
        )
      );

    finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D: ${withoutCarry}
b) Result is positive`;

  }

  else{

    const ninesForSum =
      sum10.replace(
        /[0-9]/g,
        '9'
      );

    const comp =
      sum10
        .split('')
        .map(
          ch =>
            ch === '.'
              ? '.'
              : (
                  9 -
                  parseInt(ch)
                )
        )
        .join('');

    const tenCompResult =
      addInBase(
        comp,
        increment,
        10
      );

    const magnitude =
      parseFloat(
        tenCompResult.result
      );

    result =
      magnitude === 0
        ? '0'
        : '-' + magnitude;

    finalStep =
`
Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 10's Complement of D
  ${ninesForSum
      .split('')
      .join(' ')}
- ${sum10
      .split('')
      .join(' ')}
${'-'.repeat(
  sum10.length * 2 + 2
)}
  ${comp
      .split('')
      .join(' ')}
+ ${increment
      .padStart(comp.length,' ')
      .split('')
      .join(' ')}
${'-'.repeat(comp.length * 2 + 2)}
  ${tenCompResult.result
      .padStart(comp.length,'0')
      .split('')
      .join(' ')}
b) Add a negative sign to E: ${result}`;

  }

  steps =
`Finding ${n1} - ${n2} using 10's Complement →

Let A = ${n1}
Let B = ${n2}

Step 1: Find C = 10's Complement of B
-------------------------------------
a) Find 9's Complement of B

  ${paddedN2
      .replace(/[0-9]/g,'9')
      .split('')
      .join(' ')}
- ${paddedN2
      .split('')
      .join(' ')}
${'-'.repeat(
  paddedN2.length * 2 + 2
)}
  ${nineComp
      .split('')
      .join(' ')}

b) Add 1 to LSD
${tenCompAdd.visual}
C = ${tenComp}
Step 2: Find D = A + C
----------------------
${addRes.visual}

D = ${sum10}
${finalStep}

Answer = ${result}
`;

  break;

  }


case 'Subtraction (10s Complement)':{

  if(
    !isDecimalNumber(num1)
    ||
    !isDecimalNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Decimal Number';

    stepsDiv.innerHTML = '';

    return;

  }

let signStep = '';

let workingNum1 = num1;
let workingNum2 = num2;

const neg1 =
  num1.startsWith('-');

const neg2 =
  num2.startsWith('-');



  if(neg1 && neg2){

  const abs1 =
    num1.slice(1);

  const abs2 =
    num2.slice(1);

  signStep =
`Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${abs2} - ${abs1}
Now apply 10's Complement subtraction.
`;

  workingNum1 = abs2;
  workingNum2 = abs1;

}
else if(!neg1 && neg2){

  const abs2 =
    num2.slice(1);

  const add =
    addInBase(
      num1,
      abs2,
      10
    );

  result =
    add.result;

  steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${num1} + ${abs2}

${add.visual}

Answer = ${result}
`;

  break;

}
else if(neg1 && !neg2){

  const abs1 =
    num1.slice(1);

  const add =
    addInBase(
      abs1,
      num2,
      10
    );

  result =
    '-' + add.result;

  steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - ${num2} = -(${abs1} + ${num2})

${add.visual}

Answer = ${result}
`;

  break;

}

  const fracLen =
    Math.max(
      (workingNum1.split('.')[1] || '').length,
      (workingNum2.split('.')[1] || '').length
    );

  const n1 =
    fracLen
      ? Number(workingNum1).toFixed(fracLen)
      : workingNum1;

  const n2 =
    fracLen
      ? Number(workingNum2).toFixed(fracLen)
      : workingNum2;

  const intDigits =
    Math.max(
      n1.split('.')[0].length,
      n2.split('.')[0].length
    );



    let paddedN1;

if(fracLen){

  const parts =
    n1.split('.');

  paddedN1 =
    parts[0]
      .padStart(
        intDigits,
        '0'
      )
    +
    '.'
    +
    parts[1];

}
else{

  paddedN1 =
    n1.padStart(
      intDigits,
      '0'
    );

}



  let paddedN2;

  if(fracLen){

    const parts =
      n2.split('.');

    paddedN2 =
      parts[0]
        .padStart(
          intDigits,
          '0'
        )
      +
      '.'
      +
      parts[1];

  }

  else{

    paddedN2 =
      n2.padStart(
        intDigits,
        '0'
      );

  }

  const nineComp =
    paddedN2
      .split('')
      .map(
        ch =>
          ch === '.'
            ? '.'
            : (
                9 -
                parseInt(ch)
              )
      )
      .join('');

  const increment =
    fracLen
      ? (
          '0.' +
          '0'.repeat(
            fracLen - 1
          ) +
          '1'
        )
      : '1';

const tenCompAdd =
  addInBase(
    nineComp,
    increment,
    10
  );

let tenComp =
  tenCompAdd.result;

if(
  tenComp.length >
  paddedN2.length
){

  tenComp =
    tenComp.slice(1);

}

  const addRes =
    addInBase(
      paddedN1,
      tenComp,
      10
    );

  const sum10 =
    addRes.result;

  result = '';

  let finalStep = '';

const carry =
  addRes.result.split('.')[0].length >
  intDigits;

  if(carry){

    let withoutCarry;

    if(sum10.includes('.')){

      const parts =
        sum10.split('.');

      withoutCarry =
        parts[0].slice(1)
        +
        '.'
        +
        parts[1];

    }

    else{

      withoutCarry =
        sum10.slice(1);

    }

    result =
      withoutCarry;

    finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D: ${withoutCarry}
b) Result is positive`;

  }

  else{

    const ninesForSum =
      sum10.replace(
        /[0-9]/g,
        '9'
      );

    const comp =
      sum10
        .split('')
        .map(
          ch =>
            ch === '.'
              ? '.'
              : (
                  9 -
                  parseInt(ch)
                )
        )
        .join('');

    const tenCompResult =
      addInBase(
        comp,
        increment,
        10
      );

      let magnitudeResult =
  tenCompResult.result;

if(
  magnitudeResult.length >
  comp.length
){

  magnitudeResult =
    magnitudeResult.slice(1);

}



 result =
  /^0*\.?0*$/.test(magnitudeResult)
    ? '0'
    : '-' + magnitudeResult;

    finalStep =
`
Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 10's Complement of D
  ${ninesForSum
      .split('')
      .join(' ')}
- ${sum10
      .split('')
      .join(' ')}
${'-'.repeat(
  sum10.length * 2 + 2
)}
  ${comp
      .split('')
      .join(' ')}
+ ${increment
      .padStart(comp.length,' ')
      .split('')
      .join(' ')}
${'-'.repeat(comp.length * 2 + 2)}
  ${magnitudeResult
      .padStart(comp.length,'0')
      .split('')
      .join(' ')}
b) Add a negative sign to E: ${result}`;

  }

  steps =
`${signStep}Finding ${paddedN1} - ${paddedN2} using 10's Complement →

Let A = ${paddedN1}
Let B = ${paddedN2}

Step 1: Find C = 10's Complement of B
-------------------------------------
a) Find 9's Complement of B

  ${paddedN2
      .replace(/[0-9]/g,'9')
      .split('')
      .join(' ')}
- ${paddedN2
      .split('')
      .join(' ')}
${'-'.repeat(
  paddedN2.length * 2 + 2
)}
  ${nineComp
      .split('')
      .join(' ')}

b) Add 1 to LSD
${tenCompAdd.visual}
C = ${tenComp}
Step 2: Find D = A + C
----------------------
${addRes.visual}

D = ${sum10}
${finalStep}

Answer = ${result}
`;

  break;

  }









  case 'Bitwise NAND':{

  if(
    !isIntegerNumber(num1)
    ||
    !isIntegerNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Only';

    stepsDiv.innerHTML =
      'Bitwise NAND supports integers only.';

    return;

  }

  const n1 =
    parseInt(num1);

  const n2 =
    parseInt(num2);

  const andResult =
    n1 & n2;

  const resultNum =
    ~andResult;

  result =
    resultNum;

  steps =
`Bitwise NAND

Step 1: Find AND
----------------
${n1} & ${n2} = ${andResult}

Step 2: Apply NOT
-----------------
~${andResult} = ${resultNum}

Answer = ${resultNum}
`;

  break;

}




case 'Bitwise NOR':{

  if(
    !isIntegerNumber(num1)
    ||
    !isIntegerNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Only';

    stepsDiv.innerHTML =
      'Bitwise NOR supports integers only.';

    return;

  }

  const n1 =
    parseInt(num1);

  const n2 =
    parseInt(num2);

  const orResult =
    n1 | n2;

  const resultNum =
    ~orResult;

  result =
    resultNum;

  steps =
`Bitwise NOR

Step 1: Find OR
----------------
${n1} | ${n2} = ${orResult}

Step 2: Apply NOT
-----------------
~${orResult} = ${resultNum}

Answer = ${resultNum}
`;

  break;

}



case 'Bitwise XNOR':{

  if(
    !isIntegerNumber(num1)
    ||
    !isIntegerNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Only';

    stepsDiv.innerHTML =
      'Bitwise XNOR supports integers only.';

    return;

  }

  const n1 =
    parseInt(num1);

  const n2 =
    parseInt(num2);

  const xorResult =
    n1 ^ n2;

  const resultNum =
    ~xorResult;

  result =
    resultNum;

  steps =
`Bitwise XNOR

Step 1: Find XOR
----------------
${n1} ^ ${n2} = ${xorResult}

Step 2: Apply NOT
-----------------
~${xorResult} = ${resultNum}

Answer = ${resultNum}
`;

  break;

}



case 'Bitwise NOT (~)':{

  if(
    !isIntegerNumber(num1)
  ){

    resultDiv.innerHTML =
      '❌ Integer Only';

    stepsDiv.innerHTML =
      'Bitwise NOT supports integers only.';

    return;

  }

  const n =
    parseInt(num1);

  const resultNum =
    ~n;

  const binary =
    (n >>> 0)
      .toString(2)
      .padStart(32,'0');

  let complement = '';

  for(let bit of binary){

    complement +=
      bit === '0'
        ? '1'
        : '0';

  }

  const formulaResult =
    -(n + 1);

  result =
    resultNum;

  steps =
`Bitwise NOT (~)

Input Number
------------
${n}

32-bit Binary Representation
----------------------------
${binary}

Step 1: Flip every bit
----------------------
${binary} → ${complement}

Step 2: Interpret Result as Signed Integer
------------------------------------------
~${n} = -( ${n} + 1 ) = ${formulaResult}

Result
------
${resultNum}
`;

  break;

}



case 'Bitwise XOR (^)':{

  if(
  !isIntegerNumber(num1)
  ||
  !isIntegerNumber(num2)
){

  resultDiv.innerHTML =
    '❌ Integer Only';

  stepsDiv.innerHTML =
    'Bitwise operations support integers only.';

  return;

}
  const n1 =
    parseInt(num1);

  const n2 =
    parseInt(num2);

  const resultNum =
    n1 ^ n2;

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultNum;

  steps =
`${n1} ^ ${n2} →

Step 1: Decimal to Binary Conversion
------------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 2: Perform Bitwise XOR (^)
-------------------------------
  ${p1}
^ ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 3: Convert Result back to Decimal
--------------------------------------
(${p3})₂ = (${resultNum})₁₀

Answer = ${resultNum}
`;

  break;

}




case 'Bitwise OR (|)':{

  if(
  !isIntegerNumber(num1)
  ||
  !isIntegerNumber(num2)
){

  resultDiv.innerHTML =
    '❌ Integer Only';

  stepsDiv.innerHTML =
    'Bitwise operations support integers only.';

  return;

}

  const n1 =
    parseInt(num1);

  const n2 =
    parseInt(num2);

  const resultNum =
    n1 | n2;

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultNum;

  steps =
`${n1} | ${n2} →

Step 1: Decimal to Binary Conversion
------------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 2: Perform Bitwise OR (|)
-------------------------------
  ${p1}
| ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 3: Convert Result back to Decimal
--------------------------------------
(${p3})₂ = (${resultNum})₁₀

Answer = ${resultNum}
`;

  break;

}

case 'Bitwise AND (&)':{

  if(
  !isIntegerNumber(num1)
  ||
  !isIntegerNumber(num2)
){

  resultDiv.innerHTML =
    '❌ Integer Only';

  stepsDiv.innerHTML =
    'Bitwise operations support integers only.';

  return;

}

  const n1 =
    parseInt(num1);

  const n2 =
    parseInt(num2);

  const resultNum =
    n1 & n2;

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultNum;

  steps =
`${n1} & ${n2} →

Step 1: Decimal to Binary Conversion
------------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 2: Perform Bitwise AND (&)
-------------------------------
  ${p1}
& ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 3: Convert Result back to Decimal
--------------------------------------
(${p3})₂ = (${resultNum})₁₀

Answer = ${resultNum}
`;


  break;

}






















case 'Zero Fill Right Shift (>>>)':{

  if(
    !isIntegerNumber(num1)
    ||
    !isIntegerNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Only';

    stepsDiv.innerHTML =
      'Shift operations support integers only.';

    return;

  }

  if(num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const n =
    parseInt(num1);

  const shift =
    parseInt(num2);

  const binary32 =
    (n >>> 0)
      .toString(2)
      .padStart(
        32,
        '0'
      );

  const resultNum =
    n >>> shift;

  const shiftedBinary =
    resultNum
      .toString(2)
      .padStart(
        32,
        '0'
      );

  result =
    resultNum;

  steps =
`${n} >>> ${shift} →

Step 1: Find 32-bit Binary Code
-------------------------------
(${n})₁₀ = (${binary32})₂

Step 2: Zero Fill Right Shift
-----------------------------
${binary32}
↓ ${shift} positions
${shiftedBinary}
(Vacant bits are filled with 0)

Step 3: Convert back to Decimal
-------------------------------
${resultNum}

Answer: ${resultNum}`;

  break;

}



case 'Right Shift (>>)':{

  if(
    !isIntegerNumber(num1)
    ||
    !isIntegerNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Only';

    stepsDiv.innerHTML =
      'Shift operations support integers only.';

    return;

  }


if(num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const n =
    parseInt(num1);

  const shift =
    parseInt(num2);

  let binary32 =
    (n >>> 0)
      .toString(2)
      .padStart(
        32,
        '0'
      );

  let shiftedBinary;

  let resultNum;

  if(
    shift >= 32
  ){

    if(n < 0){

      shiftedBinary =
        '1'.repeat(32);

      resultNum = -1;

    }

    else{

      shiftedBinary =
        '0'.repeat(32);

      resultNum = 0;

    }

  }

  else{

    resultNum =
      n >> shift;

    shiftedBinary =
      (resultNum >>> 0)
        .toString(2)
        .padStart(
          32,
          '0'
        );

  }

  result =
    resultNum;

  steps =
`${n} >> ${shift} →

Step 1: Find 32-bit Binary Code
-------------------------------
(${n})₁₀ = (${binary32})₂

Step 2: Arithmetic Right Shift
------------------------------
${binary32}
↓ ${shift} positions
${shiftedBinary}
(Sign bit is preserved)

Step 3: Convert back to Decimal
-------------------------------
${resultNum}

Answer: ${resultNum}`;

  break;

}


case 'Left Shift (<<)':{

  if(
    !isIntegerNumber(num1)
    ||
    !isIntegerNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Only';

    stepsDiv.innerHTML =
      'Shift operations support integers only.';

    return;

  }

  if(num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const n =
    parseInt(num1);

  const shift =
    parseInt(num2);

  const binary32 =
    (n >>> 0)
      .toString(2)
      .padStart(
        32,
        '0'
      );

  const resultNum =
    n << shift;

  const shiftedBinary =
    (resultNum >>> 0)
      .toString(2)
      .padStart(
        32,
        '0'
      );

  result =
    resultNum;

  steps =
`${n} << ${shift} →

Step 1: Find 32-bit Binary Code
-------------------------------
(${n})₁₀ = (${binary32})₂

Step 2: Left Shift
------------------
${binary32}
↓ ${shift} positions
${shiftedBinary}

(Vacant bits are filled with 0)

Step 3: Convert back to Decimal
-------------------------------
${resultNum}

Answer: ${resultNum}`;

  break;

}















}

  resultDiv.innerHTML =
    `Answer: ${result}`;

  stepsDiv.textContent =
    steps;

}


//#endregion









//#region Octal Conversions & Arithmetic





function generateOctalToBinarySteps(
  value
){

  let steps =
`Octal to Binary Conversion of ${value}

Step 1: Convert every octal digit into 3-bit binary
---------------------------------------------------
`;

  let binary = '';

  for(let ch of value){

    if(ch === '.'){

      binary += '.';

      steps +=
`Decimal Point(.)\n`;

      continue;

      
    }

    if(ch === '-'){

      binary += '-';

      steps +=
`Minus Sign(-)\n`;

      continue;

    }

    const bits =
      parseInt(ch,8)
      .toString(2)
      .padStart(3,'0');

    steps +=
`${ch}₈ → ${bits}₂\n`;

    binary += bits;

  }

  steps +=
`
Step 2: Combine all binary groups
---------------------------------
${binary}

Answer = ${binary}₂
`;

  return steps;

}

function isOctalNumber(value){

  return /^-?[0-7]+(\.[0-7]+)?$/.test(value);

}


function octalToBinaryString(value){

  let binary = '';

  for(let ch of value){

    if(ch === '.'){

      binary += '.';
      continue;

    }

    binary +=
      parseInt(ch,8)
      .toString(2)
      .padStart(3,'0');

  }

  return binary;

}
function findOctalConversion(){

  let value =
    document.getElementById(
      'octalConvertInput'
    ).value.trim();

  const type =
    document.getElementById(
      'octalConvertType'
    ).value;

  const resultDiv =
    document.getElementById(
      'globalResult'
    );

  const stepsDiv =
    document.getElementById(
      'globalSteps'
    );

  if(!isOctalNumber(value)){

    resultDiv.innerHTML =
      '❌ Invalid Octal Number';

    stepsDiv.innerHTML = '';

    return;

  }

  const isNegative =
  value.startsWith('-');

const absValue =
  value.replace(/^-/,'');

  let result = '';
  let steps = '';

  switch(type){

    case 'Binary':{

  let binary = '';

  for(let ch of value){

    if(ch === '.'){

      binary += '.';
      continue;

    }

    if(ch === '-'){

      binary += '-';
      continue;

    }


    binary +=
      parseInt(ch,8)
      .toString(2)
      .padStart(3,'0');

  }

  result = binary;

  steps =
    generateOctalToBinarySteps(
      value
    );

  break;
}

case 'Hexadecimal':{

  const decimal =
    convertToDecimal(
      absValue,
      8
    );

  result =
    convertFromDecimal(
      decimal,
      16
    );

  if(isNegative){

    result = '-' + result;

  }

  steps =
    generateCrossGroupingSteps(
      absValue,
      8,
      16
    );

  if(isNegative){

    steps =
`Input Number = ${value}

(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the final answer)

${steps}

Final Answer = ${result}`;
  }

  break;
}

case 'Decimal':{

  const decimal =
    convertToDecimal(
      absValue,
      8
    );

  result = decimal;

  steps =
    generateAnyToDecimalSteps(
      absValue,
      8
    );


    if(isNegative){

  result = '-' + result;

  steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} and prefix '-' to the result)

${steps}

Final Answer = ${result}`;
}

  break;
}



case '7s complement':{

let ovalue7 = value;
value = absValue;

result =
  value
    .split('')
    .map(
      d => d === '.'
        ? '.'
        : 7 - parseInt(d)
    )
    .join('');

const sevens =
  value.replace(/[0-7]/g,'7');

steps =
`Finding 7's Complement of ${value} →

Step 1: Subtract all digits from 7
----------------------------------

  ${sevens.split('').join(' ')}
- ${value.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${result.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
`;

if(isNegative){

  steps =
`Input Number = ${ovalue7}
(Please Note: 7's Complement representation of a negative octal number is obtained by finding the 7's Complement of its magnitude.)
Magnitude = ${absValue}

${steps}
`;

}

break;
}


case '8s complement':{

let ovalue8 = value;
value = absValue;

const sevenCompResult =
  value
    .split('')
    .map(
      d => d === '.'
        ? '.'
        : 7 - parseInt(d)
    )
    .join('');

const increment =
  value.includes('.')
    ? '0.' +
      '0'.repeat(
        value.split('.')[1].length - 1
      ) +
      '1'
    : '1';

const addRes =
  addInBase(
    sevenCompResult,
    increment,
    8
  );

result =
  addRes.result;

const sevens2 =
  value.replace(/[0-7]/g,'7');

const displayIncrement =
  increment.padStart(
    sevenCompResult.length,
    ' '
  );

steps =
`Finding 8's Complement of ${value} →

Step 1: Subtract all digits from 7
----------------------------------

  ${sevens2.split('').join(' ')}
- ${value.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${sevenCompResult.split('').join(' ')}

Step 2: Add 1 to the LSD (Least Significant Digit)
--------------------------------------------------

  ${sevenCompResult.split('').join(' ')}
+ ${displayIncrement.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
  ${result.split('').join(' ')}
${'-'.repeat(
  value.length * 2 + 2
)}
`;

if(isNegative){

  steps =
`Input Number = ${ovalue8}
(Please Note: 8's Complement representation of a negative octal number is obtained by finding the 8's Complement of its magnitude.)
Magnitude = ${absValue}

${steps}
`;

}

break;
}

case 'BCD (Binary Coded Decimal)': {

let bcd = '';

let bcdSteps =
`BCD Representation of ${absValue}₈ →

Step 1: Separate each octal digit from left to right
----------------------------------------------------
`;

let octDigits = [];

for(let d of absValue){

  if(d === '.')
    continue;

  octDigits.push(d);

}

bcdSteps += octDigits.join(', ');

bcdSteps +=
`

Step 2: Find 4-bit binary code (nibble) of each octal digit
-----------------------------------------------------------
`;

for(let d of absValue){

  if(d === '.'){

    bcd += '. ';

    bcdSteps +=
`Decimal Point(.)\n`;

    continue;

  }

  const code =
    parseInt(d,8)
      .toString(2)
      .padStart(4,'0');

  bcd += code + ' ';

  bcdSteps +=
`${d}₈ → ${code}\n`;

}

result =
  bcd.trim();

steps =
`${bcdSteps}

Step 3: Combine all the 4-bit nibbles side-by-side
--------------------------------------------------
${result}
--------------------------------------------------
`;

if(isNegative)
  result = '1101     ' + result;

if(isNegative){

steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its BCD form and prefix '1101' as sign block.)

${steps}

Final Answer = ${result}`;

}

break;
}


case 'Excess 3': {

let excess3 = '';

let excessSteps =
`Excess-3 Representation of ${absValue}₈ →

Step 1: Separate each octal digit from left to right
----------------------------------------------------
`;

let digits = [];

for(let d of absValue){

  if(d === '.')
    continue;

  digits.push(d);

}

excessSteps += digits.join(', ');

excessSteps +=
`

Step 2: Add 3 to each octal digit
---------------------------------
`;

let excessDigits = [];

for(let d of absValue){

  if(d === '.')
    continue;

  const digit =
    parseInt(d,8);

  const digitPlus3 =
    digit + 3;

  excessDigits.push(digitPlus3);

  excessSteps +=
`${digit} + 3 = ${digitPlus3}\n`;

}

excessSteps +=
`\nExcess-3 digits are:\n${excessDigits.join(', ')}`;

excessSteps +=
`

Step 3: Convert each Excess-3 digit into 4-bit binary
-----------------------------------------------------
`;

for(let d of absValue){

  if(d === '.'){

    excess3 += '. ';

    excessSteps +=
`Decimal Point(.)\n`;

    continue;

  }

  const digit =
    parseInt(d,8);

  const digitPlus3 =
    digit + 3;

  const code =
    digitPlus3
      .toString(2)
      .padStart(4,'0');

  excess3 += code + ' ';

  excessSteps +=
`${digitPlus3} → ${code}\n`;

}

result =
  excess3.trim();

steps =
`${excessSteps}

Step 4: Combine all the 4-bit nibbles side-by-side
--------------------------------------------------
${result}
--------------------------------------------------
`;

if(isNegative)
  result = '1101     ' + result;

if(isNegative){

steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into its Excess-3 form and prefix '1101' as sign block.)

${steps}

Final Answer = ${result}`;

}

break;
  }


case 'Gray':{

const octBinary =
  octalToBinaryString(
    absValue
  );

let binaryForGray =
  octBinary;

if(binaryForGray.includes('.')){

  const parts =
    binaryForGray.split('.');

  binaryForGray =
    parts[0]
    + '.'
    + parts[1]
    + '0';

}

const bits =
  binaryForGray.replace('.','');

const shifted =
  '0' + bits.slice(0,-1);

let grayBits = '';

let graySteps =
`Octal to Gray Conversion of ${value} →

Step 1: Convert Octal to Binary
-------------------------------
${absValue}₈ = ${octBinary}₂

Step 2: Shift Binary Right by 1 Bit
-----------------------------------
${bits}
${shifted}

Step 3: XOR corresponding bits
------------------------------
`;

for(
  let i = 0;
  i < bits.length;
  i++
){

  const g =
    bits[i] === shifted[i]
      ? '0'
      : '1';

  grayBits += g;

  graySteps +=
`${bits[i]} XOR ${shifted[i]} = ${g}\n`;

}

const pointPos =
  binaryForGray.indexOf('.');

let gray;

if(pointPos !== -1){

  gray =
    grayBits.slice(
      0,
      pointPos
    )
    +
    '.'
    +
    grayBits.slice(
      pointPos
    );

}else{

  gray = grayBits;

}

result = gray;

steps =
`${graySteps}

Step 4: Combine all Gray bits
-----------------------------
${gray.split('').join(' ')}

Gray Code = ${gray}
-----------------------------
`;

if(isNegative)
  result = '1     ' + result;

if(isNegative){

steps =
`Input Number = ${value}
(Please Note: Since the number is negative, we convert the magnitude ${absValue} into Gray Code and prefix '1' as sign bit.)

${steps}

Final Answer = ${result}`;

}

break;}


case 'Sign Magnitude':{

  const signBit =
    isNegative ? '1' : '0';

  const binaryMagnitude =
    octalToBinaryString(
      absValue
    );

  const isReal =
    absValue.includes('.');

  function signMagnitude(
    totalBits
  ){

    const pureBinary =
      binaryMagnitude.replace('.','');

    if(!isReal){

      const magBits =
        totalBits - 1;

      if(
        pureBinary.length >
        magBits
      ){

        return 'Overflow';

      }

      return (
        signBit +
        pureBinary.padStart(
          magBits,
          '0'
        )
      );

    }

    const parts =
      binaryMagnitude.split('.');

    const intBinary =
      parts[0];

    const fracBinary =
      parts[1] || '';

    const intBits =
      Math.floor(
        (totalBits - 1) / 2
      );

    const fracBits =
      totalBits - 1 - intBits;

    if(
      intBinary.length >
      intBits
    ){

      return 'Overflow';

    }

    return (
      signBit
      + ' '
      + intBinary.padStart(
          intBits,
          '0'
        )
      + ' '
      + fracBinary.padEnd(
          fracBits,
          '0'
        )
        .slice(0,fracBits)
    );

  }

  const sm8 =
    signMagnitude(8);

  const sm16 =
    signMagnitude(16);

  const sm32 =
    signMagnitude(32);

  result =
`<br>8-bit  : ${sm8}<br>
16-bit : ${sm16}<br>
32-bit : ${sm32}<br>`;

  steps =
`Sign Magnitude Representation of ${value}

Step 1: Determine Sign Bit
--------------------------
${isNegative
  ? 'Negative Number → Sign Bit = 1'
  : 'Positive Number → Sign Bit = 0'}

Step 2: Find Magnitude
----------------------
|${value}| = ${absValue}

Step 3: Convert Octal Magnitude to Binary
-----------------------------------------
${absValue}₈ = ${binaryMagnitude}₂

Step 4: Sign Magnitude Representation
-------------------------------------
8-bit  : ${sm8}
16-bit : ${sm16}
32-bit : ${sm32}

${
  isReal
  ?
`Please Note:
8-bit  = 1 Sign + 3 Integer + 4 Fraction
16-bit = 1 Sign + 7 Integer + 8 Fraction
32-bit = 1 Sign + 15 Integer + 16 Fraction`
  :
`Please Note:
8-bit  = 1 Sign + 7 Magnitude
16-bit = 1 Sign + 15 Magnitude
32-bit = 1 Sign + 31 Magnitude`
}
`;

  break;

}


case 'Mantissa Exponent':{

  const binary =
    octalToBinaryString(
      absValue
    );

  if(
  parseInt(
    binary.replace('.',''),
    2
  ) === 0
){

    result = '0 × 2^0';

    steps =
`Mantissa-Exponent Form

0 has no normalization.

Answer = 0 × 2^0`;

    break;

  }

  let exponent = 0;

  let mantissa = '';

  if(binary.includes('.')){

    const parts =
      binary.split('.');

    const intPart =
      parts[0];

    const fracPart =
      parts[1];

    if(
      parseInt(intPart,2) !== 0
    ){

      exponent =
        intPart.length - 1;

      mantissa =
        '1.' +
        intPart.slice(1) +
        fracPart;

    }

    else{

      const firstOne =
        fracPart.indexOf('1');

      exponent =
        -(firstOne + 1);

      mantissa =
        '1.' +
        fracPart.slice(
          firstOne + 1
        );

    }

  }

  else{

    exponent =
      binary.length - 1;

    mantissa =
      '1.' +
      binary.slice(1);

  }

  result =
`${isNegative ? '-' : ''}${mantissa} × 2^${exponent}`;

  steps =
`Mantissa-Exponent Form of ${value}

Step 1: Convert Octal to Binary
-------------------------------
${absValue}₈ = ${binary}₂

Step 2: Normalize Binary Number
-------------------------------
${result}

Mantissa
--------
${isNegative ? '-' : ''}${mantissa}

Exponent
--------
${exponent}
`;

  break;

}

case 'Fixed Point':{

  const negative =
    isNegative;

  const parts =
    absValue.split('.');

  const octalInt =
    parts[0];

  const octalFrac =
    parts[1] || '';

  let intBinary = '';

  for(let ch of octalInt){

    intBinary +=
      parseInt(ch,8)
      .toString(2)
      .padStart(3,'0');

  }

  intBinary =
    intBinary.replace(/^0+/,'') || '0';

  let fracBinary = '';

  for(let ch of octalFrac){

    fracBinary +=
      parseInt(ch,8)
      .toString(2)
      .padStart(3,'0');

  }

  function fixedPoint(
    intBits,
    fracBits
  ){

    if(
      intBinary.length >
      intBits
    ){

      return 'Overflow';

    }

    return (
      (negative ? '-' : '')
      +
      intBinary.padStart(
        intBits,
        '0'
      )
      +
      '.'
      +
      fracBinary
        .padEnd(
          fracBits,
          '0'
        )
        .slice(
          0,
          fracBits
        )
    );

  }

  const fp8 =
    fixedPoint(4,4);

  const fp16 =
    fixedPoint(8,8);

  const fp32 =
    fixedPoint(16,16);

  result =
`<br>8-bit  : ${fp8}<br>
16-bit : ${fp16}<br>
32-bit : ${fp32}<br>`;

  steps =
`Fixed Point Representation of ${value}

Step 1: Separate Integer and Fraction Parts
-------------------------------------------
Integer Part  = ${octalInt}
Fraction Part = ${octalFrac || '0'}

Step 2: Convert Integer Part to Binary
--------------------------------------
${octalInt}₈ = ${intBinary}₂

Step 3: Convert Fraction Part to Binary
---------------------------------------
${octalFrac || '0'}₈ = ${fracBinary || '0'}₂

Step 4: Fixed Point Representations
-----------------------------------
8-bit  (4 Integer + 4 Fraction)
${fp8}

16-bit (8 Integer + 8 Fraction)
${fp16}

32-bit (16 Integer + 16 Fraction)
${fp32}

Please Note:
------------
Fixed Point uses a fixed radix point.
The radix point never moves.
`;

  break;

}

case 'IEEE-754 Floating Point (32-bit)':{

  const decimalValue =
    convertToDecimal(
      absValue,
      8
    );

  const actualValue =
    isNegative
      ? -decimalValue
      : decimalValue;

  const buffer =
    new ArrayBuffer(4);

  const view =
    new DataView(buffer);

  view.setFloat32(
    0,
    actualValue
  );

  let bits = '';

  for(let i=0;i<4;i++){

    bits +=
      view
        .getUint8(i)
        .toString(2)
        .padStart(8,'0');

  }

  const sign =
    bits[0];

  const exponent =
    bits.slice(1,9);

  const mantissa =
    bits.slice(9);

  result =
`${sign} ${exponent} ${mantissa}`;

  steps =
`IEEE-754 Single Precision (32-bit)

Step 1: Convert Octal to Decimal
--------------------------------
${value}₈ = ${actualValue}₁₀

Step 2: IEEE-754 Encoding
-------------------------
Sign Bit
--------
${sign}

Exponent (8 bits)
----------------
${exponent}

Mantissa (23 bits)
------------------
${mantissa}

Final Representation
--------------------
${result}
`;

  break;

}


case 'IEEE-754 Floating Point (64-bit)':{

  const decimalValue =
    convertToDecimal(
      absValue,
      8
    );

  const actualValue =
    isNegative
      ? -decimalValue
      : decimalValue;

  const buffer =
    new ArrayBuffer(8);

  const view =
    new DataView(buffer);

  view.setFloat64(
    0,
    actualValue
  );

  let bits = '';

  for(let i=0;i<8;i++){

    bits +=
      view
        .getUint8(i)
        .toString(2)
        .padStart(8,'0');

  }

  const sign =
    bits[0];

  const exponent =
    bits.slice(1,12);

  const mantissa =
    bits.slice(12);

  result =
`${sign} ${exponent} ${mantissa}`;

  steps =
`IEEE-754 Double Precision (64-bit)

Step 1: Convert Octal to Decimal
--------------------------------
${value}₈ = ${actualValue}₁₀

Step 2: IEEE-754 Encoding
-------------------------
Sign Bit
--------
${sign}

Exponent (11 bits)
-----------------
${exponent}

Mantissa (52 bits)
------------------
${mantissa}

Final Representation
--------------------
${result}
`;

  break;

}




  }

  resultDiv.innerHTML =
    `Answer: ${result}`;

  stepsDiv.textContent =
    steps;

}




function isIntegerOctal(value){

  return /^-?[0-7]+$/.test(value);

}

function octalToSignedInt(value){

  return parseInt(
    convertToDecimal(
      value.replace('-',''),
      8
    )
  ) * (
    value.startsWith('-')
      ? -1
      : 1
  );

}


function normalizeOctal(value){

  let negative =
    value.startsWith('-');

  if(negative){

    value =
      value.slice(1);

  }

  if(value.includes('.')){

    let parts =
      value.split('.');

    let intPart =
      parts[0]
        .replace(/^0+/,'')
      || '0';

    let fracPart =
      parts[1]
        .replace(/0+$/,'');

    value =
      fracPart.length
        ? intPart + '.' + fracPart
        : intPart;

  }
  else{

    value =
      value.replace(/^0+/,'')
      || '0';

  }

  if(value === '0'){

    return '0';

  }

  return negative
    ? '-' + value
    : value;

}
function octalAbs(value){

  return value.replace(
    /^-/,
    ''
  );

}

function isNegativeOctal(value){

  return value.startsWith(
    '-'
  );

}

function octalToNumber(value){

  const negative =
    value.startsWith('-');

  const absValue =
    value.replace(
      /^-/,
      ''
    );

  const decimal =
    convertToDecimal(
      absValue,
      8
    );

  return negative
    ? -decimal
    : decimal;

}
function findOctalArithmetic(){

  const num1 =
    document.getElementById(
      'octalNum1'
    ).value.trim();

  const num2 =
    document.getElementById(
      'octalNum2'
    ).value.trim();

  const operation =
    document.getElementById(
      'octalOperation'
    ).value;

  const resultDiv =
    document.getElementById(
      'globalResult'
    );

  const stepsDiv =
    document.getElementById(
      'globalSteps'
    );

  if(
    operation ===
    'Bitwise NOT (~)'
  ){

  }

  else{

    if(
      !isOctalNumber(num1)
      ||
      !isOctalNumber(num2)
    ){

      resultDiv.innerHTML =
        '❌ Invalid Octal Number';

      stepsDiv.innerHTML = '';

      return;

    }

  }

  let result = '';
  let steps = '';

  switch(operation){

    case 'Addition':{

  const n1 =
    octalToNumber(num1);

  const n2 =
    octalToNumber(num2);

   const neg1 =
  num1.startsWith('-');

const neg2 =
  num2.startsWith('-');

  if(
    neg1 === neg2
  ){

    const add =
      addInBase(
        num1.replace('-',''),
        num2.replace('-',''),
        8
      );

    if(add.result === '0'){

  result = '0';

}
else{

  result =
    neg1
      ? '-' + add.result
      : add.result;

}

    steps =
`Input Number 1 = ${num1}₈
Input Number 2 = ${num2}₈

Step 1:
-------
Both numbers have same sign.
Perform Octal Addition.

Step 2:
-------
${add.visual}

Step 3:
-------
Apply sign.

Answer = ${result}₈`;

  }

  else{

    let big =
      num1.replace('-','');

    let small =
      num2.replace('-','');

    let resultNegative =
      neg1;

    if(
      Math.abs(n2)
      >
      Math.abs(n1)
    ){

      big =
        num2.replace('-','');

      small =
        num1.replace('-','');

      resultNegative =
        neg2;

    }

    const sub =
      subtractInBase(
        big,
        small,
        8
      );

if(sub.result === '0'){

  result = '0';

}
else{

  result =
    resultNegative
      ? '-' + sub.result
      : sub.result;

}

    steps =
`Input Number 1 = ${num1}₈
Input Number 2 = ${num2}₈

Step 1:
-------
Signs are different.
Convert addition into subtraction.

Step 2:
-------
${sub.visual}

Step 3:
-------
Apply sign of larger magnitude.

Answer = ${result}₈`;

  }

  break;
}


case 'Subtraction':{

  const n1 =
    octalToNumber(
      num1
    );

  const n2 =
    octalToNumber(
      num2
    );

  const abs1 =
    octalAbs(num1);

  const abs2 =
    octalAbs(num2);

  const neg1 =
    isNegativeOctal(
      num1
    );

  const neg2 =
    isNegativeOctal(
      num2
    );

  let explanation = '';

  if(neg2){

    explanation =
`The 2nd input number ${num2} is negative.
Therefore, ${num1} - (${num2}) = ${abs1} + ${abs2}`;

  }

  else{

    explanation =
`The 1st input number ${num1} is negative.

Therefore, ${num1} - ${num2} = -(${abs1} + ${abs2})`;

  }

  if(
    neg1 !== neg2
  ){

    const add =
      addInBase(
        abs1,
        abs2,
        8
      );

    if(add.result === '0'){

  result = '0';

}
else{

  result =
    neg1
      ? '-' + add.result
      : add.result;

}

    steps =
`Input Number 1 = ${num1}₈
Input Number 2 = ${num2}₈

Step 1:
-------
${explanation}

Step 2:
-------
${add.visual}

Step 3:
-------
${
  neg1
    ? 'Apply (-) sign.'
    : 'Apply (+) sign.'
}

Answer = ${result}₈
`;

  }

  else{

    let bigValue =
      n1;

    let big =
      abs1;

    let small =
      abs2;

    let resultNegative =
      false;

    if(
      Math.abs(n1)
      >=
      Math.abs(n2)
    ){

      resultNegative =
        neg1;

    }

    else{

      bigValue =
        n2;

      big =
        abs2;

      small =
        abs1;

      resultNegative =
        !neg1;

    }

    let sameSignExplanation =
      '';

    if(
      !neg1
      &&
      !neg2
    ){

      sameSignExplanation =
`Both input numbers are positive.
Since ${big} > ${small},  find: ${big} - ${small}
and apply ${  resultNegative    ? '(-)'    : '(+)'} sign.`;

    }

    else{

      sameSignExplanation =
`Both input numbers are negative.
${num1} - (${num2})
Now since, ${big} > ${small}, find: ${big} - ${small}
and apply ${  resultNegative    ? '(-)'    : '(+)'} sign.`;

    }

    const sub =
      subtractInBase(
        big,
        small,
        8
      );

if(sub.result === '0'){

  result = '0';

}
else{

  result =
    resultNegative
      ? '-' + sub.result
      : sub.result;

}

    steps =
`Input Number 1 = ${num1}₈
Input Number 2 = ${num2}₈

Step 1:
-------
${sameSignExplanation}

Step 2:
-------
${sub.visual}

Step 3:
-------
Apply ${  resultNegative    ? '(-)'    : '(+)'} sign.

Answer = ${result}₈
`;

  }

  break;
}

case 'Multiplication':{

  const n1 =
    octalToNumber(
      num1
    );

  const n2 =
    octalToNumber(
      num2
    );

  const abs1 =
    octalAbs(
      num1
    );

  const abs2 =
    octalAbs(
      num2
    );

  const negative =
    (n1 < 0)
    !==
    (n2 < 0);

  const mul =
    multiplyInBase(
      abs1,
      abs2,
      8
    );

  if(mul.result === '0'){

  result = '0';

}
else{

  result =
    negative
      ? '-' + mul.result
      : mul.result;

}

  steps =
`Input Number 1 = ${num1}₈
Input Number 2 = ${num2}₈

Step 1: Determine Sign of the Answer
------------------------------------
Number 1: ${n1 < 0 ? '(- ve)' : '(+ ve)'}
Number 2: ${n2 < 0 ? '(- ve)' : '(+ ve)'}

${
  negative
  ? 'Signs are different → Answer will be negative (- ve)'
  : 'Signs are same → Answer will be positive (+ ve)'
}

Step 2: Multiply Magnitudes
---------------------------
${mul.visual}

Step 3: Apply Sign
------------------
Answer = ${result}₈
`;

  break;

}


case 'Subtraction (7s Complement)':{

  if(
    !isOctalNumber(num1)
    ||
    !isOctalNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Octal Number';

    stepsDiv.innerHTML = '';

    return;

  }

let signStep = '';

let workingNum1 = num1;
let workingNum2 = num2;

const neg1 =
  num1.startsWith('-');

const neg2 =
  num2.startsWith('-');

if(neg1 && neg2){

  const abs1 =
    num1.slice(1);

  const abs2 =
    num2.slice(1);

  signStep =
`Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${abs2} - ${abs1}

Now apply 7's Complement subtraction.
`;

  workingNum1 = abs2;
  workingNum2 = abs1;

}
else if(!neg1 && neg2){

  const abs2 =
    num2.slice(1);

  const add =
    addInBase(
      num1,
      abs2,
      8
    );

  result =
    add.result;

  steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${num1} + ${abs2}

${add.visual}

Answer = ${result}
`;

  break;

}
else if(neg1 && !neg2){

  const abs1 =
    num1.slice(1);

  const add =
    addInBase(
      abs1,
      num2,
      8
    );

  result =
    '-' + add.result;

  steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - ${num2} = -(${abs1} + ${num2})

${add.visual}

Answer = ${result}
`;

  break;

}

const fracLen =
  Math.max(
    (workingNum1.split('.')[1] || '').length,
    (workingNum2.split('.')[1] || '').length
  );

const intDigits =
  Math.max(
    workingNum1.split('.')[0]
      .replace('-','')
      .length,
    workingNum2.split('.')[0]
      .replace('-','')
      .length
  );

let paddedN1;
let paddedN2;

if(fracLen){

  const p1 =
    workingNum1.split('.');

  const fracPart1 =
    (p1[1] || '')
      .padEnd(
        fracLen,
        '0'
      );

  paddedN1 =
    p1[0]
      .padStart(
        intDigits,
        '0'
      )
    +
    '.'
    +
    fracPart1;

  const p2 =
    workingNum2.split('.');

  const fracPart2 =
    (p2[1] || '')
      .padEnd(
        fracLen,
        '0'
      );

  paddedN2 =
    p2[0]
      .padStart(
        intDigits,
        '0'
      )
    +
    '.'
    +
    fracPart2;

}
else{

  paddedN1 =
    workingNum1.padStart(
      intDigits,
      '0'
    );

  paddedN2 =
    workingNum2.padStart(
      intDigits,
      '0'
    );

}

const sevenComp =
  paddedN2
    .split('')
    .map(
      ch =>
        ch === '.'
          ? '.'
          : (
              7 -
              parseInt(ch)
            )
    )
    .join('');

const addRes =
  addInBase(
    paddedN1,
    sevenComp,
    8
  );

const sum7 =
  addRes.result;

let finalStep = '';

const carry =
  sum7.split('.')[0].length >
  intDigits;

if(carry){

  let withoutCarry;

  if(sum7.includes('.')){

    const p =
      sum7.split('.');

    withoutCarry =
      p[0].slice(1)
      +
      '.'
      +
      p[1];

  }
  else{

    withoutCarry =
      sum7.slice(1);

  }

  const increment =
    fracLen
      ? (
          '0.'
          +
          '0'.repeat(
            fracLen - 1
          )
          +
          '1'
        )
      : '1';

  const finalAdd =
    addInBase(
      withoutCarry,
      increment,
      8
    );

  result =
    finalAdd.result;

  finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D
${withoutCarry}

b) Find E = Add 1 to LSD of D

${finalAdd.visual}
`;

}
else{

  const comp =
    sum7
      .split('')
      .map(
        ch =>
          ch === '.'
            ? '.'
            : (
                7 -
                parseInt(ch)
              )
      )
      .join('');

  const sevensForSum =
    sum7.replace(
      /[0-7]/g,
      '7'
    );

  result =
    /^0*\.?0*$/.test(comp)
      ? '0'
      : '-' + comp;

  finalStep =
`
Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 7's Complement of D

  ${sevensForSum.split('').join(' ')}
- ${sum7.split('').join(' ')}
${'-'.repeat(sum7.length*2+2)}
  ${comp.split('').join(' ')}

b) Add a negative sign to E

${result}
`;

}

steps =
`${signStep}Finding ${paddedN1} - ${paddedN2} using 7's Complement →

Let A = ${paddedN1}
Let B = ${paddedN2}

Step 1: Find C = 7's Complement of B
------------------------------------

  ${paddedN2
      .replace(/[0-7]/g,'7')
      .split('')
      .join(' ')}

- ${paddedN2
      .split('')
      .join(' ')}

${'-'.repeat(
  paddedN2.length * 2 + 2
)}

  ${sevenComp
      .split('')
      .join(' ')}

Step 2: Find D = A + C
----------------------

${addRes.visual}

${finalStep}

Answer = ${result}
`;

break;
}
case 'Subtraction (8s Complement)':{

  if(
    !isOctalNumber(num1)
    ||
    !isOctalNumber(num2)
  ){

    resultDiv.innerHTML =
      '❌ Invalid Octal Number';

    stepsDiv.innerHTML = '';

    return;

  }

  let signStep = '';

  let workingNum1 = num1;
  let workingNum2 = num2;

  const neg1 =
    num1.startsWith('-');

  const neg2 =
    num2.startsWith('-');

  if(neg1 && neg2){

    const abs1 =
      num1.slice(1);

    const abs2 =
      num2.slice(1);

    signStep =
`Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${abs2} - ${abs1}
Now apply 8's Complement subtraction.
`;

    workingNum1 = abs2;
    workingNum2 = abs1;

  }
  else if(!neg1 && neg2){

    const abs2 =
      num2.slice(1);

    const add =
      addInBase(
        num1,
        abs2,
        8
      );

    result =
      add.result;

    steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - (${num2}) = ${num1} + ${abs2}

${add.visual}

Answer = ${result}
`;

    break;

  }
  else if(neg1 && !neg2){

    const abs1 =
      num1.slice(1);

    const add =
      addInBase(
        abs1,
        num2,
        8
      );

    result =
      '-' + add.result;

    steps =
`Finding ${num1} - ${num2}

Step 0: Simplify Signs
----------------------
${num1} - ${num2} = -(${abs1} + ${num2})

${add.visual}

Answer = ${result}
`;

    break;

  }

  const fracLen =
    Math.max(
      (workingNum1.split('.')[1] || '').length,
      (workingNum2.split('.')[1] || '').length
    );

  const intDigits =
    Math.max(
      workingNum1.split('.')[0]
        .replace('-','')
        .length,
      workingNum2.split('.')[0]
        .replace('-','')
        .length
    );

  let paddedN1;
  let paddedN2;

 if(fracLen){

  const p1 =
    workingNum1.split('.');

  const fracPart1 =
    (p1[1] || '')
      .padEnd(
        fracLen,
        '0'
      );

  paddedN1 =
    p1[0]
      .padStart(
        intDigits,
        '0'
      )
    +
    '.'
    +
    fracPart1;

  const p2 =
    workingNum2.split('.');

  const fracPart2 =
    (p2[1] || '')
      .padEnd(
        fracLen,
        '0'
      );

  paddedN2 =
    p2[0]
      .padStart(
        intDigits,
        '0'
      )
    +
    '.'
    +
    fracPart2;

}
  else{

    paddedN1 =
      workingNum1.padStart(
        intDigits,
        '0'
      );

    paddedN2 =
      workingNum2.padStart(
        intDigits,
        '0'
      );

  }

  const sevenComp =
    paddedN2
      .split('')
      .map(
        ch =>
          ch === '.'
            ? '.'
            : (
                7 -
                parseInt(ch)
              )
      )
      .join('');

  const increment =
    fracLen
      ? (
          '0.' +
          '0'.repeat(
            fracLen - 1
          ) +
          '1'
        )
      : '1';

  const eightCompAdd =
    addInBase(
      sevenComp,
      increment,
      8
    );

  let eightComp =
    eightCompAdd.result;

  if(
    eightComp.length >
    paddedN2.length
  ){

    eightComp =
      eightComp.slice(1);

  }

  const addRes =
    addInBase(
      paddedN1,
      eightComp,
      8
    );

  const sum8 =
    addRes.result;

  result = '';

  let finalStep = '';

  const carry =
    addRes.result
      .split('.')[0]
      .length >
    intDigits;

  if(carry){

    let withoutCarry;

    if(sum8.includes('.')){

      const parts =
        sum8.split('.');

      withoutCarry =
        parts[0].slice(1)
        +
        '.'
        +
        parts[1];

    }
    else{

      withoutCarry =
        sum8.slice(1);

    }

    result =
      withoutCarry;

    finalStep =
`
Step 3: D has End-around Carry? Yes
-----------------------------------
a) Discard the End-around Carry from D

${withoutCarry}

b) Result is positive
`;

  }
  else{

    const sevensForSum =
      sum8.replace(
        /[0-7]/g,
        '7'
      );

    const comp =
      sum8
        .split('')
        .map(
          ch =>
            ch === '.'
              ? '.'
              : (
                  7 -
                  parseInt(ch)
                )
        )
        .join('');

    const eightCompResult =
      addInBase(
        comp,
        increment,
        8
      );

    let magnitudeResult =
      eightCompResult.result;

    if(
      magnitudeResult.length >
      comp.length
    ){

      magnitudeResult =
        magnitudeResult.slice(1);

    }

    result =
      /^0*\.?0*$/.test(
        magnitudeResult
      )
        ? '0'
        : '-' + magnitudeResult;

    finalStep =
`
Step 3: D has End-around Carry? No
----------------------------------
a) Find E = 8's Complement of D

  ${sevensForSum
      .split('')
      .join(' ')}

- ${sum8
      .split('')
      .join(' ')}

${'-'.repeat(
  sum8.length * 2 + 2
)}

  ${comp
      .split('')
      .join(' ')}

+ ${increment
      .padStart(
        comp.length,
        ' '
      )
      .split('')
      .join(' ')}

${'-'.repeat(
  comp.length * 2 + 2
)}

  ${magnitudeResult
      .padStart(
        comp.length,
        '0'
      )
      .split('')
      .join(' ')}

b) Add a negative sign to E: ${result}
`;

  }

  steps =
`${signStep}Finding ${paddedN1} - ${paddedN2} using 8's Complement →

Let A = ${paddedN1}
Let B = ${paddedN2}

Step 1: Find C = 8's Complement of B
------------------------------------
a) Find 7's Complement of B

  ${paddedN2
      .replace(
        /[0-7]/g,
        '7'
      )
      .split('')
      .join(' ')}

- ${paddedN2
      .split('')
      .join(' ')}

${'-'.repeat(
  paddedN2.length * 2 + 2
)}

  ${sevenComp
      .split('')
      .join(' ')}

b) Add 1 to LSD

${eightCompAdd.visual}

C = ${eightComp}

Step 2: Find D = A + C
----------------------

${addRes.visual}

D = ${sum8}

${finalStep}

Answer = ${result}
`;

  break;

}







case 'Bitwise AND (&)':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Bitwise operations support integer octal numbers only.';

    return;

  }

  const n1 =
    octalToSignedInt(num1);

  const n2 =
    octalToSignedInt(num2);

  const resultNum =
    n1 & n2;

  const resultOctal =
    resultNum.toString(8);

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultOctal;

  steps =
`${num1}₈ & ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n1}₁₀
${num2}₈ = ${n2}₁₀

Step 2: Convert Decimal to Binary
---------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 3: Perform Bitwise AND (&)
-------------------------------
  ${p1}
& ${p2}
${'-'.repeat(width+2)}
  ${p3}

Step 4: Convert Result
----------------------
(${p3})₂ = (${resultNum})₁₀

(${resultNum})₁₀ = (${resultOctal})₈

Answer = ${resultOctal}₈
`;

  break;
}

case 'Bitwise OR (|)':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Bitwise operations support integer octal numbers only.';

    return;

  }

  const n1 =
    octalToSignedInt(num1);

  const n2 =
    octalToSignedInt(num2);

  const resultNum =
    n1 | n2;

  const resultOctal =
    resultNum.toString(8);

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultOctal;

  steps =
`${num1}₈ | ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n1}₁₀
${num2}₈ = ${n2}₁₀

Step 2: Convert Decimal to Binary
---------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 3: Perform Bitwise OR (|)
------------------------------
  ${p1}
| ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 4: Convert Result
----------------------
(${p3})₂ = (${resultNum})₁₀

(${resultNum})₁₀ = (${resultOctal})₈

Answer = ${resultOctal}₈
`;

  break;

}

case 'Bitwise XOR (^)':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Bitwise operations support integer octal numbers only.';

    return;

  }

  const n1 =
    octalToSignedInt(num1);

  const n2 =
    octalToSignedInt(num2);

  const resultNum =
    n1 ^ n2;

  const resultOctal =
    resultNum.toString(8);

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultOctal;

  steps =
`${num1}₈ ^ ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n1}₁₀
${num2}₈ = ${n2}₁₀

Step 2: Convert Decimal to Binary
---------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 3: Perform Bitwise XOR (^)
-------------------------------
  ${p1}
^ ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 4: Convert Result
----------------------
(${p3})₂ = (${resultNum})₁₀

(${resultNum})₁₀ = (${resultOctal})₈

Answer = ${resultOctal}₈
`;

  break;

}

case 'Bitwise XNOR':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Bitwise operations support integer octal numbers only.';

    return;

  }

  const n1 =
    octalToSignedInt(num1);

  const n2 =
    octalToSignedInt(num2);

  const xorResult =
    n1 ^ n2;

  const resultNum =
    ~xorResult;

  const resultOctal =
    resultNum.toString(8);

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (xorResult >>> 0)
      .toString(2)
      .padStart(width,'0');

  const p4 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultOctal;

  steps =
`${num1}₈ XNOR ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n1}₁₀
${num2}₈ = ${n2}₁₀

Step 2: Convert Decimal to Binary
---------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 3: Perform Bitwise XOR (^)
-------------------------------
  ${p1}
^ ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 4: Apply NOT (~)
---------------------
~${p3}
${'-'.repeat(width)}
${p4}

Step 5: Convert Result
----------------------
(${p4})₂ = (${resultNum})₁₀

(${resultNum})₁₀ = (${resultOctal})₈

Answer = ${resultOctal}₈
`;

  break;

}

case 'Bitwise NAND':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Bitwise operations support integer octal numbers only.';

    return;

  }

  const n1 =
    octalToSignedInt(num1);

  const n2 =
    octalToSignedInt(num2);

  const andResult =
    n1 & n2;

  const resultNum =
    ~andResult;

  const resultOctal =
    resultNum.toString(8);

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (andResult >>> 0)
      .toString(2)
      .padStart(width,'0');

  const p4 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultOctal;

  steps =
`${num1}₈ NAND ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n1}₁₀
${num2}₈ = ${n2}₁₀

Step 2: Convert Decimal to Binary
---------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 3: Perform Bitwise AND (&)
-------------------------------
  ${p1}
& ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 4: Apply NOT (~)
---------------------
~${p3}
${'-'.repeat(width)}
${p4}

Step 5: Convert Result
----------------------
(${p4})₂ = (${resultNum})₁₀

(${resultNum})₁₀ = (${resultOctal})₈

Answer = ${resultOctal}₈
`;

  break;

}

case 'Bitwise NOR':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Bitwise operations support integer octal numbers only.';

    return;

  }

  const n1 =
    octalToSignedInt(num1);

  const n2 =
    octalToSignedInt(num2);

  const orResult =
    n1 | n2;

  const resultNum =
    ~orResult;

  const resultOctal =
    resultNum.toString(8);

  const b1 =
    (n1 >>> 0)
      .toString(2);

  const b2 =
    (n2 >>> 0)
      .toString(2);

  const width =
    Math.max(
      b1.length,
      b2.length
    );

  const p1 =
    b1.padStart(width,'0');

  const p2 =
    b2.padStart(width,'0');

  const p3 =
    (orResult >>> 0)
      .toString(2)
      .padStart(width,'0');

  const p4 =
    (resultNum >>> 0)
      .toString(2)
      .padStart(width,'0');

  result =
    resultOctal;

  steps =
`${num1}₈ NOR ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n1}₁₀
${num2}₈ = ${n2}₁₀

Step 2: Convert Decimal to Binary
---------------------------------
(${n1})₁₀ = (${p1})₂
(${n2})₁₀ = (${p2})₂

Step 3: Perform Bitwise OR (|)
------------------------------
  ${p1}
| ${p2}
${'-'.repeat(width + 2)}
  ${p3}

Step 4: Apply NOT (~)
---------------------
~${p3}
${'-'.repeat(width)}
${p4}

Step 5: Convert Result
----------------------
(${p4})₂ = (${resultNum})₁₀

(${resultNum})₁₀ = (${resultOctal})₈

Answer = ${resultOctal}₈
`;

  break;

}

case 'Bitwise NOT (~)':{

  if(
    !isIntegerOctal(num1)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Bitwise NOT supports integer octal numbers only.';

    return;

  }

  const n =
    octalToSignedInt(num1);

  const resultNum =
    ~n;

  const resultOctal =
    resultNum.toString(8);

  const binary =
    (n >>> 0)
      .toString(2)
      .padStart(32,'0');

  let complement = '';

  for(let bit of binary){

    complement +=
      bit === '0'
        ? '1'
        : '0';

  }

  const formulaResult =
    -(n + 1);

  result =
    resultOctal;

  steps =
`Bitwise NOT (~)

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n}₁₀

Step 2: Convert Decimal to Binary
---------------------------------
${binary}

Step 3: Flip every bit
----------------------
${binary}
${'-'.repeat(32)}
${complement}

Step 4: Interpret Result as Signed Integer
------------------------------------------
~${n} = -( ${n} + 1 ) = ${formulaResult}

Step 5: Convert Result to Octal
-------------------------------
${resultNum}₁₀ = ${resultOctal}₈

Answer = ${resultOctal}₈
`;

  break;

}







case 'Zero Fill Right Shift (>>>)':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Shift operations support integer octal numbers only.';

    return;

  }

  if(num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const n =
    octalToSignedInt(num1);

  const shift =
    octalToSignedInt(num2);

  const binary32 =
    (n >>> 0)
      .toString(2)
      .padStart(32,'0');

  const resultNum =
    n >>> shift;

  const shiftedBinary =
    resultNum
      .toString(2)
      .padStart(32,'0');

  const resultOctal =
    resultNum.toString(8);

  result =
    resultOctal;

  steps =
`${num1}₈ >>> ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n}₁₀
${num2}₈ = ${shift}₁₀

Step 2: Find 32-bit Binary Code
-------------------------------
(${n})₁₀ = (${binary32})₂

Step 3: Zero Fill Right Shift
-----------------------------
${binary32}
↓ ${shift} positions
${shiftedBinary}

(Vacant bits are filled with 0)

Step 4: Convert Result
----------------------
${resultNum}₁₀ = ${resultOctal}₈

Answer = ${resultOctal}₈`;

  break;

}

case 'Right Shift (>>)':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Shift operations support integer octal numbers only.';

    return;

  }

  if(num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const n =
    octalToSignedInt(num1);

  const shift =
    octalToSignedInt(num2);

  const binary32 =
    (n >>> 0)
      .toString(2)
      .padStart(32,'0');

  let shiftedBinary;
  let resultNum;

  if(shift >= 32){

    if(n < 0){

      shiftedBinary =
        '1'.repeat(32);

      resultNum = -1;

    }
    else{

      shiftedBinary =
        '0'.repeat(32);

      resultNum = 0;

    }

  }
  else{

    resultNum =
      n >> shift;

    shiftedBinary =
      (resultNum >>> 0)
        .toString(2)
        .padStart(32,'0');

  }

  const resultOctal =
    resultNum.toString(8);

  result =
    resultOctal;

  steps =
`${num1}₈ >> ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n}₁₀
${num2}₈ = ${shift}₁₀

Step 2: Find 32-bit Binary Code
-------------------------------
(${n})₁₀ = (${binary32})₂

Step 3: Arithmetic Right Shift
------------------------------
${binary32}
↓ ${shift} positions
${shiftedBinary}

(Sign bit is preserved)

Step 4: Convert Result
----------------------
${resultNum}₁₀ = ${resultOctal}₈

Answer = ${resultOctal}₈`;

  break;

}

case 'Left Shift (<<)':{

  if(
    !isIntegerOctal(num1)
    ||
    !isIntegerOctal(num2)
  ){

    resultDiv.innerHTML =
      '❌ Integer Octal Only';

    stepsDiv.innerHTML =
      'Shift operations support integer octal numbers only.';

    return;

  }

  if(num2.startsWith('-')){

    resultDiv.innerHTML =
      '❌ Shift Count Must Be a Non-Negative Integer';

    return;

  }

  const n =
    octalToSignedInt(num1);

  const shift =
    octalToSignedInt(num2);

  const binary32 =
    (n >>> 0)
      .toString(2)
      .padStart(32,'0');

  const resultNum =
    n << shift;

  const shiftedBinary =
    (resultNum >>> 0)
      .toString(2)
      .padStart(32,'0');

  const resultOctal =
    resultNum.toString(8);

  result =
    resultOctal;

  steps =
`${num1}₈ << ${num2}₈ →

Step 1: Convert Octal to Decimal
--------------------------------
${num1}₈ = ${n}₁₀
${num2}₈ = ${shift}₁₀

Step 2: Find 32-bit Binary Code
-------------------------------
(${n})₁₀ = (${binary32})₂

Step 3: Left Shift
------------------
${binary32}
↓ ${shift} positions
${shiftedBinary}

(Vacant bits are filled with 0)

Step 4: Convert Result
----------------------
${resultNum}₁₀ = ${resultOctal}₈

Answer = ${resultOctal}₈`;

  break;

}

  }

  resultDiv.innerHTML =
    `Answer: ${result}`;

  stepsDiv.textContent =
    steps;

}


//#endregion