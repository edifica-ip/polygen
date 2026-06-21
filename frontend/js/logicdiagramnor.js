// --- 1. STANDARD LEXER & PARSER ---
function norTokenize(str) {
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

class NorParser {
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

// --- 2. AST TRANSFORMERS: STANDARD -> NOR ONLY ---
function norConvertToNorAST(node) {
    if (!node) return null;
    
    if (node.type === 'VAR' || node.type === 'CONST') {
        return { type: node.type, value: node.value };
    }
    
    // NOT(X) -> NOR(X, X) represented visually as NOR_NOT
    if (node.type === 'NOT') {
        return { type: 'NOR_NOT', child: norConvertToNorAST(node.child) };
    }
    
    // OR(X, Y) -> NOT(NOR(X, Y)) -> NOR_NOT(NOR(X, Y))
    if (node.type === 'OR') {
        return { 
            type: 'NOR_NOT', 
            child: { 
                type: 'NOR', 
                left: norConvertToNorAST(node.left), 
                right: norConvertToNorAST(node.right) 
            } 
        };
    }
    
    // AND(X, Y) -> NOR(NOT(X), NOT(Y)) -> NOR(NOR_NOT(X), NOR_NOT(Y))
    if (node.type === 'AND') {
        return {
            type: 'NOR',
            left: { type: 'NOR_NOT', child: norConvertToNorAST(node.left) },
            right: { type: 'NOR_NOT', child: norConvertToNorAST(node.right) }
        };
    }
}

// Recursively walks the NOR AST and removes back-to-back NOR_NOTs
function norMinimizeAST(node) {
    if (!node) return null;
    
    if (node.type === 'VAR' || node.type === 'CONST') {
        return { type: node.type, value: node.value };
    }
    
    if (node.type === 'NOR') {
        return {
            type: 'NOR',
            left: norMinimizeAST(node.left),
            right: norMinimizeAST(node.right)
        };
    }
    
    if (node.type === 'NOR_NOT') {
        let minimizedChild = norMinimizeAST(node.child);
        
        // DOUBLE NEGATION ELIMINATION: NOT(NOT(X)) == X
        if (minimizedChild && minimizedChild.type === 'NOR_NOT') {
            return minimizedChild.child; 
        }
        
        return { type: 'NOR_NOT', child: minimizedChild };
    }
}


// --- HELPER: NOR AST TO STRING ---
function norStringify(node) {
    if (!node) return "";
    switch (node.type) {
        case 'VAR': return node.value;
        case 'CONST': return node.value;
        case 'NOR': 
            // Mathematically represented as (A + B)'
            return `(${norStringify(node.left)}+${norStringify(node.right)})'`;
        case 'NOR_NOT': 
            // Visually splitting inputs means (A + A)'
            let inner = norStringify(node.child);
            return `(${inner}+${inner})'`;
    }
}

// --- 3. CIRCUIT LAYOUT ENGINE ---
function norComputeLayout(node) {
    let uniqueVars = new Set();
    function getVars(n) {
        if (!n) return;
        if (n.type === 'VAR') uniqueVars.add(n.value);
        getVars(n.child); getVars(n.left); getVars(n.right);
    }
    getVars(node);
    
    let varsArr = Array.from(uniqueVars).sort();
    let busX = {};
    let currentX = 50;
    varsArr.forEach(v => {
        busX[v] = currentX;
        currentX += 50;
    });
    
    let baseX = currentX + 80; 
    let leafY = 100;           
    const dx = 220;  
    const dy = 60;   

    function traverse(n) {
        if (!n) return;
        
        if (n.type === 'VAR' || n.type === 'CONST') {
            n.depth = 0;
            n.x = n.type === 'VAR' ? busX[n.value] : (baseX - 40); 
            n.y = leafY;
            leafY += dy;
            return;
        }
        
        if (n.type === 'NOR_NOT') {
            traverse(n.child);
            n.depth = n.child.depth + 1;
            n.x = baseX + (n.depth - 1) * dx;
            n.y = n.child.y;
            return;
        }
        
        if (n.type === 'NOR') {
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
function norGenerateSVG(ast, layoutProps) {
    let svgContent = `<svg width="${layoutProps.width}" height="${layoutProps.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    if (layoutProps.vars) {
        layoutProps.vars.forEach(v => {
            let bx = layoutProps.busX[v];
            svgContent += `<text x="${bx}" y="30" font-family="monospace" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${v}</text>`;
            svgContent += `<line x1="${bx}" y1="40" x2="${bx}" y2="${layoutProps.height}" stroke="#666" stroke-width="2"/>`;
        });
    }

    function getOutputX(n) {
        if (n.type === 'VAR') return n.x;
        if (n.type === 'CONST') return n.x + 10;
        return n.x + 30; // NOR gate + bubble width
    }

    function drawWire(x1, y1, x2, y2) {
        if (Math.abs(y1 - y2) < 1) {
            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aaa" stroke-width="2"/>`;
        } else {
            const midX = (x1 + x2) / 2;
            svgContent += `<path d="M ${x1},${y1} L ${midX},${y1} L ${midX},${y2} L ${x2},${y2}" fill="none" stroke="#aaa" stroke-width="2"/>`;
        }
    }

    function drawNorShape(x, y) {
        // NOR Shield-Shaped Path
        svgContent += `<path d="M ${x - 20},${y - 20} Q ${x},${y - 20} ${x + 20},${y} Q ${x},${y + 20} ${x - 20},${y + 20} Q ${x - 5},${y} ${x - 20},${y - 20} Z" fill="#fdf3ec" stroke="#d35400" stroke-width="2"/>`;
        // Inverting Bubble at the tip
        svgContent += `<circle cx="${x + 25}" cy="${y}" r="5" fill="#1e1e1e" stroke="#d35400" stroke-width="2"/>`;
        svgContent += `<text x="${x - 2}" y="${y + 4}" font-family="sans-serif" font-size="9" font-weight="bold" fill="#d35400" text-anchor="middle">NOR</text>`;
    }

    function drawNode(n) {
        if (!n) return;
        
        if (n.type === 'VAR') {
            svgContent += `<circle cx="${n.x}" cy="${n.y}" r="4" fill="white"/>`;
            return;
        } 
        if (n.type === 'CONST') {
            svgContent += `<text x="${n.x}" y="${n.y + 6}" font-family="monospace" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${n.value}</text>`;
            return;
        } 
        
        if (n.type === 'NOR_NOT') {
            let outX = getOutputX(n.child);
            drawWire(outX, n.child.y, n.x - 40, n.y); 
            
            svgContent += `<circle cx="${n.x - 40}" cy="${n.y}" r="3" fill="#aaa"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y}" x2="${n.x - 40}" y2="${n.y - 10}" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y}" x2="${n.x - 40}" y2="${n.y + 10}" stroke="#aaa" stroke-width="2"/>`;
            
            // Connect to the curved back of the NOR gate (offset -12)
            svgContent += `<line x1="${n.x - 40}" y1="${n.y - 10}" x2="${n.x - 12}" y2="${n.y - 10}" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y + 10}" x2="${n.x - 12}" y2="${n.y + 10}" stroke="#aaa" stroke-width="2"/>`;
            
            drawNorShape(n.x, n.y);
            
            let expr = norStringify(n);
            svgContent += `<text x="${n.x + 38}" y="${n.y - 8}" font-family="monospace" font-size="13" fill="#ffeb3b">${expr}</text>`;
            
            drawNode(n.child);
        } 
        else if (n.type === 'NOR') {
            let leftOutX = getOutputX(n.left);
            let rightOutX = getOutputX(n.right);
            
            // Connect to the curved back of the NOR gate (offset -12)
            drawWire(leftOutX, n.left.y, n.x - 12, n.y - 10);
            drawWire(rightOutX, n.right.y, n.x - 12, n.y + 10);

            drawNorShape(n.x, n.y);
            
            let expr = norStringify(n);
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
function generateNorCircuit() {
    const input = document.getElementById('exprInput').value.replace(/\s+/g, '');
    
    if(!input){
        if(typeof showErrorModal === 'function') showErrorModal("Please enter a Boolean expression.");
        return;
    }

    try {
        // 1. Standard Parse
        const tokens = norTokenize(input);
        const parser = new NorParser(tokens);
        let standardAst = parser.parse();
        
        // 2. Unminimized Circuit (Direct Translation)
        let unminimizedAst = norConvertToNorAST(standardAst);
        let layoutUnminimized = norComputeLayout(unminimizedAst);
        let unminimizedSVG = norGenerateSVG(unminimizedAst, layoutUnminimized);

        // 3. Minimized Circuit (Optimized)
        let standardAst2 = new NorParser(norTokenize(input)).parse();
        let minimizedAst = norMinimizeAST(norConvertToNorAST(standardAst2));
        let layoutMinimized = norComputeLayout(minimizedAst);
        let minimizedSVG = norGenerateSVG(minimizedAst, layoutMinimized);
        
        // 4. Update the global UI blocks
        if (typeof globalResult !== 'undefined') {
            globalResult.value = "F = " + norStringify(minimizedAst);
        }

        if (typeof globalSteps !== 'undefined') {
            globalSteps.innerHTML = `
<hr class='kmap-step-divider'>
<h3>Direct Translation (Unminimized)</h3>
<p style="font-size: 0.9rem; color: #666; margin-top: -10px;">Shows literal substitution where OR = (A NOR B)', AND = A' NOR B'</p>
<div style="overflow:auto; margin-top:15px; margin-bottom: 15px; background: transparent; padding: 20px; border-radius: 8px;">
    ${unminimizedSVG}
</div>
<p style="font-family: monospace;">Direct Equation = ${norStringify(unminimizedAst)}</p>

<hr class='kmap-step-divider'>

<h3>Optimized NOR Circuit (Minimized)</h3>
<p style="font-size: 0.9rem; color: #666; margin-top: -10px;">Eliminates redundant back-to-back negations (e.g., NOT(NOT(X)) -> X).</p>
<div style="overflow:auto; margin-top:15px; margin-bottom: 15px; background: transparent; padding: 20px; border-radius: 8px;">
    ${minimizedSVG}
</div>
<p style="font-family: monospace;">Optimized Equation = ${norStringify(minimizedAst)} = ${input}</p>
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