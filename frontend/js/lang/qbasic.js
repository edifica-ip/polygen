
class GotoSignal {

  constructor(label) {

    this.label = label;
    

  }

}

export class QBasicInterpreter {

  constructor() {
    this.lastRnd = 0;
    this.vars = {};
    this.output = [];
     this.currentLine = "";
    this.labels = {};
this.labelsBuilt = false;
this.stepCount = 0;

this.reservedWords = new Set([
  'LEN','ABS','SQR','INT',
  'LEFT$','RIGHT$','MID$',
  'VAL','STR$','CHR$','ASC',
  'UCASE$','LCASE$',
  'LTRIM$','RTRIM$',
  'SPACE$','STRING$',
  'SIN','COS','TAN', 'MOD',
'AND', 'OR', 'NOT',  'ATN','LOG','EXP',
  'RND','DATE$','TIME$',
  'CINT','SGN','FIX',
  'INSTR',
  'HEX$','OCT$','BIN$' , 'CINT',
'SGN','FIX','INSTR','HEX$','OCT$','BIN$'
]);
  }

  run(code) {

    this.labelsBuilt = false;
this.stepCount = 0;

    this.vars = {};
    this.output = [];
    
this.currentLine = "";

    const lines =
      code
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(x => x.length);

 
this.programLines = lines;
this.executeBlock(lines);


if (
  this.currentLine.length
) {

  this.output.push(
    this.currentLine
  );
}

    return this.output.join('\n');
  }

executeBlock(lines) {

  // build labels

 


  if (!this.labelsBuilt) {

    this.labels = {};

    for (let x = 0; x < lines.length; x++) {

      const m =
        lines[x].match(
          /^([A-Z][A-Z0-9_\$]*)\s*:$/i
        );

      if (m) {

        this.labels[
          m[1].toUpperCase()
        ] = x;
      }
    }

    this.labelsBuilt = true;
  }

  let i = 0;

  while (i < lines.length) {

    try {

      this.stepCount =
        (this.stepCount || 0) + 1;

      if (this.stepCount > 100000) {

        throw new Error(
          "Program terminated. Possible infinite loop."
        );
      }

      let line =
        lines[i].trim();

      if (!line) {

        i++;
        continue;

      }

//END
       if(/^END$/i.test(line)){

  return lines.length;

}

      // LABEL:
      if (
        /^([A-Z][A-Z0-9_\$]*)\s*:$/i
          .test(line)
      ) {

        i++;
        continue;

      }

      if(/^CLS$/i.test(line)){

  this.output = [];
  this.currentLine = "";

  i++;
  continue;
}

      // comments
      if (
        line.startsWith("'") ||
        /^REM\b/i.test(line)
      ) {

        i++;
        continue;

      }

      // GOTO
      if (/^GOTO\b/i.test(line)) {

        const label =
          line
            .replace(/^GOTO\s+/i, '')
            .trim()
            .toUpperCase();

        throw new GotoSignal(label);

      }


      if (/^INPUT\b/i.test(line)) {

  this.handleInput(line);

  i++;
  continue;
}


      if (/^WHILE\b/i.test(line)) {

  i =
    this.handleWhile(
      lines,
      i
    );

  continue;
}



if (/^DO$/i.test(line)) {

  i =
    this.handleDoLoop(
      lines,
      i
    );

  continue;
}



      if(
  /^SELECT\s+CASE\b/i
    .test(line)
){

  i =
    this.handleSelectCase(
      lines,
      i
    );

  continue;
}



     // PRINT

if (/^PRINT\b/i.test(line)) {

  let expr =
    line.replace(
      /^PRINT\s+/i,
      ''
    );

  // blank line

  if (!expr.length) {

    this.output.push("");

    i++;
    continue;
  }

  let result = "";

  // PRINT A,B,C

  if (
    expr.includes(",")
  ) {

    const parts =
      this.splitPrintArguments(
        expr,
        ','
      );

    result =
      parts
        .map(
          p => String(
            this.evaluate(p)
          )
        )
        .join(" ");
  }

  // PRINT A;B;C

  else if (
    expr.includes(";")
  ) {

    const trailing =
      expr.endsWith(";");

    if (trailing) {

      expr =
        expr.slice(
          0,
          -1
        );
    }

    const parts =
      this.splitPrintArguments(
        expr,
        ';'
      );

    result =
      parts
        .map(
          p => String(
            this.evaluate(p)
          )
        )
        .join("");

    if (trailing) {

      this.currentLine +=
        result;

    } else {

      this.currentLine +=
        result;

      this.output.push(
        this.currentLine
      );

      this.currentLine = "";
    }

    i++;
    continue;
  }

  // normal PRINT

  else {

    result =
      String(
        this.evaluate(expr)
      );
  }

  this.currentLine +=
    result;

  this.output.push(
    this.currentLine
  );

  this.currentLine = "";

  i++;
  continue;
}



      // LET
      if (/^LET\b/i.test(line)) {

        this.handleAssignment(
          line.replace(
            /^LET\s+/i,
            ''
          )
        );

        i++;
        continue;

      }

      // direct assignment
      if (
        /^[A-Z][A-Z0-9_\$]*\s*=/i
          .test(line)
      ) {

        this.handleAssignment(
          line
        );

        i++;
        continue;

      }

      // IF
      if (/^IF\b/i.test(line)) {

        i =
          this.handleIf(
            lines,
            i
          );

        continue;

      }

      // FOR
      if (/^FOR\b/i.test(line)) {

        i =
          this.handleFor(
            lines,
            i
          );

        continue;

      }

      i++;

    }
    catch (err) {

  if (
    err instanceof GotoSignal
  ) {

    // Only root program handles GOTO

    if (lines.length === this.programLines.length) {

      const pos =
        this.labels[
          err.label
        ];

      if (
        pos === undefined
      ) {

        throw new Error(
          "Unknown label: " +
          err.label
        );
      }

      i = pos;
      continue;
    }

    throw err;
  }

  throw err;
}

  }

}



 handleAssignment(line) {

  const pos = line.indexOf('=');

  if (pos < 0)
    return;

  const name =
    line.substring(0, pos)
      .trim()
      .toUpperCase();

  const expr =
    line.substring(pos + 1)
      .trim();

  // String variable validation

  if (name.endsWith('$')) {

    const isQuoted =
      /^".*"$/.test(expr);

    const isStringVar =
      /^[A-Z][A-Z0-9_]*\$$/i
        .test(expr);

    const value =
  this.evaluate(expr);

if (name.endsWith('$')) {

  const value =
    this.evaluate(expr);

  if (
    typeof value !== 'string'
  ) {

    throw new Error(
      'String expression expected'
    );
  }

  this.vars[name] = value;
  return;
}
  }

  const value =
    this.evaluate(expr);

  this.vars[name] = value;
}



handleInput(line) {

  const m =
    line.match(
      /^INPUT\s+(?:"([^"]*)"\s*;\s*)?([A-Z][A-Z0-9_\$]*)$/i
    );

  if (!m)
    return;

  const promptText =
    m[1] || "Input";

  const varName =
    m[2].toUpperCase();

  const value =
    prompt(promptText);

  if (varName.endsWith("$")) {

    this.vars[varName] =
      value ?? "";

  } else {

    this.vars[varName] =
      Number(value);
  }
}


handleWhile(lines,start) {

  const line =
    lines[start];

  const m =
    line.match(
      /^WHILE\s+(.+)$/i
    );

  if(!m)
    return start+1;

  const condition =
    m[1];

  let depth = 0;
let endPos = -1;

for (
  let i = start + 1;
  i < lines.length;
  i++
) {

 const current =
  lines[i]
    .trim()
    .toUpperCase();

  if (
    /^WHILE\b/i.test(current)
  ) {
    depth++;
  }

  else if (
    /^WEND$/i.test(current)
  ) {

    if (depth === 0) {

      endPos = i;
      break;

    } else {

      depth--;
    }
  }
}

  if(endPos<0)
    return start+1;

  const block =
    lines.slice(
      start+1,
      endPos
    );

  while(
    this.evaluateCondition(
      condition
    )
  ){

    this.executeBlock(
      block
    );
  }

  return endPos+1;
}

 handleFor(lines, start) {

    const line = lines[start];

    const m =
      line.match(
        /^FOR\s+([A-Z][A-Z0-9_\$]*)\s*=\s*(.+)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i
      );

    if (!m)
      return start + 1;

    const varName =
      m[1].toUpperCase();

    const begin =
      Number(
        this.evaluate(m[2])
      );

    const finish =
      Number(
        this.evaluate(m[3])
      );

    const step =
      m[4]
        ? Number(
            this.evaluate(m[4])
          )
        : 1;

   let depth = 0;
let nextPos = -1;

for (
  let i = start + 1;
  i < lines.length;
  i++
) {

  const current =
  lines[i]
    .trim()
    .toUpperCase();

  if (
    /^FOR\b/i.test(current)
  ) {
    depth++;
  }

  else if (
    /^NEXT\b/i.test(current)
  ) {

    if (depth === 0) {

      nextPos = i;
      break;

    } else {

      depth--;
    }
  }
}

    if (nextPos < 0)
      return start + 1;

    const block =
      lines.slice(
        start + 1,
        nextPos
      );

    if (step > 0) {

      for (
        let v = begin;
        v <= finish;
        v += step
      ) {

        this.vars[varName] = v;

       try{
   this.executeBlock(block);
}
catch(err){

   if(err instanceof GotoSignal){
      throw err;
   }

   throw err;
}
      }

    } else {

      for (
        let v = begin;
        v >= finish;
        v += step
      ) {

        this.vars[varName] = v;

        try{
   this.executeBlock(block);
}
catch(err){

   if(err instanceof GotoSignal){
      throw err;
   }

   throw err;
}
      }
    }

    return nextPos + 1;
  }



handleIf(lines, start) {

  const line = lines[start].trim();

  // ----------------------------
  // Single-line IF
  // ----------------------------
 const single =
  line.match(
    /^IF\s+(.+?)\s+THEN\s+(.+)$/i
  );

if (single) {

  const condition =
    this.evaluateCondition(
      single[1]
    );

  if (condition) {

    const stmt =
      single[2].trim();

    // IF ... THEN GOTO label

    if (/^GOTO\b/i.test(stmt)) {

      const label =
        stmt
          .replace(/^GOTO\s+/i,'')
          .trim()
          .toUpperCase();

      throw new GotoSignal(label);
    }

    // IF ... THEN LET ...

    if (/^LET\b/i.test(stmt)) {

      this.handleAssignment(
        stmt.replace(
          /^LET\s+/i,
          ''
        )
      );

      return start + 1;
    }

    // IF ... THEN PRINT ...

    if (/^PRINT\b/i.test(stmt)) {

      const expr =
        stmt.replace(
          /^PRINT\s+/i,
          ''
        );

      this.output.push(
        this.evaluate(expr)
      );

      return start + 1;
    }

    // generic fallback

    this.executeBlock([
      stmt
    ]);
  }

  return start + 1;
}

  // ----------------------------
  // Multi-line IF
  // ----------------------------
  const m =
    line.match(
      /^IF\s+(.+)\s+THEN$/i
    );

  if (!m)
    return start + 1;

  const condition =
    this.evaluateCondition(
      m[1]
    );

let elsePos = -1;
let endPos = -1;
let depth = 0;

for (
  let i = start + 1;
  i < lines.length;
  i++
) {

  const current =
    lines[i]
      .trim()
      .toUpperCase();

  // nested IF

  if (
    /^IF\b/.test(current) &&
    /THEN$/.test(current)
  ) {

    depth++;
    continue;
  }

  // END IF

  if (
    /^END\s*IF$/.test(current)
  ) {

    if (depth === 0) {

      endPos = i;
      break;

    } else {

      depth--;
      continue;
    }
  }

  // ELSE belonging to THIS IF

  if (
    /^ELSE$/.test(current) &&
    depth === 0
  ) {

    elsePos = i;
  }
}

  if (endPos < 0)
    return start + 1;

  if (condition) {

    const block =
      lines.slice(
        start + 1,
        elsePos >= 0
          ? elsePos
          : endPos
      );

    try {

    this.executeBlock(block);

  }
  catch(err){

    if(err instanceof GotoSignal){

      throw err;

    }

    throw err;
  }


  } else {

    if (elsePos >= 0) {

      const block =
        lines.slice(
          elsePos + 1,
          endPos
        );

      try {

    this.executeBlock(block);

  }
  catch(err){

    if(err instanceof GotoSignal){

      throw err;

    }

    throw err;
  }

    }
  }

  return endPos + 1;
}

handleDoLoop(lines,start){

  let endPos = -1;
  let condition = "";
  let mode = "UNTIL";

  let depth = 0;

  for(
    let i = start + 1;
    i < lines.length;
    i++
  ){

    const current =
      lines[i]
        .trim()
        .toUpperCase();

    // nested DO

    if(
      current === "DO"
    ){

      depth++;
      continue;
    }

    const m =
      current.match(
        /^LOOP\s+(UNTIL|WHILE)\s+(.+)$/
      );

    if(m){

      if(depth === 0){

        endPos = i;

        mode =
          m[1]
            .toUpperCase();

        condition =
          lines[i]
            .replace(
              /^LOOP\s+(UNTIL|WHILE)\s+/i,
              ''
            );

        break;

      }else{

        depth--;
      }
    }
  }

  if(endPos < 0)
    return start + 1;

  const block =
    lines.slice(
      start + 1,
      endPos
    );

  while(true){

    try{

      this.executeBlock(
        block
      );

    }
    catch(err){

      if(
        err instanceof GotoSignal
      ){
        throw err;
      }

      throw err;
    }

    const result =
      this.evaluateCondition(
        condition
      );

    if(
      mode === "UNTIL" &&
      result
    ){
      break;
    }

    if(
      mode === "WHILE" &&
      !result
    ){
      break;
    }
  }

  return endPos + 1;
}


handleSelectCase(
  lines,
  start
){

  const line =
    lines[start];

  const m =
    line.match(
      /^SELECT\s+CASE\s+(.+)$/i
    );

  if(!m)
    return start + 1;

  const value =
    this.evaluate(
      m[1]
    );

  // --------------------
  // Find matching END SELECT
  // --------------------

  let depth = 0;
  let endPos = -1;

  for(
    let i = start + 1;
    i < lines.length;
    i++
  ){

    const current =
      lines[i]
        .trim()
        .toUpperCase();

    if(
      /^SELECT\s+CASE\b/
        .test(current)
    ){

      depth++;
    }

    else if(
      /^END\s+SELECT$/
        .test(current)
    ){

      if(depth === 0){

        endPos = i;
        break;

      }else{

        depth--;
      }
    }
  }

  if(endPos < 0)
    return start + 1;

  // --------------------
  // Find matching CASE
  // --------------------

  let currentCase = -1;
  let matched = false;
  let elseCase = -1;

  for(
    let i = start + 1;
    i < endPos;
    i++
  ){

    const current =
      lines[i].trim();

    const caseMatch =
      current.match(
        /^CASE\s+(.+)$/i
      );

    if(!caseMatch)
      continue;

    const caseExpr =
      caseMatch[1]
        .trim();

    // CASE ELSE

    if(
      /^ELSE$/i.test(
        caseExpr
      )
    ){

      elseCase = i;
      continue;
    }

    if(matched)
      continue;

    // --------------------
    // CASE 1 TO 10
    // --------------------

    const rangeMatch =
      caseExpr.match(
        /^(.+)\s+TO\s+(.+)$/i
      );

    if(rangeMatch){

      const from =
        Number(
          this.evaluate(
            rangeMatch[1]
          )
        );

      const to =
        Number(
          this.evaluate(
            rangeMatch[2]
          )
        );

      if(
        value >= from &&
        value <= to
      ){

        currentCase = i;
        matched = true;
      }

      continue;
    }

    // --------------------
    // CASE IS > 10
    // --------------------

    const isMatch =
      caseExpr.match(
        /^IS\s*(>=|<=|>|<|=)\s*(.+)$/i
      );

    if(isMatch){

      const op =
        isMatch[1];

      const rhs =
        this.evaluate(
          isMatch[2]
        );

      let ok = false;

      switch(op){

        case ">":
          ok = value > rhs;
          break;

        case "<":
          ok = value < rhs;
          break;

        case ">=":
          ok = value >= rhs;
          break;

        case "<=":
          ok = value <= rhs;
          break;

        case "=":
          ok = value == rhs;
          break;
      }

      if(ok){

        currentCase = i;
        matched = true;
      }

      continue;
    }

    // --------------------
    // CASE 1,2,3
    // --------------------

    const parts =
      caseExpr
        .split(",");

    for(
      const part of parts
    ){

      const caseValue =
        this.evaluate(
          part.trim()
        );

      if(
        value == caseValue
      ){

        currentCase = i;
        matched = true;
        break;
      }
    }
  }

  // CASE ELSE fallback

  if(
    currentCase < 0 &&
    elseCase >= 0
  ){

    currentCase =
      elseCase;
  }

  // --------------------
  // Execute selected block
  // --------------------

  if(currentCase >= 0){

    let nextCase =
      endPos;

    let depth = 0;

    for(
      let i = currentCase + 1;
      i < endPos;
      i++
    ){

      const current =
        lines[i]
          .trim()
          .toUpperCase();

      if(
        /^SELECT\s+CASE\b/
          .test(current)
      ){

        depth++;
      }

      else if(
        /^END\s+SELECT$/
          .test(current)
      ){

        if(depth > 0)
          depth--;
      }

      else if(
        /^CASE\b/
          .test(current) &&
        depth === 0
      ){

        nextCase = i;
        break;
      }
    }

    const block =
      lines.slice(
        currentCase + 1,
        nextCase
      );

    try{

      this.executeBlock(
        block
      );

    }
    catch(err){

      if(
        err instanceof GotoSignal
      ){
        throw err;
      }

      throw err;
    }
  }

  return endPos + 1;
}




















splitPrintArguments(
  text,
  separator
){

  const parts = [];

  let current = "";

  let depth = 0;

  let inString = false;

  for(
    let i=0;
    i<text.length;
    i++
  ){

    const ch =
      text[i];

    if(ch === '"'){

      inString =
        !inString;

      current += ch;

      continue;
    }

    if(!inString){

      if(ch === '(')
        depth++;

      else if(ch === ')')
        depth--;

      else if(
        ch === separator &&
        depth === 0
      ){

        parts.push(
          current.trim()
        );

        current = "";

        continue;
      }
    }

    current += ch;
  }

  parts.push(
    current.trim()
  );

  return parts;
}



 evaluateCondition(expr) {

  expr =
    expr.replace(
      /<>/g,
      '!='
    );

  expr =
    expr.replace(
      /\bAND\b/gi,
      '&&'
    );

  expr =
    expr.replace(
      /\bOR\b/gi,
      '||'
    );

  expr =
    expr.replace(
      /\bNOT\s*\(([^)]+)\)/gi,
      (_, s) =>
        `!(${s})`
    );

  expr =
    expr.replace(
      /\bNOT\s+([A-Z][A-Z0-9_\$]*\s*(?:=|<>|<|>|<=|>=)\s*[^&|]+)/gi,
      (_, s) =>
        `!(${s})`
    );

  expr =
    expr.replace(
      /(?<![<>=!])=(?!=)/g,
      '=='
    );

  return !!this.evaluate(expr);
}


splitArguments(text) {

  const args = [];

  let current = "";

  let depth = 0;

  let inString = false;

  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const ch = text[i];

    if (ch === '"') {

      inString = !inString;

      current += ch;

      continue;
    }

    if (!inString) {

      if (ch === '(') {

        depth++;

      } else if (ch === ')') {

        depth--;

      } else if (
        ch === ',' &&
        depth === 0
      ) {

        args.push(
          current.trim()
        );

        current = "";

        continue;
      }
    }

    current += ch;
  }

  if (current.length) {

    args.push(
      current.trim()
    );
  }

  return args;
}


 replaceFunction(
  expr,
  name,
  callback
){

  

const pattern =
  new RegExp(
    '(?<![A-Z0-9_])' +
    name.replace(/\$/g,'\\$') +
    '\\s*\\(',
    'i'
  );

while(true){

  const match =
    pattern.exec(expr);

  if(!match)
    break;

  const pos =
    match.index;

  let start =
    pos +
    match[0].length - 1;

  let depth = 0;
  let end = -1;

  for(
    let i = start;
    i < expr.length;
    i++
  ){

    if(expr[i] === '(')
      depth++;

    else if(expr[i] === ')'){

      depth--;

      if(depth === 0){

        end = i;
        break;
      }
    }
  }

  if(end < 0)
    break;

  const full =
    expr.substring(
      pos,
      end + 1
    );

  const inside =
    expr.substring(
      start + 1,
      end
    );

  expr =
    expr.replace(
      full,
      callback(inside)
    );
}

  return expr;
}
  evaluate(expr) {

    expr = expr.trim();

    // string literal
    if (
      /^".*"$/.test(expr)
    ) {

      return expr.slice(
        1,
        -1
      );
    }


     

    expr =
  expr.replace(
    /\bMOD\b/gi,
    '%'
  );

    // LEN()
   // LEN()

expr =
  this.replaceFunction(
    expr,
    "LEN",
    s =>
      String(
        this.evaluate(s)
      ).length
  );

    // ABS()
    expr =
  this.replaceFunction(
    expr,
    "ABS",
    s =>
      Math.abs(
        Number(
          this.evaluate(s)
        )
      )
  );



    // SQR()
    expr =
  this.replaceFunction(
    expr,
    "SQR",
    s =>
      Math.sqrt(
        Number(
          this.evaluate(s)
        )
      )
  );




    // INT()
    expr =
  this.replaceFunction(
    expr,
    "INT",
    s =>
      Math.floor(
        Number(
          this.evaluate(s)
        )
      )
  );





     expr =
  this.replaceFunction(
    expr,
    "UCASE$",
    s =>
      JSON.stringify(
        String(
          this.evaluate(s)
        ).toUpperCase()
      )
  );

expr =
  this.replaceFunction(
    expr,
    "LCASE$",
    s =>
      JSON.stringify(
        String(
          this.evaluate(s)
        ).toLowerCase()
      )
  );



expr =
  this.replaceFunction(
    expr,
    "LTRIM$",
    s =>
      JSON.stringify(
        String(
          this.evaluate(s)
        ).trimStart()
      )
  );



expr =
  this.replaceFunction(
    expr,
    "RTRIM$",
    s =>
      JSON.stringify(
        String(
          this.evaluate(s)
        ).trimEnd()
      )
  );

  

expr =
  this.replaceFunction(
    expr,
    "SPACE$",
    s =>
      JSON.stringify(
        " ".repeat(
          Number(
            this.evaluate(s)
          )
        )
      )
  );


  

expr =
  this.replaceFunction(
    expr,
    "STRING$",
    s => {

      const args =
        this.splitArguments(s);

      const count =
        Number(
          this.evaluate(
            args[0]
          )
        );

      const ch =
        String(
          this.evaluate(
            args[1]
          )
        );

      return JSON.stringify(
        ch.charAt(0)
          .repeat(count)
      );
    }
  );





      expr =
  this.replaceFunction(
    expr,
    "LEFT$",
    s => {

      const args =
        this.splitArguments(s);

      const str =
        String(
          this.evaluate(
            args[0]
          )
        );

      const len =
        Number(
          this.evaluate(
            args[1]
          )
        );

      return JSON.stringify(
        str.substring(
          0,
          len
        )
      );
    }
  );




  expr =
  this.replaceFunction(
    expr,
    "RIGHT$",
    s => {

      const args =
        this.splitArguments(s);

      const str =
        String(
          this.evaluate(
            args[0]
          )
        );

      const len =
        Number(
          this.evaluate(
            args[1]
          )
        );

      return JSON.stringify(
        str.slice(-len)
      );
    }
  );


expr =
  this.replaceFunction(
    expr,
    "MID$",
    s => {

      const args =
        this.splitArguments(s);

      const str =
        String(
          this.evaluate(
            args[0]
          )
        );

      const start =
        Number(
          this.evaluate(
            args[1]
          )
        ) - 1;

      if(args.length === 2){

        return JSON.stringify(
          str.substring(
            start
          )
        );
      }

      const len =
        Number(
          this.evaluate(
            args[2]
          )
        );

      return JSON.stringify(
        str.substr(
          start,
          len
        )
      );
    }
  );


  expr =
  this.replaceFunction(
    expr,
    "VAL",
    s =>
      Number(
        this.evaluate(s)
      )
  );

  expr =
  this.replaceFunction(
    expr,
    "STR$",
    s =>
      JSON.stringify(
        " " +
        String(
          this.evaluate(s)
        )
      )
  );


  expr =
  this.replaceFunction(
    expr,
    "CHR$",
    s =>
      JSON.stringify(
        String.fromCharCode(
          Number(
            this.evaluate(s)
          )
        )
      )
  );

  expr =
  this.replaceFunction(
    expr,
    "ASC",
    s => {

      const str =
        String(
          this.evaluate(s)
        );

      return str.length
        ? str.charCodeAt(0)
        : 0;
    }
  );


expr =
  this.replaceFunction(
    expr,
    "CINT",
    s => {

      const n =
        Number(
          this.evaluate(s)
        );

      return n >= 0
        ? Math.floor(n + 0.5)
        : Math.ceil(n - 0.5);
    }
  );

 expr =
  this.replaceFunction(
    expr,
    "SGN",
    s => {

      const n =
        Number(
          this.evaluate(s)
        );

      return n > 0
        ? 1
        : n < 0
        ? -1
        : 0;
    }
  );

  expr =
  this.replaceFunction(
    expr,
    "FIX",
    s => {

      const n =
        Number(
          this.evaluate(s)
        );

      return n < 0
        ? Math.ceil(n)
        : Math.floor(n);
    }
  );

 expr =
  this.replaceFunction(
    expr,
    "SIN",
    s =>
      Math.sin(
        Number(
          this.evaluate(s)
        )
      )
  );

expr =
  this.replaceFunction(
    expr,
    "COS",
    s =>
      Math.cos(
        Number(
          this.evaluate(s)
        )
      )
  );

expr =
  this.replaceFunction(
    expr,
    "TAN",
    s =>
      Math.tan(
        Number(
          this.evaluate(s)
        )
      )
  );

expr =
  this.replaceFunction(
    expr,
    "ATN",
    s =>
      Math.atan(
        Number(
          this.evaluate(s)
        )
      )
  );

expr =
  this.replaceFunction(
    expr,
    "LOG",
    s =>
      Math.log(
        Number(
          this.evaluate(s)
        )
      )
  );

expr =
  this.replaceFunction(
    expr,
    "EXP",
    s =>
      Math.exp(
        Number(
          this.evaluate(s)
        )
      )
  );





expr =
  this.replaceFunction(
    expr,
    "RND",
    s => {

      const n =
        s.trim().length
          ? Number(
              this.evaluate(s)
            )
          : 1;

      if (n < 0) {

        this.lastRnd =
          Math.random();

        return this.lastRnd;
      }

      if (n === 0) {

        return this.lastRnd ??
          (this.lastRnd =
            Math.random());
      }

      this.lastRnd =
        Math.random();

      return this.lastRnd;
    }
  );





expr =
  expr.replace(
    /(?<![A-Z0-9_])DATE\$(?![A-Z0-9_])/gi,
    JSON.stringify(
      new Date()
        .toLocaleDateString()
    )
  );

expr =
  expr.replace(
    /(?<![A-Z0-9_])TIME\$(?![A-Z0-9_])/gi,
    JSON.stringify(
      new Date()
        .toLocaleTimeString()
    )
  );

expr =
  this.replaceFunction(
    expr,
    "INSTR",
    s => {

      const args =
        this.splitArguments(s);

      const str =
        String(
          this.evaluate(
            args[0]
          )
        );

      const find =
        String(
          this.evaluate(
            args[1]
          )
        );

      const pos =
        str.indexOf(find);

      return pos >= 0
        ? pos + 1
        : 0;
    }
  );

  expr =
  this.replaceFunction(
    expr,
    "HEX$",
    s =>
      JSON.stringify(
        Number(
          this.evaluate(s)
        )
        .toString(16)
        .toUpperCase()
      )
  );

  expr =
  this.replaceFunction(
    expr,
    "OCT$",
    s =>
      JSON.stringify(
        Number(
          this.evaluate(s)
        )
        .toString(8)
      )
  );


  expr =
  this.replaceFunction(
    expr,
    "BIN$",
    s =>
      JSON.stringify(
        Number(
          this.evaluate(s)
        )
        .toString(2)
      )
  );

  




























    // variables
    // variables

expr =
  expr.replace(
    /(?<![A-Z0-9_])[A-Z][A-Z0-9_]*\$?(?![A-Z0-9_])/gi,
    match => {

      const key =
        match.toUpperCase();

        const reserved = this.reservedWords;
        

if(reserved.has(key))
  return match;

      if (
        key in this.vars
      ) {

        const value =
          this.vars[key];

        if (
          typeof value === 'string'
        ) {

          return JSON.stringify(
            value
          );
        }

        return value;
      }

      return match;
    }
  );



 
   

    try {
 alert(expr);
      return Function(
        `"use strict";
         return ("***" + ${expr});
        `
      )();

    } catch {

      alert(err);
      return "***"+expr;
    }
  }
}




