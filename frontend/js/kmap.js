
// Solid, highly visible colors for outlining groups
const outlineColors = [
    '#e6194b', // Red
    '#ebdd24', // Yellow
    '#4363d8', // Blue
    '#f58231', // Orange
    '#911eb4', // Purple
    '#46f0f0', // Cyan
    '#f032e6', // Magenta
    '#bcf60c', // Lime
    '#000000'  // Black
];

// Resolves current grid configurations (variables, bin arrays)
function getGridConfig() {
    const numVars = parseInt(document.getElementById('varCount').value, 10);
    let rawVars = document.getElementById('varNames').value.split(',').map(s => s.trim()).filter(s => s);
    const defaults = ['A', 'B', 'C', 'D'];
    
    let vars = [];
    for(let i = 0; i < numVars; i++) {
        vars.push(rawVars[i] || defaults[i]);
    }

    let rowBins = numVars === 4 ? ['00', '01', '11', '10'] : ['0', '1'];
    let colBins = numVars === 2 ? ['0', '1'] : ['00', '01', '11', '10'];

    let rowVars = numVars <= 3 ? [vars[0]] : [vars[0], vars[1]];
    let colVars = numVars === 2 ? [vars[1]] : (numVars === 3 ? [vars[1], vars[2]] : [vars[2], vars[3]]);

    return { numVars, vars, rowBins, colBins, rowVars, colVars };
}

// Adjusts the text input field when the dropdown changes
function handleVarCountChange() {
    const numVars = parseInt(document.getElementById('varCount').value, 10);
    let rawVars = document.getElementById('varNames').value.split(',').map(s => s.trim()).filter(s => s);
    const defaults = ['A', 'B', 'C', 'D'];
    
    let newVars = [];
    for(let i = 0; i < numVars; i++) {
        newVars.push(rawVars[i] || defaults[i]);
    }
    document.getElementById('varNames').value = newVars.join(', ');
    buildGrid();
}


// Dynamically creates the HTML Table based on selected variables
function buildGrid() {
    const config = getGridConfig();
    const mode = document.querySelector('input[name="kmapMode"]:checked').value;
    const defaultVal = mode === 'SOP' ? '0' : '1';

    let html = '<table><tr>';
    html += `<td class="top-left">${config.rowVars.join('')} \\ ${config.colVars.join('')}</td>`;

    // Render Column Headers
    for (let cb of config.colBins) {
        html += `<th id="ch${cb}"></th>`;
    }
    html += '</tr>';

    // Render Rows & Cells
    for (let rb of config.rowBins) {
        html += `<tr><th id="rh${rb}"></th>`;
        for (let cb of config.colBins) {
            let minterm = parseInt(rb + cb, 2);
            html += `<td class="cell" id="c${minterm}" onclick="toggle(${minterm})">
                        <span class="minterm-label">${minterm}</span>
                        <span class="cell-value">${defaultVal}</span>
                     </td>`;
        }
        html += `</tr>`;
    }
    html += '</table>';

    document.getElementById('kmapContainer').innerHTML = html;
    updateMap(); // Solve and paint
}


function toggle(minterm) {
    const cell = document.getElementById('c' + minterm);
    const textNode = cell.querySelector('.cell-value');
    textNode.innerText = textNode.innerText === '0' ? '1' : '0';
    updateMap();
}

function clearMap() {
    const config = getGridConfig();
    const mode = document.querySelector('input[name="kmapMode"]:checked').value;
    const defaultVal = mode === 'SOP' ? '0' : '1';
    const maxMinterms = 1 << config.numVars;
    
    for (let i = 0; i < maxMinterms; i++) {
        let cell = document.getElementById('c' + i);
        if(cell) {
            cell.querySelector('.cell-value').innerText = defaultVal;
            cell.style.background = 'transparent';
            cell.style.boxShadow = 'none'; // Clear outline shadows
        }
    }
    updateMap();
}

// Helper to format binary headers into algebra (e.g. '01' -> A'B)
function formatTerm(binString, varNames, mode) {
    let term = [];
    for (let i = 0; i < binString.length; i++) {
        if (mode === 'SOP') {
            term.push(binString[i] === '0' ? varNames[i] + "'" : varNames[i]);
        } else {
            term.push(binString[i] === '0' ? varNames[i] : varNames[i] + "'");
        }
    }
    return mode === 'SOP' ? term.join('') : term.join('+');
}

// Dynamically changes table headers based on current mode & vars
function updateHeaders(config, mode) {
    config.rowBins.forEach(rb => {
        let algRow = formatTerm(rb, config.rowVars, mode);
        document.getElementById(`rh${rb}`).innerHTML = `<span style="font-size:1.1rem; font-weight:bold; color:#111;">${algRow}</span><br><span style="font-size:0.8rem; font-weight:normal; color:#666;">${rb}</span>`;
    });

    config.colBins.forEach(cb => {
        let algCol = formatTerm(cb, config.colVars, mode);
        document.getElementById(`ch${cb}`).innerHTML = `<span style="font-size:1.1rem; font-weight:bold; color:#111;">${algCol}</span><br><span style="font-size:0.8rem; font-weight:normal; color:#666;">${cb}</span>`;
    });
}

function binaryToTerm(bin, vars, mode){

    let term = [];

    for(let i=0;i<bin.length;i++){

        if(mode==="SOP"){

            term.push(
                bin[i]==='1'
                ? vars[i]
                : vars[i]+"'"
            );

        }else{

            term.push(
                bin[i]==='0'
                ? vars[i]
                : vars[i]+"'"
            );

        }
    }

    if(mode==="SOP"){
        return term.join('');
    }

    return '(' + term.join(' + ') + ')';
}

function analyzeGroup(
    coveredCells,
    numVars,
    vars,
    mode
){

    const binaries =
        coveredCells.map(
            cell =>
            cell
            .toString(2)
            .padStart(numVars,'0')
        );

    let common = [];
    let cancelled = [];

    for(
        let i = 0;
        i < numVars;
        i++
    ){

        const bit =
            binaries[0][i];

        const allSame =
            binaries.every(
                b => b[i] === bit
            );

        if(allSame){

            if(mode === 'SOP'){

                common.push(
                    bit === '1'
                    ? vars[i]
                    : vars[i] + "'"
                );

            }else{

                common.push(
                    bit === '0'
                    ? vars[i]
                    : vars[i] + "'"
                );

            }

        }else{

            cancelled.push(
                vars[i]
            );

        }
    }

    return {
        common,
        cancelled
    };
}


function getOutputVar(){

    return (
        document
        .getElementById(
            'varOutNames'
        )
        .value
        .trim() || 'F'
    );

}
function validateVariables(){

    const config =
        getGridConfig();

    const outputVar =
        getOutputVar();

    const allVars = [
        ...config.vars,
        outputVar
    ];

    const unique =
    new Set(
        allVars.map(
            v => v.toUpperCase()
        )
    );

    if(
        unique.size !==
        allVars.length
    ){

        showErrorModal(
    `Duplicate Variables Found\n
    Input Variables: ${config.vars.join(', ')}
     Output Variable: ${outputVar}\n
     All variable names must be unique.
     Defaults restored- Inputs: A, B, C, D and Output: F.`
);
        const defaults =
    ['A','B','C','D']
    .slice(0, config.numVars);

document.getElementById(
'varNames'
).value =
defaults.join(', ');

        document
        .getElementById(
            'varOutNames'
        )
        .value =
        'F';

        buildGrid();

        return false;
    }

    return true;
}


function updateMap() {

    const kmapresult = {
    answer: '',
    explanation: '',
    notation: ''
};

    const config = getGridConfig();
    if(
    !validateVariables()
){
        return;
}


const outputVar =
    getOutputVar();

const signature =
    `${outputVar}(${config.vars.join(',')})`;


    const mode = document.querySelector('input[name="kmapMode"]:checked').value;
    const targetVal = mode === 'SOP' ? '1' : '0'; 
    const maxMinterms = 1 << config.numVars;
    
    updateHeaders(config, mode);

    let targets = [];
    for (let i = 0; i < maxMinterms; i++) {
        let cell = document.getElementById('c' + i);
        if(cell) {
            const val = cell.querySelector('.cell-value').innerText;
            if (val === targetVal) targets.push(i);
            cell.style.background = 'transparent'; 
            cell.style.boxShadow = 'none'; // Reset outline shadows
        }
    }

    //const output = document.getElementById('expressionOutput');
    const legend = document.getElementById('groupLegend');
    //const globalSteps = document.getElementById('globalSteps');
    //const globalResult = document.getElementById('globalResult');
    
    legend.innerHTML = '';
    let explanation =
    "<hr class='kmap-step-divider'>";

    // Handle Edge Cases
    if (targets.length === 0) {

    kmapresult.answer =
        mode === 'SOP'
        ? '0'
        : '1';

    kmapresult.notation =
    mode === 'SOP'
    ? `${signature} = Σ ( )`
    : `${signature} = Π ( )`;

    explanation += `
<div class="step-item">
No cells selected.
</div>
<hr class='kmap-step-divider'>
Therefore:<br>
${kmapresult.notation} = ${kmapresult.answer}
<hr class='kmap-step-divider'>
`;

    kmapresult.explanation =
        explanation;

    displayKMapResult(kmapresult);

    return;
}

    if (targets.length === maxMinterms) {
        const notation =
    mode === 'SOP'
    ? `${signature} = Σ(${targets.join(',')})`
    : `${signature} = Π(${targets.join(',')})`;
    kmapresult.answer =
    mode === 'SOP'
    ? '1'
    : '0';

kmapresult.notation = notation;

        // Apply a full board border for "all cells covered"
        for (let i = 0; i < maxMinterms; i++) {
            // Using inset shadow for the outline
            document.getElementById('c' + i).style.boxShadow = `inset 0 0 0 4px ${outlineColors[0]}`; 
        }


        let allGroupName = "Group";

if(maxMinterms === 4)
    allGroupName = "Quad";
else if(maxMinterms === 8)
    allGroupName = "Octet";
else if(maxMinterms === 16)
    allGroupName = "Hexadecatet";


      explanation += `
<div class="step-item">
    ${allGroupName}
    (All ${maxMinterms} cells)
    → ${kmapresult.answer}
</div>
<hr class='kmap-step-divider'>
Therefore:<br>
${notation} = ${kmapresult.answer}
<hr class='kmap-step-divider'>
`;

kmapresult.explanation =
    explanation;

displayKMapResult(kmapresult);


return;
    }

    // Run Quine-McCluskey dynamically for N variables
    const implicants = runQuineMcCluskey(targets, config.numVars);
    
    let expressionParts = [];
    
    // --- Grid Setup for Outlines ---
    const numRows = config.rowBins.length;
    const numCols = config.colBins.length;
    const grid = [];
    const mintermToRC = {};
    for(let r = 0; r < numRows; r++) {
        grid[r] = [];
        for(let c = 0; c < numCols; c++) {
            let m = parseInt(config.rowBins[r] + config.colBins[c], 2);
            grid[r][c] = m;
            mintermToRC[m] = {r, c};
        }
    }

    let cellShadows = Array.from({ length: maxMinterms }, () => []);
    let borderOffsets = Array.from({ length: maxMinterms }, () => ({top: 0, bottom: 0, left: 0, right: 0}));
    // -------------------------------

    implicants.forEach((implicant, index) => {
        let term = [];
        let dashCount = 0;
        
        for (let i = 0; i < config.numVars; i++) {
            if(implicant[i] === '-') {
                dashCount++;
                continue;
            }

            if (mode === 'SOP') {
                if (implicant[i] === '1') term.push(config.vars[i]);
                if (implicant[i] === '0') term.push(config.vars[i] + "'");
            } else {
                if (implicant[i] === '0') term.push(config.vars[i]);
                if (implicant[i] === '1') term.push(config.vars[i] + "'");
            }
        }
        
        let termString = '';
        if (mode === 'SOP') {
            termString = term.join('');
        } else {
            termString = term.join(' + ');
            if (term.length > 1) termString = `(${termString})`; 
        }
        
        expressionParts.push(termString);

        // Pick color from the solid outline palette
        let color = outlineColors[index % outlineColors.length];
        
        // 1. Update Legend (using border for color-box instead of background)
        legend.innerHTML += `
            <div class="legend-item">
                <div class="color-box" style="border: 3px solid ${color}; background: transparent;"></div>
                <span>${termString}</span>
            </div>
        `;

        // 2. Identify Group Size Name
        let groupSize = Math.pow(2, dashCount);
        let groupName = "Group";
        if (groupSize === 1) groupName = "Singlet";
        else if (groupSize === 2) groupName = "Duplet/Pair";
        else if (groupSize === 4) groupName = "Quad";
        else if (groupSize === 8) groupName = "Octet";
        else if (groupSize === 16) groupName = "Hexadecatet";

        // Record the implicant shape for outline calculation
        let coveredMinterms = new Set();
        let coveredCells = [];
        for (let i = 0; i < maxMinterms; i++) {
            let bin = i.toString(2).padStart(config.numVars, '0');
            if (covers(implicant, bin)) {
                coveredMinterms.add(i);
                coveredCells.push(i);
            }
        }
        
        // 3. Update Steps Panel (using custom formatting)
        let originalTerms = coveredCells.map(cell => {
    const bin =
        cell.toString(2)
        .padStart(config.numVars,'0');

    return binaryToTerm(
        bin,
        config.vars,
        mode
    );

}).join(
    mode === 'SOP'
        ? ' + '
        : ' . '
);

        const analysis =
    analyzeGroup(
        coveredCells,
        config.numVars,
        config.vars,mode
    );

        explanation += `
        <div class="step-item">
            <span class="color-box" style="border: 3px solid ${color}; background: transparent; margin-right: 8px;"></span>
            <div>
                <strong>${groupName}</strong>
                <span class="cells">(Cells: ${coveredCells.join(', ')})</span>
            </div>
            <div class="original">
            <div style="
color:${color};
font-weight:bold;
">
                ${originalTerms}
</div>
<div class="common-vars">
    <i>✓ Common:
    ${analysis.common.join(', ')}</i>
</div>

<div class="cancelled-vars">
    <i>✗ Cancelled:
    ${analysis.cancelled.join(', ')}</i>
</div>

<div class="original">
     → <strong class="reduced" > ${termString} </strong>
</div>
            </div>
        </div>
        <hr class='kmap-step-divider'>
        `;

        // 4. Calculate Outlines for this group
        let thickness = 4; // Outline border thickness
        
        coveredMinterms.forEach(m => {
            let {r, c} = mintermToRC[m];
            
            // Look at neighbors, wrapping around with modulo arithmetic
            let up = grid[(r - 1 + numRows) % numRows][c];
            let down = grid[(r + 1) % numRows][c];
            let left = grid[r][(c - 1 + numCols) % numCols];
            let right = grid[r][(c + 1) % numCols];

            // If a neighbor is NOT in the group, we draw a border on that edge
            if (!coveredMinterms.has(up)) {
                cellShadows[m].push(`inset 0px ${thickness + borderOffsets[m].top}px 0px 0px ${color}`);
                borderOffsets[m].top += thickness;
            }
            if (!coveredMinterms.has(down)) {
                cellShadows[m].push(`inset 0px -${thickness + borderOffsets[m].bottom}px 0px 0px ${color}`);
                borderOffsets[m].bottom += thickness;
            }
            if (!coveredMinterms.has(left)) {
                cellShadows[m].push(`inset ${thickness + borderOffsets[m].left}px 0px 0px 0px ${color}`);
                borderOffsets[m].left += thickness;
            }
            if (!coveredMinterms.has(right)) {
                cellShadows[m].push(`inset -${thickness + borderOffsets[m].right}px 0px 0px 0px ${color}`);
                borderOffsets[m].right += thickness;
            }
        });
    });

    // Apply the accumulated border outlines (box-shadows) to the actual HTML cells
    for (let i = 0; i < maxMinterms; i++) {
        const cell = document.getElementById('c' + i);
        if(!cell) continue;

        if (cellShadows[i].length > 0) {
            cell.style.boxShadow = cellShadows[i].join(', ');
        }
    }

    const fexpr = expressionParts.join(mode === 'SOP' ? ' + ' : ' . ');
    const notation =
    mode === 'SOP'
    ? `${signature} = Σ(${targets.join(',')})`
    : `${signature} = Π(${targets.join(',')})`;
    
   explanation +=
    "Therefore:<br>" +
    notation +
    " = " +
    fexpr +
    "<hr class='kmap-step-divider'>";

kmapresult.answer = fexpr;
kmapresult.notation = notation;
kmapresult.explanation = explanation;

displayKMapResult(kmapresult);

}


function displayKMapResult(kmapresult){

    const config = getGridConfig();

const resultSignature =
    `${getOutputVar()}(${config.vars.join(',')})`;

document.getElementById(
    'globalResult'
).textContent =
    `${resultSignature} = ${kmapresult.answer}`;

    document.getElementById(
        'globalSteps'
    ).innerHTML =
        kmapresult.explanation;

    document.getElementById(
        'expressionOutput'
    ).innerText =
        kmapresult.notation;
}
// --- QUINE-MCCLUSKEY ALGORITHM ---
function covers(prime, minterm) {
    for (let i = 0; i < prime.length; i++) {
        if (prime[i] !== '-' && prime[i] !== minterm[i]) return false;
    }
    return true;
}

function runQuineMcCluskey(indices, numVars) {
    let implicants = new Set(indices.map(m => m.toString(2).padStart(numVars, '0')));
    let primeImplicants = new Set();
    let combined = true;

    // Phase 1: Find Prime Implicants
    while (combined) {
        combined = false;
        let nextImplicants = new Set();
        let used = new Set();
        let impArr = Array.from(implicants);

        for (let i = 0; i < impArr.length; i++) {
            for (let j = i + 1; j < impArr.length; j++) {
                let diffs = 0;
                let diffIdx = -1;
                for (let k = 0; k < numVars; k++) {
                    if (impArr[i][k] !== impArr[j][k]) {
                        diffs++;
                        diffIdx = k;
                    }
                }
                if (diffs === 1) {
                    let newImp = impArr[i].substring(0, diffIdx) + '-' + impArr[i].substring(diffIdx + 1);
                    nextImplicants.add(newImp);
                    used.add(impArr[i]);
                    used.add(impArr[j]);
                    combined = true;
                }
            }
        }
        for (let imp of impArr) {
            if (!used.has(imp)) primeImplicants.add(imp);
        }
        implicants = nextImplicants;
    }
    for (let imp of implicants) primeImplicants.add(imp);

    // Phase 2: Essential Prime Implicants (The Chart)
    let primes = Array.from(primeImplicants);
    let chart = {};
    for (let m of indices) {
        let bin = m.toString(2).padStart(numVars, '0');
        chart[bin] = primes.filter(p => covers(p, bin));
    }

    let essential = [];
    let uncovered = new Set(indices.map(m => m.toString(2).padStart(numVars, '0')));

    for (let m in chart) {
        if (chart[m].length === 1 && uncovered.has(m)) {
            let p = chart[m][0];
            essential.push(p);
            for (let m2 of Array.from(uncovered)) {
                if (covers(p, m2)) uncovered.delete(m2);
            }
        }
    }

    // Greedy coverage for overlapping non-essential implicants
    while (uncovered.size > 0) {
        let bestP = null;
        let bestCount = -1;
        for (let p of primes) {
            let count = Array.from(uncovered).filter(m => covers(p, m)).length;
            if (count > bestCount) {
                bestCount = count;
                bestP = p;
            }
        }
        if(!bestP) break; // Safety break
        essential.push(bestP);
        for (let m2 of Array.from(uncovered)) {
            if (covers(bestP, m2)) uncovered.delete(m2);
        }
    }

    return essential; 
}


