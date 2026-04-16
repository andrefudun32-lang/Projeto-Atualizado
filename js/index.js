// SERVIDOR BACKEND - SISTEMA DE DENÚNCIAS
const express = require("express"); 
const cors = require("cors");
const db = require("./db"); 

const app = express();
const PORT = 3000;

// Configuração de limites para aceitar fotos em Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- ROTAS DE DENÚNCIAS ---

// Buscar todas as denúncias
app.get("/api/denuncias", (req, res) => {
  const sql = "SELECT * FROM Denuncias ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao buscar denúncias:", err);
      return res.status(500).json({ error: "Erro ao buscar denúncias" });
    }
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
    if (err) {
      console.error("--- ERRO NO BANCO DE DADOS ---", err.message);
      return res.status(500).json({ error: 'Erro ao registrar a denúncia.' });
    }
    res.status(201).json({ message: 'Denúncia registrada!', id: result.insertId });
  });
});

// Atualizar Status
app.put("/api/denuncias/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = "UPDATE Denuncias SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao atualizar status" });
    res.json({ message: "Status atualizado!" });
  });
});

// Excluir Denúncia (ESSA É A ROTA QUE VOCÊ PRECISAVA)
app.delete("/api/denuncias/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Denuncias WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Erro ao deletar:", err);
      return res.status(500).json({ error: "Erro ao excluir denúncia" });
    }
    res.json({ message: "Denúncia removida com sucesso!" });
  });
});

// --- ROTAS DE USUÁRIOS ---

app.post("/api/usuarios", (req, res) => {
    const { nome, email, senha, tipo } = req.body;
    if (!nome || !email || !senha || !tipo) return res.status(400).json({ mensagem: "Preencha tudo!" });

    const sql = "INSERT INTO Usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
    db.query(sql, [nome, email, senha, tipo], (err, result) => {
        if (err) return res.status(500).json({ mensagem: "Erro ao salvar usuário." });
        res.status(201).json({ mensagem: "Usuário criado!" });
    });
});

app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;
    const sql = "SELECT * FROM Usuarios WHERE email = ? AND senha = ?";
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno." });
        if (results.length > 0) {
            res.json({ mensagem: "Sucesso!", user: results[0] });
        } else {
            res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
