// Referências dos elementos para alternância de campos
const selectTipo = document.getElementById('tipo');
const blocoCidadao = document.getElementById('bloco-cidadao');
const blocoFuncionario = document.getElementById('bloco-funcionario');
const inputCpf = document.getElementById('cpf');

// 1. Lógica para mostrar/esconder campos baseada no tipo de usuário
selectTipo.addEventListener('change', function() {
    if (this.value === 'funcionario') {
        blocoFuncionario.style.display = 'block';
        blocoCidadao.style.display = 'none';
        inputCpf.required = false; 
    } else {
        blocoFuncionario.style.display = 'none';
        blocoCidadao.style.display = 'block';
        inputCpf.required = true;
    }
});

// 2. Lógica de submissão do formulário
document.getElementById('formCadastro').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const tipo = selectTipo.value; 

    // Validações de nome
    if (!nome.includes(' ')) {
        alert('Coloque o nome completo');
        return;
    }

    const regexLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regexLetras.test(nome)) {
        alert('O nome deve conter apenas letras e acentos');
        return;
    }

    // Criamos o objeto base
    let dadosParaEnviar = { nome, email, senha, tipo };

    // Personalização baseada na tabela MySQL de destino
    if (tipo === 'funcionario') {
        const cargo = document.getElementById('cargo').value.trim();
        const departamento = document.getElementById('departamento').value.trim();
        
        if (!cargo || !departamento) {
            alert('Por favor, preencha o cargo e o departamento do funcionário.');
            return;
        }
        // Dados exclusivos da tabela UsuarioAdm
        dadosParaEnviar.cargo = cargo;
        dadosParaEnviar.departamento = departamento;
    } else {
        const cpf = inputCpf.value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const endereco = document.getElementById('endereco').value.trim();

        if (!cpf) {
            alert('O CPF é obrigatório para cidadãos.');
            return;
        }
        // Dados exclusivos da tabela Usuarios
        dadosParaEnviar.cpf = cpf;
        dadosParaEnviar.telefone = telefone;
        dadosParaEnviar.endereco = endereco;
    }

    // Envio para o Backend
    try {
        const response = await fetch('http://localhost:3000/api/usuarios', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaEnviar)
        });

        if (response.ok) {
            alert('Cadastro concluído com sucesso!');

            if (tipo === 'funcionario') {
                window.location.href = 'login.html';
            } else {
                const dadosUsuario = { nome, email, tipo };
                localStorage.setItem("usuarioLogado", JSON.stringify(dadosUsuario));
                window.location.href = 'fazer-denuncia.html'; 
            }
        } else {
            const erro = await response.json();
            alert('Erro ao cadastrar: ' + erro.mensagem);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro: Não foi possível conectar ao servidor backend.');
    }
});
