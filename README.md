# README — Frontend (Vite + React + TypeScript)

## Visão geral

Este front foi criado com Vite + React + TypeScript e usa Material UI para componentes. Implementa: autenticação básica (Basic Auth), carrinho simples, telas de listagem de produtos, detalhes do produto, carrinho e checkout; telas administrativas (produtos, pedidos, usuários). O cliente consome a API Spring Boot que você desenvolveu.

---

## Requisitos

* Node.js (recomendado >= 18, ideal 20+)
* npm ou yarn
* Backend rodando em `http://localhost:8080`

---

## Instalação

1. Clone o repositório do frontend e entre na pasta:

```bash
cd ecommerce-frontend
```

2. Instale dependências:

```bash
npm install
# ou
# yarn
```

> Se tiver problemas no Windows com `node_modules` (permissões / arquivos em uso), feche editores/terminals que possam estar usando arquivos, abra o PowerShell como Administrador e rode:
>
> ```powershell
> npx rimraf node_modules package-lock.json .vite
> npm cache clean --force
> npm install
> ```
>
> Em casos persistentes, reinicie o Windows e tente novamente.

---

## Scripts úteis

* `npm run dev` — roda em desenvolvimento (Vite). Normalmente `http://localhost:5173`.
* `npm run build` — cria build de produção.
* `npm run preview` — pré-visualiza o build.

---

## Configurações (apiClient)

O front usa um `apiClient` com Axios. Há funções utilitárias para setar Basic Auth e restaurá-la do `localStorage`. Assegure-se de que, ao logar, você esteja chamando `setBasicAuth(email, password)` e que o header `Authorization: Basic ...` seja enviado em requisições que exigem autenticação.

### Restauração automática

No `AuthProvider` é usado `restoreAuthFromStorage()` para reaplicar o header após reload da página — isso evita que o app volte à tela de login sempre que recarregar.

---

## Rotas / Telas (frontend)

* `/` — Home (lista produtos)
* `/product/:id` — Detalhes do produto
* `/cart` — Carrinho
* `/checkout` — Checkout
* `/signin` — Login
* `/signup` — Cadastro
* `/admin/*` — Área admin (produtos, pedidos, usuários)

Componentes de destaque:

* `AuthContext` — gerencia login/logout e user atual
* `CartContext` — gerencia itens do carrinho
* `apiClient.ts` — axios + helpers de auth
* Telas: `Home`, `ProductDetail`, `Cart`, `Checkout`, `SignIn`, `SignUp`, `AdminProducts`, `AdminOrders`, `AdminUsers`

---

## Como usar (fluxo de autenticação)

1. `Sign In` chama `AuthContext.login(email, password)` que faz `setBasicAuth` e busca `/user/findByEmail` para validar a credencial.
2. Se o backend responde com 200 e retorna o usuário, `AuthContext` armazena o `user` no estado.
3. `apiClient` passa a enviar header `Authorization` em todas as requisições.
4. Ao `logout`, chamamos `setBasicAuth('', null)` e removemos `authBasic` do `localStorage`.

---

## Integração Admin / User

* O frontend exibe rotas e botões diferentes dependendo de `user.role` — `isAdmin` detectado quando `user.role === 'ROLE_ADMIN'`.

---

## Erros comuns (Frontend)

* **ERR_NETWORK / CORS**: verifique se o backend tem CORS configurado para `http://localhost:5173` e se a preflight (OPTIONS) retorna 200.
* **Authorization não enviado**: verifique `apiClient.defaults.headers.common['Authorization']` no DevTools → Network → Request Headers.
* **Múltiplas cópias do React / emotion**: cheque `npm ls react @emotion/react` e alinhe versões (remova duplicatas, reinstale).
* **ESLint / VSCode travando ao salvar**: extensões podem interferir. Desative temporariamente as extensões (ESLint, Copilot) para testar.

---

## Testes rápidos via curl (do frontend):

```bash
# testar login via basic auth e obter usuário
curl -u "caio@email.com:123" "http://localhost:8080/user/findByEmail?email=caio%40email.com"

# listar pedidos (admin)
curl -u "admin@local:senhaDoAdmin" http://localhost:8080/orders/findAll
```

---
