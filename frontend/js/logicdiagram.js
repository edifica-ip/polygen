// --- 1. LEXER & PARSER ---
function logicTokenize(str) {
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

class LogicParser {
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

// --- HELPER: AST TO STRING ---
function logicStringify(node) {
    if (!node) return "";
    switch (node.type) {
        case 'VAR': return node.value;
        case 'CONST': return node.value;
        case 'NOT': 
            return (node.child.type === 'OR' || node.child.type === 'AND') 
                ? `(${logicStringify(node.child)})'` : `${logicStringify(node.child)}'`;
        case 'AND': {
            let lAnd = node.left.type === 'OR' ? `(${logicStringify(node.left)})` : logicStringify(node.left);
            let rAnd = node.right.type === 'OR' ? `(${logicStringify(node.right)})` : logicStringify(node.right);
            return `${lAnd}.${rAnd}`;
        }
        case 'OR': {
            return `${logicStringify(node.left)} + ${logicStringify(node.right)}`;
        }
    }
}

// --- 2. CIRCUIT LAYOUT ENGINE ---
function logicComputeLayout(node) {
    // 1. Identify all unique variables
    let uniqueVars = new Set();
    function getVars(n) {
        if (!n) return;
        if (n.type === 'VAR') uniqueVars.add(n.value);
        if (n.type === 'NOT' && n.child && n.child.type === 'VAR') {
            uniqueVars.add(n.child.value);
        }
        getVars(n.child); getVars(n.left); getVars(n.right);
    }
    getVars(node);
    
    // 2. Setup vertical bus coordinates
    let varsArr = Array.from(uniqueVars).sort();
    let busX = {};
    let currentX = 50;
    varsArr.forEach(v => {
        busX[v] = currentX;
        busX[v + "'"] = currentX + 30; // Negated vertical bus
        currentX += 70; // Spacing before next variable block
    });
    
    let baseX = currentX + 50; // Ensure logic gates start safely to the right of all buses
    let leafY = 100;           // Start Y coordinate for input wires
    const dx = 160;            // Horizontal space between logic gates (Increased to fit labels)
    const dy = 60;             // Vertical space between input wires

    // 3. Post-order traversal to calculate X,Y coordinates
    function traverse(n) {
        if (!n) return;
        
        // Intercept standard A' or !A and map it directly to the negated bus
        if (n.type === 'NOT' && n.child && n.child.type === 'VAR') {
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
        
        if (n.type === 'NOT') {
            traverse(n.child);
            n.depth = n.child.depth + 1;
            n.x = baseX + (n.depth - 1) * dx;
            n.y = n.child.y;
            return;
        }
        
        if (n.type === 'AND' || n.type === 'OR') {
            traverse(n.left);
            traverse(n.right);
            n.depth = Math.max(n.left.depth, n.right.depth) + 1;
            n.x = baseX + (n.depth - 1) * dx;
            n.y = (n.left.y + n.right.y) / 2;
        }
    }
    
    traverse(node);
    return { 
        width: node ? node.x + 200 : 0, 
        height: leafY + 40,
        vars: varsArr,
        busX: busX
    };
}

// --- 3. SVG GENERATOR ---
function logicGenerateSVG(ast, layoutProps) {
    let svgContent = `<svg width="${layoutProps.width}" height="${layoutProps.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // --- DRAW VERTICAL BUSES ---
    if (layoutProps.vars) {
        layoutProps.vars.forEach(v => {
            let bx = layoutProps.busX[v];
            let bxNot = layoutProps.busX[v + "'"];
            
            // Variable Label
            svgContent += `<text x="${bx}" y="30" font-family="monospace" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${v}</text>`;
            // Main vertical line
            svgContent += `<line x1="${bx}" y1="40" x2="${bx}" y2="${layoutProps.height}" stroke="#aaa" stroke-width="2"/>`;
            
            // Wire splitting off to the right for the NOT gate
            svgContent += `<line x1="${bx}" y1="50" x2="${bxNot}" y2="50" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<circle cx="${bx}" cy="50" r="4" fill="#aaa"/>`; // Connection dot
            
            // Tiny downward-facing NOT gate
            svgContent += `<polygon points="${bxNot - 8},50 ${bxNot + 8},50 ${bxNot},65" fill="#fff" stroke="#aaa" stroke-width="2"/>`;
            svgContent += `<circle cx="${bxNot}" cy="70" r="4" fill="#fff" stroke="#aaa" stroke-width="2"/>`;
            
            // Negated vertical line
            svgContent += `<line x1="${bxNot}" y1="74" x2="${bxNot}" y2="${layoutProps.height}" stroke="#aaa" stroke-width="2"/>`;
        });
    }

    // Helper to get the physical output coordinate of a node
    function getOutputX(n) {
        if (n.isNegatedBus || n.type === 'VAR') return n.x; // Start directly from bus line
        if (n.type === 'CONST') return n.x + 10;
        if (n.type === 'NOT') return n.x + 15; // Circle output edge
        return n.x + 20; // AND/OR gate output edge
    }

    // Helper to draw orthogonal (90-degree) wires beautifully
    function drawWire(x1, y1, x2, y2) {
        if (Math.abs(y1 - y2) < 1) {
            // Straight horizontal line
            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#555" stroke-width="2"/>`;
        } else {
            // Offset logic prevents staggered inputs from overlapping each other
            const midX = (x1 + x2) / 2;
            svgContent += `<path d="M ${x1},${y1} L ${midX},${y1} L ${midX},${y2} L ${x2},${y2}" fill="none" stroke="#555" stroke-width="2"/>`;
        }
    }

    // Draw the nodes recursively
    function drawNode(n) {
        if (!n) return;
        
        if (n.isNegatedBus || n.type === 'VAR') {
            // Simply draw a solid black connection dot on the corresponding bus
            svgContent += `<circle cx="${n.x}" cy="${n.y}" r="4" fill="white"/>`;
            return;
        } 
        
        if (n.type === 'CONST') {
            // Draw constant 1 or 0
            svgContent += `<text x="${n.x}" y="${n.y + 6}" font-family="monospace" font-size="16" font-weight="bold" fill="#111" text-anchor="middle">${n.value}</text>`;
            return;
        } 
        
        if (n.type === 'NOT') {
            let inX = getOutputX(n.child);
            drawWire(inX, n.child.y, n.x - 20, n.y);
            
            // Draw NOT Triangle
            svgContent += `<polygon points="${n.x - 20},${n.y - 15} ${n.x + 5},${n.y} ${n.x - 20},${n.y + 15}" fill="#fff" stroke="#333" stroke-width="2"/>`;
            // Draw NOT Bubble
            svgContent += `<circle cx="${n.x + 10}" cy="${n.y}" r="5" fill="#fff" stroke="#333" stroke-width="2"/>`;
            
            // Draw Sub-expression Label
            let expr = logicStringify(n);
            svgContent += `<text x="${n.x + 18}" y="${n.y - 6}" font-family="monospace" font-size="13" fill="#666">${expr}</text>`;
            
            drawNode(n.child);
        } 
        else if (n.type === 'AND' || n.type === 'OR') {
            let leftOutX = getOutputX(n.left);
            let rightOutX = getOutputX(n.right);
            
            // Adjust input connection point slightly for the curved back of an OR gate
            let inXOffset = n.type === 'OR' ? -12 : -20;
            
            drawWire(leftOutX, n.left.y, n.x + inXOffset, n.y - 10);
            drawWire(rightOutX, n.right.y, n.x + inXOffset, n.y + 10);

            if (n.type === 'AND') {
                // D-Shaped Path
                svgContent += `<path d="M ${n.x - 20},${n.y - 20} L ${n.x},${n.y - 20} A 20,20 0 0,1 ${n.x},${n.y + 20} L ${n.x - 20},${n.y + 20} Z" fill="#e8f4f8" stroke="#0056b3" stroke-width="2"/>`;
                svgContent += `<text x="${n.x - 6}" y="${n.y + 4}" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0056b3" text-anchor="middle">AND</text>`;
            } else {
                // Shield-Shaped Path
                svgContent += `<path d="M ${n.x - 20},${n.y - 20} Q ${n.x},${n.y - 20} ${n.x + 20},${n.y} Q ${n.x},${n.y + 20} ${n.x - 20},${n.y + 20} Q ${n.x - 5},${n.y} ${n.x - 20},${n.y - 20} Z" fill="#fdf3ec" stroke="#d35400" stroke-width="2"/>`;
                svgContent += `<text x="${n.x - 2}" y="${n.y + 4}" font-family="sans-serif" font-size="10" font-weight="bold" fill="#d35400" text-anchor="middle">OR</text>`;
            }
            
            // Draw Sub-expression Label
            let expr = logicStringify(n);
            svgContent += `<text x="${n.x + 25}" y="${n.y - 6}" font-family="monospace" font-size="13" fill="white">${expr}</text>`;
            
            drawNode(n.left);
            drawNode(n.right);
        }
    }

    drawNode(ast);
    
    // Draw the final output wire and label
    if (ast) {
        let finalX = getOutputX(ast);
        // Extend the final output wire slightly more to make room for the intermediate label
        drawWire(finalX, ast.y, finalX + 70, ast.y);
        let finalExpr = logicStringify(ast);


    }
    
    svgContent += `</svg>`;
    return svgContent;
}

// --- 4. UI CONTROLLER ---
function drawCircuit(input = null) {
    if(!input)
     input = document.getElementById('exprInput').value.replace(/\s+/g, '');
    //const errorBox = document.getElementById('errorBox');
    //const svgContainer = document.getElementById('svgContainer');
    
    //errorBox.style.display = "none";


     if(!input){
        showErrorModal(
            "Please enter a Boolean expression."
        );
        return;
    }

    try {
        const tokens = logicTokenize(input);
        const parser = new LogicParser(tokens);
        let ast = parser.parse();
        
        let layoutProps = logicComputeLayout(ast);
        let svg = logicGenerateSVG(ast, layoutProps);
        
        //svgContainer.innerHTML = svg;


        globalResult.value = "F = " + logicStringify(ast);

globalSteps.innerHTML =
`
<hr class='kmap-step-divider'>

<div style="
overflow:auto;
margin-top:15px;
margin-bottom: 15px;
">
    ${svg}
</div>

<hr class='kmap-step-divider'>
`;
    } catch (e) {
        showErrorModal("Syntax Error: " + e.message);
        //errorBox.style.display = "block";
        //svgContainer.innerHTML = '';
    }
}

// Draw a default circuit on load
//window.onload = drawCircuit;