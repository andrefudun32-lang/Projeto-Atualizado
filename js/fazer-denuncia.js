document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("denunciaForm");

    if (formulario) {
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btnSubmit = document.getElementById("btnSubmit");
            const btnText = document.getElementById("btn-text");
            const btnLoading = document.getElementById("btn-loading");

            // Coleta de dados
            const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
            const tipo = document.getElementById("tipoDenuncia").value;
            const endereco = document.getElementById("endereco").value;
            const referencia = document.getElementById("referencia").value;
            const descricao = document.getElementById("descricao").value;
            const fotoFile = document.getElementById("foto").files[0];

            // --- VALIDAÇÕES ANTES DO ENVIO ---

            // 1. Validar se há número no endereço
            const temNumero = /\d/.test(endereco);
            if (!temNumero) {
                alert("Por favor, informe o número da residência ou local no endereço.");
                document.getElementById("endereco").focus();
                return;
            }

            // 2. Validar foto
            if (!fotoFile) {
                alert("Por favor, anexe uma foto.");
                return;
            }

            // Início do feedback visual (Só acontece se passar nas validações acima)
            btnText.style.display = "none";
            btnLoading.style.display = "inline";
            btnSubmit.disabled = true;

            try {
                // Converter imagem em Base64
                const converterParaBase64 = (file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = (error) => reject(error);
                    });
                };

                const base64Foto = await converterParaBase64(fotoFile);

                const dados = {
                    tipo,
                    endereco,
                    referencia,
                    descricao,
                    foto: base64Foto,
                    usuario_id: usuario ? usuario.id : null,
                    usuario_nome: usuario ? usuario.nome : "Anônimo"
                };

                const response = await fetch("http://localhost:3000/api/denuncias", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                const textoResposta = await response.text();
                let resultado;
                
                try {
                    resultado = JSON.parse(textoResposta);
                } catch (e) {
                    throw new Error("O servidor enviou uma resposta inválida (HTML em vez de JSON). Verifique se o servidor está rodando.");
                }

                if (response.ok) {
                    alert("Denúncia enviada com sucesso!");
                    window.location.href = "inicial-logado.html";
                } else {
                    throw new Error(resultado.mensagem || "Erro ao registrar no servidor");
                }

            } catch (error) {
                console.error("Erro no envio:", error);
                alert("Falha ao enviar: " + error.message);
                
                // Restaura o botão em caso de erro
                btnText.style.display = "inline";
                btnLoading.style.display = "none";
                btnSubmit.disabled = false;
            }
        });
    }

    // Contador de caracteres
    const campoDescricao = document.getElementById("descricao");
    const contador = document.getElementById("char-count");
    
    if (campoDescricao && contador) {
        campoDescricao.addEventListener("input", function() {
            contador.textContent = this.value.length;
        });
    }
});
