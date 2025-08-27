import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => (
  <div className="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-8 overflow-hidden">
        <Outlet />
      </div>
    </main>
  </div>
);

export default Layout;