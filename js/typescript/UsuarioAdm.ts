// CLASSE USUÁRIO ADMINISTRADOR TYPESCRIPT
// Representa um administrador do sistema
// Herda de PessoaBase e implementa IAutenticavel

import { PessoaBase } from './abstract/PessoaBase';
import { IAutenticavel } from './interfaces/IValidavel';
import { TipoUsuario } from './enums/StatusDenuncia';

export class UsuarioAdm extends PessoaBase implements IAutenticavel {
  public cargo?: string;        // Cargo na prefeitura
  public departamento?: string; // Departamento responsável
  public tipo: TipoUsuario = TipoUsuario.ADMINISTRADOR; // Tipo fixo como ADMINISTRADOR
  public permissoes: string[] = []; // Array de permissões específicas

  constructor(
    nome: string,
    email: string,
    senha: string,
    cargo?: string,
    departamento?: string
  ) {
    super(nome, email, senha);
    this.cargo = cargo;
    this.departamento = departamento;
  }

  // Implementação do método abstrato da classe pai
  public validarDados(): boolean {
    return this.validarDadosBasicos() && this.validarCargo();
  }

  // Método para validar cargo
  public validarCargo(): boolean {
    return this.cargo !== undefined && this.cargo.length > 0;
  }

  // Implementação da interface IAutenticavel
  public autenticar(email: string, senha: string): boolean {
    return this.email === email && this.senha === senha;
  }

  // Método para verificar se é administrador
  public isAdmin(): boolean {
    return this.tipo === TipoUsuario.ADMINISTRADOR;
  }

  // Método para adicionar permissão
  public adicionarPermissao(permissao: string): void {
    if (!this.permissoes.includes(permissao)) {
      this.permissoes.push(permissao);
    }
  }

  // Método para remover permissão
  public removerPermissao(permissao: string): void {
    this.permissoes = this.permissoes.filter(p => p !== permissao);
  }

  // Método para verificar se tem permissão
  public temPermissao(permissao: string): boolean {
    return this.permissoes.includes(permissao);
  }

  // Método para obter cargo completo
  public getCargoCompleto(): string {
    const partes = [this.cargo, this.departamento].filter(Boolean);
    return partes.join(' - ');
  }
}
