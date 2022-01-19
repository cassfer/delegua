import { Expr } from "./expr";


export class Super extends Expr {
    palavraChave: any;
    metodo: any;

    constructor(palavraChave: any, metodo: any) {
        super();
        this.palavraChave = palavraChave;
        this.metodo = metodo;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoSuper(this);
    }
}
