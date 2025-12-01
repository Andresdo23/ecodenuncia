import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

// Configuração de Ícones do Leaflet
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const createIcon = (url) => new L.Icon({
  iconUrl: url,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  red: createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'),
  yellow: createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png'),
  green: createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png?v=2'),
  grey: createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png')
};

// Componente Modal de Detalhes
const DenunciaDetailModal = ({ denuncia, onClose }) => {
  if (!denuncia) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>Denúncia #{denuncia.id.substring(0, 6)}</h3>
        <p><strong>Status:</strong> {denuncia.nome_status}</p>
        <p><strong>Descrição:</strong> {denuncia.descricao || "Sem descrição"}</p>
        <p><strong>Endereço:</strong> {denuncia.endereco_completo || "Não informado"}</p>
        <p><strong>Ref:</strong> {denuncia.ponto_referencia || "-"}</p>
        <p><strong>Data:</strong> {new Date(denuncia.data_criacao).toLocaleString('pt-BR')}</p>
        <a href={denuncia.url_foto} target="_blank" rel="noopener noreferrer" className="modal-photo-link">
          Ver Foto Original
        </a>
      </div>
    </div>
  );
};

// Componente Tabela de Denúncias
const DenunciasTable = ({ denuncias, onStatusChange, onRowClick }) => {
  const statusOptions = [
    { id: 1, nome: "Recebida" },
    { id: 2, nome: "Em Análise" },
    { id: 3, nome: "Resolvida" },
    { id: 4, nome: "Rejeitada" },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Recebida': return 'status-recebida';
      case 'Em Análise': return 'status-em-analise';
      case 'Resolvida': return 'status-resolvida';
      default: return 'status-rejeitada';
    }
  };

  return (
    <div className="denuncia-table-wrapper">
      <table className="denuncia-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Endereço</th>
            <th>Status</th>
            <th>Mudar Status</th>
          </tr>
        </thead>
        <tbody>
          {denuncias.map((d) => {
            const statusId = statusOptions.find(s => s.nome === d.nome_status)?.id || 1;
            return (
              <tr key={d.id} onClick={() => onRowClick(d)} style={{ cursor: 'pointer' }}>
                <td>#{d.id.substring(0, 6)}</td>
                <td>{d.descricao ? `${d.descricao.substring(0, 25)}${d.descricao.length > 25 ? '...' : ''}` : 'N/A'}</td>
                <td>{d.endereco_completo ? `${d.endereco_completo.substring(0, 20)}...` : 'N/A'}</td>
                <td><span className={`status-tag ${getStatusClass(d.nome_status)}`}>{d.nome_status}</span></td>
                <td>
                  <select 
                    className="status-select" 
                    value={statusId}
                    disabled={statusId === 3}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      onStatusChange(d.id, parseInt(e.target.value)); 
                    }}
                  >
                    {statusOptions.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
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

// Componente Principal Dashboard
function Dashboard() {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [modalDenuncia, setModalDenuncia] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await api.get('/denuncias');
        setDenuncias(res.data.data);
      } catch (err) {
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const handleStatusChange = async (id, statusId) => {
    try {
      await api.put(`/denuncias/${id}/status`, { id_status: statusId });
      
      const statusMap = { 1: "Recebida", 2: "Em Análise", 3: "Resolvida", 4: "Rejeitada" };
      const novoNome = statusMap[statusId];

      // Atualização Otimista
      setDenuncias(prev => prev.map(d => d.id === id ? { ...d, nome_status: novoNome } : d));
    } catch (err) {
      alert("Erro ao atualizar status.");
    }
  };

  const { filtradas, contagens } = useMemo(() => {
    let list = denuncias;
    const mapStatus = {
      'Pendente': ['Recebida'],
      'Em Andamento': ['Em Análise'],
      'Resolvido': ['Resolvida']
    };

    if (filtroStatus !== 'Todos') {
      list = denuncias.filter(d => mapStatus[filtroStatus]?.includes(d.nome_status));
    }

    const counts = {
      total: denuncias.length,
      pendente: denuncias.filter(d => d.nome_status === 'Recebida').length,
      andamento: denuncias.filter(d => d.nome_status === 'Em Análise').length,
      resolvida: denuncias.filter(d => d.nome_status === 'Resolvida').length,
    };

    return { filtradas: list, contagens: counts };
  }, [denuncias, filtroStatus]);

  const getIcone = (status) => {
    switch (status) {
      case 'Recebida': return icons.red;
      case 'Em Análise': return icons.yellow;
      case 'Resolvida': return icons.green;
      default: return icons.grey;
    }
  };

  return (
    <>
      <DenunciaDetailModal denuncia={modalDenuncia} onClose={() => setModalDenuncia(null)} />
      
      <div className="dashboard-container">
        {!loading && !error && (
          <div className="map-container-wrapper">
            <MapContainer center={[-3.74, -38.52]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filtradas.map(d => (
                <Marker key={d.id} position={[d.latitude, d.longitude]} icon={getIcone(d.nome_status)}>
                  <Popup>
                    <b>{d.nome_status}</b><br/>
                    {d.descricao}<br/>
                    <button 
                      onClick={() => setModalDenuncia(d)} 
                      style={{marginTop:5, cursor:'pointer', color:'blue', textDecoration:'underline', border:'none', background:'none', padding:0}}
                    >
                      Ver Detalhes
                    </button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        <div className="filter-bar">
          {['Todos', 'Pendente', 'Em Andamento', 'Resolvido'].map(f => (
            <button key={f} className={`filter-btn ${filtroStatus === f ? 'active' : ''}`} onClick={() => setFiltroStatus(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="summary-cards">
          <div className="summary-card total"><h3>Total</h3><span className="count">{contagens.total}</span></div>
          <div className="summary-card pendente"><h3>Pendentes</h3><span className="count">{contagens.pendente}</span></div>
          <div className="summary-card andamento"><h3>Em Andamento</h3><span className="count">{contagens.andamento}</span></div>
          <div className="summary-card resolvida"><h3>Resolvidas</h3><span className="count">{contagens.resolvida}</span></div>
        </div>

        {loading ? <p>Carregando...</p> : 
          <DenunciasTable denuncias={filtradas} onStatusChange={handleStatusChange} onRowClick={setModalDenuncia} />
        }
      </div>
    </>
  );
}

export default Dashboard;