async function handleLoginButtonClick() {
    const email = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
            
            // Redirecionamento baseado no tipo
            if (['funcionario', 'admin', 'Administrador'].includes(data.user.tipo)) {
                window.location.href = "admin-dashboard.html"; 
            } else {
                window.location.href = "inicial-logado.html";
            }
        } else {
            alert(data.mensagem);
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor. O backend está rodando?");
    }
}
