// EXECUTOR DO PROMPT SYNC TYPESCRIPT
// Arquivo para executar o sistema Prompt Sync
// Compila e executa o PromptSync.ts

import { PromptSync } from './PromptSync';

// Função principal para executar o sistema
async function main(): Promise<void> {
  console.log('🚀 Iniciando Sistema Prompt Sync TypeScript...');
  
  try {
    const promptSync = new PromptSync();
    await promptSync.main();
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar o sistema
main();
