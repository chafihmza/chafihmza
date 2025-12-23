import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar p-4">
      <h4 className="mb-4">Cloud FTP</h4>
      <div className="d-flex flex-column gap-2">
        <NavLink to="/dashboard">Tableau de bord</NavLink>
        <NavLink to="/audit">Journal d'audit</NavLink>
        <NavLink to="/admin/users">Utilisateurs</NavLink>
        <NavLink to="/admin/connectors">Connecteurs</NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
