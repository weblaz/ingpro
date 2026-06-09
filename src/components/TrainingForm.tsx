import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { BookOpen, X, Loader2 } from 'lucide-react';

const schema = z.object({
  trainingTitle: z.string().min(3, 'Titre requis'),
  trainingType: z.string().min(2, 'Type requis'),
  industry: z.string().min(2, 'Secteur requis'),
  duration: z.string().min(1, 'Durée requise'),
  level: z.string().min(1, 'Niveau requis'),
  language: z.string().min(1, 'Langue requise'),
  location: z.string().min(2, 'Lieu requis'),
  capacity: z.string().min(1, 'Capacité requise'),
  price: z.string().min(1, 'Prix requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  description: z.string().min(20, 'Description requise (min 20 caractères)'),
  objectives: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const TRAINING_TYPES = ['Présentiel', 'En ligne (synchrone)', 'E-learning (asynchrone)', 'Hybride', 'Atelier pratique'];
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
const LANGUAGES_LIST = ['Français', 'Anglais', 'Arabe', 'Portugais', 'Espagnol'];
const INDUSTRIES = ['Pétrole & Gaz', 'Mines & Métallurgie', 'BTP', 'Agriculture', 'Énergie', 'Transport', 'Industrie', 'IT', 'Santé', 'Transversal'];

const TrainingForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('trainings').insert({
        tenant_id: user.tenant,
        created_by: user.id,
        training_title: data.trainingTitle,
        training_type: data.trainingType,
        industry: data.industry,
        duration: parseInt(data.duration),
        level: data.level,
        language: data.language,
        location: data.location,
        capacity: parseInt(data.capacity),
        enrolled: 0,
        price: parseFloat(data.price),
        start_date: data.startDate,
        description: data.description,
        objectives: data.objectives || null,
        status: 'published',
      });

      if (error) throw error;
      toast.success('Formation publiée avec succès !');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#0D2B55]" />
            <h2 className="text-lg font-semibold text-gray-900">Publier une Formation</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la formation *</label>
            <input {...register('trainingTitle')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: HSE Niveau 1 — Sécurité en milieu pétrolier" />
            {errors.trainingTitle && <p className="text-red-500 text-xs mt-1">{errors.trainingTitle.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select {...register('trainingType')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.trainingType && <p className="text-red-500 text-xs mt-1">{errors.trainingType.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur *</label>
              <select {...register('industry')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (heures) *</label>
              <input {...register('duration')} type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: 24" />
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
              <select {...register('level')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
              <select {...register('language')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {LANGUAGES_LIST.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu / Plateforme *</label>
              <input {...register('location')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: Alger / Zoom" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (places) *</label>
              <input {...register('capacity')} type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: 20" />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (USD) *</label>
              <input {...register('price')} type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: 350" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
            <input {...register('startDate')} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Décrivez le contenu et le déroulement de la formation..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs pédagogiques</label>
            <textarea {...register('objectives')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="À l'issue de cette formation, les participants seront capables de..." />
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Publication...' : 'Publier la formation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingForm;
