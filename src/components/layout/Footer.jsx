import React from 'react';
import recLogo from '../../assets/rec.png';
import { Github, Mail, Users, Code, Facebook, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-green-500/30 bg-black/50 backdrop-blur-md mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Club Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <img
                  src={recLogo}
                  alt="RECursion Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-xl font-bold" style={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px' }}>
                Team RECursion
              </h3>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              We are programming community of NIT Durgapur, with focus on improving coding culture institute wide by conducting regular lectures from beginner to advance topics of programming. Our goal is to increase student's participation in inter-collegiate contest like ACM-ICPC and help them get better.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/RECursion-NITD" className="text-gray-400 hover:text-green-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/recursion.nit/" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#games" className="text-gray-400 hover:text-green-400 transition-colors">
                  Games
                </a>
              </li>
              <li>
                <a href="#leaderboard" className="text-gray-400 hover:text-green-400 transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="#events" className="text-gray-400 hover:text-green-400 transition-colors">
                  Events
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-green-400 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>recursion.nit@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>NIT Durgapur, Durgapur, W.B.</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Prathamesh Mandiye: +918240048380</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm font-mono">
              © 2026 Team RECursion
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">Privacy Policy</span>
              <span className="text-gray-500 text-sm">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;