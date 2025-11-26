# Arquitetura do Sistema - EcoDenúncia

## Visão Geral
O EcoDenúncia foi implementado seguindo uma arquitetura **Cliente-Servidor** baseada em API RESTful. A solução é composta por três grandes blocos: o Aplicativo Móvel (Cliente Cidadão), o Dashboard Web (Cliente Gestor) e o Servidor Backend (API e Dados).

A infraestrutura foi implantada inteiramente na nuvem para garantir acessibilidade pública e testes reais.

## Diagrama de Arquitetura

```mermaid
graph TD
    subgraph Clientes
        A["App Mobile (React Native/Expo)"] -->|HTTPS/JSON| C("API Gateway - Render")
        B["Web Dashboard (React.js)"] -->|HTTPS/JSON| C
    end

    subgraph "Backend - Render Cloud"
        C -->|"Autenticação JWT"| C1["Middleware Auth"]
        C -->|"Lógica de Negócio"| C2["Controllers"]
    end

    subgraph "Dados e Storage - Supabase"
        C2 -->|"Query SQL"| D[("PostgreSQL Database")]
        C2 -->|"Upload/Download"| E["Object Storage (Imagens)"]
    end

    subgraph "Serviços Externos"
        A -->|GPS| F["Expo Location Services"]
        A -->|Câmera| G["Expo Image Picker"]
        B -->|Mapas| H["OpenStreetMap / Leaflet"]
    end
'''

## Componentes e Tecnologias Implementadas

1. Backend (API REST)
Tecnologia: Node.js com framework Express.js.

Hospedagem: Render (Web Service).

Responsabilidades:

Gerenciar autenticação e autorização (JWT).

Processar regras de negócio (validação de status, permissões de edição).

Intermediar a comunicação segura com o Banco de Dados e Storage.

Sanitização e validação de dados de entrada.

2. Banco de Dados
Tecnologia: PostgreSQL.

Hospedagem: Supabase (Database-as-a-Service).

Estrutura: Relacional. Tabelas principais: USUARIO, DENUNCIA, STATUS_DENUNCIA.

Segurança: Utilização de variáveis de ambiente para credenciais e conexão via SSL (PGSSLMODE=require).

3. Armazenamento de Arquivos (Storage)
Tecnologia: Supabase Storage.

Uso: Armazenamento das fotos das denúncias enviadas pelos cidadãos. O banco de dados armazena apenas a URL pública da imagem.

Configuração: Bucket público para leitura, escrita restrita via API Key de serviço (Server-side).

4. Frontend Mobile (App Cidadão)
Tecnologia: React Native com Expo Framework.

Build: EAS (Expo Application Services) gerando APK para Android.

Bibliotecas Chave:

axios: Comunicação HTTP.

expo-location: Acesso ao GPS.

expo-image-picker: Acesso à Câmera e Galeria.

react-navigation: Navegação entre telas.

5. Frontend Web (Dashboard Gestor)
Tecnologia: React.js (Vite).

Bibliotecas Chave:

react-leaflet: Renderização de mapas interativos (OpenStreetMap).

axios: Comunicação HTTP.

leaflet: Manipulação de marcadores e popups.

Mudanças em Relação ao Planejamento Inicial (Etapa 1)
Durante a fase de implementação (Etapa 2), foram realizadas as seguintes adaptações arquiteturais justificadas:

Deploy no Render: Substituição do Heroku (planejado) pelo Render devido ao fim do plano gratuito do Heroku.

Storage Integrado: Substituição do AWS S3/Cloudinary pelo Supabase Storage. Justificativa: Redução de complexidade e latência, mantendo dados e arquivos no mesmo ecossistema de infraestrutura.

Mapas OpenSource: Utilização do OpenStreetMap (via Leaflet) ao invés do Google Maps API. Justificativa: Evitar custos de API e simplificar a configuração sem necessidade de cartão de crédito para o projeto acadêmico..

