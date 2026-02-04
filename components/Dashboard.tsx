
import React from 'react';
import { Produto, CustosFixos, CustosVariaveis, Equipamento } from '../types';

interface DashboardProps {
  produtos: Produto[];
  fixos: CustosFixos;
  variaveis: CustosVariaveis;
  equipments: Equipamento[];
  onCalculate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ produtos, fixos, onCalculate }) => {
  const totalCustoFixo = fixos.aluguel + fixos.agua + fixos.energia + fixos.internet + 
                        fixos.contador + fixos.marketing + fixos.impostos + fixos.outros;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo ao PrecificaPro!</h1>
        <p className="text-slate-500">Sua jornada para um negócio lucrativo começa aqui.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-indigo-600 bg-indigo-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
            📦
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Produtos Cadastrados</h3>
          <p className="text-3xl font-bold text-slate-900">{produtos.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-emerald-600 bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
            🧾
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Custo Fixo Mensal</h3>
          <p className="text-3xl font-bold text-slate-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCustoFixo)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-amber-600 bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
            📈
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Capacidade Mensal</h3>
          <p className="text-3xl font-bold text-slate-900">{fixos.producaoMensal} unid.</p>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100 overflow-hidden relative">
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <h2 className="text-2xl font-bold">Pronto para precificar um novo pedido?</h2>
          <p className="text-indigo-100 max-w-md">
            Escolha um produto e deixe o PrecificaPro calcular o preço ideal considerando todos os seus custos ocultos.
          </p>
          <button 
            onClick={onCalculate}
            className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Começar Agora
          </button>
        </div>
        <div className="hidden lg:block relative z-10">
          <div className="text-8xl opacity-80 filter drop-shadow-2xl">🧮</div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            🚀 Dicas de Lucratividade
          </h3>
          <ul className="space-y-4 text-slate-600">
            <li className="flex gap-3">
              <span className="text-emerald-500 font-bold">01.</span>
              <p>Mantenha sua <strong>mão de obra</strong> atualizada para não pagar para trabalhar.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500 font-bold">02.</span>
              <p>O <strong>refugo</strong> é o inimigo oculto do lucro. Tente reduzir para menos de 3%.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500 font-bold">03.</span>
              <p>Revise seus <strong>custos fixos</strong> a cada 3 meses para ajustes de inflação.</p>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            🔔 Alertas Pendentes
          </h3>
          {produtos.length === 0 ? (
             <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-4 text-amber-800">
               <span className="text-2xl">⚠️</span>
               <p className="text-sm font-medium">Você ainda não cadastrou nenhum produto para venda.</p>
             </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4 text-emerald-800">
               <span className="text-2xl">✅</span>
               <p className="text-sm font-medium">Configurações iniciais estão saudáveis!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
