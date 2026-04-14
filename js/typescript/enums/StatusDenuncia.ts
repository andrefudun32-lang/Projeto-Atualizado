// Enum para status das denúncias
export enum StatusDenuncia {
  PENDENTE = "Pendente",
  EM_ANDAMENTO = "Em Andamento",
  RESOLVIDA = "Resolvida",
  CANCELADA = "Cancelada",
  REJEITADA = "Rejeitada"
}

// Enum para prioridades
export enum Prioridade {
  BAIXA = "Baixa",
  MEDIA = "Media",
  ALTA = "Alta",
  URGENTE = "Urgente"
}

// Enum para tipos de usuário
export enum TipoUsuario {
  COMUM = "Comum",
  ADMINISTRADOR = "Administrador",
  MODERADOR = "Moderador"
}
