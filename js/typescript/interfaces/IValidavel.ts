// INTERFACES DE VALIDAÇÃO TYPESCRIPT
// Define contratos para validação de dados
// Garante consistência em todo o sistema

// Interface para objetos que podem ser validados
export interface IValidavel {
  validarDados(): boolean; // Método para validar dados do objeto
}

// Interface para objetos que têm email
export interface IComEmail {
  email: string;            // Propriedade email
  validarEmail(): boolean;  // Método para validar formato do email
}

// Interface para objetos que têm senha
export interface IComSenha {
  senha: string;            // Propriedade senha
  validarSenha(): boolean;  // Método para validar força da senha
}

// Interface para objetos que podem ser autenticados
export interface IAutenticavel extends IComEmail, IComSenha {
  autenticar(email: string, senha: string): boolean;
}

// Interface para objetos que têm ID
export interface IComId {
  id?: number;
}

// Interface para objetos que têm data de criação
export interface IComDataCriacao {
  data_cadastro?: Date;
}

// Interface para objetos que podem ser atualizados
export interface IAtualizavel {
  atualizar(data: Partial<this>): void;
}
