import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

type Connector = {
  id: string;
  name: string;
  protocol: string;
  host: string;
  basePath: string;
};

const Dashboard = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    api.get('/api/connectors').then((res) => setConnectors(res.data));
  }, []);

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Connecteurs</h2>
      </div>
      <div className="row g-3">
        {connectors.map((connector) => (
          <div className="col-md-4" key={connector.id}>
            <div className="card p-3">
              <h5>{connector.name}</h5>
              <div className="text-muted">{connector.protocol} · {connector.host}</div>
              <div className="text-muted">Base: {connector.basePath}</div>
              <Link className="btn btn-outline-success btn-sm mt-3" to={`/files/${connector.id}`}>Ouvrir</Link>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Dashboard;
