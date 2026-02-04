
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
/* Configurações para a impressão do PrecificaPro */
@media print {
  /* Força a impressão das cores de fundo (o azul do cabeçalho) */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Esconde o botão de imprimir para ele não sair no papel */
  .no-print, button {
    display: none !important;
  }

  /* Garante que o fundo branco ocupe a página toda */
  body {
    background-color: white !important;
  }

  /* Remove margens automáticas que o navegador coloca */
  @page {
    margin: 0.5cm;
  }
}
