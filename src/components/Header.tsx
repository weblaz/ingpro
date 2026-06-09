import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  Menu, X, Globe, LayoutDashboard, FileText, Users, BookOpen,
  BarChart3, Settings, LogOut, ChevronDown, Building2, Briefcase,
  MapPin, MessageSquare, ShoppingBag, TrendingUp
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { hasAccess } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isPublic = !user;
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const publicLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/about', label: 'À propos' },
    { to: '/solutions', label: 'Solutions' },
    { to: '/features', label: 'Fonctionnalités' },
    { to: '/sectors', label: 'Secteurs' },
    { to: '/pricing', label: 'Tarifs' },
    { to: '/contact', label: 'Contact' },
  ];

  const dashboardLinks = [
    { to: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    ...(hasAccess('passeport') ? [{ to: '/passeport', label: 'Passeport', icon: FileText }] : []),
    ...(hasAccess('subcontracting') ? [{ to: '/subcontracting', label: 'Sous-traitance', icon: Briefcase }] : []),
    ...(hasAccess('digital-identity') ? [{ to: '/digital-identity', label: 'Identité', icon: Building2 }] : []),
    ...(hasAccess('talents') ? [{ to: '/talents', label: 'Talents', icon: Users }] : []),
    ...(hasAccess('formation') ? [{ to: '/formation', label: 'Formation', icon: BookOpen }] : []),
    ...(hasAccess('local-content') ? [{ to: '/local-content', label: 'Contenu Local', icon: MapPin }] : []),
    ...(hasAccess('analytics') ? [{ to: '/analytics', label: 'Analytics', icon: BarChart3 }] : []),
    ...(hasAccess('localization') ? [{ to: '/localization', label: 'Localisation', icon: Globe }] : []),
    { to: '/collaboration', label: 'Collaboration', icon: MessageSquare },
    ...(hasAccess('admin') ? [{ to: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0D2B55] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#0D2B55] text-lg">INGI Synertran</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {isPublic
              ? publicLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'bg-[#0D2B55] text-white'
                        : 'text-gray-600 hover:text-[#0D2B55] hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))
              : dashboardLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.to)
                          ? 'bg-[#0D2B55] text-white'
                          : 'text-gray-600 hover:text-[#0D2B55] hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })
            }
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {isPublic ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-[#0D2B55] px-3 py-2 rounded-md transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/demo"
                  className="hidden sm:inline-flex items-center px-4 py-2 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] transition-colors"
                >
                  Demander une démo
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-[#0D2B55] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.firstName || user.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">{user.role}</span>
                    </div>
                    <Link
                      to="/billing"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Facturation & Plan</span>
                    </Link>
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {(isPublic ? publicLinks : dashboardLinks).map((link: any) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-[#0D2B55] text-white'
                  : 'text-gray-600 hover:text-[#0D2B55] hover:bg-gray-100'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isPublic && (
            <div className="pt-2 space-y-2 border-t border-gray-100">
              <Link to="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setMobileOpen(false)}>Connexion</Link>
              <Link to="/demo" className="block px-3 py-2 text-sm font-medium bg-[#0D2B55] text-white rounded-md text-center" onClick={() => setMobileOpen(false)}>Demander une démo</Link>
            </div>
          )}
          {!isPublic && (
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
