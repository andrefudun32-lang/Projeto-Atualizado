import { Usuario } from '../Usuario';
import { UsuarioAdm } from '../UsuarioAdm';
import { Denuncia } from '../Denuncia';
// import { GerenciadorDenuncias } from '../GerenciadorDenuncias'; // Arquivo não existe
import { AuthService } from './AuthService';
import { DenunciaService } from './DenunciaService';
import { ValidacaoService } from './ValidacaoService';
import { TipoDenuncia } from '../enums/TipoDenuncia';
import { StatusDenuncia } from '../enums/StatusDenuncia';

// Serviço principal do sistema (polimorfismo)
export class SistemaService {
  private authService: AuthService;
  private denunciaService: DenunciaService;
  private validacaoService: ValidacaoService;
  // private gerenciadorDenuncias: GerenciadorDenuncias; // Removido - arquivo não existe
  private usuarioAtual: Usuario | UsuarioAdm | null = null;

  constructor() {
    this.authService = new AuthService();
    this.denunciaService = new DenunciaService();
    this.validacaoService = new ValidacaoService();
    // this.gerenciadorDenuncias = new GerenciadorDenuncias(); // Removido - arquivo não existe
  }

  // Método para inicializar o sistema (polimórfico)
  public async inicializar(): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se há usuário logado no localStorage
      const usuarioSalvo = localStorage.getItem('usuarioLogado');
      if (usuarioSalvo) {
        const dadosUsuario = JSON.parse(usuarioSalvo);
        // Recriar objeto usuário baseado nos dados salvos
        if (dadosUsuario.tipo === 'admin') {
          this.usuarioAtual = new UsuarioAdm(
            dadosUsuario.nome,
            dadosUsuario.email,
            dadosUsuario.senha,
            dadosUsuario.cargo,
            dadosUsuario.departamento
          );
          this.usuarioAtual.id = dadosUsuario.id;
        } else {
          this.usuarioAtual = new Usuario(
            dadosUsuario.nome,
            dadosUsuario.email,
            dadosUsuario.senha,
            dadosUsuario.telefone,
            dadosUsuario.cpf,
            dadosUsuario.data_nascimento ? new Date(dadosUsuario.data_nascimento) : undefined,
            dadosUsuario.endereco,
            dadosUsuario.cidade,
            dadosUsuario.estado,
            dadosUsuario.cep
          );
          this.usuarioAtual.id = dadosUsuario.id;
        }
      }

      return { success: true, message: 'Sistema inicializado com sucesso' };
    } catch (error) {
      return { success: false, message: 'Erro ao inicializar o sistema' };
    }
  }

  // Método para fazer login (polimórfico)
  public async fazerLogin(email: string, senha: string): Promise<{ success: boolean; message: string; usuario?: Usuario | UsuarioAdm }> {
    const resultado = await this.authService.fazerLogin(email, senha);
    
    if (resultado.success && resultado.usuario) {
      this.usuarioAtual = resultado.usuario;
      
      // Salvar usuário no localStorage
      const dadosParaSalvar = {
        ...resultado.usuario.getDadosPublicos(),
        tipo: resultado.usuario instanceof UsuarioAdm ? 'admin' : 'comum',
        senha: resultado.usuario.senha // Em produção, não salvar senha
      };
      localStorage.setItem('usuarioLogado', JSON.stringify(dadosParaSalvar));
      
      return { 
        success: true, 
        message: `Login realizado com sucesso! Bem-vindo, ${resultado.usuario.nome}`,
        usuario: resultado.usuario
      };
    }
    
    return { success: false, message: resultado.error || 'Erro no login' };
  }

  // Método para fazer logout (polimórfico)
  public fazerLogout(): { success: boolean; message: string } {
    if (this.usuarioAtual) {
      const resultado = this.authService.fazerLogout(this.usuarioAtual);
      this.usuarioAtual = null;
      localStorage.removeItem('usuarioLogado');
      return resultado;
    }
    
    return { success: false, message: 'Nenhum usuário logado' };
  }

  // Método para verificar se está logado
  public isLogado(): boolean {
    return this.usuarioAtual !== null;
  }

  // Método para obter usuário atual
  public getUsuarioAtual(): Usuario | UsuarioAdm | null {
    return this.usuarioAtual;
  }

  // Método para definir usuário atual
  public setUsuarioAtual(usuario: Usuario | UsuarioAdm | null): void {
    this.usuarioAtual = usuario;
  }

  // Método para verificar se é administrador
  public isAdministrador(): boolean {
    return this.usuarioAtual instanceof UsuarioAdm;
  }

  // Método para criar denúncia (polimórfico)
  public async criarDenuncia(dados: any): Promise<{ success: boolean; message: string; denuncia?: Denuncia }> {
    if (!this.usuarioAtual) {
      return { success: false, message: 'Usuário não está logado' };
    }

    // Validar dados do formulário
    const validacao = this.validacaoService.validarFormularioDenuncia(dados, this.usuarioAtual);
    if (!validacao.valido) {
      return { success: false, message: `Erros de validação: ${validacao.erros.join(', ')}` };
    }

    // Sanitizar dados
    const dadosSanitizados = this.validacaoService.sanitizarDados(dados, 'denuncia');

    // Criar objeto denúncia
    const denuncia = new Denuncia(
      dadosSanitizados.tipo,
      dadosSanitizados.endereco,
      dadosSanitizados.descricao,
      this.usuarioAtual.id || 0,
      dadosSanitizados.referencia,
      dadosSanitizados.foto
    );

    // Estabelecer relacionamento (apenas se for Usuario)
    if (this.usuarioAtual instanceof Usuario) {
      denuncia.setUsuario(this.usuarioAtual);
    }

    // Salvar no gerenciador local (simulado)
    // this.gerenciadorDenuncias.adicionarDenuncia(denuncia); // Removido - gerenciador não existe

    // Enviar para o servidor
    const resultado = await this.denunciaService.criarDenuncia(denuncia, this.usuarioAtual);
    
    if (resultado.success) {
      return { 
        success: true, 
        message: 'Denúncia criada com sucesso!',
        denuncia
      };
    }
    
    return { success: false, message: resultado.error || 'Erro ao criar denúncia' };
  }

  // Método para listar denúncias (polimórfico)
  public async listarDenuncias(): Promise<{ success: boolean; denuncias?: Denuncia[]; message?: string }> {
    if (!this.usuarioAtual) {
      return { success: false, message: 'Usuário não está logado' };
    }

    const resultado = await this.denunciaService.listarDenuncias(this.usuarioAtual);
    
    if (resultado.success) {
      return { success: true, denuncias: resultado.data };
    }
    
    return { success: false, message: resultado.error || 'Erro ao listar denúncias' };
  }

  // Método para obter estatísticas (apenas para administradores)
  public async obterEstatisticas(): Promise<{ success: boolean; estatisticas?: any; message?: string }> {
    if (!this.usuarioAtual || !this.isAdministrador()) {
      return { success: false, message: 'Acesso negado: apenas administradores' };
    }

    const resultado = await this.denunciaService.obterEstatisticas(this.usuarioAtual as UsuarioAdm);
    
    if (resultado.success) {
      return { success: true, estatisticas: resultado.data };
    }
    
    return { success: false, message: resultado.error || 'Erro ao obter estatísticas' };
  }

  // Método para obter informações do sistema (polimórfico)
  public getInfoSistema(): string {
    if (!this.usuarioAtual) {
      return 'Sistema de Denúncias Pelotas - Não logado';
    }

    const infoUsuario = this.authService.getInfoUsuario(this.usuarioAtual);
    return `Sistema de Denúncias Pelotas - ${infoUsuario}`;
  }

  // Método para verificar permissões
  public temPermissao(permissao: string): boolean {
    if (!this.usuarioAtual) return false;
    return this.authService.temPermissao(this.usuarioAtual, permissao);
  }

  // Método para obter tipos de denúncia disponíveis
  public getTiposDenuncia(): string[] {
    return Object.values(TipoDenuncia);
  }

  // Método para obter status de denúncia disponíveis
  public getStatusDenuncia(): string[] {
    return Object.values(StatusDenuncia);
  }

  // Método para obter gerenciador de denúncias (apenas para administradores)
  // Removido - arquivo GerenciadorDenuncias não existe
  // public getGerenciadorDenuncias(): GerenciadorDenuncias | null {
  //   if (!this.isAdministrador()) return null;
  //   return this.gerenciadorDenuncias;
  // }
}
