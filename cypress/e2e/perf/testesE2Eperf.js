import http from 'k6/http';
import { group, check } from 'k6';

let valorToken;
const url = "http://165.227.93.41/lojinha/v2/";
let produtoId;
let componenteId;

export const options = {
    thresholds: {
        http_req_failed: ['rate<0.1'], // http errors devem ser abaixo de 1%
        http_req_duration: ['p(95)<200'] // 95% das requisições devem ser abaixo de 200ms
    },
    scenarios: {
        cenario1: {
            executor: 'constant-arrival-rate',
            duration: '5s',
            preAllocatedVUs: 2, 
            rate: 2,
            timeUnit: '1s'
        }
    }
}

export default function () {
    group('Login com usuário válido', () => {
        const respostaLogin = http.post(`${url}login`, JSON.stringify({
            usuarioLogin: "marcos2025",
            usuarioSenha: "marcos2025"
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        check(respostaLogin, {
            'Status code é igual a 200': r => r.status === 200
        });

        if (respostaLogin.status === 200) {
            valorToken = respostaLogin.json("data.token");
        } else {
            return; 
        }
    })

    group('Limpar os dados do usuário', () => {
        let limparDados = http.del(`${url}dados`, null, {
            headers: {
                token: valorToken,
                'Content-Type': 'application/json'
            }
        });

        check(limparDados, {
            'Status code é igual a 204': r => r.status === 204
        })

        if (limparDados.status !== 204) {
            return; 
        }
    });

    group('Adicionar um novo produto', () => {
        let respostaCriarProduto = http.post(`${url}produtos`, JSON.stringify({
            produtoNome: "Teste de performance",
            produtoValor: 2000,
            produtoCores: ['Preto'],
            produtoUrlMock: "",
            componentes: [{
                componenteNome: "string",
                componenteQuantidade: 1
            }]
        }), {
            headers: {
                'Content-Type': 'application/json',
                token: valorToken
            }
        });

        check(respostaCriarProduto, {
            'Status code é igual a 201': r => r.status === 201
        })

        if (respostaCriarProduto.status === 201) {
            produtoId = respostaCriarProduto.json('data.produtoId');
        } else {
            return; 
        }
    })

    group('Buscar um dos produtos do usuario', () => {
        if (!produtoId) {
            return; 
        }

        let buscarUmProduto = http.get(`${url}produtos/${produtoId}`, {
            headers: {
                'Content-Type': 'application/json',
                token: valorToken
            }
        })

        check(buscarUmProduto, {
            'Status code é igual a 200': r => r.status === 200
        })
    })

    group('Adicionar um novo componente', () => {
        if (!produtoId) {
            return; 
        }

        let adicionarComponente = http.post(`${url}produtos/${produtoId}/componentes`, JSON.stringify({
            componenteNome: "string3",
            componenteQuantidade: 1
        }), {
            headers: {
                'Content-Type': 'application/json',
                token: valorToken
            }
        });

        check(adicionarComponente, {
            'Status code é igual a 201': r => r.status === 201
        });

        if (adicionarComponente.status === 201) {
            componenteId = adicionarComponente.json('data.componenteId');
        } else {
            return; 
        }
    });

    group('Buscar um componente de produto', () => {
        if (!produtoId || !componenteId) {
            return; 
        }

        let buscarUmComponente = http.get(`${url}produtos/${produtoId}/componentes/${componenteId}`, {
            headers: {
                'Content-Type': 'application/json',
                token: valorToken
            }
        });

        check(buscarUmComponente, {
            'Status code é igual a 200': r => r.status === 200
        });
    });

    group('Remover um componente', () => {
        if (!produtoId || !componenteId) {
            return; 
        }

        let removerComponente = http.del(`${url}produtos/${produtoId}/componentes/${componenteId}`, null, {
            headers: {
                token: valorToken,
                'Content-Type': 'application/json'
            }
        });

        check(removerComponente, {
            'Status code é igual a 204': r => r.status === 204
        });
    });

    group('Remover um produto', () => {
        if (!produtoId) {
            return; 
        }

        let removerProduto = http.del(`${url}produtos/${produtoId}`, null, {
            headers: {
                token: valorToken,
                'Content-Type': 'application/json'
            }
        });

        check(removerProduto, {
            'Status code é igual a 204': r => r.status === 204
        });
    });
}

export function teardown() {
   
    const respostaLogin = http.post(
        `${url}login`,
        JSON.stringify({
            usuarioLogin: "marcos2025",
            usuarioSenha: "marcos2025"
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    check(respostaLogin, {
        'Status code é igual a 200 no login do teardown': r => r.status === 200
    });

    if (respostaLogin.status === 200) {
        const token = respostaLogin.json("data.token");

        const respostaDeleteTodosDados = http.del(
            `${url}dados`,
            null,
            {
                headers: {
                    'Content-Type': 'application/json',
                    token: token
                }
            }
        );

        check(respostaDeleteTodosDados, {
            'Status code é igual a 204 ao limpar dados do usuário': r => r.status === 204
        });
    }
}