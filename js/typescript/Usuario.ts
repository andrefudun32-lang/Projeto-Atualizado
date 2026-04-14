import { PessoaBase } from './abstract/PessoaBase';
import { IAutenticavel } from './interfaces/IValidavel';
import { TipoUsuario } from './enums/StatusDenuncia';

export class Usuario extends PessoaBase implements IAutenticavel {
  public telefone?: string;
  public cpf?: string;
  public data_nascimento?: Date;
  public endereco?: string;
  public cidade?: string;
  public estado?: string;
  public cep?: string;
  public tipo: TipoUsuario = TipoUsuario.COMUM;

  constructor(
    nome: string,
    email: string,
    senha: string,
    telefone?: string,
    cpf?: string,
    data_nascimento?: Date,
    endereco?: string,
    cidade?: string,
    estado?: string,
    cep?: string
  ) {
    super(nome, email, senha);
    this.telefone = telefone;
    this.cpf = cpf;
    this.data_nascimento = data_nascimento;
    this.endereco = endereco;
    this.cidade = cidade;
    this.estado = estado;
    this.cep = cep;
  }

  // Implementação do método abstrato da classe pai
  public validarDados(): boolean {
    return this.validarDadosBasicos() && this.validarCPF();
  }

  // Método para validar CPF
  public validarCPF(): boolean {
    if (!this.cpf) return true; // CPF é opcional
    
    const cpf = this.cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;

    // Validação do CPF
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  // Implementação da interface IAutenticavel
  public autenticar(email: string, senha: string): boolean {
    return this.email === email && this.senha === senha;
  }

  // Método para verificar se é usuário comum
  public isUsuarioComum(): boolean {
    return this.tipo === TipoUsuario.COMUM;
  }

  // Método para obter endereço completo
  public getEnderecoCompleto(): string {
    const partes = [this.endereco, this.cidade, this.estado, this.cep].filter(Boolean);
    return partes.join(', ');
  }
}
