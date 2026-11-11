import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#292A33] bg-[#0D0E14] text-[#A1A1AA] text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#A855F7] to-[#3B82F6] p-[1px]">
            <div className="w-full h-full bg-[#14151C] rounded-[7px] flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-[#A855F7] fill-[#A855F7]" />
            </div>
          </div>
          <span className="font-semibold text-white tracking-tight">VidAI</span>
          <span className="text-xs text-[#71717A] ml-2">
            © {new Date().getFullYear()} VidAI Systems. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#A1A1AA]">
          <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
