// SERVIDOR BACKEND - SISTEMA DE DENÚNCIAS

// Importações necessárias
const express = require("express"); 
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db"); // Conexão com banco MySQL

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// --- ROTAS DE DENÚNCIAS (MANTIDAS) ---

app.get("/api/denuncias", (req, res) => {
  const sql = "SELECT * FROM Denuncias ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar denúncias" });
    res.json(results);
  });
});

app.post("/api/denuncias", (req, res) => {
  const { tipo, endereco, referencia, descricao, foto } = req.body;
  if (!tipo || !endereco || !descricao) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
  }
  const sql = "INSERT INTO Denuncias (tipo, endereco, referencia, descricao, foto) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [tipo, endereco, referencia, descricao, foto], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao registrar a denúncia.' });
    res.status(201).json({ message: 'Denúncia registrada!', id: result.insertId });
  });
});

// --- ROTAS DE USUÁRIOS (CADASTRO E LOGIN) ---

// Rota para cadastrar novos usuários
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
      });

    // Usando "Usuarios" com U maiúsculo para combinar com seu SQL
    const sql = "INSERT INTO Usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
    console.log(req.body);
    
    db.query(sql, [nome, email, senha, tipo], (err, result) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).json({ mensagem: "Erro ao salvar no banco." });
        }
        res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
    });
});

// NOVA ROTA: Login de usuários
app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios!" });
    }

    const sql = "SELECT * FROM Usuarios WHERE email = ? AND senha = ?";
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno no servidor." });

        if (results.length > 0) {
            // Retorna o usuário encontrado (para o login.js salvar no localStorage)
            res.json({ 
                mensagem: "Login realizado com sucesso!", 
                user: results[0] 
            });
        } else {
            res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }
    });
});

// --- NOVA ROTA: ATUALIZAR PERFIL (NOME OU EMAIL) ---
app.post("/atualizar-perfil", (req, res) => {
    const { id, campo, valor } = req.body;

    // Verifica se os dados chegaram corretamente
    if (!id || !campo || !valor) {
        return res.status(400).json({ error: "Dados incompletos para atualização." });
    }

    // Define qual coluna será atualizada baseado no campo enviado pelo frontend
    // Isso também evita injeção de SQL garantindo que só 'nome' ou 'email' sejam alterados
    const coluna = campo === 'username' ? 'nome' : 'email';

    const sql = `UPDATE Usuarios SET ${coluna} = ? WHERE id = ?`;

    db.query(sql, [valor, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar banco:", err);
            return res.status(500).json({ error: "Erro interno ao atualizar perfil." });
        }
        res.status(200).json({ message: "Atualizado com sucesso" });
    });
});

// Rota para verificar se um e-mail existe
app.get("/api/usuarios/verificar/:email", (req, res) => {
    const email = req.params.email;
    const sql = "SELECT nome, tipo FROM Usuarios WHERE email = ?";
    
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao consultar banco" });
        if (results.length > 0) {
            res.json({ existe: true, usuario: results[0] });
        } else {
            res.json({ existe: false });
        }
    });
});

// Rota de Estatísticas Públicas
app.get("/api/estatisticas", (req, res) => {
    const sql = "SELECT COUNT(*) as total FROM Denuncias";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar dados" });
        res.json(results[0]);
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});