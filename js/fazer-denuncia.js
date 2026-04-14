// 1. Lista de xingamentos
const palavrasProibidas = ["xingamento1", "palavraimpropria", "termoofensivo"];

function temOfensa(texto) {
    if (!texto) return false;
    const textoMinusculo = texto.toLowerCase();
    return palavrasProibidas.some(palavra => textoMinusculo.includes(palavra.toLowerCase()));
}

// Usamos window.onload para garantir que o HTML carregou todo antes de procurar os campos
window.onload = function() {
    const form = document.querySelector('form');
    
    if (!form) {
        console.error("Erro: Formulário não encontrado no HTML!");
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Para o envio padrão para podermos validar
        console.log("Botão clicado, iniciando validação...");

        // Captura os campos dentro do evento para garantir que pegamos os valores atuais
        const fotoInput = document.getElementById('foto') || document.querySelector('input[type="file"]');
        const enderecoInput = document.querySelector('input[placeholder*="Rua das Flores"]');
        const descricaoInput = document.querySelector('textarea');
        const tipoInput = document.querySelector('select');
        const referenciaInput = document.querySelector('input[placeholder*="opcional"]');

        // VALIDAÇÃO 1: Foto
        if (!fotoInput || fotoInput.files.length === 0) {
            alert("Adicione uma foto da sua denúncia para continuar");
            return; 
        }

        // VALIDAÇÃO 2: Xingamentos
        const conteudoEndereco = enderecoInput ? enderecoInput.value : "";
        const conteudoDescricao = descricaoInput ? descricaoInput.value : "";

        if (temOfensa(conteudoEndereco) || temOfensa(conteudoDescricao)) {
            alert("Sua denúncia contém palavras impróprias. Por favor, utilize uma linguagem respeitosa.");
            return; 
        }

        // DADOS PARA O BACKEND
        const dadosDenuncia = {
            tipo: tipoInput ? tipoInput.value : "Geral",
            endereco: conteudoEndereco,
            referencia: referenciaInput ? referenciaInput.value : "-",
            descricao: conteudoDescricao,
            status: "Pendente",
            foto: fotoInput.files[0].name
        };

        // ENVIO PARA A API
        fetch("http://localhost:3000/api/denuncias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosDenuncia)
        })
        .then(res => {
            if (!res.ok) throw new Error("Erro no servidor");
            return res.json();
        })
        .then(data => {
            alert("Denúncia criada com sucesso!");
            window.location.href = "denuncias.html"; 
        })
        .catch(err => {
            console.error("Erro:", err);
            alert("Erro ao conectar com o servidor. Verifique se o backend está ligado na porta 3000.");
        });
    });
};
