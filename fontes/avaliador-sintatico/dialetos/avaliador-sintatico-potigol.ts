import { Agrupamento, Atribuir, Binario, Constante, Construto, FuncaoConstruto, Literal, Variavel } from "../../construtos";
import { Escreva, Declaracao, Se, Enquanto, Para, Escolha, Fazer, EscrevaMesmaLinha, Const, Var } from "../../declaracoes";
import { RetornoLexador, RetornoAvaliadorSintatico } from "../../interfaces/retornos";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from "../../tipos-de-simbolos/potigol";
import { SimboloInterface } from "../../interfaces";
import { TiposDadosInterface } from "../../interfaces/tipos-dados-interface";

export class AvaliadorSintaticoPotigol extends AvaliadorSintaticoBase {
    tiposPotigolParaDelegua = {
        'Caractere': 'texto',
        'Inteiro': 'numero',
        'Logico': 'lógico',
        'Lógico': 'lógico',
        'Real': 'numero',
        'Texto': 'texto',
        undefined: undefined
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);
            case tiposDeSimbolos.CARACTERE:
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.LOGICO:
            case tiposDeSimbolos.REAL:
            case tiposDeSimbolos.TEXTO:
                const simboloVariavel: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloVariavel.linha), simboloVariavel.literal);
            default:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                return new Variavel(this.hashArquivo, simboloIdentificador);
        }
    }

    chamar(): Construto {
        return this.primario();
    }
    
    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    declaracaoImprima(): EscrevaMesmaLinha {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    blocoEscopo(): Declaracao[] {
        throw new Error("Método não implementado.");
    }
    declaracaoSe(): Se {
        throw new Error("Método não implementado.");
    }
    declaracaoEnquanto(): Enquanto {
        throw new Error("Método não implementado.");
    }
    declaracaoPara(): Para {
        throw new Error("Método não implementado.");
    }
    declaracaoEscolha(): Escolha {
        throw new Error("Método não implementado.");
    }
    declaracaoFazer(): Fazer {
        throw new Error("Método não implementado.");
    }

    declaracaoDeVariaveis(): Var[] {
        const simboloVar = this.avancarEDevolverAnterior();
        const identificadores: SimboloInterface[] = [];
        do {
            identificadores.push(this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de variável.'));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        
        this.consumir(tiposDeSimbolos.REATRIBUIR, "Esperado ':=' após identificador em instrução 'var'.");

        const inicializadores = [];
        do {
            inicializadores.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (identificadores.length !== inicializadores.length) {
            throw this.erro(simboloVar, "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.");
        }

        const retorno = [];
        for (let [indice, identificador] of identificadores.entries()) {
            retorno.push(new Var(identificador, inicializadores[indice]));
        }

        return retorno;
    }
    
    corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error("Método não implementado.");
    }

    declaracao(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.IMPRIMA:
                return this.declaracaoImprima();
            case tiposDeSimbolos.VARIAVEL:
                return this.declaracaoDeVariaveis();
            default:
                return this.expressao();
        }
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (expressao instanceof Variavel) {
            // Atribuição constante.
            let tipoVariavel;
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.DOIS_PONTOS:
                    // A dica de tipo é opcional.
                    this.avancarEDevolverAnterior();
                    if (![
                        tiposDeSimbolos.CARACTERE,
                        tiposDeSimbolos.INTEIRO,
                        tiposDeSimbolos.LOGICO,
                        tiposDeSimbolos.REAL,
                        tiposDeSimbolos.TEXTO
                    ].includes(this.simbolos[this.atual].tipo)) {
                        throw this.erro(
                            this.simbolos[this.atual], 
                            "Esperado tipo após dois-pontos e nome de identificador."
                        );
                    }

                    // Aqui não tem `break` de propósito.
                    // O código deve continuar executando como abaixo.
                case tiposDeSimbolos.IGUAL:
                    this.avancarEDevolverAnterior();
                    const valorAtribuicaoConstante = this.ou();
                    return new Const(
                        (expressao as Constante).simbolo, 
                        valorAtribuicaoConstante, 
                        this.tiposPotigolParaDelegua[tipoVariavel.lexema] as TiposDadosInterface
                    );
                case tiposDeSimbolos.REATRIBUIR:
                    // O símbolo de reatribuição em Potigol é ':='.
                    this.avancarEDevolverAnterior();
                    const valorAtribuicao = this.ou();
                    return new Atribuir(
                        this.hashArquivo,
                        (expressao as Constante).simbolo, 
                        valorAtribuicao
                    );
            }
        }

        return expressao;
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = this.declaracao();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}