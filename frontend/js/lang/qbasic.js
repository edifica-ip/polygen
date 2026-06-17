export class QBasicInterpreter {

  constructor() {

    this.output = '';

  }

  run(code) {

    const lines =
      code.split(/\r?\n/);

    for(let line of lines){

      line = line.trim();

      if(!line)
        continue;

      if(line.startsWith('PRINT')){

        let txt =
          line.substring(5).trim();

        txt =
          txt.replace(/^"/,'')
             .replace(/"$/,'');

        this.output += txt + '\n';

      }

    }

    return this.output;

  }

}