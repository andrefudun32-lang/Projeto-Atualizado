document.getElementById('formCadastro').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo = document.getElementById('tipo').value; // Pega 'cidadao' ou 'funcionario'
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    // --- VALIDAÇÃO DE NOME COMPLETO ---
    if (!nome.includes(' ')) {
        alert('Coloque o nome completo');
        return;
    }

    // --- VALIDAÇÃO: APENAS LETRAS E ACENTOS ---
    const regexLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regexLetras.test(nome)) {
        alert('O nome deve conter apenas letras e acentos');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/usuarios', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, tipo, cpf, telefone, endereco })
        });

        if (response.ok) {
            // 1. Salva os dados do usuário no localStorage para manter a sessão ativa
            const dadosUsuario = {
                nome: nome,
                email: email,
                tipo: tipo // Aqui será 'cidadao' ou 'funcionario'
            };
            localStorage.setItem("usuarioLogado", JSON.stringify(dadosUsuario));

            alert('Conta criada com sucesso!');

            // 2. Lógica de Redirecionamento Baseada no Tipo
            if (tipo === 'funcionario') {
                // Se for funcionário, abre a tela de gestão da prefeitura
                window.location.href = 'admin-dashboard.html'; 
            } else {
                // Se for cidadão, vai para a tela comum de denúncias
                window.location.href = 'fazer-denuncia.html'; 
            }

        } else {
            const erro = await response.json();
            alert('Erro ao cadastrar: ' + erro.mensagem);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Não foi possível conectar ao servidor.');
    }
});
