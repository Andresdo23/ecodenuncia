# Arquitetura do Sistema - EcoDenúncia (Imp

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
