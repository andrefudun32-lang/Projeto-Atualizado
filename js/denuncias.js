document.addEventListener("DOMContentLoaded", () => {
    // 1. Recuperar o usuário logado (ajuste 'usuarioLogado' para a chave que você usa)
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const ehFuncionario = usuarioLogado && usuarioLogado.tipo === "funcionario";

    fetch("http://localhost:3000/api/denuncias")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erro HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const tbody = document.querySelector("#tabelaDenuncias tbody");
        const theadTr = document.querySelector("#tabelaDenuncias thead tr");

        if (!tbody) {
          console.error("Elemento #tabelaDenuncias tbody não encontrado");
          return;
        }

        // 2. Adicionar cabeçalho de "Ações" se for funcionário e ainda não existir
        if (ehFuncionario && theadTr && !document.querySelector("#col-acoes")) {
          const th = document.createElement("th");
          th.id = "col-acoes";
          th.textContent = "Ações";
          theadTr.appendChild(th);
        }
        
        tbody.innerHTML = "";
  
        if (!Array.isArray(data)) {
          console.error("Dados recebidos não são um array:", data);
          tbody.innerHTML = "<tr><td colspan='7'>Formato de dados inválido</td></tr>";
          return;
        }
  
        if (data.length === 0) {
          tbody.innerHTML = "<tr><td colspan='8'>Nenhuma denúncia encontrada.</td></tr>";
          return;
        }
  
        data.forEach(denuncia => {
          const tr = document.createElement("tr");
          const status = denuncia.status || 'Pendente';
          const statusClass = status === 'Pendente' ? 'pendente' : 
                               status === 'Em Andamento' ? 'andamento' : 
                               status === 'Resolvida' ? 'resolvida' : 'pendente';
          
          // Conteúdo base da linha
          let htmlConteudo = `
            <td>${denuncia.id}</td>
            <td>${denuncia.tipo}</td>
            <td>${denuncia.endereco}</td>
            <td>${denuncia.referencia || "-"}</td>
            <td>${denuncia.descricao}</td>
            <td><span class="status-badge status-${statusClass}">${status}</span></td>
            <td>Anônimo</td>
            <td>${denuncia.foto ? 'Com foto' : 'Sem foto'}</td>
          `;

          // 3. Se for funcionário, adiciona a célula com o botão de editar
          if (ehFuncionario) {
            htmlConteudo += `
              <td>
                <button class="btn-editar" onclick="abrirEdicao(${denuncia.id})">
                  <i class="fas fa-edit"></i> Editar
                </button>
              </td>
            `;
          }

          tr.innerHTML = htmlConteudo;
          tbody.appendChild(tr);
        });
        
        console.log(`${data.length} denúncias carregadas com sucesso!`);
      })
      .catch(err => {
        console.error("Erro ao carregar denúncias:", err);
        const tbody = document.querySelector("#tabelaDenuncias tbody");
        if (tbody) {
          tbody.innerHTML = "<tr><td colspan='7'>Erro ao conectar com o banco de dados.</td></tr>";
        }
      });
});

// 4. Função para lidar com o clique (você pode colocar no js/admin-dashboard.js)
function abrirEdicao(id) {
    console.log("Editando denúncia ID:", id);
    // Aqui você pode abrir um modal ou redirecionar para uma página de edição
    // Ex: window.location.href = `editar-denuncia.html?id=${id}`;
}
