import { FormEvent, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('csrfToken', res.data.csrfToken);
      navigate('/dashboard');
    } catch (err) {
      setError('Échec de connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4" style={{ minWidth: 360 }}>
        <h3 className="mb-3">Connexion</h3>
        <p className="text-muted">Plateforme sécurisée Cloud FTP</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-success w-100" type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
