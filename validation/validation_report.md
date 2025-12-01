# Relatório de Validação com Público-Alvo

## 1. Metodologia da Validação
A validação do MVP (Produto Mínimo Viável) do **EcoDenúncia** foi realizada através de testes de usabilidade presenciais e entrevistas semiestruturadas com representantes do público-alvo definido.

* **Data da Validação:** 23 de Novembro de 2025.
* **Local:** Sede da Igreja Adventista, onde o clube pertence do Bairro Siqueira e arredores (para teste de campo).
* **Participantes:**
    * **Lucas Matheus** (Diretor do Clube - Perfil Gestor).
    * **Sarah Rodrigues** / **Iranildo Rodrigues** / **Davylla Faustino / Teresa Maria** (Moradores voluntários - Perfil Cidadão).
* **Dispositivos Utilizados:**
    * Smartphone Android (Samsung Galaxy A54) com o APK do EcoDenúncia instalado.
    * Smartphone Android (Motorola MotoE) com o APK do EcoDenúncia instalado.
    * Smartphone Android (Redime 12) com o APK do EcoDenúncia instalado.
    * Smartphone Android (Pocco 15) com o APK do EcoDenúncia instalado.
    * Smartphone Desktop (Notebook Lenovo) com o acesso à tela do Dashboard de Gestor


## 2. Roteiro de Teste Aplicado
Os participantes foram convidados a realizar tarefas específicas sem ajuda inicial, para testar a intuitividade da interface.

**Tarefas do Cidadão:**
1.  Baixar e instalar o aplicativo (simulado via transferência de APK).
2.  Criar uma nova conta inserindo dados Pessoais (incluindo CPF e Telefone).
3.  Deslocar-se até um ponto de lixo real na rua.
4.  Registrar uma denúncia (Tirar foto, usar GPS, escrever descrição).
5.  Verificar se a denúncia apareceu no histórico com status "Recebida".
6.  Tentar editar o perfil e alterar a senha.

**Tarefas do Gestor:**
1.  Acessar o painel web.
2.  Identificar a nova denúncia no mapa e na lista.
3.  Visualizar a foto enviada pelo cidadão.
4.  Alterar o status da denúncia para "Em Análise" e posteriormente "Resolvida".

## 3. Feedback Coletado e Resultados

### ✅ Pontos Positivos (O que funcionou bem)
* **Agilidade no Cadastro:** Os moradores elogiaram a rapidez para criar a conta apesar de usarmos um servidor gratuito que aumenta o tempo de espera. O Lucas Matheus comentou: *"É mais rápido do que ligar para a regional.kkkkk"*.
* **Uso da Câmara:** A integração com a câmara foi considerada fluida. A pré-visualização da imagem antes de enviar transmitiu segurança de que a foto certa foi tirada.
* **Feedback Visual (Mapa):** O gestor (Lucas Matheus) ficou impressionado com a mudança de cor dos pinos (Vermelho -> Amarelo -> Verde). *"Isso ajuda muito a saber onde a equipe de limpeza já passou sem ter de clicar em cada um"*, afirmou.
* **Localização Automática:** O preenchimento automático do GPS foi considerado essencial, pois muitos moradores não sabem o nome exato de algumas ruas transversais.

### ⚠️ Dificuldades Encontradas e Sugestões (O que gerou melhorias)
Durante os testes, identificamos alguns pontos de atrito que geraram feedbacks imediatos:

1.  **Visibilidade da Senha:** No primeiro teste, a Sra. Ana teve dificuldade em digitar a senha correta e perguntou *"Como eu sei se digitei certo?"*.
    * *Ação Tomada:* Foi sugerida a inclusão de um botão para "Ver/Ocultar" a senha.
2.  **Atualização do Status:** O morador ficou com o aplicativo aberto à espera que o status mudasse de "Recebida" para "Em Análise", mas a tela não atualizava sozinha.
    * *Ação Tomada:* Sugestão de implementar um mecanismo de atualização manual (arrastar para baixo).
3.  **Preenchimento de Endereço:** Embora o GPS funcione, o gestor pediu que fosse obrigatório o cidadão escrever o endereço, pois o GPS às vezes tem margem de erro.

## 4. Ajustes Implementados Pós-Validação
Com base no feedback acima, a equipe de desenvolvimento realizou uma sprint final de correções antes da entrega:

* **[Implementado] Botão "Ver/Ocultar" Senha:** Adicionado ícone de olho nos campos de senha (Login, Cadastro e Perfil) para melhorar a acessibilidade e reduzir erros de digitação.
* **[Implementado] Pull-to-Refresh:** Adicionada funcionalidade de "puxar para atualizar" na lista de denúncias, permitindo ao cidadão verificar novos status instantaneamente.
* **[Implementado] Campos Obrigatórios:** O formulário foi ajustado para tornar "Descrição" e "Endereço Completo" obrigatórios, garantindo dados mais precisos para a gestão.
* **[Implementado] Estilização:** Melhoria no contraste dos campos de texto e padronização dos botões de "Voltar" para facilitar a navegação.
* **[Implementado] Funcionalidade:** Adição do Botão "Escolher da Galeria".

## 5. Conclusão
A validação confirmou a aderência do **EcoDenúncia** às necessidades reais do bairro Siqueira. O sistema provou ser robusto o suficiente para substituir o fluxo informal de denúncias via WhatsApp, trazendo organização e georreferenciamento para a gestão local. O produto foi aprovado pelos participantes para uso contínuo.