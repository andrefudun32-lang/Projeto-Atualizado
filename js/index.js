// SERVIDOR BACKEND - SISTEMA DE DENÚNCIAS
const express = require("express"); 
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db"); 

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// --- ROTAS DE DENÚNCIAS ---

// Buscar todas as denúncias (Usada pelo Dashboard e Gerenciamento)
app.get("/api/denuncias", (req, res) => {
  const sql = "SELECT * FROM Denuncias ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar denúncias" });
    res.json(results);
  });
});

// Registrar nova denúncia
app.post("/api/denuncias", (req, res) => {
  const { tipo, endereco, referencia, descricao, foto } = req.body;
  if (!tipo || !endereco || !descricao) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
  }
  const sql = "INSERT INTO Denuncias (tipo, endereco, referencia, descricao, foto, status) VALUES (?, ?, ?, ?, ?, 'Pendente')";
  db.query(sql, [tipo, endereco, referencia, descricao, foto], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao registrar a denúncia.' });
    res.status(201).json({ message: 'Denúncia registrada!', id: result.insertId });
  });
});

// ATUALIZAR STATUS (Necessário para o botão de salvar no modal do Admin)
app.put("/api/denuncias/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = "UPDATE Denuncias SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao atualizar status" });
    res.json({ message: "Status atualizado!" });
  });
});

// EXCLUIR DENÚNCIA (Acionado pelo botão de lixeira no Admin)
app.delete("/api/denuncias/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Denuncias WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao excluir denúncia" });
    res.json({ message: "Denúncia removida com sucesso!" });
  });
});

// --- ROTAS DE USUÁRIOS ---

app.post("/api/usuarios", (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
        return res.status(400).json({ mensagem: "Preencha todos os campos!" });
    }

    const sqlCheck = "SELECT * FROM Usuarios WHERE email = ?";
    db.query(sqlCheck, [email], (err, results) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno no servidor." });
        
        if (results.length > 0) {
            return res.status(409).json({ mensagem: "E-mail já cadastrado." });
        }

        // CORREÇÃO: O INSERT deve estar DENTRO do callback do SELECT de verificação
        const sql = "INSERT INTO Usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
        db.query(sql, [nome, email, senha, tipo], (err, result) => {
            if (err) {
                console.error("Erro no banco:", err);
                return res.status(500).json({ mensagem: "Erro ao salvar no banco." });
            }
            res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
        });
    });
});

app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;
    const sql = "SELECT * FROM Usuarios WHERE email = ? AND senha = ?";
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno no servidor." });
        if (results.length > 0) {
            res.json({ mensagem: "Login realizado com sucesso!", user: results[0] });
        } else {
            res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
