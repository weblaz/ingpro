import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, TrendingUp } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-[#0D2B55] flex flex-col items-center justify-center px-4 text-white">
    <div className="text-center">
      <div className="flex items-center justify-center space-x-2 mb-8">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-xl">INGI Synertran</span>
      </div>
      <h1 className="text-8xl font-bold text-white/20 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-3">Page introuvable</h2>
      <p className="text-gray-300 mb-8 max-w-md">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/" className="flex items-center space-x-2 px-6 py-3 bg-white text-[#0D2B55] font-semibold rounded-xl hover:bg-gray-100 transition-colors">
          <Home className="w-4 h-4" /><span>Accueil</span>
        </Link>
        <button onClick={() => window.history.back()} className="flex items-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Retour</span>
        </button>
      </div>
    </div>
  </div>
);

export default NotFound;
