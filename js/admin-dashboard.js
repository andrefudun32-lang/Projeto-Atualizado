// 1. Verificação de Segurança
function checkAdminLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    
    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioLogado);
    const tiposPermitidos = ['admin', 'Administrador', 'funcionario'];
    
    if (!tiposPermitidos.includes(usuario.tipo)) {
        alert('Acesso negado. Esta área é restrita a administradores.');
        window.location.href = 'inicial-logado.html';
    } else {
        const adminDisplay = document.getElementById('adminName');
        if (adminDisplay) adminDisplay.textContent = usuario.nome;
    }
}

// 2. Navegação entre Seções
window.showSection = function(sectionId) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const activeNav = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
        if (sectionId === 'denuncias' || sectionId === 'dashboard') {
            carregarDadosDashboard();
        }
    }
};

// 3. Buscar Dados da API
async function carregarDadosDashboard() {
    try {
        const response = await fetch('http://localhost:3000/api/denuncias');
        if (!response.ok) throw new Error('Falha ao conectar com o servidor.');
        
        const denuncias = await response.json();

        // Atualizar Cards
        document.getElementById('totalDenuncias').textContent = denuncias.length;
        document.getElementById('denunciasPendentes').textContent = denuncias.filter(d => d.status === 'Pendente').length;
        document.getElementById('denunciasEmAndamento').textContent = denuncias.filter(d => d.status === 'Em Andamento').length;
        document.getElementById('denunciasResolvidas').textContent = denuncias.filter(d => d.status === 'Resolvida').length;

        renderizarTabela(denuncias);
    } catch (error) {
        console.error('Erro:', error);
        // O erro da imagem 5569ab geralmente ocorre se o servidor retornar HTML em vez de JSON
        // Verifique se a URL 'http://localhost:3000/api/denuncias' está correta no seu Node.js
    }
}

// 4. Renderizar Tabela
function renderizarTabela(denuncias) {
    const tbody = document.getElementById('denunciasTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    denuncias.forEach(d => {
        const data = d.data_criacao ? new Date(d.data_criacao).toLocaleDateString('pt-BR') : '---';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${d.id}</td>
            <td>${d.tipo}</td>
            <td>${d.endereco}</td>
            <td><span class="badge ${d.status.toLowerCase().replace(' ', '-')}">${d.status}</span></td>
            <td>${d.prioridade || 'Média'}</td>
            <td>${data}</td>
            <td>
                <button class="btn-acao" onclick="verDetalhes(${d.id})"><i class="fas fa-eye"></i></button>
                <button class="btn-acao btn-excluir" onclick="deletarDenuncia(${d.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. Deletar Denúncia (RESOLVE ERRO DA IMAGEM 4b0161)
window.deletarDenuncia = async function(id) {
    if (confirm(`Atenção: Deseja realmente excluir a denúncia #${id}?`)) {
        try {
            const response = await fetch(`http://localhost:3000/api/denuncias/${id}`, {
                method: 'DELETE'
            });

            const resultado = await response.json();

            if (response.ok) {
                alert("Denúncia excluída com sucesso!");
                carregarDadosDashboard(); // Recarrega a lista
            } else {
                alert(resultado.mensagem || "Erro ao excluir.");
            }
        } catch (error) {
            alert("Erro de conexão com o servidor backend.");
        }
    }
};

// 6. Ver Detalhes e Mudar Status
window.verDetalhes = async function(id) {
    try {
        const response = await fetch('http://localhost:3000/api/denuncias');
        const denuncias = await response.json();
        const d = denuncias.find(item => item.id === id);

        if (d) {
            document.getElementById('modalDenunciaId').textContent = d.id;
            document.getElementById('modalDenunciaTipo').textContent = d.tipo;
            document.getElementById('modalDenunciaEndereco').textContent = d.endereco;
            document.getElementById('modalDenunciaDescricao').textContent = d.descricao;
            document.getElementById('statusSelect').value = d.status;
            document.getElementById('denunciaModal').style.display = 'block';
        }
    } catch (error) {
        alert("Erro ao carregar detalhes.");
    }
};

window.salvarAlteracaoStatus = async function() {
    const id = document.getElementById('modalDenunciaId').textContent;
    const novoStatus = document.getElementById('statusSelect').value;

    try {
        const response = await fetch(`http://localhost:3000/api/denuncias/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        if (response.ok) {
            alert("Status atualizado!");
            closeModal();
            carregarDadosDashboard();
        }
    } catch (error) {
        alert("Erro ao atualizar status.");
    }
};

window.closeModal = () => document.getElementById('denunciaModal').style.display = 'none';

window.logout = function() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAdminLogin();
    carregarDadosDashboard();
});
