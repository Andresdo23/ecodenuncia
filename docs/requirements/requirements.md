# Requisitos do Sistema - EcoDenúncia (Versão Final Implementada)

Este documento lista os requisitos funcionais e não-funcionais que foram efetivamente implementados na entrega final do projeto, incluindo ajustes e melhorias realizadas durante o desenvolvimento.

## Requisitos Funcionais (RF)

### Autenticação e Gestão de Usuários
* **RF001:** O sistema permite o cadastro de cidadãos com: Nome, E-mail, Senha, CPF, Telefone e Data de Nascimento.
* **RF002:** O sistema permite o login de cidadãos e gestores utilizando E-mail e Senha (com autenticação JWT).
* **RF003:** O sistema permite que o cidadão edite o seu perfil (Telefone e E-mail).
* **RF004:** O sistema permite que o cidadão altere a sua senha de acesso.
* **RF005:** O sistema permite a "Exclusão de Conta" (Soft Delete), desativando o acesso do usuário mas mantendo o histórico de denúncias para integridade dos dados.

### Gestão de Denúncias (Cidadão - Mobile)
* **RF006:** O sistema permite registrar uma denúncia contendo obrigatoriamente: Foto (Câmera ou Galeria), Localização (GPS), Descrição e Endereço Completo. Ponto de Referência é opcional.
* **RF007:** O sistema exibe o histórico de todas as denúncias feitas pelo usuário logado, com indicação visual de status.
* **RF008:** O sistema permite que o cidadão **edite** os dados de uma denúncia (Descrição e Endereço), desde que o status não seja "Resolvida".
* **RF009:** O sistema permite que o cidadão **exclua** uma denúncia (informando o motivo), desde que o status não seja "Resolvida".
* **RF010:** O sistema permite a atualização da lista de denúncias através do gesto "Pull-to-Refresh".

### Gestão de Denúncias (Gestor - Web)
* **RF011:** O sistema exibe um Dashboard com contadores de resumo (Total, Pendentes, Em Andamento, Resolvidas).
* **RF012:** O sistema exibe todas as denúncias em um **mapa interativo**, utilizando marcadores coloridos para indicar o status (Vermelho: Recebida, Amarelo: Em Análise, Verde: Resolvida).
* **RF013:** O sistema lista as denúncias em uma tabela, exibindo uma prévia da descrição e o endereço.
* **RF014:** O sistema permite filtrar as denúncias visualizadas por status.
* **RF015:** O sistema permite visualizar os detalhes completos de uma denúncia e acessar a foto em alta resolução através de um Modal.
* **RF016:** O sistema permite ao gestor atualizar o status da denúncia.

## Requisitos Não-Funcionais (RNF)

* **RNF001 (Segurança):** As senhas dos usuários são armazenadas criptografadas (Hash bcrypt).
* **RNF002 (Segurança):** O acesso aos endpoints da API é protegido via Token JWT (Bearer Token).
* **RNF003 (Interface):** O aplicativo mobile possui feedback visual de carregamento (spinners) e tratamento de erros amigável.
* **RNF004 (Compatibilidade):** O aplicativo mobile foi gerado para plataforma Android (APK).
* **RNF005 (Armazenamento):** As imagens são armazenadas em nuvem (Supabase Storage) para garantir escalabilidade e performance.

## Regras de Negócio (RN)

* **RN001:** Uma denúncia não pode ser editada ou excluída pelo cidadão se o seu status for "Resolvida".
* **RN002:** O e-mail e o CPF devem ser únicos no sistema.
* **RN003:** O status inicial de toda denúncia é "Recebida".
* **RN004:** A exclusão de um usuário ou denúncia é lógica (`is_ativo = false` ou `is_excluida = true`), preservando a integridade referencial do banco de dados.