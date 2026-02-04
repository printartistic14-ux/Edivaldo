
export interface Produto {
  id: string;
  nomeProduto: string;
  tipoProduto: string;
  materialPrincipal: 'sublimatico' | 'foto' | 'dtf' | 'xerox' | 'adesivo' | 'powerfilme' | 'nenhum';
  custoBranco: number;
  custoEmbalagem: number;
  tempoProducaoMin: number;
  temRateio: boolean;
}

export interface Empresa {
  nome: string;
  telefone: string;
  endereco: string;
  logoUrl?: string;
}

export interface CustosFixos {
  aluguel: number;
  agua: number;
  energia: number;
  internet: number;
  contador: number;
  marketing: number;
  impostos: number;
  outros: number;
  producaoMensal: number;
}

export interface CustosVariaveis {
  papelSublimatico: number;
  papelFoto: number;
  papelDTF: number;
  custoXerox: number;
  papelAdesivo: number;
  powerFilme: number;
  tinta: number;
  energiaPrensa: number;
  energiaImpressora: number;
  taxaCartaoPercent: number;
  refugoPercent: number;
}

export interface Equipamento {
  id: string;
  nomeEquipamento: string;
  valorCompra: number;
  vidaUtilMeses: number;
  usoMensal: number;
}

export interface MaoDeObra {
  valorHora: number;
  salarioAlvo: number;
  diasMes: number;
  horasDia: number;
}

export interface PricingResult {
  custoFixoTotal: number;
  custoFixoUnitario: number;
  custoEquipamento: number;
  custoVariavel: number;
  custoRefugo: number;
  custoMaoDeObra: number;
  custoDireto: number;
  custoTotalUnitario: number;
  custoTotalPedido: number;
  precoMinimo: number;
  precoVenda: number;
  valorTaxaCartao: number;
  precoVendaFinal: number;
  lucroUnitario: number;
  lucroTotal: number;
  lucroPercentReal: number;
}
