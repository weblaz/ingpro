import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { TrendingUp, Eye, EyeOff, Loader2, Copy, ChevronDown, ChevronUp, LogIn } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@ingi-synertran.com', role: 'super_admin', plan: 'Government' },
  { label: 'Tenant Admin (Enterprise)', email: 'enterprise@ingi-synertran.com', role: 'tenant_admin', plan: 'Enterprise' },
  { label: 'Tenant Admin (Pro)', email: 'pro@ingi-synertran.com', role: 'tenant_admin', plan: 'Pro' },
  { label: 'Tenant Admin (Starter)', email: 'starter@ingi-synertran.com', role: 'tenant_admin', plan: 'Starter' },
  { label: 'Admin Gouvernement', email: 'government@ingi-synertran.com', role: 'super_admin', plan: 'Government' },
];

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        toast.error('Email ou mot de passe incorrect');
      } else if (err.message?.includes('Email not confirmed')) {
        toast.error('Veuillez confirmer votre email avant de vous connecter');
      } else {
        toast.error('Erreur lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('Demo2025!');
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Entrez votre email pour réinitialiser le mot de passe');
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setResetLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !', { autoClose: 1000 });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D2B55] flex-col justify-center px-12 text-white">
        <Link to="/" className="flex items-center space-x-2 mb-12">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">INGI Synertran</span>
        </Link>
        <h2 className="text-3xl font-bold mb-4">Bienvenue sur la plateforme de gouvernance industrielle</h2>
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Certifiez vos partenaires, gérez vos talents et pilotez votre conformité ESG — tout en un.
        </p>
        <div className="space-y-3">
          {['Passeport entreprise certifié blockchain', '15 langues supportées', 'Architecture multi-tenant sécurisée', 'Conformité ESG & contenu local'].map(f => (
            <div key={f} className="flex items-center space-x-2 text-gray-200">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full flex-shrink-0"></span>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-12">
        <div className="max-w-md mx-auto w-full">
          <Link to="/" className="flex items-center space-x-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#0D2B55] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0D2B55]">INGI Synertran</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-gray-500 mb-8">Accédez à votre espace de gouvernance industrielle</p>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] focus:border-transparent pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 text-[#0D2B55] rounded" />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="text-sm text-[#0D2B55] hover:underline disabled:opacity-50"
              >
                {resetLoading ? 'Envoi...' : 'Mot de passe oublié ?'}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0D2B55] text-white font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
            </button>
          </form>

          {/* Demo accounts */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>🎯 Comptes de démonstration</span>
              {showDemo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showDemo && (
              <div className="divide-y divide-gray-100">
                <div className="px-4 py-2 bg-blue-50 text-xs text-blue-700">
                  Mot de passe pour tous les comptes démo : <span className="font-mono font-bold">Demo2025!</span>
                </div>
                {DEMO_ACCOUNTS.map(acc => (
                  <div key={acc.email} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{acc.label}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-gray-400 font-mono">{acc.email}</span>
                        <button onClick={() => copyToClipboard(acc.email)} className="text-gray-300 hover:text-gray-500">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{acc.plan}</span>
                      <button
                        onClick={() => handleFillCredentials(acc)}
                        disabled={loading}
                        className="text-xs px-2.5 py-1 bg-[#0D2B55] text-white rounded-lg hover:bg-[#1a3f6f] transition-colors disabled:opacity-50"
                      >
                        Remplir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-[#0D2B55] font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;