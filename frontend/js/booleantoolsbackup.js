function toolsTokenize(str) {
    str = str.replace(/\./g, '*'); 
    const rawTokens = [];
    const regex = /([A-Za-z01]|\+|\*|\!|\'|\(|\))/g;
    let match;
    while ((match = regex.exec(str)) !== null) rawTokens.push(match[0]);
    if (rawTokens.length === 0) throw new Error("Expression is empty.");

    const finalTokens = [];
    for (let i = 0; i < rawTokens.length; i++) {
        finalTokens.push(rawTokens[i]);
        if (i < rawTokens.length - 1) {
            const curr = rawTokens[i];
            const next = rawTokens[i+1];
            const expectsAndAfter = /^[A-Za-z01\)]$/.test(curr) || curr === "'";
            const expectsAndBefore = /^[A-Za-z01\!\(]$/.test(next);
            if (expectsAndAfter && expectsAndBefore) finalTokens.push('*');
        }
    }
    return finalTokens;
}

class ToolsParser {
    constructor(tokens) { this.tokens = tokens; this.pos = 0; }
    parse() { 
        let result = this.parseOr(); 
        if (this.pos < this.tokens.length) throw new Error("Incomplete expression.");
        return result;
    }
    parseOr() {
        let left = this.parseAnd();
        while (this.peek() === '+') { this.consume(); left = { type: 'OR', left: left, right: this.parseAnd() }; }
        return left;
    }
    parseAnd() {
        let left = this.parseNot();
        while (this.peek() === '*') { this.consume(); left = { type: 'AND', left: left, right: this.parseNot() }; }
        return left;
    }
    parseNot() {
        if (this.peek() === '!') { this.consume(); return { type: 'NOT', child: this.parseNot() }; }
        return this.parsePostfix();
    }
    parsePostfix() {
        let node = this.parsePrimary();
        while (this.peek() === "'") { this.consume(); node = { type: 'NOT', child: node }; }
        return node;
    }
    parsePrimary() {
        if (this.pos >= this.tokens.length) throw new Error("Missing variable.");
        const token = this.consume();
        if (token === '(') {
            const node = this.parseOr();
            if (this.consume() !== ')') throw new Error("Missing ')'.");
            return node;
        }
        if (/[A-Za-z]/.test(token)) return { type: 'VAR', value: token };
        if (/[01]/.test(token)) return { type: 'CONST', value: token };
        throw new Error(`Unexpected token: '${token}'`);
    }
    peek() { return this.tokens[this.pos]; }
    consume() { return this.tokens[this.pos++]; }
}

function toolsGetVariables(ast) {
    let vars = new Set();
    function traverse(n) {
        if (!n) return;
        if (n.type === 'VAR') vars.add(n.value);
        traverse(n.child); traverse(n.left); traverse(n.right);
    }
    traverse(ast);
    return Array.from(vars).sort();
}

function toolsEvaluate(node, env) {
    if (node.type === 'VAR') return env[node.value];
    if (node.type === 'CONST') return parseInt(node.value);
    if (node.type === 'NOT') return toolsEvaluate(node.child, env) === 1 ? 0 : 1;
    if (node.type === 'AND') return (toolsEvaluate(node.left, env) === 1 && toolsEvaluate(node.right, env) === 1) ? 1 : 0;
    if (node.type === 'OR') return (toolsEvaluate(node.left, env) === 1 || toolsEvaluate(node.right, env) === 1) ? 1 : 0;
}

function toolsStringify(node) {
    if (!node) return "";
    switch (node.type) {
        case 'VAR': return node.value;
        case 'CONST': return node.value;
        case 'NOT': 
            let inner = toolsStringify(node.child);
            return (node.child.type === 'OR' || node.child.type === 'AND') ? `(${inner})'` : `${inner}'`;
        case 'AND': 
            let lA = node.left.type === 'OR' ? `(${toolsStringify(node.left)})` : toolsStringify(node.left);
            let rA = node.right.type === 'OR' ? `(${toolsStringify(node.right)})` : toolsStringify(node.right);
            return `${lA}.${rA}`;
        case 'OR': 
            return `${toolsStringify(node.left)} + ${toolsStringify(node.right)}`;
    }
}

// --- 2. ALGEBRAIC EXPANSION HELPERS ---
function toolsGetSOPTerms(node) {
    if (!node) return [];
    if (node.type === 'OR') return [...toolsGetSOPTerms(node.left), ...toolsGetSOPTerms(node.right)];
    return [toolsStringify(node)];
}

function toolsGetPOSTerms(node) {
    if (!node) return [];
    if (node.type === 'AND') return [...toolsGetPOSTerms(node.left), ...toolsGetPOSTerms(node.right)];
    return [toolsStringify(node)];
}

function toolsGenerateAlgebraicExpansionSOP(ast, allVars) {
    let terms = toolsGetSOPTerms(ast);
    let html = "";
    let finalExpandedTerms = [];
    
    terms.forEach(termStr => {
        let cleanTerm = termStr.replace(/[\(\)]/g, ''); 
        let presentVars = allVars.filter(v => cleanTerm.includes(v));
        let missingVars = allVars.filter(v => !presentVars.includes(v));
        
        if (missingVars.length === 0) {
            finalExpandedTerms.push(cleanTerm);
            html += `<div class="step">- <strong>${cleanTerm}</strong> is complete.</div>`;
        } else {
            let currentExpansions = [cleanTerm];
            html += `<div class="expansion-block">
                        <div class="step" style="color:#0056b3; font-weight:bold;">Expanding Term: ${cleanTerm}</div>
                        <div class="step" style="font-size:0.85rem; color:#666;">Missing vars: {${missingVars.join(', ')}}</div>`;
            
            missingVars.forEach(mv => {
                let nextExpansions = [];
                currentExpansions.forEach(exp => {
                    nextExpansions.push(`${exp}.${mv}`);
                    nextExpansions.push(`${exp}.${mv}'`);
                });
                html += `<div class="step" style="margin-left:10px;">
                            &rarr; Multiply by (${mv} + ${mv}'):<br>
                            &nbsp;&nbsp;&nbsp; ${currentExpansions.map(e => `${e}.(${mv} + ${mv}')`).join(' + ')}<br>
                            &nbsp;&nbsp;&nbsp; = <strong>${nextExpansions.join(' + ')}</strong>
                         </div>`;
                currentExpansions = nextExpansions;
            });
            html += `</div>`;
            finalExpandedTerms.push(...currentExpansions);
        }
    });
    
    let sortedTerms = finalExpandedTerms.map(t => {
         let parts = t.split('.').map(p=>p.trim());
         parts.sort((a, b) => a.replace(/[^A-Za-z]/g, '').localeCompare(b.replace(/[^A-Za-z]/g, '')));
         return parts.join('.');
    });
    let uniqueTerms = [...new Set(sortedTerms)];
    
    html += `<div class="step" style="margin-top:15px; border-top:1px dashed #ccc; padding-top:10px;">
                <strong>Combined Unsorted:</strong><br> ${finalExpandedTerms.join(' + ')}
             </div>`;
    html += `<div class="step">
                <strong>Remove Duplicates (X + X = X):</strong><br> ${uniqueTerms.join(' + ')}
             </div>`;
    
    return { html, uniqueTerms };
}

function toolsGenerateAlgebraicExpansionPOS(ast, allVars) {
    let terms = toolsGetPOSTerms(ast);
    let html = "";
    let finalExpandedTerms = [];
    
    terms.forEach(termStr => {
        let cleanTerm = termStr.replace(/[\(\)]/g, ''); 
        let presentVars = allVars.filter(v => cleanTerm.includes(v));
        let missingVars = allVars.filter(v => !presentVars.includes(v));
        
        if (missingVars.length === 0) {
            finalExpandedTerms.push(`(${cleanTerm})`);
            html += `<div class="step">- <strong>(${cleanTerm})</strong> is complete.</div>`;
        } else {
            let currentExpansions = [cleanTerm]; 
            html += `<div class="expansion-block">
                        <div class="step" style="color:#0056b3; font-weight:bold;">Expanding Term: (${cleanTerm})</div>
                        <div class="step" style="font-size:0.85rem; color:#666;">Missing vars: {${missingVars.join(', ')}}</div>`;
            
            missingVars.forEach(mv => {
                let nextExpansions = [];
                currentExpansions.forEach(exp => {
                    nextExpansions.push(`${exp} + ${mv}`);
                    nextExpansions.push(`${exp} + ${mv}'`);
                });
                html += `<div class="step" style="margin-left:10px;">
                            &rarr; Add (${mv}.${mv}'):<br>
                            &nbsp;&nbsp;&nbsp; ${currentExpansions.map(e => `(${e} + ${mv}.${mv}')`).join(' . ')}<br>
                            &nbsp;&nbsp;&nbsp; = <strong>${nextExpansions.map(e=>`(${e})`).join(' . ')}</strong>
                         </div>`;
                currentExpansions = nextExpansions;
            });
            html += `</div>`;
            finalExpandedTerms.push(...currentExpansions.map(e=>`(${e})`));
        }
    });
    
    let sortedTerms = finalExpandedTerms.map(t => {
         let clean = t.replace(/[\(\)]/g, '');
         let parts = clean.split('+').map(p=>p.trim());
         parts.sort((a, b) => a.replace(/[^A-Za-z]/g, '').localeCompare(b.replace(/[^A-Za-z]/g, '')));
         return `(${parts.join(' + ')})`;
    });
    let uniqueTerms = [...new Set(sortedTerms)];
    
    html += `<div class="step" style="margin-top:15px; border-top:1px dashed #ccc; padding-top:10px;">
                <strong>Combined Unsorted:</strong><br> ${finalExpandedTerms.join(' . ')}
             </div>`;
    html += `<div class="step">
                <strong>Remove Duplicates (X . X = X):</strong><br> ${uniqueTerms.join(' . ')}
             </div>`;
    
    return { html, uniqueTerms };
}

// --- 3. DUAL & INVERSE TRANSFORMERS ---
function toolsToDual(node) {
    if (!node) return null;
    if (node.type === 'VAR') return { ...node };
    if (node.type === 'CONST') return { type: 'CONST', value: node.value === '1' ? '0' : '1' };
    if (node.type === 'NOT') return { type: 'NOT', child: toolsToDual(node.child) };
    if (node.type === 'AND') return { type: 'OR', left: toolsToDual(node.left), right: toolsToDual(node.right) };
    if (node.type === 'OR') return { type: 'AND', left: toolsToDual(node.left), right: toolsToDual(node.right) };
}

function toolsToInverse(node) {
    if (!node) return null;
    if (node.type === 'VAR') return { type: 'NOT', child: { ...node } };
    if (node.type === 'CONST') return { type: 'CONST', value: node.value === '1' ? '0' : '1' };
    if (node.type === 'NOT') return { ...node.child }; 
    if (node.type === 'AND') return { type: 'OR', left: toolsToInverse(node.left), right: toolsToInverse(node.right) };
    if (node.type === 'OR') return { type: 'AND', left: toolsToInverse(node.left), right: toolsToInverse(node.right) };
}

// --- 4. INDEPENDENT HTML GENERATOR FUNCTIONS ---

function toolsBuildCardHtml(title, finalResult, stepsHtml) {
    return `
        <div class="result-card">
            <h3>${title}</h3>
            <div class="final-result">F = <span class="final-expr">${finalResult}</span></div>
            <details>
                <summary>View Derivation Steps</summary>
                <div class="steps-content">${stepsHtml}</div>
            </details>
        </div>
    `;
}

function toolsAnalyzeExpression(input) {
    const ast = new ToolsParser(toolsTokenize(input)).parse();
    const vars = toolsGetVariables(ast);
    if(vars.length === 0) throw new Error("No variables found. Only constants used.");

    const isPOSFlow = (ast.type === 'AND');
    const numRows = Math.pow(2, vars.length);
    let minterms = [], maxterms = [];

    for(let i = 0; i < numRows; i++) {
        let bin = i.toString(2).padStart(vars.length, '0');
        let env = {};
        vars.forEach((v, idx) => env[v] = parseInt(bin[idx]));
        let result = toolsEvaluate(ast, env);
        if(result === 1) minterms.push(i);
        else maxterms.push(i);
    }

    return { ast, vars, minterms, maxterms, isPOSFlow };
}

// Function 1: CSOP
function toolsGetCSOPHtml(ast, vars, minterms, isPOSFlow, stepNum = "") {
    let csopStr = minterms.map(m => m.toString(2).padStart(vars.length, '0').split('').map((b, i) => b === '1' ? vars[i] : vars[i]+"'").join('.')).join(' + ');
    let title = (stepNum ? `${stepNum}. ` : "") + "Canonical SOP (CSOP)";
    let steps = "";

    if (!isPOSFlow) {
        const expLogic = toolsGenerateAlgebraicExpansionSOP(ast, vars);
        steps = `
            <div class="step" style="margin-bottom:15px;"><strong>Base Terms:</strong> ${toolsGetSOPTerms(ast).join(', ')}</div>
            ${expLogic.html}
            <div class="step highlight">Final CSOP: ${csopStr || '0'}</div>`;
    } else {
        steps = `
            <div class="step">1. Take the minterm binary representations.</div>
            <div class="step">2. Convert each back to algebraic product terms.</div>
            <div class="step">3. In SOP, 1 = normal variable, 0 = complemented variable.</div>
            <div class="step highlight">Result: ${csopStr || '0'}</div>`;
    }
    return toolsBuildCardHtml(title, csopStr || '0', steps);
}

// Function 2: CPOS
function toolsGetCPOSHtml(ast, vars, maxterms, isPOSFlow, stepNum = "") {
    let cposStr = maxterms.map(m => `(${m.toString(2).padStart(vars.length, '0').split('').map((b, i) => b === '0' ? vars[i] : vars[i]+"'").join(' + ')})`).join(' . ');
    let title = (stepNum ? `${stepNum}. ` : "") + "Canonical POS (CPOS)";
    let steps = "";

    if (isPOSFlow) {
        const expLogic = toolsGenerateAlgebraicExpansionPOS(ast, vars);
        steps = `
            <div class="step" style="margin-bottom:15px;"><strong>Base Terms:</strong> ${toolsGetPOSTerms(ast).map(t=>`(${t})`).join('.').replace(/\(\(/g,'(').replace(/\)\)/g,')')}</div>
            ${expLogic.html}
            <div class="step highlight">Final CPOS: ${cposStr || '1'}</div>`;
    } else {
        steps = `
            <div class="step">1. Take the maxterm binary representations.</div>
            <div class="step">2. Convert each back to algebraic sum terms.</div>
            <div class="step">3. In POS, 0 = normal variable, 1 = complemented variable.</div>
            <div class="step highlight">Result: ${cposStr || '1'}</div>`;
    }
    return toolsBuildCardHtml(title, cposStr || '1', steps);
}

// Function 3: Minterm Binary
function toolsGetMintermBinaryHtml(vars, minterms, isPOSFlow, stepNum = "") {
    let minBinStr = minterms.map(m => m.toString(2).padStart(vars.length, '0')).join(' + ');
    let title = (stepNum ? `${stepNum}. ` : "") + "Minterm Binary Form";
    let steps = "";

    if (!isPOSFlow) {
        steps = `
            <div class="step">1. Take the CSOP expression from the previous step.</div>
            <div class="step">2. Convert each algebraic term to binary (normal var = 1, complemented var = 0).</div>
            <div class="step highlight">Result: ${minBinStr || '0'}</div>`;
    } else {
        steps = `
            <div class="step">1. Take the minterm decimal indices from the previous step.</div>
            <div class="step">2. Convert each decimal index back to a ${vars.length}-bit binary number.</div>
            <div class="step highlight">Result: ${minBinStr || '0'}</div>`;
    }
    return toolsBuildCardHtml(title, minBinStr || '0', steps);
}

// Function 4: Minterm Decimal
function toolsGetMintermDecimalHtml(minterms, isPOSFlow, stepNum = "") {
    let minDecStr = minterms.map(m => 'm' + m).join(' + ');
    let title = (stepNum ? `${stepNum}. ` : "") + "Minterm Decimal Expression";
    let steps = "";

    if (!isPOSFlow) {
        steps = `
            <div class="step">1. Take the binary representations from the previous step.</div>
            <div class="step">2. Convert each binary number to its decimal equivalent.</div>
            <div class="step">3. Represent as lowercase 'm' added together.</div>
            <div class="step highlight">Result: ${minDecStr || '0'}</div>`;
    } else {
        steps = `
            <div class="step">1. Extract the decimal numbers from the SIGMA Cardinal form.</div>
            <div class="step">2. Represent each as a lowercase minterm (m) added together.</div>
            <div class="step highlight">Result: ${minDecStr || '0'}</div>`;
    }
    return toolsBuildCardHtml(title, minDecStr || '0', steps);
}

// Function 5: Maxterm Binary
function toolsGetMaxtermBinaryHtml(vars, maxterms, isPOSFlow, stepNum = "") {
    let maxBinStr = maxterms.map(m => `(${m.toString(2).padStart(vars.length, '0')})`).join(' . ');
    let title = (stepNum ? `${stepNum}. ` : "") + "Maxterm Binary Form";
    let steps = "";

    if (!isPOSFlow) {
        steps = `
            <div class="step">1. Take the maxterm decimal indices from the previous step.</div>
            <div class="step">2. Convert each decimal index back to a ${vars.length}-bit binary number.</div>
            <div class="step highlight">Result: ${maxBinStr || '1'}</div>`;
    } else {
        steps = `
            <div class="step">1. Take the CPOS expression from the previous step.</div>
            <div class="step">2. Convert each sum term to binary (normal var = 0, complemented var = 1).</div>
            <div class="step highlight">Result: ${maxBinStr || '1'}</div>`;
    }
    return toolsBuildCardHtml(title, maxBinStr || '1', steps);
}

// Function 6: Maxterm Decimal
function toolsGetMaxtermDecimalHtml(maxterms, isPOSFlow, stepNum = "") {
    let maxDecStr = maxterms.map(m => 'M' + m).join(' . ');
    let title = (stepNum ? `${stepNum}. ` : "") + "Maxterm Decimal Expression";
    let steps = "";

    if (!isPOSFlow) {
        steps = `
            <div class="step">1. Extract the decimal numbers from the PI Cardinal form.</div>
            <div class="step">2. Represent each as an uppercase Maxterm (M) multiplied together.</div>
            <div class="step highlight">Result: ${maxDecStr || '1'}</div>`;
    } else {
        steps = `
            <div class="step">1. Take the binary representations from the previous step.</div>
            <div class="step">2. Convert each binary number to its decimal equivalent.</div>
            <div class="step">3. Represent as uppercase 'M' multiplied together.</div>
            <div class="step highlight">Result: ${maxDecStr || '1'}</div>`;
    }
    return toolsBuildCardHtml(title, maxDecStr || '1', steps);
}

// Function 7: SIGMA Form
function toolsGetSigmaHtml(vars, minterms, isPOSFlow, stepNum = "") {
    let sigmaStr = minterms.length ? `Σ (${minterms.join(', ')})` : '0';
    let title = (stepNum ? `${stepNum}. ` : "") + "Cardinal SIGMA Form (Σ)";
    let steps = "";

    if (!isPOSFlow) {
        steps = `
            <div class="step">1. Extract the decimal numbers from the minterm decimal expression.</div>
            <div class="step">2. Format as Cardinal Sigma Σ (...).</div>
            <div class="step highlight">Result: ${sigmaStr}</div>`;
    } else {
        steps = `
            <div class="step">1. Take the values from the PI form.</div>
            <div class="step">2. Identify all missing decimal indices from the complete domain (0 to ${Math.pow(2, vars.length)-1}).</div>
            <div class="step">3. Format the missing indices as Cardinal Sigma Σ (...).</div>
            <div class="step highlight">Result: ${sigmaStr}</div>`;
    }
    return toolsBuildCardHtml(title, sigmaStr, steps);
}

// Function 8: PI Form
function toolsGetPiHtml(vars, maxterms, isPOSFlow, stepNum = "") {
    let piStr = maxterms.length ? `Π (${maxterms.join(', ')})` : '1';
    let title = (stepNum ? `${stepNum}. ` : "") + "Cardinal PI Form (Π)";
    let steps = "";

    if (!isPOSFlow) {
        steps = `
            <div class="step">1. Take the values from the SIGMA form.</div>
            <div class="step">2. Identify all missing decimal indices from the complete domain (0 to ${Math.pow(2, vars.length)-1}).</div>
            <div class="step">3. Format the missing indices as Cardinal Pi Π (...).</div>
            <div class="step highlight">Result: ${piStr}</div>`;
    } else {
        steps = `
            <div class="step">1. Extract the decimal numbers from the maxterm decimal expression.</div>
            <div class="step">2. Format as Cardinal Pi ΠM(...).</div>
            <div class="step highlight">Result: ${piStr}</div>`;
    }
    return toolsBuildCardHtml(title, piStr, steps);
}

// Function 9: Dual
function toolsGetDualHtml(ast, stepNum = "") {
    let dualStr = toolsStringify(toolsToDual(ast));
    let title = (stepNum ? `${stepNum}. ` : "") + "Dual Expression";
    let steps = `
        <div class="step">1. Parse Original: <strong>${toolsStringify(ast)}</strong></div>
        <div class="step">2. Apply Dual Rules: Swap <code>+</code> with <code>.</code>, and <code>1</code> with <code>0</code>.</div>
        <div class="step">3. Variables remain unchanged.</div>
        <div class="step highlight">Result: ${dualStr}</div>`;
    
    return toolsBuildCardHtml(title, dualStr, steps);
}

// Function 10: Inverse
function toolsGetInverseHtml(ast, stepNum = "") {
    let invStr = toolsStringify(toolsToInverse(ast));
    let title = (stepNum ? `${stepNum}. ` : "") + "Inverse (Complement)";
    let steps = `
        <div class="step">1. Parse Original: <strong>${toolsStringify(ast)}</strong></div>
        <div class="step">2. Apply De Morgan's Law: Swap <code>+</code> with <code>.</code>, Swap <code>1</code> with <code>0</code>.</div>
        <div class="step">3. <strong>Invert all variables</strong> (X becomes X').</div>
        <div class="step highlight">Result: ${invStr}</div>`;
    
    return toolsBuildCardHtml(title, invStr, steps);
}

// --- 5. MAIN ORCHESTRATOR ---
function toolsCalculateAll() {
    const input = document.getElementById('exprInput').value;
    const errorBox = document.getElementById('errorBox');
    const flowBox = document.getElementById('flowBox');
    const grid = document.getElementById('resultsGrid');
    
    if(!input.trim()) return;
    errorBox.innerText = "";
    flowBox.innerHTML = "";
    grid.innerHTML = ""; 

    try {
        const { ast, vars, minterms, maxterms, isPOSFlow } = toolsAnalyzeExpression(input);
        
        flowBox.innerHTML = `<div class="flow-indicator">Pipeline Detected: ${isPOSFlow ? 'POS' : 'SOP'} Flow</div>`;
        grid.style.display = "grid";

        let cardsHtml = "";
        
        // Dynamically invoke the independent functions to build the exact flow sequence
        if (!isPOSFlow) {
            // SOP Flow
            cardsHtml += toolsGetCSOPHtml(ast, vars, minterms, isPOSFlow, 1);
            cardsHtml += toolsGetMintermBinaryHtml(vars, minterms, isPOSFlow, 2);
            cardsHtml += toolsGetMintermDecimalHtml(minterms, isPOSFlow, 3);
            cardsHtml += toolsGetSigmaHtml(vars, minterms, isPOSFlow, 4);
            cardsHtml += toolsGetPiHtml(vars, maxterms, isPOSFlow, 5);
            cardsHtml += toolsGetMaxtermDecimalHtml(maxterms, isPOSFlow, 6);
            cardsHtml += toolsGetMaxtermBinaryHtml(vars, maxterms, isPOSFlow, 7);
            cardsHtml += toolsGetCPOSHtml(ast, vars, maxterms, isPOSFlow, 8);
        } else {
            // POS Flow
            cardsHtml += toolsGetCPOSHtml(ast, vars, maxterms, isPOSFlow, 1);
            cardsHtml += toolsGetMaxtermBinaryHtml(vars, maxterms, isPOSFlow, 2);
            cardsHtml += toolsGetMaxtermDecimalHtml(maxterms, isPOSFlow, 3);
            cardsHtml += toolsGetPiHtml(vars, maxterms, isPOSFlow, 4);
            cardsHtml += toolsGetSigmaHtml(vars, minterms, isPOSFlow, 5);
            cardsHtml += toolsGetMintermDecimalHtml(minterms, isPOSFlow, 6);
            cardsHtml += toolsGetMintermBinaryHtml(vars, minterms, isPOSFlow, 7);
            cardsHtml += toolsGetCSOPHtml(ast, vars, minterms, isPOSFlow, 8);
        }

        // Dual and Inverse
        cardsHtml += toolsGetDualHtml(ast, 9);
        cardsHtml += toolsGetInverseHtml(ast, 10);

        grid.innerHTML = cardsHtml;

    } catch (err) {
        errorBox.innerText = "Error: " + err.message;
        grid.style.display = "none";
        flowBox.innerHTML = "";
    }
}
