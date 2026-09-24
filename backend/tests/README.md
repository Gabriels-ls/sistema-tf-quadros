# Testes do back-end

## Testes de caixa-branca (Jest + Supertest)

Verificam a lógica interna da API: validações das requisições, autenticação e regras de
negócio. O Supabase e a API da OpenAI são substituídos por dublês (`tests/ajudantes/`),
portanto **nenhum teste acessa o banco de dados real nem consome a API da OpenAI**.

```bash
npm install     # instala jest e supertest (primeira vez)
npm test        # executa toda a suíte
npm test -- --watch
```

Arquivos:

| Arquivo | O que cobre |
|---|---|
| `autenticacao.test.js` | login com bcryptjs, bloqueio das rotas administrativas sem token válido (RN01) |
| `orcamentos.test.js` | criação da solicitação, cadastro único do cliente por token, resumo e histórico do chatbot (RN05), status permitidos (RN04) |
| `chatbot.test.js` | validações e limite de 500 caracteres (RNF19), chamada ao modelo gpt-4o-mini, tratamento de erro da API |
| `produtos.test.js` | catálogo, ordenação das variações, obrigatoriedade de nome e descrição (RN03), rotas protegidas |

## Testes de caixa-preta (Postman)

`tests/postman/TF-Quadros.postman_collection.json` pode ser importada no Postman. Antes de
executar, preencha as variáveis da coleção `baseUrl`, `emailAdmin` e `senhaAdmin`; o token JWT
é preenchido automaticamente pela requisição de login. As requisições cobrem o catálogo, o
chatbot, a solicitação de orçamento e o acompanhamento pelo administrador, incluindo os casos
de erro esperados.

Esses testes usam o ambiente real (banco e API da OpenAI), então prefira executá-los com o
servidor local apontando para um projeto de testes do Supabase.
