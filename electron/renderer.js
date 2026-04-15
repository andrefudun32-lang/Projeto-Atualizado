document.addEventListener('DOMContentLoaded', () => {
    console.log('Renderer carregado 🚀');

    const btn = document.querySelector('#btnTeste');

    if (btn) {
        btn.addEventListener('click', () => {
            criarDenunciaTeste();
        });
    }
});

function criarDenunciaTeste() {
    const denuncia = {
        id: Date.now(),
        titulo: "Buraco na rua",
        descricao: "Existe um buraco grande na via principal",
        status: "pendente"
    };

    let denuncias = JSON.parse(localStorage.getItem('denuncias')) || [];

    denuncias.push(denuncia);

    localStorage.setItem('denuncias', JSON.stringify(denuncias));

    alert('Denúncia criada com sucesso 🚀');
}