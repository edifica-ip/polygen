const groupColors = [
    'rgba(255, 99, 132, 0.5)',   // Red/Pink
    'rgba(54, 162, 235, 0.5)',   // Blue
    'rgba(255, 206, 86, 0.6)',   // Yellow
    'rgba(75, 192, 192, 0.5)',   // Teal
    'rgba(153, 102, 255, 0.5)',  // Purple
    'rgba(255, 159, 64, 0.5)',   // Orange
    'rgba(199, 199, 199, 0.5)'   // Grey
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



function binaryToTerm(bin, vars, mode) {

    let term = [];

    for(let i = 0; i < bin.length; i++) {

        if(mode === 'SOP') {

            term.push(
                bin[i] === '1'
                ? vars[i]
                : vars[i] + "'"
            );

        } else {

            term.push(
                bin[i] === '0'
                ? vars[i]
                : vars[i] + "'"
            );

        }
    }

    return term.join('');
}



function updateMap() {
    const config = getGridConfig();
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
        }
    }

    const output = document.getElementById('expressionOutput');
    const legend = document.getElementById('groupLegend');
    //const stepsPanel = document.getElementById('stepsPanel');
    //const stepsList = document.getElementById('stepsList');
    
    legend.innerHTML = '';
    //stepsList.innerHTML = '';
    globalSteps.innerHTML = "<h3>Groupings Found</h3><hr class='kmap-step-divider'>";

    // Handle Edge Cases
    if (targets.length === 0) {

    output.innerText =
        mode === 'SOP'
        ? 'Σ()'
        : 'Π()';

    globalResult.value =
        mode === 'SOP'
        ? '0'
        : '1';

    globalSteps.innerHTML =
        `<div class="step-item">
            No cells selected.
        </div>`;

    return;
}
    if (targets.length === maxMinterms) {

    const notation =
        mode === 'SOP'
        ? `Σ(${targets.join(',')})`
        : `Π(${targets.join(',')})`;

    output.innerText = notation;
    globalResult.value =
        mode === 'SOP' ? '1' : '0';

    for (let i = 0; i < maxMinterms; i++) {
        document.getElementById('c' + i)
            .style.background = groupColors[0];
    }

    globalSteps.innerHTML =
        `<div class="step-item">
            Entire K-Map selected → ${
                mode === 'SOP' ? '1' : '0'
            }
        </div>`;

    return;
}

    // Run Quine-McCluskey dynamically for N variables
    const result = runQuineMcCluskey(targets, config.numVars);
    
    let expressionParts = [];
    let cellGroups = Array.from({ length: maxMinterms }, () => []);

    result.forEach((implicant, index) => {
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

        let color = groupColors[index % groupColors.length];
        
        // 1. Update Legend
        legend.innerHTML += `
            <div class="legend-item">
                <div class="color-box" style="background-color: ${color}"></div>
                <span>${termString}</span>
            </div>
        `;

        // 2. Identify Group Size Name
        let groupSize = Math.pow(2, dashCount);
        let groupName = "Group";
        if (groupSize === 1) groupName = "Singlet";
        else if (groupSize === 2) groupName = "Pair";
        else if (groupSize === 4) groupName = "Quad";
        else if (groupSize === 8) groupName = "Octet";
        
        // Record the color and implicant shape for any matching cells
        let coveredCells = [];
        for (let i = 0; i < maxMinterms; i++) {
            let bin = i.toString(2).padStart(config.numVars, '0');
            if (covers(implicant, bin)) {
                cellGroups[i].push({ color, implicant });
                coveredCells.push(i);
            }
        }
        
        // 3. Update Steps Panel
       let originalTerms = coveredCells
    .map(cell => {

        const bin =
            cell
            .toString(2)
            .padStart(
                config.numVars,
                '0'
            );

        return binaryToTerm(
            bin,
            config.vars,
            mode
        );

    })
    .join(' + ');

globalSteps.innerHTML += `

<div class="step-item">

    <span class="color-box"
          style="background:${color}">
    </span>

    <div>
        <strong>${groupName}</strong>
        <span class="cells">
            (Cells: ${coveredCells.join(', ')})
        </span>
    </div>

    <div class="original">
        ${originalTerms} <div class="reduced">
        → ${termString}
    </div>
    </div>

    

</div>
<hr class = 'kmap-step-divider'>
`;
    });

    // Apply the colors diagonally for all overlaps
    for (let i = 0; i < maxMinterms; i++) {
        const groups = cellGroups[i];
        const cell = document.getElementById('c' + i);
        if(!cell) continue;

        if (groups.length === 1) {
            cell.style.background = groups[0].color;
            
        } else if (groups.length > 1) {
            let colors = groups.map(g => g.color);
            let step = 100 / colors.length;
            let gradientStops = colors.map((c, idx) => `${c} ${idx * step}%, ${c} ${(idx + 1) * step}%`);
            cell.style.background = `linear-gradient(135deg, ${gradientStops.join(', ')})`;

        }
    }

    const fexpr = expressionParts.join(mode === 'SOP' ? ' + ' : ' . ');

    
    const notation =
 mode === 'SOP' ? `Σ(${targets.join(',')})` : `Π(${targets.join(',')})`;
  globalResult.value = fexpr;
  output.innerText = notation;



    //stepsPanel.style.display = result.length > 0 ? 'block' : 'none';
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

// Initialize on load to set up the default UI states
buildGrid();