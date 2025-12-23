import { ReactNode } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        {children}
      </div>
    </div>
  );
};

export default Layout;
