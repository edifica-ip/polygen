export class QBasicInterpreter {

  constructor() {
    this.vars = {};
    this.output = [];
  }

  run(code) {

    this.vars = {};
    this.output = [];

    const lines =
      code
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(x => x.length);

    this.executeBlock(lines);

    return this.output.join('\n');
  }

  executeBlock(lines) {

    let i = 0;

    while (i < lines.length) {

      let line = lines[i];

      // comment
      if (
        line.startsWith("'") ||
        /^REM\b/i.test(line)
      ) {
        i++;
        continue;
      }

      // PRINT
      if (/^PRINT\b/i.test(line)) {

        let expr =
          line.replace(/^PRINT\s+/i, '');

        this.output.push(
          this.evaluate(expr)
        );

        i++;
        continue;
      }

      // LET
      if (/^LET\b/i.test(line)) {

        this.handleAssignment(
          line.replace(/^LET\s+/i, '')
        );

        i++;
        continue;
      }

      // direct assignment
      if (
        /^[A-Z][A-Z0-9]*\s*=/i.test(line)
      ) {

        this.handleAssignment(line);

        i++;
        continue;
      }

      // IF THEN ELSE
      if (/^IF\b/i.test(line)) {

        i =
          this.handleIf(
            lines,
            i
          );

        continue;
      }

      // FOR NEXT
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
      line.substring(pos + 1);

    this.vars[name] =
      this.evaluate(expr);
  }

  handleIf(lines, start) {

    const line = lines[start];

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

    for (
      let i = start + 1;
      i < lines.length;
      i++
    ) {

      if (
        /^ELSE$/i.test(
          lines[i]
        )
      ) {
        elsePos = i;
      }

      if (
        /^END\s*IF$/i.test(
          lines[i]
        )
      ) {
        endPos = i;
        break;
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

      this.executeBlock(block);

    } else {

      if (elsePos >= 0) {

        const block =
          lines.slice(
            elsePos + 1,
            endPos
          );

        this.executeBlock(block);
      }
    }

    return endPos + 1;
  }

  handleFor(lines, start) {

    const line = lines[start];

    const m =
      line.match(
        /^FOR\s+([A-Z][A-Z0-9]*)\s*=\s*(.+)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i
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

    let nextPos = -1;

    for (
      let i = start + 1;
      i < lines.length;
      i++
    ) {

      if (
        /^NEXT\b/i.test(
          lines[i]
        )
      ) {
        nextPos = i;
        break;
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

        this.executeBlock(
          block
        );
      }

    } else {

      for (
        let v = begin;
        v >= finish;
        v += step
      ) {

        this.vars[varName] = v;

        this.executeBlock(
          block
        );
      }
    }

    return nextPos + 1;
  }

  evaluateCondition(expr) {

    expr =
      expr.replace(/<>/g, '!=');

    expr =
      expr.replace(
        /([^<>=])=([^=])/g,
        '$1==$2'
      );

    return !!this.evaluate(expr);
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

    // LEN()
    expr =
      expr.replace(
        /LEN\s*\(\s*"([^"]*)"\s*\)/gi,
        (_, s) => s.length
      );

    // ABS()
    expr =
      expr.replace(
        /ABS\s*\(([^)]+)\)/gi,
        (_, s) =>
          Math.abs(
            Number(
              this.evaluate(s)
            )
          )
      );

    // SQR()
    expr =
      expr.replace(
        /SQR\s*\(([^)]+)\)/gi,
        (_, s) =>
          Math.sqrt(
            Number(
              this.evaluate(s)
            )
          )
      );

    // INT()
    expr =
      expr.replace(
        /INT\s*\(([^)]+)\)/gi,
        (_, s) =>
          Math.floor(
            Number(
              this.evaluate(s)
            )
          )
      );

    // variables
    expr =
      expr.replace(
        /\b[A-Z][A-Z0-9]*\b/gi,
        match => {

          const key =
            match.toUpperCase();

          if (
            key in this.vars
          ) {
            return this.vars[key];
          }

          return 0;
        }
      );

    try {

      return Function(
        `"use strict";
         return (${expr});
        `
      )();

    } catch {

      return expr;
    }
  }
}