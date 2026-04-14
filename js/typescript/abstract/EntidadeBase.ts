// CLASSE ABSTRATA BASE - ENTIDADE BASE
// Classe base para todas as entidades do sistema
// Implementa interfaces comuns para ID, data de criação e atualização

import { IComId, IComDataCriacao, IAtualizavel } from '../interfaces/IValidavel';

export abstract class EntidadeBase implements IComId, IComDataCriacao, IAtualizavel {
  public id?: number;              // ID único da entidade
  public data_cadastro?: Date;     // Data de criação da entidade

  constructor() {
    this.data_cadastro = new Date();
  }

  // Método para atualizar dados
  public atualizar(data: Partial<this>): void {
    Object.assign(this, data);
  }

  // Método para verificar se a entidade é nova
  public isNova(): boolean {
    return this.id === undefined;
  }

  // Método para verificar se a entidade existe
  public isExistente(): boolean {
    return this.id !== undefined;
  }

  // Método para obter idade da entidade em dias
  public getIdadeEmDias(): number {
    if (!this.data_cadastro) return 0;
    const agora = new Date();
    const diffTime = Math.abs(agora.getTime() - this.data_cadastro.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
