document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/api/denuncias")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erro HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const tbody = document.querySelector("#tabelaDenuncias tbody");
        if (!tbody) {
          console.error("Elemento #tabelaDenuncias tbody não encontrado");
          return;
        }
        
        tbody.innerHTML = "";
  
        // Verificar se data é um array
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
          
          tr.innerHTML = `
            <td>${denuncia.id}</td>
            <td>${denuncia.tipo}</td>
            <td>${denuncia.endereco}</td>
            <td>${denuncia.referencia || "-"}</td>
            <td>${denuncia.descricao}</td>
            <td><span class="status-badge status-${statusClass}">${status}</span></td>
            <td>Anônimo</td>
            <td>${denuncia.foto ? 'Com foto' : 'Sem foto'}</td>
          `;
          tbody.appendChild(tr);
        });
        
        console.log(`${data.length} denúncias carregadas com sucesso!`);
      })
      .catch(err => {
        console.error("Erro ao carregar denúncias:", err);
        const tbody = document.querySelector("#tabelaDenuncias tbody");
        if (tbody) {
          tbody.innerHTML = "<tr><td colspan='7'>Erro ao conectar com o banco de dados. Verifique se o servidor está rodando.</td></tr>";
        }
      });
  });
  
