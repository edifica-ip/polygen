

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


        globalResult.value='';

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
    buildGrid();
}

if(panel.id === "expression"
){
  resetBooleanTool();
    resetOutputPanel("💡 Answer","🧮 Detailed Algebraic Steps & Laws")
    
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

    globalResult.value = '';
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
function resetTruthTable(){

    document.getElementById(
        "truthExpression"
    ).value = "";

    document.getElementById(
        "truthExpression"
    ).disabled = false;

    globalResult.value = "";

    globalSteps.innerHTML =
        "Boolean Algebra Lab Ready";

    const btn =
        document.getElementById(
            "truthBtn"
        );

    btn.textContent =
        "Generate Truth Table";

    btn.dataset.mode =
        "simplify";

    document.getElementById(
        "truthExpression"
    ).focus();
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
            "Please enter a Boolean expression."
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
                "Unable to generate truth table."
            );

            return;
        }

        globalResult.value =            expr;

        globalSteps.innerHTML =
            renderTruthTableHTML(
                tableData
            );

        const btn =
            document.getElementById(
                "truthBtn"
            );

        btn.textContent =
            "Reset";

        btn.dataset.mode =
            "reset";

        document.getElementById(
            "truthExpression"
        ).disabled = true;

    }
    catch(error){

        showErrorModal(
            "Syntax Error\n\n" +
            error.message
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
        overflow-x:auto;
        border-radius:14px;
    ">

    <table style="
        width:100%;
        border-collapse:collapse;
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

    html += `<tr>`;

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

    html += `</tr>`;

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
    </table>
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
).value = "";

document.getElementById(
    "boolExpression"
).disabled = false;

    const stepList =
    document.getElementById("stepList");

if(stepList){
    stepList.innerHTML = "";
}

const errorBox =
    document.getElementById("errorBox");

if(errorBox){
    errorBox.style.display = "none";
}

    const btn =
        document.getElementById(
            "solveBtn"
        );

        globalResult.value = "";
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

    globalResult.value='';
    
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
      <div class="step-item">

        <div class="rule-name final">
          Fully Reduced
        </div>

        <div class="expression">
          ${stringify(ast)}
        </div>

      </div>
    `;

    globalResult.value =
      stringify(ast);

    globalSteps.innerHTML =
      html;


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
        error.message
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



































