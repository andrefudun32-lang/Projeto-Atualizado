// 1. Verificação de Login
function checkAdminLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioLogado);
    // Aceita admin, Administrador ou funcionario
    if (usuario.tipo !== 'admin' && usuario.tipo !== 'Administrador' && usuario.tipo !== 'funcionario') {
        alert('Acesso negado.');
        window.location.href = 'inicial-logado.html';
    } else {
        const adminDisplay = document.getElementById('adminName');
        if (adminDisplay) adminDisplay.textContent = usuario.nome;
    }
}

// 2. Carregar Dados
async function carregarDadosDashboard() {
    try {
        const response = await fetch('http://localhost:3000/api/denuncias');
        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const denuncias = await response.json();

        document.getElementById('totalDenuncias').textContent = denuncias.length;
        document.getElementById('denunciasPendentes').textContent = denuncias.filter(d => d.status === 'Pendente').length;
        document.getElementById('denunciasEmAndamento').textContent = denuncias.filter(d => d.status === 'Em Andamento').length;
        document.getElementById('denunciasResolvidas').textContent = denuncias.filter(d => d.status === 'Resolvida').length;

        renderizarTabela(denuncias);
    } catch (error) {
        console.error('Erro no Dashboard:', error);
    }
}

// 3. Renderizar Tabela com Botão Excluir
function renderizarTabela(denuncias) {
    const tabelaCorpo = document.getElementById('denunciasTableBody');
    if (!tabelaCorpo) return;

    if (denuncias.length === 0) {
        tabelaCorpo.innerHTML = '<tr><td colspan="7">Nenhuma denúncia encontrada.</td></tr>';
        return;
    }

    tabelaCorpo.innerHTML = ''; 

    denuncias.forEach(denuncia => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${denuncia.id}</td>
            <td>${denuncia.tipo}</td>
            <td>${denuncia.endereco}</td>
            <td><span class="badge-status ${denuncia.status.toLowerCase().replace(' ', '-')}">${denuncia.status}</span></td>
            <td>${denuncia.prioridade || 'Média'}</td>
            <td>${denuncia.data_cadastro ? new Date(denuncia.data_cadastro).toLocaleDateString('pt-BR') : '---'}</td>
            <td>
                <button class="btn-acao btn-ver" onclick="verDetalhes(${denuncia.id})" title="Ver Detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-acao btn-excluir" onclick="deletarDenuncia(${denuncia.id})" title="Excluir Denúncia" style="color: #ff4d4d; margin-left: 10px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tabelaCorpo.appendChild(tr);
    });
}

// 4. FUNÇÃO PARA EXCLUIR (NOVA)
window.deletarDenuncia = async function(id) {
    if (confirm(`Deseja realmente excluir a denúncia #${id} permanentemente?`)) {
        try {
            const response = await fetch(`http://localhost:3000/api/denuncias/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Denúncia removida com sucesso!");
                carregarDadosDashboard(); // Recarrega a lista automaticamente
            } else {
                alert("Erro ao tentar excluir.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro de conexão com o servidor.");
        }
    }
};

// --- Outras Funções Auxiliares ---

window.showSection = function(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.add('active');
};

window.refreshDenuncias = function() {
    carregarDadosDashboard();
};

window.logout = function() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
};

document.addEventListener('DOMContentLoaded', () => {
    checkAdminLogin();
    carregarDadosDashboard();
});
