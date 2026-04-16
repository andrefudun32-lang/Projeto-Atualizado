// 1. Lista de xingamentos
const palavrasProibidas = ["xingamento1", "palavraimpropria", "termoofensivo"];

function temOfensa(texto) {
    if (!texto) return false;
    const textoMinusculo = texto.toLowerCase();
    return palavrasProibidas.some(palavra => textoMinusculo.includes(palavra.toLowerCase()));
}

window.onload = function() {
    const form = document.querySelector('form');
    
    if (!form) {
        console.error("Erro: Formulário não encontrado!");
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        console.log("Iniciando validação e conversão de imagem...");

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

        // --- NOVA VALIDAÇÃO 3: Verificar se há número no endereço ---
        const temNumeroNoEndereco = /\d/.test(conteudoEndereco);
        if (!temNumeroNoEndereco) {
            alert("⚠️ Por favor, informe o número no campo de endereço (ex: Rua das Flores, 123).");
            if (enderecoInput) {
                enderecoInput.focus();
                enderecoInput.style.borderColor = "red";
            }
            return; // Interrompe o envio
        } else {
            if (enderecoInput) enderecoInput.style.borderColor = ""; // Reseta a cor se estiver ok
        }

        // --- PROCESSO DE CONVERSÃO DA IMAGEM ---
        const leitor = new FileReader();
        leitor.readAsDataURL(fotoInput.files[0]); 

        leitor.onload = function() {
            const fotoBase64 = leitor.result;

            const dadosDenuncia = {
                tipo: tipoInput ? tipoInput.value : "Geral",
                endereco: conteudoEndereco,
                referencia: referenciaInput ? referenciaInput.value : "-",
                descricao: conteudoDescricao,
                foto: fotoBase64 
            };

            fetch("http://localhost:3000/api/denuncias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosDenuncia)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || "Erro no servidor"); });
                }
                return res.json();
            })
            .then(data => {
                alert("Denúncia criada com sucesso!");
                window.location.href = "denuncias.html"; 
            })
            .catch(err => {
                console.error("Erro no envio:", err);
                alert("Falha ao enviar: " + err.message);
            });
        };

        leitor.onerror = function() {
            alert("Erro ao processar a imagem. Tente outro arquivo.");
        };
    });
};
