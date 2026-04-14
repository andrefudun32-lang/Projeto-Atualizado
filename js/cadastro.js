document.getElementById('formCadastro').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo = document.getElementById('tipo').value;

    // --- VALIDAÇÃO DE NOME COMPLETO ---
    if (!nome.includes(' ')) {
        alert('Coloque o nome completo');
        return;
    }

    // --- NOVA VALIDAÇÃO: APENAS LETRAS E ACENTOS ---
    // Esta Regex permite letras (maiúsculas/minúsculas), acentuação latina e espaços.
    const regexLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (!regexLetras.test(nome)) {
        alert('O nome deve conter apenas letras e acentos (caracteres especiais não são permitidos)');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/usuarios', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, tipo })
        });

        if (response.ok) {
            alert('Conta criada com sucesso!');
            window.location.href = 'login.html'; 
        } else {
            const erro = await response.json();
            alert('Erro ao cadastrar: ' + erro.mensagem);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Não foi possível conectar ao servidor.');
    }
});