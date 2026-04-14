// 1. Lista de xingamentos/termos proibidos (adicione mais palavras entre aspas separadas por vírgula)
const palavrasProibidas = ["xingamento1", "palavraimpropria", "termoofensivo"];

// Seleciona os elementos do DOM
const form = document.querySelector('form');
const fotoInput = document.getElementById('foto'); 
const enderecoInput = document.querySelector('input[placeholder*="Rua das Flores"]'); // Seleciona pelo placeholder se não tiver ID
const descricaoInput = document.querySelector('textarea'); // Seleciona a descrição

// Função auxiliar para verificar ofensas
function temOfensa(texto) {
    const textoMinusculo = texto.toLowerCase();
    return palavrasProibidas.some(palavra => textoMinusculo.includes(palavra.toLowerCase()));
}

// Adiciona o evento de submissão
form.addEventListener('submit', function(event) {
    
    // VALIDAÇÃO 1: Foto (sua regra anterior)
    if (fotoInput.files.length === 0) {
        event.preventDefault();
        alert("Adicione uma foto da sua denuncia para continuar");
        fotoInput.focus();
        return; // Para a execução aqui
    }

    // VALIDAÇÃO 2: Xingamentos no Endereço ou Descrição
    const conteudoEndereco = enderecoInput ? enderecoInput.value : "";
    const conteudoDescricao = descricaoInput ? descricaoInput.value : "";

    if (temOfensa(conteudoEndereco) || temOfensa(conteudoDescricao)) {
        event.preventDefault();
        alert("Sua denúncia contém palavras impróprias. Por favor, utilize uma linguagem respeitosa para que possamos ajudar Pelotas.");
        
        // Foca no campo que provavelmente tem o problema
        if (temOfensa(conteudoDescricao)) {
            descricaoInput.focus();
        } else {
            enderecoInput.focus();
        }
    }
});