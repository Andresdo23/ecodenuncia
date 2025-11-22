-- Habilitar a extensão para geração de UUIDs (Identificadores Únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---
-- Tabela: USUARIO
-- Descrição: Armazena os usuários, tanto cidadãos quanto gestores.
-- ---
CREATE TABLE USUARIO (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(10) NOT NULL CHECK (tipo_usuario IN ('cidadao', 'gestor')),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---
-- Tabela: STATUS_DENUNCIA
-- Descrição: Tabela de lookup para os status das denúncias.
-- ---
CREATE TABLE STATUS_DENUNCIA (
    id INT PRIMARY KEY,
    nome_status VARCHAR(50) NOT NULL UNIQUE
);

-- ---
-- MELHORIA: Popular (seed) a tabela de status.
-- Estes IDs são agora a "fonte da verdade" para todo o sistema.
-- ---
INSERT INTO STATUS_DENUNCIA (id, nome_status) VALUES
(1, 'Recebida'),
(2, 'Em Análise'),
(3, 'Resolvida'),
(4, 'Rejeitada');

-- ---
-- Tabela: DENUNCIA
-- Descrição: Armazena todas as denúncias feitas pelos cidadãos.
-- ---
CREATE TABLE DENUNCIA (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255),
    descricao TEXT,
    url_foto VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    data_ocorrencia TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Chaves Estrangeiras
    id_usuario UUID NOT NULL REFERENCES USUARIO(id),
    
    -- Define o status padrão como 'Recebida' (ID 1)
    id_status INT NOT NULL DEFAULT 1 REFERENCES STATUS_DENUNCIA(id)
);

-- ---
-- Otimizações: Índices para consultas rápidas
-- ---
CREATE INDEX idx_denuncia_localizacao ON DENUNCIA (latitude, longitude);
CREATE INDEX idx_denuncia_status ON DENUNCIA (id_status);
CREATE INDEX idx_denuncia_usuario ON DENUNCIA (id_usuario);