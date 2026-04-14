import { SistemaService } from './services/SistemaService';
import { DatabaseService } from './services/DatabaseService';
import { Usuario } from './Usuario';
import { UsuarioAdm } from './UsuarioAdm';
import { Denuncia } from './Denuncia';
import { TipoDenuncia } from './enums/TipoDenuncia';
import { StatusDenuncia } from './enums/StatusDenuncia';

export class SistemaPrincipal {
  private sistemaService: SistemaService;
  private databaseService: DatabaseService;

  constructor() {
    this.sistemaService = new SistemaService();
    this.databaseService = new DatabaseService();
  }

  public async inicializar(): Promise<void> {
    const resultado = await this.sistemaService.inicializar();
    console.log(resultado.message);
  }

  public async fazerLogin(email: string, senha: string): Promise<{ success: boolean; message: string }> {
    return await this.sistemaService.fazerLogin(email, senha);
  }

  public fazerLogout(): { success: boolean; message: string } {
    return this.sistemaService.fazerLogout();
  }

  public isLogado(): boolean {
    return this.sistemaService.isLogado();
  }

  public getUsuarioAtual(): Usuario | UsuarioAdm | null {
    return this.sistemaService.getUsuarioAtual();
  }

  public isAdministrador(): boolean {
    return this.sistemaService.isAdministrador();
  }

  public async criarDenuncia(dados: any): Promise<{ success: boolean; message: string }> {
    return await this.sistemaService.criarDenuncia(dados);
  }

  public async listarDenuncias(): Promise<{ success: boolean; denuncias?: Denuncia[]; message?: string }> {
    return await this.sistemaService.listarDenuncias();
  }

  public async obterEstatisticas(): Promise<{ success: boolean; estatisticas?: any; message?: string }> {
    return await this.sistemaService.obterEstatisticas();
  }

  public getInfoSistema(): string {
    return this.sistemaService.getInfoSistema();
  }

  public temPermissao(permissao: string): boolean {
    return this.sistemaService.temPermissao(permissao);
  }

  public getTiposDenuncia(): string[] {
    return this.sistemaService.getTiposDenuncia();
  }

  public getStatusDenuncia(): string[] {
    return this.sistemaService.getStatusDenuncia();
  }

  public getGerenciadorDenuncias(): any {
    // return this.sistemaService.getGerenciadorDenuncias(); // Removido - gerenciador não existe
    return null; // Simulado
  }

  public async validarFormularioDenuncia(dados: any): Promise<{ valido: boolean; erros: string[] }> {
    const usuario = this.getUsuarioAtual();
    if (!usuario) {
      return { valido: false, erros: ['Usuário não está logado'] };
    }

    const { ValidacaoService } = await import('./services/ValidacaoService');
    const validacaoService = new ValidacaoService();
    return validacaoService.validarFormularioDenuncia(dados, usuario);
  }

  public converterArquivoParaBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new (globalThis as any).FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error: any) => reject(error);
    });
  }

  public getDadosUsuarioParaExibicao(): any {
    const usuario = this.getUsuarioAtual();
    if (!usuario) return null;

    if (usuario instanceof Usuario) {
      return {
        nome: usuario.nome,
        email: usuario.email,
        tipo: 'Usuário Comum',
        endereco: usuario.getEnderecoCompleto(),
        telefone: usuario.telefone
      };
    } else if (usuario instanceof UsuarioAdm) {
      return {
        nome: usuario.nome,
        email: usuario.email,
        tipo: 'Administrador',
        cargo: usuario.getCargoCompleto(),
        permissoes: usuario.permissoes
      };
    }

    return null;
  }

  public getDadosDenunciaParaExibicao(denuncia: Denuncia): any {
    return {
      id: denuncia.id,
      tipo: denuncia.tipo,
      endereco: denuncia.endereco,
      referencia: denuncia.referencia || '-',
      descricao: denuncia.descricao,
      status: denuncia.status || 'Pendente',
      prioridade: denuncia.prioridade || 'Media',
      dataDenuncia: denuncia.data_denuncia?.toLocaleString('pt-BR') || '-',
      tempoDesdeDenuncia: denuncia.getTempoDesdeDenuncia(),
      infoUsuario: denuncia.getInfoUsuario(),
      resumo: denuncia.getResumo(),
      temFoto: !!denuncia.foto,
      comentarios: denuncia.comentarios || []
    };
  }

  public async buscarDenunciasReais(): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    return await this.databaseService.buscarTodasDenuncias();
  }

  public async buscarMinhasDenuncias(): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    if (!this.sistemaService.isLogado()) {
      return { success: false, error: 'Usuário não está logado' };
    }

    const usuario = this.sistemaService.getUsuarioAtual();
    if (!usuario) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    return await this.databaseService.buscarDenunciasPorUsuario(usuario.id || 0);
  }

  public async criarDenunciaReal(dados: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.sistemaService.isLogado()) {
      return { success: false, error: 'Usuário não está logado' };
    }

    const usuario = this.sistemaService.getUsuarioAtual();
    if (!usuario) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const denuncia = new Denuncia(
      dados.tipo,
      dados.endereco,
      dados.descricao,
      usuario.id || 0,
      dados.referencia,
      dados.foto
    );

    if (!denuncia.validarDados()) {
      return { success: false, error: 'Dados da denúncia inválidos' };
    }

    return await this.databaseService.criarDenuncia(denuncia);
  }

  public async obterEstatisticasReais(): Promise<{ success: boolean; data?: any; error?: string }> {
    return await this.databaseService.obterEstatisticas();
  }

  public async fazerLoginReal(email: string, senha: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const resultadoUsuario = await this.databaseService.buscarUsuarioPorEmail(email);
      
      if (resultadoUsuario.success && resultadoUsuario.data) {
        const usuario = resultadoUsuario.data;
        if (usuario.autenticar(email, senha)) {
          this.sistemaService.setUsuarioAtual(usuario);
          return { success: true, message: 'Login realizado com sucesso como usuário comum' };
        }
      }

      const resultadoAdmin = await this.databaseService.buscarAdministradorPorEmail(email);
      
      if (resultadoAdmin.success && resultadoAdmin.data) {
        const admin = resultadoAdmin.data;
        if (admin.autenticar(email, senha)) {
          this.sistemaService.setUsuarioAtual(admin);
          return { success: true, message: 'Login realizado com sucesso como administrador' };
        }
      }

      return { success: false, error: 'Email ou senha incorretos' };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  }

  public async atualizarStatusDenuncia(denunciaId: number, novoStatus: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!this.isAdministrador()) {
      return { success: false, error: 'Apenas administradores podem alterar status de denúncias' };
    }

    try {
      const response = await fetch(`http://localhost:3000/api/denuncias/${denunciaId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });

      const data = await response.json() as any;
      
      if (response.ok) {
        return { success: true, message: 'Status da denúncia atualizado com sucesso' };
      } else {
        return { success: false, error: data.error || 'Erro ao atualizar status' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  public async adicionarComentarioDenuncia(denunciaId: number, comentario: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!this.isAdministrador()) {
      return { success: false, error: 'Apenas administradores podem adicionar comentários' };
    }

    try {
      const response = await fetch(`http://localhost:3000/api/denuncias/${denunciaId}/comentario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comentario: comentario })
      });

      const data = await response.json() as any;
      
      if (response.ok) {
        return { success: true, message: 'Comentário adicionado com sucesso' };
      } else {
        return { success: false, error: data.error || 'Erro ao adicionar comentário' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  public async definirPrioridadeDenuncia(denunciaId: number, prioridade: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!this.isAdministrador()) {
      return { success: false, error: 'Apenas administradores podem definir prioridade' };
    }

    try {
      const response = await fetch(`http://localhost:3000/api/denuncias/${denunciaId}/prioridade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prioridade: prioridade })
      });

      const data = await response.json() as any;
      
      if (response.ok) {
        return { success: true, message: 'Prioridade da denúncia definida com sucesso' };
      } else {
        return { success: false, error: data.error || 'Erro ao definir prioridade' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  public async buscarDenunciaPorId(denunciaId: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`http://localhost:3000/api/denuncias/${denunciaId}`);
      
      if (response.ok) {
        const data = await response.json() as any;
        return { success: true, data: data };
      } else {
        const errorData = await response.json() as any;
        return { success: false, error: errorData.error || 'Denúncia não encontrada' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  public async excluirDenuncia(denunciaId: number): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!this.isAdministrador()) {
      return { success: false, error: 'Apenas administradores podem excluir denúncias' };
    }

    try {
      const response = await fetch(`http://localhost:3000/api/denuncias/${denunciaId}`, {
        method: 'DELETE'
      });

      const data = await response.json() as any;
      
      if (response.ok) {
        return { success: true, message: 'Denúncia excluída com sucesso' };
      } else {
        return { success: false, error: data.error || 'Erro ao excluir denúncia' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  public async obterDenunciasPorStatus(status: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`http://localhost:3000/api/denuncias/status/${status}`);
      
      if (response.ok) {
        const data = await response.json() as any[];
        return { success: true, data: data };
      } else {
        const errorData = await response.json() as any;
        return { success: false, error: errorData.error || 'Erro ao buscar denúncias por status' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  public async obterDenunciasPorTipo(tipo: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`http://localhost:3000/api/denuncias/tipo/${tipo}`);
      
      if (response.ok) {
        const data = await response.json() as any[];
        return { success: true, data: data };
      } else {
        const errorData = await response.json() as any;
        return { success: false, error: errorData.error || 'Erro ao buscar denúncias por tipo' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }
}

const sistema = new SistemaPrincipal();

if (typeof (globalThis as any).window !== 'undefined') {
  ((globalThis as any).window as any).sistema = sistema;
}

export default sistema;
