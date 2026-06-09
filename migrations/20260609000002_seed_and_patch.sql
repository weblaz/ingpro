-- =============================================================================
-- INGI SYNERTRAN — Script de seed + patch définitif
-- Basé sur l'analyse complète des migrations existantes
-- Version : FINALE | Date : 09 Juin 2026
--
-- CE SCRIPT FAIT TOUT EN UNE SEULE EXÉCUTION :
--   ✅ Patch des colonnes manquantes (billing_cycle, status, year_founded…)
--   ✅ Correction des incompatibilités schéma vs code
--   ✅ Ajout des politiques RLS manquantes (super_admin access)
--   ✅ Insertion des 5 tenants de démo
--   ✅ Création des 5 comptes Supabase Auth
--   ✅ Création des identités email (compatible toutes versions GoTrue)
--   ✅ Insertion des 5 profils public.users
--   ✅ Vérification finale complète
--
-- COMMENT EXÉCUTER :
--   Supabase Dashboard → SQL Editor → Coller → RUN (Ctrl+Enter)
--   URL : https://supabase.com/dashboard/project/tmetsumieelatardviin/sql/new
--
-- COMPTES CRÉÉS :
--   admin@ingi-synertran.com      / Demo2025!  → super_admin     / Government
--   ahmed.benali@total.dz         / Demo2025!  → tenant_admin    / Enterprise
--   pm@aramco-dz.com              / Demo2025!  → project_manager / Pro
--   viewer@startup.dz             / Demo2025!  → viewer          / Starter
--   gov@ministere-industrie.dz    / Demo2025!  → tenant_admin    / Government
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 1 — PATCHES SCHÉMA
-- Corrections des colonnes manquantes ou mal typées découvertes par analyse
-- des migrations vs code applicatif
-- ─────────────────────────────────────────────────────────────────────────────

-- 1a. tenants : billing_cycle manquant
--     Utilisé par Pricing.tsx → supabase.from('tenants').update({ billing_cycle })
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

-- 1b. tenants : subscription_end_date (optionnel, présent dans migration 1)
--     Déjà dans la migration initiale, mais on s'assure qu'il existe
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- 1c. users : status (référencé dans migration doc et UserManagementTab)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 1d. company_passports : year_founded vs year_established
--     Migration initiale a "year_established" mais CompanyPassportForm.tsx insère "year_founded"
--     On ajoute year_founded comme alias
ALTER TABLE public.company_passports
  ADD COLUMN IF NOT EXISTS year_founded INTEGER,
  ADD COLUMN IF NOT EXISTS address     TEXT,
  ADD COLUMN IF NOT EXISTS phone       TEXT,
  ADD COLUMN IF NOT EXISTS email       TEXT,
  ADD COLUMN IF NOT EXISTS website     TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS qr_code     TEXT,
  ADD COLUMN IF NOT EXISTS blockchain_hash TEXT;

-- 1e. digital_identities : address manquant pour la migration Auth
--     Le code n'a pas de champ address sur digital_identities, ok

-- 1f. subcontracting_projects : requirements manquant, description type
--     Migration a description TEXT (ok), mais requirements absent
ALTER TABLE public.subcontracting_projects
  ADD COLUMN IF NOT EXISTS requirements TEXT;

-- 1g. trainings : objectives manquant (TrainingForm.tsx l'insère)
ALTER TABLE public.trainings
  ADD COLUMN IF NOT EXISTS objectives TEXT;

-- 1h. local_content_projects : local_spending TEXT → local_jobs INTEGER
--     Migration a local_spending TEXT + local_jobs INTEGER : ok, déjà correct

-- 1i. talents : skills TEXT → mais le code insère skills[] (array)
--     Migration a "skills TEXT NOT NULL" mais le code insère un tableau
--     On ne peut pas changer le type sans ALTER TYPE, on le laisse TEXT
--     et on note l'incompatibilité (le code joint les skills avec join())
--     → AJOUT d'une colonne skills_array pour compatibilité future
ALTER TABLE public.talents
  ADD COLUMN IF NOT EXISTS skills_array TEXT[] DEFAULT '{}';

-- 1j. Vérification que pgcrypto est actif pour le hachage bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN RAISE NOTICE 'BLOC 1 — Patches schéma appliqués.'; END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 2 — POLITIQUES RLS COMPLÉMENTAIRES
-- Les migrations 1-4 ont les politiques de base par tenant.
-- Il manque :
--   a) Lecture du profil propre (par auth.uid()) pour AuthContext
--   b) Accès super_admin à tous les tenants/users (pour Admin.tsx)
--   c) Mise à jour du tenant (pour Pricing.tsx / UpgradePlan.tsx)
-- ─────────────────────────────────────────────────────────────────────────────

-- 2a. Users : lecture du profil propre (AUTH CONTEXT en a besoin)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can read own profile') THEN
    EXECUTE 'CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (id = auth.uid())';
    RAISE NOTICE 'Policy créée : Users can read own profile';
  ELSE RAISE NOTICE 'OK déjà présente : Users can read own profile'; END IF;
END $$;

-- 2b. Users : mise à jour du profil propre
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can update own profile') THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = auth.uid())';
    RAISE NOTICE 'Policy créée : Users can update own profile';
  ELSE RAISE NOTICE 'OK déjà présente : Users can update own profile'; END IF;
END $$;

-- 2c. Tenants : super_admin voit TOUS les tenants (Admin.tsx en a besoin)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenants' AND policyname='Super admin can view all tenants') THEN
    EXECUTE 'CREATE POLICY "Super admin can view all tenants" ON public.tenants
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''super_admin'')
      )';
    RAISE NOTICE 'Policy créée : Super admin can view all tenants';
  ELSE RAISE NOTICE 'OK déjà présente : Super admin can view all tenants'; END IF;
END $$;

-- 2d. Users : super_admin voit TOUS les utilisateurs (Admin.tsx / UserManagementTab)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Super admin can view all users') THEN
    EXECUTE 'CREATE POLICY "Super admin can view all users" ON public.users
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''super_admin'')
      )';
    RAISE NOTICE 'Policy créée : Super admin can view all users';
  ELSE RAISE NOTICE 'OK déjà présente : Super admin can view all users'; END IF;
END $$;

-- 2e. Tenants : tenant_admin + super_admin peuvent mettre à jour leur tenant
--     (Pricing.tsx : update subscription_plan + billing_cycle)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenants' AND policyname='Admins can update their tenant') THEN
    EXECUTE 'CREATE POLICY "Admins can update their tenant" ON public.tenants
      FOR UPDATE USING (
        id IN (
          SELECT tenant_id FROM public.users
          WHERE id = auth.uid() AND role IN (''super_admin'', ''tenant_admin'')
        )
      )';
    RAISE NOTICE 'Policy créée : Admins can update their tenant';
  ELSE RAISE NOTICE 'OK déjà présente : Admins can update their tenant'; END IF;
END $$;

-- 2f. demo_requests : super_admin peut mettre à jour le statut (DemoCenter.tsx)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='demo_requests' AND policyname='Admins can update demo requests') THEN
    EXECUTE 'CREATE POLICY "Admins can update demo requests" ON public.demo_requests
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''super_admin'')
      )';
    RAISE NOTICE 'Policy créée : Admins can update demo requests';
  ELSE RAISE NOTICE 'OK déjà présente : Admins can update demo requests'; END IF;
END $$;

-- 2g. company_passports : super_admin voit tout (Marketplace cross-tenant intentionnel)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_passports' AND policyname='Super admin views all passports') THEN
    EXECUTE 'CREATE POLICY "Super admin views all passports" ON public.company_passports
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''super_admin'')
      )';
    RAISE NOTICE 'Policy créée : Super admin views all passports';
  ELSE RAISE NOTICE 'OK déjà présente : Super admin views all passports'; END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'BLOC 2 — Politiques RLS appliquées.'; END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 3 — NETTOYAGE IDEMPOTENT
-- Supprime proprement les comptes et tenants de démo avant réinsertion
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_emails TEXT[] := ARRAY[
    'admin@ingi-synertran.com',
    'ahmed.benali@total.dz',
    'pm@aramco-dz.com',
    'viewer@startup.dz',
    'gov@ministere-industrie.dz'
  ];
  v_email TEXT;
  v_uid   UUID;
BEGIN
  FOREACH v_email IN ARRAY v_emails LOOP
    SELECT id INTO v_uid FROM auth.users WHERE email = v_email;
    IF v_uid IS NOT NULL THEN
      DELETE FROM auth.mfa_amr_claims    WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_uid);
      DELETE FROM auth.sessions          WHERE user_id = v_uid;
      DELETE FROM auth.refresh_tokens    WHERE user_id = v_uid;
      DELETE FROM auth.identities        WHERE user_id = v_uid;
      DELETE FROM public.user_language_preferences WHERE user_id = v_uid;
      DELETE FROM public.users           WHERE id = v_uid;
      DELETE FROM auth.users             WHERE id = v_uid;
      RAISE NOTICE 'Compte supprimé : %', v_email;
    END IF;
  END LOOP;

  -- Supprimer tenants de démo
  DELETE FROM public.tenants WHERE slug IN (
    'ingi-synertran-internal',
    'total-energies-dz',
    'aramco-dz',
    'startup-dz',
    'ministere-industrie-dz'
  );

  RAISE NOTICE 'BLOC 3 — Nettoyage terminé.';
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 4 — INSERTION DES TENANTS DE DÉMO
-- UUIDs fixes pour reproductibilité et idempotence
-- Schéma réel (migration 1) : id, name, slug, industry, country,
--   subscription_plan, subscription_status, subscription_start_date,
--   billing_cycle (patch), settings, created_at, updated_at
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_t1 UUID := '11111111-0000-0000-0000-000000000001'; -- INGI Synertran (super admin)
  v_t2 UUID := '11111111-0000-0000-0000-000000000002'; -- Total Energies DZ (enterprise)
  v_t3 UUID := '11111111-0000-0000-0000-000000000003'; -- Aramco DZ (pro)
  v_t4 UUID := '11111111-0000-0000-0000-000000000004'; -- StartupDZ (starter)
  v_t5 UUID := '11111111-0000-0000-0000-000000000005'; -- Ministère Industrie (government)
BEGIN

  INSERT INTO public.tenants (
    id, name, slug, industry, country,
    subscription_plan, subscription_status, billing_cycle,
    subscription_start_date, settings
  ) VALUES
    (v_t1, 'INGI Synertran',             'ingi-synertran-internal',
     'SaaS / Technologie', 'Algérie',
     'government', 'active', 'annual', NOW(),
     '{"is_demo": true, "demo_label": "Plateforme principale"}'::jsonb),

    (v_t2, 'Total Energies DZ',          'total-energies-dz',
     'Pétrole & Gaz', 'Algérie',
     'enterprise', 'active', 'annual', NOW(),
     '{"is_demo": true, "demo_label": "Demo Enterprise — Oil & Gas"}'::jsonb),

    (v_t3, 'Aramco DZ',                  'aramco-dz',
     'Pétrole & Gaz', 'Arabie Saoudite',
     'pro', 'active', 'annual', NOW(),
     '{"is_demo": true, "demo_label": "Demo Pro — Chef de Projet"}'::jsonb),

    (v_t4, 'StartupDZ',                  'startup-dz',
     'Technologies', 'Algérie',
     'starter', 'active', 'monthly', NOW(),
     '{"is_demo": true, "demo_label": "Demo Starter"}'::jsonb),

    (v_t5, 'Ministère de l''Industrie',  'ministere-industrie-dz',
     'Gouvernement', 'Algérie',
     'government', 'active', 'annual', NOW(),
     '{"is_demo": true, "demo_label": "Demo Government"}'::jsonb);

  RAISE NOTICE 'BLOC 4 — 5 tenants créés.';
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 5 — CRÉATION DES UTILISATEURS SUPABASE AUTH
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_u1 UUID := '22222222-0000-0000-0000-000000000001'; -- admin
  v_u2 UUID := '22222222-0000-0000-0000-000000000002'; -- ahmed
  v_u3 UUID := '22222222-0000-0000-0000-000000000003'; -- pm
  v_u4 UUID := '22222222-0000-0000-0000-000000000004'; -- viewer
  v_u5 UUID := '22222222-0000-0000-0000-000000000005'; -- gov
  v_h  TEXT := crypt('Demo2025!', gen_salt('bf'));
  v_now TIMESTAMPTZ := NOW();
BEGIN

  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) VALUES
    ('00000000-0000-0000-0000-000000000000',
     v_u1, 'authenticated', 'authenticated',
     'admin@ingi-synertran.com', v_h, v_now,
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Super","last_name":"Admin","role":"super_admin"}'::jsonb,
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000',
     v_u2, 'authenticated', 'authenticated',
     'ahmed.benali@total.dz', v_h, v_now,
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Ahmed","last_name":"Benali","role":"tenant_admin"}'::jsonb,
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000',
     v_u3, 'authenticated', 'authenticated',
     'pm@aramco-dz.com', v_h, v_now,
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Khalid","last_name":"Al-Rashid","role":"project_manager"}'::jsonb,
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000',
     v_u4, 'authenticated', 'authenticated',
     'viewer@startup.dz', v_h, v_now,
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Lydia","last_name":"Meziane","role":"viewer"}'::jsonb,
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000',
     v_u5, 'authenticated', 'authenticated',
     'gov@ministere-industrie.dz', v_h, v_now,
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Rachid","last_name":"Boukhezzar","role":"tenant_admin"}'::jsonb,
     FALSE, v_now, v_now, '', '', '', '');

  RAISE NOTICE 'BLOC 5 — 5 utilisateurs auth.users créés.';
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 6 — CRÉATION DES IDENTITÉS (compatible GoTrue ancien ET nouveau schéma)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_u1 UUID := '22222222-0000-0000-0000-000000000001';
  v_u2 UUID := '22222222-0000-0000-0000-000000000002';
  v_u3 UUID := '22222222-0000-0000-0000-000000000003';
  v_u4 UUID := '22222222-0000-0000-0000-000000000004';
  v_u5 UUID := '22222222-0000-0000-0000-000000000005';
  v_now TIMESTAMPTZ := NOW();
  has_provider_id BOOLEAN;
BEGIN

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name   = 'identities'
      AND column_name  = 'provider_id'
  ) INTO has_provider_id;

  RAISE NOTICE 'GoTrue provider_id présent : %', has_provider_id;

  IF has_provider_id THEN

    -- ── Nouveau schéma GoTrue ≥ v2.68 ──────────────────────────────────────
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES
      (v_u1::TEXT, v_u1, v_u1::TEXT,
       jsonb_build_object('sub',v_u1,'email','admin@ingi-synertran.com','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u2::TEXT, v_u2, v_u2::TEXT,
       jsonb_build_object('sub',v_u2,'email','ahmed.benali@total.dz','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u3::TEXT, v_u3, v_u3::TEXT,
       jsonb_build_object('sub',v_u3,'email','pm@aramco-dz.com','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u4::TEXT, v_u4, v_u4::TEXT,
       jsonb_build_object('sub',v_u4,'email','viewer@startup.dz','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u5::TEXT, v_u5, v_u5::TEXT,
       jsonb_build_object('sub',v_u5,'email','gov@ministere-industrie.dz','email_verified',true),
       'email', v_now, v_now, v_now);

    RAISE NOTICE 'BLOC 6 — Identités insérées (nouveau schéma).';

  ELSE

    -- ── Ancien schéma GoTrue < v2.68 ───────────────────────────────────────
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES
      (v_u1::TEXT, v_u1,
       jsonb_build_object('sub',v_u1,'email','admin@ingi-synertran.com','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u2::TEXT, v_u2,
       jsonb_build_object('sub',v_u2,'email','ahmed.benali@total.dz','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u3::TEXT, v_u3,
       jsonb_build_object('sub',v_u3,'email','pm@aramco-dz.com','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u4::TEXT, v_u4,
       jsonb_build_object('sub',v_u4,'email','viewer@startup.dz','email_verified',true),
       'email', v_now, v_now, v_now),
      (v_u5::TEXT, v_u5,
       jsonb_build_object('sub',v_u5,'email','gov@ministere-industrie.dz','email_verified',true),
       'email', v_now, v_now, v_now);

    RAISE NOTICE 'BLOC 6 — Identités insérées (ancien schéma).';

  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 7 — INSERTION DES PROFILS public.users
-- Schéma réel (migration 1) :
--   id, tenant_id, email, first_name, last_name, phone, role,
--   permissions (JSONB), mfa_enabled, last_login, created_at, updated_at
-- + status (patch bloc 1)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_u1 UUID := '22222222-0000-0000-0000-000000000001';
  v_u2 UUID := '22222222-0000-0000-0000-000000000002';
  v_u3 UUID := '22222222-0000-0000-0000-000000000003';
  v_u4 UUID := '22222222-0000-0000-0000-000000000004';
  v_u5 UUID := '22222222-0000-0000-0000-000000000005';
  v_t1 UUID := '11111111-0000-0000-0000-000000000001';
  v_t2 UUID := '11111111-0000-0000-0000-000000000002';
  v_t3 UUID := '11111111-0000-0000-0000-000000000003';
  v_t4 UUID := '11111111-0000-0000-0000-000000000004';
  v_t5 UUID := '11111111-0000-0000-0000-000000000005';
BEGIN

  INSERT INTO public.users (
    id, tenant_id, email,
    first_name, last_name, phone,
    role, permissions, mfa_enabled, status
  ) VALUES
    (v_u1, v_t1, 'admin@ingi-synertran.com',
     'Super', 'Admin', '+213 555 000 001',
     'super_admin',
     '{"modules":["*"],"actions":["*"]}'::jsonb,
     FALSE, 'active'),

    (v_u2, v_t2, 'ahmed.benali@total.dz',
     'Ahmed', 'Benali', '+213 555 000 002',
     'tenant_admin',
     '{"modules":["passeport","subcontracting","digital-identity","talents","formation","local-content","analytics"],"actions":["read","write","admin"]}'::jsonb,
     FALSE, 'active'),

    (v_u3, v_t3, 'pm@aramco-dz.com',
     'Khalid', 'Al-Rashid', '+966 555 000 003',
     'project_manager',
     '{"modules":["passeport","subcontracting","digital-identity","talents","formation"],"actions":["read","write"]}'::jsonb,
     FALSE, 'active'),

    (v_u4, v_t4, 'viewer@startup.dz',
     'Lydia', 'Meziane', '+213 555 000 004',
     'viewer',
     '{"modules":["passeport","subcontracting"],"actions":["read"]}'::jsonb,
     FALSE, 'active'),

    (v_u5, v_t5, 'gov@ministere-industrie.dz',
     'Rachid', 'Boukhezzar', '+213 555 000 005',
     'tenant_admin',
     '{"modules":["*"],"actions":["read","write","admin"]}'::jsonb,
     FALSE, 'active');

  RAISE NOTICE 'BLOC 7 — 5 profils public.users créés.';
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOC 8 — VÉRIFICATION COMPLÈTE
-- Toutes les colonnes critiques pour le AuthContext et l'application
-- ─────────────────────────────────────────────────────────────────────────────

-- 8a. Vérification des 5 comptes créés
SELECT
  '✅ COMPTE' AS check_type,
  au.email,
  pu.first_name || ' ' || pu.last_name            AS nom,
  pu.role,
  t.name                                           AS tenant,
  t.subscription_plan                              AS plan,
  t.billing_cycle,
  au.email_confirmed_at IS NOT NULL                AS email_confirme,
  pu.status
FROM auth.users au
JOIN public.users pu  ON pu.id = au.id
JOIN public.tenants t ON t.id  = pu.tenant_id
WHERE au.email IN (
  'admin@ingi-synertran.com',
  'ahmed.benali@total.dz',
  'pm@aramco-dz.com',
  'viewer@startup.dz',
  'gov@ministere-industrie.dz'
)
ORDER BY au.created_at;

-- 8b. Vérification des politiques RLS critiques
SELECT
  '🛡️ RLS' AS check_type,
  tablename,
  policyname,
  cmd AS op
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'tenants', 'demo_requests', 'company_passports')
ORDER BY tablename, policyname;

-- 8c. Vérification des colonnes patchées
SELECT
  '🔧 COLONNES' AS check_type,
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tenants', 'users', 'company_passports', 'trainings', 'subcontracting_projects')
  AND column_name IN ('billing_cycle', 'status', 'year_founded', 'address', 'phone', 'email', 'website', 'description', 'qr_code', 'blockchain_hash', 'requirements', 'objectives', 'skills_array')
ORDER BY table_name, column_name;

-- 8d. Vérification des identités auth
SELECT
  '🔑 IDENTITÉ' AS check_type,
  i.provider,
  au.email,
  i.created_at
FROM auth.identities i
JOIN auth.users au ON au.id = i.user_id
WHERE au.email IN (
  'admin@ingi-synertran.com',
  'ahmed.benali@total.dz',
  'pm@aramco-dz.com',
  'viewer@startup.dz',
  'gov@ministere-industrie.dz'
)
ORDER BY au.email;


-- ─────────────────────────────────────────────────────────────────────────────
-- RÉSULTAT ATTENDU
-- ─────────────────────────────────────────────────────────────────────────────
-- Requête 8a → 5 lignes, toutes avec email_confirme = true
-- Requête 8b → au moins 10 politiques listées pour users + tenants
-- Requête 8c → les colonnes patchées apparaissent
-- Requête 8d → 5 lignes avec provider = 'email'
--
-- Si 8a retourne 5 lignes et email_confirme = true →
--   Connexion disponible immédiatement sur https://[votre-domaine]/login
--   avec les 5 comptes et le mot de passe Demo2025!


-- ─────────────────────────────────────────────────────────────────────────────
-- RÉSUMÉ DES INCOMPATIBILITÉS CODE ↔ SCHÉMA (non bloquantes pour ce seed)
-- ─────────────────────────────────────────────────────────────────────────────
-- Ces bugs n'empêchent pas la connexion mais feront échouer les INSERTs :
--
-- 1. company_passports.year_founded   → PATCHÉE ✅ (colonne ajoutée)
-- 2. company_passports.address/phone/email/website → PATCHÉES ✅
-- 3. company_passports.qr_code/blockchain_hash     → PATCHÉES ✅
-- 4. subcontracting_projects.requirements          → PATCHÉ ✅
-- 5. trainings.objectives                          → PATCHÉ ✅
-- 6. talents.skills : TEXT dans schéma,            → PATCH PARTIEL ⚠️
--    le code insère string[] → PostgreSQL va stocker
--    "{compétence1,compétence2}" comme TEXT, acceptable.
--    La colonne skills_array TEXT[] a été ajoutée pour la future migration.
-- 7. tenants.billing_cycle                         → PATCHÉ ✅
-- 8. users.status                                  → PATCHÉ ✅
-- ─────────────────────────────────────────────────────────────────────────────
