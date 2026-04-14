// CLASSE ABSTRATA BASE - PESSOA BASE
// Classe base para todas as pessoas do sistema
// Implementa interfaces para validação, email, senha e dados comuns

import { IValidavel, IComEmail, IComSenha, IComId, IComDataCriacao, IAtualizavel } from '../interfaces/IValidavel';

export abstract class PessoaBase implements IValidavel, IComEmail, IComSenha, IComId, IComDataCriacao, IAtualizavel {
  public id?: number;              // ID único da pessoa
  public nome: string;             // Nome completo
  public email: string;            // Email único
  public senha: string;            // Senha criptografada
  public data_cadastro?: Date;     // Data de cadastro

  constructor(
    nome: string,
    email: string,
    senha: string
  ) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.data_cadastro = new Date();
  }

  // Método abstrato que deve ser implementado pelas classes filhas
  public abstract validarDados(): boolean;

  // Implementação comum para validação de email
  public validarEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  // Implementação comum para validação de senha
  public validarSenha(): boolean {
    return this.senha.length >= 6;
  }

  // Método comum para validação básica
  protected validarDadosBasicos(): boolean {
    return this.nome.length > 0 && 
           this.email.length > 0 && 
           this.senha.length > 0 &&
           this.validarEmail() &&
           this.validarSenha();
  }

  // Método para atualizar dados
  public atualizar(data: Partial<this>): void {
    Object.assign(this, data);
  }

  // Método para obter dados públicos (sem senha)
  public getDadosPublicos(): Pick<this, 'id' | 'nome' | 'email' | 'data_cadastro'> {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      data_cadastro: this.data_cadastro
    };
  }

  // Método para verificar se é o mesmo usuário
  public isMesmoUsuario(outro: PessoaBase): boolean {
    return this.id === outro.id || this.email === outro.email;
  }
}
