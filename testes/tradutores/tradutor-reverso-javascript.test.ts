import { TradutorReversoJavaScript } from '../../fontes/tradutores/tradutor-reverso-javascript';
import { Delegua } from '../../fontes/delegua';

describe('Tradutor Reverso JavaScript -> Delégua', () => {
    const tradutor: TradutorReversoJavaScript = new TradutorReversoJavaScript();

    describe('Código', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        it('comparacao de valores -> igualdade', () => {
            const codigo = `console.log(1 === 2)\nconsole.log(1 == '1')\nconsole.log('1' === '1')`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\(1 == 2\)/i);
            expect(resultado).toMatch(/escreva\(1 == '1'\)/i);
            expect(resultado).toMatch(/escreva\('1' == '1'\)/i);
        });

        it('console.log -> escreva', () => {
            const codigo = `console.log('Oi')`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
        });

        it('const/let/var -> var', () => {
            const codigo = `const a = 1\nlet b = 2\nvar c = 3`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var a = 1/i);
            expect(resultado).toMatch(/var b = 2/i);
            expect(resultado).toMatch(/var c = 3/i);
        });

        it('function -> funcao sem parametro', () => {
            const codigo = `function teste() {console.log(\'Oi\')\nconsole.log(123)}`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(\)/i);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
            expect(resultado).toMatch(/escreva\(123\)/i);
        });

        it('function -> funcao com parametro', () => {
            const codigo = `function teste(a, b, c) {console.log(\'Oi\')}`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao teste\(a, b, c\)/i);
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
        });

        // it('class -> classe', () => {
        //     const codigo = `
        //         class Rectangle {
        //             constructor(height, width, abc) {
        //                 this.height = height;
        //                 this.width = width;
        //             }

        //             teste(){
        //                 console.log('oi')
        //             }
        //         }
        //     `

        //     const resultado = tradutor.traduzir(codigo);
        //     // expect(resultado).toBeTruthy();
        //     // expect(resultado).toMatch(/console\.log\(i\)/i);
        // });
    });
});