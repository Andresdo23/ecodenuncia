# Documentação da API - EcoDenúncia (Versão Final)

Esta documentação descreve os endpoints implementados na API RESTful do sistema EcoDenúncia. A API foi desenvolvida em Node.js com Express e utiliza PostgreSQL (Supabase) para persistência de dados.

## 🌐 Base URL
* **Produção:** `https://ecodenuncia-api.onrender.com/api`
* **Desenvolvimento:** `http://localhost:3001/api`

## 🔐 Autenticação
A API utiliza **JWT (JSON Web Token)**.
* A maioria dos endpoints requer o cabeçalho `Authorization`.
* Formato: `Bearer <seu_token_aqui>`

---

## 1. Autenticação e Usuários

### Registrar Novo Usuário
Cria uma nova conta de cidadão ou gestor.
* **Endpoint:** `POST /auth/register`
* **Acesso:** Público
* **Headers Especiais:**
    * `x-admin-secret`: Obrigatório apenas para criar usuários do tipo `'gestor'`.
* **Body (JSON):**
    ```json
    {
      "nome": "João da Silva",
      "email": "joao@exemplo.com",
      "senha": "senhaForte123",
      "tipo_usuario": "cidadao", // ou "gestor"
      "cpf": "123.456.789-00",
      "telefone": "(85) 99999-8888",
      "data_nascimento": "17/07/1990" // Formato DD/MM/AAAA
    }
    ```
* **Resposta (201 Created):**
    ```json
    {
      "success": true,
      "message": "Usuário registrado com sucesso!",
      "data": { "id": "uuid", "email": "...", "nome": "..." }
    }
    ```

### Login
Autentica um usuário e retorna o token de acesso.
* **Endpoint:** `POST /auth/login`
* **Acesso:** Público
* **Body (JSON):**
    ```json
    {
      "email": "joao@exemplo.com",
      "senha": "senhaForte123"
    }
    ```
* **Resposta (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login bem-sucedido!",
      "data": {
        "token": "eyJhbGciOiJIUz...",
        "usuario": { "id": "...", "nome": "...", "tipo_usuario": "..." }
      }
    }
    ```

### Editar Perfil
Atualiza os dados de contato do usuário logado.
* **Endpoint:** `PUT /users/me`
* **Acesso:** Autenticado (Qualquer usuário)
* **Body (JSON):**
    ```json
    {
      "email": "novoemail@exemplo.com",
      "telefone": "(85) 98888-7777"
    }
    ```

### Alterar Senha
Altera a senha do usuário logado.
* **Endpoint:** `PUT /users/me/password`
* **Acesso:** Autenticado
* **Body (JSON):**
    ```json
    {
      "senhaAtual": "senhaAntiga123",
      "novaSenha": "novaSenhaForte456"
    }
    ```

### Excluir Conta
Realiza a exclusão lógica (desativação) da conta do usuário.
* **Endpoint:** `DELETE /users/me`
* **Acesso:** Autenticado
* **Body (JSON):**
    ```json
    {
      "senha": "senhaParaConfirmar"
    }
    ```

---

## 2. Denúncias

### Criar Nova Denúncia
Registra uma ocorrência de descarte irregular.
* **Endpoint:** `POST /denuncias`
* **Acesso:** Autenticado (Qualquer usuário)
* **Body (JSON):**
    ```json
    {
      "descricao": "Entulho na calçada.",
      "url_foto": "[https://supabasestorage.com/](https://supabasestorage.com/)...",
      "latitude": -3.741234,
      "longitude": -38.567890,
      "endereco_completo": "Rua das Flores, 123, Centro",
      "ponto_referencia": "Próximo à padaria"
    }
    ```

### Listar Denúncias
Retorna a lista de denúncias.
* **Endpoint:** `GET /denuncias`
* **Acesso:** Autenticado
* **Comportamento:**
    * **Cidadão:** Retorna apenas as denúncias criadas por ele.
    * **Gestor:** Retorna todas as denúncias do sistema (ordenadas por data).

### Editar Denúncia
Atualiza informações de uma denúncia (apenas se o usuário for o dono e não estiver excluída).
* **Endpoint:** `PUT /denuncias/:id`
* **Acesso:** Autenticado (Cidadão dono da denúncia)
* **Body (JSON):**
    ```json
    {
      "descricao": "Nova descrição corrigida",
      "endereco_completo": "Endereço atualizado",
      "ponto_referencia": "Nova referência"
    }
    ```

### Excluir Denúncia
Realiza a exclusão lógica de uma denúncia.
* **Endpoint:** `PUT /denuncias/:id/excluir`
* **Acesso:** Autenticado (Cidadão dono da denúncia)
* **Body (JSON):**
    ```json
    {
      "motivo": "O lixo já foi recolhido."
    }
    ```

### Atualizar Status (Gestor)
Altera o status de processamento de uma denúncia.
* **Endpoint:** `PUT /denuncias/:id/status`
* **Acesso:** Autenticado (**Apenas Gestores**)
* **Body (JSON):**
    ```json
    {
      "id_status": 2
    }
    ```
    *IDs de Status:* 1=Recebida, 2=Em Análise, 3=Resolvida, 4=Rejeitada.

---

## 3. Uploads

### Upload de Imagem
Envia uma imagem para o Supabase Storage e retorna a URL pública.
* **Endpoint:** `POST /upload/image`
* **Acesso:** Autenticado
* **Content-Type:** `multipart/form-data`
* **Body:**
    * `image`: Arquivo de imagem (jpg, png).
* **Resposta:**
    ```json
    {
      "success": true,
      "data": {
        "url": "https://..."
      }
    }
    ```

---

## 4. Utilitários

### Health Check
Verifica se a API está online.
* **Endpoint:** `GET /health`
* **Resposta:** `200 OK`