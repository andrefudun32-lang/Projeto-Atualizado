async function handleLoginButtonClick() {
    const email = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    try {
        // Consulta o servidor na porta 3000
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva o objeto do usuário (incluindo o campo 'tipo') no localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
            
            alert(`Login realizado com sucesso! Bem-vindo, ${data.user.nome}!`);
            
            // REDIRECIONAMENTO INTELIGENTE
            // Verifica se o tipo é funcionario (conforme seu cadastro) ou admin
            if (data.user.tipo === 'funcionario' || data.user.tipo === 'admin' || data.user.tipo === 'Administrador') {
                // Se for da prefeitura, vai para o Dashboard Laranja
                window.location.href = "admin-dashboard.html";
            } else {
                // Se for cidadão comum, vai para a tela inicial de usuário
                window.location.href = "inicial-logado.html";
            }
        } else {
            // Exibe a mensagem de erro vinda do servidor (ex: "E-mail ou senha incorretos")
            alert(data.mensagem || "Erro ao realizar login.");
        }
    } catch (error) {
        console.error("Erro na conexão:", error);
        alert("Erro ao conectar com o servidor. Verifique se o Node.js está rodando!");
    }
}
