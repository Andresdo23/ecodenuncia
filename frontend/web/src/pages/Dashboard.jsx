import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

// --- Importações do Mapa (Leaflet) ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // O CSS é obrigatório

// ---
// CONFIGURAÇÃO DE ÍCONES (CDN STABLE)
// Definimos explicitamente todos os ícones para não depender do padrão quebrado do Leaflet
// ---

const iconShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

// Função geradora para não repetir código
const createCustomIcon = (url) => {
  return new L.Icon({
    iconUrl: url,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Criamos as instâncias dos ícones aqui fora para serem reutilizadas
const ICONS = {
  blue: createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'),
  red: createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'),
  gold: createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png'),
  green: createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'),
  grey: createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png'),
};

// --- Fim da Configuração de Ícones ---


// --- Componente Modal de Detalhes ---
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

// --- Componente da Tabela ---
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
                onClick={() => onRowClick(denuncia)}
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
                      e.stopPropagation();
                      onStatusChange(denuncia.id, parseInt(e.target.value));
                    }}
                    onClick={(e) => e.stopPropagation()}
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

// --- Componente Principal do Dashboard ---
function Dashboard() {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [modalDenuncia, setModalDenuncia] = useState(null);

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
  
  // Função Simples e Direta para ícones
  const getIconeDoMapa = (nomeStatus) => {
    if (nomeStatus === 'Recebida') return ICONS.red;
    if (nomeStatus === 'Em Análise') return ICONS.gold; // Alterado para gold (amarelo)
    if (nomeStatus === 'Resolvida') return ICONS.green;
    if (nomeStatus === 'Rejeitada') return ICONS.grey;
    return ICONS.blue; // Fallback
  };

  return (
    <>
      <DenunciaDetailModal 
        denuncia={modalDenuncia} 
        onClose={() => setModalDenuncia(null)} 
      />
    
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
                    <a href={denuncia.url_foto} target="_blank" rel="noopener noreferrer">
                      Ver Foto
                    </a>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        <div className="filter-bar">
          <button className={`filter-btn ${filtroStatus === 'Todos' ? 'active' : ''}`} onClick={() => setFiltroStatus('Todos')}>Todos</button>
          <button className={`filter-btn ${filtroStatus === 'Pendente' ? 'active' : ''}`} onClick={() => setFiltroStatus('Pendente')}>Pendentes (Recebidas)</button>
          <button className={`filter-btn ${filtroStatus === 'Em Andamento' ? 'active' : ''}`} onClick={() => setFiltroStatus('Em Andamento')}>Em Andamento (Em Análise)</button>
          <button className={`filter-btn ${filtroStatus === 'Resolvido' ? 'active' : ''}`} onClick={() => setFiltroStatus('Resolvido')}>Resolvidas</button>
        </div>

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

        {loading && <p>A carregar denúncias...</p>}
        {!loading && !error && (
          <DenunciasTable 
            denuncias={denunciasFiltradas} 
            onStatusChange={handleStatusChange}
            onRowClick={(denuncia) => setModalDenuncia(denuncia)}
          />
        )}
      </div>
    </>
  );
}

export default Dashboard;