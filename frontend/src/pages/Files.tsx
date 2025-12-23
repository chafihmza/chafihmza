import { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

interface FileItem {
  name: string;
  type: string;
  size: number;
  modifiedAt: string;
}

const Files = () => {
  const { connectorId } = useParams();
  const [path, setPath] = useState('/');
  const [items, setItems] = useState<FileItem[]>([]);
  const [newFolder, setNewFolder] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadFiles = async () => {
    if (!connectorId) return;
    const res = await api.get('/api/files/list', { params: { connectorId, path } });
    setItems(res.data);
  };

  useEffect(() => {
    loadFiles();
  }, [connectorId, path]);

  const handleMkdir = async () => {
    if (!connectorId || !newFolder) return;
    await api.post('/api/files/mkdir', { connectorId, path: `${path}/${newFolder}` });
    setNewFolder('');
    loadFiles();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!connectorId || !selectedFile) return;
    const formData = new FormData();
    formData.append('path', path);
    formData.append('file', selectedFile);
    await api.post('/api/files/upload', formData, {
      params: { connectorId },
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      }
    });
    setUploadProgress(0);
    setSelectedFile(null);
    loadFiles();
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Fichiers</h2>
        <button className="btn btn-outline-secondary" onClick={loadFiles}>Rafraîchir</button>
      </div>
      <div className="card p-3 mb-3">
        <div className="d-flex gap-2">
          <input className="form-control" placeholder="Nouveau dossier" value={newFolder} onChange={(e) => setNewFolder(e.target.value)} />
          <button className="btn btn-success" onClick={handleMkdir}>Créer</button>
        </div>
        <div className="d-flex gap-2 mt-3 align-items-center">
          <input className="form-control" type="file" onChange={handleFileChange} />
          <button className="btn btn-outline-success" onClick={handleUpload}>Téléverser</button>
        </div>
        {uploadProgress > 0 && (
          <div className="progress mt-2">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>{uploadProgress}%</div>
          </div>
        )}
      </div>
      <div className="card p-3">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Taille</th>
              <th>Dernière modification</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.size}</td>
                <td>{item.modifiedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Files;
