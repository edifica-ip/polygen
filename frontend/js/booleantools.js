// ============================================================================
// 1. CORE LEXER, PARSER & EVALUATOR
// ============================================================================

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

// ============================================================================
// 2. MATHEMATICAL ENVIRONMENT ANALYZER
// ============================================================================
// Parses the input string once and builds all mathematical representations.
function toolsAnalyzeExpression(input) {
    const ast = new ToolsParser(toolsTokenize(input)).parse();
    const vars = toolsGetVariables(ast);
    if(vars.length === 0) throw new Error("No variables found. Only constants used.");

    // Simple heuristic: If the top level node is an AND, it is treated as a POS expression. Otherwise SOP.
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

    return {
        ast, vars, minterms, maxterms, isPOSFlow,
        csopStr: minterms.map(m => m.toString(2).padStart(vars.length, '0').split('').map((b, i) => b === '1' ? vars[i] : vars[i]+"'").join('.')).join(' + '),
        minBinStr: minterms.map(
    m => `m${m}(${m.toString(2)
                  .padStart(vars.length,'0')})`
).join(' + '),
        minDecStr: minterms.map(m => 'm' + m).join(' + '),
        sigmaStr: minterms.length ? `Σ (${minterms.join(', ')})` : '0',
        cposStr: maxterms.map(m => `(${m.toString(2).padStart(vars.length, '0').split('').map((b, i) => b === '0' ? vars[i] : vars[i]+"'").join(' + ')})`).join(' . '),
        maxBinStr: maxterms.map(
    m => `M${m}(${m.toString(2)
                  .padStart(vars.length,'0')})`
).join(' . '),
        maxDecStr: maxterms.map(m => 'M' + m).join(' . '),
        piStr: maxterms.length ? `Π (${maxterms.join(', ')})` : '1'
    };
}

// ============================================================================
// 3. HTML CHAIN LINK GENERATORS (SOP FLOW)
// ============================================================================
function toolsGetSOPTerms(node) {
    if (!node) return [];
    if (node.type === 'OR') return [...toolsGetSOPTerms(node.left), ...toolsGetSOPTerms(node.right)];
    return [toolsStringify(node)];
}

function step1_SOP_to_CSOP(ast, vars, csopStr) {
    let terms = toolsGetSOPTerms(ast);
    let html = `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                    <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 1: SOP &rarr; CSOP</h4>
                    <div><strong>Base Terms:</strong> ${terms.join(', ')}</div>`;
    
    let finalExpandedTerms = [];
    terms.forEach(termStr => {
        let cleanTerm = termStr.replace(/[\(\)]/g, ''); 
        let presentVars = vars.filter(v => cleanTerm.includes(v));
        let missingVars = vars.filter(v => !presentVars.includes(v));
        
        if (missingVars.length === 0) {
            finalExpandedTerms.push(cleanTerm);
            html += `<div>- <strong>${cleanTerm}</strong> is complete.</div>`;
        } else {
            let currentExpansions = [cleanTerm];
            html += `<div style="margin-left: 15px; border-left: 2px solid #007bff; padding-left: 10px; margin-top: 10px;">
                        <div style="font-weight:bold;">Expanding Term: ${cleanTerm}</div>
                        <div style="font-size:0.85rem; color:#666;">Missing vars: {${missingVars.join(', ')}}</div>`;
            missingVars.forEach(mv => {
                let nextExpansions = [];
                currentExpansions.forEach(exp => {
                    nextExpansions.push(`${exp}.${mv}`);
                    nextExpansions.push(`${exp}.${mv}'`);
                });
                html += `<div>&rarr; Multiply by (${mv} + ${mv}'): ${currentExpansions.map(e => `${e}.(${mv} + ${mv}')`).join(' + ')} = <strong>${nextExpansions.join(' + ')}</strong></div>`;
                currentExpansions = nextExpansions;
            });
            html += `</div>`;
            finalExpandedTerms.push(...currentExpansions);
        }
    });
    
    html += `<div style="margin-top: 10px;"><strong>Remove Duplicates (X + X = X):</strong> ${csopStr || '0'}</div>
             <div style="color: #d35400; font-weight: bold; margin-top: 5px;">CSOP Result: ${csopStr || '0'}</div>
             </div>`;
    return html;
}

function step2_CSOP_to_MinBin(csopStr, minBinStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 2: CSOP &rarr; Minterm Binary</h4>
                <div>1. Take CSOP expression: <strong>${csopStr || '0'}</strong></div>
                <div>2. Convert to Binary (Normal var = 1, Complemented var = 0).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Minterm Binary Result: ${minBinStr || '0'}</div>
            </div>`;
}

function step3_MinBin_to_MinDec(minBinStr, minDecStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 3: Minterm Binary &rarr; Minterm Decimal</h4>
                <div>1. Given Binary: <strong>${minBinStr || '0'}</strong></div>
                <div>2. Convert each binary to decimal (m).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Minterm Decimal Result: ${minDecStr || '0'}</div>
            </div>`;
}

function step4_MinDec_to_Sigma(minDecStr, sigmaStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 4: Minterm Decimal &rarr; Cardinal SIGMA</h4>
                <div>1. Extract decimals from: <strong>${minDecStr || '0'}</strong></div>
                <div>2. Group into Cardinal Sigma notation Σ (...).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">SIGMA Result: ${sigmaStr}</div>
            </div>`;
}

function step5_Sigma_to_Pi(sigmaStr, piStr, vars) {
    let domainMax = Math.pow(2, vars.length) - 1;
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 5: Cardinal SIGMA &rarr; Cardinal PI</h4>
                <div>1. Given SIGMA: <strong>${sigmaStr}</strong></div>
                <div>2. Find missing indices from domain [0 to ${domainMax}].</div>
                <div>3. Group missing indices into Cardinal Pi notation Π (...).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">PI Result: ${piStr}</div>
            </div>`;
}

function step6_Pi_to_MaxDec(piStr, maxDecStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 6: Cardinal PI &rarr; Maxterm Decimal</h4>
                <div>1. Extract decimals from PI: <strong>${piStr}</strong></div>
                <div>2. Write as Maxterm decimals (M) multiplied.</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Maxterm Decimal Result: ${maxDecStr || '1'}</div>
            </div>`;
}

function step7_MaxDec_to_MaxBin(maxDecStr, maxBinStr, vars) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 7: Maxterm Decimal &rarr; Maxterm Binary</h4>
                <div>1. Given Maxterms: <strong>${maxDecStr || '1'}</strong></div>
                <div>2. Convert decimals back to ${vars.length}-bit binary.</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Maxterm Binary Result: ${maxBinStr || '1'}</div>
            </div>`;
}

function step8_MaxBin_to_CPOS(maxBinStr, cposStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 8: Maxterm Binary &rarr; CPOS</h4>
                <div>1. Given Maxterm Binary: <strong>${maxBinStr || '1'}</strong></div>
                <div>2. Convert to algebraic sum terms (0 = normal var, 1 = complemented var).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">CPOS Result: ${cposStr || '1'}</div>
            </div>`;
}

// ============================================================================
// 4. HTML CHAIN LINK GENERATORS (POS FLOW)
// ============================================================================
function toolsGetPOSTerms(node) {
    if (!node) return [];
    if (node.type === 'AND') return [...toolsGetPOSTerms(node.left), ...toolsGetPOSTerms(node.right)];
    return [toolsStringify(node)];
}

function p_step1_POS_to_CPOS(ast, vars, cposStr) {
    let terms = toolsGetPOSTerms(ast);
    let html = `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                    <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 1: POS &rarr; CPOS</h4>
                    <div><strong>Base Terms:</strong> ${terms.map(t=>`(${t})`).join('.').replace(/\(\(/g,'(').replace(/\)\)/g,')')}</div>`;
    
    let finalExpandedTerms = [];
    terms.forEach(termStr => {
        let cleanTerm = termStr.replace(/[\(\)]/g, ''); 
        let presentVars = vars.filter(v => cleanTerm.includes(v));
        let missingVars = vars.filter(v => !presentVars.includes(v));
        
        if (missingVars.length === 0) {
            finalExpandedTerms.push(`(${cleanTerm})`);
            html += `<div>- <strong>(${cleanTerm})</strong> is complete.</div>`;
        } else {
            let currentExpansions = [cleanTerm]; 
            html += `<div style="margin-left: 15px; border-left: 2px solid #007bff; padding-left: 10px; margin-top: 10px;">
                        <div style="font-weight:bold;">Expanding Term: (${cleanTerm})</div>
                        <div style="font-size:0.85rem; color:#666;">Missing vars: {${missingVars.join(', ')}}</div>`;
            missingVars.forEach(mv => {
                let nextExpansions = [];
                currentExpansions.forEach(exp => {
                    nextExpansions.push(`${exp} + ${mv}`);
                    nextExpansions.push(`${exp} + ${mv}'`);
                });
                html += `<div>&rarr; Add (${mv}.${mv}'): ${currentExpansions.map(e => `(${e} + ${mv}.${mv}')`).join(' . ')} = <strong>${nextExpansions.map(e=>`(${e})`).join(' . ')}</strong></div>`;
                currentExpansions = nextExpansions;
            });
            html += `</div>`;
            finalExpandedTerms.push(...currentExpansions.map(e=>`(${e})`));
        }
    });
    
    html += `<div style="margin-top: 10px;"><strong>Remove Duplicates (X . X = X):</strong> ${cposStr || '1'}</div>
             <div style="color: #d35400; font-weight: bold; margin-top: 5px;">CPOS Result: ${cposStr || '1'}</div>
             </div>`;
    return html;
}

function p_step2_CPOS_to_MaxBin(cposStr, maxBinStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 2: CPOS &rarr; Maxterm Binary</h4>
                <div>1. Take CPOS expression: <strong>${cposStr || '1'}</strong></div>
                <div>2. Convert to Binary (Normal var = 0, Complemented var = 1).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Maxterm Binary Result: ${maxBinStr || '1'}</div>
            </div>`;
}

function p_step3_MaxBin_to_MaxDec(maxBinStr, maxDecStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 3: Maxterm Binary &rarr; Maxterm Decimal</h4>
                <div>1. Given Binary: <strong>${maxBinStr || '1'}</strong></div>
                <div>2. Convert each binary to decimal (M).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Maxterm Decimal Result: ${maxDecStr || '1'}</div>
            </div>`;
}

function p_step4_MaxDec_to_Pi(maxDecStr, piStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 4: Maxterm Decimal &rarr; Cardinal PI</h4>
                <div>1. Extract decimals from: <strong>${maxDecStr || '1'}</strong></div>
                <div>2. Group into Cardinal Pi notation Π (...).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">PI Result: ${piStr}</div>
            </div>`;
}

function p_step5_Pi_to_Sigma(piStr, sigmaStr, vars) {
    let domainMax = Math.pow(2, vars.length) - 1;
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 5: Cardinal PI &rarr; Cardinal SIGMA</h4>
                <div>1. Given PI: <strong>${piStr}</strong></div>
                <div>2. Find missing indices from domain [0 to ${domainMax}].</div>
                <div>3. Group missing indices into Cardinal Sigma notation Σ (...).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">SIGMA Result: ${sigmaStr}</div>
            </div>`;
}

function p_step6_Sigma_to_MinDec(sigmaStr, minDecStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 6: Cardinal SIGMA &rarr; Minterm Decimal</h4>
                <div>1. Extract decimals from SIGMA: <strong>${sigmaStr}</strong></div>
                <div>2. Write as Minterm decimals (m) added.</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Minterm Decimal Result: ${minDecStr || '0'}</div>
            </div>`;
}

function p_step7_MinDec_to_MinBin(minDecStr, minBinStr, vars) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 7: Minterm Decimal &rarr; Minterm Binary</h4>
                <div>1. Given Minterms: <strong>${minDecStr || '0'}</strong></div>
                <div>2. Convert decimals back to ${vars.length}-bit binary.</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">Minterm Binary Result: ${minBinStr || '0'}</div>
            </div>`;
}

function p_step8_MinBin_to_CSOP(minBinStr, csopStr) {
    return `<div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h4 style="margin: 0 0 10px 0; color: #0056b3;">Phase 8: Minterm Binary &rarr; CSOP</h4>
                <div>1. Given Minterm Binary: <strong>${minBinStr || '0'}</strong></div>
                <div>2. Convert to algebraic product terms (1 = normal var, 0 = complemented var).</div>
                <div style="color: #d35400; font-weight: bold; margin-top: 5px;">CSOP Result: ${csopStr || '0'}</div>
            </div>`;
}

// ============================================================================
// 5. THE 10 EXPOSED PUBLIC FUNCTIONS
// ============================================================================
// All functions return an object: { result: "final_string", html: "html_steps" }

// 1. Minimized SOP (Uses Quine-McCluskey under the hood for clean reduction)
function toolsRunQMC(indices, numVars) {
    let implicants = new Set(indices.map(m => m.toString(2).padStart(numVars, '0')));
    let primeImplicants = new Set();
    let combined = true;
    while (combined) {
        combined = false;
        let nextImplicants = new Set();
        let used = new Set();
        let impArr = Array.from(implicants);
        for (let i = 0; i < impArr.length; i++) {
            for (let j = i + 1; j < impArr.length; j++) {
                let diffs = 0, diffIdx = -1;
                for (let k = 0; k < numVars; k++) {
                    if (impArr[i][k] !== impArr[j][k]) { diffs++; diffIdx = k; }
                }
                if (diffs === 1) {
                    nextImplicants.add(impArr[i].substring(0, diffIdx) + '-' + impArr[i].substring(diffIdx + 1));
                    used.add(impArr[i]); used.add(impArr[j]);
                    combined = true;
                }
            }
        }
        for (let imp of impArr) if (!used.has(imp)) primeImplicants.add(imp);
        implicants = nextImplicants;
    }
    for (let imp of implicants) primeImplicants.add(imp);
    
    let essential = [];
    let uncovered = new Set(indices.map(m => m.toString(2).padStart(numVars, '0')));
    let primes = Array.from(primeImplicants);
    
    function covers(p, m) {
        for (let i = 0; i < p.length; i++) if (p[i] !== '-' && p[i] !== m[i]) return false;
        return true;
    }

    while (uncovered.size > 0) {
        let bestP = null, bestCount = -1;
        for (let p of primes) {
            let count = Array.from(uncovered).filter(m => covers(p, m)).length;
            if (count > bestCount) { bestCount = count; bestP = p; }
        }
        if(!bestP) break;
        essential.push(bestP);
        for (let m2 of Array.from(uncovered)) if (covers(bestP, m2)) uncovered.delete(m2);
    }
    return essential;
}

function toolsGetMinimizedSOP(input) {
    let env = toolsAnalyzeExpression(input);
    let qmc = toolsRunQMC(env.minterms, env.vars.length);
    let res = qmc.map(imp => {
        let t = '';
        for(let i=0; i<env.vars.length; i++) {
            if(imp[i]==='1') t+=env.vars[i];
            if(imp[i]==='0') t+=env.vars[i]+"'";
        }
        return t || '1';
    }).join(' + ');
    if(!qmc.length) res = '0';
    
    let html = `<div>1. Extracted Minterms: [${env.minterms.join(', ')}]</div>
                <div>2. Applied Quine-McCluskey tabular reduction.</div>
                <div>3. Implicants: ${qmc.join(', ')}</div>
                <div style="color:#d35400; font-weight:bold; margin-top:5px;">Result: ${res}</div>`;
    return { result: res, html: html };
}

// 2. Minimized POS
function toolsGetMinimizedPOS(input) {
    let env = toolsAnalyzeExpression(input);
    let qmc = toolsRunQMC(env.maxterms, env.vars.length);
    let res = qmc.map(imp => {
        let t = [];
        for(let i=0; i<env.vars.length; i++) {
            if(imp[i]==='0') t.push(env.vars[i]);
            if(imp[i]==='1') t.push(env.vars[i]+"'");
        }
        return t.length ? `(${t.join(' + ')})` : '0';
    }).join(' . ');
    if(!qmc.length) res = '1';
    
    let html = `<div>1. Extracted Maxterms: [${env.maxterms.join(', ')}]</div>
                <div>2. Applied Quine-McCluskey tabular reduction on zeros.</div>
                <div>3. Implicants: ${qmc.join(', ')}</div>
                <div style="color:#d35400; font-weight:bold; margin-top:5px;">Result: ${res}</div>`;
    return { result: res, html: html };
}

// 3. Find Minterm Expr
function toolsGetMintermExpr(input) {
    let env = toolsAnalyzeExpression(input);
    let html = "";
    if (!env.isPOSFlow) {
        html += step1_SOP_to_CSOP(env.ast, env.vars, env.csopStr);
        html += step2_CSOP_to_MinBin(env.csopStr, env.minBinStr);
        html += step3_MinBin_to_MinDec(env.minBinStr, env.minDecStr);
    } else {
        html += p_step1_POS_to_CPOS(env.ast, env.vars, env.cposStr);
        html += p_step2_CPOS_to_MaxBin(env.cposStr, env.maxBinStr);
        html += p_step3_MaxBin_to_MaxDec(env.maxBinStr, env.maxDecStr);
        html += p_step4_MaxDec_to_Pi(env.maxDecStr, env.piStr);
        html += p_step5_Pi_to_Sigma(env.piStr, env.sigmaStr, env.vars);
        html += p_step6_Sigma_to_MinDec(env.sigmaStr, env.minDecStr);
    }
    return { result: env.minDecStr || '0', html: html };
}

// 4. Find Maxterm Expr
function toolsGetMaxtermExpr(input) {
    let env = toolsAnalyzeExpression(input);
    let html = "";
    if (!env.isPOSFlow) {
        html += step1_SOP_to_CSOP(env.ast, env.vars, env.csopStr);
        html += step2_CSOP_to_MinBin(env.csopStr, env.minBinStr);
        html += step3_MinBin_to_MinDec(env.minBinStr, env.minDecStr);
        html += step4_MinDec_to_Sigma(env.minDecStr, env.sigmaStr);
        html += step5_Sigma_to_Pi(env.sigmaStr, env.piStr, env.vars);
        html += step6_Pi_to_MaxDec(env.piStr, env.maxDecStr);
    } else {
        html += p_step1_POS_to_CPOS(env.ast, env.vars, env.cposStr);
        html += p_step2_CPOS_to_MaxBin(env.cposStr, env.maxBinStr);
        html += p_step3_MaxBin_to_MaxDec(env.maxBinStr, env.maxDecStr);
    }
    return { result: env.maxDecStr || '1', html: html };
}

// 5. Find Cardinal SIGMA
function toolsGetCardinalSigma(input) {
    let env = toolsAnalyzeExpression(input);
    let html = "";
    if (!env.isPOSFlow) {
        html += step1_SOP_to_CSOP(env.ast, env.vars, env.csopStr);
        html += step2_CSOP_to_MinBin(env.csopStr, env.minBinStr);
        html += step3_MinBin_to_MinDec(env.minBinStr, env.minDecStr);
        html += step4_MinDec_to_Sigma(env.minDecStr, env.sigmaStr);
    } else {
        html += p_step1_POS_to_CPOS(env.ast, env.vars, env.cposStr);
        html += p_step2_CPOS_to_MaxBin(env.cposStr, env.maxBinStr);
        html += p_step3_MaxBin_to_MaxDec(env.maxBinStr, env.maxDecStr);
        html += p_step4_MaxDec_to_Pi(env.maxDecStr, env.piStr);
        html += p_step5_Pi_to_Sigma(env.piStr, env.sigmaStr, env.vars);
    }
    return { result: env.sigmaStr, html: html };
}

// 6. Find Cardinal PI
function toolsGetCardinalPi(input) {
    let env = toolsAnalyzeExpression(input);
    let html = "";
    if (!env.isPOSFlow) {
        html += step1_SOP_to_CSOP(env.ast, env.vars, env.csopStr);
        html += step2_CSOP_to_MinBin(env.csopStr, env.minBinStr);
        html += step3_MinBin_to_MinDec(env.minBinStr, env.minDecStr);
        html += step4_MinDec_to_Sigma(env.minDecStr, env.sigmaStr);
        html += step5_Sigma_to_Pi(env.sigmaStr, env.piStr, env.vars);
    } else {
        html += p_step1_POS_to_CPOS(env.ast, env.vars, env.cposStr);
        html += p_step2_CPOS_to_MaxBin(env.cposStr, env.maxBinStr);
        html += p_step3_MaxBin_to_MaxDec(env.maxBinStr, env.maxDecStr);
        html += p_step4_MaxDec_to_Pi(env.maxDecStr, env.piStr);
    }
    return { result: env.piStr, html: html };
}

// 7. Find Dual
function toolsGetDual(input) {
    function toDual(node) {
        if (!node) return null;
        if (node.type === 'VAR') return { ...node };
        if (node.type === 'CONST') return { type: 'CONST', value: node.value === '1' ? '0' : '1' };
        if (node.type === 'NOT') return { type: 'NOT', child: toDual(node.child) };
        if (node.type === 'AND') return { type: 'OR', left: toDual(node.left), right: toDual(node.right) };
        if (node.type === 'OR') return { type: 'AND', left: toDual(node.left), right: toDual(node.right) };
    }
    let ast = new ToolsParser(toolsTokenize(input)).parse();
    let dualStr = toolsStringify(toDual(ast));
    let html = `<div>1. Apply Dual Rules: Swap + with . and 1 with 0.</div>
                <div>2. Variables remain unchanged.</div>
                <div style="color:#d35400; font-weight:bold; margin-top:5px;">Result: ${dualStr}</div>`;
    return { result: dualStr, html: html };
}

// 8. Find Inverse
function toolsGetInverse(input) {
    function toInverse(node) {
        if (!node) return null;
        if (node.type === 'VAR') return { type: 'NOT', child: { ...node } };
        if (node.type === 'CONST') return { type: 'CONST', value: node.value === '1' ? '0' : '1' };
        if (node.type === 'NOT') return { ...node.child }; 
        if (node.type === 'AND') return { type: 'OR', left: toInverse(node.left), right: toInverse(node.right) };
        if (node.type === 'OR') return { type: 'AND', left: toInverse(node.left), right: toInverse(node.right) };
    }
    let ast = new ToolsParser(toolsTokenize(input)).parse();
    let invStr = toolsStringify(toInverse(ast));
    let html = `<div>1. Apply De Morgan's Law: Swap + with . and 1 with 0.</div>
                <div>2. Invert all variables (X becomes X').</div>
                <div style="color:#d35400; font-weight:bold; margin-top:5px;">Result: ${invStr}</div>`;
    return { result: invStr, html: html };
}

// 9. Find CSOP
function toolsGetCSOP(input) {
    let env = toolsAnalyzeExpression(input);
    let html = "";
    if (!env.isPOSFlow) {
        html += step1_SOP_to_CSOP(env.ast, env.vars, env.csopStr);
    } else {
        html += p_step1_POS_to_CPOS(env.ast, env.vars, env.cposStr);
        html += p_step2_CPOS_to_MaxBin(env.cposStr, env.maxBinStr);
        html += p_step3_MaxBin_to_MaxDec(env.maxBinStr, env.maxDecStr);
        html += p_step4_MaxDec_to_Pi(env.maxDecStr, env.piStr);
        html += p_step5_Pi_to_Sigma(env.piStr, env.sigmaStr, env.vars);
        html += p_step6_Sigma_to_MinDec(env.sigmaStr, env.minDecStr);
        html += p_step7_MinDec_to_MinBin(env.minDecStr, env.minBinStr, env.vars);
        html += p_step8_MinBin_to_CSOP(env.minBinStr, env.csopStr);
    }
    return { result: env.csopStr || '0', html: html };
}

// 10. Find CPOS
function toolsGetCPOS(input) {
    let env = toolsAnalyzeExpression(input);
    let html = "";
    if (!env.isPOSFlow) {
        html += step1_SOP_to_CSOP(env.ast, env.vars, env.csopStr);
        html += step2_CSOP_to_MinBin(env.csopStr, env.minBinStr);
        html += step3_MinBin_to_MinDec(env.minBinStr, env.minDecStr);
        html += step4_MinDec_to_Sigma(env.minDecStr, env.sigmaStr);
        html += step5_Sigma_to_Pi(env.sigmaStr, env.piStr, env.vars);
        html += step6_Pi_to_MaxDec(env.piStr, env.maxDecStr);
        html += step7_MaxDec_to_MaxBin(env.maxDecStr, env.maxBinStr, env.vars);
        html += step8_MaxBin_to_CPOS(env.maxBinStr, env.cposStr);
    } else {
        html += p_step1_POS_to_CPOS(env.ast, env.vars, env.cposStr);
    }
    return { result: env.cposStr || '1', html: html };
}