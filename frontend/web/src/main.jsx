import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // O nosso novo ficheiro App.jsx

// Importar o CSS do Leaflet (importante para os mapas)
import 'leaflet/dist/leaflet.css';
// Importar o NOSSO NOVO CSS Global
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);