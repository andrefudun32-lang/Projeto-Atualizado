// ENUMS DE TIPOS DE DENÚNCIA TYPESCRIPT
// Define tipos e categorias de denúncias
// Garante consistência de dados em todo o sistema

// Enum para tipos de denúncia
export enum TipoDenuncia {
  BURACO_NA_VIA = "Buraco na via",           // Problemas na pavimentação
  ILUMINACAO_PUBLICA = "Iluminação pública", // Problemas de iluminação
  ACUMULO_DE_LIXO = "Acúmulo de lixo",       // Problemas de limpeza
  ARVORE_CAIDA = "Árvore caída",             // Árvores caídas
  PODA_DE_ARVORE = "Poda de árvore",         // Necessidade de poda
  ESGOTO_ENTUPIDO = "Esgoto entupido",       // Problemas de esgoto
  CALCADA_DANIFICADA = "Calçada danificada", // Problemas em calçadas
  SEMAFORO_COM_DEFEITO = "Semáforo com defeito", // Problemas de trânsito
  OUTROS = "Outros"                          // Outros tipos não listados
}

// Enum para categorias de denúncia
export enum CategoriaDenuncia {
  INFRAESTRUTURA = "Infraestrutura", // Problemas de infraestrutura urbana
  LIMPEZA = "Limpeza",               // Problemas de limpeza pública
  SEGURANCA = "Segurança",           // Problemas de segurança
  MEIO_AMBIENTE = "Meio Ambiente",   // Problemas ambientais
  TRANSITO = "Trânsito",             // Problemas de trânsito
  OUTROS = "Outros"                  // Outras categorias
}
