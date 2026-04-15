// Função para verificar se o usuário tem permissão
function checkAdminLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioLogado);
    // Permite admin, Administrador ou funcionario
    if (usuario.tipo !== 'admin' && usuario.tipo !== 'Administrador' && usuario.tipo !== 'funcionario') {
        alert('Acesso negado. Apenas funcionários podem acessar esta página.');
        window.location.href = 'inicial-logado.html';
    } else {
        // Atualiza o nome do usuário no topo do painel
        const userDisplay = document.querySelector('.user-info span') || document.querySelector('.admin-name');
        if (userDisplay) userDisplay.textContent = usuario.nome;
    }
}

// FUNÇÃO PARA ALTERNAR AS SEÇÕES (O que está dando erro no seu console)
window.showSection = function(sectionId) {
    console.log("Alterando para seção:", sectionId);
    
    // Esconde todas as seções
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Mostra a seção clicada
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block';
    }

    // Remove a classe 'active' de todos os links do menu
    const menuLinks = document.querySelectorAll('.sidebar ul li');
    menuLinks.forEach(link => link.classList.remove('active'));

    // Adiciona 'active' no link clicado (opcional, para feedback visual)
    const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeLink) activeLink.parentElement.classList.add('active');
}

// Função para buscar dados do banco e preencher os cards
async function carregarDadosDashboard() {
    try {
        const response = await fetch('http://localhost:3000/api/denuncias');
        if (!response.ok) throw new Error('Erro na rede');
        
        const denuncias = await response.json();

        // Atualiza os números nos cards
        document.getElementById('total-denuncias').textContent = denuncias.length;
        document.getElementById('pendentes').textContent = denuncias.filter(d => d.status === 'Pendente').length;
        document.getElementById('em-andamento').textContent = denuncias.filter(d => d.status === 'Em Andamento').length;
        document.getElementById('resolvidas').textContent = denuncias.filter(d => d.status === 'Resolvida').length;

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        // Em caso de erro, mantém o "!" ou coloca "0"
    }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    checkAdminLogin();
    carregarDadosDashboard();
    
    // Garante que o Dashboard comece visível
    showSection('dashboard');
});
// --- FUNÇÃO DE LOGOUT (SAIR) ---

// Espera o DOM carregar para garantir que o botão exista
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o botão de sair pelo texto ou pela classe
    // No seu HTML ele parece ser um <button> ou <a> com o texto "Sair"
    const btnSair = document.querySelector('.logout-btn') || 
                    document.querySelector('button:contains("Sair")') ||
                    document.querySelector('.btn-sair'); // Ajuste conforme sua classe real

    // Se o seletor acima não funcionar, podemos buscar pelo conteúdo:
    const todosBotoes = document.querySelectorAll('button');
    const botaoSairReal = Array.from(todosBotoes).find(btn => btn.textContent.includes('Sair'));

    if (botaoSairReal) {
        botaoSairReal.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Limpa os dados do usuário logado
            localStorage.removeItem('usuarioLogado');
            
            // 2. Opcional: Limpar tudo se não tiver outros dados importantes
            // localStorage.clear(); 

            alert('Sessão encerrada com sucesso!');

            // 3. Redireciona para a tela de login
            window.location.href = 'login.html';
        });
    }
});
