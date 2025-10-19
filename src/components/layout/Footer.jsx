import React from 'react';
import { Github, Mail, Users, Facebook, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-green-500/30 bg-black/50 backdrop-blur-md mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Club Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center overflow-hidden border border-green-500/30">
              </div> */}
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px' }}>
                Who Are We?
              </h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm max-w-xl">
              We, Team RECursion, are the programming community of NIT Durgapur, focused on improving coding culture institute-wide by conducting regular lectures from beginner to advanced topics of programming. Our goal is to increase student participation in inter-collegiate contests like ACM-ICPC and help them excel.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/RECursion-NITD" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-green-500/10"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/recursion.nit/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-green-500/10"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#games" className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
                  <span className="text-green-500">›</span> Games
                </a>
              </li>
              <li>
                <a href="#leaderboard" className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
                  <span className="text-green-500">›</span> Leaderboard
                </a>
              </li>
              <li>
                <a href="#events" className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
                  <span className="text-green-500">›</span> Events
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center gap-2 hover:translate-x-1 transition-transform">
                  <span className="text-green-500">›</span> About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <a 
                href="mailto:recursion.nit@gmail.com"
                className="flex items-start gap-3 text-gray-400 hover:text-green-400 transition-colors group"
              >
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm break-all">recursion.nit@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">NIT Durgapur, West Bengal</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-300">Prathamesh Mandiye</p>
                  <a href="tel:+918240048380" className="hover:text-green-400 transition-colors">
                    +91 8240048380
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm font-mono">
              © 2025-26 Team RECursion. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#privacy" className="text-gray-500 hover:text-green-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-500 hover:text-green-400 text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;