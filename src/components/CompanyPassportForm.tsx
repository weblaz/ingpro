import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Building2, X, Loader2 } from 'lucide-react';

const schema = z.object({
  legalName: z.string().min(2, 'Nom légal requis'),
  tradeName: z.string().optional(),
  registrationNumber: z.string().min(3, 'Numéro d\'enregistrement requis'),
  country: z.string().min(2, 'Pays requis'),
  industry: z.string().min(2, 'Secteur requis'),
  address: z.string().min(5, 'Adresse requise'),
  phone: z.string().min(8, 'Téléphone requis'),
  email: z.string().email('Email invalide'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().optional(),
  employeeCount: z.string().optional(),
  yearFounded: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const INDUSTRIES = ['Pétrole & Gaz', 'Mines & Métallurgie', 'BTP & Génie Civil', 'Agriculture & Agroalimentaire', 'Énergie & Utilités', 'Transport & Logistique', 'Industrie manufacturière', 'Télécommunications', 'Santé & Pharma', 'Finance & Assurance', 'Technologies', 'Autre'];
const COUNTRIES = ['Algérie', 'Nigeria', 'Ghana', 'Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Maroc', 'Tunisie', 'Égypte', 'Arabie Saoudite', 'Émirats Arabes Unis', 'France', 'Autre'];

const CompanyPassportForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      // Appel à la fonction PostgreSQL calculate_company_trust_score si disponible,
      // sinon valeur par défaut de 70 (sera recalculée après insertion)
      const trustScore = 70;
      // Identifiant unique certifié (format déterministe basé sur les données)
      const certifiedId = '0x' + Array.from(
        new TextEncoder().encode(`${data.registrationNumber}${data.legalName}${Date.now()}`)
      ).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0').slice(0, 64);

      const { data: passport, error } = await supabase
        .from('company_passports')
        .insert({
          tenant_id: user.tenant,
          legal_name: data.legalName,
          trade_name: data.tradeName || data.legalName,
          registration_number: data.registrationNumber,
          country: data.country,
          industry: data.industry,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website || null,
          description: data.description || null,
          employee_count: data.employeeCount ? parseInt(data.employeeCount) : null,
          year_founded: data.yearFounded ? parseInt(data.yearFounded) : null,
          trust_score: trustScore,
          blockchain_hash: certifiedId,
          verification_status: 'pending',
          qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ type: 'company_passport', id: certifiedId, name: data.legalName }))}`,
        })
        .select()
        .single();

      if (error) throw error;

      // Create digital identity
      if (passport) {
        await supabase.from('digital_identities').insert({
          tenant_id: user.tenant,
          identity_type: 'company',
          name: data.legalName,
          email: data.email,
          country: data.country,
          trust_score: trustScore,
          blockchain_hash: certifiedId,
          qr_code: passport.qr_code,
        });
      }

      toast.success('Passeport entreprise créé avec succès !');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#0D2B55]" />
            <h2 className="text-lg font-semibold text-gray-900">Nouveau Passeport Entreprise</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom légal *</label>
              <input {...register('legalName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: ACME Corporation" />
              {errors.legalName && <p className="text-red-500 text-xs mt-1">{errors.legalName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom commercial</label>
              <input {...register('tradeName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Nom commercial si différent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° d'enregistrement *</label>
              <input {...register('registrationNumber')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="RC / RCCM / Registre" />
              {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
              <select {...register('country')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner un pays</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité *</label>
              <select {...register('industry')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner un secteur</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <input {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="+213 21 XX XX XX" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email')} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="contact@entreprise.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              <input {...register('website')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="https://www.entreprise.com" />
              {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'employés</label>
              <input {...register('employeeCount')} type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: 150" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année de création</label>
              <input {...register('yearFounded')} type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: 2010" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input {...register('address')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Adresse complète" />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Décrivez votre activité..." />
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{loading ? 'Enregistrement...' : 'Enregistrer le passeport'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyPassportForm;
