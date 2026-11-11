import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

export default function Navbar({ customRightAction = null }) {
  const location = useLocation();

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#292A33] bg-[#0D0E14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A855F7] to-[#3B82F6] p-[1px] shadow-sm">
            <div className="w-full h-full bg-[#14151C] rounded-[11px] flex items-center justify-center group-hover:bg-[#191A23] transition-colors">
              <Play className="w-4 h-4 text-[#A855F7] fill-[#A855F7]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-[#F8FAFC]">VidAI</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-purple-500/10 text-[#A855F7] border border-purple-500/20">
              SaaS
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
          <button 
            type="button"
            onClick={() => scrollToSection('features')} 
            className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            Features
          </button>
          <button 
            type="button"
            onClick={() => scrollToSection('how-it-works')} 
            className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button 
            type="button"
            onClick={() => scrollToSection('use-cases')} 
            className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            Use Cases
          </button>
        </nav>

        {/* Right CTA / Custom */}
        <div className="flex items-center gap-3">
          {customRightAction ? (
            customRightAction
          ) : (
            <>
              <button
                type="button"
                onClick={() => alert("VidAI is currently in public preview. No login required!")}
                className="text-sm font-medium text-[#A1A1AA] hover:text-[#F8FAFC] px-3 py-1.5 rounded-lg transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <Link
                to="/get-started"
                className="btn-gradient inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
