{
    const formCadastro = document.getElementById('formCadastro');
    const selectTipo = document.getElementById('tipo');
    const colAdicional = document.getElementById('coluna-adicional');
    const bCidadao = document.getElementById('bloco-cidadao');
    const bFuncionario = document.getElementById('bloco-funcionario');

    if (selectTipo) {
        selectTipo.addEventListener('change', function() {
            const valor = this.value;
            colAdicional.style.display = 'block';
            bFuncionario.style.display = (valor === 'funcionario') ? 'block' : 'none';
            bCidadao.style.display = (valor === 'cidadao') ? 'block' : 'none';
        });
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const dadosUsuario = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                senha: document.getElementById('senha').value,
                tipo: selectTipo.value
            };

            if (dadosUsuario.tipo === 'funcionario') {
                dadosUsuario.cargo = document.getElementById('cargo').value;
                dadosUsuario.departamento = document.getElementById('departamento').value;
            } else {
                dadosUsuario.cpf = document.getElementById('cpf').value;
                dadosUsuario.telefone = document.getElementById('telefone').value;
                dadosUsuario.endereco = document.getElementById('endereco').value;
            }

            try {
                const response = await fetch('http://localhost:3000/api/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosUsuario)
                });
                
                if (response.ok) {
                    alert('Cadastro realizado!');
                    window.location.href = 'login.html';
                }
            } catch (err) {
                alert('Erro ao conectar com o servidor.');
            }
        });
    }
}
