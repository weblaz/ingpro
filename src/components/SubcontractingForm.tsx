import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Briefcase, X, Loader2 } from 'lucide-react';

const schema = z.object({
  projectTitle: z.string().min(3, 'Titre requis'),
  projectType: z.string().min(2, 'Type requis'),
  industry: z.string().min(2, 'Secteur requis'),
  location: z.string().min(2, 'Localisation requise'),
  budget: z.string().min(1, 'Budget requis'),
  deadline: z.string().min(1, 'Date limite requise'),
  description: z.string().min(20, 'Description requise (min 20 caractères)'),
  requirements: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const PROJECT_TYPES = ['Études & Ingénierie', 'Travaux de construction', 'Fourniture de matériel', 'Services & Maintenance', 'IT & Numérique', 'Formation', 'Autre'];
const INDUSTRIES = ['Pétrole & Gaz', 'Mines & Métallurgie', 'BTP & Génie Civil', 'Agriculture', 'Énergie', 'Transport', 'Industrie', 'Télécoms', 'Santé', 'Autre'];

const SubcontractingForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('subcontracting_projects').insert({
        tenant_id: user.tenant,
        created_by: user.id,
        project_title: data.projectTitle,
        project_type: data.projectType,
        industry: data.industry,
        location: data.location,
        budget: parseFloat(data.budget),
        deadline: data.deadline,
        description: data.description,
        requirements: data.requirements || null,
        status: 'open',
        applications_count: 0,
      });

      if (error) throw error;
      toast.success('Appel d\'offres publié avec succès !');
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
            <Briefcase className="w-5 h-5 text-[#0D2B55]" />
            <h2 className="text-lg font-semibold text-gray-900">Publier un Appel d'Offres</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du projet *</label>
            <input {...register('projectTitle')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: Construction d'un entrepôt de stockage" />
            {errors.projectTitle && <p className="text-red-500 text-xs mt-1">{errors.projectTitle.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de projet *</label>
              <select {...register('projectType')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                <option value="">Sélectionner</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.projectType && <p className="text-red-500 text-xs mt-1">{errors.projectType.message}</p>}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation *</label>
              <input {...register('location')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: Alger, Algérie" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD) *</label>
              <input {...register('budget')} type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ex: 500000" />
              {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de candidature *</label>
            <input {...register('deadline')} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description du projet *</label>
            <textarea {...register('description')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Décrivez en détail le projet, les livrables attendus..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis & qualifications</label>
            <textarea {...register('requirements')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Certifications requises, expérience minimale..." />
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Publication...' : 'Publier l\'appel d\'offres'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubcontractingForm;
