// SISTEMA PROMPT SYNC - EXECUÇÃO DIRETA NO TERMINAL
// Executa diretamente com ts-node sem compilar para JavaScript

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

// Função para fazer pergunta no terminal
function fazerPergunta(pergunta: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<string>((resolve) => {
    rl.question(pergunta, (resposta: string) => {
      rl.close();
      resolve(resposta.trim());
    });
  });
}

// Função para exibir menu principal
function exibirMenu(): void {
  console.log('\n=== SISTEMA DE DENÚNCIAS - TERMINAL ===');
  console.log('1. Fazer nova denúncia');
  console.log('2. Ver todas as denúncias');
  console.log('3. Ver denúncias por tipo');
  console.log('4. Ver estatísticas');
  console.log('5. Sair');
  console.log('=====================================');
}

// Função para fazer nova denúncia
async function fazerDenuncia(): Promise<void> {
  console.log('\n--- NOVA DENÚNCIA ---');
  
  try {
    // Coletar dados da denúncia
    const tipo: string = await fazerPergunta('Tipo da denúncia: ');
    const endereco: string = await fazerPergunta('Endereço: ');
    const referencia: string = await fazerPergunta('Ponto de referência (opcional): ');
    const descricao: string = await fazerPergunta('Descrição detalhada: ');
    const foto: string = await fazerPergunta('Caminho da foto (opcional): ');
    
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
    const response = await fetch(`${API_BASE}/denuncias`, {
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

// Função para ver todas as denúncias
async function verDenuncias(): Promise<void> {
  console.log('\n--- TODAS AS DENÚNCIAS ---');
  
  try {
    const response = await fetch(`${API_BASE}/denuncias`);
    
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

// Função para ver denúncias por tipo
async function verDenunciasPorTipo(): Promise<void> {
  console.log('\n--- DENÚNCIAS POR TIPO ---');
  
  try {
    const response = await fetch(`${API_BASE}/denuncias`);
    
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

// Função para ver estatísticas
async function verEstatisticas(): Promise<void> {
  console.log('\n--- ESTATÍSTICAS ---');
  
  try {
    const response = await fetch(`${API_BASE}/denuncias`);
    
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

// Função para verificar se o servidor está rodando
async function verificarServidor(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/denuncias`);
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

// Função principal do menu
async function executarMenu(): Promise<void> {
  while (true) {
    exibirMenu();
    const opcao: string = await fazerPergunta('\nEscolha uma opção: ');
    
    switch (opcao) {
      case '1':
        await fazerDenuncia();
        break;
      case '2':
        await verDenuncias();
        break;
      case '3':
        await verDenunciasPorTipo();
        break;
      case '4':
        await verEstatisticas();
        break;
      case '5':
        console.log('\n👋 Saindo do sistema...');
        process.exit(0);
        return;
      default:
        console.log('❌ Opção inválida! Tente novamente.');
    }
    
    // Pausa antes de mostrar o menu novamente
    await fazerPergunta('\nPressione Enter para continuar...');
  }
}

// Função principal
async function main(): Promise<void> {
  console.log('🚀 Iniciando Sistema Prompt Sync TypeScript...');
  
  // Verificar conexão com servidor
  const servidorOk: boolean = await verificarServidor();
  if (!servidorOk) {
    console.log('\n❌ Não foi possível conectar ao servidor.');
    console.log('💡 Execute: cd js && node index.js');
    process.exit(1);
    return;
  }
  
  // Executar menu principal
  await executarMenu();
}

// Iniciar o sistema
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
