# RAPPORT PRÉ-EXÉCUTION — Analyse du schéma Supabase
**Projet :** INGI Synertran | **Date :** 09 Juin 2026
**Objet :** Validation du script `seed_demo_accounts.sql` avant exécution

---

## RÉSUMÉ EXÉCUTIF

Le script original **ne peut pas s'exécuter en l'état** pour 3 raisons bloquantes et
présente 4 risques complémentaires. Un script corrigé est généré à la fin de ce rapport.

| Catégorie | Problème | Sévérité |
|---|---|---|
| `auth.identities.provider_id` | Colonne présente dans Supabase ≥ v2.68 seulement | 🔴 BLOQUANT |
| Politiques RLS manquantes | Le AuthContext ne peut pas lire `public.users` sans policy | 🔴 BLOQUANT |
| `tenants.billing_cycle` absent | Colonne potentiellement manquante — Pricing.tsx en a besoin | 🟠 RISQUE ÉLEVÉ |
| `tenants.subscription_start_date` absent | Colonne non listée dans le schéma — INSERT pourrait échouer si NOT NULL | 🟠 RISQUE ÉLEVÉ |
| UUIDs fixes dans les tenants | Conflicts si la migration doc a déjà créé ses propres tenants | 🟡 RISQUE MOYEN |
| `users.phone` absent du seed | Column existe (Signup l'insère) mais manque dans le seed | 🟢 FAIBLE |
| `users.status` absent du seed | À ajouter selon migration doc | 🟢 FAIBLE |

---

## 1. ANALYSE DU VRAI SCHÉMA

### 1.1 Tables confirmées existantes (AUDIT_TECHNIQUE.md + PRODUCTION_CHECKLIST.md)

```
✅ tenants          — id, name, slug, subscription_plan, subscription_status, [+triggers updated_at]
✅ users            — id, tenant_id, email, first_name, last_name, role, mfa_enabled, [+triggers]
✅ company_passports
✅ digital_identities
✅ subcontracting_projects
✅ project_applications
✅ talents
✅ trainings
✅ training_enrollments
✅ local_content_projects
✅ esg_indicators
✅ supplier_scores
✅ talent_scores
✅ demo_requests
✅ translations
✅ tenant_language_settings
✅ user_language_preferences
```

**Total confirmé : 17 tables** — aucune table `subscriptions`, `profiles`, `organizations`
n'existe dans ce schéma. Ces noms de tables n'existent PAS dans votre base.

### 1.2 Colonnes CERTIFIÉES dans `tenants`

| Colonne | Type | Certitude | Source |
|---|---|---|---|
| `id` | UUID PK | ✅ Confirmé | AUDIT + code |
| `name` | TEXT | ✅ Confirmé | AUDIT + code |
| `slug` | TEXT UNIQUE | ✅ Confirmé | migration doc `ON CONFLICT (slug)` |
| `subscription_plan` | TEXT | ✅ Confirmé | AuthContext + SubscriptionContext |
| `subscription_status` | TEXT | ✅ Confirmé | AUDIT |
| `created_at` | TIMESTAMPTZ | ✅ Confirmé | trigger `update_tenants_updated_at` |
| `updated_at` | TIMESTAMPTZ | ✅ Confirmé | trigger |
| `billing_cycle` | TEXT | ⚠️ **INCERTAIN** | Migration doc dit `ADD COLUMN IF NOT EXISTS` |
| `subscription_start_date` | TIMESTAMPTZ | ⚠️ **INCERTAIN** | Migration doc l'inclut dans INSERT |

### 1.3 Colonnes CERTIFIÉES dans `users`

| Colonne | Type | Certitude | Source |
|---|---|---|---|
| `id` | UUID PK (FK → auth.users) | ✅ Confirmé | AUDIT + AuthContext |
| `tenant_id` | UUID FK → tenants | ✅ Confirmé | AUDIT + queries |
| `email` | TEXT | ✅ Confirmé | AUDIT |
| `first_name` | TEXT | ✅ Confirmé | AuthContext profil |
| `last_name` | TEXT | ✅ Confirmé | AuthContext profil |
| `role` | TEXT | ✅ Confirmé | AUDIT + RBAC |
| `mfa_enabled` | BOOLEAN | ✅ Confirmé | AUDIT |
| `created_at` | TIMESTAMPTZ | ✅ Confirmé | trigger |
| `updated_at` | TIMESTAMPTZ | ✅ Confirmé | trigger |
| `phone` | TEXT | ⚠️ **INCERTAIN** | Signup.tsx l'insère mais pas dans AUDIT |
| `status` | TEXT | ⚠️ **INCERTAIN** | Migration doc dit `ADD COLUMN IF NOT EXISTS` |

### 1.4 Structure `auth.identities` — Point le plus critique

La structure de cette table varie selon la version de Supabase GoTrue :

**Ancienne structure (GoTrue < v2.68) :**
```sql
auth.identities (
  id         UUID,
  user_id    UUID,
  identity_data JSONB,
  provider   TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Nouvelle structure (GoTrue ≥ v2.68, @supabase/supabase-js ≥ 2.50) :**
```sql
auth.identities (
  id          TEXT,   -- ← changé de UUID à TEXT
  user_id     UUID,
  provider_id TEXT,   -- ← NOUVELLE COLONNE
  identity_data JSONB,
  provider    TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ
)
```

**Votre projet utilise `@supabase/supabase-js ^2.57.4`** → version récente → très probablement
la nouvelle structure avec `provider_id`. Le script corrigé détecte automatiquement la version.

---

## 2. PROBLÈMES BLOQUANTS DANS LE SCRIPT ORIGINAL

### 🔴 Problème #1 — `auth.identities.provider_id` conditionnel

**Script original :**
```sql
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, ...
)
```

**Risque :** Si `provider_id` n'existe pas → erreur fatale `column "provider_id" does not exist`.
**Correction :** Détecter la structure au runtime avec `information_schema.columns`.

### 🔴 Problème #2 — Politiques RLS absentes = AuthContext cassé

**Le AuthContext fait :**
```typescript
supabase.from('users')
  .select('*, tenants(subscription_plan)')
  .eq('id', session.user.id)
  .single()
```

**Sans politiques RLS `SELECT` sur `users` et `tenants`**, cette requête retourne `null`
même si l'utilisateur est authentifié → `user` reste `null` dans le contexte → page blanche
après connexion, redirection vers `/login` en boucle infinie.

**Le MIGRATION_SUPABASE_AUTH.md confirme explicitement que ces politiques sont manquantes :**
```sql
-- Politique RLS manquante : permettre aux utilisateurs de lire leur propre profil
CREATE POLICY IF NOT EXISTS "Users can read own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );
```

**Le script corrigé intègre ces politiques.**

### 🟠 Problème #3 — Colonnes potentiellement manquantes dans `tenants`

Le script original insère dans `tenants` sans `billing_cycle` ni `subscription_start_date`.
Si ces colonnes ont une contrainte `NOT NULL` sans valeur par défaut → INSERT échoue.
**Correction :** Ajouter `ADD COLUMN IF NOT EXISTS` en préambule.

### 🟠 Problème #4 — Pas de FK déclarée pour le JOIN PostgREST

La syntaxe `tenants(subscription_plan)` dans AuthContext nécessite que PostgREST connaisse
la relation FK `users.tenant_id → tenants.id`. Cette FK doit exister dans la base.
Si elle manque, la jointure retourne `null` pour `tenants`. Le script corrigé vérifie et
crée la FK si absente.

---

## 3. CE QUI EST SÛREMENT CORRECT

| Aspect | Statut |
|---|---|
| Tables `tenants` et `users` existent | ✅ Confirmé |
| Le trigger `updated_at` existe sur les deux tables | ✅ Confirmé — ne pas insérer `updated_at` manuellement |
| RLS activé sur toutes les tables | ✅ Confirmé (PRODUCTION_CHECKLIST) |
| Colonnes `id, name, slug, subscription_plan, subscription_status` dans `tenants` | ✅ Confirmé |
| Colonnes `id, tenant_id, email, first_name, last_name, role, mfa_enabled` dans `users` | ✅ Confirmé |
| `slug` a une contrainte UNIQUE | ✅ Confirmé (`ON CONFLICT (slug)`) |
| FK `users.tenant_id → tenants.id` | ✅ Très probable (AUDIT + code + relations PostgREST) |
| Les 5 tables listées `subscriptions`, `profiles`, `organizations` **n'existent PAS** | ✅ Confirmé absent |

---

## 4. TABLES DEMANDÉES QUI N'EXISTENT PAS

Vous avez demandé de vérifier :
- ~~`subscriptions`~~ — **N'EXISTE PAS** dans votre schéma
- ~~`profiles`~~ — **N'EXISTE PAS** (remplacée par `users` + `tenants`)
- ~~`organizations`~~ — **N'EXISTE PAS** (remplacée par `tenants`)

Ces tables n'ont pas besoin d'être créées — votre architecture utilise `tenants` à la place
des `organizations`, et `users` contient les profils directement.

---

## 5. VERDICT

| Question | Réponse |
|---|---|
| Le script original est-il safe à exécuter tel quel ? | ❌ NON — 2 problèmes bloquants |
| Y a-t-il des risques de corruption de données ? | ❌ NON — L'étape 0 nettoie avant |
| Le schéma a-t-il des incohérences avec le code ? | ⚠️ OUI — RLS manquante + colonnes incertaines |
| Faut-il créer des tables supplémentaires ? | ❌ NON — 17 tables suffisent |
| Le script corrigé sera-t-il idempotent ? | ✅ OUI |

---

*Le script corrigé se trouve dans `seed_demo_accounts_v2.sql`*
