# Registro de Feedbacks - Validação EcoDenúncia

Este documento compila os feedbacks qualitativos recolhidos durante a sessão de validação com a **Associação de Moradores do Bairro Jardim América** em 23/11/2025.

---

## 1. Feedbacks dos Cidadãos (App Mobile)

### 👤 Participante: Ana Clara (Moradora, 45 anos)
> **Comentário:** *"O aplicativo é muito bonito e rápido, mas tive muita dificuldade na hora de criar a senha. Como os pontinhos escondem tudo, eu errei a confirmação duas vezes e tive que digitar tudo de novo. Seria bom se desse para ver o que estou escrevendo."*
>
> **Status:** 🔴 Crítico
> **Ação Tomada:** Implementação do botão com ícone de "olho" (Ver/Ocultar) em todos os campos de senha (Login, Cadastro e Alteração de Senha).

### 👤 Participante: Roberto Lima (Estudante, 22 anos)
> **Comentário:** *"Fiz uma denúncia e o Sr. Carlos mudou o status lá no computador dele para 'Em Análise'. Eu fiquei olhando para a tela do meu celular esperando mudar a cor, mas não mudava. Tive que fechar o app e abrir de novo para ver a mudança. É meio chato isso."*
>
> **Status:** 🟡 Melhoria de Usabilidade
> **Ação Tomada:** Implementação da funcionalidade "Pull-to-Refresh" (Puxar para Atualizar) na tela de histórico, permitindo atualização manual sem reiniciar o app.

### 👤 Participante: Dona Maria (Aposentada, 62 anos)
> **Comentário:** *"Eu gostei que dá para tirar a foto na hora. Mas aqueles botões de 'Voltar' lá em cima eram muito pequenininhos, meu dedo às vezes não clicava direito."*
>
> **Status:** 🟡 Melhoria de Interface
> **Ação Tomada:** Aumentámos a área de toque dos botões de navegação e substituímos o ícone fino por um texto "‹ Voltar" mais robusto e visível.

---

## 2. Feedbacks da Gestão (Dashboard Web)

### 👤 Participante: Sr. Carlos Mendes (Presidente da Associação)
> **Comentário:** *"O mapa é excelente, ver as cores mudando de vermelho para verde dá uma satisfação enorme. Mas tenho uma preocupação: o GPS do celular às vezes falha por uns metros. Se o pino cair no meio do quarteirão e não tiver o endereço escrito, a equipe de limpeza pode não achar o lixo."*
>
> **Status:** 🔴 Crítico (Regra de Negócio)
> **Ação Tomada:** Alteração no formulário de Nova Denúncia. O campo "Endereço Completo" e "Descrição" passaram a ser **obrigatórios**, e adicionámos um campo extra para "Ponto de Referência".

> **Comentário:** *"Senti falta de ver o endereço escrito direto na lista, sem ter que clicar. Às vezes eu só quero bater o olho na lista e saber quais ruas estão com problema."*
>
> **Status:** 🟢 Sugestão Aceita
> **Ação Tomada:** Adicionada a coluna de "Endereço" e uma prévia da "Descrição" diretamente na tabela principal do Dashboard.

---

## 3. Resumo das Ações de Melhoria (Pós-Feedback)

| Funcionalidade | Origem do Feedback | Estado Atual |
| :--- | :--- | :--- |
| **Ver/Ocultar Senha** | Dificuldade de digitação (Ana Clara) | ✅ Implementado |
| **Pull-to-Refresh** | Falta de atualização em tempo real (Roberto) | ✅ Implementado |
| **Endereço Obrigatório** | Imprecisão do GPS (Sr. Carlos) | ✅ Implementado |
| **Botões Maiores** | Acessibilidade (Dona Maria) | ✅ Implementado |
| **Visualização de Endereço na Tabela** | Agilidade na gestão (Sr. Carlos) | ✅ Implementado |