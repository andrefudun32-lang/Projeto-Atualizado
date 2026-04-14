import { Usuario } from '../Usuario';
import { UsuarioAdm } from '../UsuarioAdm';
import { TipoUsuario } from '../enums/StatusDenuncia';

// Serviço para autenticação (polimorfismo)
export class AuthService {
  private usuariosLogados: Map<string, Usuario | UsuarioAdm> = new Map();

  // Método de login (polimórfico - funciona diferente para usuários e admins)
  public async fazerLogin(email: string, senha: string): Promise<{ success: boolean; usuario?: Usuario | UsuarioAdm; error?: string }> {
    try {
      // Simulação de busca no banco - em produção viria de uma API
      const usuario = await this.buscarUsuarioPorEmail(email);
      
      if (!usuario) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Polimorfismo: validação específica baseada no tipo de usuário
      if (usuario instanceof Usuario) {
        if (!this.validarLoginUsuario(usuario, senha)) {
          return { success: false, error: 'Credenciais inválidas para usuário comum' };
        }
      } else if (usuario instanceof UsuarioAdm) {
        if (!this.validarLoginAdmin(usuario, senha)) {
          return { success: false, error: 'Credenciais inválidas para administrador' };
        }
      }

      // Armazenar usuário logado
      this.usuariosLogados.set(email, usuario);
      
      return { success: true, usuario };
    } catch (error) {
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Método para logout (polimórfico)
  public fazerLogout(usuario: Usuario | UsuarioAdm): { success: boolean; message: string } {
    if (this.usuariosLogados.has(usuario.email)) {
      this.usuariosLogados.delete(usuario.email);
      
      // Polimorfismo: mensagem diferente baseada no tipo de usuário
      if (usuario instanceof Usuario) {
        return { success: true, message: 'Logout realizado com sucesso. Obrigado por usar o sistema!' };
      } else if (usuario instanceof UsuarioAdm) {
        return { success: true, message: 'Logout de administrador realizado com sucesso.' };
      }
    }
    
    return { success: false, message: 'Usuário não estava logado' };
  }

  // Método para verificar se está logado (polimórfico)
  public isLogado(email: string): boolean {
    return this.usuariosLogados.has(email);
  }

  // Método para obter usuário logado (polimórfico)
  public getUsuarioLogado(email: string): Usuario | UsuarioAdm | undefined {
    return this.usuariosLogados.get(email);
  }

  // Método para verificar permissões (apenas para administradores)
  public temPermissao(usuario: Usuario | UsuarioAdm, permissao: string): boolean {
    if (usuario instanceof Usuario) {
      // Usuários comuns têm permissões limitadas
      return this.getPermissoesUsuarioComum().includes(permissao);
    } else if (usuario instanceof UsuarioAdm) {
      // Administradores têm permissões baseadas em suas configurações
      return usuario.temPermissao(permissao);
    }
    
    return false;
  }

  // Validação específica para usuários comuns
  private validarLoginUsuario(usuario: Usuario, senha: string): boolean {
    return usuario.autenticar(usuario.email, senha) && 
           usuario.validarDados() &&
           usuario.isUsuarioComum();
  }

  // Validação específica para administradores
  private validarLoginAdmin(usuario: UsuarioAdm, senha: string): boolean {
    return usuario.autenticar(usuario.email, senha) && 
           usuario.validarDados() &&
           usuario.isAdmin();
  }

  // Simulação de busca no banco de dados
  private async buscarUsuarioPorEmail(email: string): Promise<Usuario | UsuarioAdm | null> {
    // Simulação - em produção viria de uma API real
    if (email === 'rafa@email.com') {
      const usuario = new Usuario('Rafael', 'rafa@email.com', '123');
      usuario.id = 1;
      return usuario;
    } else if (email === 'admin@denunciapelotas.com') {
      const admin = new UsuarioAdm('Admin Sistema', 'admin@denunciapelotas.com', 'admin123', 'Administrador', 'TI');
      admin.id = 1;
      admin.adicionarPermissao('gerenciar_denuncias');
      admin.adicionarPermissao('ver_estatisticas');
      admin.adicionarPermissao('comentar_denuncias');
      return admin;
    }
    
    return null;
  }

  // Permissões para usuários comuns
  private getPermissoesUsuarioComum(): string[] {
    return [
      'criar_denuncia',
      'ver_proprias_denuncias',
      'editar_propria_denuncia'
    ];
  }

  // Método para obter informações do usuário (polimórfico)
  public getInfoUsuario(usuario: Usuario | UsuarioAdm): string {
    if (usuario instanceof Usuario) {
      return `Usuário: ${usuario.nome} (${usuario.email})`;
    } else if (usuario instanceof UsuarioAdm) {
      return `Administrador: ${usuario.nome} - ${usuario.getCargoCompleto()}`;
    }
    
    return 'Usuário desconhecido';
  }

  // Método para verificar se é administrador
  public isAdministrador(usuario: Usuario | UsuarioAdm): boolean {
    return usuario instanceof UsuarioAdm;
  }
}
