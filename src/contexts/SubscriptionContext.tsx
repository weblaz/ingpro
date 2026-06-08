import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  plan: string;
  hasAccess: (module: string) => boolean;
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['passeport', 'subcontracting'],
  pro: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity'],
  enterprise: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity', 'local-content', 'analytics'],
  government: ['passeport', 'subcontracting', 'talents', 'formation', 'digital-identity', 'local-content', 'analytics', 'localization', 'admin'],
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const subscription = useMemo(() => {
    if (!user) return { plan: 'starter', features: PLAN_FEATURES.starter };
    if (user.role === 'super_admin') return { plan: 'government', features: PLAN_FEATURES.government };
    const plan = user.plan || 'starter';
    return { plan, features: PLAN_FEATURES[plan] || PLAN_FEATURES.starter };
  }, [user]);

  const hasAccess = (module: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return subscription.features.includes(module);
  };

  return (
    <SubscriptionContext.Provider value={{ plan: subscription.plan, hasAccess }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
};