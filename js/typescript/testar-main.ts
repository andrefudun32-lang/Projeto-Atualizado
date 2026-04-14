// Arquivo para testar o main.ts
import { Main } from './main';

async function testarMain() {
  console.log('🚀 Iniciando testes do main.ts...\n');
  
  try {
    const main = new Main();
    
    // Executar todos os testes
    const resultado = await main.executarTodosTestes();
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`✅ Sucessos: ${resultado.sucesso}`);
    console.log(`❌ Falhas: ${resultado.falha}`);
    console.log(`📈 Taxa de sucesso: ${((resultado.sucesso / (resultado.sucesso + resultado.falha)) * 100).toFixed(1)}%`);
    
    // Mostrar detalhes dos testes
    console.log('\n📋 DETALHES DOS TESTES:');
    resultado.detalhes.forEach((teste, index) => {
      const status = teste.sucesso ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${teste.nome}`);
      if (!teste.sucesso) {
        console.log(`   Esperado: ${teste.esperado}`);
        console.log(`   Resultado: ${teste.resultado}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar testes:', error);
  }
}

// Executar os testes
testarMain();

