function aplicarModoEscuro() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        } catch (error) {
            console.error('Erro ao carregar configurações do modo escuro:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', aplicarModoEscuro);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarModoEscuro);
} else {
    aplicarModoEscuro();
}

function alternarModoEscuro() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDarkMode) {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    const savedSettings = localStorage.getItem('userSettings');
    let settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.darkMode = !isDarkMode;
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

window.aplicarModoEscuro = aplicarModoEscuro;
window.alternarModoEscuro = alternarModoEscuro;
