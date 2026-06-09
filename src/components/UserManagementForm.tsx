import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { UserPlus, X, Loader2 } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['tenant_admin', 'project_manager', 'viewer']),
  mfaEnabled: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = [
  { value: 'tenant_admin', label: 'Administrateur' },
  { value: 'project_manager', label: 'Gestionnaire de projet' },
  { value: 'viewer', label: 'Lecteur' },
];

const UserManagementForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'viewer', mfaEnabled: false },
  });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    // Simulation — not yet connected to Supabase Auth
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Invitation envoyée à l\'utilisateur');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#0D2B55]" />
            <h2 className="text-lg font-semibold text-gray-900">Ajouter un utilisateur</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input {...register('email')} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select {...register('role')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input {...register('mfaEnabled')} type="checkbox" id="mfa" className="w-4 h-4 text-[#0D2B55] rounded" />
            <label htmlFor="mfa" className="text-sm text-gray-700">Activer l'authentification à deux facteurs (MFA)</label>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            Un email d'invitation sera envoyé à l'utilisateur pour créer son mot de passe.
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Envoi...' : 'Envoyer l\'invitation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementForm;
