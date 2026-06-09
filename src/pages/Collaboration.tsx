import React, { useState } from 'react';
import Header from '../components/Header';
import { MessageSquare, FileText, Calendar, Users, Send, Paperclip } from 'lucide-react';

const MESSAGES = [
  { id: 1, user: 'Ahmed Benali', avatar: 'AB', time: '10:24', text: 'Bonjour l\'équipe, le rapport ESG Q2 est prêt pour revue.', self: false },
  { id: 2, user: 'Moi', avatar: 'M', time: '10:26', text: 'Merci Ahmed ! Je vais le vérifier maintenant.', self: true },
  { id: 3, user: 'Fatima Zahra', avatar: 'FZ', time: '10:31', text: 'J\'ai aussi mis à jour les données de contenu local pour le projet Lagos.', self: false },
  { id: 4, user: 'Moi', avatar: 'M', time: '10:35', text: 'Parfait, on se retrouve à 14h pour la revue complète ?', self: true },
];

const DOCUMENTS = [
  { name: 'Rapport ESG Q2 2026.pdf', size: '2.4 MB', modified: 'Il y a 2 heures', type: 'PDF' },
  { name: 'Passeport_Total_DZ_v3.docx', size: '1.1 MB', modified: 'Hier', type: 'DOCX' },
  { name: 'Liste_fournisseurs_qualifiés.xlsx', size: '856 KB', modified: 'Il y a 3 jours', type: 'XLSX' },
  { name: 'Contrat_sous-traitance_Q3.pdf', size: '3.2 MB', modified: 'Il y a 5 jours', type: 'PDF' },
];

const MEETINGS = [
  { title: 'Revue Passeport Q2', time: 'Aujourd\'hui 14:00', participants: 4, type: 'Visioconférence' },
  { title: 'Comité ESG mensuel', time: 'Demain 09:30', participants: 8, type: 'Présentiel' },
  { title: 'Formation HSE sous-traitants', time: 'Ven 15 Jun 10:00', participants: 25, type: 'Hybride' },
];

const TYPE_COLORS: Record<string, string> = { PDF: 'bg-red-100 text-red-700', DOCX: 'bg-blue-100 text-blue-700', XLSX: 'bg-green-100 text-green-700' };

const Collaboration: React.FC = () => {
  const [tab, setTab] = useState<'messages' | 'documents' | 'calendar'>('messages');
  const [msg, setMsg] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-[#0D2B55]" /><span>Collaboration</span>
          </h1>
          <p className="text-gray-500 mt-1">Messagerie, documents partagés et calendrier d'équipe</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-gray-900">24</p><p className="text-xs text-gray-500">Messages non lus</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-gray-900">156</p><p className="text-xs text-gray-500">Documents partagés</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-gray-900">8</p><p className="text-xs text-gray-500">Réunions ce mois</p></div>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {(['messages', 'documents', 'calendar'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-[#0D2B55] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'messages' ? <MessageSquare className="w-4 h-4" /> : t === 'documents' ? <FileText className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              <span className="capitalize">{t === 'messages' ? 'Messagerie' : t === 'documents' ? 'Documents' : 'Calendrier'}</span>
            </button>
          ))}
        </div>

        {tab === 'messages' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-96">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {MESSAGES.map(m => (
                <div key={m.id} className={`flex ${m.self ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-sm ${m.self ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${m.self ? 'bg-blue-500' : 'bg-[#0D2B55]'}`}>{m.avatar}</div>
                    <div className={`px-3 py-2 rounded-xl text-sm ${m.self ? 'bg-[#0D2B55] text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {!m.self && <p className="text-xs font-semibold mb-0.5 text-[#0D2B55]">{m.user}</p>}
                      <p>{m.text}</p>
                      <p className={`text-xs mt-1 ${m.self ? 'text-blue-200' : 'text-gray-400'}`}>{m.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 p-3 border-t border-gray-100">
              <button className="p-2 text-gray-400 hover:text-gray-600"><Paperclip className="w-4 h-4" /></button>
              <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Écrire un message..." className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
              <button className="p-2 bg-[#0D2B55] text-white rounded-xl hover:bg-[#1a3f6f]"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {DOCUMENTS.map(d => (
                <div key={d.name} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${TYPE_COLORS[d.type]}`}>{d.type}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.size} · {d.modified}</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#0D2B55] hover:underline font-medium">Télécharger</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {MEETINGS.map(m => (
                <div key={m.title} className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{m.title}</p>
                    <p className="text-sm text-gray-500">{m.time}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400 flex items-center space-x-1"><Users className="w-3 h-3" /><span>{m.participants} participants</span></span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{m.type}</span>
                    <button className="text-xs px-3 py-1.5 bg-[#0D2B55] text-white rounded-lg hover:bg-[#1a3f6f]">Rejoindre</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Collaboration;
