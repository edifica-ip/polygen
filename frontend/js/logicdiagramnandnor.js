// --- 1. STANDARD LEXER & PARSER ---
function mixTokenize(str) {
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

class MixParser {
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

// --- 2. AST TRANSFORMERS: STANDARD -> MIXED NAND/NOR ONLY ---
function mixConvertToMixAST(node) {
    if (!node) return null;
    
    if (node.type === 'VAR' || node.type === 'CONST') {
        return { type: node.type, value: node.value };
    }
    
    // NOT(X) -> NAND(X, X) represented visually as NAND_NOT
    if (node.type === 'NOT') {
        return { type: 'NAND_NOT', child: mixConvertToMixAST(node.child) };
    }
    
    // AND(X, Y) -> NOT(NAND(X, Y)) -> NAND_NOT(NAND(X, Y))
    if (node.type === 'AND') {
        return { 
            type: 'NAND_NOT', 
            child: { 
                type: 'NAND', 
                left: mixConvertToMixAST(node.left), 
                right: mixConvertToMixAST(node.right) 
            } 
        };
    }
    
    // OR(X, Y) -> NOT(NOR(X, Y)) -> NAND_NOT(NOR(X, Y))
    if (node.type === 'OR') {
        return {
            type: 'NAND_NOT',
            child: {
                type: 'NOR',
                left: mixConvertToMixAST(node.left),
                right: mixConvertToMixAST(node.right)
            }
        };
    }
}

// Recursively walks the AST and removes back-to-back negations
function mixMinimizeAST(node) {
    if (!node) return null;
    
    if (node.type === 'VAR' || node.type === 'CONST') {
        return { type: node.type, value: node.value };
    }
    
    if (node.type === 'NAND') {
        return {
            type: 'NAND',
            left: mixMinimizeAST(node.left),
            right: mixMinimizeAST(node.right)
        };
    }

    if (node.type === 'NOR') {
        return {
            type: 'NOR',
            left: mixMinimizeAST(node.left),
            right: mixMinimizeAST(node.right)
        };
    }
    
    if (node.type === 'NAND_NOT') {
        let minimizedChild = mixMinimizeAST(node.child);
        
        // DOUBLE NEGATION ELIMINATION: NOT(NOT(X)) == X
        if (minimizedChild && minimizedChild.type === 'NAND_NOT') {
            return minimizedChild.child; 
        }
        
        return { type: 'NAND_NOT', child: minimizedChild };
    }
}


// --- HELPER: MIX AST TO STRING ---
function mixStringify(node) {
    if (!node) return "";
    switch (node.type) {
        case 'VAR': return node.value;
        case 'CONST': return node.value;
        case 'NAND': 
            return `(${mixStringify(node.left)}.${mixStringify(node.right)})'`;
        case 'NOR': 
            return `(${mixStringify(node.left)}+${mixStringify(node.right)})'`;
        case 'NAND_NOT': 
            let inner = mixStringify(node.child);
            return `(${inner}.${inner})'`; // Shows the split inputs entering the NAND gate
    }
}

// --- 3. CIRCUIT LAYOUT ENGINE ---
function mixComputeLayout(node) {
    let uniqueVars = new Set();
    function getVars(n) {
        if (!n) return;
        if (n.type === 'VAR') uniqueVars.add(n.value);
        if (n.type === 'NAND_NOT' && n.child && n.child.type === 'VAR') {
            uniqueVars.add(n.child.value);
        }
        getVars(n.child); getVars(n.left); getVars(n.right);
    }
    getVars(node);
    
    let varsArr = Array.from(uniqueVars).sort();
    let busX = {};
    let currentX = 50;
    
    // Draw both standard and negated buses to save on repetitive logic
    varsArr.forEach(v => {
        busX[v] = currentX;
        busX[v + "'"] = currentX + 30; 
        currentX += 70;
    });
    
    let baseX = currentX + 80; 
    let leafY = 100;           
    const dx = 220;  
    const dy = 60;   

    function traverse(n) {
        if (!n) return;
        
        // Intercept standard A' and attach to negated bus
        if (n.type === 'NAND_NOT' && n.child && n.child.type === 'VAR') {
            n.isNegatedBus = true;
            n.depth = 0;
            n.x = busX[n.child.value + "'"];
            n.y = leafY;
            leafY += dy;
            return;
        }

        if (n.type === 'VAR' || n.type === 'CONST') {
            n.depth = 0;
            n.x = n.type === 'VAR' ? busX[n.value] : (baseX - 40); 
            n.y = leafY;
            leafY += dy;
            return;
        }
        
        if (n.type === 'NAND_NOT') {
            traverse(n.child);
            n.depth = n.child.depth + 1;
            n.x = baseX + (n.depth - 1) * dx;
            n.y = n.child.y;
            return;
        }
        
        if (n.type === 'NAND' || n.type === 'NOR') {
            traverse(n.left);
            traverse(n.right);
            n.depth = Math.max(n.left.depth, n.right.depth) + 1;
            n.x = baseX + (n.depth - 1) * dx;
            n.y = (n.left.y + n.right.y) / 2;
        }
    }
    
    traverse(node);
    return { 
        width: node ? node.x + 350 : 0, 
        height: leafY + 60,
        vars: varsArr,
        busX: busX
    };
}

// --- 4. SVG GENERATOR ---
function mixGenerateSVG(ast, layoutProps) {
    let svgContent = `<svg width="${layoutProps.width}" height="${layoutProps.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Draw Vertical Buses
    if (layoutProps.vars) {
        layoutProps.vars.forEach(v => {
            let bx = layoutProps.busX[v];
            let bxNot = layoutProps.busX[v + "'"];
            
            svgContent += `<text x="${bx}" y="30" font-family="monospace" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${v}</text>`;
            svgContent += `<line x1="${bx}" y1="40" x2="${bx}" y2="${layoutProps.height}" stroke="#666" stroke-width="2"/>`;
            
            svgContent += `<line x1="${bx}" y1="50" x2="${bxNot}" y2="50" stroke="#666" stroke-width="2"/>`;
            svgContent += `<circle cx="${bx}" cy="50" r="4" fill="#666"/>`; 
            
            // Tiny downward-facing NAND gate for the bus inverter
            svgContent += `<line x1="${bxNot - 4}" y1="50" x2="${bxNot - 4}" y2="55" stroke="#666" stroke-width="1"/>`;
            svgContent += `<line x1="${bxNot + 4}" y1="50" x2="${bxNot + 4}" y2="55" stroke="#666" stroke-width="1"/>`;
            svgContent += `<path d="M ${bxNot - 8},55 L ${bxNot + 8},55 A 8,8 0 0,1 ${bxNot - 8},55 Z" fill="#e8f4f8" stroke="#0056b3" stroke-width="2"/>`;
            svgContent += `<circle cx="${bxNot}" cy="66" r="3" fill="#1e1e1e" stroke="#0056b3" stroke-width="2"/>`;
            
            svgContent += `<line x1="${bxNot}" y1="69" x2="${bxNot}" y2="${layoutProps.height}" stroke="#666" stroke-width="2"/>`;
        });
    }

    function getOutputX(n) {
        if (n.isNegatedBus || n.type === 'VAR') return n.x;
        if (n.type === 'CONST') return n.x + 10;
        return n.x + 30; // NAND & NOR width
    }

    function drawWire(x1, y1, x2, y2) {
        if (Math.abs(y1 - y2) < 1) {
            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aaa" stroke-width="2"/>`;
        } else {
            const midX = (x1 + x2) / 2;
            svgContent += `<path d="M ${x1},${y1} L ${midX},${y1} L ${midX},${y2} L ${x2},${y2}" fill="none" stroke="#aaa" stroke-width="2"/>`;
        }
    }

    function drawNode(n) {
        if (!n) return;
        
        if (n.isNegatedBus || n.type === 'VAR') {
            svgContent += `<circle cx="${n.x}" cy="${n.y}" r="4" fill="white"/>`;
            return;
        } 
        if (n.type === 'CONST') {
            svgContent += `<text x="${n.x}" y="${n.y + 6}" font-family="monospace" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${n.value}</text>`;
            return;
        } 
        
        if (n.type === 'NAND_NOT') {
            let outX = getOutputX(n.child);
            drawWire(outX, n.child.y, n.x - 40, n.y); 
            
            // Split wire into 2 legs
            svgContent += `<circle cx="${n.x - 40}" cy="${n.y}" r="3" fill="#aaa"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y}" x2="${n.x - 40}" y2="${n.y - 10}" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y}" x2="${n.x - 40}" y2="${n.y + 10}" stroke="#aaa" stroke-width="2"/>`;
            
            // Connect to NAND input
            svgContent += `<line x1="${n.x - 40}" y1="${n.y - 10}" x2="${n.x - 20}" y2="${n.y - 10}" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y + 10}" x2="${n.x - 20}" y2="${n.y + 10}" stroke="#aaa" stroke-width="2"/>`;
            
            // Standard NAND Shape
            svgContent += `<path d="M ${n.x - 20},${n.y - 20} L ${n.x},${n.y - 20} A 20,20 0 0,1 ${n.x},${n.y + 20} L ${n.x - 20},${n.y + 20} Z" fill="#e8f4f8" stroke="#0056b3" stroke-width="2"/>`;
            svgContent += `<circle cx="${n.x + 25}" cy="${n.y}" r="5" fill="#1e1e1e" stroke="#0056b3" stroke-width="2"/>`;
            svgContent += `<text x="${n.x - 6}" y="${n.y + 4}" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0056b3" text-anchor="middle">NAND</text>`;
            
            let expr = mixStringify(n);
            svgContent += `<text x="${n.x + 38}" y="${n.y - 8}" font-family="monospace" font-size="13" fill="#ffeb3b">${expr}</text>`;
            
            drawNode(n.child);
        } 
        else if (n.type === 'NAND' || n.type === 'NOR') {
            let leftOutX = getOutputX(n.left);
            let rightOutX = getOutputX(n.right);
            
            let inXOffset = n.type === 'NOR' ? -12 : -20;
            drawWire(leftOutX, n.left.y, n.x + inXOffset, n.y - 10);
            drawWire(rightOutX, n.right.y, n.x + inXOffset, n.y + 10);

            if (n.type === 'NAND') {
                svgContent += `<path d="M ${n.x - 20},${n.y - 20} L ${n.x},${n.y - 20} A 20,20 0 0,1 ${n.x},${n.y + 20} L ${n.x - 20},${n.y + 20} Z" fill="#e8f4f8" stroke="#0056b3" stroke-width="2"/>`;
                svgContent += `<circle cx="${n.x + 25}" cy="${n.y}" r="5" fill="#1e1e1e" stroke="#0056b3" stroke-width="2"/>`;
                svgContent += `<text x="${n.x - 6}" y="${n.y + 4}" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0056b3" text-anchor="middle">NAND</text>`;
            } else {
                svgContent += `<path d="M ${n.x - 20},${n.y - 20} Q ${n.x},${n.y - 20} ${n.x + 20},${n.y} Q ${n.x},${n.y + 20} ${n.x - 20},${n.y + 20} Q ${n.x - 5},${n.y} ${n.x - 20},${n.y - 20} Z" fill="#fdf3ec" stroke="#d35400" stroke-width="2"/>`;
                svgContent += `<circle cx="${n.x + 25}" cy="${n.y}" r="5" fill="#1e1e1e" stroke="#d35400" stroke-width="2"/>`;
                svgContent += `<text x="${n.x - 2}" y="${n.y + 4}" font-family="sans-serif" font-size="9" font-weight="bold" fill="#d35400" text-anchor="middle">NOR</text>`;
            }
            
            let expr = mixStringify(n);
            svgContent += `<text x="${n.x + 38}" y="${n.y - 8}" font-family="monospace" font-size="13" fill="#ffeb3b">${expr}</text>`;
            
            drawNode(n.left);
            drawNode(n.right);
        }
    }

    drawNode(ast);
    
    if (ast) {
        let finalX = getOutputX(ast);
        drawWire(finalX, ast.y, finalX + 180, ast.y);
        svgContent += `<text x="${finalX + 185}" y="${ast.y + 5}" font-family="monospace" font-size="18" font-weight="bold" fill="white"></text>`;
    }
    
    svgContent += `</svg>`;
    return svgContent;
}

// --- 5. UI CONTROLLER ---
function generateMixCircuit() {
    const input = document.getElementById('exprInput').value.replace(/\s+/g, '');
    
    if(!input){
        if(typeof showErrorModal === 'function') showErrorModal("Please enter a Boolean expression.");
        return;
    }

    try {
        // 1. Standard Parse
        const tokens = mixTokenize(input);
        const parser = new MixParser(tokens);
        let standardAst = parser.parse();
        
        // 2. Unminimized Circuit (Direct Translation)
        let unminimizedAst = mixConvertToMixAST(standardAst);
        let layoutUnminimized = mixComputeLayout(unminimizedAst);
        let unminimizedSVG = mixGenerateSVG(unminimizedAst, layoutUnminimized);

        // 3. Minimized Circuit (Optimized)
        let standardAst2 = new MixParser(mixTokenize(input)).parse();
        let minimizedAst = mixMinimizeAST(mixConvertToMixAST(standardAst2));
        let layoutMinimized = mixComputeLayout(minimizedAst);
        let minimizedSVG = mixGenerateSVG(minimizedAst, layoutMinimized);
        
        // 4. Update the global UI blocks (Matches your UI logic)
        if (typeof globalResult !== 'undefined') {
            globalResult.value = "F = " + mixStringify(minimizedAst);
        }

        if (typeof globalSteps !== 'undefined') {
            globalSteps.innerHTML = `
<hr class='kmap-step-divider'>
<h3>Direct Translation (Unminimized)</h3>
<p style="font-size: 0.9rem; color: #666; margin-top: -10px;">Shows literal substitution using only NAND and NOR gates.</p>
<div style="overflow:auto; margin-top:15px; margin-bottom: 15px; background: transparent; padding: 20px; border-radius: 8px;">
    ${unminimizedSVG}
</div>
<p style="font-family: monospace;">Direct Equation = ${mixStringify(unminimizedAst)}</p>

<hr class='kmap-step-divider'>

<h3>Optimized Mixed Circuit (Minimized)</h3>
<p style="font-size: 0.9rem; color: #666; margin-top: -10px;">Eliminates redundant back-to-back negations.</p>
<div style="overflow:auto; margin-top:15px; margin-bottom: 15px; background: transparent; padding: 20px; border-radius: 8px;">
    ${minimizedSVG}
</div>
<p style="font-family: monospace;">Optimized Equation = ${mixStringify(minimizedAst)} = ${input}</p>
<hr class='kmap-step-divider'>
`;
        }
    } catch (e) {
        if(typeof showErrorModal === 'function') {
            showErrorModal("Syntax Error: " + e.message);
        } else {
            console.error("Syntax Error: " + e.message);
        }
        if (typeof globalSteps !== 'undefined') globalSteps.innerHTML = '';
    }
}