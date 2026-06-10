import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, Star, ArrowRight, User, Award } from 'lucide-react';

const TalentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myProfile, setMyProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [availableTrainings, setAvailableTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, enrollmentsRes, trainingsRes] = await Promise.all([
          user?.email
            ? supabase.from('talents').select('*').eq('email', user.email).limit(1).maybeSingle()
            : Promise.resolve({ data: null }),
          user?.id && user?.tenant
            ? supabase.from('training_enrollments').select('*, trainings(training_title, level, duration, start_date)').eq('user_id', user.id).eq('tenant_id', user.tenant)
            : Promise.resolve({ data: [] }),
          user?.tenant
            ? supabase.from('trainings').select('*').eq('tenant_id', user.tenant).eq('status', 'published').limit(5)
            : Promise.resolve({ data: [] }),
        ]);

        setMyProfile((profileRes as any).data || null);
        setEnrollments((enrollmentsRes as any).data || []);
        setAvailableTrainings((trainingsRes as any).data || []);
      } catch (err) {
        console.error('Talent dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCount = enrollments.filter(e => e.status === 'enrolled' || e.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#0D2B55]" />
            <span>Espace Talent</span>
          </h1>
          <p className="text-gray-500 mt-1">Gérez votre profil, suivez vos formations et certifications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            <p className="text-xs text-gray-500">Formations inscrites</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-xs text-gray-500">Certifications obtenues</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{myProfile?.trust_score || '—'}</p>
            <p className="text-xs text-gray-500">Score de confiance</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to="/talents" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0D2B55] transition-all group">
            <div className="p-2.5 bg-blue-50 rounded-lg w-fit mb-3"><User className="w-5 h-5 text-[#0D2B55]" /></div>
            <p className="font-semibold text-gray-900 group-hover:text-[#0D2B55]">Mon profil talent</p>
            <p className="text-xs text-gray-400 mt-0.5">{myProfile ? 'Modifier mon profil' : 'Créer mon profil'}</p>
            <div className="flex items-center space-x-1 mt-3 text-xs text-[#0D2B55] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Accéder</span><ArrowRight className="w-3 h-3" />
            </div>
          </Link>
          <Link to="/formation" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0D2B55] transition-all group">
            <div className="p-2.5 bg-teal-50 rounded-lg w-fit mb-3"><BookOpen className="w-5 h-5 text-teal-600" /></div>
            <p className="font-semibold text-gray-900 group-hover:text-[#0D2B55]">Catalogue formations</p>
            <p className="text-xs text-gray-400 mt-0.5">S'inscrire à une formation</p>
            <div className="flex items-center space-x-1 mt-3 text-xs text-[#0D2B55] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Accéder</span><ArrowRight className="w-3 h-3" />
            </div>
          </Link>
          <Link to="/dashboard/training" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0D2B55] transition-all group">
            <div className="p-2.5 bg-purple-50 rounded-lg w-fit mb-3"><Award className="w-5 h-5 text-purple-600" /></div>
            <p className="font-semibold text-gray-900 group-hover:text-[#0D2B55]">Mes formations</p>
            <p className="text-xs text-gray-400 mt-0.5">{inProgressCount} en cours · {completedCount} terminées</p>
            <div className="flex items-center space-x-1 mt-3 text-xs text-[#0D2B55] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Accéder</span><ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My profile summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Mon profil</h3>
              {!myProfile ? (
                <div className="text-center py-8">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-3">Profil talent non créé</p>
                  <Link to="/talents" className="text-xs text-[#0D2B55] hover:underline font-medium">Créer mon profil →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#0D2B55] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {myProfile.first_name?.[0]}{myProfile.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{myProfile.first_name} {myProfile.last_name}</p>
                      <p className="text-sm text-gray-500">{myProfile.job_title}</p>
                      <p className="text-xs text-gray-400">{myProfile.country} · {myProfile.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0D2B55] rounded-full" style={{ width: `${myProfile.trust_score}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{myProfile.trust_score}/100</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${myProfile.availability?.includes('immédiatement') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                      {myProfile.availability}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Available trainings */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Formations disponibles</h3>
                <Link to="/formation" className="text-xs text-[#0D2B55] hover:underline font-medium">Voir toutes →</Link>
              </div>
              {availableTrainings.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">Aucune formation disponible</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {availableTrainings.map(t => (
                    <div key={t.id} className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{t.training_title}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                        <span>{t.level}</span>
                        <span>·</span>
                        <span>{t.duration}h</span>
                        <span>·</span>
                        <span className="text-green-600 font-medium">{t.enrolled}/{t.capacity} places</span>
                      </div>
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

export default TalentDashboard;
