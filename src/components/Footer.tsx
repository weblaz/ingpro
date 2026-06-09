import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Mail, Phone, MapPin, Linkedin, Twitter, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0D2B55] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">INGI Synertran</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plateforme SaaS multi-tenant de gouvernance industrielle. Certifiez, gérez et optimisez votre écosystème industriel.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-white mb-4">Solutions</h3>
            <ul className="space-y-2">
              {[
                { to: '/solutions', label: 'Passeport Entreprise' },
                { to: '/solutions', label: 'Sous-traitance' },
                { to: '/solutions', label: 'Identité Numérique' },
                { to: '/solutions', label: 'Gestion des Talents' },
                { to: '/solutions', label: 'Contenu Local & ESG' },
                { to: '/solutions', label: 'Analytics IA' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-300 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'À propos' },
                { to: '/features', label: 'Fonctionnalités' },
                { to: '/sectors', label: 'Secteurs' },
                { to: '/pricing', label: 'Tarifs' },
                { to: '/contact', label: 'Contact' },
                { to: '/demo', label: 'Demander une démo' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-300 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Alger, Algérie<br />Lagos, Nigeria<br />Paris, France</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href="mailto:contact@ingi-synertran.com" className="text-gray-300 text-sm hover:text-white transition-colors">
                  contact@ingi-synertran.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+213 (0) 21 XX XX XX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <p className="text-gray-400 text-sm">© {currentYear} INGI Synertran. Tous droits réservés.</p>
          <div className="flex space-x-6">
            <Link to="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">Confidentialité</Link>
            <Link to="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">CGU</Link>
            <Link to="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
