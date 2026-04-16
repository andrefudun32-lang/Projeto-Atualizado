{
    const formCadastro = document.getElementById('formCadastro');
    const selectTipo = document.getElementById('tipo');
    const colAdicional = document.getElementById('coluna-adicional');
    const bCidadao = document.getElementById('bloco-cidadao');
    const bFuncionario = document.getElementById('bloco-funcionario');

    // 1. Lista expandida de termos proibidos
    const termosProibidos = ["pinto", "rola", "xingamento1", "admin", "palavrao"];

    // Função que verifica se uma string contém ofensa
    function temOfensa(texto) {
        if (!texto) return false;
        const textoMinusculo = texto.toLowerCase();
        return termosProibidos.some(palavra => textoMinusculo.includes(palavra.toLowerCase()));
    }

    // Lógica de Visibilidade (Manter o que você já tinha)
    selectTipo.addEventListener('change', function() {
        const valor = this.value;
        colAdicional.style.display = (valor === 'funcionario' || valor === 'cidadao') ? 'block' : 'none';
        bFuncionario.style.display = (valor === 'funcionario') ? 'block' : 'none';
        bCidadao.style.display = (valor === 'cidadao') ? 'block' : 'none';
    });

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const tipo = selectTipo.value;
            if (!tipo) {
                alert('Por favor, selecione o tipo de usuário.');
                return;
            }

            // Coleta de todos os dados
            const dadosUsuario = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                senha: document.getElementById('senha').value,
                tipo: tipo
            };

            if (tipo === 'funcionario') {
                dadosUsuario.cargo = document.getElementById('cargo').value;
                dadosUsuario.departamento = document.getElementById('departamento').value;
            } else {
                dadosUsuario.cpf = document.getElementById('cpf').value;
                dadosUsuario.telefone = document.getElementById('telefone').value;
                dadosUsuario.endereco = document.getElementById('endereco').value;
            }

            // --- NOVA VALIDAÇÃO GLOBAL DE OFENSAS ---
            // Transforma todos os valores do objeto em uma lista e verifica um por um
            const valores = Object.values(dadosUsuario);
            const encontrouOfensa = valores.some(valor => temOfensa(valor));

            if (encontrouOfensa) {
                alert("❌ Cadastro negado: Foram detectadas palavras impróprias ou termos não permitidos em um dos campos. Por favor, revise seus dados.");
                return; // Bloqueia o fetch
            }

            // Se passar na validação, segue o envio...
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
