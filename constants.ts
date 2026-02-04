
import { Produto, CustosFixos, CustosVariaveis, Equipamento, MaoDeObra, Empresa } from './types';

export const INITIAL_EMPRESA: Empresa = {
  nome: 'Minha Empresa de Personalizados',
  telefone: '(00) 00000-0000',
  endereco: 'Rua das Flores, 123 - Centro',
  logoUrl: ''
};

export const INITIAL_CUSTOS_FIXOS: CustosFixos = {
  aluguel: 1200,
  agua: 80,
  energia: 150,
  internet: 100,
  contador: 300,
  marketing: 200,
  impostos: 150,
  outros: 100,
  producaoMensal: 200,
};

export const INITIAL_CUSTOS_VARIAVEIS: CustosVariaveis = {
  papelSublimatico: 0.5,
  papelFoto: 1.2,
  papelDTF: 3.5,
  custoXerox: 0.15,
  papelAdesivo: 0.85,
  powerFilme: 4.50,
  tinta: 0.3,
  energiaPrensa: 0.2,
  energiaImpressora: 0.1,
  taxaCartaoPercent: 4.99,
  refugoPercent: 5,
};

export const INITIAL_EQUIPAMENTOS: Equipamento[] = [
  {
    id: '1',
    nomeEquipamento: 'Prensa Plana 38x38',
    valorCompra: 1800,
    vidaUtilMeses: 36,
    usoMensal: 1000,
  },
  {
    id: '2',
    nomeEquipamento: 'Impressora Sublimática',
    valorCompra: 1500,
    vidaUtilMeses: 24,
    usoMensal: 800,
  }
];

export const INITIAL_PRODUTOS: Produto[] = [
  {
    id: '1',
    nomeProduto: 'Caneca de Cerâmica Branca',
    tipoProduto: 'Sublimação',
    materialPrincipal: 'sublimatico',
    custoBranco: 12.50,
    custoEmbalagem: 1.50,
    tempoProducaoMin: 15,
    temRateio: true,
  },
  {
    id: '2',
    nomeProduto: 'Impressão de Foto 10x15',
    tipoProduto: 'Fotografia',
    materialPrincipal: 'foto',
    custoBranco: 0,
    custoEmbalagem: 0.50,
    tempoProducaoMin: 2,
    temRateio: true,
  }
];

export const INITIAL_MAO_DE_OBRA: MaoDeObra = {
  valorHora: 25.00,
  salarioAlvo: 3000,
  diasMes: 22,
  horasDia: 8
};
