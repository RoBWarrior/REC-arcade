import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { getEvents } from '../../services/firebaseService';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getEventTypeColor = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('hackathon')) return 'from-purple-500 to-purple-600';
    if (titleLower.includes('workshop')) return 'from-blue-500 to-blue-600';
    if (titleLower.includes('competition')) return 'from-red-500 to-red-600';
    if (titleLower.includes('meeting')) return 'from-green-500 to-green-600';
    return 'from-gray-500 to-gray-600';
  };

  const getEventTypeIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('hackathon')) return '🏆';
    if (titleLower.includes('workshop')) return '🎓';
    if (titleLower.includes('competition')) return '⚡';
    if (titleLower.includes('meeting')) return '👥';
    return '📅';
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Our Events</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Stay updated with our latest events, and coding contest. 
          Join us for exciting learning opportunities and networking events.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {events.length > 0 ? (
            events.map((event) => {
              const { date, time } = formatDate(event.date);
              const isUpcoming = new Date(event.date) > new Date();
              
              return (
                <div 
                  key={event.id}
                  className={`bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border transition-all hover:scale-105 ${
                    isUpcoming 
                      ? 'border-green-500/30 hover:border-green-500' 
                      : 'border-gray-600/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getEventTypeIcon(event.title)}</span>
                        <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                        {!isUpcoming && (
                          <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-sm">
                            Completed
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-green-400">
                          <Calendar className="w-4 h-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400">
                          <Clock className="w-4 h-4" />
                          <span>{time}</span>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-300 leading-relaxed mb-4">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Open to all year students</span>
                      </div>
                    </div>
                    
                    <div className={`w-2 h-20 bg-gradient-to-b ${getEventTypeColor(event.title)} rounded-full ml-4`}></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-400 mb-4">No Events Scheduled</h3>
              <p className="text-gray-500 text-lg mb-8">
                We're working on some exciting events for you! Check back soon for updates.
              </p>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-md mx-auto">
                <h4 className="text-lg font-bold text-green-400 mb-3">What's Coming Next?</h4>
                <ul className="text-gray-300 space-y-2 text-left">
                  <li>• Weekly coding challenges</li>
                  <li>• Monthly hackathons</li>
                  <li>• Technical workshops</li>
                  <li>• Guest speaker sessions</li>
                  <li>• Peer coding reviews</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Categories Info */}
      {/* <div className="mt-16 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-8">Event Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 rounded-lg border border-purple-500/30">
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="font-bold text-purple-400">Hackathons</h4>
            <p className="text-sm text-gray-300">24-48 hour coding marathons</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg border border-blue-500/30">
            <div className="text-2xl mb-2">🎓</div>
            <h4 className="font-bold text-blue-400">Workshops</h4>
            <p className="text-sm text-gray-300">Hands-on learning sessions</p>
          </div>
          <div className="bg-gradient-to-br from-red-900 to-red-800 p-4 rounded-lg border border-red-500/30">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-bold text-red-400">Competitions</h4>
            <p className="text-sm text-gray-300">Coding contests and challenges</p>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-lg border border-green-500/30">
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-bold text-green-400">Meetings</h4>
            <p className="text-sm text-gray-300">Club updates and discussions</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Events;
