import React from 'react';
import recLogo from '../../assets/rec.png';
import { LogOut, User } from 'lucide-react';

const Header = ({ activeTab, setActiveTab, user, onLogout }) => {
  return (
    <header className="border-b border-green-500/30 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img
                src={recLogo}
                alt="RECursion Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent tracking-wider">
              RECarcade
            </h1>
          </div>

          <nav className="flex items-center gap-3">
            {['home', 'games', 'leaderboard', 'events', 'profile', 'admin'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 rounded-xl font-bold uppercase transition-all text-sm ${activeTab === tab
                    ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                    : 'text-green-400 hover:bg-green-500/20 hover:text-white'
                  }`}
              >
                {tab}
              </button>
            ))}

            {/* User Info */}
            <div className="flex items-center gap-4 ml-8 pl-8 border-l border-gray-700">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-5 h-5 text-green-400" />
                <div className="flex flex-col">
                  <span className="text-white font-semibold">{user?.username}</span>
                  <span className="text-gray-400 text-xs">({user?.regNumber})</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;