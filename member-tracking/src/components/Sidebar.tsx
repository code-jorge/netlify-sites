import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Activity,
  Database,
  GitBranch
} from 'lucide-react';

const navigationItems = [
  { name: 'Members Table', path: '/', icon: Users },
  { name: 'Contributors Table', path: '/contributors', icon: GitBranch },
  { name: 'Member Activity', path: '/member-activity', icon: Activity },
  { name: 'Contributor Activity', path: '/contributor-activity', icon: Activity },
  { name: 'Data Export', path: '/data-export', icon: Database },
];

const Sidebar: React.FC = () => (
  <div className="w-64 bg-white shadow-lg border-r border-gray-200">
    <div className="p-6">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Netlify</h1>
          <p className="text-sm text-gray-500">Member Analytics</p>
        </div>
      </div>
    </div>
    
    <nav className="mt-8">
      <div className="px-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  </div>
);

export default Sidebar;