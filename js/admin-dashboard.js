let currentDenuncias = [];
let currentDenunciaId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    loadDashboard();
});

function checkAdminLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        alert('Acesso negado. Faça login como administrador.');
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioLogado);
    if (usuario.tipo !== 'admin') {
        alert('Acesso negado. Apenas administradores podem acessar esta página.');
        window.location.href = 'inicial-logado.html';
        return;
    }

    document.getElementById('adminName').textContent = usuario.nome;
}


function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(sectionName).classList.add('active');
    document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');

    if (sectionName === 'denuncias') {
        loadDenuncias();
    } else if (sectionName === 'estatisticas') {
        loadEstatisticas();
    }
}

async function loadDashboard() {
    try {
        const response = await fetch('http://localhost:3000/api/denuncias');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const denuncias = await response.json();
        currentDenuncias = denuncias;

        updateStats(denuncias);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Erro ao carregar dados. Verifique se o servidor está rodando.');
    }
}

function updateStats(denuncias) {
    const total = denuncias.length;
    const pendentes = denuncias.filter(d => d.status === 'Pendente' || !d.status).length;
    const emAndamento = denuncias.filter(d => d.status === 'Em Andamento').length;
    const resolvidas = denuncias.filter(d => d.status === 'Resolvida').length;

    const totalElement = document.getElementById('totalDenuncias');
    const pendentesElement = document.getElementById('denunciasPendentes');
    const emAndamentoElement = document.getElementById('denunciasEmAndamento');
    const resolvidasElement = document.getElementById('denunciasResolvidas');
    
    if (totalElement) totalElement.textContent = total;
    if (pendentesElement) pendentesElement.textContent = pendentes;
    if (emAndamentoElement) emAndamentoElement.textContent = emAndamento;
    if (resolvidasElement) resolvidasElement.textContent = resolvidas;
}

async function loadDenuncias() {
    const tbody = document.getElementById('denunciasTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Carregando denúncias...</td></tr>';

    try {
        const response = await fetch('http://localhost:3000/api/denuncias');
        if (!response.ok) {
            throw new Error('Erro ao carregar denúncias');
        }

        const denuncias = await response.json();
        currentDenuncias = denuncias;
        displayDenuncias(denuncias);
    } catch (error) {
        console.error('Erro ao carregar denúncias:', error);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar denúncias</td></tr>';
    }
}

function displayDenuncias(denuncias) {
    const tbody = document.getElementById('denunciasTableBody');
    
    if (denuncias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma denúncia encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = denuncias.map(denuncia => {
        const dataDenuncia = new Date(denuncia.data_denuncia);
        const status = denuncia.status || 'Pendente';
        const prioridade = denuncia.prioridade || 'Media';
        
        const statusClass = status === 'Pendente' ? 'pendente' : 
                           status === 'Em Andamento' ? 'andamento' : 
                           status === 'Resolvida' ? 'resolvida' : 'pendente';
        
        const prioridadeClass = prioridade === 'Baixa' ? 'baixa' : 
                               prioridade === 'Media' ? 'media' : 
                               prioridade === 'Alta' ? 'alta' : 
                               prioridade === 'Urgente' ? 'urgente' : 'media';
        
        return `
            <tr>
                <td>${denuncia.id}</td>
                <td>${denuncia.tipo}</td>
                <td>${denuncia.endereco}</td>
                <td><span class="status-badge status-${statusClass}">${status}</span></td>
                <td><span class="prioridade-badge prioridade-${prioridadeClass}">${prioridade}</span></td>
                <td>${dataDenuncia.toLocaleDateString('pt-BR')}</td>
                <td>
                    <div class="action-buttons-small">
                        <button onclick="openDenunciaModal(${denuncia.id})" class="btn btn-primary btn-small">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteDenuncia(${denuncia.id})" class="btn btn-danger btn-small">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openDenunciaModal(denunciaId) {
    const denuncia = currentDenuncias.find(d => d.id === denunciaId);
    if (!denuncia) {
        alert('Denúncia não encontrada');
        return;
    }

    currentDenunciaId = denunciaId;
    
    document.getElementById('modalDenunciaId').textContent = denuncia.id;
    document.getElementById('modalDenunciaTipo').textContent = denuncia.tipo;
    document.getElementById('modalDenunciaEndereco').textContent = denuncia.endereco;
    document.getElementById('modalDenunciaDescricao').textContent = denuncia.descricao;
    
    document.getElementById('statusSelect').value = denuncia.status || 'Pendente';
    document.getElementById('prioridadeSelect').value = denuncia.prioridade || 'Media';
    document.getElementById('comentarioInput').value = '';
    
    document.getElementById('denunciaModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('denunciaModal').style.display = 'none';
    currentDenunciaId = null;
}

async function updateStatus() {
    if (!currentDenunciaId) return;
    
    const novoStatus = document.getElementById('statusSelect').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/denuncias/${currentDenunciaId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (response.ok) {
            alert('Status atualizado com sucesso!');
            closeModal();
            loadDenuncias();
            loadDashboard();
        } else {
            const error = await response.json();
            alert('Erro ao atualizar status: ' + error.error);
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status');
    }
}

async function updatePrioridade() {
    if (!currentDenunciaId) return;
    
    const novaPrioridade = document.getElementById('prioridadeSelect').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/denuncias/${currentDenunciaId}/prioridade`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prioridade: novaPrioridade })
        });

        if (response.ok) {
            alert('Prioridade atualizada com sucesso!');
            closeModal();
            loadDenuncias();
        } else {
            const error = await response.json();
            alert('Erro ao atualizar prioridade: ' + error.error);
        }
    } catch (error) {
        console.error('Erro ao atualizar prioridade:', error);
        alert('Erro ao atualizar prioridade');
    }
}

async function addComentario() {
    if (!currentDenunciaId) return;
    
    const comentario = document.getElementById('comentarioInput').value.trim();
    if (!comentario) {
        alert('Digite um comentário');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/denuncias/${currentDenunciaId}/comentario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comentario: comentario })
        });

        if (response.ok) {
            alert('Comentário adicionado com sucesso!');
            document.getElementById('comentarioInput').value = '';
        } else {
            const error = await response.json();
            alert('Erro ao adicionar comentário: ' + error.error);
        }
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        alert('Erro ao adicionar comentário');
    }
}

async function deleteDenuncia(denunciaId) {
    // 1. Confirmação com o usuário
    if (!confirm(`Tem certeza que deseja excluir a denúncia #${denunciaId}?`)) {
        return;
    }
    
    try {
        // 2. Faz a chamada para a rota que criamos no index.js
        const response = await fetch(`http://localhost:3000/api/denuncias/${denunciaId}`, {
            method: 'DELETE'
        });

        // 3. Verifica se a resposta foi bem-sucedida
        if (response.ok) {
            const result = await response.json();
            alert(result.message || 'Denúncia excluída com sucesso!');
            
            // 4. Atualiza a interface sem precisar de refresh manual
            loadDenuncias();
            loadDashboard();
        } else {
            // Se o servidor respondeu com erro (404, 500, etc), tentamos ler a mensagem
            const errorData = await response.json();
            alert('Erro ao excluir: ' + (errorData.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro na requisição DELETE:', error);
        alert('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
    }
}

function refreshDenuncias() {
    loadDenuncias();
}

async function filterByStatus() {
    const status = document.getElementById('statusFilter').value;
    
    if (!status) {
        displayDenuncias(currentDenuncias);
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/denuncias/status/${status}`);
        if (response.ok) {
            const denuncias = await response.json();
            displayDenuncias(denuncias);
        } else {
            alert('Erro ao filtrar por status');
        }
    } catch (error) {
        console.error('Erro ao filtrar por status:', error);
        alert('Erro ao filtrar por status');
    }
}

async function filterByTipo() {
    const tipo = document.getElementById('tipoFilter').value;
    
    if (!tipo) {
        displayDenuncias(currentDenuncias);
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/denuncias/tipo/${tipo}`);
        if (response.ok) {
            const denuncias = await response.json();
            displayDenuncias(denuncias);
        } else {
            alert('Erro ao filtrar por tipo');
        }
    } catch (error) {
        console.error('Erro ao filtrar por tipo:', error);
        alert('Erro ao filtrar por tipo');
    }
}

function filterByPrioridade() {
    const prioridade = document.getElementById('prioridadeFilter').value;
    
    if (!prioridade) {
        displayDenuncias(currentDenuncias);
        return;
    }
    
    const denunciasFiltradas = currentDenuncias.filter(d => 
        (d.prioridade || 'Media') === prioridade
    );
    
    displayDenuncias(denunciasFiltradas);
}

async function loadEstatisticas() {
    // Garantir que a seção de estatísticas seja visível
    const estatisticasSection = document.getElementById('estatisticas');
    if (estatisticasSection) {
        estatisticasSection.style.display = 'block';
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/denuncias');
        if (!response.ok) {
            throw new Error('Erro ao carregar estatísticas');
        }

        const denuncias = await response.json();
        createCharts(denuncias);
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        alert('Erro ao carregar estatísticas');
    }
}

function createCharts(denuncias) {
    // Sempre criar fallback primeiro, depois tentar Chart.js
    createFallbackCharts(denuncias);
    
    // Se Chart.js estiver disponível, criar gráficos
    if (typeof Chart !== 'undefined') {
        setTimeout(() => {
            createTipoChart(denuncias);
            createMesChart(denuncias);
        }, 100);
    }
}

function createFallbackCharts(denuncias) {
    // Restaurar HTML original dos gráficos
    const chartsContainer = document.querySelector('.charts-container');
    if (chartsContainer) {
        chartsContainer.innerHTML = `
            <div class="chart-card">
                <h3>Denúncias por Tipo</h3>
                <div class="chart-container">
                    <canvas id="tipoChart" width="400" height="300"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Denúncias por Mês</h3>
                <div class="chart-container">
                    <canvas id="mesChart" width="400" height="300"></canvas>
                </div>
            </div>
        `;
    }
    
    // Fallback para gráfico de tipos
    const tipoContainer = document.querySelector('.chart-card:first-child .chart-container');
    if (tipoContainer) {
        const tipos = {};
        denuncias.forEach(denuncia => {
            tipos[denuncia.tipo] = (tipos[denuncia.tipo] || 0) + 1;
        });
        
        let html = '<div class="fallback-chart"><h4>Denúncias por Tipo</h4><ul>';
        Object.entries(tipos).forEach(([tipo, count]) => {
            html += `<li><strong>${tipo}:</strong> ${count} denúncias</li>`;
        });
        html += '</ul></div>';
        
        tipoContainer.innerHTML = html;
    }
    
    // Fallback para gráfico de mês
    const mesContainer = document.querySelector('.chart-card:last-child .chart-container');
    if (mesContainer) {
        const meses = {};
        denuncias.forEach(denuncia => {
            const data = new Date(denuncia.data_denuncia);
            const mes = data.getMonth() + 1;
            const chave = `${mes}/${data.getFullYear()}`;
            meses[chave] = (meses[chave] || 0) + 1;
        });
        
        let html = '<div class="fallback-chart"><h4>Denúncias por Mês</h4><ul>';
        Object.entries(meses).sort().forEach(([mes, count]) => {
            html += `<li><strong>${mes}:</strong> ${count} denúncias</li>`;
        });
        html += '</ul></div>';
        
        mesContainer.innerHTML = html;
    }
}

function createTipoChart(denuncias) {
    const canvas = document.getElementById('tipoChart');
    if (!canvas) {
        console.error('Canvas tipoChart não encontrado');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    const tipos = {};
    denuncias.forEach(denuncia => {
        tipos[denuncia.tipo] = (tipos[denuncia.tipo] || 0) + 1;
    });
    
    const labels = Object.keys(tipos);
    const data = Object.values(tipos);
    
    // Destruir gráfico existente se houver
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    try {
        canvas.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico de tipos:', error);
    }
}

function createMesChart(denuncias) {
    const canvas = document.getElementById('mesChart');
    if (!canvas) {
        console.error('Canvas mesChart não encontrado');
        return;
    }
    
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    const meses = {};
    denuncias.forEach(denuncia => {
        const data = new Date(denuncia.data_denuncia);
        const mes = data.getMonth() + 1;
        const chave = `${mes}/${data.getFullYear()}`;
        meses[chave] = (meses[chave] || 0) + 1;
    });
    
    const labels = Object.keys(meses).sort();
    const data = labels.map(label => meses[label]);
    
    // Destruir gráfico existente se houver
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    try {
        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Denúncias',
                    data: data,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico de mês:', error);
    }
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

window.onclick = function(event) {
    const modal = document.getElementById('denunciaModal');
    if (event.target === modal) {
        closeModal();
    }
}
