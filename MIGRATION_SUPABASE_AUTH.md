# PLAN DE MIGRATION — SUPABASE AUTH COMPLET
**Projet :** I.N.G.I Synertran Platform  
**Date :** Janvier 2026  
**Objectif :** Supprimer tout le système mock, migrer vers Supabase Auth réel  
**Statut :** EN ATTENTE DE VALIDATION — Aucun code modifié  

---

## RÉSUMÉ EXÉCUTIF

Le système d'authentification actuel repose sur une logique locale dans `src/contexts/AuthContext.tsx` qui compare email/mot de passe en mémoire contre une liste de comptes démo codés en dur. Aucune session Supabase réelle n'est créée lors de la connexion. Ce plan décrit la migration complète vers Supabase Auth avec sessions réelles, suppression de tous les mocks, et connexion de chaque formulaire et liste à Supabase.

---

## ÉTAT ACTUEL — DIAGNOSTIC COMPLET

### Système d'authentification actuel (MOCK)

**Fichier :** `src/contexts/AuthContext.tsx`

**Problèmes identifiés :**

| Problème | Description | Impact |
|---|---|---|
| Authentification locale | `login()` compare email/password contre un tableau `DEMO_ACCOUNTS` en mémoire | Aucune session Supabase créée |
| Pas de `supabase.auth.signInWithPassword()` | La connexion n'appelle jamais Supabase Auth | RLS inaccessible pour les utilisateurs connectés |
| `user.id` non-UUID | Les IDs mockés (`admin-001`, `starter-001`) ne sont pas des UUIDs valides | `auth.uid()` retourne null → toutes les politiques RLS échouent |
| `user.tenant` non-UUID | Les tenant IDs mockés (`tenant-starter-001`) ne sont pas des UUIDs valides | Requêtes Supabase avec `tenant_id` invalide |
| `logout()` local | Efface uniquement localStorage, pas de `supabase.auth.signOut()` | Sessions Supabase orphelines |
| Pas de refresh token | Aucune gestion de l'expiration de session | Utilisateurs déconnectés sans avertissement |
| `I18nContext` contourne RLS | Détecte les UUIDs invalides et ignore la sync Supabase | Préférences de langue non persistées |

**Fichier :** `src/pages/public/Login.tsx`

| Problème | Description |
|---|---|
| Comptes démo hardcodés | 5 comptes avec emails/mots de passe visibles dans le code source |
| Pas de `supabase.auth.signInWithPassword()` | Appelle `login()` du AuthContext mock |
| Mots de passe en clair | `Starter2026!`, `Pro2026!`, etc. visibles dans le bundle JS |

**Fichier :** `src/pages/public/Signup.tsx`

| Problème | Description |
|---|---|
| Partiellement connecté | `supabase.auth.signUp()` est appelé correctement |
| Pas de sync AuthContext | Après inscription, l'utilisateur n'est pas connecté dans le AuthContext mock |
| Pas de gestion email confirmation | Si Supabase exige confirmation email, l'utilisateur est redirigé sans être authentifié |

**Fichiers avec données mockées persistantes :**

| Fichier | Données mockées | Impact |
|---|---|---|
| `src/pages/Home.tsx` | `2,847` / `1,234` / `15,892` / `456` codés en dur | Dashboard principal non réel |
| `src/pages/Analytics.tsx` | Scoring fournisseurs, top talents, cartographie | Analytics non connectés |
| `src/pages/Billing.tsx` | 3 factures, méthode de paiement | Facturation non réelle |
| `src/pages/Collaboration.tsx` | 24 messages, 156 docs, 8 réunions | Module non implémenté |
| `src/pages/Formation.tsx` | 2 formations `mock-1`, `mock-2` | Mélange données réelles/mockées |
| `src/pages/LocalContent.tsx` | 1 projet `mock-1` | Mélange données réelles/mockées |
| `src/pages/Admin.tsx` | Total Energies, Aramco, Airbus | Tenants non réels |
| `src/components/admin/UserManagementTab.tsx` | 5 utilisateurs mockés | Gestion utilisateurs non réelle |
| `src/components/admin/DatabaseTab.tsx` | Métriques DB mockées | Monitoring non réel |
| `src/components/admin/SecurityTab.tsx` | Alertes, conformité mockées | Sécurité non réelle |
| `src/components/admin/RegionsTab.tsx` | Régions, latences mockées | Déploiement non réel |
| `src/components/admin/SettingsTab.tsx` | Webhooks, clés API mockées | Paramètres non connectés |
| `src/components/UserManagementForm.tsx` | `setTimeout(1500)` simulation | Création utilisateur non réelle |
| `src/pages/public/Contact.tsx` | `setTimeout(1500)` simulation | Formulaire contact non connecté |

---

## ARCHITECTURE CIBLE

### Flux d'authentification après migration

```
Utilisateur
    │
    ▼
Login.tsx
    │ supabase.auth.signInWithPassword({ email, password })
    ▼
Supabase Auth (JWT)
    │ Session créée avec access_token + refresh_token
    ▼
AuthContext (Supabase)
    │ onAuthStateChange() → écoute les changements de session
    │ Charge le profil depuis public.users WHERE id = auth.uid()
    │ Charge le tenant depuis public.tenants WHERE id = user.tenant_id
    ▼
ProtectedRoute
    │ Vérifie session Supabase (pas localStorage)
    ▼
Pages protégées
    │ RLS fonctionne car auth.uid() = UUID réel
    ▼
Supabase DB (RLS actif)
```

### Structure du profil utilisateur après migration

```typescript
interface AuthUser {
  // Depuis Supabase Auth
  id: string;           // UUID réel (auth.uid())
  email: string;        // Email vérifié
  
  // Depuis public.users (chargé après auth)
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'tenant_admin' | 'project_manager' | 'viewer';
  tenant: string;       // UUID du tenant (depuis public.users.tenant_id)
  plan: string;         // Depuis public.tenants.subscription_plan
}
```

---

## PLAN DE MIGRATION — PHASES DÉTAILLÉES

---

### PHASE 1 — MIGRATION DE LA BASE DE DONNÉES

**Objectif :** Créer les comptes utilisateurs réels dans Supabase Auth et les profils correspondants dans `public.users`.

#### 1.1 Migration SQL requise

```sql
-- Exécuter dans Supabase SQL Editor

-- Ajouter colonne billing_cycle à tenants si absente
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

-- Ajouter colonne status à users si absente
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Politique RLS manquante : permettre aux utilisateurs de lire leur propre profil
CREATE POLICY IF NOT EXISTS "Users can read own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Politique RLS : permettre la mise à jour du profil
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Politique RLS pour tenants : lecture par membres
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Politique RLS pour company_passports : lecture publique (tous les projets visibles)
-- ou restreinte au tenant selon le besoin métier
-- Option A : Lecture publique (marketplace)
CREATE POLICY IF NOT EXISTS "Public can view company passports" ON public.company_passports
  FOR SELECT USING (true);

-- Option B : Lecture restreinte au tenant (actuelle)
-- Déjà en place

-- Politique pour subcontracting_projects : lecture publique (marketplace)
CREATE POLICY IF NOT EXISTS "Public can view subcontracting projects" ON public.subcontracting_projects
  FOR SELECT USING (true);

-- Politique pour talents : lecture publique
CREATE POLICY IF NOT EXISTS "Public can view talents" ON public.talents
  FOR SELECT USING (true);

-- Politique pour trainings : lecture publique
CREATE POLICY IF NOT EXISTS "Public can view trainings" ON public.trainings
  FOR SELECT USING (true);
```

#### 1.2 Création des tenants de démonstration

```sql
-- Insérer les tenants de démonstration
INSERT INTO public.tenants (id, name, slug, subscription_plan, subscription_status, billing_cycle, subscription_start_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Starter Demo Company', 'starter-demo', 'starter', 'active', 'monthly', now()),
  ('22222222-2222-2222-2222-222222222222', 'Pro Demo Company', 'pro-demo', 'pro', 'active', 'monthly', now()),
  ('33333333-3333-3333-3333-333333333333', 'Enterprise Demo Company', 'enterprise-demo', 'enterprise', 'active', 'monthly', now()),
  ('44444444-4444-4444-4444-444444444444', 'Government Demo Institution', 'government-demo', 'government', 'active', 'monthly', now())
ON CONFLICT (slug) DO NOTHING;
```

#### 1.3 Création des comptes Supabase Auth

**Action manuelle requise dans Supabase Dashboard → Authentication → Users :**

| Email | Mot de passe | Rôle | Tenant ID |
|---|---|---|---|
| `evrardolazube@gmail.com` | `client123456` | `super_admin` | NULL (accès global) |
| `starter@ingi-synertran.com` | `Starter2026!` | `tenant_admin` | `11111111-1111-1111-1111-111111111111` |
| `pro@ingi-synertran.com` | `Pro2026!` | `tenant_admin` | `22222222-2222-2222-2222-222222222222` |
| `enterprise@ingi-synertran.com` | `Enterprise2026!` | `tenant_admin` | `33333333-3333-3333-3333-333333333333` |
| `government@ingi-synertran.com` | `Government2026!` | `super_admin` | `44444444-4444-4444-4444-444444444444` |

**Après création dans le Dashboard, récupérer les UUIDs générés et exécuter :**

```sql
-- Remplacer les UUIDs par ceux générés par Supabase Auth
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, status)
VALUES 
  ('<UUID_ADMIN>', NULL, 'evrardolazube@gmail.com', 'Evrardo', 'Lazube', 'super_admin', 'active'),
  ('<UUID_STARTER>', '11111111-1111-1111-1111-111111111111', 'starter@ingi-synertran.com', 'Sophie', 'Moreau', 'tenant_admin', 'active'),
  ('<UUID_PRO>', '22222222-2222-2222-2222-222222222222', 'pro@ingi-synertran.com', 'Alexandre', 'Fontaine', 'tenant_admin', 'active'),
  ('<UUID_ENTERPRISE>', '33333333-3333-3333-3333-333333333333', 'enterprise@ingi-synertran.com', 'Nadia', 'Benali', 'tenant_admin', 'active'),
  ('<UUID_GOVERNMENT>', '44444444-4444-4444-4444-444444444444', 'government@ingi-synertran.com', 'Karim', 'Al-Mansouri', 'super_admin', 'active')
ON CONFLICT (id) DO NOTHING;
```

#### 1.4 Désactiver la confirmation email (pour les comptes démo)

Dans **Supabase Dashboard → Authentication → Settings → Email Auth :**
- Désactiver "Confirm email" OU
- Confirmer manuellement les emails des comptes démo dans le Dashboard

---

### PHASE 2 — MIGRATION DU AUTHCONTEXT

**Fichier à réécrire :** `src/contexts/AuthContext.tsx`

**Changements requis :**

| Élément actuel | Élément cible |
|---|---|
| Tableau `DEMO_ACCOUNTS` en mémoire | Supprimé |
| `login()` avec comparaison locale | `supabase.auth.signInWithPassword()` |
| `logout()` avec `localStorage.removeItem()` | `supabase.auth.signOut()` |
| `user` depuis localStorage | `user` depuis `supabase.auth.getSession()` + `public.users` |
| `isAuthenticated()` vérifie `user !== null` | Vérifie session Supabase active |
| Pas de `onAuthStateChange` | Écoute `supabase.auth.onAuthStateChange()` |
| `user.id` = string mock | `user.id` = UUID Supabase Auth |
| `user.tenant` = string mock | `user.tenant` = UUID depuis `public.users.tenant_id` |
| `user.plan` = string hardcodé | `user.plan` = depuis `public.tenants.subscription_plan` |

**Interface User cible :**

```typescript
interface User {
  id: string;           // UUID Supabase Auth (auth.uid())
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'tenant_admin' | 'project_manager' | 'viewer';
  tenant?: string;      // UUID tenant (nullable pour super_admin global)
  plan?: 'starter' | 'pro' | 'enterprise' | 'government';
}
```

**Logique de chargement du profil :**

```typescript
// Après auth.getSession() ou onAuthStateChange :
// 1. Récupérer le profil depuis public.users
const { data: profile } = await supabase
  .from('users')
  .select('*, tenants(subscription_plan)')
  .eq('id', session.user.id)
  .single();

// 2. Construire l'objet User
const user: User = {
  id: session.user.id,
  email: session.user.email,
  firstName: profile.first_name,
  lastName: profile.last_name,
  role: profile.role,
  tenant: profile.tenant_id,
  plan: profile.tenants?.subscription_plan,
};
```

**Gestion de la session :**

```typescript
// Initialisation
useEffect(() => {
  // Récupérer la session existante
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) loadUserProfile(session);
    setLoading(false);
  });

  // Écouter les changements
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session) {
        await loadUserProfile(session);
      } else {
        setUser(null);
        localStorage.removeItem('subscription');
      }
      setLoading(false);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

### PHASE 3 — MIGRATION DE LA PAGE LOGIN

**Fichier à réécrire :** `src/pages/public/Login.tsx`

**Changements requis :**

| Élément actuel | Élément cible |
|---|---|
| `handleSubmit` appelle `login()` mock | `supabase.auth.signInWithPassword({ email, password })` |
| `handleQuickLogin` appelle `login()` mock | `supabase.auth.signInWithPassword()` |
| Mots de passe visibles dans le code | Mots de passe masqués (affichage `••••••••`) |
| Comptes démo avec credentials complets | Comptes démo avec emails uniquement (mots de passe masqués) |
| Redirection manuelle `navigate('/dashboard')` | Redirection via `onAuthStateChange` dans AuthContext |

**Gestion des erreurs Supabase Auth :**

```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  if (error.message === 'Invalid login credentials') {
    toast.error('Email ou mot de passe incorrect');
  } else if (error.message === 'Email not confirmed') {
    toast.error('Veuillez confirmer votre email avant de vous connecter');
  } else {
    toast.error('Erreur lors de la connexion');
  }
}
```

---

### PHASE 4 — MIGRATION DE LA PAGE SIGNUP

**Fichier à modifier :** `src/pages/public/Signup.tsx`

**Changements requis :**

| Élément actuel | Élément cible |
|---|---|
| `supabase.auth.signUp()` ✅ déjà présent | Conserver |
| Pas de gestion confirmation email | Afficher message "Vérifiez votre email" si confirmation requise |
| Redirection immédiate vers `/dashboard` | Conditionner la redirection à la confirmation de session |
| Création tenant + user après signUp | Conserver (déjà fonctionnel) |

**Gestion de la confirmation email :**

```typescript
const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name, last_name } } });

if (data.user && !data.session) {
  // Email confirmation required
  toast.info('Vérifiez votre email pour confirmer votre compte');
  navigate('/login');
} else if (data.session) {
  // Auto-confirmed (email confirmation disabled)
  toast.success('Compte créé avec succès !');
  navigate('/dashboard');
}
```

---

### PHASE 5 — MIGRATION DU PROTECTEDROUTE

**Fichier à modifier :** `src/components/ProtectedRoute.tsx`

**Changements requis :**

| Élément actuel | Élément cible |
|---|---|
| `isAuthenticated()` vérifie `user !== null` (localStorage) | Vérifie session Supabase active |
| Pas d'état de chargement | Afficher un spinner pendant le chargement de la session |
| Redirection immédiate | Attendre la résolution de la session avant de rediriger |

**Logique cible :**

```typescript
const ProtectedRoute = ({ children, requiredModule }) => {
  const { user, loading } = useAuth();
  const { hasAccess } = useSubscription();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <>{children}</>;
  if (requiredModule && !hasAccess(requiredModule)) return <Navigate to="/upgrade" replace />;
  
  return <>{children}</>;
};
```

---

### PHASE 6 — MIGRATION DU SUBSCRIPTIONCONTEXT

**Fichier à modifier :** `src/contexts/SubscriptionContext.tsx`

**Changements requis :**

| Élément actuel | Élément cible |
|---|---|
| Subscription depuis localStorage | Subscription depuis `user.plan` (chargé via Supabase) |
| Auto-grant super_admin si pas de subscription | Conserver (basé sur `user.role`) |
| `setSubscription` depuis localStorage | Charger depuis `public.tenants.subscription_plan` |

**Logique cible :**

```typescript
// Dériver la subscription depuis le user (chargé depuis Supabase)
const subscription = useMemo(() => {
  if (!user) return null;
  const plan = user.plan || 'starter';
  return {
    plan,
    status: 'active',
    features: PLAN_FEATURES[plan] || PLAN_FEATURES.starter,
  };
}, [user]);
```

---

### PHASE 7 — SUPPRESSION DES DONNÉES MOCKÉES

#### 7.1 Formation.tsx — Supprimer les formations mockées

**Éléments à supprimer :**

```typescript
// SUPPRIMER ces données mockées :
const mockTrainings: Training[] = [
  { id: 'mock-1', title: 'Sécurité HSE...', ... },
  { id: 'mock-2', title: 'Gestion de projet...', ... }
];

// SUPPRIMER cette ligne :
const allTrainings = [...dbTrainings, ...mockTrainings];

// REMPLACER par :
const allTrainings = dbTrainings;
```

#### 7.2 LocalContent.tsx — Supprimer le projet mocké

**Éléments à supprimer :**

```typescript
// SUPPRIMER ces données mockées :
const mockProjects: LocalContentProject[] = [
  { id: 'mock-1', name: 'Raffinerie Modernisation Phase 2', ... }
];

// SUPPRIMER cette ligne :
const allProjects = [...dbProjects, ...mockProjects];

// REMPLACER par :
const allProjects = dbProjects;
```

#### 7.3 Home.tsx — Connecter les métriques du dashboard

**Métriques à connecter à Supabase :**

```typescript
// REMPLACER les valeurs hardcodées :
// "2,847" → COUNT(*) FROM company_passports
// "1,234" → COUNT(*) FROM subcontracting_projects WHERE status = 'open'
// "15,892" → COUNT(*) FROM talents
// "456"   → COUNT(*) FROM trainings WHERE status IN ('upcoming', 'ongoing')

// Requête Supabase :
const { count: companiesCount } = await supabase
  .from('company_passports')
  .select('*', { count: 'exact', head: true });
```

#### 7.4 Admin.tsx — Connecter la liste des tenants

**Éléments à connecter :**

```typescript
// REMPLACER les tenants hardcodés (Total Energies, Aramco, Airbus)
// par une requête Supabase :
const { data: tenants } = await supabase
  .from('tenants')
  .select('*, users(count)')
  .order('created_at', { ascending: false });
```

#### 7.5 UserManagementTab.tsx — Connecter la liste des utilisateurs

```typescript
// REMPLACER les 5 utilisateurs mockés par :
const { data: users } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false });
```

#### 7.6 UserManagementForm.tsx — Connecter la création d'utilisateur

```typescript
// REMPLACER setTimeout(1500) par :
// 1. Créer l'utilisateur dans Supabase Auth (via Admin API ou invitation)
// 2. Insérer dans public.users
const { error } = await supabase
  .from('users')
  .insert([{
    tenant_id: data.tenant,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    role: data.role,
    phone: data.phone,
  }]);
```

#### 7.7 Contact.tsx — Connecter le formulaire

```typescript
// REMPLACER setTimeout(1500) par :
// Option A : Table Supabase contact_messages
const { error } = await supabase
  .from('contact_messages')
  .insert([{ name, email, company, message }]);

// Option B : Edge Function avec envoi email
const { error } = await supabase.functions.invoke('send-contact-email', {
  body: { name, email, company, message }
});
```

#### 7.8 Analytics.tsx — Connecter les métriques

```typescript
// REMPLACER les données statiques par des agrégations Supabase :
const { data: supplierScores } = await supabase
  .from('supplier_scores')
  .select('*, company_passports(legal_name, industry)')
  .order('overall_score', { ascending: false })
  .limit(5);

const { data: talentScores } = await supabase
  .from('talent_scores')
  .select('*, talents(first_name, last_name, job_title)')
  .order('overall_score', { ascending: false })
  .limit(5);
```

#### 7.9 Billing.tsx — Connecter la facturation

```typescript
// Charger le plan depuis le tenant :
const { data: tenant } = await supabase
  .from('tenants')
  .select('subscription_plan, subscription_status, subscription_start_date, subscription_end_date')
  .eq('id', user.tenant)
  .single();

// Note : Les factures nécessitent Stripe pour être réelles
```

---

### PHASE 8 — MIGRATION DU I18NCONTEXT

**Fichier à modifier :** `src/contexts/I18nContext.tsx`

**Changements requis :**

| Élément actuel | Élément cible |
|---|---|
| Vérification `isValidUUID()` pour ignorer les mocks | Supprimer (tous les IDs seront des UUIDs réels) |
| Upsert conditionnel dans `user_language_preferences` | Upsert systématique |

```typescript
// SUPPRIMER cette vérification :
const isValidUUID = (id: string) => /^[0-9a-f]{8}.../.test(id);

// SUPPRIMER cette condition :
if (user && isValidUUID(user.id)) { ... }

// REMPLACER par :
if (user) {
  await supabase
    .from('user_language_preferences')
    .upsert({ user_id: user.id, tenant_id: user.tenant, language_code: lang }, { onConflict: 'user_id' });
}
```

---

### PHASE 9 — MIGRATION DES FORMULAIRES NON CONNECTÉS

#### 9.1 Table SQL requise pour Contact

```sql
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );
```

#### 9.2 Bouton S'inscrire (Formation)

```typescript
// Dans Formation.tsx, connecter le bouton "S'inscrire" :
const handleEnroll = async (trainingId: string) => {
  const { error } = await supabase
    .from('training_enrollments')
    .insert([{
      tenant_id: user?.tenant,
      training_id: trainingId,
      user_id: user?.id,
      status: 'enrolled',
      progress: 0,
    }]);

  if (!error) {
    toast.success('Inscription confirmée');
    // Incrémenter enrolled count
    await supabase
      .from('trainings')
      .update({ enrolled: supabase.rpc('increment', { x: 1 }) })
      .eq('id', trainingId);
  }
};
```

#### 9.3 Boutons Modifier/Supprimer (Admin)

```typescript
// Modifier utilisateur :
const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
};

// Supprimer utilisateur :
const handleDeleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
};
```

---

## MIGRATIONS SQL COMPLÈTES À EXÉCUTER

### Migration 1 — Nouvelles tables et colonnes

```sql
BEGIN;

-- Ajouter billing_cycle à tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

-- Ajouter status à users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Table contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

COMMIT;
```

### Migration 2 — Politiques RLS manquantes

```sql
BEGIN;

-- Permettre aux utilisateurs de lire leur propre profil
CREATE POLICY IF NOT EXISTS "Users can read own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Permettre la mise à jour du profil
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Lecture publique des projets de sous-traitance (marketplace)
CREATE POLICY IF NOT EXISTS "Public can view subcontracting projects" ON public.subcontracting_projects
  FOR SELECT USING (true);

-- Lecture publique des talents
CREATE POLICY IF NOT EXISTS "Public can view talents" ON public.talents
  FOR SELECT USING (true);

-- Lecture publique des formations
CREATE POLICY IF NOT EXISTS "Public can view trainings" ON public.trainings
  FOR SELECT USING (true);

-- Lecture publique des passeports entreprise
CREATE POLICY IF NOT EXISTS "Public can view company passports" ON public.company_passports
  FOR SELECT USING (true);

COMMIT;
```

### Migration 3 — Tenants de démonstration

```sql
BEGIN;

INSERT INTO public.tenants (id, name, slug, subscription_plan, subscription_status, billing_cycle, subscription_start_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Starter Demo Company', 'starter-demo', 'starter', 'active', 'monthly', now()),
  ('22222222-2222-2222-2222-222222222222', 'Pro Demo Company', 'pro-demo', 'pro', 'active', 'monthly', now()),
  ('33333333-3333-3333-3333-333333333333', 'Enterprise Demo Company', 'enterprise-demo', 'enterprise', 'active', 'monthly', now()),
  ('44444444-4444-4444-4444-444444444444', 'Government Demo Institution', 'government-demo', 'government', 'active', 'monthly', now())
ON CONFLICT (slug) DO NOTHING;

COMMIT;
```

---

## FICHIERS À MODIFIER — LISTE COMPLÈTE

### Fichiers à réécrire entièrement

| Fichier | Raison | Priorité |
|---|---|---|
| `src/contexts/AuthContext.tsx` | Remplacer logique mock par Supabase Auth | 🔴 CRITIQUE |
| `src/pages/public/Login.tsx` | Appeler `supabase.auth.signInWithPassword()` | 🔴 CRITIQUE |
| `src/components/ProtectedRoute.tsx` | Vérifier session Supabase + état loading | 🔴 CRITIQUE |

### Fichiers à modifier partiellement

| Fichier | Changements | Priorité |
|---|---|---|
| `src/contexts/SubscriptionContext.tsx` | Dériver subscription depuis user.plan | 🔴 CRITIQUE |
| `src/pages/public/Signup.tsx` | Gérer confirmation email | 🟠 HAUTE |
| `src/contexts/I18nContext.tsx` | Supprimer vérification UUID mock | 🟠 HAUTE |
| `src/pages/Formation.tsx` | Supprimer mockTrainings | 🟠 HAUTE |
| `src/pages/LocalContent.tsx` | Supprimer mockProjects | 🟠 HAUTE |
| `src/pages/Home.tsx` | Connecter métriques à Supabase | 🟡 NORMALE |
| `src/pages/Admin.tsx` | Connecter liste tenants | 🟡 NORMALE |
| `src/pages/Analytics.tsx` | Connecter scores et métriques | 🟡 NORMALE |
| `src/pages/Billing.tsx` | Connecter plan depuis tenant | 🟡 NORMALE |
| `src/pages/public/Contact.tsx` | Connecter à contact_messages | 🟡 NORMALE |
| `src/components/admin/UserManagementTab.tsx` | Connecter liste utilisateurs | 🟡 NORMALE |
| `src/components/UserManagementForm.tsx` | Connecter création utilisateur | 🟡 NORMALE |
| `src/components/admin/SettingsTab.tsx` | Connecter paramètres | 🔵 BASSE |
| `src/pages/Collaboration.tsx` | Implémenter ou supprimer | 🔵 BASSE |
| `src/pages/Billing.tsx` | Intégrer Stripe | 🔵 BASSE |

### Fichiers à ne pas modifier

| Fichier | Raison |
|---|---|
| `src/supabase/client.ts` | Déjà correct |
| `src/supabase/types.ts` | Déjà correct |
| `src/components/CompanyPassportForm.tsx` | Déjà connecté à Supabase |
| `src/components/SubcontractingForm.tsx` | Déjà connecté à Supabase |
| `src/components/TalentForm.tsx` | Déjà connecté à Supabase |
| `src/components/TrainingForm.tsx` | Déjà connecté à Supabase |
| `src/pages/Passeport.tsx` | Déjà connecté à Supabase |
| `src/pages/Subcontracting.tsx` | Déjà connecté à Supabase |
| `src/pages/Talents.tsx` | Déjà connecté à Supabase |
| `src/pages/DigitalIdentity.tsx` | Déjà connecté à Supabase |
| `src/pages/public/Demo.tsx` | Déjà connecté à Supabase |
| `src/pages/public/Pricing.tsx` | Déjà connecté à Supabase |
| `src/pages/public/Signup.tsx` | Partiellement connecté (modifications mineures) |
| `src/data/localizationData.ts` | Données statiques légitimes |
| `src/data/translations.ts` | Données statiques légitimes |
| `src/types/subscription.ts` | Types corrects |
| `App.tsx` | Routing correct |
| Tous les composants admin (DatabaseTab, SecurityTab, RegionsTab) | Données mockées acceptables pour monitoring |

---

## RISQUES ET POINTS D'ATTENTION

### Risques techniques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| RLS bloque les requêtes après migration | Haute | Critique | Tester chaque politique RLS avec `auth.uid()` réel |
| Boucle infinie dans `onAuthStateChange` | Moyenne | Haute | Ne pas appeler `supabase.auth.*` dans le callback |
| Session expirée non gérée | Moyenne | Haute | Implémenter `autoRefreshToken: true` (déjà configuré) |
| Profil utilisateur absent dans `public.users` | Haute | Critique | Créer le profil dans `onAuthStateChange` si absent |
| Confirmation email bloque les démos | Haute | Haute | Désactiver confirmation email dans Supabase Dashboard |
| `tenant_id` NULL pour super_admin | Moyenne | Moyenne | Gérer le cas NULL dans toutes les requêtes |

### Points d'attention métier

| Point | Description |
|---|---|
| Comptes démo | Les mots de passe des comptes démo seront dans Supabase Auth (sécurisé) mais plus visibles dans le code |
| Données existantes | Les données insérées avec les tenant IDs mockés (`tenant-starter-001`) ne seront plus accessibles |
| Sessions persistantes | Les utilisateurs actuellement "connectés" via localStorage seront déconnectés après migration |
| Super Admin sans tenant | `evrardolazube@gmail.com` n'a pas de tenant_id — les requêtes filtrées par tenant retourneront vide |

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
Étape 1 : Exécuter les migrations SQL (Phases 1.1, 1.2, 9.1)
    ↓
Étape 2 : Créer les comptes dans Supabase Auth Dashboard
    ↓
Étape 3 : Insérer les profils dans public.users (Phase 1.3)
    ↓
Étape 4 : Désactiver confirmation email dans Supabase Dashboard
    ↓
Étape 5 : Réécrire AuthContext.tsx (Phase 2)
    ↓
Étape 6 : Réécrire Login.tsx (Phase 3)
    ↓
Étape 7 : Modifier ProtectedRoute.tsx (Phase 5)
    ↓
Étape 8 : Modifier SubscriptionContext.tsx (Phase 6)
    ↓
Étape 9 : Tester le flux complet (connexion → dashboard → déconnexion)
    ↓
Étape 10 : Supprimer les données mockées (Phase 7)
    ↓
Étape 11 : Connecter les formulaires restants (Phase 9)
    ↓
Étape 12 : Tests de régression complets
```

---

## TESTS DE VALIDATION POST-MIGRATION

### Tests d'authentification

- [ ] Connexion avec `evrardolazube@gmail.com` / `client123456` → Dashboard super_admin
- [ ] Connexion avec `starter@ingi-synertran.com` / `Starter2026!` → Dashboard Starter
- [ ] Connexion avec `pro@ingi-synertran.com` / `Pro2026!` → Dashboard Pro
- [ ] Connexion avec `enterprise@ingi-synertran.com` / `Enterprise2026!` → Dashboard Enterprise
- [ ] Connexion avec `government@ingi-synertran.com` / `Government2026!` → Dashboard Government
- [ ] Mauvais mot de passe → Message d'erreur approprié
- [ ] Déconnexion → Session Supabase détruite + redirection `/login`
- [ ] Refresh page → Session restaurée depuis Supabase (pas localStorage)
- [ ] Token expiré → Refresh automatique ou redirection `/login`

### Tests RLS

- [ ] Utilisateur Starter ne voit que ses propres données
- [ ] Utilisateur Pro ne voit pas les données du tenant Starter
- [ ] Super Admin voit toutes les données
- [ ] Insertion avec `tenant_id` invalide → Erreur RLS
- [ ] Lecture sans session → Données vides (pas d'erreur)

### Tests des formulaires

- [ ] Créer un passeport → Apparaît immédiatement dans la liste
- [ ] Créer un projet sous-traitance → Apparaît immédiatement
- [ ] Créer un talent → Apparaît immédiatement
- [ ] Créer une formation → Apparaît immédiatement
- [ ] Créer un projet contenu local → Apparaît immédiatement
- [ ] Soumettre formulaire contact → Enregistré dans `contact_messages`
- [ ] Demande de démo → Enregistrée dans `demo_requests`

### Tests d'accès aux modules

- [ ] Compte Starter → `/talents` redirige vers `/upgrade`
- [ ] Compte Pro → `/local-content` redirige vers `/upgrade`
- [ ] Compte Enterprise → `/admin` redirige vers `/upgrade`
- [ ] Super Admin → Accès à tous les modules

---

## DÉCISION REQUISE AVANT IMPLÉMENTATION

**Ce plan est soumis à validation. Avant de modifier le moindre fichier, confirmer :**

1. ✅ / ❌ **Désactiver la confirmation email** dans Supabase pour les comptes démo
2. ✅ / ❌ **Créer les 5 comptes** dans Supabase Auth Dashboard manuellement
3. ✅ / ❌ **Exécuter les migrations SQL** dans l'ordre indiqué
4. ✅ / ❌ **Supprimer les données mockées** dans Formation et LocalContent
5. ✅ / ❌ **Connecter Analytics** aux données Supabase réelles
6. ✅ / ❌ **Connecter Billing** (nécessite Stripe ou simulation)
7. ✅ / ❌ **Connecter Contact** à une table ou Edge Function email

**Répondre "VALIDER LA MIGRATION" pour démarrer l'implémentation.**

---

*Plan généré par analyse statique complète — Aucun code modifié.*  
*Tous les changements seront appliqués uniquement après validation explicite.*