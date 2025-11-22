import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

// --- Importações do Mapa (Leaflet) ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Ícones Coloridos (Baseado no seu protótipo) ---
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const yellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
// --- Fim dos Ícones ---


// ---
// NOVO: Componente Modal de Detalhes
// ---
const DenunciaDetailModal = ({ denuncia, onClose }) => {
  if (!denuncia) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>Detalhes da Denúncia #{denuncia.id.substring(0, 8)}</h3>
        
        <p><strong>Descrição:</strong> {denuncia.descricao || "N/A"}</p>
        <p><strong>Endereço:</strong> {denuncia.endereco_completo || "N/A"}</p>
        <p><strong>Referência:</strong> {denuncia.ponto_referencia || "N/A"}</p>
        <p><strong>Data:</strong> {new Date(denuncia.data_criacao).toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> {denuncia.nome_status}</p>
        
        <a 
          href={denuncia.url_foto} 
          target="_blank" 
          rel="noopener noreferrer"
          className="modal-photo-link"
        >
          Ver Foto da Denúncia
        </a>
      </div>
    </div>
  );
};


// ---
// Componente da Tabela (Atualizado com "Descrição" e "onClick")
// ---
const DenunciasTable = ({ denuncias, onStatusChange, onRowClick }) => {
  
  const statusOptions = [
    { id: 1, nome: "Recebida" },
    { id: 2, nome: "Em Análise" },
    { id: 3, nome: "Resolvida" },
    { id: 4, nome: "Rejeitada" },
  ];
  
  const getStatusClass = (nomeStatus) => {
    if (nomeStatus === 'Recebida') return 'status-recebida';
    if (nomeStatus === 'Em Análise') return 'status-em-analise';
    if (nomeStatus === 'Resolvida') return 'status-resolvida';
    if (nomeStatus === 'Rejeitada') return 'status-rejeitada';
    return '';
  };

  // Função para truncar a descrição
  const truncarTexto = (texto, limite) => {
    if (!texto) return "N/A";
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + "...";
  };

  return (
    <div className="denuncia-table-wrapper">
      <table className="denuncia-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição (Prévia)</th>
            <th>Endereço</th>
            <th>Data</th>
            <th>Status</th>
            <th>Mudar Status</th>
          </tr>
        </thead>
        <tbody>
          {denuncias.map((denuncia) => {
            const statusAtualId = statusOptions.find(s => s.nome === denuncia.nome_status)?.id || 1;
            
            return (
              <tr 
                key={denuncia.id} 
                onClick={() => onRowClick(denuncia)} // <-- Ação de clique na linha
                style={{ cursor: 'pointer' }}
              >
                <td>#{denuncia.id.substring(0, 8)}...</td>
                <td>{truncarTexto(denuncia.descricao, 30)}</td>
                <td>{truncarTexto(denuncia.endereco_completo, 30)}</td>
                <td>{new Date(denuncia.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={`status-tag ${getStatusClass(denuncia.nome_status)}`}>
                    {denuncia.nome_status}
                  </span>
                </td>
                <td>
                  <select 
                    className="status-select"
                    value={statusAtualId} 
                    onChange={(e) => {
                      e.stopPropagation(); // Impede o modal de abrir ao mudar o status
                      onStatusChange(denuncia.id, parseInt(e.target.value));
                    }}
                    onClick={(e) => e.stopPropagation()} // Impede o modal
                    disabled={statusAtualId === 3}
                  >
                    {statusOptions.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


// ---
// Componente Principal do Dashboard (Atualizado com estado do Modal)
// ---
function Dashboard() {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  
  // --- Estado do Modal ---
  const [modalDenuncia, setModalDenuncia] = useState(null); // Guarda a denúncia selecionada

  useEffect(() => {
    const fetchDenuncias = async () => {
      try {
        setLoading(true); setError(null);
        const response = await api.get('/denuncias');
        setDenuncias(response.data.data);
      } catch (err) {
        console.error("Erro ao buscar denúncias:", err);
        setError("Não foi possível carregar as denúncias.");
      } finally {
        setLoading(false);
      }
    };
    fetchDenuncias();
  }, []);

  const handleStatusChange = async (idDenuncia, novoStatusId) => {
    try {
      const response = await api.put(`/denuncias/${idDenuncia}/status`, { 
        id_status: novoStatusId 
      });
      const denunciaAtualizada = response.data.data;
      setDenuncias(denunciasAnteriores => 
        denunciasAnteriores.map(d => 
          d.id === idDenuncia ? { ...d, nome_status: denunciaAtualizada.nome_status } : d
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert(`Erro ao atualizar status: ${err.response?.data?.error || 'Tente novamente.'}`);
    }
  };

  const { denunciasFiltradas, contagens } = useMemo(() => {
    let filtradas = denuncias;
    const MapeamentoStatus = {
      'Pendente': ['Recebida'],
      'Em Andamento': ['Em Análise'],
      'Resolvido': ['Resolvida']
    };
    if (filtroStatus !== 'Todos') {
      filtradas = denuncias.filter(d => MapeamentoStatus[filtroStatus]?.includes(d.nome_status));
    }
    const contagens = {
      total: denuncias.length,
      pendente: denuncias.filter(d => MapeamentoStatus['Pendente'].includes(d.nome_status)).length,
      emAndamento: denuncias.filter(d => MapeamentoStatus['Em Andamento'].includes(d.nome_status)).length,
      resolvida: denuncias.filter(d => MapeamentoStatus['Resolvido'].includes(d.nome_status)).length,
    };
    return { denunciasFiltradas: filtradas, contagens };
  }, [denuncias, filtroStatus]);
  
  const getIconeDoMapa = (nomeStatus) => {
    if (nomeStatus === 'Recebida') return redIcon;
    if (nomeStatus === 'Em Análise') return yellowIcon;
    if (nomeStatus === 'Resolvida') return greenIcon;
    return DefaultIcon;
  };


  return (
    <>
      {/* 1. O MODAL (fica fora do layout principal) */}
      <DenunciaDetailModal 
        denuncia={modalDenuncia} 
        onClose={() => setModalDenuncia(null)} 
      />
    
      {/* 2. O DASHBOARD */}
      <div className="dashboard-container">
        {/* MAPA */}
        {loading && <p>A carregar mapa...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <div className="map-container-wrapper">
            <MapContainer 
              center={[-3.74, -38.52]}
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {denunciasFiltradas.map((denuncia) => (
                <Marker 
                  key={denuncia.id} 
                  position={[denuncia.latitude, denuncia.longitude]}
                  icon={getIconeDoMapa(denuncia.nome_status)}
                >
                  <Popup>
                    <strong>Status: {denuncia.nome_status}</strong><br />
                    <hr />
                    <strong>Descrição:</strong> {denuncia.descricao || "N/A"}<br />
                    <strong>Endereço:</strong> {denuncia.endereco_completo || "N/A"}<br />
                    <strong>Referência:</strong> {denuncia.ponto_referencia || "N/A"}<br />
                    <a href={denuncia.url_foto} target="_blank" rel="noopener noreferrer">
                      Ver Foto
                    </a>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* FILTROS */}
        <div className="filter-bar">
          <button 
            className={`filter-btn ${filtroStatus === 'Todos' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('Todos')}
          >
            Todos
          </button>
          <button 
            className={`filter-btn ${filtroStatus === 'Pendente' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('Pendente')}
          >
            Pendentes (Recebidas)
          </button>
          <button 
            className={`filter-btn ${filtroStatus === 'Em Andamento' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('Em Andamento')}
          >
            Em Andamento (Em Análise)
          </button>
          <button 
            className={`filter-btn ${filtroStatus === 'Resolvido' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('Resolvido')}
          >
            Resolvidas
          </button>
        </div>

        {/* CARTÕES DE RESUMO */}
        <div className="summary-cards">
          <div className="summary-card total">
            <h3>Total</h3>
            <span className="count">{contagens.total}</span>
          </div>
          <div className="summary-card pendente">
            <h3>Pendentes</h3>
            <span className="count">{contagens.pendente}</span>
          </div>
          <div className="summary-card andamento">
            <h3>Em Andamento</h3>
            <span className="count">{contagens.emAndamento}</span>
        </div>
          <div className="summary-card resolvida">
            <h3>Resolvidas</h3>
            <span className="count">{contagens.resolvida}</span>
          </div>
        </div>

        {/* TABELA DE DENÚNCIAS */}
        {loading && <p>A carregar denúncias...</p>}
        {!loading && !error && (
          <DenunciasTable 
            denuncias={denunciasFiltradas} 
            onStatusChange={handleStatusChange}
            onRowClick={(denuncia) => setModalDenuncia(denuncia)} // Passa a função para abrir o modal
          />
        )}
      </div>
    </>
  );
}

export default Dashboard;