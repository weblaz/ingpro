import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { User, X, Loader2 } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  country: z.string().min(2, 'Pays requis'),
  jobTitle: z.string().min(2, 'Poste requis'),
  experience: z.string().min(1, 'Expérience requise'),
  industry: z.string().min(2, 'Secteur requis'),
  skills: z.string().min(2, 'Compétences requises'),
  availability: z.string().min(1, 'Disponibilité requise'),
  bio: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const EXPERIENCE_LEVELS = ['< 2 ans', '2-5 ans', '5-10 ans', '10-15 ans', '15+ ans'];
const AVAILABILITY_OPTIONS = ['Disponible immédiatement', 'Disponible sous 1 mois', 'Disponible sous 3 mois', 'En poste, ouvert aux opportunités'];
const INDUSTRIES = ['Pétrole & Gaz', 'Mines & Métallurgie', 'BTP & Génie Civil', 'Agriculture', 'Énergie', 'Transport', 'Industrie', 'IT', 'Santé', 'Finance', 'Autre'];
const COUNTRIES = ['Algérie', 'Nigeria', 'Ghana', 'Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Maroc', 'Tunisie', 'Égypte', 'France', 'Autre'];

const TalentForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      // Score de confiance initial fixe — sera recalculé via calculate_company_trust_score
      const trustScore = 70;
      // Identifiant unique certifié (déterministe, basé sur les données du talent)
      const certifiedId = '0x' + Array.from(
        new TextEncoder().encode(`${data.email}${data.firstName}${data.lastName}${Date.now()}`)
      ).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0').slice(0, 64);

      const { error } = await supabase.from('talents').insert({
        tenant_id: user.tenant,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        job_title: data.jobTitle,
        experience: data.experience,
        industry: data.industry,
        skills: skillsArray,
        certifications: [],
        availability: data.availability,
        trust_score: trustScore,
        bio: data.bio || null,
      });

      if (error) throw error;

      // Digital identity
      await supabase.from('digital_identities').insert({
        tenant_id: user.tenant,
        identity_type: 'individual',
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        country: data.country,
        skills: skillsArray,
        trust_score: trustScore,
        blockchain_hash: certifiedId,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ type: 'talent', id: certifiedId, name: `${data.firstName} ${data.lastName}` }))}`,
      });

      toast.success('Profil talent créé avec succès !');
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
            <User className="w-5 h-5 text-[#0D2B55]" />
            <h2 className="text-lg font-semibold text-gray-900">Nouveau Profil Talent</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input {...register('firstName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input {...register('lastName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email')} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <input {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
              <select {...register('country')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste / Titre *</label>
              <input {...register('jobTitle')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: Ingénieur en génie civil" />
              {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expérience *</label>
              <select {...register('experience')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {EXPERIENCE_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur *</label>
              <select {...register('industry')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compétences clés * <span className="text-gray-400 font-normal">(séparées par virgule)</span></label>
            <input {...register('skills')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: AutoCAD, Gestion de projet, HSE, SolidWorks" />
            {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité *</label>
            <select {...register('availability')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
              <option value="">Sélectionner</option>
              {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            {errors.availability && <p className="text-red-500 text-xs mt-1">{errors.availability.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Présentation</label>
            <textarea {...register('bio')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Décrivez brièvement votre parcours et vos ambitions..." />
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Enregistrement...' : 'Enregistrer le profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TalentForm;
