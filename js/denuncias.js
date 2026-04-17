document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const ehFuncionario = usuarioLogado && (usuarioLogado.tipo === "funcionario" || usuarioLogado.origem === "funcionario");

    // Busca as denúncias usando a URL completa com /api/
    fetch("http://localhost:3000/api/denuncias")
      .then(res => {
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const tbody = document.querySelector("#tabela-denuncias tbody");
        if (!tbody) return;

        tbody.innerHTML = "";
  
        if (data.length === 0) {
          tbody.innerHTML = "<tr><td colspan='9'>Nenhuma denúncia encontrada.</td></tr>";
          return;
        }
  
        data.forEach(denuncia => {
          const tr = document.createElement("tr");
          const status = denuncia.status || 'Pendente';
          
          let htmlConteudo = `
            <td>#${denuncia.id}</td>
            <td>${denuncia.tipo}</td>
            <td>${denuncia.endereco}</td>
            <td>${denuncia.referencia || "-"}</td>
            <td>${denuncia.descricao}</td>
            <td><span class="status-badge">${status}</span></td>
            <td>${denuncia.usuario_nome || "Anônimo"}</td>
            <td>${denuncia.foto ? '✅ Sim' : '❌ Não'}</td>
          `;

          // Se for funcionário, adiciona o botão de excluir
          if (ehFuncionario) {
            htmlConteudo += `
              <td>
                <button onclick="excluirDenuncia(${denuncia.id})" style="background: #ff4d4d; color: white; border: none; padding: 5px; cursor: pointer;">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            `;
          }

          tr.innerHTML = htmlConteudo;
          tbody.appendChild(tr);
        });
      })
      .catch(err => {
        console.error("Erro ao carregar:", err);
      });
});

// Nova função de exclusão integrada ao backend
function excluirDenuncia(id) {
    if (confirm(`Deseja realmente excluir a denúncia #${id}?`)) {
        fetch(`http://localhost:3000/api/denuncias/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao excluir");
            return res.json();
        })
        .then(data => {
            alert(data.mensagem);
            location.reload(); // Atualiza a tabela
        })
        .catch(err => alert("Erro ao tentar excluir: " + err.message));
    }
}
