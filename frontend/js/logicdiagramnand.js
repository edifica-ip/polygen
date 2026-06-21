// --- 1. STANDARD LEXER & PARSER ---
function nandTokenize(str) {
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

class NandParser {
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

// --- 2. AST TRANSFORMERS: STANDARD -> NAND ONLY ---
function nandConvertToNandAST(node) {
    if (!node) return null;
    
    if (node.type === 'VAR' || node.type === 'CONST') {
        return { type: node.type, value: node.value };
    }
    
    // NOT(X) -> NAND(X, X) represented visually as NAND_NOT
    if (node.type === 'NOT') {
        return { type: 'NAND_NOT', child: nandConvertToNandAST(node.child) };
    }
    
    // AND(X, Y) -> NOT(NAND(X, Y)) -> NAND_NOT(NAND(X, Y))
    if (node.type === 'AND') {
        return { 
            type: 'NAND_NOT', 
            child: { 
                type: 'NAND', 
                left: nandConvertToNandAST(node.left), 
                right: nandConvertToNandAST(node.right) 
            } 
        };
    }
    
    // OR(X, Y) -> NAND(NOT(X), NOT(Y)) -> NAND(NAND_NOT(X), NAND_NOT(Y))
    if (node.type === 'OR') {
        return {
            type: 'NAND',
            left: { type: 'NAND_NOT', child: nandConvertToNandAST(node.left) },
            right: { type: 'NAND_NOT', child: nandConvertToNandAST(node.right) }
        };
    }
}

// Recursively walks the NAND AST and removes back-to-back NAND_NOTs
function nandMinimizeAST(node) {
    if (!node) return null;
    
    if (node.type === 'VAR' || node.type === 'CONST') {
        return { type: node.type, value: node.value };
    }
    
    if (node.type === 'NAND') {
        return {
            type: 'NAND',
            left: nandMinimizeAST(node.left),
            right: nandMinimizeAST(node.right)
        };
    }
    
    if (node.type === 'NAND_NOT') {
        let minimizedChild = nandMinimizeAST(node.child);
        
        // DOUBLE NEGATION ELIMINATION: NOT(NOT(X)) == X
        if (minimizedChild && minimizedChild.type === 'NAND_NOT') {
            return minimizedChild.child; 
        }
        
        return { type: 'NAND_NOT', child: minimizedChild };
    }
}


// --- HELPER: NAND AST TO STRING ---
function nandStringify(node) {
    if (!node) return "";
    switch (node.type) {
        case 'VAR': return node.value;
        case 'CONST': return node.value;
        case 'NAND': 
            // Mathematically represented as (A . B)'
            return `(${nandStringify(node.left)}.${nandStringify(node.right)})'`;
        case 'NAND_NOT': 
            // Visually splitting inputs means (A . A)'
            let inner = nandStringify(node.child);
            return `(${inner}.${inner})'`;
    }
}

// --- 3. CIRCUIT LAYOUT ENGINE ---
function nandComputeLayout(node) {
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
        
        if (n.type === 'NAND_NOT') {
            traverse(n.child);
            n.depth = n.child.depth + 1;
            n.x = baseX + (n.depth - 1) * dx;
            n.y = n.child.y;
            return;
        }
        
        if (n.type === 'NAND') {
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
function nandGenerateSVG(ast, layoutProps) {
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
        return n.x + 30; 
    }

    function drawWire(x1, y1, x2, y2) {
        if (Math.abs(y1 - y2) < 1) {
            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aaa" stroke-width="2"/>`;
        } else {
            const midX = (x1 + x2) / 2;
            svgContent += `<path d="M ${x1},${y1} L ${midX},${y1} L ${midX},${y2} L ${x2},${y2}" fill="none" stroke="#aaa" stroke-width="2"/>`;
        }
    }

    function drawNandShape(x, y) {
        svgContent += `<path d="M ${x - 20},${y - 20} L ${x},${y - 20} A 20,20 0 0,1 ${x},${y + 20} L ${x - 20},${y + 20} Z" fill="#e8f4f8" stroke="#0056b3" stroke-width="2"/>`;
        svgContent += `<circle cx="${x + 25}" cy="${y}" r="5" fill="#1e1e1e" stroke="#0056b3" stroke-width="2"/>`;
        svgContent += `<text x="${x - 6}" y="${y + 4}" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0056b3" text-anchor="middle">NAND</text>`;
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
        
        if (n.type === 'NAND_NOT') {
            let outX = getOutputX(n.child);
            drawWire(outX, n.child.y, n.x - 40, n.y); 
            
            svgContent += `<circle cx="${n.x - 40}" cy="${n.y}" r="3" fill="#aaa"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y}" x2="${n.x - 40}" y2="${n.y - 10}" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y}" x2="${n.x - 40}" y2="${n.y + 10}" stroke="#aaa" stroke-width="2"/>`;
            
            svgContent += `<line x1="${n.x - 40}" y1="${n.y - 10}" x2="${n.x - 20}" y2="${n.y - 10}" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<line x1="${n.x - 40}" y1="${n.y + 10}" x2="${n.x - 20}" y2="${n.y + 10}" stroke="#aaa" stroke-width="2"/>`;
            
            drawNandShape(n.x, n.y);
            
            let expr = nandStringify(n);
            svgContent += `<text x="${n.x + 38}" y="${n.y - 8}" font-family="monospace" font-size="13" fill="#ffeb3b">${expr}</text>`;
            
            drawNode(n.child);
        } 
        else if (n.type === 'NAND') {
            let leftOutX = getOutputX(n.left);
            let rightOutX = getOutputX(n.right);
            
            drawWire(leftOutX, n.left.y, n.x - 20, n.y - 10);
            drawWire(rightOutX, n.right.y, n.x - 20, n.y + 10);

            drawNandShape(n.x, n.y);
            
            let expr = nandStringify(n);
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
function generateNandCircuit() {
    const input = document.getElementById('exprInput').value.replace(/\s+/g, '');
    const svgUnminimized = document.getElementById('nandSvgContainerUnminimized');
    const svgMinimized = document.getElementById('nandSvgContainerMinimized');
    
    const resultUnminimized = document.getElementById('nandGlobalResultUnminimized');
    const resultMinimized = document.getElementById('nandGlobalResultMinimized');
    const globalSteps = document.getElementById('globalSteps');
    
    if(!input) return;

    try {
        // 1. Standard Parse
        const tokens = nandTokenize(input);
        const parser = new NandParser(tokens);
        let standardAst = parser.parse();
        
        // 2. Unminimized Circuit (Direct Translation)
        let unminimizedAst = nandConvertToNandAST(standardAst);
        let layoutUnminimized = nandComputeLayout(unminimizedAst);
        globalSteps.innerHTML = '<hr class=kmap-step-divider>'
        globalSteps.innerHTML += '<h3>Direct Translation (Unminimized)</h3>';
        globalSteps.innerHTML +=`<p style="font-size: 0.9rem; color: #666; margin-top: -10px;">Shows literal substitution where AND = (A NAND B)', OR = A' NAND B'</p>`
        globalSteps.innerHTML += nandGenerateSVG(unminimizedAst, layoutUnminimized);
        globalSteps.innerHTML += "Direct Equation = " + nandStringify(unminimizedAst);
        globalSteps.innerHTML += '<hr class=kmap-step-divider>'


        globalSteps.innerHTML +='<h3>Optimized NAND Circuit (Minimized)</h3>';
        globalSteps.innerHTML += `<p style="font-size: 0.9rem; color: #666; margin-top: -10px;">Eliminates redundant back-to-back negations (e.g., NOT(NOT(X)) -> X).</p>`;
        // 3. Minimized Circuit (Optimized)
        // Parse again to ensure a fresh, deep-copied AST before mutating
        let standardAst2 = new NandParser(nandTokenize(input)).parse();
        let minimizedAst = nandMinimizeAST(nandConvertToNandAST(standardAst2));
        let layoutMinimized = nandComputeLayout(minimizedAst);
        globalSteps.innerHTML += nandGenerateSVG(minimizedAst, layoutMinimized);
        globalSteps.innerHTML += "Optimized Equation = " + nandStringify(minimizedAst) + ' = ' + input;
        globalSteps.innerHTML += '<hr class=kmap-step-divider>'
        

    } catch (e) {
        showErrorModal("Syntax Error: " + e.message);
        //svgUnminimized.innerHTML = '';
        //svgMinimized.innerHTML = '';
        //resultUnminimized.value = '';
        //resultMinimized.value = '';
        globalSteps.innerHTML = '';
    }
}

// Draw default circuits on load
//window.onload = generateNandCircuit;