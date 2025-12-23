import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

type Connector = {
  id: string;
  name: string;
  protocol: string;
  host: string;
  port: number;
};

const AdminConnectors = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);

  const loadConnectors = async () => {
    const res = await api.get('/api/connectors');
    setConnectors(res.data);
  };

  useEffect(() => {
    loadConnectors();
  }, []);

  return (
    <Layout>
      <h2 className="mb-3">Connecteurs</h2>
      <div className="card p-3">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Protocole</th>
              <th>Hôte</th>
              <th>Port</th>
            </tr>
          </thead>
          <tbody>
            {connectors.map((connector) => (
              <tr key={connector.id}>
                <td>{connector.name}</td>
                <td>{connector.protocol}</td>
                <td>{connector.host}</td>
                <td>{connector.port}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminConnectors;
