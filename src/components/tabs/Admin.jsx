import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Upload, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  X,
  AlertTriangle 
} from 'lucide-react';
import { 
  getOfflineScores, 
  addOfflineScore, 
  deleteOfflineScore,
  getEvents,
  addEvent,
  deleteEvent
} from '../../services/firebaseService';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [offlineScores, setOfflineScores] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newOfflineScore, setNewOfflineScore] = useState({ 
    game: '', 
    name: '', 
    score: '' 
  });
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    description: '' 
  });
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [offlineData, eventsData] = await Promise.all([
        getOfflineScores(),
        getEvents()
      ]);
      setOfflineScores(offlineData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setAdminPassword('');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminPassword('');
  };

  const handleAddOfflineScore = async () => {
    if (!newOfflineScore.game || !newOfflineScore.name || !newOfflineScore.score) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addOfflineScore(
        newOfflineScore.game, 
        newOfflineScore.name, 
        parseInt(newOfflineScore.score)
      );
      setNewOfflineScore({ game: '', name: '', score: '' });
      loadData();
    } catch (error) {
      console.error('Error adding offline score:', error);
      alert('Error adding score');
    }
  };

  const handleDeleteOfflineScore = async (id) => {
    if (window.confirm('Are you sure you want to delete this score?')) {
      try {
        await deleteOfflineScore(id);
        loadData();
      } catch (error) {
        console.error('Error deleting offline score:', error);
        alert('Error deleting score');
      }
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      alert('Please fill in title and date');
      return;
    }

    try {
      await addEvent(newEvent);
      setNewEvent({ title: '', date: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        loadData();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-red-500/30">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">Admin Login</h3>
            <p className="text-gray-400">Enter admin password to access panel</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button 
              onClick={handleAdminLogin}
              className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400 transition-all"
            >
              <Unlock className="w-4 h-4 inline mr-2" />
              Login
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold">Demo Password</span>
            </div>
            <p className="text-gray-400 text-sm">admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold">Admin Panel</h2>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Logout
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Add Offline Score */}
      <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Upload className="text-green-400" />
          Add Offline Score
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Game Name"
            value={newOfflineScore.game}
            onChange={(e) => setNewOfflineScore({...newOfflineScore, game: e.target.value})}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Player Name"
            value={newOfflineScore.name}
            onChange={(e) => setNewOfflineScore({...newOfflineScore, name: e.target.value})}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
          />
          <input
            type="number"
            placeholder="Score"
            value={newOfflineScore.score}
            onChange={(e) => setNewOfflineScore({...newOfflineScore, score: e.target.value})}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
          />
          <button 
            onClick={handleAddOfflineScore}
            className="px-6 py-2 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Score
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold mb-4">Current Offline Scores:</h4>
          {offlineScores.map((entry) => (
            <div key={entry.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
              <div className="flex-1">
                <div className="font-bold text-white">{entry.name}</div>
                <div className="text-sm text-green-400">{entry.game}</div>
                {entry.timestamp && (
                  <div className="text-sm text-gray-400">
                    {new Date(entry.timestamp.toDate ? entry.timestamp.toDate() : entry.timestamp).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="text-yellow-400 font-bold mr-4">{entry.score}</div>
              <button
                onClick={() => handleDeleteOfflineScore(entry.id)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Events */}
      <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-blue-400" />
          Manage Events
        </h3>
        
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
          />
          <input
            type="datetime-local"
            value={newEvent.date}
            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
          />
          <textarea
            placeholder="Event Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 h-24 resize-none"
          />
          <button 
            onClick={handleAddEvent}
            className="w-full px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold mb-4">Current Events:</h4>
          {events.map((event) => (
            <div key={event.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold text-lg text-white">{event.title}</div>
                <div className="text-sm text-blue-400 mb-2">
                  {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                </div>
                {event.description && (
                  <div className="text-sm text-gray-400">{event.description}</div>
                )}
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-400 transition-all ml-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
