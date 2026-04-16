-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS DenunciaPel;
USE DenunciaPel;

-- ---------------------------------------------------------
-- TABELA DE USUÁRIOS COMUNS
-- ---------------------------------------------------------
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(10),
    tipo VARCHAR(30),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- TABELA DE ADMINISTRADORES
-- ---------------------------------------------------------
CREATE TABLE UsuarioAdm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    departamento VARCHAR(100)
);

-- ---------------------------------------------------------
-- TABELA DE DENÚNCIAS
-- ---------------------------------------------------------
CREATE TABLE Denuncias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT, -- Relaciona a denúncia ao usuário que a criou
    tipo VARCHAR(70) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    referencia VARCHAR(255),
    descricao VARCHAR(500) NOT NULL,
    foto LONGTEXT, -- Definido como LONGTEXT para suportar Base64 ou caminhos longos
    status VARCHAR(20) DEFAULT 'Pendente', -- Status inicial exigido pelo sistema
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restrição de integridade: vincula ao ID da tabela Usuarios
    CONSTRAINT fk_usuario_denuncia FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE SET NULL
);
