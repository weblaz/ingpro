import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { TrendingUp, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.terms) {
      toast.error('Vous devez accepter les conditions générales');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // Create tenant
      const slug = form.company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: form.company,
          slug: `${slug}-${Date.now()}`,
          subscription_plan: 'starter',
          subscription_status: 'active',
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create user profile
      await supabase.from('users').insert({
        id: authData.user.id,
        tenant_id: tenant.id,
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        role: 'tenant_admin',
      });

      toast.success('Compte créé avec succès ! Vérifiez votre email.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#0D2B55] flex-col justify-center px-12 text-white">
        <Link to="/" className="flex items-center space-x-2 mb-12">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">INGI Synertran</span>
        </Link>
        <h2 className="text-2xl font-bold mb-4">Commencez gratuitement</h2>
        <p className="text-gray-300 mb-8">Créez votre espace en moins de 2 minutes. Pas de carte bancaire requise.</p>
        <div className="space-y-3">
          {[
            'Plan Starter inclus (Passeport + Sous-traitance)',
            'Données isolées et sécurisées',
            'Support email inclus',
            'Migration possible vers Pro/Enterprise',
          ].map(f => (
            <div key={f} className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="text-sm text-gray-200">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-12">
        <div className="max-w-lg mx-auto w-full">
          <Link to="/" className="flex items-center space-x-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#0D2B55] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0D2B55]">INGI Synertran</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-gray-500 mb-8">Plan Starter gratuit pendant 14 jours</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                <input required value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Ahmed" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                <input required value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Benali" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email professionnel *</label>
              <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="ahmed@entreprise.com" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+213 XX XX XX XX" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise *</label>
              <input required value={form.company} onChange={e => update('company', e.target.value)} placeholder="ACME Corporation" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input type="checkbox" checked={form.terms} onChange={e => update('terms', e.target.checked)} className="w-4 h-4 text-[#0D2B55] rounded mt-0.5" />
              <span className="text-sm text-gray-600">
                J'accepte les{' '}
                <Link to="/contact" className="text-[#0D2B55] hover:underline">conditions générales d'utilisation</Link>
                {' '}et la{' '}
                <Link to="/contact" className="text-[#0D2B55] hover:underline">politique de confidentialité</Link>
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0D2B55] text-white font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Création en cours...' : 'Créer mon compte'}</span>
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[#0D2B55] font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
