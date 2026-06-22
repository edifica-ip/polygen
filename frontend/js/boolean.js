

class BooleanMinimizer {
    constructor(expression) {
        this.rawExpr = expression;
        this.variables = [];
        this.steps = [];
    }

    minimize() {
        this.steps = []; 
        this.steps.push(`📝 **Original Expression:** ${this.rawExpr}`);
        
        // 1. Identify unique variables
        const varRegex = /[A-Za-z]/g;
        const matches = this.rawExpr.match(varRegex) || [];
        this.variables = [...new Set(matches)].sort();
        this.steps.push(`Detected variables: ${this.variables.join(', ')}`);

        if (this.variables.length === 0) {
            return { result: this.rawExpr, steps: ["No variables found."] };
        }

        // 2. Generate Minterms from Truth Table
        const minterms = [];
        const numVars = this.variables.length;
        const totalRows = Math.pow(2, numVars);

        for (let i = 0; i < totalRows; i++) {
            const context = {};
            this.variables.forEach((v, idx) => {
                context[v] = ((i >> (numVars - 1 - idx)) & 1) === 1;
            });

            if (this.evaluateRow(this.rawExpr, context)) {
                minterms.push(i);
            }
        }
        
        this.steps.push(
  `Generated Minterms (SOP form): Σm(${minterms.join(', ')})`
);

this.steps.push("");

this.steps.push(
  "=============================="
);

this.steps.push(
  "ALGEBRAIC SIMPLIFICATION"
);

this.steps.push(
  "=============================="
);

let currentExpression =
  this.rawExpr.replace(
    /\s+/g,
    ''
  );

this.steps.push(
  `Start : ${currentExpression}`
);

let currentTerms =
  currentExpression
    .split('+')
    .map(
      t => this.sanitizeTerm(t)
    );

        // ==========================================
        // 📚 ALGEBRAIC STEP GENERATOR FOR STUDENTS
        // ==========================================
        this.steps.push("🎬 **Starting Algebraic Simplification Steps:**");
        
        let changed = true;
        let iteration = 0;
        
        while (changed && iteration < 10) {

            
            changed = false;
            
            this.steps.push("");

this.steps.push(
  `Current Expression : ${
    currentTerms.join(' + ')
  }`
);




            // --- Law A: Idempotent Law (X + X = X) ---
            let uniqueTerms = [...new Set(currentTerms)];
            if (uniqueTerms.length !== currentTerms.length) {
                this.steps.push(
  "Idempotent Law"
);

this.steps.push(
  `${currentTerms.join(' + ')}`
);

this.steps.push(
  "Removing duplicate terms"
);

this.steps.push(
  `${uniqueTerms.join(' + ')}`
);
                currentTerms = uniqueTerms;
                changed = true;
                continue;
            }

            // --- Law B: Absorption Law (X + XY = X) ---
            let toRemove = new Set();
            for (let i = 0; i < currentTerms.length; i++) {
                for (let j = 0; j < currentTerms.length; j++) {
                    if (i !== j && this.isSubsetOf(currentTerms[i], currentTerms[j])) {
                        toRemove.add(currentTerms[j]);
                        this.steps.push(
  "Absorption Law"
);

this.steps.push(
  `${currentTerms[j]} absorbed by ${currentTerms[i]}`
);

this.steps.push(
  `${currentTerms[i]} + ${currentTerms[j]}`
);

this.steps.push(
  `= ${currentTerms[i]}`
);
                    }
                }
            }
            if (toRemove.size > 0) {
                currentTerms = currentTerms.filter(t => !toRemove.has(t));
                this.steps.push(`  ↳ Current Expression: \`${currentTerms.join(' + ')}\``);
                changed = true;
                continue;
            }


            if(
  currentTerms.length === 1 &&
  currentTerms[0] === "1"
){

  this.steps.push("");

  this.steps.push(
    "Domination Law"
  );

  this.steps.push(
    "1 + X = 1"
  );

  this.steps.push("");

  this.steps.push(
    "=============================="
  );

  this.steps.push(
    "FINAL RESULT"
  );

  this.steps.push(
    "=============================="
  );

  this.steps.push(
    "1"
  );

  return {

    result : "1",

    steps : this.steps

  };

}



if(
  currentTerms.includes("0")
){

  this.steps.push("");

  this.steps.push(
    "Identity Law"
  );

  this.steps.push(
    "X + 0 = X"
  );

  currentTerms =
    currentTerms.filter(
      t => t !== "0"
    );

  changed = true;

  continue;
}


            // --- Law C: Logical Adjacency / Factoring / Complement (XY + XY' = X) ---
            let combined = false;
            for (let i = 0; i < currentTerms.length; i++) {
                for (let j = i + 1; j < currentTerms.length; j++) {
                    let diff = this.getComplementaryDifference(currentTerms[i], currentTerms[j]);
                    if (diff !== null) {
                        let oldA = currentTerms[i];
                        let oldB = currentTerms[j];
                        currentTerms = currentTerms.filter((_, idx) => idx !== i && idx !== j);
                        
                        // If everything cancels out (like A + A'), it yields a constant 1
                        if (diff !== "") {
                            currentTerms.push(diff);
                        } else {
                            currentTerms.push("1");
                        }
                        
                        this.steps.push(
  "Complement Law"
);

this.steps.push(
  `${oldA} + ${oldB}`
);

this.steps.push(
  `= ${diff || '1'}`
);
this.steps.push(`  ↳ Current Expression: \`${currentTerms.join(' + ')}\``);
                        combined = true;
                        break;
                    }
                }
                if (combined) break;
            }
            if (combined) {
                changed = true;
                continue;
            }



            if(currentTerms.length === 1){

  const algebraResult =
    currentTerms[0];

  this.steps.push("");

  this.steps.push(
    "=============================="
  );

  this.steps.push(
    "FINAL RESULT"
  );

  this.steps.push(
    "=============================="
  );

  this.steps.push(
    algebraResult
  );

  return {

    result:
      algebraResult,

    steps:
      this.steps

  };

}
            iteration++;
        }
        // ==========================================


        this.steps.push("");

this.steps.push(
  "No further algebraic reduction possible."
);

this.steps.push(
  "Applying Quine-McCluskey Minimization..."
);

this.steps.push("");


        // 3. Run Quine-McCluskey Tabular Grouping
        let groups = {};
        minterms.forEach(m => {
            const binary = m.toString(2).padStart(numVars, '0');
            const onesCount = (binary.match(/1/g) || []).length;
            if (!groups[onesCount]) groups[onesCount] = [];
            groups[onesCount].push({ minterms: [m], binary, used: false });
        });

        let allPrimeImplicants = [];
        
        while (Object.keys(groups).length > 0) {
            let nextGroups = {};
            let mergedInThisStep = false;

            const keys = Object.keys(groups).map(Number).sort((a, b) => a - b);
            
            for (let i = 0; i < keys.length - 1; i++) {
                const groupA = groups[keys[i]];
                const groupB = groups[keys[i+1]];

                groupA.forEach(itemA => {
                    groupB.forEach(itemB => {
                        let diffIndex = -1;
                        let diffCount = 0;

                        for (let bIdx = 0; bIdx < numVars; bIdx++) {
                            if (itemA.binary[bIdx] !== itemB.binary[bIdx]) {
                                diffCount++;
                                diffIndex = bIdx;
                            }
                        }

                        if (diffCount === 1) {
                            itemA.used = true;
                            itemB.used = true;
                            mergedInThisStep = true;

                            let newBinary = itemA.binary.split('');
                            newBinary[diffIndex] = '-';
                            newBinary = newBinary.join('');

                            const newMinterms = [...new Set([...itemA.minterms, ...itemB.minterms])].sort((a,b)=>a-b);
                            const onesCount = (newBinary.match(/1/g) || []).length;
                            
                            if (!nextGroups[onesCount]) nextGroups[onesCount] = [];
                            if (!nextGroups[onesCount].some(g => g.binary === newBinary)) {
                                nextGroups[onesCount].push({ minterms: newMinterms, binary: newBinary, used: false });
                            }
                        }
                    });
                });
            }

            Object.values(groups).forEach(gList => {
                gList.forEach(item => {
                    if (!item.used && !allPrimeImplicants.some(pi => pi.binary === item.binary)) {
                        allPrimeImplicants.push(item);
                    }
                });
            });

            if (!mergedInThisStep) break;
            groups = nextGroups;
        }

        // 4. Set Coverage Selection
        const remainingMinterms = new Set(minterms);
        const selectedImplicants = [];

        while (remainingMinterms.size > 0) {
            let bestPI = null;
            let maxCover = -1;

            allPrimeImplicants.forEach(pi => {
                let coverCount = pi.minterms.filter(m => remainingMinterms.has(m)).length;
                if (coverCount > maxCover) {
                    maxCover = coverCount;
                    bestPI = pi;
                }
            });

            if (!bestPI || maxCover === 0) break;
            selectedImplicants.push(bestPI);
            bestPI.minterms.forEach(m => remainingMinterms.delete(m));
        }

        // 5. Convert back to string
        const finalTerms = selectedImplicants.map(pi => {
            let termStr = "";
            for (let i = 0; i < pi.binary.length; i++) {
                if (pi.binary[i] === '1') termStr += this.variables[i];
                else if (pi.binary[i] === '0') termStr += this.variables[i] + "'";
            }
            return termStr === "" ? "1" : termStr;
        });

        const reducedForm = [...new Set(finalTerms)].join(' + ');

         this.steps.push("");

this.steps.push(
  "=============================="
);

this.steps.push(
  "FINAL RESULT"
);

this.steps.push(
  "=============================="
);

this.steps.push(
  reducedForm
);

        this.steps.push(`🏁 **Final Simplified Form:** **${reducedForm}**`);
        return { result: reducedForm, steps: this.steps };
    }

    sanitizeTerm(term) {
    let tokens =
      term.match(/[A-Za-z]'?/g) || [];

    tokens =
      [...new Set(tokens)];

    tokens.sort(
  (a,b)=>
    a.localeCompare(b)
);

    return tokens.join('');
}

    isSubsetOf(termA, termB) {
        let tokensA = termA.match(/[A-Za-z]'?/g) || [];
        let tokensB = termB.match(/[A-Za-z]'?/g) || [];
        return tokensA.every(t => tokensB.includes(t));
    }

    getComplementaryDifference(termA, termB) {
        let tokensA = termA.match(/[A-Za-z]'?/g) || [];
        let tokensB = termB.match(/[A-Za-z]'?/g) || [];
        if (tokensA.length !== tokensB.length) return null;

        let diffs = [];
        let common = [];

        tokensA.forEach(tA => {
            if (tokensB.includes(tA)) {
                common.push(tA);
            } else {
                diffs.push(tA);
            }
        });

       


                if (diffs.length === 1) {
            let atom = diffs[0];
            let complement = atom.endsWith("'") ? atom.slice(0, -1) : atom + "'";
            if (tokensB.includes(complement)) {
                return common
  .sort(
    (a,b)=>
      a.localeCompare(b)
  )
  .join('');
            }
        }
        return null;
    }

    // ⚡ FIXED EVALUATOR ENGINE
    evaluateRow(expr, context) {
        let cleaned = expr.replace(/\s+/g, '');
        let terms = cleaned.split('+');

        let parsedTerms = terms.map(term => {
            // Step A: Replace NOT values safely (e.g., A' -> !A)
            let step = term.replace(/([A-Za-z])'/g, '!$1');
            
            // Step B: Only put '&&' AFTER letters, never after '!'
            step = step.replace(/([A-Za-z])(?=[A-Za-z!])/g, '$1&&');
            
            // Step C: FIXED — Properly escaped the multiplication asterisk
            step = step.replace(/\*/g, '&&');
            
            // FIXED: Added backticks around template literal
            return `(${step})`;
        });

        let finalCodeStr = parsedTerms.join('||');
        const varKeys = Object.keys(context);
        
        // FIXED: Added backticks around the engine body string template
        const engineBody = `const { ${varKeys.join(', ')} } = context; return !!(${finalCodeStr});`;
        
        try {
            return new Function('context', engineBody)(context);
        } catch (e) {
            // FIXED: Added backticks around the error message template literal
            throw new Error(`Syntax Error compiling token array tree: ${finalCodeStr}`);
        }
    }
}
















const globalResult =
  document.getElementById(
    'globalResult'
  );

const globalSteps =
  document.getElementById(
    'globalSteps'
  );


const zoomSlider =
  document.getElementById(
    'explanationZoom'
  );

const zoomValue =
  document.getElementById(
    'zoomValue'
  );

if(zoomSlider){

  const explanationContent =
  document.getElementById(
    'explanationContent'
  );

zoomSlider.addEventListener(
  'input',
  function(){

    const scale =
      this.value / 100;

    explanationContent.style.transform =
      `scale(${scale})`;

    explanationContent.style.transformOrigin =
      'top left';

    explanationContent.style.width =
      `${100/scale}%`;

    zoomValue.textContent =
      `${this.value}%`;
  }
);

}


  
globalSteps.textContent =
  'Boolean Algebra Lab Ready';

const mobileBtn =
  document.getElementById(
    'mobileMenuBtn'
  );

const tabs =
  document.querySelector(
    '.ns-tabs'
  );



// MOBILE MENU TOGGLE

if(
  mobileBtn &&
  tabs
){

  mobileBtn.addEventListener(
    'click',
    ()=>{

      if(
        tabs.style.display === 'flex'
      ){

        tabs.style.display =
          'none';

      }
      else{

        tabs.style.display =
          'flex';

      }

    }
  );

}



// TAB SWITCHING

document
  .querySelectorAll('.ns-tab')
  .forEach(tab=>{

    tab.addEventListener(
      'click',
      ()=>{

        document
          .querySelectorAll('.ns-tab')
          .forEach(
            t=>t.classList.remove(
              'active'
            )
          );

        document
          .querySelectorAll(
            '.tab-content'
          )
          .forEach(
            c=>c.classList.add(
              'hidden'
            )
          );

        tab.classList.add(
          'active'
        );


        globalResult.textContent='';

        globalSteps.textContent =
          'Boolean Algebra Lab Ready';

        const panel =
          document.getElementById(
            tab.dataset.tab
          );

        if(panel){

          panel.classList.remove(
            'hidden'
          );

        }

         const result =
      document.getElementById('globalResult');

   result.classList.toggle(
  'kmap-result',
  tab.dataset.tab === 'kmap'
);

        if(panel.id === "kmap"
){
    resetOutputPanel("💡 Answer","📦 Groupings Found")
    document.getElementById(
  "explanationZoom"
).disabled = false;
    buildGrid();
}

if(panel.id === "expression"
){
  resetBooleanTool();
    resetOutputPanel("💡 Answer","🧮 Detailed Algebraic Steps & Laws")
    
}

if(panel.id === "truth"
){
  resetTruthTable();
    resetOutputPanel("💡 Expression","📊 Selected Options")
    
}

if(panel.id === "circuit"
){

  resetCircuitDiagram();
    resetOutputPanel("💡 Logic Equation","🔌 Circuit (Logic) Diagram")
    
}

if(panel.id === "gates"
){

  resetGateTool();
    resetOutputPanel("💡 Logic Equation","🔲 Circuit (Logic), Symbolic Diagram & Truth Table")
    
}

        // CLOSE MOBILE MENU
        if(
          window.innerWidth <= 900
          &&
          tabs
        ){

          tabs.style.display =
            'none';

        }



      }
    );

  });

document.addEventListener(
  'DOMContentLoaded',
  () => {

    document
      .querySelector(
        '.ns-tab[data-tab="truth"]'
      )
      ?.click();
      resetTruthTable();

  }
);

// INITIAL STATE

if(
  window.innerWidth <= 900
  &&
  tabs
){

  tabs.style.display =
    'none';

}











function resetOutputPanel(
    answerTitle,
    explanationTitle
){

    document.getElementById(
        'answerTitle'
    ).innerHTML = answerTitle;

    document.getElementById(
        'explanationTitle'
    ).innerHTML = explanationTitle;

    globalResult.textContent = '';
    globalSteps.innerHTML = '';
}

function initializeKMap()
{
  return;
}

function evaluateExpression(
  expr,
  values
){

  let jsExpr = expr;

  Object.keys(values)
    .forEach(v=>{

      jsExpr =
        jsExpr.replace(
          new RegExp(
            v,
            'g'
          ),
          values[v]
        );

    });

  jsExpr = jsExpr
    .replace(
      /([01])'/g,
      (_,b)=>
        b==='1'
          ? '0'
          : '1'
    )
    .replace(
      /\./g,
      '&&'
    )
    .replace(
      /\+/g,
      '||'
    );

  return eval(jsExpr)
    ? 1
    : 0;

}

function generateCombinations(count){

  const rows = [];

  const total =
    Math.pow(
      2,
      count
    );

  for(
    let i=0;
    i<total;
    i++
  ){

    rows.push(

      i
      .toString(2)
      .padStart(
        count,
        '0'
      )
      .split('')

    );

  }

  return rows;

}

function extractVariables(expr){

  const matches =
    expr.match(/[A-Z]/gi) || [];

  return [
    ...new Set(
      matches.map(
        v=>v.toUpperCase()
      )
    )
  ].sort();

}









document
  .getElementById("gateType")
  .addEventListener(
    "change",
    loadGateExpression
  );

function loadGateExpression(){

  const gate =
    document.getElementById(
      "gateType"
    ).value;

  const exprInput =
    document.getElementById(
      "exprInput2"
    );

  switch(gate){

    case "AND":
      exprInput.value = "A.B";
      break;

    case "OR":
      exprInput.value = "A+B";
      break;

    case "NOT":
      exprInput.value = "A'";
      break;

    case "NAND":
      exprInput.value = "(A.B)'";
      break;

    case "NOR":
      exprInput.value = "(A+B)'";
      break;

    case "XOR":
      exprInput.value = "A'B+AB'";
      break;

    case "XNOR":
      exprInput.value = "AB+A'B'";
      break;

  }

}


document
  .getElementById("gateBtn")
  .addEventListener(
    "click",
    handleGatesButton
  );

function handleGatesButton(){

    const btn =
        document.getElementById(
            "gateBtn"
        );

    if(
        btn.dataset.mode === "reset"
    ){
        resetGateTool();
    }
    else{
        generateGateDiagram();
    }
}

function resetGateTool(){

    document.getElementById(
    "exprInput2"
).value = "A.B";

document.getElementById(
    "exprInput2"
).disabled = true;

  const stepList =
    document.getElementById("stepList");

if(stepList){
    stepList.innerHTML = "";
}


document.getElementById(
  "explanationZoom"
).disabled = true;


const errorBox =
    document.getElementById("errorBox");

if(errorBox){
    errorBox.style.display = "none";
}

    const btn =
        document.getElementById(
            "gateBtn"
        );

        globalResult.textContent = "";
globalSteps.innerHTML = "";

    btn.textContent =
        "Show Gate";

    btn.dataset.mode =
        "simplify";

    document.getElementById(
  "gateType"
).disabled = false;

        const gateSelect =
  document.getElementById(
    "gateType"
  );

gateSelect.selectedIndex = 0;
gateSelect.focus();
}

function generateGateDiagram(){

  const expr =
    document
      .getElementById(
        'exprInput2'
      )
      .value
      .trim();

  if(!expr){

    globalResult.textContent='';
    
    showErrorModal(
    'Please enter a Boolean expression.');

      return;
  }


const error = validateBooleanExpression(expr);

if(error){

    showErrorModal(
        error);

        return;
    }
 try{

  document
      .getElementById(
        'exprInput2'
      )
      .value = expr.toUpperCase();
document.getElementById(
  "explanationZoom"
).disabled = false;

      const btn =
    document.getElementById(
        "gateBtn"
    );

btn.textContent =
    "Reset";

btn.dataset.mode =
    "reset";

globalResult.textContent =   formatExpression(expr);

document.getElementById(
  "gateType"
).disabled = true;



drawCircuit(expr);
globalSteps.innerHTML += '<h3>Circuit (Logic) Diagram</h3>';


const gate1 =
    document.getElementById(
      "gateType"
    ).value;
  switch(gate1){

    case "AND":
 globalSteps.innerHTML += generateBasicAND();
      globalSteps.innerHTML += '<h3>Symbolic Diagram</h3>';
    break;
 case "OR":
 globalSteps.innerHTML += generateBasicOR();
      globalSteps.innerHTML += '<h3>Symbolic Diagram</h3>';
    break;

 case "NOT":
 globalSteps.innerHTML += generateBasicNOT();
      globalSteps.innerHTML += '<h3>Symbolic Diagram</h3>';
    break;

    case "NAND":
      globalSteps.innerHTML += generateBasicNAND();
      globalSteps.innerHTML += '<h3>Symbolic Diagram</h3>';
      
      break;

    case "NOR":
      globalSteps.innerHTML += generateBasicNOR();
      globalSteps.innerHTML += '<h3>Symbolic Diagram</h3>';
      
      break;

    case "XOR":
      globalSteps.innerHTML += generateBasicXOR();
      globalSteps.innerHTML += '<h3>Symbolic Diagram</h3>';
      
      break;

    case "XNOR":
      globalSteps.innerHTML += generateBasicXNOR();
      globalSteps.innerHTML += '<h3>Symbolic Diagram</h3>';
      
      break;

  }



generateTruthTableForGateOnly(expr);
globalSteps.innerHTML += '<h3>Truth Table</h3>';

  }
  catch(error){

    
     showErrorModal(
     "Syntax Error\n\n" +
        error.message);
  }
}

function generateTruthTableForGateOnly(expr){

    if(!expr){

        showErrorModal(
    'Please enter a Boolean expression.',);
        return;
    }

    try{

        const tokens =
            tokenize(expr);

        const parser =
            new Parser(tokens);

        const ast =
            parser.parse();

        const tableData =
            generateTruthTableFromAST(
                ast
            );

        if(
            !tableData ||
            tableData.length === 0
        ){

             showErrorModal(
    'Error in generating truth table.');

            return;
        }

            globalSteps.innerHTML += '<hr class=kmap-step-divider>' +
            renderTruthTableHTML(
                tableData
            ) + '<hr class=kmap-step-divider>';

       

    }
    catch(error){

       showErrorModal(
     "Syntax Error\n\n" + error.message);
          }
}

function generateBasicNAND() {
    return `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <!-- Inputs A & B -->
        <text x="10" y="30" font-family="monospace" font-size="16" font-weight="bold" fill="white">A</text>
        <text x="10" y="60" font-family="monospace" font-size="16" font-weight="bold" fill="white">B</text>
        <line x1="25" y1="25" x2="40" y2="25" stroke="#555" stroke-width="2"/>
        <line x1="25" y1="55" x2="40" y2="55" stroke="#555" stroke-width="2"/>
        
        <!-- NAND Body (D-Shape + Bubble) -->
        <path d="M 40,10 L 65,10 A 30,30 0 0,1 65,70 L 40,70 Z" fill="#e8f4f8" stroke="#0056b3" stroke-width="2"/>
        <circle cx="100" cy="40" r="5" fill="#fff" stroke="#0056b3" stroke-width="2"/>
        <text x="65" y="44" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0056b3" text-anchor="middle">NAND</text>
        
        <!-- Output -->
        <line x1="105" y1="40" x2="135" y2="40" stroke="#555" stroke-width="2"/>
        <text x="140" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">(A.B)'</text>
    </svg>`;
}

// --- 2. NOR GATE ---
function generateBasicNOR() {
    return `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <!-- Inputs A & B -->
        <text x="10" y="30" font-family="monospace" font-size="16" font-weight="bold" fill="white">A</text>
        <text x="10" y="60" font-family="monospace" font-size="16" font-weight="bold" fill="white">B</text>
        <line x1="25" y1="25" x2="48" y2="25" stroke="#555" stroke-width="2"/>
        <line x1="25" y1="55" x2="48" y2="55" stroke="#555" stroke-width="2"/>
        
        <!-- NOR Body (Shield Shape + Bubble) -->
        <path d="M 40,10 Q 75,10 95,40 Q 75,70 40,70 Q 60,40 40,10 Z" fill="#fdf3ec" stroke="#d35400" stroke-width="2"/>
        <circle cx="100" cy="40" r="5" fill="#fff" stroke="#d35400" stroke-width="2"/>
        <text x="65" y="44" font-family="sans-serif" font-size="10" font-weight="bold" fill="#d35400" text-anchor="middle">NOR</text>
        
        <!-- Output -->
        <line x1="105" y1="40" x2="135" y2="40" stroke="#555" stroke-width="2"/>
        <text x="140" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">(A+B)'</text>
    </svg>`;
}

// --- 3. XOR GATE ---
function generateBasicXOR() {
    return `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <!-- Inputs A & B -->
        <text x="10" y="30" font-family="monospace" font-size="16" font-weight="bold" fill="white">A</text>
        <text x="10" y="60" font-family="monospace" font-size="16" font-weight="bold" fill="white">B</text>
        <line x1="25" y1="25" x2="42" y2="25" stroke="#555" stroke-width="2"/>
        <line x1="25" y1="55" x2="42" y2="55" stroke="#555" stroke-width="2"/>
        
        <!-- XOR Body (Double Shield Shape) -->
        <path d="M 32,10 Q 52,40 32,70" fill="none" stroke="#6f42c1" stroke-width="2"/>
        <path d="M 40,10 Q 75,10 95,40 Q 75,70 40,70 Q 60,40 40,10 Z" fill="#f4e8f8" stroke="#6f42c1" stroke-width="2"/>
        <text x="65" y="44" font-family="sans-serif" font-size="10" font-weight="bold" fill="#6f42c1" text-anchor="middle">XOR</text>
        
        <!-- Output -->
        <line x1="95" y1="40" x2="135" y2="40" stroke="#555" stroke-width="2"/>
        <text x="140" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">A ⊕ B</text>
    </svg>`;
}

// --- 4. XNOR GATE ---
function generateBasicXNOR() {
    return `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <!-- Inputs A & B -->
        <text x="10" y="30" font-family="monospace" font-size="16" font-weight="bold" fill="white">A</text>
        <text x="10" y="60" font-family="monospace" font-size="16" font-weight="bold" fill="white">B</text>
        <line x1="25" y1="25" x2="42" y2="25" stroke="#555" stroke-width="2"/>
        <line x1="25" y1="55" x2="42" y2="55" stroke="#555" stroke-width="2"/>
        
        <!-- XNOR Body (Double Shield + Bubble) -->
        <path d="M 32,10 Q 52,40 32,70" fill="none" stroke="#28a745" stroke-width="2"/>
        <path d="M 40,10 Q 75,10 95,40 Q 75,70 40,70 Q 60,40 40,10 Z" fill="#e8f8ec" stroke="#28a745" stroke-width="2"/>
        <circle cx="100" cy="40" r="5" fill="#fff" stroke="#28a745" stroke-width="2"/>
        <text x="65" y="44" font-family="sans-serif" font-size="10" font-weight="bold" fill="#28a745" text-anchor="middle">XNOR</text>
        
        <!-- Output -->
        <line x1="105" y1="40" x2="135" y2="40" stroke="#555" stroke-width="2"/>
        <text x="140" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">(A⊕B)'</text>
    </svg>`;
}

function generateBasicAND() {
    return `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <!-- Inputs A & B -->
        <text x="10" y="30" font-family="monospace" font-size="16" font-weight="bold" fill="white">A</text>
        <text x="10" y="60" font-family="monospace" font-size="16" font-weight="bold" fill="white">B</text>
        <line x1="25" y1="25" x2="40" y2="25" stroke="#555" stroke-width="2"/>
        <line x1="25" y1="55" x2="40" y2="55" stroke="#555" stroke-width="2"/>
        
        <!-- AND Body (D-Shape, no bubble) -->
        <path d="M 40,10 L 65,10 A 30,30 0 0,1 65,70 L 40,70 Z" fill="#e8f4f8" stroke="#0056b3" stroke-width="2"/>
        <text x="60" y="44" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0056b3" text-anchor="middle">AND</text>
        
        <!-- Output -->
        <line x1="95" y1="40" x2="135" y2="40" stroke="#555" stroke-width="2"/>
        <text x="140" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">A.B</text>
    </svg>`;
}

// --- 2. OR GATE ---
function generateBasicOR() {
    return `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <!-- Inputs A & B -->
        <text x="10" y="30" font-family="monospace" font-size="16" font-weight="bold" fill="white">A</text>
        <text x="10" y="60" font-family="monospace" font-size="16" font-weight="bold" fill="white">B</text>
        <line x1="25" y1="25" x2="48" y2="25" stroke="#555" stroke-width="2"/>
        <line x1="25" y1="55" x2="48" y2="55" stroke="#555" stroke-width="2"/>
        
        <!-- OR Body (Shield Shape, no bubble) -->
        <path d="M 40,10 Q 75,10 95,40 Q 75,70 40,70 Q 60,40 40,10 Z" fill="#fdf3ec" stroke="#d35400" stroke-width="2"/>
        <text x="62" y="44" font-family="sans-serif" font-size="10" font-weight="bold" fill="#d35400" text-anchor="middle">OR</text>
        
        <!-- Output -->
        <line x1="95" y1="40" x2="135" y2="40" stroke="#555" stroke-width="2"/>
        <text x="140" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">A+B</text>
    </svg>`;
}

// --- 3. NOT GATE ---
function generateBasicNOT() {
    return `
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <!-- Input A (Centered) -->
        <text x="10" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">A</text>
        <line x1="25" y1="40" x2="45" y2="40" stroke="#555" stroke-width="2"/>
        
        <!-- NOT Body (Triangle + Bubble) -->
        <polygon points="45,15 85,40 45,65" fill="#e8f8ec" stroke="#28a745" stroke-width="2"/>
        <circle cx="90" cy="40" r="5" fill="#fff" stroke="#28a745" stroke-width="2"/>
        <text x="58" y="44" font-family="sans-serif" font-size="10" font-weight="bold" fill="#28a745" text-anchor="middle">NOT</text>
        
        <!-- Output -->
        <line x1="95" y1="40" x2="135" y2="40" stroke="#555" stroke-width="2"/>
        <text x="140" y="45" font-family="monospace" font-size="16" font-weight="bold" fill="white">A'</text>
    </svg>`;
}














function validateBooleanExpression(expr){

    expr = expr.trim().toUpperCase();

    if(!expr){
        return "Expression cannot be empty.";
    }

    // Allowed chars
    if(!/^[A-Z0-1()+.'\s]+$/.test(expr)){
        return "Expression contains invalid characters.";
    }

    // Start/end operator
    if(/^[+.]/.test(expr)){
        return "Expression cannot start with an operator.";
    }

    if(/[+.]$/.test(expr)){
        return "Expression cannot end with an operator.";
    }

    // Consecutive operators
    if(/[+.]{2,}/.test(expr)){
        return "Consecutive operators are not allowed.";
    }

    if(/\+\./.test(expr) || /\.\+/.test(expr)){
        return "Invalid operator sequence.";
    }

    // Empty parentheses
    if(/\(\s*\)/.test(expr)){
        return "Empty parentheses are not allowed.";
    }

    // Parenthesis balance
    let count = 0;

    for(const ch of expr){

        if(ch === '(') count++;
        if(ch === ')') count--;

        if(count < 0){
            return "Closing parenthesis without matching opening parenthesis.";
        }
    }

    if(count !== 0){
        return "Unbalanced parentheses.";
    }

    // Missing operator before (
    if(/[A-Z0-1']\(/.test(expr)){
        return "Missing operator before '('.";
    }

    // Missing operator after )
    if(/\)[A-Z0-1(]/.test(expr)){
        return "Missing operator after ')'.";
    }

    return null;
}


document
    .getElementById("drawBtn")
    .addEventListener(
        "click",
        handleDrawButton
    );

function handleDrawButton(){

    const btn =
        document.getElementById(
            "drawBtn"
        );

    if(
        btn.dataset.mode === "reset"
    ){
        resetCircuitDiagram();
    }
    else{
        generateLogicDiagram();
    }
}



function resetCircuitDiagram(){

    
document.getElementById(
    "exprInput"
).disabled = false;

document
  .querySelectorAll(
    'input[name="circuitMode"]'
  )
  .forEach(r => {

    r.disabled = false;

  });

  document.querySelector(
  'input[name="circuitMode"][value="basic"]'
).checked = true;


    const stepList =
    document.getElementById("stepList");

if(stepList){
    stepList.innerHTML = "";
}


document.getElementById(
  "explanationZoom"
).disabled = true;


const errorBox =
    document.getElementById("errorBox");

if(errorBox){
    errorBox.style.display = "none";
}

    const btn =
        document.getElementById(
            "drawBtn"
        );

        globalResult.textContent = "";
globalSteps.innerHTML = "";

    btn.textContent =
        "Draw/Generate";

    btn.dataset.mode =
        "simplify";

    document.getElementById(
        "exprInput"
    ).focus();
}

function generateLogicDiagram(){

  const expr =
    document
      .getElementById(
        'exprInput'
      )
      .value
      .trim();

  if(!expr){
    globalResult.textContent='';
    
    showErrorModal(
    'Please enter a Boolean expression.',
    () => {
        document
            .getElementById('exprInput')
            .focus();
    }
);

      return;
  }


const error = validateBooleanExpression(expr);

if(error){

    showErrorModal(
        error,
        () =>
            document
                .getElementById("exprInput")
                .focus()
    );

    return;
}


 try{

  document
      .getElementById(
        'exprInput'
      )
      .value = expr.toUpperCase();
document.getElementById(
  "explanationZoom"
).disabled = false;

      const btn =
    document.getElementById(
        "drawBtn"
    );

btn.textContent =
    "Reset";

btn.dataset.mode =
    "reset";

document.getElementById(
    "exprInput"
).disabled = true;

document
  .querySelectorAll(
    'input[name="circuitMode"]'
  )
  .forEach(r => {

    r.disabled = true;

  });


globalResult.textContent =   formatExpression(expr);

const mode =
  document.querySelector(
    'input[name="circuitMode"]:checked'
  )?.value || "basic";

switch(mode){

  case "basic":

    drawCircuit();
    break;

  case "nand":

    generateNandCircuit();
    break;

  case "nor":

    generateNorCircuit();
    break;

  case "nandnor":

    generateMixCircuit();
    break;

}

 if (
        document.getElementById(
            "chkTruthTableWD"
        )?.checked
    ) {

      generateTruthTableForGateOnly(expr);
    }




  }
  catch(error){

    
     showErrorModal(
     "Syntax Error\n\n" +
        error.message,
    () => {
        document
            .getElementById('exprInput')
            .focus();
    }
);
  }
}





//#region Truth Table Generation

document
  .getElementById("truthBtn")
  .addEventListener(
    "click",
    handleTruthButton
  );

function handleTruthButton(){

    const btn =
        document.getElementById(
            "truthBtn"
        );

    if(
        btn.dataset.mode === "reset"
    ){
        resetTruthTable();
    }
    else{
        generateTruthTable();
    }
}
function formatExpression(expr){

  return expr

    .toUpperCase()

    .replace(/\s+/g,'')

    .replace(/\+/g,' + ')
    .replace(/\./g,' · ')

    .replace(/\s+/g,' ')
    .trim();

}
function resetTruthTable(){

    document.getElementById(
        "truthExpression"
    ).disabled = false;

    document.getElementById(
  "explanationZoom"
).disabled = true;

    globalResult.textContent = "";

    globalSteps.innerHTML =
        "";

    const btn =
        document.getElementById(
            "truthBtn"
        );

         document
    .querySelectorAll(
      '.truth-options input[type="checkbox"]'
    )
    .forEach(
      cb => cb.disabled = false
    );

    btn.textContent =
        "Generate";

    btn.dataset.mode =
        "simplify";

    document.getElementById(
        "truthExpression"
    ).focus();

    
}


function generateSelectedForms(expr) {

    let html = "";

    const sections = [

        {
            checkbox: "chkCSOP",
            title: "Canonical SOP (CSOP)",
            fn: toolsGetCSOP
        },

        {
            checkbox: "chkCPOS",
            title: "Canonical POS (CPOS)",
            fn: toolsGetCPOS
        },

        {
            checkbox: "chkMinterm",
            title: "Minterm Expression",
            fn: toolsGetMintermExpr
        },

        {
            checkbox: "chkMaxterm",
            title: "Maxterm Expression",
            fn: toolsGetMaxtermExpr
        },

        {
            checkbox: "chkSigma",
            title: "Cardinal Sigma Form",
            fn: toolsGetCardinalSigma
        },

        {
            checkbox: "chkPi",
            title: "Cardinal Pi Form",
            fn: toolsGetCardinalPi
        },

        {
            checkbox: "chkDual",
            title: "Dual Form",
            fn: toolsGetDual
        },

        {
            checkbox: "chkInverse",
            title: "Inverse Form",
            fn: toolsGetInverse
        }
    ];

    let stepNo = 1;

    // Truth Table
    if (
        document.getElementById(
            "chkTruthTable"
        )?.checked
    ) {

        const env =
            toolsAnalyzeExpression(expr);

        const tableData =
            generateTruthTableFromAST(
                env.ast
            );

        html += `
            <div class="result-card">
                <h3>${stepNo++}. Truth Table</h3>
                ${renderTruthTableHTML(tableData)}
            </div>
        `;
    }

    // Other selected forms
    sections.forEach(section => {

        const chk =
            document.getElementById(
                section.checkbox
            );

        if (!chk?.checked) return;

        const result =
            section.fn(expr);

        html += `
            <div class="result-card">
                <h3>${stepNo++}. ${section.title}</h3>

                <div class="final-result">
                    ${result.result}
                </div>

                <details>
                    <summary>
                        View Derivation Steps
                    </summary>

                    <div class="steps-content">
                        ${result.html}
                    </div>

                </details>

            </div>
        `;
    });

    globalSteps.innerHTML = html;
}


function generateTruthTable(){

    const expr =
        document
            .getElementById(
                "truthExpression"
            )
            .value
            .trim()
            .toUpperCase();

    if(!expr){

        showErrorModal(
    'Please enter a Boolean expression.',
    () => {
        document
            .getElementById('truthExpression')
            .focus();
    }
);
        return;
    }

    try{

        const tokens =
            tokenize(expr);

        const parser =
            new Parser(tokens);

        const ast =
            parser.parse();

        const tableData =
            generateTruthTableFromAST(
                ast
            );

        if(
            !tableData ||
            tableData.length === 0
        ){

             showErrorModal(
    'Error in generating truth table.',
    () => {
        document
            .getElementById('truthExpression')
            .focus();
    }
);

            return;
        }

        globalResult.textContent =   formatExpression(expr);

         generateSelectedForms(expr);

        const btn =
            document.getElementById(
                "truthBtn"
            );

document.getElementById(
  "explanationZoom"
).disabled = false;

        btn.textContent =
            "Reset";

        btn.dataset.mode =
            "reset";

        document.getElementById(
            "truthExpression"
        ).disabled = true;

        document
    .querySelectorAll(
      '.truth-options input[type="checkbox"]'
    )
    .forEach(
      cb => cb.disabled = true
    );

    }
    catch(error){

       showErrorModal(
     "Syntax Error\n\n" +            error.message,
    () => {
        document
            .getElementById('truthExpression')
            .focus();
    }
);
      
          }
}

// Generates a 2D array representing a step-by-step truth table
function generateTruthTableFromAST(ast) {
    if (!ast) return [];

    // 1. Find all unique variables and sort them alphabetically
    const vars = new Set();
    function findVars(node) {
        if (!node) return;
        if (node.type === 'VAR') vars.add(node.value);
        if (node.left) findVars(node.left);
        if (node.right) findVars(node.right);
        if (node.child) findVars(node.child);
    }
    findVars(ast);
    const varList = Array.from(vars).sort();

    // 2. Collect all intermediate steps (Post-Order Traversal)
    const stepsMap = new Map(); // Map prevents duplicate columns like evaluating A.B twice
    function collectSteps(node) {
        if (!node) return;
        if (node.left) collectSteps(node.left);
        if (node.right) collectSteps(node.right);
        if (node.child) collectSteps(node.child);

        // We don't need dedicated columns for plain variables or constants
        if (node.type !== 'VAR' && node.type !== 'CONST') {
            const expr = stringify(node);
            if (!stepsMap.has(expr)) {
                stepsMap.set(expr, node);
            }
        }
    }
    collectSteps(ast);
    
    const stepExpressions = Array.from(stepsMap.keys());
    const stepNodes = Array.from(stepsMap.values());

    // 3. Setup the table headers [A, B, C, A.B, A.B + C]
    const headers = [...varList, ...stepExpressions];
    const table = [headers];

    // 4. Generate all 2^n combinations
    const numRows = Math.pow(2, varList.length);
    for (let i = 0; i < numRows; i++) {
        const row = [];
        const currentValues = {};

        // Fill base variable values (Standard binary counting)
        for (let j = 0; j < varList.length; j++) {
            const val = (i >> (varList.length - 1 - j)) & 1;
            row.push(val);
            currentValues[varList[j]] = val;
        }

        // 5. Evaluate each sub-expression using the current row's variables
        function evaluateNode(node) {
            if (node.type === 'VAR') return currentValues[node.value];
            if (node.type === 'CONST') return parseInt(node.value, 10);
            if (node.type === 'NOT') return evaluateNode(node.child) === 0 ? 1 : 0;
            if (node.type === 'AND') return (evaluateNode(node.left) === 1 && evaluateNode(node.right) === 1) ? 1 : 0;
            if (node.type === 'OR') return (evaluateNode(node.left) === 1 || evaluateNode(node.right) === 1) ? 1 : 0;
        }

        for (let node of stepNodes) {
            row.push(evaluateNode(node));
        }

        table.push(row);
    }

    return table;
}
// Converts the 2D array into an HTML table string
function renderTruthTableHTML(tableData){

    if(
        !tableData ||
        tableData.length === 0
    ){
        return "";
    }

    const lastCol =
        tableData[0].length - 1;

    let html = `

    <div style="
        margin-top:20px;
        
        border-radius:14px;
    ">

    <table style="
        min-width:max-content;
    border-collapse:separate;
    border-spacing:0;
        border-collapse:separate;
        font-family:'Segoe UI',Arial,sans-serif;
        background:#081326;
        color:white;
        border-radius:14px;
        overflow:hidden;
        box-shadow:
            0 8px 24px rgba(0,0,0,.35);
    ">
    `;

    // HEADER

    html += `<thead><tr>`;

    for(
        let i = 0;
        i < tableData[0].length;
        i++
    ){

        const head =
            tableData[0][i];

        const bg =
            i === lastCol
            ? 'linear-gradient(135deg,#00c853,#00a844)'
            : 'linear-gradient(135deg,#1a73e8,#1976d2)';

        html += `
        <th style="
    position:sticky;
    top:0;
    z-index:100;

    background:${bg};

    color:white;
    padding:16px 14px;

    border:1px solid rgba(255,255,255,.08);

    font-size:15px;
    font-weight:700;

    white-space:nowrap;
    letter-spacing:.5px;
">
            ${head}
        </th>
        `;
    }

    html += `</tr></thead><tbody>`;

    // DATA ROWS

    for(
        let r = 1;
        r < tableData.length;
        r++
    ){

        const rowBg =
            r % 2 === 0
            ? '#081326'
            : '#0d1b33';

        html += `
        <tr style="
            background:${rowBg};
        ">
        `;

        for(
            let c = 0;
            c < tableData[r].length;
            c++
        ){

            const cell =
                tableData[r][c];

            const isFinal =
                c === lastCol;

            const color =
                cell === 1
                ? '#00ff88'
                : '#b0b8c5';

            const weight =
                cell === 1
                ? '700'
                : '400';

            const bg =
                isFinal
                ? 'rgba(0,255,136,.08)'
                : 'transparent';

            html += `
            <td style="
                padding:14px;
                border:1px solid rgba(255,255,255,.06);
                text-align:center;
                background:${bg};
                color:${color};
                font-weight:${weight};
                font-size:15px;
            ">
                ${cell}
            </td>
            `;
        }

        html += `</tr>`;
    }

    html += `
    </tbody></table>
    </div>
    `;

    return html;
}


//#endregion




//#region Expression Solver

document
    .getElementById("solveBtn")
    .addEventListener(
        "click",
        handleButton
    );

function handleButton(){

    const btn =
        document.getElementById(
            "solveBtn"
        );

    if(
        btn.dataset.mode === "reset"
    ){
        resetBooleanTool();
    }
    else{
        solveExpression();
    }
}

function resetBooleanTool(){

    document.getElementById(
    "boolExpression"
).disabled = false;

    const stepList =
    document.getElementById("stepList");

if(stepList){
    stepList.innerHTML = "";
}


document.getElementById(
  "explanationZoom"
).disabled = true;


const errorBox =
    document.getElementById("errorBox");

if(errorBox){
    errorBox.style.display = "none";
}

    const btn =
        document.getElementById(
            "solveBtn"
        );

        globalResult.textContent = "";
globalSteps.innerHTML = "";

    btn.textContent =
        "Simplify";

    btn.dataset.mode =
        "simplify";

    document.getElementById(
        "boolExpression"
    ).focus();
}

function solveExpression(){

  const expr =
    document
      .getElementById(
        'boolExpression'
      )
      .value
      .trim();

  if(!expr){

    globalResult.textContent='';
    
    showErrorModal(
    'Please enter a Boolean expression.',
    () => {
        document
            .getElementById('boolExpression')
            .focus();
    }
);

    


    return;
  }

  try{

    const tokens =
      tokenize(expr);

    const parser =
      new Parser(tokens);

    let ast =
      parser.parse();

    let html='';

    html += `
    <hr class='kmap-step-divider'>
      <div class="step-item">

        <div class="rule-name">
          Original Expression
        </div>

        <div class="expression">
          ${stringify(ast)}
        </div>

      </div>
    `;

    let iter = 0;

    while(iter < 30){

      let state = {
        changed:false,
        ruleUsed:''
      };

      let cloned =
        JSON.parse(
          JSON.stringify(ast)
        );

      ast =
        applyRules(
          cloned,
          state
        );

      if(!state.changed)
        break;

      html += `
      <hr class='kmap-step-divider'>
        <div class="step-item">

          <div class="rule-name">
            ${state.ruleUsed}
          </div>

          <div class="expression">
            ${stringify(ast)}
          </div>

          
        </div>
      `;

      iter++;
    }

    html += `
    <hr class='kmap-step-divider'>
      <div class="step-item">

        <div class="rule-name final">
          Fully Reduced
        </div>

        <div class="expression">
          ${stringify(ast)}
        </div>

      </div>
      <hr class='kmap-step-divider'>
    `;

    globalResult.textContent =
      stringify(ast);

    globalSteps.innerHTML =
      html;
document.getElementById(
  "explanationZoom"
).disabled = false;

      const btn =
    document.getElementById(
        "solveBtn"
    );

btn.textContent =
    "Reset";

btn.dataset.mode =
    "reset";

document.getElementById(
    "boolExpression"
).disabled = true;

  }
  catch(error){

    showErrorModal(
     "Syntax Error\n\n" +
        error.message,
    () => {
        document
            .getElementById('boolExpression')
            .focus();
    }
);
    
  }
}

//#endregion




//#region Error Modal

function showErrorModal(
    message,
    callback = null
){

    document.getElementById(
        "errorMessage"
    ).innerText = message;

    document.getElementById(
        "errorModal"
    ).style.display = "flex";

    const modalOkBtn =
        document.getElementById(
            "modalOkBtn"
        );

    modalOkBtn.onclick = () => {

        closeErrorModal();

        if(callback){
            callback();
        }
    };
}

function closeErrorModal(){

    document.getElementById(
        "errorModal"
    ).style.display = "none";
}

//#endregion



































