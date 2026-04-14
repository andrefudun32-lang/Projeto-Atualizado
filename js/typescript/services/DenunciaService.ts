// SERVIÇO DE DENÚNCIAS TYPESCRIPT
// Gerencia operações relacionadas a denúncias
// Implementa polimorfismo para diferentes tipos de usuário

import { Denuncia } from '../Denuncia';
import { Usuario } from '../Usuario';
import { UsuarioAdm } from '../UsuarioAdm';
import { TipoDenuncia } from '../enums/TipoDenuncia';
import { StatusDenuncia } from '../enums/StatusDenuncia';

export class DenunciaService {
  private baseUrl: string = 'http://localhost:3000/api'; // URL base da API

  // Método para criar denúncia (polimórfico - funciona diferente para usuários e admins)
  public async criarDenuncia(denuncia: Denuncia, usuario: Usuario | UsuarioAdm): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validação específica baseada no tipo de usuário
      if (usuario instanceof Usuario) {
        // Usuário comum - validações básicas
        if (!this.validarDenunciaUsuario(denuncia)) {
          return { success: false, error: 'Dados da denúncia inválidos para usuário comum' };
        }
      } else if (usuario instanceof UsuarioAdm) {
        // Administrador - validações mais flexíveis
        if (!this.validarDenunciaAdmin(denuncia)) {
          return { success: false, error: 'Dados da denúncia inválidos para administrador' };
        }
      }

      const response = await fetch(`${this.baseUrl}/denuncias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo: denuncia.tipo,
          endereco: denuncia.endereco,
          referencia: denuncia.referencia,
          descricao: denuncia.descricao,
          foto: denuncia.foto,
          usuario_id: denuncia.usuario_id
        })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao criar denúncia' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para listar denúncias (polimórfico - retorna dados diferentes baseado no usuário)
  public async listarDenuncias(usuario: Usuario | UsuarioAdm): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/denuncias`);
      const data = await response.json();

      if (response.ok) {
        // Polimorfismo: usuários comuns veem apenas suas denúncias, admins veem todas
        let denunciasFiltradas: Denuncia[] = [];
        
        if (usuario instanceof Usuario) {
          // Usuário comum - apenas suas denúncias
          denunciasFiltradas = (data as any[]).filter((d: any) => d.usuario_id === usuario.id);
        } else if (usuario instanceof UsuarioAdm) {
          // Administrador - todas as denúncias
          denunciasFiltradas = data as Denuncia[];
        }

        return { success: true, data: denunciasFiltradas };
      } else {
        return { success: false, error: 'Erro ao buscar denúncias' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para buscar denúncia por ID (polimórfico)
  public async buscarDenunciaPorId(id: number, usuario: Usuario | UsuarioAdm): Promise<{ success: boolean; data?: Denuncia; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/denuncias`);
      const data = await response.json();

      if (response.ok) {
        const denuncia = (data as any[]).find((d: any) => d.id === id);
        
        if (!denuncia) {
          return { success: false, error: 'Denúncia não encontrada' };
        }

        // Polimorfismo: verificar se o usuário pode acessar esta denúncia
        if (usuario instanceof Usuario && denuncia.usuario_id !== usuario.id) {
          return { success: false, error: 'Acesso negado: você só pode ver suas próprias denúncias' };
        }

        return { success: true, data: denuncia };
      } else {
        return { success: false, error: 'Erro ao buscar denúncia' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Validação específica para usuários comuns
  private validarDenunciaUsuario(denuncia: Denuncia): boolean {
    return denuncia.validarDados() && 
           denuncia.descricao.length >= 10 && 
           denuncia.descricao.length <= 500;
  }

  // Validação específica para administradores (mais flexível)
  private validarDenunciaAdmin(denuncia: Denuncia): boolean {
    return denuncia.tipo.length > 0 && 
           denuncia.endereco.length > 0 && 
           denuncia.descricao.length > 0;
  }

  // Método para obter estatísticas (apenas para administradores)
  public async obterEstatisticas(usuario: UsuarioAdm): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!usuario.temPermissao('ver_estatisticas')) {
      return { success: false, error: 'Permissão negada' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias`);
      const data = await response.json();

      if (response.ok) {
        const dataArray = data as any[];
        const estatisticas = {
          total: dataArray.length,
          pendentes: dataArray.filter((d: any) => d.status === 'Pendente').length,
          emAndamento: dataArray.filter((d: any) => d.status === 'Em Andamento').length,
          resolvidas: dataArray.filter((d: any) => d.status === 'Resolvida').length,
          porTipo: this.agruparPorTipo(dataArray)
        };

        return { success: true, data: estatisticas };
      } else {
        return { success: false, error: 'Erro ao obter estatísticas' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método auxiliar para agrupar denúncias por tipo
  private agruparPorTipo(denuncias: any[]): { [key: string]: number } {
    const agrupamento: { [key: string]: number } = {};
    
    denuncias.forEach(denuncia => {
      const tipo = denuncia.tipo;
      agrupamento[tipo] = (agrupamento[tipo] || 0) + 1;
    });

    return agrupamento;
  }

  // Método para atualizar status de denúncia (apenas para administradores)
  public async atualizarStatusDenuncia(denunciaId: number, novoStatus: string, usuario: UsuarioAdm): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!usuario.temPermissao('alterar_status_denuncia')) {
      return { success: false, error: 'Permissão negada para alterar status' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias/${denunciaId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao atualizar status' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para adicionar comentário a denúncia (apenas para administradores)
  public async adicionarComentarioDenuncia(denunciaId: number, comentario: string, usuario: UsuarioAdm): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!usuario.temPermissao('adicionar_comentario')) {
      return { success: false, error: 'Permissão negada para adicionar comentários' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias/${denunciaId}/comentario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comentario: comentario })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao adicionar comentário' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para definir prioridade de denúncia (apenas para administradores)
  public async definirPrioridadeDenuncia(denunciaId: number, prioridade: string, usuario: UsuarioAdm): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!usuario.temPermissao('definir_prioridade')) {
      return { success: false, error: 'Permissão negada para definir prioridade' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias/${denunciaId}/prioridade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prioridade: prioridade })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao definir prioridade' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para excluir denúncia (apenas para administradores)
  public async excluirDenuncia(denunciaId: number, usuario: UsuarioAdm): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!usuario.temPermissao('excluir_denuncia')) {
      return { success: false, error: 'Permissão negada para excluir denúncias' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias/${denunciaId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao excluir denúncia' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para buscar denúncias por status (apenas para administradores)
  public async buscarDenunciasPorStatus(status: string, usuario: UsuarioAdm): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    if (!usuario.temPermissao('filtrar_denuncias')) {
      return { success: false, error: 'Permissão negada para filtrar denúncias' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias/status/${status}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data as Denuncia[] };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao buscar denúncias por status' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para buscar denúncias por tipo (apenas para administradores)
  public async buscarDenunciasPorTipo(tipo: string, usuario: UsuarioAdm): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    if (!usuario.temPermissao('filtrar_denuncias')) {
      return { success: false, error: 'Permissão negada para filtrar denúncias' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias/tipo/${tipo}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data as Denuncia[] };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao buscar denúncias por tipo' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Método para obter denúncias urgentes (apenas para administradores)
  public async obterDenunciasUrgentes(usuario: UsuarioAdm): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    if (!usuario.temPermissao('ver_denuncias_urgentes')) {
      return { success: false, error: 'Permissão negada para ver denúncias urgentes' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/denuncias`);
      const data = await response.json();

      if (response.ok) {
        const denunciasUrgentes = (data as any[]).filter((d: any) => d.prioridade === 'Alta' || d.prioridade === 'Urgente');
        return { success: true, data: denunciasUrgentes as Denuncia[] };
      } else {
        return { success: false, error: 'Erro ao buscar denúncias urgentes' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }
}
