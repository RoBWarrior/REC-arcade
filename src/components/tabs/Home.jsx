import React from 'react';
import { Gamepad2, Trophy, Calendar, Users, Code, Zap } from 'lucide-react';

const Home = ({ user }) => {
  return (
    <div className="text-center py-20">
      {/* Hero Section */}
      <div className="mb-16">
        <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Welcome to RECarcade
        </h2>
        {user && (
          <p className="text-2xl text-gray-300 mb-6">
            Hello, <span className="text-green-400 font-bold">{user.username}</span>! 
            <span className="text-gray-400 ml-3">({user.regNumber})</span>
          </p>
        )}
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          The premier coding club where innovation meets competition. 
          Challenge yourself with games, compete on leaderboards, and stay updated with our latest events.
        </p>
      </div>

      {/* Top Feature Cards - More Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-green-500/30 hover:border-green-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
          <Gamepad2 className="w-16 h-16 text-green-400 mb-6 mx-auto" />
          <h3 className="text-2xl font-bold mb-4">Play Games</h3>
          <p className="text-gray-400 text-lg leading-relaxed">Test your skills with our online games</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-yellow-500/30 hover:border-yellow-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20">
          <Trophy className="w-16 h-16 text-yellow-400 mb-6 mx-auto" />
          <h3 className="text-2xl font-bold mb-4">Compete</h3>
          <p className="text-gray-400 text-lg leading-relaxed">Climb the leaderboards and prove yourself</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-blue-500/30 hover:border-blue-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
          <Calendar className="w-16 h-16 text-blue-400 mb-6 mx-auto" />
          <h3 className="text-2xl font-bold mb-4">Events</h3>
          <p className="text-gray-400 text-lg leading-relaxed">Join our hackathons and workshops</p>
        </div>
      </div>

      {/* Bottom Feature Cards - More Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-20">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl border border-purple-500/30 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
          <Code className="w-20 h-20 text-purple-400 mb-8 mx-auto" />
          <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            To foster innovation, creativity, and technical excellence among students. 
            We provide a platform for coding enthusiasts to learn, compete, and grow together.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl border border-orange-500/30 hover:border-orange-500 transition-all hover:shadow-lg hover:shadow-orange-500/20">
          <Zap className="w-20 h-20 text-orange-400 mb-8 mx-auto" />
          <h3 className="text-3xl font-bold mb-6">What We Do</h3>
          <ul className="text-gray-300 space-y-4 text-left text-lg">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-4"></span>
              Weekly coding challenges
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-4"></span>
              Hackathons and competitions
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-4"></span>
              Technical workshops
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-4"></span>
              Peer learning sessions
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-4"></span>
              Industry guest lectures
            </li>
          </ul>
        </div>
      </div>

      {/* Community Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-12 rounded-2xl border border-green-500/30 max-w-5xl mx-auto hover:shadow-lg hover:shadow-green-500/20 transition-all">
        <Users className="w-16 h-16 text-green-400 mb-6 mx-auto" />
        <h3 className="text-3xl font-bold mb-6">Join Our Community</h3>
        <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-3xl mx-auto">
          Connect with fellow coders, share knowledge, and participate in exciting competitions. 
          Your journey to becoming a better programmer starts here!
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-base">
          <span className="bg-gray-700 px-6 py-3 rounded-full hover:bg-green-500 hover:text-black transition-all cursor-pointer">#ReactJS</span>
          <span className="bg-gray-700 px-6 py-3 rounded-full hover:bg-green-500 hover:text-black transition-all cursor-pointer">#Python</span>
          <span className="bg-gray-700 px-6 py-3 rounded-full hover:bg-green-500 hover:text-black transition-all cursor-pointer">#JavaScript</span>
          <span className="bg-gray-700 px-6 py-3 rounded-full hover:bg-green-500 hover:text-black transition-all cursor-pointer">#CompetitiveCoding</span>
          <span className="bg-gray-700 px-6 py-3 rounded-full hover:bg-green-500 hover:text-black transition-all cursor-pointer">#WebDev</span>
          <span className="bg-gray-700 px-6 py-3 rounded-full hover:bg-green-500 hover:text-black transition-all cursor-pointer">#MobileDev</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
