
-- BANCO DE DADOS - SISTEMA DE DENÚNCIAS

-- Este arquivo contém a estrutura completa do banco de dados
-- Inclui tabelas para usuários, administradores e denúncias

-- Criação do banco de dados
create database DenunciaPel;
use DenunciaPel;


-- TABELA DE USUÁRIOS COMUNS

-- Armazena dados dos cidadãos que fazem denúncias
CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Chave primária auto-incremento
    nome VARCHAR(100) NOT NULL,               -- Nome completo do usuário
    email VARCHAR(255) UNIQUE NOT NULL,       -- Email único para login
    senha VARCHAR(255) NOT NULL,              -- Senha criptografada
    telefone VARCHAR(20),                     -- Telefone de contato
    cpf VARCHAR(14) UNIQUE,                   -- CPF único
    data_nascimento DATE,                     -- Data de nascimento
    endereco VARCHAR(255),                    -- Endereço residencial
    cidade VARCHAR(100),                      -- Cidade
    estado VARCHAR(50),                       -- Estado
    cep VARCHAR(10),                          -- CEP
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Data de cadastro automática
);



-- TABELA DE ADMINISTRADORES

-- Armazena dados dos funcionários que gerenciam as denúncias
CREATE TABLE UsuarioAdm (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Chave primária
    nome VARCHAR(100) NOT NULL,               -- Nome do administrador
    email VARCHAR(255) UNIQUE NOT NULL,       -- Email único para login
    senha VARCHAR(255) NOT NULL,              -- Senha criptografada
    cargo VARCHAR(100),                       -- Cargo na prefeitura
    departamento VARCHAR(100)                 -- Departamento responsável
);

CREATE TABLE Denuncias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(70) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    referencia VARCHAR(255),
    descricao VARCHAR(500) NOT NULL,
    foto LONGTEXT
    
    );