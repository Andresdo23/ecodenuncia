# Registro de Feedbacks - Validação EcoDenúncia

Este documento compila os feedbacks qualitativos recolhidos durante a sessão de validação com a **Grupos de Jovens e Adolescentes denominados Desbravadores do Bairro Siqueira e moradores da cidade de fortaleza** em 23/11/2025.

---

## 1. Feedbacks dos Cidadãos (App Mobile)

### 👤 Participante: Sarah Vitória (Moradora do Bairro Siqueira, 26 anos)
> **Comentário:** *"O aplicativo é muito bonito e rápido, mas tive muita dificuldade na hora de criar a senha. Como os pontinhos escondem tudo, eu errei a confirmação duas vezes e tive que digitar tudo de novo. Seria bom se desse para ver o que estou escrevendo."*
>
> **Status:** 🔴 Crítico
> **Ação Tomada:** Implementação do botão com ícone de "olho" (Ver/Ocultar) em todos os campos de senha (Login, Cadastro e Alteração de Senha).

### 👤 Participante: Iranildo Rodrigues (Estudante, 22 anos)
> **Comentário:** *"Fiz uma denúncia e o rapaz que estava me entrevistando mudou o status lá no computador dele para 'Em Análise'. Eu fiquei olhando para a tela do meu celular esperando mudar a cor, mas não mudava. Tive que fechar o app e abrir de novo para ver a mudança. É meio chato isso."*
>
> **Status:** 🟡 Melhoria de Usabilidade
> **Ação Tomada:** Implementação da funcionalidade "Pull-to-Refresh" (Puxar para Atualizar) na tela de histórico, permitindo atualização manual sem reiniciar o app.

### 👤 Participante: Teresa Maria (Aposentada, 62 anos)
> **Comentário:** *"Eu gostei que dá para tirar a foto na hora. Mas aqueles botões de 'Voltar' lá em cima eram muito pequenininhos, meu dedo às vezes não clicava direito."*
>
> **Status:** 🔴 Crítico
> **Ação Tomada:** Aumentamos a área de toque dos botões de navegação e substituímos o ícone fino por um texto "‹ Voltar" mais robusto e visível.

### 👤 Participante: Davylla Faustino (Estudante, 14 anos)
> **Comentário:** *"Eu gostei do aplicativo. Seria legal se eu pudessse escolher a foto da minha galeria sem precisar tirar a foto na hora, pois nem sempre tenho internet na rua"*
>
> **Status:** 🟡 Melhoria de Funcionalidade
> **Ação Tomada:** Incluímos a nova funcionalidade com um botão "Escolher da Galeria"
---

## 2. Feedbacks da Gestão (Dashboard Web)

### 👤 Participante: Lucas Matheus (Diretor do Clube de Desbravadores, 27 anos)
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
| **Ver/Ocultar Senha** | Dificuldade de digitação (Sarah Rodrigues) | ✅ Implementado |
| **Pull-to-Refresh** | Falta de atualização em tempo real (Iranildo Rodrigues) | ✅ Implementado |
| **Endereço Obrigatório** | Imprecisão do GPS (Lucas Matheus) | ✅ Implementado |
| **Botões Maiores** | Acessibilidade (Teresa Maria ) | ✅ Implementado |
**Botões Escolher da Galeria** | Sem acesso ao internet (Davylla Faustino) | ✅ Implementado |
| **Visualização de Endereço na Tabela** | Agilidade na gestão (Lucas Matheus) | ✅ Implementado |