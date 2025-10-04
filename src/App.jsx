import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import Home from './components/tabs/Home';
import Games from './components/tabs/Games';
import Leaderboard from './components/tabs/Leaderboard';
import Events from './components/tabs/Events';
import Profile from './components/tabs/Profile';
import Admin from './components/tabs/Admin';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('teamAavishkarUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('teamAavishkarUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('teamAavishkarUser');
    setActiveTab('home');
  };

  // If user is not logged in, show login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <Home user={user} />;
      case 'games':
        return <Games user={user} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'events':
        return <Events />;
      case 'profile':
        return <Profile user={user} />;
      case 'admin':
        return <Admin />;
      default:
        return <Home user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-6 py-12">
        {renderActiveTab()}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;