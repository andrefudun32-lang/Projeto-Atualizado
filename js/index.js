const express = require("express"); 
const cors = require("cors");
const db = require("./db"); 

const app = express();
const PORT = 3000;

// Configuração de limites e CORS (DEVE vir antes das rotas)
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Essencial para as fotos do Denúncia Pelotas
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- LOGIN ---
app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;
    
    const sqlCid = "SELECT id, nome, email, tipo FROM Usuarios WHERE email = ? AND senha = ?";
    db.query(sqlCid, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ mensagem: "Erro interno no banco de dados." });

        if (results.length > 0) {
            return res.json({ mensagem: "Sucesso!", user: results[0] });
        } else {
            const sqlAdm = "SELECT id, nome, email, 'funcionario' as tipo FROM UsuarioAdm WHERE email = ? AND senha = ?";
            db.query(sqlAdm, [email, senha], (err, resultsAdm) => {
                if (err) return res.status(500).json({ mensagem: "Erro interno no banco de dados." });

                if (resultsAdm.length > 0) {
                    return res.json({ mensagem: "Sucesso!", user: resultsAdm[0] });
                } else {
                    return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
                }
            });
        }
    });
});

// --- CADASTRO ---
app.post("/api/usuarios", (req, res) => {
    const dados = req.body;
    if (dados.tipo === 'funcionario') {
        const sql = "INSERT INTO UsuarioAdm (nome, email, senha, cargo, departamento) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [dados.nome, dados.email, dados.senha, dados.cargo, dados.departamento], (err) => {
            if (err) return res.status(500).json({ mensagem: "Erro ao cadastrar funcionário." });
            res.json({ mensagem: "Funcionário cadastrado!" });
        });
    } else {
        const sql = "INSERT INTO Usuarios (nome, email, senha, cpf, telefone, endereco, tipo) VALUES (?, ?, ?, ?, ?, ?, 'cidadao')";
        db.query(sql, [dados.nome, dados.email, dados.senha, dados.cpf, dados.telefone, dados.endereco], (err) => {
            if (err) return res.status(500).json({ mensagem: "Erro ao cadastrar cidadão." });
            res.json({ mensagem: "Cidadão cadastrado!" });
        });
    }
});

// --- LISTAR DENÚNCIAS ---
app.get("/api/denuncias", (req, res) => {
    const sql = "SELECT * FROM Denuncias ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ mensagem: "Erro ao buscar denúncias." });
        res.json(results);
    });
});

// --- ROTA PARA CRIAR NOVA DENÚNCIA ---
app.post("/api/denuncias", (req, res) => {
    const { tipo, endereco, referencia, descricao, foto, usuario_id, usuario_nome } = req.body;

    const sql = `INSERT INTO Denuncias 
                (tipo, endereco, referencia, descricao, foto, usuario_id, usuario_nome, status, data_criacao) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendente', NOW())`;

    db.query(sql, [tipo, endereco, referencia, descricao, foto, usuario_id, usuario_nome], (err, result) => {
        if (err) {
            console.error("Erro ao inserir denúncia:", err);
            return res.status(500).json({ mensagem: "Erro ao salvar no banco de dados." });
        }
        res.status(201).json({ mensagem: "Denúncia registrada com sucesso!", id: result.insertId });
    });
});

// --- EXCLUIR DENÚNCIA ---
app.delete("/api/denuncias/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM Denuncias WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ mensagem: "Erro ao excluir do banco." });
        if (result.affectedRows === 0) return res.status(404).json({ mensagem: "Denúncia não encontrada." });
        res.json({ mensagem: "Denúncia excluída com sucesso!" });
    });
});

// Middleware para rotas inexistentes (evita enviar HTML de erro 404)
app.use((req, res) => {
    res.status(404).json({ mensagem: "Rota não encontrada no servidor." });
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
