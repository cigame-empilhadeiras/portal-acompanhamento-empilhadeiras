# Controle de Empilhadeiras

Painel de gestão da frota de empilhadeiras elétricas: gastos, horímetro, manutenção preventiva, checklists, modelos 3D e relatório técnico.
É um site estático (HTML, CSS e JavaScript, sem etapa de build). Os usuários e os dados ficam no **Firebase**, que oferece login por e-mail e senha e banco de dados em tempo real, e tem plano gratuito.

## O que tem aqui

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | O painel completo (portal, painéis, app do checklist para tablets, usuários). |
| `firebase-config.js` | Os dados do seu projeto Firebase. **É o único arquivo que você precisa editar.** |
| `fb-adapter.js` | Tela de login e ligação com o Firebase. Não precisa mexer. |
| `firestore.rules` | Regras de segurança do banco de dados (quem lê e quem escreve). |
| `modelos3d/` | Modelos 3D interativos das três empilhadeiras. |
| `relatorio/` | Relatório técnico em PDF. |
| `.github/workflows/pages.yml` | Publica o site automaticamente no GitHub Pages. |

## Passo a passo

### 1. Criar o projeto no Firebase
1. Acesse https://console.firebase.google.com e clique em **Adicionar projeto** (pode desativar o Google Analytics).
2. No menu **Build > Authentication**, clique em **Vamos começar** e ative o provedor **E-mail/senha**.
3. Em **Build > Firestore Database**, clique em **Criar banco de dados**, escolha **modo de produção** e a região **southamerica-east1 (São Paulo)**.
4. Em **Firestore > Regras**, apague o conteúdo e cole todo o arquivo `firestore.rules` deste repositório. Clique em **Publicar**.

### 2. Ligar o painel ao projeto
1. Em **Configurações do projeto (engrenagem) > Seus apps**, clique no ícone **</>** (Web) e registre um app (sem Hosting).
2. Copie o objeto `firebaseConfig` mostrado e cole os valores em `firebase-config.js`.

### 3. Criar o primeiro administrador
O primeiro administrador precisa ser criado à mão, uma única vez:
1. Em **Authentication > Usuários > Adicionar usuário**, informe o seu e-mail e uma senha.
2. Em **Firestore > Iniciar coleção**, crie a coleção `usuarios` e um documento cujo **ID seja o seu e-mail em minúsculas** (por exemplo `nome@empresa.com.br`) com os campos:
   - `email` (string): o mesmo e-mail
   - `nome` (string): seu nome
   - `papel` (string): `admin`
   - `ativo` (boolean): `true`

### 4. Publicar no GitHub
1. Crie um repositório no GitHub e envie estes arquivos para a branch `main`.
2. Em **Settings > Pages**, em **Source**, escolha **GitHub Actions**. O fluxo `pages.yml` publica o site a cada envio.
3. Quando o site subir, copie o endereço (`https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`).
4. No Firebase, em **Authentication > Configurações > Domínios autorizados**, adicione `SEU-USUARIO.github.io`.

Pronto: abra o endereço, entre com o seu e-mail e senha e use o painel **Usuários** para liberar as demais pessoas.

## Como cada pessoa entra

- **Contas:** crie a conta de cada pessoa em **Authentication > Adicionar usuário** (recomendado para uso interno), ou ative `ALLOW_SIGNUP = true` em `firebase-config.js` para que cada um crie a própria conta na tela de login.
- **Liberação:** uma conta nova só enxerga a tela de "acesso pendente". No painel **Usuários**, o administrador cadastra o e-mail com um papel:
  - **Administrador**: tudo, inclusive usuários e configurações.
  - **Supervisor**: todos os painéis, resolve pendências, lança gastos e preventivas.
  - **Operador**: só o app do checklist.
  - **Tablet**: conta de um tablet compartilhado (veja abaixo).
- **Esqueci a senha:** o botão na tela de login envia um link de redefinição por e-mail.
- **Sair:** botão **Sair** no topo do portal e dos painéis.

### Tablets compartilhados
1. Crie uma conta de e-mail para o tablet (por exemplo `tablet.expedicao@empresa.com.br`) e cadastre-a em **Usuários** com o papel **Tablet**.
2. Cadastre cada operador em **Usuários** com o papel **Operador** e use **Definir senha** (um código ou senha curta que só serve para identificar quem fez o checklist). O e-mail do operador pode ser um código, como a matrícula.
3. No tablet, entre com a conta do tablet. No app, cada operador escolhe o nome, digita a senha, faz o checklist e o aparelho volta para a escolha de operador.

## Segurança: leia antes de publicar

- O GitHub Pages é **público na internet**. Quem decide quem lê os dados são o login do Firebase e o `firestore.rules`. Sem as regras publicadas, o banco fica aberto ou fechado demais: **não pule o passo 1.4**.
- Os dados de `firebase-config.js` não são segredo (todo site web que usa Firebase os expõe). Não coloque ali chaves privadas.
- As senhas de login ficam com o Firebase, criptografadas. As senhas curtas dos operadores do tablet ficam como código irreversível no cadastro de usuários, e podem ser lidas por quem está liberado no painel; servem para identificar o operador, não para proteger dados.
- O código e os números de série das máquinas ficam visíveis no repositório se ele for público. Se isso for um problema, use um repositório privado (o GitHub Pages em repositório privado exige plano pago) ou publique em outro serviço de hospedagem estática, como o próprio Firebase Hosting.

## Testar localmente

Abra um terminal na pasta e rode `python3 -m http.server 8000`, depois acesse http://localhost:8000. (O Firebase não funciona abrindo o arquivo `index.html` direto, sem servidor.)

## Estrutura dos dados (Firestore)

`usuarios/{email}` · `acessos/{uid}` · `checklists/{id}` · `resolucoes/{idDoChecklist}` · `horimetro/{id}` · `preventivas/{id}` · `lancamentos/{id}` · `config/plano`
