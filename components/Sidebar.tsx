
import React from 'react';
import { Empresa } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  empresa?: Empresa;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, empresa }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '🏠' },
    { id: 'calculator', label: 'Calculadora', icon: '🧮' },
    { id: 'products', label: 'Meus Produtos', icon: '📦' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen no-print">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 overflow-hidden">
        {empresa?.logoUrl ? (
          <img src={empresa.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover shadow-lg" />
        ) : (
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200 flex-shrink-0">
            P
          </div>
        )}
        <span className="hidden md:block text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent truncate">
          {empresa?.nome || 'PrecificaPro'}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 hidden md:block">
        <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-semibold text-sm mb-1">Versão Pro</h4>
            <p className="text-xs text-slate-400 mb-3">Tenha acesso a relatórios avançados.</p>
            <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-medium transition-colors">
              Upgrade
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-2xl"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
