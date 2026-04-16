{
    const formCadastro = document.getElementById('formCadastro');
    const selectTipo = document.getElementById('tipo');
    const colAdicional = document.getElementById('coluna-adicional');
    const bCidadao = document.getElementById('bloco-cidadao');
    const bFuncionario = document.getElementById('bloco-funcionario');

    // Lógica de Visibilidade e Reset de Tela
    selectTipo.addEventListener('change', function() {
        const valor = this.value;

        if (valor === 'funcionario') {
            // Mostra a coluna e o bloco de funcionário
            colAdicional.style.display = 'block';
            bFuncionario.style.display = 'block';
            bCidadao.style.display = 'none';
        } else if (valor === 'cidadao') {
            // Mostra a coluna e o bloco de cidadão
            colAdicional.style.display = 'block';
            bFuncionario.style.display = 'none';
            bCidadao.style.display = 'block';
        } else {
            // Volta à tela inicial: esconde a coluna adicional inteira
            colAdicional.style.display = 'none';
            bFuncionario.style.display = 'none';
            bCidadao.style.display = 'none';
        }
    });

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const tipo = selectTipo.value;
            if (!tipo) {
                alert('Por favor, selecione o tipo de usuário.');
                return;
            }

            const dadosUsuario = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                senha: document.getElementById('senha').value,
                tipo: tipo
            };

            // Coleta dados específicos baseado no tipo
            if (tipo === 'funcionario') {
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
                    alert('Sucesso! Redirecionando para o login...');
                    window.location.href = 'login.html';
                } else {
                    const erro = await response.json();
                    alert('Erro: ' + (erro.mensagem || 'Falha no cadastro'));
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Erro ao conectar com o servidor.');
            }
        });
    }
}
