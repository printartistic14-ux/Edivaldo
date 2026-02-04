
import React, { useState, useEffect } from 'react';
import { 
  CustosFixos, 
  CustosVariaveis, 
  Equipamento, 
  MaoDeObra,
  Empresa
} from '../types';
import { GoogleGenAI } from "@google/genai";

interface SettingsProps {
  fixos: CustosFixos;
  setFixos: (v: CustosFixos) => void;
  variaveis: CustosVariaveis;
  setVariaveis: (v: CustosVariaveis) => void;
  equipamentos: Equipamento[];
  setEquipamentos: (v: Equipamento[]) => void;
  maoDeObra: MaoDeObra;
  setMaoDeObra: (v: MaoDeObra) => void;
  empresa: Empresa;
  setEmpresa: (v: Empresa) => void;
}

const Settings: React.FC<SettingsProps> = ({
  fixos, setFixos,
  variaveis, setVariaveis,
  equipamentos, setEquipamentos,
  maoDeObra, setMaoDeObra,
  empresa, setEmpresa
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fixos' | 'variaveis' | 'mao' | 'equipamentos' | 'empresa' | 'branding'>('empresa');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Configurações salvas com sucesso!');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Estados da Calculadora de Insumos por Área
  const [calcWidth, setCalcWidth] = useState<number>(0);
  const [calcLength, setCalcLength] = useState<number>(0);
  const [calcPrice, setCalcPrice] = useState<number>(0);
  const [calcTarget, setCalcTarget] = useState<keyof CustosVariaveis>('papelDTF');
  const [fieldErrors, setFieldErrors] = useState<{width?: string, length?: string, price?: string}>({});

  const fixedCostLabels: Record<keyof Omit<CustosFixos, 'producaoMensal'>, string> = {
    aluguel: 'Aluguel / Condomínio',
    agua: 'Conta de Água',
    energia: 'Conta de Luz',
    internet: 'Internet / Telefone',
    contador: 'Contabilidade / MEI',
    marketing: 'Marketing / Anúncios',
    impostos: 'Impostos / Taxas',
    outros: 'Outros Custos'
  };

  useEffect(() => {
    const totalHorasMensais = maoDeObra.diasMes * maoDeObra.horasDia;
    const novoValorHora = maoDeObra.salarioAlvo / (totalHorasMensais || 1);
    
    if (Math.abs(maoDeObra.valorHora - novoValorHora) > 0.001) {
      setMaoDeObra({
        ...maoDeObra,
        valorHora: novoValorHora
      });
    }
  }, [maoDeObra.salarioAlvo, maoDeObra.diasMes, maoDeObra.horasDia, maoDeObra.valorHora, setMaoDeObra]);

  const saveToLocalStorage = (msg?: string) => {
    setIsSaving(true);
    if (msg) setSuccessMessage(msg);
    else setSuccessMessage('Configurações salvas com sucesso!');

    localStorage.setItem('precifica_fixos', JSON.stringify(fixos));
    localStorage.setItem('precifica_variaveis', JSON.stringify(variaveis));
    localStorage.setItem('precifica_equipamentos', JSON.stringify(equipamentos));
    localStorage.setItem('precifica_maoDeObra', JSON.stringify(maoDeObra));
    localStorage.setItem('precifica_empresa', JSON.stringify(empresa));

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  const saveEmpresaOnly = () => {
    setIsSaving(true);
    setSuccessMessage('Dados da empresa salvos com sucesso!');
    localStorage.setItem('precifica_empresa', JSON.stringify(empresa));

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  const generateLogo = async () => {
    setIsGenerating(true);
    try {
      const aistudio = (window as any).aistudio;
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A professional and modern minimalist logo for a business named "${empresa.nome}". The business is a custom products workshop focused on precision, costs, and profit management. Clean design, vector style, white background, high quality.`;
      
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          outputMimeType: 'image/png'
        },
      });

      const base64Data = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/png;base64,${base64Data}`;
      
      setEmpresa({ ...empresa, logoUrl: imageUrl });
      setSuccessMessage('Logotipo gerado com sucesso!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
      console.error('Erro ao gerar logo:', error);
      if (error?.message?.includes('Requested entity was not found')) {
        await (window as any).aistudio.openSelectKey();
      } else {
        alert('Houve um erro ao gerar o logotipo. Verifique sua conexão e chave de API.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFixo = (key: keyof CustosFixos, val: number) => setFixos({ ...fixos, [key]: Math.max(0, val) });
  const updateVariavel = (key: keyof CustosVariaveis, val: number) => setVariaveis({ ...variaveis, [key]: Math.max(0, val) });
  const updateMao = (key: keyof MaoDeObra, val: number) => setMaoDeObra({ ...maoDeObra, [key]: Math.max(0, val) });
  const updateEmpresa = (key: keyof Empresa, val: string) => setEmpresa({ ...empresa, [key]: val });

  const applyCalculatedPrice = () => {
    const errors: {width?: string, length?: string, price?: string} = {};

    if (calcWidth <= 0) errors.width = "Deve ser maior que 0";
    if (calcLength <= 0) errors.length = "Deve ser maior que 0";
    if (calcPrice <= 0) errors.price = "Deve ser maior que 0";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const areaTotalCm2 = calcWidth * calcLength;
    const precoPorCm2 = calcPrice / areaTotalCm2;
    // Baseado em uma folha A4 (aprox 624cm2)
    const custoFinal = precoPorCm2 * 623.7; 
    setVariaveis({ ...variaveis, [calcTarget]: custoFinal });
    
    setSuccessMessage(`Preço de ${calcTarget} recalculado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoFinal)} por A4`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    
    // Resetar campos após sucesso
    setCalcWidth(0);
    setCalcLength(0);
    setCalcPrice(0);
  };

  const addEquipamento = () => {
    const newEq: Equipamento = { id: Date.now().toString(), nomeEquipamento: 'Novo Equipamento', valorCompra: 0, vidaUtilMeses: 36, usoMensal: 1000 };
    setEquipamentos([...equipamentos, newEq]);
  };

  const updateEq = (id: string, key: keyof Equipamento, val: any) => {
    setEquipamentos(equipamentos.map(e => e.id === id ? { ...e, [key]: val } : e));
  };

  const removeEq = (id: string) => {
    setEquipamentos(equipamentos.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-full duration-300">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border-2 border-white/20 backdrop-blur-md">
            <span className="text-xl">✅</span> {successMessage}
          </div>
        </div>
      )}

      <header className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Configurações de Negócio</h2>
          <p className="text-slate-500 text-sm font-medium">Ajuste os pilares financeiros da sua empresa.</p>
        </div>
        <button 
          onClick={() => saveToLocalStorage()}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              SALVANDO...
            </div>
          ) : '💾 SALVAR TUDO'}
        </button>
      </header>

      <div className="flex bg-slate-200 p-1 rounded-2xl w-full max-w-4xl overflow-x-auto whitespace-nowrap scrollbar-hide no-print">
        <button onClick={() => setActiveSubTab('empresa')} className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'empresa' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Minha Empresa</button>
        <button onClick={() => setActiveSubTab('branding')} className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'branding' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Branding IA</button>
        <button onClick={() => setActiveSubTab('fixos')} className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'fixos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Despesas Fixas</button>
        <button onClick={() => setActiveSubTab('variaveis')} className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'variaveis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Insumos</button>
        <button onClick={() => setActiveSubTab('mao')} className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'mao' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Mão de Obra</button>
        <button onClick={() => setActiveSubTab('equipamentos')} className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'equipamentos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Equipamentos</button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {activeSubTab === 'empresa' && (
          <div className="space-y-8 animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="text-2xl">🏢</span>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Dados da Empresa</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Empresa / Marca</label>
                <input 
                  type="text" 
                  value={empresa.nome} 
                  onChange={e => updateEmpresa('nome', e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                  placeholder="Ex: Maria Personalizados" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone de Contato / WhatsApp</label>
                <input 
                  type="text" 
                  value={empresa.telefone} 
                  onChange={e => updateEmpresa('telefone', e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                  placeholder="Ex: (00) 00000-0000" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Completo</label>
                <input 
                  type="text" 
                  value={empresa.endereco} 
                  onChange={e => updateEmpresa('endereco', e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                  placeholder="Ex: Rua das Flores, 123 - Bairro - Cidade/UF" 
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end no-print">
              <button 
                onClick={saveEmpresaOnly} 
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-600 transition-all active:scale-95 shadow-lg flex items-center gap-2"
              >
                {isSaving ? '...' : '💾 SALVAR EMPRESA'}
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'branding' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center relative group overflow-hidden shadow-inner">
                {empresa.logoUrl ? (
                  <img src={empresa.logoUrl} alt="Logo da Empresa" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-4xl block mb-2 opacity-20">🎨</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase">Sem Logotipo</span>
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col gap-2 z-20">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Criando...</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Criação de Logotipo com IA</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                  Utilize o poder do <strong>Google Imagen 4.0</strong> para criar um logotipo profissional e minimalista para <strong>{empresa.nome}</strong> instantaneamente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button 
                    onClick={generateLogo}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {isGenerating ? '🎨 CRIANDO OBRA DE ARTE...' : '✨ GERAR LOGOTIPO AGORA'}
                  </button>
                  <button 
                    onClick={() => setEmpresa({...empresa, logoUrl: ''})}
                    className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    🗑️ REMOVER
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'fixos' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(fixedCostLabels).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">R$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={fixos[key as keyof Omit<CustosFixos, 'producaoMensal'>]} 
                      onChange={e => updateFixo(key as keyof CustosFixos, Number(e.target.value))} 
                      className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white transition-all" 
                    />
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Capacidade Mensal (Unid.)</label>
                <input 
                  type="number" 
                  value={fixos.producaoMensal} 
                  onChange={e => updateFixo('producaoMensal', Number(e.target.value))} 
                  className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold" 
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'variaveis' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Papel Sublimático (Folha)</label>
                <input type="number" step="0.0001" value={variaveis.papelSublimatico} onChange={e => updateVariavel('papelSublimatico', Number(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Papel Fotográfico (Folha)</label>
                <input type="number" step="0.0001" value={variaveis.papelFoto} onChange={e => updateVariavel('papelFoto', Number(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo DTF (Folha Ref.)</label>
                <input type="number" step="0.0001" value={variaveis.papelDTF} onChange={e => updateVariavel('papelDTF', Number(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Taxa de Cartão (%)</label>
                <input type="number" step="0.01" value={variaveis.taxaCartaoPercent} onChange={e => updateVariavel('taxaCartaoPercent', Number(e.target.value))} className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl font-bold text-rose-700" />
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="text-2xl">📏</div>
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Conversor de Área (Rolo → A4)</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Transforme o custo de materiais comprados em rolo ou folhas gigantes para o custo proporcional por folha A4.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Largura (cm)</label>
                   <input 
                      type="number" 
                      value={calcWidth || ''} 
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        setCalcWidth(val);
                        if (val > 0) setFieldErrors({...fieldErrors, width: undefined});
                      }} 
                      className={`w-full p-3 border rounded-xl outline-none transition-all ${fieldErrors.width ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' : 'border-slate-200 focus:border-indigo-500'}`} 
                      placeholder="Ex: 60"
                   />
                   {fieldErrors.width && <span className="text-[9px] text-rose-500 font-bold uppercase">{fieldErrors.width}</span>}
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comprimento (cm)</label>
                   <input 
                      type="number" 
                      value={calcLength || ''} 
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        setCalcLength(val);
                        if (val > 0) setFieldErrors({...fieldErrors, length: undefined});
                      }} 
                      className={`w-full p-3 border rounded-xl outline-none transition-all ${fieldErrors.length ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' : 'border-slate-200 focus:border-indigo-500'}`} 
                      placeholder="Ex: 100"
                   />
                   {fieldErrors.length && <span className="text-[9px] text-rose-500 font-bold uppercase">{fieldErrors.length}</span>}
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço Pago (R$)</label>
                   <input 
                      type="number" 
                      value={calcPrice || ''} 
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        setCalcPrice(val);
                        if (val > 0) setFieldErrors({...fieldErrors, price: undefined});
                      }} 
                      className={`w-full p-3 border rounded-xl outline-none transition-all ${fieldErrors.price ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' : 'border-slate-200 focus:border-indigo-500'}`} 
                      placeholder="Ex: 250.00"
                   />
                   {fieldErrors.price && <span className="text-[9px] text-rose-500 font-bold uppercase">{fieldErrors.price}</span>}
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Insumo Alvo</label>
                   <select 
                      value={calcTarget} 
                      onChange={e => setCalcTarget(e.target.value as any)} 
                      className="w-full p-3 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 transition-all h-[46px]"
                   >
                     <option value="papelDTF">Filme DTF</option>
                     <option value="papelAdesivo">Papel Adesivo</option>
                     <option value="powerFilme">Power Filme</option>
                   </select>
                </div>
              </div>
              
              <button 
                onClick={applyCalculatedPrice} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                EFETUAR CÁLCULO E ATUALIZAR TABELA
              </button>
            </div>
          </div>
        )}
        
        {activeSubTab === 'mao' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Salário Alvo (Desejado)</label>
                <input type="number" value={maoDeObra.salarioAlvo} onChange={e => updateMao('salarioAlvo', Number(e.target.value))} className="w-full p-4 bg-indigo-50 rounded-2xl font-bold" />
              </div>
            </div>
            <div className="p-10 bg-indigo-600 rounded-[2.5rem] text-white">
               <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest">Valor/Hora Atual</h3>
               <p className="text-7xl font-black tracking-tighter">R$ {maoDeObra.valorHora.toFixed(2)}</p>
            </div>
          </div>
        )}

        {activeSubTab === 'equipamentos' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={addEquipamento} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all">+ ADICIONAR EQUIPAMENTO</button>
            <div className="grid grid-cols-1 gap-4">
              {equipamentos.map(eq => (
                <div key={eq.id} className="p-6 bg-slate-50 border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <label className="text-[8px] font-black text-slate-400 uppercase">Equipamento</label>
                    <input value={eq.nomeEquipamento} onChange={e => updateEq(eq.id, 'nomeEquipamento', e.target.value)} className="w-full bg-transparent p-1 font-bold outline-none" />
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                     <div>
                       <label className="text-[8px] font-black text-slate-400 uppercase">Valor R$</label>
                       <input type="number" value={eq.valorCompra} onChange={e => updateEq(eq.id, 'valorCompra', Math.max(0, Number(e.target.value)))} className="w-24 bg-transparent p-1 font-bold outline-none border-b border-slate-200" />
                     </div>
                     <button onClick={() => removeEq(eq.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 no-print">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
