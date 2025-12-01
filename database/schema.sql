-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABELA: USUARIO
-- ==============================================================================
CREATE TABLE USUARIO (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(10) NOT NULL CHECK (tipo_usuario IN ('cidadao', 'gestor')),
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE,
    is_ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- TABELA: STATUS_DENUNCIA (Lookup)
-- ==============================================================================
CREATE TABLE STATUS_DENUNCIA (
    id INT PRIMARY KEY,
    nome_status VARCHAR(50) NOT NULL UNIQUE
);

-- Seed Inicial de Status
INSERT INTO STATUS_DENUNCIA (id, nome_status) VALUES
(1, 'Recebida'),
(2, 'Em Análise'),
(3, 'Resolvida'),
(4, 'Rejeitada');

-- ==============================================================================
-- TABELA: DENUNCIA
-- ==============================================================================
CREATE TABLE DENUNCIA (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES USUARIO(id),
    id_status INT NOT NULL DEFAULT 1 REFERENCES STATUS_DENUNCIA(id),
    descricao TEXT,
    url_foto VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco_completo VARCHAR(255),
    ponto_referencia VARCHAR(255),
    is_excluida BOOLEAN DEFAULT FALSE,
    motivo_exclusao TEXT,
    data_ocorrencia TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_denuncia_localizacao ON DENUNCIA (latitude, longitude);
CREATE INDEX idx_denuncia_status ON DENUNCIA (id_status);
CREATE INDEX idx_denuncia_usuario ON DENUNCIA (id_usuario);