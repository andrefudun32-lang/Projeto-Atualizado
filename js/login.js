async function handleLoginButtonClick() {
    const email = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    try {
        // Agora consultamos o SERVIDOR em vez de usar dados fixos
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva os dados que vieram do BANCO DE DADOS
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
            
            alert(`Login realizado com sucesso! Bem-vindo, ${data.user.nome}!`);
            
            // Redireciona conforme o tipo cadastrado no banco
            if (data.user.tipo === 'Administrador' || data.user.tipo === 'admin') {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "inicial-logado.html";
            }
        } else {
            // Exibe a mensagem de erro que vem do servidor (ex: "E-mail ou senha incorretos")
            alert(data.mensagem);
        }
    } catch (error) {
        console.error("Erro na conexão:", error);
        alert("Erro ao conectar com o servidor. Verifique se o Node.js está rodando!");
    }
}