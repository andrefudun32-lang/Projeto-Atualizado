-- 1. Criação do Banco de Dados
CREATE DATABASE DenunciaPel;
USE DenunciaPel;
-- 2. Tabela de Usuários Comuns (Cidadãos)
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
    tipo VARCHAR(30) DEFAULT 'cidadao', 
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Administradores (Funcionários)

CREATE TABLE UsuarioAdm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    departamento VARCHAR(100)
);
-- 4. Tabela de Denúncias
CREATE TABLE Denuncias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT, 
    tipo VARCHAR(70) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    referencia VARCHAR(255),
    descricao VARCHAR(500) NOT NULL,
    foto LONGTEXT, 
    status VARCHAR(20) DEFAULT 'Pendente', 
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Vincula a denúncia ao cidadão que a criou
    CONSTRAINT fk_usuario_denuncia FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE SET NULL
);
USE DenunciaPel;

ALTER TABLE Denuncias 
ADD COLUMN usuario_nome VARCHAR(255) AFTER usuario_id;
ALTER TABLE Denuncias MODIFY COLUMN foto LONGTEXT;
