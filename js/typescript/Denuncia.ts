import { EntidadeBase } from './abstract/EntidadeBase';
import { IDenuncia, IComStatus, IComentavel, IPriorizavel } from './interfaces/IDenuncia';
import { TipoDenuncia } from './enums/TipoDenuncia';
import { StatusDenuncia, Prioridade } from './enums/StatusDenuncia';
import { Usuario } from './Usuario';

export class Denuncia extends EntidadeBase implements IDenuncia, IComStatus<StatusDenuncia>, IComentavel, IPriorizavel {
  public tipo: string;
  public endereco: string;
  public referencia?: string;
  public descricao: string;
  public foto?: string;
  public usuario_id: number;
  public data_denuncia?: Date;
  public status?: StatusDenuncia;
  public comentarios?: string[];
  public prioridade?: 'Baixa' | 'Media' | 'Alta' | 'Urgente';
  
  // Relacionamento com Usuario (composição)
  private _usuario?: Usuario;

  constructor(
    tipo: string,
    endereco: string,
    descricao: string,
    usuario_id: number,
    referencia?: string,
    foto?: string
  ) {
    super();
    this.tipo = tipo;
    this.endereco = endereco;
    this.descricao = descricao;
    this.usuario_id = usuario_id;
    this.referencia = referencia;
    this.foto = foto;
    this.data_denuncia = new Date();
    this.status = StatusDenuncia.PENDENTE;
    this.comentarios = [];
    this.prioridade = 'Media';
  }

  // Método para validar dados obrigatórios
  public validarDados(): boolean {
    return this.tipo.length > 0 && 
           this.endereco.length > 0 && 
           this.descricao.length > 0 &&
           this.usuario_id > 0 &&
           this.validarDescricao() &&
           this.validarEndereco() &&
           this.validarFoto();
  }

  // Método para validar tamanho da descrição
  public validarDescricao(): boolean {
    return this.descricao.length >= 10 && this.descricao.length <= 500;
  }

  // Método para validar endereço
  public validarEndereco(): boolean {
    return this.endereco.length >= 5 && this.endereco.length <= 255;
  }

  // Método para validar foto (se for Base64)
  public validarFoto(): boolean {
    if (!this.foto) return true; // Foto é opcional
    
    // Verifica se é uma string Base64 válida
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    return base64Regex.test(this.foto);
  }

  // Método para obter tipo de denúncia como enum
  public getTipoEnum(): TipoDenuncia | null {
    const tipos = Object.values(TipoDenuncia);
    return tipos.find(tipo => tipo === this.tipo) || null;
  }

  // Implementação da interface IComStatus
  public atualizarStatus(novoStatus: StatusDenuncia): void {
    this.status = novoStatus;
  }

  public isStatus(status: StatusDenuncia): boolean {
    return this.status === status;
  }

  // Método para verificar se está pendente
  public isPendente(): boolean {
    return this.isStatus(StatusDenuncia.PENDENTE);
  }

  // Método para verificar se está resolvida
  public isResolvida(): boolean {
    return this.isStatus(StatusDenuncia.RESOLVIDA);
  }

  // Implementação da interface IComentavel
  public adicionarComentario(comentario: string): void {
    if (!this.comentarios) this.comentarios = [];
    this.comentarios.push(comentario);
  }

  public removerComentario(index: number): void {
    if (this.comentarios && index >= 0 && index < this.comentarios.length) {
      this.comentarios.splice(index, 1);
    }
  }

  // Implementação da interface IPriorizavel
  public definirPrioridade(prioridade: 'Baixa' | 'Media' | 'Alta' | 'Urgente'): void {
    this.prioridade = prioridade;
  }

  public isUrgente(): boolean {
    return this.prioridade === 'Urgente';
  }

  // Métodos para relacionamento com Usuario
  public setUsuario(usuario: Usuario): void {
    this._usuario = usuario;
    this.usuario_id = usuario.id || 0;
  }

  public getUsuario(): Usuario | undefined {
    return this._usuario;
  }

  // Método para obter informações do usuário
  public getInfoUsuario(): string {
    if (this._usuario) {
      return `${this._usuario.nome} (${this._usuario.email})`;
    }
    return `Usuário ID: ${this.usuario_id}`;
  }

  // Método para obter resumo da denúncia
  public getResumo(): string {
    return `${this.tipo} - ${this.endereco} - ${this.status}`;
  }

  // Método para calcular tempo desde a denúncia
  public getTempoDesdeDenuncia(): string {
    if (!this.data_denuncia) return 'Data não disponível';
    
    const agora = new Date();
    const diffTime = Math.abs(agora.getTime() - this.data_denuncia.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dia';
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} meses`;
    return `${Math.ceil(diffDays / 365)} anos`;
  }
}
