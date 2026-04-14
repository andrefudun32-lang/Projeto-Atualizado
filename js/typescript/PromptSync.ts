// SISTEMA PROMPT SYNC - TERMINAL TYPESCRIPT
// Permite fazer denúncias e visualizar denúncias via terminal
// Sincroniza com o banco de dados através da API

import * as readline from 'readline';
import fetch from 'node-fetch';

// Configuração da API
const API_BASE: string = 'http://localhost:3000/api';

// Interface para dados de denúncia
interface DenunciaData {
  id?: number;
  tipo: string;
  endereco: string;
  referencia?: string;
  descricao: string;
  foto?: string;
  status?: string;
}

// Interface para resposta da API
interface ApiResponse {
  success?: boolean;
  id?: number;
  error?: string;
}

// Interface para estatísticas
interface Estatisticas {
  total: number;
  pendentes: number;
  emAndamento: number;
  resolvidas: number;
  porTipo: { [key: string]: number };
}

// Classe principal do sistema Prompt Sync
export class PromptSync {
  private rl: readline.Interface;
  private apiBase: string;

  constructor() {
    // Interface para leitura de entrada
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.apiBase = API_BASE;
  }

  // Método para fazer pergunta no terminal
  private async fazerPergunta(pergunta: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.rl.question(pergunta, (resposta: string) => {
        resolve(resposta.trim());
      });
    });
  }

  // Método para exibir menu principal
  private exibirMenu(): void {
    console.log('\n=== SISTEMA DE DENÚNCIAS - TERMINAL ===');
    console.log('1. Fazer nova denúncia');
    console.log('2. Ver todas as denúncias');
    console.log('3. Ver denúncias por tipo');
    console.log('4. Ver estatísticas');
    console.log('5. Sair');
    console.log('=====================================');
  }

  // Método para fazer nova denúncia
  public async fazerDenuncia(): Promise<void> {
    console.log('\n--- NOVA DENÚNCIA ---');
    
    try {
      // Coletar dados da denúncia
      const tipo: string = await this.fazerPergunta('Tipo da denúncia: ');
      const endereco: string = await this.fazerPergunta('Endereço: ');
      const referencia: string = await this.fazerPergunta('Ponto de referência (opcional): ');
      const descricao: string = await this.fazerPergunta('Descrição detalhada: ');
      const foto: string = await this.fazerPergunta('Caminho da foto (opcional): ');
      
      // Validar dados obrigatórios
      if (!tipo || !endereco || !descricao) {
        console.log('❌ Erro: Tipo, endereço e descrição são obrigatórios!');
        return;
      }
      
      // Preparar dados para envio
      const dados: DenunciaData = {
        tipo: tipo,
        endereco: endereco,
        referencia: referencia || undefined,
        descricao: descricao,
        foto: foto || undefined
      };
      
      console.log('\n📤 Enviando denúncia...');
      
      // Enviar para API
      const response = await fetch(`${this.apiBase}/denuncias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
      
      if (response.ok) {
        const resultado: ApiResponse = await response.json() as ApiResponse;
        console.log('✅ Denúncia criada com sucesso!');
        console.log(`ID: ${resultado.id}`);
      } else {
        const erro: ApiResponse = await response.json() as ApiResponse;
        console.log(`❌ Erro ao criar denúncia: ${erro.error}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro de conexão: ${(error as Error).message}`);
    }
  }

  // Método para ver todas as denúncias
  public async verDenuncias(): Promise<void> {
    console.log('\n--- TODAS AS DENÚNCIAS ---');
    
    try {
      const response = await fetch(`${this.apiBase}/denuncias`);
      
      if (response.ok) {
        const denuncias: DenunciaData[] = await response.json() as DenunciaData[];
        
        if (denuncias.length === 0) {
          console.log('📭 Nenhuma denúncia encontrada.');
          return;
        }
        
        console.log(`\n📋 Total de denúncias: ${denuncias.length}\n`);
        
        denuncias.forEach((denuncia: DenunciaData, index: number) => {
          console.log(`--- DENÚNCIA ${index + 1} ---`);
          console.log(`ID: ${denuncia.id}`);
          console.log(`Tipo: ${denuncia.tipo}`);
          console.log(`Endereço: ${denuncia.endereco}`);
          console.log(`Referência: ${denuncia.referencia || 'Não informado'}`);
          console.log(`Descrição: ${denuncia.descricao}`);
          console.log(`Status: ${denuncia.status || 'Pendente'}`);
          console.log(`Foto: ${denuncia.foto ? 'Sim' : 'Não'}`);
          console.log('------------------------\n');
        });
        
      } else {
        console.log('❌ Erro ao carregar denúncias.');
      }
      
    } catch (error) {
      console.log(`❌ Erro de conexão: ${(error as Error).message}`);
    }
  }

  // Método para ver denúncias por tipo
  public async verDenunciasPorTipo(): Promise<void> {
    console.log('\n--- DENÚNCIAS POR TIPO ---');
    
    try {
      const response = await fetch(`${this.apiBase}/denuncias`);
      
      if (response.ok) {
        const denuncias: DenunciaData[] = await response.json() as DenunciaData[];
        
        // Agrupar por tipo
        const porTipo: { [key: string]: DenunciaData[] } = {};
        denuncias.forEach((denuncia: DenunciaData) => {
          if (!porTipo[denuncia.tipo]) {
            porTipo[denuncia.tipo] = [];
          }
          porTipo[denuncia.tipo].push(denuncia);
        });
        
        // Exibir agrupado
        Object.keys(porTipo).forEach((tipo: string) => {
          console.log(`\n📂 ${tipo}: ${porTipo[tipo].length} denúncia(s)`);
          porTipo[tipo].forEach((denuncia: DenunciaData) => {
            console.log(`  - ID ${denuncia.id}: ${denuncia.endereco} (${denuncia.status || 'Pendente'})`);
          });
        });
        
      } else {
        console.log('❌ Erro ao carregar denúncias.');
      }
      
    } catch (error) {
      console.log(`❌ Erro de conexão: ${(error as Error).message}`);
    }
  }

  // Método para ver estatísticas
  public async verEstatisticas(): Promise<void> {
    console.log('\n--- ESTATÍSTICAS ---');
    
    try {
      const response = await fetch(`${this.apiBase}/denuncias`);
      
      if (response.ok) {
        const denuncias: DenunciaData[] = await response.json() as DenunciaData[];
        
        // Calcular estatísticas
        const total: number = denuncias.length;
        const pendentes: number = denuncias.filter((d: DenunciaData) => !d.status || d.status === 'Pendente').length;
        const emAndamento: number = denuncias.filter((d: DenunciaData) => d.status === 'Em Andamento').length;
        const resolvidas: number = denuncias.filter((d: DenunciaData) => d.status === 'Resolvida').length;
        
        // Agrupar por tipo
        const porTipo: { [key: string]: number } = {};
        denuncias.forEach((denuncia: DenunciaData) => {
          porTipo[denuncia.tipo] = (porTipo[denuncia.tipo] || 0) + 1;
        });
        
        console.log(`📊 Total de denúncias: ${total}`);
        console.log(`⏳ Pendentes: ${pendentes}`);
        console.log(`🔄 Em andamento: ${emAndamento}`);
        console.log(`✅ Resolvidas: ${resolvidas}`);
        
        console.log('\n📈 Por tipo:');
        Object.keys(porTipo).forEach((tipo: string) => {
          console.log(`  - ${tipo}: ${porTipo[tipo]}`);
        });
        
      } else {
        console.log('❌ Erro ao carregar estatísticas.');
      }
      
    } catch (error) {
      console.log(`❌ Erro de conexão: ${(error as Error).message}`);
    }
  }

  // Método para verificar se o servidor está rodando
  public async verificarServidor(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/denuncias`);
      if (response.ok) {
        console.log('✅ Servidor conectado com sucesso!');
        return true;
      } else {
        console.log('❌ Servidor retornou erro.');
        return false;
      }
    } catch (error) {
      console.log('❌ Servidor não está rodando ou não está acessível.');
      console.log('💡 Certifique-se de que o servidor Node.js está rodando na porta 3000');
      return false;
    }
  }

  // Método principal do menu
  public async executarMenu(): Promise<void> {
    while (true) {
      this.exibirMenu();
      const opcao: string = await this.fazerPergunta('\nEscolha uma opção: ');
      
      switch (opcao) {
        case '1':
          await this.fazerDenuncia();
          break;
        case '2':
          await this.verDenuncias();
          break;
        case '3':
          await this.verDenunciasPorTipo();
          break;
        case '4':
          await this.verEstatisticas();
          break;
        case '5':
          console.log('\n👋 Saindo do sistema...');
          this.rl.close();
          return;
        default:
          console.log('❌ Opção inválida! Tente novamente.');
      }
      
      // Pausa antes de mostrar o menu novamente
      await this.fazerPergunta('\nPressione Enter para continuar...');
    }
  }

  // Método principal
  public async main(): Promise<void> {
    console.log('🚀 Iniciando Sistema Prompt Sync...');
    
    // Verificar conexão com servidor
    const servidorOk: boolean = await this.verificarServidor();
    if (!servidorOk) {
      console.log('\n❌ Não foi possível conectar ao servidor.');
      console.log('💡 Execute: cd js && node index.js');
      this.rl.close();
      return;
    }
    
    // Executar menu principal
    await this.executarMenu();
  }
}

// Função para iniciar o sistema
async function iniciarSistema(): Promise<void> {
  const promptSync = new PromptSync();
  
  try {
    await promptSync.main();
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Iniciar o sistema se este arquivo for executado diretamente
if (require.main === module) {
  iniciarSistema();
}
