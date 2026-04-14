// EXEMPLO DE COMO USAR O MAIN.TS
import { Main } from './main';

async function exemploUsoMain() {
  console.log('🎯 EXEMPLOS DE USO DO MAIN.TS\n');
  
  // Criar instância do Main
  const main = new Main();
  
  // 1. VALIDAR DADOS DE USUÁRIO
  console.log('1️⃣ VALIDAÇÃO DE DADOS DE USUÁRIO:');
  const dadosUsuario = {
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: 'senha123',
    cpf: '123.456.789-09',
    telefone: '53999999999'
  };
  
  const validacaoUsuario = main.validarDadosUsuario(dadosUsuario);
  console.log(`✅ Válido: ${validacaoUsuario.valido}`);
  if (validacaoUsuario.erros.length > 0) {
    console.log(`❌ Erros: ${validacaoUsuario.erros.join(', ')}`);
  }
  if (validacaoUsuario.warnings.length > 0) {
    console.log(`⚠️ Avisos: ${validacaoUsuario.warnings.join(', ')}`);
  }
  
  // 2. VALIDAR DADOS DE DENÚNCIA
  console.log('\n2️⃣ VALIDAÇÃO DE DADOS DE DENÚNCIA:');
  const dadosDenuncia = {
    tipo: 'Buraco na via',
    endereco: 'Rua das Flores, 123',
    descricao: 'Há um buraco grande na rua que está causando problemas para os carros',
    referencia: 'Próximo ao mercado',
    foto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...'
  };
  
  const validacaoDenuncia = main.validarDadosDenuncia(dadosDenuncia);
  console.log(`✅ Válido: ${validacaoDenuncia.valido}`);
  if (validacaoDenuncia.erros.length > 0) {
    console.log(`❌ Erros: ${validacaoDenuncia.erros.join(', ')}`);
  }
  if (validacaoDenuncia.warnings.length > 0) {
    console.log(`⚠️ Avisos: ${validacaoDenuncia.warnings.join(', ')}`);
  }
  
  // 3. EXECUTAR TESTES ESPECÍFICOS
  console.log('\n3️⃣ EXECUTANDO TESTES ESPECÍFICOS:');
  console.log('📋 Os métodos de teste específicos são privados, mas você pode usar o método público executarTodosTestes()');
  
  // 4. EXECUTAR TODOS OS TESTES
  console.log('\n4️⃣ EXECUTANDO TODOS OS TESTES:');
  const resultadoCompleto = await main.executarTodosTestes();
  console.log(`📊 Resultado final: ${resultadoCompleto.sucesso} sucessos, ${resultadoCompleto.falha} falhas`);
  
  console.log('\n🎉 Exemplos concluídos!');
}

// Executar os exemplos
exemploUsoMain().catch(console.error);
