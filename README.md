# EcoDenúncia: Plataforma de Gestão de Descarte Irregular de Lixo

> **Projeto vinculado ao ODS 11: Cidades e Comunidades Sustentáveis**

## 1. Descrição do Projeto
O **EcoDenúncia** é uma solução multiplataforma (Mobile e Web) desenvolvida para facilitar a denúncia de pontos de descarte irregular de lixo urbano. A plataforma conecta cidadãos, que podem reportar problemas em tempo real com fotos e geolocalização, aos órgãos gestores, que possuem um painel de controle para visualizar, monitorar e resolver essas ocorrências.

O objetivo é eliminar a burocracia dos canais tradicionais, fornecer dados visuais precisos para a limpeza urbana e promover o engajamento cívico para uma cidade mais limpa.

---

## 2. Funcionalidades Implementadas

### 📱 Aplicativo Cidadão (Mobile - Android)
* [x] **Cadastro e Autenticação:** Login seguro e cadastro com validação de CPF, E-mail e Senha forte.
* [x] **Nova Denúncia:** Envio de denúncias com Foto (Câmera/Galeria) e Localização Automática (GPS).
* [x] **Campos Obrigatórios:** Validação robusta para garantir que denúncias tenham descrição e endereço.
* [x] **Histórico:** Listagem de todas as denúncias feitas pelo usuário com status colorido (Recebida, Em Análise, Resolvida).
* [x] **Pull-to-Refresh:** Atualização da lista de denúncias ao arrastar a tela.
* [x] **Gestão de Perfil:** Edição de dados (Telefone, E-mail), Alteração de Senha e Exclusão de Conta.
* [x] **Interface Profissional:** Design limpo, feedback visual de carregamento e tratamento de erros amigável.

### 💻 Painel do Gestor (Web)
* [x] **Dashboard Visual:** Mapa interativo mostrando todos os pontos de lixo com ícones coloridos por status.
* [x] **Resumo Executivo:** Cartões com contagem total de denúncias por categoria.
* [x] **Gestão de Status:** Tabela detalhada permitindo alterar o status da denúncia (ex: de "Recebida" para "Resolvida").
* [x] **Visualização de Provas:** Modal de detalhes com acesso à foto enviada pelo cidadão.
* [x] **Filtros:** Filtragem rápida por status (Pendentes, Em Andamento, Resolvidas).

---

## 3. Tecnologias Utilizadas

* **Frontend Mobile:** React Native (Expo Framework).
* **Frontend Web:** React.js (Vite).
* **Backend:** Node.js com Express.js.
* **Banco de Dados:** PostgreSQL (Hospedado no Supabase).
* **Armazenamento de Imagens:** Supabase Storage.
* **Mapas:** React Leaflet / OpenStreetMap.
* **Deploy:** Render (Backend) e EAS (Mobile APK).

---

## 4. Arquitetura do Sistema
O sistema segue uma arquitetura **Cliente-Servidor** baseada em API RESTful.
1.  **Mobile App** e **Web Dashboard** atuam como clientes que consomem a mesma API.
2.  **API (Node.js)** processa as regras de negócio, autentica usuários (JWT) e sanitiza dados.
3.  **PostgreSQL** armazena dados relacionais (Usuários, Denúncias).
4.  **Supabase Storage** armazena os arquivos binários (fotos das denúncias).

---

## 5. Instruções de Instalação e Execução

### Pré-requisitos
* Node.js (v18 ou superior)
* NPM ou Yarn
* Dispositivo Android (para testar o APK) ou Expo Go instalado.

### Passo 1: Configuração do Backend
1.  Entre na pasta do backend: `cd backend`
2.  Instale as dependências: `npm install`
3.  Crie um arquivo `.env` na raiz de `backend/` com as credenciais do banco (vermelho no PDF entregue ou solicitar ao administrador).
4.  Execute o servidor: `node src/index.js`
   *(O servidor rodará em http://localhost:3001)*

### Passo 2: Execução do Painel Web (Gestor)
1.  Entre na pasta web: `cd frontend/web`
2.  Instale as dependências: `npm install`
3.  Execute o projeto: `npm run dev`
4.  Acesse `http://localhost:5173` no navegador.
   *(Login de teste Gestor: gestor@ecodenuncia.com / senha123)*

### Passo 3: Execução do App Mobile (Cidadão)
1.  Entre na pasta mobile: `cd frontend/mobile`
2.  Instale as dependências: `npx expo install`
3.  Execute o projeto: `npx expo start -c`
4.  Escaneie o QR Code com o aplicativo **Expo Go** no seu celular.

---

## 6. Acesso ao Sistema (Produção)

O sistema foi implantado em ambiente de produção para validação:

* **API Backend:** `https://ecodenuncia.onrender.com`
* **Dashboard Web:** *(Insira aqui o link do Vercel se tiver, ou mantenha "Rodar Localmente")*
* **App Android (APK):** [Link para Download do APK](https://expo.dev/artifacts/eas/uXtaKt6foSYL2HbgkUSgXM.apk) *(Substitua pelo link final do seu build)*

**Credenciais de Teste (Gestor):**
* **E-mail:** `gestor@ecodenuncia.com`
* **Senha:** `senha123`

---

## 7. Validação com Público-Alvo

A solução foi validada com a **Associação de Moradores do Bairro Jardim América**.

* **Metodologia:** Testes de usabilidade presenciais com o Presidente da Associação (Gestor) e 3 moradores voluntários (Cidadãos).
* **Resultados:**
    * O fluxo de "Nova Denúncia" foi considerado intuitivo e rápido (< 2 min).
    * A funcionalidade de ver a mudança de cor no mapa (Feedback Visual) foi elogiada pela gestão.
* **Ajustes Pós-Validação:**
    * Inclusão de botão "Ver/Ocultar Senha" (pedido dos usuários idosos).
    * Inclusão de "Pull-to-Refresh" para atualização de status.
    * Obrigatoriedade do campo de Endereço para facilitar a localização pela equipe de limpeza.

*(Detalhes completos no relatório: `validation/validation_report.md`)*

---

## 8. Equipe de Desenvolvimento

* **André Silva de Oliveira (2323801):** Líder Técnico e Backend.
* **Henrique Correia De Lima (2323845):** Desenvolvedor Frontend Web.
* **Natan Aguine Holanda (2326299):** Desenvolvedor Mobile.
* **Thayná Stephanie Da Silva (2323837):** UX/UI e Documentação.

---
© 2025 EcoDenúncia - Projeto Acadêmico.