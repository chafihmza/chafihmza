import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const res = await api.get('/api/users');
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Layout>
      <h2 className="mb-3">Utilisateurs</h2>
      <div className="card p-3">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actif</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="badge badge-role">{user.role}</span></td>
                <td>{user.isActive ? 'Oui' : 'Non'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminUsers;
