const mysql = require("mysql2");

// Configurações da conexão com o banco de dados
const db = mysql.createConnection({
    host: "localhost",
    user: "root",           
    password: "",           // Se o seu MySQL tiver senha, coloque-a aqui
    database: "DenunciaPel" // Nome definido no seu SQL
});

// Tentativa de conexão
db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar ao MySQL:", err.message);
        return;
    }
    console.log("✅ Conectado ao banco de dados DenunciaPel!");
});

module.exports = db;
