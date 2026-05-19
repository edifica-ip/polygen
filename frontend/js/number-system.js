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
