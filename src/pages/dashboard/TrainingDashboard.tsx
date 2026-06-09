import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';

const TrainingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenant) return;
    Promise.all([
      supabase.from('training_enrollments').select('*, trainings(*)').eq('tenant_id', user.tenant).order('created_at', { ascending: false }),
      supabase.from('trainings').select('*').eq('tenant_id', user.tenant).order('start_date', { ascending: true }).limit(5),
    ]).then(([enrollRes, trainRes]) => {
      setEnrollments(enrollRes.data || []);
      setTrainings(trainRes.data || []);
      setLoading(false);
    });
  }, [user]);

  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCount = enrollments.filter(e => e.status === 'in_progress').length;
  const avgProgress = enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-[#0D2B55]" /><span>Mon Tableau de bord Formation</span>
          </h1>
          <p className="text-gray-500 mt-1">Suivez vos formations et certifications</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            <p className="text-xs text-gray-500">Formations inscrites</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            <p className="text-xs text-gray-500">En cours</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-xs text-gray-500">Certifications obtenues</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
            <p className="text-xs text-gray-500">Progression moyenne</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Mes inscriptions</h3>
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Pas encore de formations inscrites</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{e.trainings?.training_title || 'Formation'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full"><div className="h-full bg-[#0D2B55] rounded-full" style={{ width: `${e.progress || 0}%` }}></div></div>
                          <span className="text-xs text-gray-500">{e.progress || 0}%</span>
                        </div>
                      </div>
                      <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full ${e.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600'}`}>
                        {e.status === 'completed' ? 'Terminé' : 'En cours'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Prochaines formations disponibles</h3>
              {trainings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucune formation programmée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainings.map(t => (
                    <div key={t.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.training_title}</p>
                        <p className="text-xs text-gray-500">{t.training_type} · {t.level} · {t.duration}h</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(t.start_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#0D2B55]">${t.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainingDashboard;
