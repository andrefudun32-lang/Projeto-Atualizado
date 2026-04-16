const mysql = require("mysql2");

// Configurações da conexão com o banco de dados
const db = mysql.createConnection({
    host: "localhost",
    user: "root",           // Usuário padrão do MySQL (XAMPP/Workbench)
    password: "senacrs",           // Deixe vazio se não definiu senha, ou coloque sua senha real
    database: "DenunciaPel" // Nome exato definido no seu script SQL
});

// Tentativa de conexão
db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar ao MySQL:", err.message);
        return;
    }
    console.log("✅ Conectado ao banco de dados DenunciaPel!");
});

// Exporta a conexão para ser usada pelo server.js
module.exports = db;
