
import React, { useState, useEffect } from 'react';
import { 
  Produto, 
  CustosFixos, 
  CustosVariaveis, 
  Equipamento, 
  MaoDeObra,
  Empresa
} from './types';
import { 
  INITIAL_CUSTOS_FIXOS, 
  INITIAL_CUSTOS_VARIAVEIS, 
  INITIAL_EQUIPAMENTOS, 
  INITIAL_PRODUTOS, 
  INITIAL_MAO_DE_OBRA,
  INITIAL_EMPRESA
} from './constants';
import PricingCalculator from './components/PricingCalculator';
import Settings from './components/Settings';
import ProductList from './components/ProductList';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'products' | 'settings'>('dashboard');
  
  // State Initialization
  const [fixos, setFixos] = useState<CustosFixos>(() => {
    const saved = localStorage.getItem('precifica_fixos');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOS_FIXOS;
  });
  
  const [variaveis, setVariaveis] = useState<CustosVariaveis>(() => {
    const saved = localStorage.getItem('precifica_variaveis');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOS_VARIAVEIS;
  });

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() => {
    const saved = localStorage.getItem('precifica_equipamentos');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPAMENTOS;
  });

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem('precifica_produtos');
    return saved ? JSON.parse(saved) : INITIAL_PRODUTOS;
  });

  const [maoDeObra, setMaoDeObra] = useState<MaoDeObra>(() => {
    const saved = localStorage.getItem('precifica_maoDeObra');
    return saved ? JSON.parse(saved) : INITIAL_MAO_DE_OBRA;
  });

  const [empresa, setEmpresa] = useState<Empresa>(() => {
    const saved = localStorage.getItem('precifica_empresa');
    return saved ? JSON.parse(saved) : INITIAL_EMPRESA;
  });

  // Persist state
  useEffect(() => localStorage.setItem('precifica_fixos', JSON.stringify(fixos)), [fixos]);
  useEffect(() => localStorage.setItem('precifica_variaveis', JSON.stringify(variaveis)), [variaveis]);
  useEffect(() => localStorage.setItem('precifica_equipamentos', JSON.stringify(equipamentos)), [equipamentos]);
  useEffect(() => localStorage.setItem('precifica_produtos', JSON.stringify(produtos)), [produtos]);
  useEffect(() => localStorage.setItem('precifica_maoDeObra', JSON.stringify(maoDeObra)), [maoDeObra]);
  useEffect(() => localStorage.setItem('precifica_empresa', JSON.stringify(empresa)), [empresa]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard produtos={produtos} fixos={fixos} variaveis={variaveis} equipments={equipamentos} onCalculate={() => setActiveTab('calculator')} />;
      case 'calculator':
        return <PricingCalculator 
                  produtos={produtos} 
                  fixos={fixos} 
                  variaveis={variaveis} 
                  equipamentos={equipamentos} 
                  maoDeObra={maoDeObra} 
                  empresa={empresa}
                />;
      case 'products':
        return <ProductList 
                  produtos={produtos} 
                  setProdutos={setProdutos}
                  fixos={fixos}
                  variaveis={variaveis}
                  equipamentos={equipamentos}
                  maoDeObra={maoDeObra}
                />;
      case 'settings':
        return <Settings 
                  fixos={fixos} setFixos={setFixos}
                  variaveis={variaveis} setVariaveis={setVariaveis}
                  equipamentos={equipamentos} setEquipamentos={setEquipamentos}
                  maoDeObra={maoDeObra} setMaoDeObra={setMaoDeObra}
                  empresa={empresa} setEmpresa={setEmpresa}
                />;
      default:
        return <Dashboard produtos={produtos} fixos={fixos} variaveis={variaveis} equipments={equipamentos} onCalculate={() => setActiveTab('calculator')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} empresa={empresa} />
      <main className="flex-1 p-4 md:p-8 lg:p-12 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
