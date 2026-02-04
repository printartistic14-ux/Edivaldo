
import { 
  Produto, 
  CustosFixos, 
  CustosVariaveis, 
  Equipamento, 
  MaoDeObra, 
  PricingResult 
} from '../types';

export const calculatePricing = (
  produto: Produto,
  fixos: CustosFixos,
  variaveis: CustosVariaveis,
  equipamentos: Equipamento[],
  maoDeObra: MaoDeObra,
  quantidade: number,
  lucroDesejadoPercent: number
): PricingResult => {
  // 1. Custo Fixo Total Mensal
  const custoFixoTotal = fixos.aluguel + fixos.agua + fixos.energia + fixos.internet + 
                        fixos.contador + fixos.marketing + fixos.impostos + fixos.outros;

  // 2. Custo Fixo Unitário (Baseado na Produção Mensal)
  const custoFixoBase = fixos.producaoMensal > 0 ? custoFixoTotal / fixos.producaoMensal : 0;
  const custoFixoUnitario = produto.temRateio ? custoFixoBase : 0;

  // 3. Depreciação de Equipamentos (Custo por uso baseado em uso mensal total)
  const custoEquipamento = equipamentos.reduce((acc, eq) => {
    const depreciacaoUnitaria = (eq.usoMensal > 0 && eq.vidaUtilMeses > 0) 
      ? (eq.valorCompra / eq.vidaUtilMeses) / eq.usoMensal 
      : 0;
    return acc + depreciacaoUnitaria;
  }, 0);

  // 4. Seleção do Custo do Material Principal
  let custoMaterialPrincipal = 0;
  switch (produto.materialPrincipal) {
    case 'sublimatico': custoMaterialPrincipal = variaveis.papelSublimatico; break;
    case 'foto': custoMaterialPrincipal = variaveis.papelFoto; break;
    case 'dtf': custoMaterialPrincipal = variaveis.papelDTF; break;
    case 'xerox': custoMaterialPrincipal = variaveis.custoXerox; break;
    case 'adesivo': custoMaterialPrincipal = variaveis.papelAdesivo; break;
    case 'powerfilme': custoMaterialPrincipal = variaveis.powerFilme; break;
    default: custoMaterialPrincipal = 0;
  }

  // 5. Custo Variável Unitário (Tinta + Papel + Energia Prensa)
  const custoVariavel = custoMaterialPrincipal + (variaveis.tinta || 0) + (variaveis.energiaPrensa || 0);

  // 6. Refugo (Percentual sobre custo de material e branco)
  const custoRefugo = (custoVariavel + produto.custoBranco) * (Math.max(0, variaveis.refugoPercent) / 100);

  // 7. Mão de Obra (Baseado no tempo de produção e valor/hora)
  const custoMaoDeObra = (maoDeObra.valorHora / 60) * (produto.tempoProducaoMin || 0);

  // 8. Custo Direto Unitário
  const custoDireto = produto.custoBranco + (produto.custoEmbalagem || 0) + custoVariavel + 
                      custoRefugo + custoEquipamento + custoMaoDeObra;

  // 9. Custo Total Unitário (Com Rateio Fixo)
  const custoTotalUnitario = custoDireto + custoFixoUnitario;

  // 10. Custo Total do Pedido
  const custoTotalPedido = custoTotalUnitario * Math.max(1, quantidade);

  // 11. Preço Mínimo (Ponto de Equilíbrio)
  const precoMinimo = custoTotalUnitario;

  // 12. Preço de Venda (Markup sobre o custo total)
  const precoVendaBase = custoTotalUnitario * (1 + (Math.max(0, lucroDesejadoPercent) / 100));

  // 13. Taxa de Cartão (Markup divisor para garantir que a taxa seja descontada do preço final)
  const taxaPercent = Math.min(99, Math.max(0, variaveis.taxaCartaoPercent));
  const divisorTaxa = 1 - (taxaPercent / 100);
  const precoVendaFinal = precoVendaBase / (divisorTaxa || 1);
  const valorTaxaCartao = precoVendaFinal - precoVendaBase;

  // 14. Lucro Real Final
  const lucroUnitario = precoVendaFinal - custoTotalUnitario - valorTaxaCartao;
  const lucroTotal = lucroUnitario * Math.max(1, quantidade);
  const lucroPercentReal = precoVendaFinal > 0 ? (lucroUnitario / precoVendaFinal) * 100 : 0;

  return {
    custoFixoTotal,
    custoFixoUnitario,
    custoEquipamento,
    custoVariavel,
    custoRefugo,
    custoMaoDeObra,
    custoDireto,
    custoTotalUnitario,
    custoTotalPedido,
    precoMinimo,
    precoVenda: precoVendaBase,
    valorTaxaCartao,
    precoVendaFinal,
    lucroUnitario,
    lucroTotal,
    lucroPercentReal
  };
};
