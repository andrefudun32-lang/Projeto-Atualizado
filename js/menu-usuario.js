// Configurações do usuário
let userSettings = {
    darkMode: false,
    emailNotifications: true,
    browserNotifications: false,
    anonymousReports: true
};

// --- FUNÇÃO ATUALIZADA: Carregar Dados do Usuário Logado ---
function atualizarDadosUsuario() {
    const dadosUsuario = localStorage.getItem('usuarioLogado');
    
    if (dadosUsuario) {
        const usuario = JSON.parse(dadosUsuario);

        // 1. Atualiza a saudação no topo
        const elementoSaudacao = document.getElementById('nome-display') || 
                                 document.querySelector('.user-info span');
        if (elementoSaudacao && usuario.nome) {
            elementoSaudacao.textContent = `Bem-vindo, ${usuario.nome}!`;
        }

        // 2. Atualiza o campo "Nome de Usuário" na seção de Conta
        const campoNomeConta = document.getElementById('display-username');
        if (campoNomeConta && usuario.nome) {
            campoNomeConta.textContent = usuario.nome;
        }

        // 3. Atualiza o campo "Email" na seção de Conta
        const campoEmailConta = document.getElementById('display-email');
        if (campoEmailConta && usuario.email) {
            campoEmailConta.textContent = usuario.email;
        }
    }
}

// --- NOVAS FUNÇÕES: Editar Conta ---

function toggleEdit(campo) {
    const displayEl = document.getElementById(`display-${campo}`);
    const inputEl = document.getElementById(`edit-${campo}`);
    const btnText = document.getElementById(`btn-text-${campo}`);
    const iconEl = document.getElementById(`icon-${campo}`);
    
    // Se está visualizando, muda para modo de edição
    if (inputEl.style.display === "none") {
        inputEl.value = displayEl.textContent; // Copia o texto atual para o input
        displayEl.style.display = "none";
        inputEl.style.display = "block";
        btnText.textContent = "Salvar";
        if(iconEl) iconEl.className = "fas fa-save";
        inputEl.focus();
    } 
    // Se já está editando, clica para Salvar
    else {
        // Envia para o servidor e atualiza localStorage
        atualizarDadosNoServidor(campo, inputEl.value);
        
        // Volta para o modo de visualização
        displayEl.textContent = inputEl.value;
        displayEl.style.display = "block";
        inputEl.style.display = "none";
        btnText.textContent = "Editar";
        if(iconEl) iconEl.className = "fas fa-edit";
    }
}

async function atualizarDadosNoServidor(campo, novoValor) {
    const dadosSalvos = localStorage.getItem('usuarioLogado');
    if (!dadosSalvos) return;
    
    const usuario = JSON.parse(dadosSalvos);
    
    try {
        // Envia a atualização para sua API Node.js (Exemplo de rota)
        const response = await fetch('http://localhost:3000/atualizar-perfil', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: usuario.id, // Certifique-se de que o id está sendo salvo no login
                campo: campo, // 'username' ou 'email'
                valor: novoValor
            })
        });

        if (response.ok) {
            // Se o servidor confirmou, atualiza o localStorage
            if (campo === 'username') {
                usuario.nome = novoValor;
            } else if (campo === 'email') {
                usuario.email = novoValor;
            }
            
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            
            // Atualiza os textos da tela imediatamente
            atualizarDadosUsuario();
            mostrarNotificacao('Dados atualizados com sucesso!', 'success');
        } else {
            mostrarNotificacao('Erro ao salvar no banco de dados.', 'error');
            // Reverte o valor visual se deu erro no servidor
            atualizarDadosUsuario(); 
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        mostrarNotificacao('Erro de conexão com o servidor. O servidor Node está rodando?', 'error');
        atualizarDadosUsuario(); // Reverte visualmente
    }
}

// Carregar configurações salvas
function carregarConfiguracoes() {
    atualizarDadosUsuario();

    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
    }
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    const emailToggle = document.getElementById('emailNotifications');
    const browserToggle = document.getElementById('browserNotifications');
    const reportsToggle = document.getElementById('anonymousReports');

    if (darkModeToggle) darkModeToggle.checked = userSettings.darkMode;
    if (emailToggle) emailToggle.checked = userSettings.emailNotifications;
    if (browserToggle) browserToggle.checked = userSettings.browserNotifications;
    if (reportsToggle) reportsToggle.checked = userSettings.anonymousReports;
    
    if (userSettings.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Salvar configurações gerais
function salvarConfiguracoes() {
    userSettings.darkMode = document.getElementById('darkModeToggle').checked;
    userSettings.emailNotifications = document.getElementById('emailNotifications').checked;
    userSettings.browserNotifications = document.getElementById('browserNotifications').checked;
    userSettings.anonymousReports = document.getElementById('anonymousReports').checked;
    
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    if (userSettings.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    mostrarNotificacao('Configurações salvas com sucesso!', 'success');
}

// Resetar configurações para padrão
function resetarConfiguracoes() {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
        userSettings = {
            darkMode: false,
            emailNotifications: true,
            browserNotifications: false,
            anonymousReports: true
        };
        
        document.getElementById('darkModeToggle').checked = false;
        document.getElementById('emailNotifications').checked = true;
        document.getElementById('browserNotifications').checked = false;
        document.getElementById('anonymousReports').checked = true;
        
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        
        mostrarNotificacao('Configurações restauradas para o padrão!', 'info');
    }
}

// Alternar modo escuro
function alternarModoEscuro() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = darkModeToggle.checked;
    
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    userSettings.darkMode = isDarkMode;
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <i class="fas ${getIconeNotificacao(tipo)}"></i>
            <span>${mensagem}</span>
        </div>
        <button class="notificacao-fechar" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        if (notificacao.parentElement) notificacao.remove();
    }, 3000);
}

function getIconeNotificacao(tipo) {
    switch (tipo) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Estilos da notificação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .notificacao-conteudo { display: flex; align-items: center; gap: 8px; flex: 1; }
    .notificacao-fechar { background: none; border: none; color: white; cursor: pointer; padding: 4px; border-radius: 4px; }
`;
document.head.appendChild(style);

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    carregarConfiguracoes();
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', alternarModoEscuro);
    }
    
    ['emailNotifications', 'browserNotifications', 'anonymousReports'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', function() {
                userSettings[id] = this.checked;
                localStorage.setItem('userSettings', JSON.stringify(userSettings));
            });
        }
    });

    const btnSair = document.getElementById('btn-sair') || 
                    document.querySelector('.btn-filled') || 
                    document.querySelector('button[onclick*="Sair"]');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = "login.html";
        });
    }
});

function aplicarModoEscuro() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
}
window.aplicarModoEscuro = aplicarModoEscuro;