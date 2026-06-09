export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise' | 'government';

// ✅ Interface Subscription manquante — ajoutée
export interface Subscription {
  id: string;
  tenant_id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  modules: string[];
  maxUsers: number;
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 299,
    annualPrice: 249,
    description: 'Idéal pour les PME qui débutent leur transformation digitale',
    features: [
      'Passeport Entreprise (KYB)',
      'Sous-traitance & Appels d\'offres',
      'Score de confiance automatique',
      'QR Code & vérification blockchain',
      'Support email',
      '5 utilisateurs inclus',
    ],
    modules: ['passeport', 'subcontracting'],
    maxUsers: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 699,
    annualPrice: 579,
    description: 'Pour les entreprises en croissance avec des besoins RH avancés',
    features: [
      'Tout le plan Starter',
      'Identité Numérique',
      'Gestion des Talents',
      'Formation & Certification',
      'Rapports avancés',
      'Support prioritaire',
      '20 utilisateurs inclus',
    ],
    modules: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity'],
    maxUsers: 20,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 1499,
    annualPrice: 1249,
    description: 'Solution complète pour les grandes entreprises',
    features: [
      'Tout le plan Pro',
      'Contenu Local & ESG',
      'Analytics & Scoring IA',
      'API & Webhooks',
      'SSO / SAML',
      'SLA 99.9%',
      'Utilisateurs illimités',
    ],
    modules: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity', 'local-content', 'analytics'],
    maxUsers: -1,
  },
  {
    id: 'government',
    name: 'Government',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Pour les organismes gouvernementaux et régulateurs',
    features: [
      'Tout le plan Enterprise',
      'Module de Localisation',
      'Console d\'administration',
      'Déploiement on-premise',
      'Conformité GDPR + locale',
      'Account manager dédié',
      'Utilisateurs illimités',
    ],
    modules: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity', 'local-content', 'analytics', 'localization', 'admin'],
    maxUsers: -1,
  },
];

export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  starter: ['passeport', 'subcontracting'],
  pro: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity'],
  enterprise: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity', 'local-content', 'analytics'],
  government: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity', 'local-content', 'analytics', 'localization', 'admin'],
};
