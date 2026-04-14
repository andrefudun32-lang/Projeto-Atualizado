// Esta função será chamada diretamente pelo onclick do botão no HTML
function handleLoginButtonClick() {
    // Pega os valores digitados nos campos de usuário e senha
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Exibe os valores no console do navegador (para você depurar)
    console.log('Tentativa de Login:');
    console.log('Usuário:', username);
    console.log('Senha:', password);

    // Lógica de autenticação: se o usuário for 'andre' e a senha for '123'
    if (username === 'andre' && password === '123') {
        window.location.href = 'fazer-denuncia.html'; // Redireciona para a página inicial
    }
}