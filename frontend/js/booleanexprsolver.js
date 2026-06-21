/** * --- CORE ENGINE ---
 * 1. Lexer: Converts string to tokens
 * 2. Parser: Converts tokens to AST (Abstract Syntax Tree)
 * 3. Transformer: Applies boolean rules to the AST
 * 4. Generator: Converts AST back to string
 */

// 1. LEXER
// 1. LEXER (Updated to handle '.' and implicit ANDs)
// 1. LEXER (Updated with Validation)
function tokenize(str) {
    // Check for invalid characters BEFORE tokenizing
    // We allow letters, 0-1, operators (+ * . ! '), parentheses, and whitespace
    const invalidChars = str.match(/[^A-Za-z01+*!. '()]/g);
    if (invalidChars) {
        // Grab the unique bad characters to tell the user exactly what went wrong
        const bad = Array.from(new Set(invalidChars)).join(" ");
        throw new Error(`Unsupported characters detected: ${bad}`);
    }

    str = str.replace(/\./g, '*'); // Convert dot notation to internal asterisk

    const rawTokens = [];
    const regex = /([A-Za-z01]|\+|\*|\!|\'|\(|\))/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
        rawTokens.push(match[0]);
    }

    if (rawTokens.length === 0) throw new Error("Expression is empty.");

    const finalTokens = [];
    // Loop through and insert '*' for implicit ANDs
    for (let i = 0; i < rawTokens.length; i++) {
        finalTokens.push(rawTokens[i]);
        if (i < rawTokens.length - 1) {
            const curr = rawTokens[i];
            const next = rawTokens[i+1];
            const expectsAndAfter = /^[A-Za-z01\)]$/.test(curr) || curr === "'";
            const expectsAndBefore = /^[A-Za-z01\!\(]$/.test(next);
            if (expectsAndAfter && expectsAndBefore) {
                finalTokens.push('*');
            }
        }
    }
    return finalTokens;
}
// 2. PARSER (Recursive Descent)
// Handles Precedence: NOT (!) > AND (*) > OR (+)
// 2. PARSER (Updated to handle postfix NOT " ' ")
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    parse() { 
        let result = this.parseOr(); 
        
        // If we finished building the tree but there are still leftover tokens 
        // (e.g., user typed "A + B C" but missed an operator, though our implicit AND catches most)
        if (this.pos < this.tokens.length) {
            throw new Error("Incomplete expression or misplaced operators.");
        }
        return result;
    }
    
    parseOr() {
        let left = this.parseAnd();
        while (this.peek() === '+') {
            this.consume();
            left = { type: 'OR', left: left, right: this.parseAnd() };
        }
        return left;
    }
    
    parseAnd() {
        let left = this.parseNot();
        while (this.peek() === '*') {
            this.consume();
            left = { type: 'AND', left: left, right: this.parseNot() };
        }
        return left;
    }
    
    // Handles prefix NOT (e.g., !A)
    parseNot() {
        if (this.peek() === '!') {
            this.consume();
            return { type: 'NOT', child: this.parseNot() };
        }
        return this.parsePostfix();
    }
    
    // NEW: Handles postfix NOT (e.g., A' or (A+B)')
    parsePostfix() {
        let node = this.parsePrimary();
        while (this.peek() === "'") {
            this.consume();
            node = { type: 'NOT', child: node };
        }
        return node;
    }
    
    parsePrimary() {
        // If we expect a variable/number but run out of tokens (e.g., dangling "A +")
        if (this.pos >= this.tokens.length) {
            throw new Error("Incomplete expression. Missing a variable or number at the end.");
        }

        const token = this.consume();
        if (token === '(') {
            const node = this.parseOr();
            // If we run out of tokens before finding the closing parenthesis
            if (this.pos >= this.tokens.length || this.consume() !== ')') {
                throw new Error("Missing closing parenthesis ')'.");
            }
            return node;
        }
        if (/[A-Za-z]/.test(token)) return { type: 'VAR', value: token };
        if (/[01]/.test(token)) return { type: 'CONST', value: token };
        
        // Catch misplaced operators like consecutive ++ or **
        throw new Error(`Unexpected operator misplaced: '${token}'`);
    }


    
    peek() { return this.tokens[this.pos]; }
    consume() { return this.tokens[this.pos++]; }
}

// 3. GENERATOR (AST -> String)
// 3. GENERATOR (AST -> Book Style String)
// 3. GENERATOR (AST -> Book Style String with Sorting)
function stringify(node) {
    if (!node) return "";
    switch (node.type) {
        case 'VAR': return node.value;
        case 'CONST': return node.value;
        case 'NOT': 
            // Postfix NOT: Wrap groups in parens, otherwise just attach the prime
            return (node.child.type === 'OR' || node.child.type === 'AND') 
                ? `(${stringify(node.child)})'` : `${stringify(node.child)}'`;
        case 'AND': {
            let factors = flattenTree(node, 'AND');
            // Safely parenthesize ORs inside ANDs
            let strFactors = factors.map(f => f.type === 'OR' ? `(${stringify(f)})` : stringify(f));
            strFactors.sort(); // Sort alphabetically
            return strFactors.join('.');
        }
        case 'OR': {
            let addends = flattenTree(node, 'OR');
            let strAddends = addends.map(a => stringify(a));
            strAddends.sort(); // Sort alphabetically
            return strAddends.join(' + ');
        }
    }
}

// HELPER: Creates a sorted string representation of a node to handle Commutativity (AB = BA)



function hashNode(node){

    if(!node) return "";

    if(node.type==="VAR")
        return node.value;

    if(node.type==="CONST")
        return node.value;

    if(node.type==="NOT")
        return "!" + hashNode(node.child);

    if(node.type==="AND"){

        let terms =
            flattenTree(node,"AND")
            .map(hashNode)
            .sort();

        return "AND(" + terms.join(",") + ")";
    }

    if(node.type==="OR"){

        let terms =
            flattenTree(node,"OR")
            .map(hashNode)
            .sort();

        return "OR(" + terms.join(",") + ")";
    }
}


// UPGRADED HELPER: Understands A*B is identically equal to B*A
function nodesEqual(n1, n2) {
    return hashNode(n1) === hashNode(n2);
}

// 4. TRANSFORMER (The Rule Engine)
// This walks the tree and applies algebraic rules recursively.
function applyRules(node, state) {
    if (state.changed || !node) return node; // Apply one rule at a time

    // Traverse bottom-up (children first)
    if (node.left) node.left = applyRules(node.left, state);
    if (node.right) node.right = applyRules(node.right, state);
    if (node.child) node.child = applyRules(node.child, state);

    if (state.changed) return node;

    // --- ADD YOUR BOOLEAN ALGEBRA LAWS HERE ---

    if (node.type === 'AND') {


// Deep Associativity / Idempotence: A * B * A = A * B
        let flatAnd = flattenTree(node, 'AND');
        let uniqueAnd = [];
        let seenAnd = new Set();
        for (let n of flatAnd) {
            let h = hashNode(n);
            if (!seenAnd.has(h)) { seenAnd.add(h); uniqueAnd.push(n); }
        }
        if (uniqueAnd.length < flatAnd.length) {
            state.changed = true;
            state.ruleUsed = "Associative/Idempotent Law (Deep)";
            return buildTree(uniqueAnd, 'AND');
        }


// Deep Complement Law (AND): Scans the whole chain for A and !A
        for (let i = 0; i < uniqueAnd.length; i++) {
            for (let j = i + 1; j < uniqueAnd.length; j++) {
                if (isComplement(uniqueAnd[i], uniqueAnd[j])) {
                    state.changed = true;
                    state.ruleUsed = "Complement Law (A.A' = 0)";
                    return { type: 'CONST', value: '0' };
                }
            }
        }



// Consensus Theorem (AND Dual): (X+Y)(!X+Z)(Y+Z) = (X+Y)(!X+Z)
        // (This searches across 3 terms in an AND chain to find and eliminate the redundant Y+Z)
        let flatAndConsensus = flattenTree(node, 'AND');
        for (let i = 0; i < flatAndConsensus.length; i++) {
            for (let j = i + 1; j < flatAndConsensus.length; j++) {
                let factorsI = flattenTree(flatAndConsensus[i], 'OR');
                let factorsJ = flattenTree(flatAndConsensus[j], 'OR');

                let pivotI = -1;
                let pivotJ = -1;
                
                // Look for a variable in term I whose complement is in term J (e.g., A and !A)
                for (let x = 0; x < factorsI.length; x++) {
                    for (let y = 0; y < factorsJ.length; y++) {
                        if (isComplement(factorsI[x], factorsJ[y])) {
                            pivotI = x;
                            pivotJ = y;
                            break;
                        }
                    }
                    if (pivotI !== -1) break;
                }

                if (pivotI !== -1) {
                    // We found our X and !X. Extract the remaining factors (Y and Z)
                    let remainingI = factorsI.filter((_, idx) => idx !== pivotI);
                    let remainingJ = factorsJ.filter((_, idx) => idx !== pivotJ);
                    let consensusFactors = remainingI.concat(remainingJ);

                    // Remove duplicates just in case Y and Z share common variables
                    let uniqueConsensus = [];
                    let seen = new Set();
                    for (let f of consensusFactors) {
                        let h = hashNode(f);
                        if (!seen.has(h)) { seen.add(h); uniqueConsensus.push(f); }
                    }

                    if (uniqueConsensus.length > 0) {
                        // Build what the "consensus term" SHOULD look like
                        let consensusNode = buildTree(uniqueConsensus, 'OR');
                        let consensusHash = hashNode(consensusNode);

                        // Scan the rest of the AND chain to see if this redundant term exists
                        for (let k = 0; k < flatAndConsensus.length; k++) {
                            if (k === i || k === j) continue;
                            if (hashNode(flatAndConsensus[k]) === consensusHash) {
                                // Found the redundant term! Delete it.
                                flatAndConsensus.splice(k, 1);
                                state.changed = true;
                                state.ruleUsed = "Consensus Theorem ((X+Y)(!X+Z)(Y+Z) = (X+Y)(!X+Z))";
                                return buildTree(flatAndConsensus, 'AND');
                            }
                        }
                    }
                }
            }
        }




        
      
// Deep Absorption Expansion (AND)
        for (let i = 0; i < uniqueAnd.length; i++) {
            for (let j = 0; j < uniqueAnd.length; j++) {
                if (i === j) continue;
                let term1 = uniqueAnd[i]; // E.g., X
                let term2 = uniqueAnd[j]; // E.g., X + Y

                if (term2.type === 'OR') {
                    let addends = flattenTree(term2, 'OR');
                    let idx = addends.findIndex(a => nodesEqual(a, term1));

                    if (idx !== -1) {
                        let remainingAddends = addends.filter((_, index) => index !== idx);
                        if (remainingAddends.length > 0) {
                            let remNode = buildTree(remainingAddends, 'OR'); // Y
                            
                            // Build X(X+Y) => X + 0.Y
                            let expandedNode = {
                                type: 'OR',
                                left: term1,
                                right: { type: 'AND', left: { type: 'CONST', value: '0' }, right: remNode }
                            };

                            let nextAnd = uniqueAnd.filter((_, index) => index !== i && index !== j);
                            nextAnd.push(expandedNode);

                            state.changed = true;
                            state.ruleUsed = "Absorption Expansion (X(X+Y) = X + 0.Y)";
                            return buildTree(nextAnd, 'AND');
                        }
                    }
                }
            }
        }

        

        // Annulment: A * 0 = 0
        if ((node.left.type === 'CONST' && node.left.value === '0') || 
            (node.right.type === 'CONST' && node.right.value === '0')) {
            state.changed = true;
            state.ruleUsed = "Annulment Law (A.0 = 0)";
            return { type: 'CONST', value: '0' };
        }
        // Identity: A * 1 = A
        if (node.right.type === 'CONST' && node.right.value === '1') {
            state.changed = true;
            state.ruleUsed = "Identity Law (A.1 = A)";
            return node.left;
        }
        if (node.left.type === 'CONST' && node.left.value === '1') {
            state.changed = true;
            state.ruleUsed = "Identity Law (1.A = A)";
            return node.right;
        }
        // Idempotent: A * A = A
        if (nodesEqual(node.left, node.right)) {
            state.changed = true;
            state.ruleUsed = "Idempotent Law (A.A = A)";
            return node.left;
        }


// Adjacency Law (AND): (A+B)(A+B') = A
        let adjAnd = checkAdjacency(node.left, node.right, 'OR');
        if (adjAnd) {
            state.changed = true;
            state.ruleUsed = "Adjacency Law ((A+B)(A+B') = A)";
            return adjAnd;
        }



// Distributive Law (Reverse): (X+Y)(X+Z) = X + YZ
        for (let i = 0; i < uniqueAnd.length; i++) {
            for (let j = i + 1; j < uniqueAnd.length; j++) {
                let addendsI = flattenTree(uniqueAnd[i], 'OR');
                let addendsJ = flattenTree(uniqueAnd[j], 'OR');

                let commonNode = null;
                let idxI = -1;
                let idxJ = -1;
                
                // Find a common addend in both OR groups (e.g., the 'A' in A+B and A+C)
                for (let x = 0; x < addendsI.length; x++) {
                    for (let y = 0; y < addendsJ.length; y++) {
                        if (nodesEqual(addendsI[x], addendsJ[y])) {
                            commonNode = addendsI[x];
                            idxI = x;
                            idxJ = y;
                            break;
                        }
                    }
                    if (commonNode) break;
                }

                if (commonNode) {
                    let remI = addendsI.filter((_, idx) => idx !== idxI);
                    let remJ = addendsJ.filter((_, idx) => idx !== idxJ);
                    
                    if (remI.length > 0 && remJ.length > 0) {
                        let leftOverI = buildTree(remI, 'OR');
                        let leftOverJ = buildTree(remJ, 'OR');
                        
                        uniqueAnd.splice(j, 1); 
                        uniqueAnd.splice(i, 1);
                        uniqueAnd.push({
                            type: 'OR',
                            left: commonNode,
                            right: { type: 'AND', left: leftOverI, right: leftOverJ }
                        });
                        
                        state.changed = true;
                        state.ruleUsed = "Distributive Law ((X+Y)(X+Z) = X + YZ)";
                        return buildTree(uniqueAnd, 'AND');
                    }
                }
            }
        }




// Deep Redundancy Expansion (AND)
        for (let i = 0; i < uniqueAnd.length; i++) {
            for (let j = 0; j < uniqueAnd.length; j++) {
                if (i === j) continue;
                let term1 = uniqueAnd[i]; // E.g., A
                let term2 = uniqueAnd[j]; // E.g., A' + B

                if (term2.type === 'OR') {
                    let addends = flattenTree(term2, 'OR');
                    let compIdx = addends.findIndex(a => isComplement(term1, a));

                    if (compIdx !== -1) {
                        let compTerm = addends[compIdx]; // A'
                        let remainingAddends = addends.filter((_, idx) => idx !== compIdx);
                        
                        if (remainingAddends.length > 0) {
                            let remNode = buildTree(remainingAddends, 'OR'); // B
                            
                            // Build: A.A' + A.B
                            let expandedNode = {
                                type: 'OR',
                                left: { type: 'AND', left: term1, right: compTerm }, 
                                right: { type: 'AND', left: term1, right: remNode }
                            };

                            let nextAnd = uniqueAnd.filter((_, idx) => idx !== i && idx !== j);
                            nextAnd.push(expandedNode);

                            state.changed = true;
                            state.ruleUsed = "Redundancy Expansion (X.(X'+Y) = X.X' + X.Y)";
                            return buildTree(nextAnd, 'AND');
                        }
                    }
                }
            }
        }




    }

    if (node.type === 'OR') {




// Deep Associativity / Idempotence: A + B + A = A + B
        let flatOr = flattenTree(node, 'OR');
        let uniqueOr = [];
        let seenOr = new Set();
        for (let n of flatOr) {
            let h = hashNode(n);
            if (!seenOr.has(h)) { seenOr.add(h); uniqueOr.push(n); }
        }
        if (uniqueOr.length < flatOr.length) {
            state.changed = true;
            state.ruleUsed = "Associative/Idempotent Law (Deep)";
            return buildTree(uniqueOr, 'OR');
        }


// Deep Complement Law (OR): Scans the whole chain for A and !A
        for (let i = 0; i < uniqueOr.length; i++) {
            for (let j = i + 1; j < uniqueOr.length; j++) {
                if (isComplement(uniqueOr[i], uniqueOr[j])) {
                    state.changed = true;
                    state.ruleUsed = "Complement Law (A + A' = 1)";
                    return { type: 'CONST', value: '1' };
                }
            }
        }



// Consensus Theorem: XY + !XZ + YZ = XY + !XZ
        // (This searches across 3 terms in an OR chain to find and eliminate the redundant YZ)
        let flatOrConsensus = flattenTree(node, 'OR');
        for (let i = 0; i < flatOrConsensus.length; i++) {
            for (let j = i + 1; j < flatOrConsensus.length; j++) {
                let factorsI = flattenTree(flatOrConsensus[i], 'AND');
                let factorsJ = flattenTree(flatOrConsensus[j], 'AND');

                let pivotI = -1;
                let pivotJ = -1;
                
                // Look for a variable in term I whose complement is in term J (e.g., A and !A)
                for (let x = 0; x < factorsI.length; x++) {
                    for (let y = 0; y < factorsJ.length; y++) {
                        if (isComplement(factorsI[x], factorsJ[y])) {
                            pivotI = x;
                            pivotJ = y;
                            break;
                        }
                    }
                    if (pivotI !== -1) break;
                }

                if (pivotI !== -1) {
                    // We found our X and !X. Extract the remaining factors (Y and Z)
                    let remainingI = factorsI.filter((_, idx) => idx !== pivotI);
                    let remainingJ = factorsJ.filter((_, idx) => idx !== pivotJ);
                    let consensusFactors = remainingI.concat(remainingJ);

                    // Remove duplicates just in case Y and Z share common variables
                    let uniqueConsensus = [];
                    let seen = new Set();
                    for (let f of consensusFactors) {
                        let h = hashNode(f);
                        if (!seen.has(h)) { seen.add(h); uniqueConsensus.push(f); }
                    }

                    if (uniqueConsensus.length > 0) {
                        // Build what the "consensus term" SHOULD look like
                        let consensusNode = buildTree(uniqueConsensus, 'AND');
                        let consensusHash = hashNode(consensusNode);

                        // Scan the rest of the OR chain to see if this redundant term exists
                        for (let k = 0; k < flatOrConsensus.length; k++) {
                            if (k === i || k === j) continue;
                            if (hashNode(flatOrConsensus[k]) === consensusHash) {
                                // Found the redundant term! Delete it.
                                flatOrConsensus.splice(k, 1);
                                state.changed = true;
                                state.ruleUsed = "Consensus Theorem (XY + X'Z + YZ = XY + X'Z)";
                                return buildTree(flatOrConsensus, 'OR');
                            }
                        }
                    }
                }
            }
        }



// Deep Absorption Expansion (OR)
        for (let i = 0; i < uniqueOr.length; i++) {
            for (let j = 0; j < uniqueOr.length; j++) {
                if (i === j) continue;
                let term1 = uniqueOr[i]; // E.g., X
                let term2 = uniqueOr[j]; // E.g., X.Y

                if (term2.type === 'AND') {
                    let factors = flattenTree(term2, 'AND');
                    let idx = factors.findIndex(f => nodesEqual(f, term1));

                    if (idx !== -1) {
                        let remainingFactors = factors.filter((_, index) => index !== idx);
                        if (remainingFactors.length > 0) {
                            let remNode = buildTree(remainingFactors, 'AND'); // Y
                            
                            // Build X + X.Y => X.(1+Y)
                            let expandedNode = {
                                type: 'AND',
                                left: term1,
                                right: { type: 'OR', left: { type: 'CONST', value: '1' }, right: remNode }
                            };

                            let nextOr = uniqueOr.filter((_, index) => index !== i && index !== j);
                            nextOr.push(expandedNode);

                            state.changed = true;
                            state.ruleUsed = "Absorption Expansion (X + X.Y = X.(1+Y))";
                            return buildTree(nextOr, 'OR');
                        }
                    }
                }
            }
        }



// Adjacency Law (OR): AB + AB' = A
        let adjOr = checkAdjacency(node.left, node.right, 'AND');
        if (adjOr) {
            state.changed = true;
            state.ruleUsed = "Adjacency Law (AB + AB' = A)";
            return adjOr;
        }



// Distributive Law: XY + XZ = X(Y+Z)
        for (let i = 0; i < uniqueOr.length; i++) {
            for (let j = i + 1; j < uniqueOr.length; j++) {
                let factorsI = flattenTree(uniqueOr[i], 'AND');
                let factorsJ = flattenTree(uniqueOr[j], 'AND');

                let commonNode = null;
                let idxI = -1;
                let idxJ = -1;
                
                // Find a common factor in both AND groups (e.g., the 'A' in AB and AC)
                for (let x = 0; x < factorsI.length; x++) {
                    for (let y = 0; y < factorsJ.length; y++) {
                        if (nodesEqual(factorsI[x], factorsJ[y])) {
                            commonNode = factorsI[x];
                            idxI = x;
                            idxJ = y;
                            break;
                        }
                    }
                    if (commonNode) break;
                }

                if (commonNode) {
                    let remI = factorsI.filter((_, idx) => idx !== idxI);
                    let remJ = factorsJ.filter((_, idx) => idx !== idxJ);
                    
                    if (remI.length > 0 && remJ.length > 0) {
                        let leftOverI = buildTree(remI, 'AND');
                        let leftOverJ = buildTree(remJ, 'AND');
                        
                        uniqueOr.splice(j, 1); 
                        uniqueOr.splice(i, 1);
                        uniqueOr.push({
                            type: 'AND',
                            left: commonNode,
                            right: { type: 'OR', left: leftOverI, right: leftOverJ }
                        });
                        
                        state.changed = true;
                        state.ruleUsed = "Distributive Law (XY + XZ = X(Y+Z))";
                        return buildTree(uniqueOr, 'OR');
                    }
                }
            }
        }



// Deep Redundancy Expansion (OR)
        for (let i = 0; i < uniqueOr.length; i++) {
            for (let j = 0; j < uniqueOr.length; j++) {
                if (i === j) continue;
                let term1 = uniqueOr[i];  // E.g., A
                let term2 = uniqueOr[j];  // E.g., A'.B

                if (term2.type === 'AND') {
                    let factors = flattenTree(term2, 'AND');
                    let compIdx = factors.findIndex(f => isComplement(term1, f));

                    if (compIdx !== -1) {
                        let compTerm = factors[compIdx]; // A'
                        let remainingFactors = factors.filter((_, idx) => idx !== compIdx);
                        
                        if (remainingFactors.length > 0) {
                            let remNode = buildTree(remainingFactors, 'AND'); // B
                            
                            // Build: (A + A') . (A + B)
                            let expandedNode = {
                                type: 'AND',
                                left: { type: 'OR', left: term1, right: compTerm },
                                right: { type: 'OR', left: term1, right: remNode }
                            };

                            let nextOr = uniqueOr.filter((_, idx) => idx !== i && idx !== j);
                            nextOr.push(expandedNode);

                            state.changed = true;
                            state.ruleUsed = "Redundancy Expansion (X + X'Y = (X+X')(X+Y))";
                            return buildTree(nextOr, 'OR');
                        }
                    }
                }
            }
        }
        
       



        



        // Annulment: A + 1 = 1
        if ((node.left.type === 'CONST' && node.left.value === '1') || 
            (node.right.type === 'CONST' && node.right.value === '1')) {
            state.changed = true;
            state.ruleUsed = "Annulment Law (A + 1 = 1)";
            return { type: 'CONST', value: '1' };
        }
        // Identity: A + 0 = A
        if (node.right.type === 'CONST' && node.right.value === '0') {
            state.changed = true;
            state.ruleUsed = "Identity Law (A + 0 = A)";
            return node.left;
        }
        if (node.left.type === 'CONST' && node.left.value === '0') {
            state.changed = true;
            state.ruleUsed = "Identity Law (0 + A = A)";
            return node.right;
        }
        // Idempotent: A + A = A
        if (nodesEqual(node.left, node.right)) {
            state.changed = true;
            state.ruleUsed = "Idempotent Law (A + A = A)";
            return node.left;
        }
    }

    if (node.type === 'NOT') {
        // Double Negation: !!A = A
        if (node.child.type === 'NOT') {
            state.changed = true;
            state.ruleUsed = "Involution/Double Negation Law (A'' = A)";
            return node.child.child;
        }

// Constant Negation: !0 = 1 and !1 = 0
        if (node.child.type === 'CONST') {
            state.changed = true;
            state.ruleUsed = `Constant Negation (!${node.child.value} = ${node.child.value === '0' ? '1' : '0'})`;
            return { type: 'CONST', value: node.child.value === '0' ? '1' : '0' };
        }
        
        // De Morgan's Law (OR to AND): !(A + B) = !A * !B
        if (node.child.type === 'OR') {
            state.changed = true;
            state.ruleUsed = "De Morgan's Law ((A+B)' = A'.B')";
            return { type: 'AND', 
                     left: { type: 'NOT', child: node.child.left }, 
                     right: { type: 'NOT', child: node.child.right } };
        }
        
        // De Morgan's Law (AND to OR): (A.B)' = A' + B'
        if (node.child.type === 'AND') {
            state.changed = true;
            state.ruleUsed = "De Morgan's Law ((A.B)' = A' + B')";
            return { type: 'OR', 
                     left: { type: 'NOT', child: node.child.left }, 
                     right: { type: 'NOT', child: node.child.right } };
        }
    }

    return node;
}

// --- UI CONTROLLER ---
function processExpression() {

    const input = document.getElementById('exprInput').value.replace(/\s+/g, '');
    const list = document.getElementById('stepList');
    const errorBox = document.getElementById('errorBox');
    
    list.innerHTML = "";
    errorBox.style.display = "none";

    try {
        // Parse initial input
        const tokens = tokenize(input);
        const parser = new Parser(tokens);
        let ast = parser.parse();
        
        let currentString = stringify(ast);
        addStepToList("Original Expression", currentString);

        let iter = 0;
        let running = true;

        // Loop engine until fully reduced
        while (running && iter < 30) {
            let state = { changed: false, ruleUsed: "" };
            
            // We must deep-clone the AST because objects are passed by reference
            let clonedAst = JSON.parse(JSON.stringify(ast));
            ast = applyRules(clonedAst, state);

            if (state.changed) {
                currentString = stringify(ast);
                addStepToList(state.ruleUsed, currentString);
            } else {
                running = false;
                addStepToList("Fully Reduced", currentString, true);
            }
            iter++;
        }
    } catch (e) {
        errorBox.innerText = "Syntax Error: Check your parentheses and operators. " + e.message;
        errorBox.style.display = "block";
    }
}


function addStepToList(rule, expr, isFinal = false) {
    
    const list = document.getElementById('stepList');
    const li = document.createElement('li');
    li.className = 'step-item';
    li.innerHTML = `
    <div class="rule-name"
        style="${isFinal ? 'color: #28a745; font-weight:bold;' : ''}">
        ${rule}
    </div>

    <div class="expression">
        ${expr}
            </div>

          
`;

    list.appendChild(li);
}


//HELPER
function flattenTree(node, type) {
    if (!node) return [];
    if (node.type === type) return flattenTree(node.left, type).concat(flattenTree(node.right, type));
    return [node];
}

function buildTree(arr,type){

    if(arr.length===0)
        return null;

    if(arr.length===1)
        return arr[0];

    const copy=[...arr];

    let right=copy.pop();

    return {
        type:type,
        left:buildTree(copy,type),
        right:right
    };
}

// HELPER: Checks if one node is the exact opposite of another (e.g., A and !A)
function isComplement(n1, n2) {
    if (n1 && n1.type === 'NOT' && nodesEqual(n1.child, n2)) return true;
    if (n2 && n2.type === 'NOT' && nodesEqual(n2.child, n1)) return true;
    return false;
}


// HELPER: Checks for Adjacency Law: XY + XY' = X  OR  (X+Y)(X+Y') = X
function checkAdjacency(n1, n2, targetType) {
    if (n1.type !== targetType || n2.type !== targetType) return null;
    
    // Test all 4 possible combinations of left/right matching
    let pairs = [
        [n1.left, n1.right, n2.left, n2.right],
        [n1.left, n1.right, n2.right, n2.left],
        [n1.right, n1.left, n2.left, n2.right],
        [n1.right, n1.left, n2.right, n2.left]
    ];
    
    for (let [common1, remainder1, common2, remainder2] of pairs) {
        if (nodesEqual(common1, common2) && isComplement(remainder1, remainder2)) {
            return common1; // Return the factored-out part
        }
    }
    return null;
}





// HELPER: Checks if a term exists as a multiplier anywhere in an AND chain (e.g., finding A inside A*B*C*D)
function hasFactor(node, term) {
    if (!node) return false;
    if (nodesEqual(node, term)) return true;
    if (node.type === 'AND') {
        return hasFactor(node.left, term) || hasFactor(node.right, term);
    }
    return false;
}

// HELPER: Checks if a term exists as an addend anywhere in an OR chain (e.g., finding A inside A+B+C+D)
function hasAddend(node, term) {
    if (!node) return false;
    if (nodesEqual(node, term)) return true;
    if (node.type === 'OR') {
        return hasAddend(node.left, term) || hasAddend(node.right, term);
    }
    return false;
}
