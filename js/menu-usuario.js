// Configurações do usuário
let userSettings = {
    darkMode: false,
    emailNotifications: true,
    browserNotifications: false,
    anonymousReports: true
};

// Carregar configurações salvas
function carregarConfiguracoes() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
    }
    
    // Aplicar configurações aos elementos da interface
    document.getElementById('darkModeToggle').checked = userSettings.darkMode;
    document.getElementById('emailNotifications').checked = userSettings.emailNotifications;
    document.getElementById('browserNotifications').checked = userSettings.browserNotifications;
    document.getElementById('anonymousReports').checked = userSettings.anonymousReports;
    
    // Aplicar modo escuro se estiver ativado
    if (userSettings.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Salvar configurações
function salvarConfiguracoes() {
    // Atualizar objeto de configurações com valores atuais
    userSettings.darkMode = document.getElementById('darkModeToggle').checked;
    userSettings.emailNotifications = document.getElementById('emailNotifications').checked;
    userSettings.browserNotifications = document.getElementById('browserNotifications').checked;
    userSettings.anonymousReports = document.getElementById('anonymousReports').checked;
    
    // Salvar no localStorage
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    // Aplicar modo escuro
    if (userSettings.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    // Mostrar feedback visual
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
        
        // Aplicar configurações padrão aos elementos
        document.getElementById('darkModeToggle').checked = false;
        document.getElementById('emailNotifications').checked = true;
        document.getElementById('browserNotifications').checked = false;
        document.getElementById('anonymousReports').checked = true;
        
        // Remover modo escuro
        document.documentElement.removeAttribute('data-theme');
        
        // Salvar no localStorage
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
    
    // Salvar automaticamente a mudança
    userSettings.darkMode = isDarkMode;
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
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
    
    // Adicionar estilos inline para a notificação
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
    
    // Adicionar ao body
    document.body.appendChild(notificacao);
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.remove();
        }
    }, 3000);
}

// Obter ícone da notificação
function getIconeNotificacao(tipo) {
    switch (tipo) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Adicionar estilos CSS para animação da notificação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notificacao-conteudo {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
    }
    
    .notificacao-fechar {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .notificacao-fechar:hover {
        background-color: rgba(255,255,255,0.2);
    }
`;
document.head.appendChild(style);

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar configurações ao iniciar
    carregarConfiguracoes();
    
    // Event listener para o toggle do modo escuro
    document.getElementById('darkModeToggle').addEventListener('change', alternarModoEscuro);
    
    // Event listeners para outros toggles (opcional - salvar automaticamente)
    document.getElementById('emailNotifications').addEventListener('change', function() {
        userSettings.emailNotifications = this.checked;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    });
    
    document.getElementById('browserNotifications').addEventListener('change', function() {
        userSettings.browserNotifications = this.checked;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    });
    
    document.getElementById('anonymousReports').addEventListener('change', function() {
        userSettings.anonymousReports = this.checked;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    });
});

// Função para aplicar modo escuro em outras páginas
function aplicarModoEscuro() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
}

// Exportar função para uso em outras páginas
window.aplicarModoEscuro = aplicarModoEscuro;
