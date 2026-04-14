import { StatusDenuncia } from '../enums/StatusDenuncia';

// Interface para objetos que representam denúncias
export interface IDenuncia {
  id?: number;
  tipo: string;
  endereco: string;
  referencia?: string;
  descricao: string;
  foto?: string;
  usuario_id: number;
  data_denuncia?: Date;
  status?: StatusDenuncia;
}

// Interface para objetos que podem ter status
export interface IComStatus<T> {
  status?: T;
  atualizarStatus(novoStatus: T): void;
  isStatus(status: T): boolean;
}

// Interface para objetos que podem ser comentados
export interface IComentavel {
  comentarios?: string[];
  adicionarComentario(comentario: string): void;
  removerComentario(index: number): void;
}

// Interface para objetos que podem ser priorizados
export interface IPriorizavel {
  prioridade?: 'Baixa' | 'Media' | 'Alta' | 'Urgente';
  definirPrioridade(prioridade: 'Baixa' | 'Media' | 'Alta' | 'Urgente'): void;
  isUrgente(): boolean;
}
