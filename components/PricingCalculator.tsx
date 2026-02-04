
import React, { useState, useMemo } from 'react';
import { 
  Produto, 
  CustosFixos, 
  CustosVariaveis, 
  Equipamento, 
  MaoDeObra,
  PricingResult,
  Empresa
} from '../types';
import { calculatePricing } from '../utils/calculations';

interface PricingCalculatorProps {
  produtos: Produto[];
  fixos: CustosFixos;
  variaveis: CustosVariaveis;
  equipamentos: Equipamento[];
  maoDeObra: MaoDeObra;
  empresa: Empresa;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  produtos, fixos, variaveis, equipamentos, maoDeObra, empresa
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [lucroDesejado, setLucroDesejado] = useState<number>(100);
  const [printMode, setPrintMode] = useState<'internal' | 'client'>('internal');

  const selectedProduto = produtos.find(p => p.id === selectedProductId);

  const result = useMemo(() => {
    if (!selectedProduto) return null;
    return calculatePricing(
      selectedProduto,
      fixos,
      variaveis,
      equipamentos,
      maoDeObra,
      quantidade,
      lucroDesejado
    );
  }, [selectedProduto, fixos, variaveis, equipamentos, maoDeObra, Math.max(1, quantidade), lucroDesejado]);

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  if (produtos.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="text-6xl">📦</div>
        <h2 className="text-2xl font-bold">Nenhum produto cadastrado</h2>
        <p className="text-slate-500">Cadastre seus produtos para começar a precificar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          * { animation: none !important; transition: none !important; transform: none !important; }
          aside, nav, .no-print, button, select, input { display: none !important; }
          body, #root, main { background: white !important; margin: 0 !important; padding: 0 !important; width: 100% !important; display: block !important; }
          #print-area { display: block !important; width: 100% !important; visibility: visible !important; }
          .rounded-3xl { border-radius: 8px !important; }
          .bg-indigo-600 { background-color: #f8fafc !important; color: #000 !important; border-bottom: 2px solid #000 !important; }
          .text-white, .text-indigo-100 { color: #000 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />

      <div className="lg:col-span-5 space-y-6 no-print">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b pb-4">Dados do Pedido</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Produto</label>
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold">
                <option value="">Selecione um produto...</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.nomeProduto}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Qtd.</label>
                <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Margem (%)</label>
                <input type="number" min="0" value={lucroDesejado} onChange={(e) => setLucroDesejado(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        {!result ? (
          <div className="bg-slate-100 border-2 border-dashed border-slate-200 h-full rounded-3xl flex flex-col items-center justify-center text-slate-400 p-12 text-center no-print">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium text-lg text-slate-500">Aguardando seleção de produto</p>
          </div>
        ) : (
          <div id="print-area" className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="hidden print:flex flex-col border-b-2 border-slate-900 pb-6 mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{empresa.nome}</h1>
              <p className="text-[10px] font-bold text-slate-600 uppercase">📞 {empresa.telefone} | 📍 {empresa.endereco}</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-indigo-600 p-8 text-white text-center print:bg-slate-50 print:text-slate-900 print:border-b-2 print:border-slate-200">
                <p className="text-indigo-100 font-medium mb-1 uppercase text-xs print:text-slate-500">
                  {printMode === 'internal' ? 'Preço de Venda Sugerido' : 'Valor Total do Orçamento'}
                </p>
                <h2 className="text-5xl font-black">R$ {result.precoVendaFinal.toFixed(2)}</h2>
                <div className="mt-2 text-xs opacity-80 print:text-slate-400">Referente a {quantidade} unidade(s)</div>
              </div>
              
              <div className="p-8 space-y-6">
                {printMode === 'internal' ? (
                  <div className="space-y-3 text-sm border-t pt-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detalhamento de Custos</h5>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>📦 Item Branco</span>
                      <span className="font-bold">R$ {selectedProduto?.custoBranco.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>👷 Mão de Obra</span>
                      <span className="font-bold">R$ {result.custoMaoDeObra.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-600 border-t border-dashed pt-2">
                      <span>💳 Taxas ({variaveis.taxaCartaoPercent}%)</span>
                      <span className="font-bold">R$ {result.valorTaxaCartao.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm border-t pt-6 text-center">
                    <p className="text-emerald-700 font-bold uppercase tracking-wider">Agradecemos pela preferência!</p>
                    <p className="text-[10px] text-slate-500">Validade: 7 dias corridos.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4 no-print">
                   <div className="flex-1 flex bg-slate-100 p-1 rounded-2xl">
                     <button onClick={() => setPrintMode('internal')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${printMode === 'internal' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>Relatório Interno</button>
                     <button onClick={() => setPrintMode('client')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${printMode === 'client' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>Orçamento</button>
                   </div>
                   <button onClick={handlePrint} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">🖨️ IMPRIMIR PDF</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingCalculator;
