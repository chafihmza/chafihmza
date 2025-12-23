import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

type AuditLog = {
  id: string;
  action: string;
  path?: string;
  status: string;
  ip: string;
  createdAt: string;
};

const Audit = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.get('/api/audit').then((res) => setLogs(res.data));
  }, []);

  return (
    <Layout>
      <h2 className="mb-3">Journal d'audit</h2>
      <div className="card p-3">
        <table className="table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Chemin</th>
              <th>Statut</th>
              <th>IP</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.path}</td>
                <td>{log.status}</td>
                <td>{log.ip}</td>
                <td>{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Audit;
