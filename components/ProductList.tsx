
import React, { useState } from 'react';
import { 
  Produto, 
  CustosFixos, 
  CustosVariaveis, 
  Equipamento, 
  MaoDeObra 
} from '../types';
import { calculatePricing } from '../utils/calculations';

interface ProductListProps {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  fixos: CustosFixos;
  variaveis: CustosVariaveis;
  equipamentos: Equipamento[];
  maoDeObra: MaoDeObra;
}

const ProductList: React.FC<ProductListProps> = ({ 
  produtos, 
  setProdutos,
  fixos,
  variaveis,
  equipamentos,
  maoDeObra
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState<Partial<Produto>>({
    nomeProduto: '',
    tipoProduto: '',
    materialPrincipal: 'sublimatico',
    custoBranco: 0,
    custoEmbalagem: 0,
    tempoProducaoMin: 0,
    temRateio: true
  });

  const [quickEditData, setQuickEditData] = useState<Partial<Produto> | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      nomeProduto: '',
      tipoProduto: '',
      materialPrincipal: 'sublimatico',
      custoBranco: 0,
      custoEmbalagem: 0,
      tempoProducaoMin: 0,
      temRateio: true
    });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (p: Produto, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(p);
    setEditingId(p.id);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.nomeProduto) return;

    const finalProduct: Produto = {
      id: editingId || Date.now().toString(),
      nomeProduto: formData.nomeProduto || '',
      tipoProduto: formData.tipoProduto || '',
      materialPrincipal: (formData.materialPrincipal as any) || 'sublimatico',
      custoBranco: Number(formData.custoBranco) || 0,
      custoEmbalagem: Number(formData.custoEmbalagem) || 0,
      tempoProducaoMin: Number(formData.tempoProducaoMin) || 0,
      temRateio: formData.temRateio ?? true
    };

    if (editingId) {
      setProdutos(prev => prev.map(p => p.id === editingId ? finalProduct : p));
      triggerSuccess('Produto atualizado!');
    } else {
      setProdutos(prev => [...prev, finalProduct]);
      triggerSuccess('Novo produto cadastrado!');
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const handleQuickSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (quickEditData) {
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...quickEditData } as Produto : p));
      triggerSuccess('Valores atualizados!');
      setQuickEditData(null);
    }
  };

  const removeProd = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza? Isso excluirá o produto permanentemente.')) {
      setProdutos(produtos.filter(p => p.id !== id));
      triggerSuccess('Produto removido.');
    }
  };

  const downloadProduct = (p: Produto, e: React.MouseEvent) => {
    e.stopPropagation();
    const pricing = getPricingData(p);
    const exportData = {
      produto: p,
      precificacaoSugerida: pricing,
      configuracoesNegocio: { fixos, variaveis, maoDeObra },
      dataExportacao: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${p.nomeProduto.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerSuccess('Dados exportados!');
  };

  const shareProduct = (p: Produto, e: React.MouseEvent) => {
    e.stopPropagation();
    const pricing = getPricingData(p);
    const text = `💰 Precificação: ${p.nomeProduto}\n📦 Custo Unitário: ${formatCurrency(pricing.custoTotalUnitario)}\n✨ Venda Sugerida: ${formatCurrency(pricing.precoVendaFinal)}\n📈 Margem: ${pricing.lucroPercentReal.toFixed(1)}%`;

    if (navigator.share) {
      navigator.share({ title: p.nomeProduto, text }).catch(() => {
        navigator.clipboard.writeText(text);
        triggerSuccess('Texto copiado!');
      });
    } else {
      navigator.clipboard.writeText(text);
      triggerSuccess('Resumo copiado!');
    }
  };

  const toggleExpand = (p: Produto) => {
    if (isAdding) return; 
    if (expandedId === p.id) {
      setExpandedId(null);
      setQuickEditData(null);
    } else {
      setExpandedId(p.id);
      setQuickEditData({
        custoBranco: p.custoBranco,
        custoEmbalagem: p.custoEmbalagem,
        tempoProducaoMin: p.tempoProducaoMin,
        temRateio: p.temRateio
      });
    }
  };

  const getPricingData = (p: Produto) => {
    return calculatePricing(p, fixos, variaveis, equipamentos, maoDeObra, 1, 100);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getMaterialIcon = (mat: string) => {
    switch (mat) {
      case 'sublimatico': return '🖨️';
      case 'foto': return '📸';
      case 'dtf': return '👕';
      case 'xerox': return '📄';
      case 'adesivo': return '🏷️';
      case 'powerfilme': return '🎞️';
      default: return '📦';
    }
  };

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          * { animation: none !important; transition: none !important; transform: none !important; }
          aside, nav, .no-print, button, header .flex { display: none !important; }
          main { background: white !important; padding: 0 !important; width: 100% !important; margin: 0 !important; }
          #product-catalog-list { display: block !important; width: 100% !important; }
          .shadow-xl, .shadow-sm, .shadow-md, .shadow-2xl { box-shadow: none !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 8px !important; }
          .border-indigo-400 { border-color: #e2e8f0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />

      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-full duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest border border-slate-700">
            <span className="text-emerald-400">✓</span> {successMsg}
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Catálogo de Produtos</h2>
          <p className="text-slate-500 text-sm font-medium">Gerencie seu catálogo e preços sugeridos.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto no-print">
          <button 
            onClick={handlePrint} 
            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95"
          >
            🖨️ IMPRIMIR LISTA
          </button>
          <button 
            onClick={handleOpenAdd} 
            className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            + NOVO PRODUTO
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-2xl mb-8 animate-in slide-in-from-top-4 duration-300 no-print">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase">{editingId ? '✏️ Editar Produto' : '📦 Novo Cadastro'}</h3>
            <button onClick={() => setIsAdding(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-400">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Produto</label>
              <input type="text" value={formData.nomeProduto} onChange={e => setFormData({...formData, nomeProduto: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo Branco (Compra)</label>
              <input type="number" step="0.01" value={formData.custoBranco} onChange={e => setFormData({...formData, custoBranco: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo Base</label>
              <select value={formData.materialPrincipal} onChange={e => setFormData({...formData, materialPrincipal: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                <option value="sublimatico">Sublimático</option>
                <option value="foto">Fotográfico</option>
                <option value="dtf">Filme DTF</option>
                <option value="adesivo">Adesivo</option>
                <option value="powerfilme">Power Filme</option>
                <option value="xerox">Xerox</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-lg">SALVAR PRODUTO</button>
            <button onClick={() => setIsAdding(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase">CANCELAR</button>
          </div>
        </div>
      )}

      <div id="product-catalog-list" className="space-y-3">
        {produtos.map(p => {
          const isExpanded = expandedId === p.id;
          const pricing = getPricingData(p);

          return (
            <div 
              key={p.id} 
              className={`bg-white transition-all overflow-hidden border ${
                isExpanded ? 'border-indigo-400 shadow-xl rounded-[2rem]' : 'border-slate-200 rounded-2xl hover:border-slate-300'
              }`}
            >
              <div onClick={() => toggleExpand(p)} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer select-none group">
                <div className="col-span-1 md:col-span-4 flex gap-3 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {getMaterialIcon(p.materialPrincipal)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{p.nomeProduto}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{formatCurrency(p.custoBranco)} (Compra)</p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 text-right">
                   <span className="md:hidden text-[9px] font-black text-slate-400 uppercase block mb-1">Venda Final Sugerida</span>
                   <p className="text-xl font-black text-emerald-600 leading-none">{formatCurrency(pricing.precoVendaFinal)}</p>
                </div>

                <div className="col-span-1 md:col-span-5 flex justify-end items-center gap-2 no-print">
                   <button 
                    onClick={(e) => shareProduct(p, e)}
                    className="flex-1 md:flex-none px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
                   >
                     📤 COMPARTILHAR
                   </button>
                   
                   <button 
                    onClick={(e) => removeProd(p.id, e)}
                    className="flex-1 md:flex-none px-5 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-rose-100 flex items-center justify-center gap-2 hover:bg-rose-700 transition-all active:scale-95"
                   >
                     🗑️ EXCLUIR
                   </button>

                   <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                   </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-8 bg-indigo-50/20 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="h-px bg-slate-200/50 w-full mb-8"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento dos Custos (Unitário)</h5>
                       <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-50">
                         <span className="text-slate-500">Custo Branco</span>
                         <span className="font-bold text-slate-800">{formatCurrency(p.custoBranco)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-50">
                         <span className="text-slate-500">Mão de Obra</span>
                         <span className="font-bold text-slate-800">{formatCurrency(pricing.custoMaoDeObra)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-50">
                         <span className="text-slate-500">Custos Variáveis</span>
                         <span className="font-bold text-slate-800">{formatCurrency(pricing.custoVariavel)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm pt-2 font-bold text-emerald-600">
                         <span>LUCRO LÍQUIDO ESPERADO</span>
                         <span>{formatCurrency(pricing.lucroUnitario)}</span>
                       </div>
                    </div>

                    <div className="space-y-3 no-print" onClick={e => e.stopPropagation()}>
                       <button onClick={(e) => handleOpenEdit(p, e)} className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-colors">✏️ EDITAR CADASTRO COMPLETO</button>
                       <button onClick={(e) => downloadProduct(p, e)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-slate-800 transition-colors">💾 BAIXAR RELATÓRIO JSON</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
