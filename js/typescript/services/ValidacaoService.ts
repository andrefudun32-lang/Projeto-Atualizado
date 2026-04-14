// SERVIÇO DE VALIDAÇÃO TYPESCRIPT
// Gerencia validações de dados e formulários
// Implementa polimorfismo para diferentes tipos de usuário

import { Denuncia } from '../Denuncia';
import { Usuario } from '../Usuario';
import { UsuarioAdm } from '../UsuarioAdm';
import { TipoDenuncia } from '../enums/TipoDenuncia';

export class ValidacaoService {
  
  // Método para validar formulário de denúncia (polimórfico)
  public validarFormularioDenuncia(dados: any, usuario: Usuario | UsuarioAdm): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    // Validação do tipo de denúncia
    if (!dados.tipo || dados.tipo.trim() === '') {
      erros.push('Tipo de denúncia é obrigatório');
    } else if (!this.validarTipoDenuncia(dados.tipo)) {
      erros.push('Tipo de denúncia inválido');
    }

    // Validação do endereço
    if (!dados.endereco || dados.endereco.trim() === '') {
      erros.push('Endereço é obrigatório');
    } else if (!this.validarEndereco(dados.endereco)) {
      erros.push('Endereço deve ter entre 5 e 255 caracteres');
    }

    // Validação da descrição
    if (!dados.descricao || dados.descricao.trim() === '') {
      erros.push('Descrição é obrigatória');
    } else if (!this.validarDescricao(dados.descricao, usuario)) {
      // Polimorfismo: validação diferente baseada no tipo de usuário
      if (usuario instanceof Usuario) {
        erros.push('Descrição deve ter entre 10 e 500 caracteres');
      } else if (usuario instanceof UsuarioAdm) {
        erros.push('Descrição deve ter pelo menos 5 caracteres');
      }
    }

    // Validação da referência (opcional)
    if (dados.referencia && !this.validarReferencia(dados.referencia)) {
      erros.push('Referência deve ter no máximo 255 caracteres');
    }

    // Validação da foto (opcional)
    if (dados.foto && !this.validarFoto(dados.foto)) {
      erros.push('Formato de foto inválido. Use JPEG, PNG, GIF ou WebP');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Método para validar dados de usuário (polimórfico)
  public validarDadosUsuario(dados: any, tipoUsuario: 'comum' | 'admin'): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    // Validação do nome
    if (!dados.nome || dados.nome.trim() === '') {
      erros.push('Nome é obrigatório');
    } else if (dados.nome.length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }

    // Validação do email
    if (!dados.email || dados.email.trim() === '') {
      erros.push('Email é obrigatório');
    } else if (!this.validarEmail(dados.email)) {
      erros.push('Email inválido');
    }

    // Validação da senha
    if (!dados.senha || dados.senha.trim() === '') {
      erros.push('Senha é obrigatória');
    } else if (!this.validarSenha(dados.senha, tipoUsuario)) {
      // Polimorfismo: validação diferente para usuários e admins
      if (tipoUsuario === 'comum') {
        erros.push('Senha deve ter pelo menos 6 caracteres');
      } else {
        erros.push('Senha de administrador deve ter pelo menos 8 caracteres');
      }
    }

    // Validações específicas para usuários comuns
    if (tipoUsuario === 'comum') {
      if (dados.cpf && !this.validarCPF(dados.cpf)) {
        erros.push('CPF inválido');
      }
      
      if (dados.telefone && !this.validarTelefone(dados.telefone)) {
        erros.push('Telefone inválido');
      }
    }

    // Validações específicas para administradores
    if (tipoUsuario === 'admin') {
      if (!dados.cargo || dados.cargo.trim() === '') {
        erros.push('Cargo é obrigatório para administradores');
      }
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Validação de tipo de denúncia
  private validarTipoDenuncia(tipo: string): boolean {
    const tiposValidos = Object.values(TipoDenuncia);
    return tiposValidos.includes(tipo as TipoDenuncia);
  }

  // Validação de endereço
  private validarEndereco(endereco: string): boolean {
    return endereco.length >= 5 && endereco.length <= 255;
  }

  // Validação de descrição (polimórfica)
  private validarDescricao(descricao: string, usuario: Usuario | UsuarioAdm): boolean {
    if (usuario instanceof Usuario) {
      // Usuários comuns: descrição mais rigorosa
      return descricao.length >= 10 && descricao.length <= 500;
    } else if (usuario instanceof UsuarioAdm) {
      // Administradores: descrição mais flexível
      return descricao.length >= 5 && descricao.length <= 1000;
    }
    
    return false;
  }

  // Validação de referência
  private validarReferencia(referencia: string): boolean {
    return referencia.length <= 255;
  }

  // Validação de foto
  private validarFoto(foto: string): boolean {
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    return base64Regex.test(foto);
  }

  // Validação de email
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validação de senha (polimórfica)
  private validarSenha(senha: string, tipoUsuario: 'comum' | 'admin'): boolean {
    if (tipoUsuario === 'comum') {
      return senha.length >= 6;
    } else {
      return senha.length >= 8;
    }
  }

  // Validação de CPF
  private validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    if (cpfLimpo.length !== 11) return false;

    // Validação do CPF
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

    return true;
  }

  // Validação de telefone
  private validarTelefone(telefone: string): boolean {
    const telefoneLimpo = telefone.replace(/[^\d]/g, '');
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
  }

  // Método para sanitizar dados (polimórfico)
  public sanitizarDados(dados: any, tipo: 'denuncia' | 'usuario'): any {
    const sanitizados = { ...dados };

    if (tipo === 'denuncia') {
      sanitizados.tipo = sanitizados.tipo?.trim();
      sanitizados.endereco = sanitizados.endereco?.trim();
      sanitizados.referencia = sanitizados.referencia?.trim();
      sanitizados.descricao = sanitizados.descricao?.trim();
    } else if (tipo === 'usuario') {
      sanitizados.nome = sanitizados.nome?.trim();
      sanitizados.email = sanitizados.email?.trim().toLowerCase();
      sanitizados.telefone = sanitizados.telefone?.replace(/[^\d]/g, '');
      sanitizados.cpf = sanitizados.cpf?.replace(/[^\d]/g, '');
    }

    return sanitizados;
  }
}
