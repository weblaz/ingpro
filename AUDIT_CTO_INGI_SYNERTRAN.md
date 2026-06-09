# RAPPORT D'AUDIT CTO — INGI SYNERTRAN PLATFORM
**Classification : CONFIDENTIEL | Date : 09 Juin 2026**

---

## 1. INVENTAIRE COMPLET

### 1.1 Routes disponibles (38 routes)

**Routes publiques :**
- `/` PublicHome · `/about` · `/solutions` · `/features` · `/sectors`
- `/pricing` · `/contact` · `/demo`
- `/login` (AuthRoute) · `/signup` + `/register` (AuthRoute)
- `/upgrade` ⚠️ accessible sans auth — bug

**Routes protégées :**
- `/dashboard` · `/dashboard/training` · `/marketplace`
- `/passeport` + `/passeport-entreprise` (module: passeport)
- `/digital-identity` + `/identite-numerique` (module: digital-identity)
- `/subcontracting` + `/sous-traitance` (module: subcontracting)
- `/procurement` · `/talents` · `/formation`
- `/local-content` + `/contenu-local` · `/analytics`
- `/localization` · `/collaboration`
- `/admin` + `/admin/demo-center` (module: admin)
- `/billing` · `*` NotFound

---

### 1.2 Pages existantes avec statut

| Page | Statut | Notes |
|---|---|---|
| PublicHome | ✅ Fonctionnel | Marketing statique |
| Login | ✅ Fonctionnel | Supabase Auth réel |
| Signup | ⚠️ Partiel | Race condition critique sur INSERT tenant→users |
| Home (Dashboard) | 🟡 Mocké | Stats hardcodées (2847, 1234, 15892, 456) |
| Passeport | ✅ Fonctionnel | CRUD Supabase réel |
| DigitalIdentity | ✅ Fonctionnel | Lecture Supabase réelle |
| Subcontracting | ✅ Fonctionnel | CRUD Supabase réel |
| Talents | ✅ Fonctionnel | CRUD Supabase réel |
| Formation | ⚠️ Partiel | Bouton S'inscrire mort |
| LocalContent | ✅ Fonctionnel | CRUD Supabase réel |
| Analytics | 🟡 Mocké | 100% données statiques hardcodées |
| Localization | ⚠️ Partiel | localStorage only, pas de Supabase |
| Collaboration | 🟡 Mocké | Messages/docs/calendrier 100% statiques |
| Admin | 🟡 Mocké | Tenants + stats hardcodés |
| Billing | 🟡 Mocké | Factures fictives, pas de Stripe |
| UpgradePlan | ❌ Cassé | Élévation de plan sans paiement — FAILLE CRITIQUE |
| Marketplace | ❌ Cassé | Fuite cross-tenant confirmée |
| DemoCenter | ✅ Fonctionnel | CRUD Supabase réel sur demo_requests |

---

### 1.3 Contextes

| Contexte | Statut | Notes |
|---|---|---|
| AuthContext | ✅ | Supabase Auth, session, RBAC |
| SubscriptionContext | ✅ | Accès par plan, useMemo correct |
| I18nContext | ❌ | t() retourne la clé brute — aucune traduction |

### 1.4 Composants
Header, Footer, ProtectedRoute, AuthRoute, DashboardCard, StatCard,
CompanyPassportForm, SubcontractingForm, TalentForm, TrainingForm,
UserManagementForm, LocalizationSelector, LanguageSelector
Admin: UserManagementTab (mocké), DatabaseTab (mocké), SecurityTab (mocké), RegionsTab, SettingsTab

### 1.5 Tables Supabase utilisées dans le code
`tenants` · `users` · `company_passports` · `digital_identities`
`subcontracting_projects` · `talents` · `trainings` · `local_content_projects`
`demo_requests` · `user_language_preferences`
NB: `translations` mentionnée dans DatabaseTab mais jamais interrogée en code.

### 1.6 Rôles utilisateurs
`super_admin` · `tenant_admin` · `project_manager` · `viewer`

---

## 2. BUGS CRITIQUES

### Bug #1 — Élévation de plan sans paiement [SÉCURITÉ CRITIQUE]
**Fichier :** `src/pages/UpgradePlan.tsx` ligne 28
```ts
supabase.from('tenants').update({ subscription_plan: planId }).eq('id', user.tenant)
```
Tout utilisateur authentifié peut s'auto-upgrader vers n'importe quel plan sans payer.
**Correction :** Supprimer cette logique. L'upgrade doit passer par un webhook Stripe côté serveur.

### Bug #2 — Fuite cross-tenant Marketplace [SÉCURITÉ CRITIQUE]
**Fichier :** `src/pages/Marketplace.tsx` useEffect
```ts
supabase.from('company_passports').select('*').order('trust_score', ...).limit(50)
```
Aucun filtre `tenant_id` — toutes les données de tous les tenants sont visibles.
**Correction :** Concevoir la RLS Supabase pour un marketplace cross-tenant avec champs limités, ou ajouter `.eq('tenant_id', user.tenant)`.

### Bug #3 — Race condition Signup [FONCTIONNEL CRITIQUE]
**Fichier :** `src/pages/public/Signup.tsx` lignes 34-71
Flux séquentiel `signUp → tenant.insert → users.insert`. Si tenant ou users échoue après Auth, l'utilisateur est en erreur permanente.
**Correction :** Supabase Edge Function avec transaction atomique.

### Bug #4 — Traductions non implémentées [FONCTIONNEL MAJEUR]
**Fichier :** `src/contexts/I18nContext.tsx` ligne 38
```ts
const t = (key: string): string => { return key; }
```
Les "15 langues" annoncées sont une promesse non tenue. La table translations n'est jamais interrogée.

### Bug #5 — Reset mot de passe non fonctionnel
**Fichier :** `src/pages/public/Login.tsx` ligne 125
`href="#"` — lien mort. `supabase.auth.resetPasswordForEmail()` non implémenté.

### Bug #6 — Trust score aléatoire côté client
**Fichiers :** `CompanyPassportForm.tsx` ligne 55, `TalentForm.tsx` ligne 57
```ts
Math.floor(Math.random() * 30) + 60
```
Le "scoring IA" et le "hash blockchain Ethereum" sont de la mise en scène. Données fausses stockées en base.

### Bug #7 — Bouton S'inscrire (Formation) mort
**Fichier :** `src/pages/Formation.tsx` ligne ~118
Bouton sans onClick. Le workflow principal du module est cassé.

### Bug #8 — Bouton Contacter (Marketplace) mort
**Fichier :** `src/pages/Marketplace.tsx`
Aucune logique de mise en relation.

### Bug #9 — Billing entièrement fictif
**Fichier :** `src/pages/Billing.tsx`
Factures hardcodées, carte Visa `4242` fictive, boutons Modifier/Télécharger sans action.

### Bug #10 — Comptes démo en clair dans le code source
**Fichier :** `src/pages/public/Login.tsx` lignes 5-11
`Admin@123`, `Total@123`, etc. en clair dans le JS buildé. Backdoor permanente si ces comptes existent en production.

---

## 3. CE QUI MANQUE

### 3.1 Fonctionnalités promises mais absentes
- Paiement réel (Stripe absent)
- Blockchain réelle (hash généré avec Math.random())
- Système de traduction (15 langues = promesse non tenue)
- Inscription aux formations
- MFA/2FA (UI seulement, non connecté à Supabase Auth)
- Mot de passe oublié
- SSO/SAML (promis Enterprise)
- API & Webhooks (promis Enterprise)
- Conformité RGPD réelle (liens CGU/Politique → /contact)

### 3.2 Workflows interrompus
| Workflow | Où ça casse |
|---|---|
| Marketplace → Contacter | Bouton mort |
| Formation → S'inscrire | Bouton mort |
| Upgrade → Payer | Pas de paiement, fraude possible |
| Collaboration → Envoyer un message | Non persisté |
| Admin → Modifier/Supprimer utilisateur | Boutons morts |

### 3.3 Données fictives non remplacées
| Fichier | Données fictives |
|---|---|
| `Home.tsx` | Stats globales (2847 entreprises...) |
| `Analytics.tsx` | 100% des graphiques |
| `Admin.tsx` | MOCK_TENANTS, stats admin |
| `Billing.tsx` | INVOICES, carte bancaire |
| `UserManagementTab.tsx` | MOCK_USERS |
| `DatabaseTab.tsx` | Toutes les métriques DB |
| `SecurityTab.tsx` | Journal d'activité |
| `Collaboration.tsx` | Messages, docs, réunions |
| `Login.tsx` | Claims marketing ("2,847 entreprises") |

---

## 4. AUDIT MULTI-TENANT **Note : 4/10**

**Bons points :**
- Les pages CRUD (Passeport, Subcontracting, Talents, Formation, LocalContent) utilisent correctement `.eq('tenant_id', user.tenant)`
- L'architecture de contexte `user.tenant` est cohérente

**Risques :**
1. Fuite cross-tenant Marketplace — confirmée
2. UpgradePlan peut modifier n'importe quel tenant si RLS mal configurée
3. RLS Supabase non confirmée dans le code — la sécurité est purement client-side
4. Si `users.tenant_id` est NULL (bug Signup), toutes les requêtes silencieusement vides

---

## 5. AUDIT AUTHENTIFICATION **Note : 5/10**

**Fonctionnel :** signInWithPassword, session auto-refresh, onAuthStateChange nettoyé, RBAC 4 niveaux

**Non fonctionnel :**
- Reset mot de passe
- "Se souvenir de moi"
- MFA
- Comptes démo en clair dans le code

**Failles :**
- Rôle `super_admin` vérifié côté client uniquement
- Race condition Signup

---

## 6. AUDIT BASE DE DONNÉES **Note : 4/10**

**Problèmes :**
1. Aucun fichier de migration SQL dans le repo — tables créées manuellement ?
2. Trust score + blockchain hash faux stockés en base (intégrité corrompue)
3. `translations` référencée dans DatabaseTab mais jamais interrogée
4. Pas de pagination sur les requêtes de liste
5. Pas de soft delete
6. Pas de seed de développement — probable développement sur base de production

---

## 7. AUDIT UX/UI **Note : 6/10**

**Points forts :** Design system cohérent, couleur primaire #0D2B55, Tailwind, Lucide icons, menu responsive

**Points faibles :**
- Nombreux boutons morts (Formation, Marketplace, Billing, Admin)
- Stats Dashboard fausses dès le premier login d'un vrai client
- Analytics "beaux mais menteurs"
- Billing affiche une Visa 4242 fictive

---

## 8. AUDIT PERFORMANCE **Note : 4/10**

**Lazy loading :** Absent. 38 imports statiques dans App.tsx. Tout le code chargé au premier rendu.

**Bundle estimé :** ~1MB gzippé (recharts ~300KB, framer-motion ~150KB, @radix-ui ~200KB)

**Problèmes :**
- `select('*')` sans pagination sur toutes les listes
- I18nContext sans useMemo sur la value — re-renders en cascade
- Aucun cache (React Query, SWR) — refetch à chaque montage de page

---

## 9. AUDIT SÉCURITÉ **Note : 3/10**

| Risque | Sévérité | Statut |
|---|---|---|
| Upgrade plan sans paiement | CRITIQUE | ❌ Non corrigé |
| Fuite cross-tenant Marketplace | CRITIQUE | ❌ Non corrigé |
| Comptes démo en clair dans le code | HAUTE | ❌ Non corrigé |
| RLS non confirmée en base | CRITIQUE | ❓ Inconnu |
| Webhooks/HMAC absents | MOYENNE | ❌ Non implémenté |
| Stripe absent | HAUTE | ❌ Non implémenté |
| Reset password absent | MOYENNE | ❌ Non implémenté |

---

## 10. AUDIT COMMERCIAL PAR MODULE

| Module | Valeur Business | Maturité | Demo Ready | Prod Ready |
|---|---|---|---|---|
| Passeport Entreprise | ⭐⭐⭐⭐⭐ | 70% | ✅ Oui | ⚠️ Partiel |
| Sous-traitance | ⭐⭐⭐⭐ | 65% | ✅ Oui | ⚠️ Partiel |
| Identité Numérique | ⭐⭐⭐⭐ | 55% | ✅ Oui | ❌ Non |
| Talents | ⭐⭐⭐ | 65% | ✅ Oui | ⚠️ Partiel |
| Formation | ⭐⭐⭐ | 40% | ⚠️ Risqué | ❌ Non |
| Local Content / ESG | ⭐⭐⭐⭐⭐ | 60% | ✅ Oui | ⚠️ Partiel |
| Analytics | ⭐⭐⭐⭐ | 15% | ❌ Non | ❌ Non |
| Localisation | ⭐⭐⭐ | 30% | ⚠️ Risqué | ❌ Non |
| Collaboration | ⭐⭐ | 10% | ❌ Non | ❌ Non |
| Admin | ⭐⭐⭐⭐ | 25% | ⚠️ Risqué | ❌ Non |

---

## 11. SCORECARD INVESTISSEUR

| Dimension | Note /10 | Commentaire |
|---|---|---|
| Produit | 5/10 | Vision solide, exécution partielle |
| UX | 6/10 | Design propre, workflows brisés |
| Technologie | 5/10 | Stack moderne, sans tests ni migrations |
| Scalabilité | 4/10 | Multi-tenant concept OK, RLS non confirmée |
| Sécurité | 3/10 | Failles critiques actives |
| Différenciation | 7/10 | Niche Afrique+MENA+ESG unique |
| Potentiel marché | 8/10 | Marché sous-digitalisé, énorme |
| **TOTAL** | **38/70** | **MVP démontrable, non vendable** |

---

## 12. ROADMAP PRIORISÉE

### P0 — BLOQUANT (avant toute démo — 1 jour)
1. Bloquer upgrade plan sans paiement (`UpgradePlan.tsx` ligne 28) — 1h
2. Retirer comptes démo du code source (`Login.tsx`) — 2h
3. Corriger fuite cross-tenant Marketplace — 1h
4. Remplacer stats Dashboard par des vrais compteurs Supabase — 3h

### P1 — CRITIQUE (sprint 1 — 1 semaine)
5. Race condition Signup → Edge Function atomique
6. Reset mot de passe (`supabase.auth.resetPasswordForEmail`)
7. Lazy loading sur toutes les routes (React.lazy + Suspense)
8. Bouton S'inscrire aux formations (table training_enrollments)
9. Créer et valider les migrations SQL + politiques RLS

### P2 — IMPORTANT (sprint 2 — 2 semaines)
10. Intégration Stripe complète (Checkout + webhooks + update plan)
11. Système i18n réel (i18next ou Supabase translations)
12. Pagination Supabase sur toutes les listes
13. Analytics connecté aux vraies données
14. Scoring algorithmique documenté (sortir le Math.random)

### P3 — AMÉLIORATION (sprint 3 — 1 mois)
15. Collaboration en temps réel (Supabase Realtime)
16. MFA/2FA Supabase Auth
17. Tests unitaires + E2E (Vitest + Playwright)
18. Monitoring (Sentry, logs)
19. SSO/SAML Enterprise

---

## 13. PLAN D'ACTION

### Quick Wins — 1 jour (8h)
| Tâche | Fichier | Durée |
|---|---|---|
| Bloquer upgrade sans paiement | UpgradePlan.tsx | 1h |
| Retirer credentials du code | Login.tsx | 2h |
| Fixer Marketplace cross-tenant | Marketplace.tsx | 1h |
| Stats Dashboard réelles | Home.tsx | 3h |
| try/catch/finally loaders | Toutes pages | 1h |

### Sprint 1 — 1 semaine
- Refactoriser Signup avec Edge Function (3j)
- Reset mot de passe (0.5j)
- Lazy loading App.tsx (0.5j)
- Bouton S'inscrire formations (1j)
- Migrations SQL + RLS Supabase (2j — priorité absolue)

### Sprint 2 — 2 semaines
- Stripe Checkout + webhooks plan (1 semaine)
- i18n réel, fichiers JSON + RTL arabe (3j)
- Pagination toutes listes (1j)
- Analytics vraies données (2j)
- Scoring algorithmique (2j)

### Sprint 3 — 1 mois
- Collaboration Realtime (1 semaine)
- MFA (3j)
- Tests 60% couverture (2 semaines)
- Monitoring + alerting (3j)

---

## 14. DEMO READINESS

### ✅ Peut être montré aujourd'hui
- Connexion complète (quick login démo)
- Création passeport entreprise (end-to-end Supabase)
- Publication appel d'offres sous-traitance
- Création profil talent
- Publication formation
- Suivi projet contenu local / ESG
- Navigation par plan (accès restreint par module)
- Page Pricing (visuellement convaincante)
- DemoCenter (admin interne fonctionnel)

### ❌ Ne JAMAIS montrer à un client
- Page Analytics (données 100% fausses)
- Page Admin (tenants, stats — 100% mockés)
- Page Billing (factures fictives, Visa 4242)
- Module Collaboration (tout est statique)
- Module Localisation (les 15 langues ne fonctionnent pas)
- Le processus d'upgrade (faille de sécurité + pas de paiement)
- Le claim "Blockchain Ethereum" (Math.random)

### 🔧 Corrections avant une démo — délai estimé
| Correctif | Délai |
|---|---|
| Stats Dashboard réelles | 3h |
| Bloquer upgrade + fix Marketplace | 2h |
| Bouton S'inscrire Formation | 4h |
| Retrait credentials code | 2h |
| **Total** | **~1 jour** |

### 💰 Prêt pour présentation investisseurs
- Vision produit et positionnement marché (excellent)
- Design et UX modules principaux (Passeport, Subcontracting, Talents, Local Content)
- Architecture multi-tenant (concept démontrable)
- Roadmap et modèle SaaS par plan
- DemoCenter comme preuve de traction

---

## 15. VERDICT FINAL

**État actuel :** INGI Synertran est un MVP avancé visuellement convaincant avec un positionnement de niche solide. Les modules core (Passeport, Sous-traitance, Talents, Local Content) sont fonctionnels end-to-end. Cependant, une proportion significative du produit est de la mise en scène : données fausses présentées comme réelles, workflows brisés sur le dernier clic, et une faille de sécurité permettant l'élévation de plan sans paiement. Le système de traduction annoncé comme "15 langues" est un no-op. Ces écarts constituent un risque commercial et juridique si le produit est vendu en l'état.

**Potentiel :** Réel et significatif. Le marché adressable (certification KYB industrielle, ESG, Local Content en Afrique et MENA) est sous-digitalisé. L'approche multi-tenant avec modèle freemium est la bonne. Avec 6 à 8 semaines de développement ciblé sur les P0/P1, le produit peut atteindre un niveau production-ready sur ses modules core.

**Recommandation prioritaire :** Arrêter l'exposition publique sans les correctifs P0 (risque de fraude). Consacrer une semaine à la sécurité (RLS, credentials, upgrade, Marketplace). Démarrer des contrats pilotes uniquement sur les modules matures (Passeport + Local Content + Sous-traitance) avec un accompagnement service managé. Intégrer Stripe dans les 30 jours. Ne jamais présenter Analytics ou Collaboration comme fonctionnels.

---
*Rapport généré le 09 juin 2026 — Audit CTO INGI Synertran*
