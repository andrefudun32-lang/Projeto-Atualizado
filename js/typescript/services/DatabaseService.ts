// SERVIÇO DE BANCO DE DADOS TYPESCRIPT
// Gerencia operações de banco de dados
// Simula conexão com MySQL para desenvolvimento

import { Usuario } from '../Usuario';
import { UsuarioAdm } from '../UsuarioAdm';
import { Denuncia } from '../Denuncia';
import { TipoDenuncia } from '../enums/TipoDenuncia';
import { StatusDenuncia } from '../enums/StatusDenuncia';

// Interface para dados do banco
interface DenunciaDB {
  id: number;              // ID único da denúncia
  tipo: string;            // Tipo da denúncia
  endereco: string;        // Endereço onde ocorreu
  referencia?: string;     // Ponto de referência
  descricao: string;       // Descrição detalhada
  foto?: string;          // Foto em Base64
  usuario_id: number;      // ID do usuário
  data_denuncia: string;
}

interface UsuarioDB {
  id: number;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_cadastro: string;
}

interface UsuarioAdmDB {
  id: number;
  nome: string;
  email: string;
  senha: string;
  cargo?: string;
  departamento?: string;
}

// Serviço para operações com banco de dados real
export class DatabaseService {
  private baseUrl: string = 'http://localhost:3000/api';

  // Converter dados do banco para objetos das classes
  private converterDenunciaDB(denunciaDB: DenunciaDB): Denuncia {
    const denuncia = new Denuncia(
      denunciaDB.tipo as TipoDenuncia,
      denunciaDB.endereco,
      denunciaDB.descricao,
      denunciaDB.usuario_id,
      denunciaDB.referencia,
      denunciaDB.foto
    );
    
    denuncia.id = denunciaDB.id;
    denuncia.data_denuncia = new Date(denunciaDB.data_denuncia);
    denuncia.status = StatusDenuncia.PENDENTE; // Status padrão
    
    return denuncia;
  }

  private converterUsuarioDB(usuarioDB: UsuarioDB): Usuario {
    const usuario = new Usuario(
      usuarioDB.nome,
      usuarioDB.email,
      usuarioDB.senha,
      usuarioDB.telefone,
      usuarioDB.cpf,
      usuarioDB.data_nascimento ? new Date(usuarioDB.data_nascimento) : undefined,
      usuarioDB.endereco,
      usuarioDB.cidade,
      usuarioDB.estado,
      usuarioDB.cep
    );
    
    usuario.id = usuarioDB.id;
    usuario.data_cadastro = new Date(usuarioDB.data_cadastro);
    
    return usuario;
  }

  private converterUsuarioAdmDB(usuarioAdmDB: UsuarioAdmDB): UsuarioAdm {
    const usuarioAdm = new UsuarioAdm(
      usuarioAdmDB.nome,
      usuarioAdmDB.email,
      usuarioAdmDB.senha,
      usuarioAdmDB.cargo || 'Administrador',
      usuarioAdmDB.departamento || 'Geral'
    );
    
    usuarioAdm.id = usuarioAdmDB.id;
    
    return usuarioAdm;
  }

  // Buscar todas as denúncias do banco
  public async buscarTodasDenuncias(): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/denuncias`);
      
      if (!response.ok) {
        return { success: false, error: 'Erro ao conectar com o servidor' };
      }

      const denunciasDB: DenunciaDB[] = await response.json() as DenunciaDB[];
      const denuncias = denunciasDB.map(denunciaDB => this.converterDenunciaDB(denunciaDB));
      
      return { success: true, data: denuncias };
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Buscar denúncias por usuário
  public async buscarDenunciasPorUsuario(usuarioId: number): Promise<{ success: boolean; data?: Denuncia[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/denuncias`);
      
      if (!response.ok) {
        return { success: false, error: 'Erro ao conectar com o servidor' };
      }

      const denunciasDB: DenunciaDB[] = await response.json() as DenunciaDB[];
      const denunciasFiltradas = denunciasDB
        .filter(denunciaDB => denunciaDB.usuario_id === usuarioId)
        .map(denunciaDB => this.converterDenunciaDB(denunciaDB));
      
      return { success: true, data: denunciasFiltradas };
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Criar nova denúncia no banco
  public async criarDenuncia(denuncia: Denuncia): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const dadosDenuncia = {
        tipo: denuncia.tipo,
        endereco: denuncia.endereco,
        referencia: denuncia.referencia,
        descricao: denuncia.descricao,
        foto: denuncia.foto,
        usuario_id: denuncia.usuario_id
      };

      const response = await fetch(`${this.baseUrl}/denuncias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosDenuncia)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: (data as any).error || 'Erro ao criar denúncia' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Buscar usuário por email (simulação - em produção viria de uma API de usuários)
  public async buscarUsuarioPorEmail(email: string): Promise<{ success: boolean; data?: Usuario; error?: string }> {
    // Simulação de usuários existentes no banco
    const usuariosExistentes: UsuarioDB[] = [
      {
        id: 1,
        nome: 'Rafael Silva',
        email: 'rafa@email.com',
        senha: '123',
        telefone: '53999999999',
        cpf: '123.456.789-09',
        data_nascimento: '1990-01-01',
        endereco: 'Rua das Flores, 123',
        cidade: 'Pelotas',
        estado: 'RS',
        cep: '96015-000',
        data_cadastro: '2024-01-01T00:00:00.000Z'
      }
    ];

    const usuarioDB = usuariosExistentes.find(u => u.email === email);
    
    if (usuarioDB) {
      const usuario = this.converterUsuarioDB(usuarioDB);
      return { success: true, data: usuario };
    } else {
      return { success: false, error: 'Usuário não encontrado' };
    }
  }

  // Buscar administrador por email (simulação)
  public async buscarAdministradorPorEmail(email: string): Promise<{ success: boolean; data?: UsuarioAdm; error?: string }> {
    // Simulação de administradores existentes
    const adminsExistentes: UsuarioAdmDB[] = [
      {
        id: 1,
        nome: 'Admin Sistema',
        email: 'admin@denunciapelotas.com',
        senha: 'admin123',
        cargo: 'Administrador',
        departamento: 'TI'
      },
      {
        id: 2,
        nome: 'Gerente Geral',
        email: 'gerente@denunciapelotas.com',
        senha: 'gerente123',
        cargo: 'Gerente',
        departamento: 'Operações'
      }
    ];

    const adminDB = adminsExistentes.find(a => a.email === email);
    
    if (adminDB) {
      const admin = this.converterUsuarioAdmDB(adminDB);
      return { success: true, data: admin };
    } else {
      return { success: false, error: 'Administrador não encontrado' };
    }
  }

  // Obter estatísticas das denúncias
  public async obterEstatisticas(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/denuncias`);
      
      if (!response.ok) {
        return { success: false, error: 'Erro ao conectar com o servidor' };
      }

      const denunciasDB: DenunciaDB[] = await response.json() as DenunciaDB[];
      
      const estatisticas = {
        total: denunciasDB.length,
        pendentes: denunciasDB.filter(d => !d.data_denuncia || new Date(d.data_denuncia) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        emAndamento: denunciasDB.filter(d => d.descricao.includes('análise') || d.descricao.includes('processo')).length,
        resolvidas: denunciasDB.filter(d => d.descricao.includes('resolvido') || d.descricao.includes('concluído')).length,
        porTipo: this.agruparPorTipo(denunciasDB),
        porMes: this.agruparPorMes(denunciasDB)
      };
      
      return { success: true, data: estatisticas };
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  // Agrupar denúncias por tipo
  private agruparPorTipo(denuncias: DenunciaDB[]): { [key: string]: number } {
    const agrupamento: { [key: string]: number } = {};
    
    denuncias.forEach(denuncia => {
      const tipo = denuncia.tipo;
      agrupamento[tipo] = (agrupamento[tipo] || 0) + 1;
    });
    
    return agrupamento;
  }

  // Agrupar denúncias por mês
  private agruparPorMes(denuncias: DenunciaDB[]): { [key: string]: number } {
    const agrupamento: { [key: string]: number } = {};
    
    denuncias.forEach(denuncia => {
      const data = new Date(denuncia.data_denuncia);
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
      agrupamento[mesAno] = (agrupamento[mesAno] || 0) + 1;
    });
    
    return agrupamento;
  }

}
