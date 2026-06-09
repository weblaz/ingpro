-- =============================================================================
-- INGI SYNERTRAN — Script d'insertion des comptes démo (VERSION CORRIGÉE v2)
-- Date : 09 Juin 2026
--
-- CORRECTIONS vs v1 :
--   - Détection automatique du schéma auth.identities (provider_id conditionnel)
--   - Ajout des colonnes potentiellement manquantes (billing_cycle, status, phone)
--   - Création des politiques RLS critiques pour que AuthContext fonctionne
--   - Vérification et création de la FK users.tenant_id → tenants.id
--   - Trigger updated_at : ne pas insérer created_at/updated_at manuellement
--     (les triggers les gèrent automatiquement)
--   - Super admin avec tenant_id NULL (accès global)
--   - Idempotent : safe à relancer plusieurs fois
--
-- INSTRUCTIONS :
--   1. Ouvrir le SQL Editor Supabase
--      https://supabase.com/dashboard/project/tmetsumieelatardviin/sql/new
--   2. Coller ce script COMPLET
--   3. Cliquer "RUN" ou Ctrl+Enter
--   4. Vérifier la section "VÉRIFICATION FINALE" en bas
-- =============================================================================

-- =============================================================================
-- ÉTAPE 0 — Préparation des colonnes potentiellement manquantes
-- (ADD COLUMN IF NOT EXISTS = sans risque si la colonne existe déjà)
-- =============================================================================

-- tenants : colonnes supplémentaires que le code utilise
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'annual',
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ DEFAULT now();

-- users : colonnes supplémentaires
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- =============================================================================
-- ÉTAPE 1 — Création des politiques RLS critiques
-- SANS CELLES-CI, le AuthContext retourne null après connexion = boucle infinie
-- =============================================================================

-- Policy : chaque utilisateur peut lire son propre profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can read own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own profile" ON public.users
      FOR SELECT USING (id = auth.uid())';
    RAISE NOTICE 'Policy créée : Users can read own profile';
  ELSE
    RAISE NOTICE 'Policy existante (OK) : Users can read own profile';
  END IF;
END $$;

-- Policy : chaque utilisateur peut mettre à jour son propre profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.users
      FOR UPDATE USING (id = auth.uid())';
    RAISE NOTICE 'Policy créée : Users can update own profile';
  ELSE
    RAISE NOTICE 'Policy existante (OK) : Users can update own profile';
  END IF;
END $$;

-- Policy : chaque utilisateur peut lire le tenant auquel il appartient
-- (critique pour la jointure tenants(subscription_plan) dans AuthContext)
DO $$
BEGIN
  -- Supprimer l'ancienne version si elle existe avec le même nom
  DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

  EXECUTE 'CREATE POLICY "Users can view their own tenant" ON public.tenants
    FOR SELECT USING (
      id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    )';
  RAISE NOTICE 'Policy créée/mise à jour : Users can view their own tenant';
END $$;

-- Policy : super_admin peut tout lire dans users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Super admin reads all users'
  ) THEN
    EXECUTE 'CREATE POLICY "Super admin reads all users" ON public.users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u2
          WHERE u2.id = auth.uid()
            AND u2.role = ''super_admin''
        )
      )';
    RAISE NOTICE 'Policy créée : Super admin reads all users';
  ELSE
    RAISE NOTICE 'Policy existante (OK) : Super admin reads all users';
  END IF;
END $$;

-- Policy : super_admin peut tout lire dans tenants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tenants'
      AND policyname = 'Super admin reads all tenants'
  ) THEN
    EXECUTE 'CREATE POLICY "Super admin reads all tenants" ON public.tenants
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND u.role = ''super_admin''
        )
      )';
    RAISE NOTICE 'Policy créée : Super admin reads all tenants';
  ELSE
    RAISE NOTICE 'Policy existante (OK) : Super admin reads all tenants';
  END IF;
END $$;

-- Policy : super_admin peut mettre à jour les tenants (upgrade de plan)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tenants'
      AND policyname = 'Tenant admins can update own tenant'
  ) THEN
    EXECUTE 'CREATE POLICY "Tenant admins can update own tenant" ON public.tenants
      FOR UPDATE USING (
        id IN (
          SELECT tenant_id FROM public.users
          WHERE id = auth.uid()
            AND role IN (''tenant_admin'', ''super_admin'')
        )
      )';
    RAISE NOTICE 'Policy créée : Tenant admins can update own tenant';
  ELSE
    RAISE NOTICE 'Policy existante (OK) : Tenant admins can update own tenant';
  END IF;
END $$;

-- =============================================================================
-- ÉTAPE 2 — Vérification et création de la FK users.tenant_id → tenants.id
-- Nécessaire pour la jointure PostgREST tenants(subscription_plan)
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'users'
      AND kcu.column_name = 'tenant_id'
  ) THEN
    -- FK absente : la créer
    ALTER TABLE public.users
      ADD CONSTRAINT users_tenant_id_fkey
      FOREIGN KEY (tenant_id)
      REFERENCES public.tenants(id)
      ON DELETE SET NULL;
    RAISE NOTICE 'FK créée : users.tenant_id → tenants.id';
  ELSE
    RAISE NOTICE 'FK existante (OK) : users.tenant_id → tenants.id';
  END IF;
END $$;

-- =============================================================================
-- ÉTAPE 3 — Nettoyage préalable (idempotent)
-- =============================================================================
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
      DELETE FROM auth.identities WHERE user_id = v_uid;
      DELETE FROM auth.sessions   WHERE user_id = v_uid;
      DELETE FROM public.users    WHERE id = v_uid;
      DELETE FROM auth.users      WHERE id = v_uid;
      RAISE NOTICE 'Compte existant supprimé : %', v_email;
    END IF;
  END LOOP;

  -- Supprimer les tenants de démo
  DELETE FROM public.tenants WHERE slug IN (
    'ingi-synertran-internal',
    'total-energies-dz',
    'aramco-dz',
    'startup-dz',
    'ministere-industrie-dz'
  );

  RAISE NOTICE 'Nettoyage terminé.';
END $$;

-- =============================================================================
-- ÉTAPE 4 — Création des Tenants
-- Note : NE PAS insérer created_at/updated_at manuellement —
-- les triggers les gèrent automatiquement
-- =============================================================================
DO $$
DECLARE
  v_tenant_ingi    UUID := '11111111-0000-0000-0000-000000000001';
  v_tenant_total   UUID := '11111111-0000-0000-0000-000000000002';
  v_tenant_aramco  UUID := '11111111-0000-0000-0000-000000000003';
  v_tenant_startup UUID := '11111111-0000-0000-0000-000000000004';
  v_tenant_gov     UUID := '11111111-0000-0000-0000-000000000005';
BEGIN

  INSERT INTO public.tenants (id, name, slug, subscription_plan, subscription_status, billing_cycle)
  VALUES
    (v_tenant_ingi,    'INGI Synertran',           'ingi-synertran-internal',  'government', 'active', 'annual'),
    (v_tenant_total,   'Total Energies DZ',         'total-energies-dz',        'enterprise', 'active', 'annual'),
    (v_tenant_aramco,  'Aramco DZ',                 'aramco-dz',                'pro',        'active', 'annual'),
    (v_tenant_startup, 'StartupDZ',                 'startup-dz',               'starter',    'active', 'monthly'),
    (v_tenant_gov,     'Ministère de l''Industrie', 'ministere-industrie-dz',   'government', 'active', 'annual');

  RAISE NOTICE 'Tenants créés avec succès.';
END $$;

-- =============================================================================
-- ÉTAPE 5 — Création des utilisateurs Supabase Auth (auth.users)
-- =============================================================================
DO $$
DECLARE
  v_uid_admin  UUID := '22222222-0000-0000-0000-000000000001';
  v_uid_ahmed  UUID := '22222222-0000-0000-0000-000000000002';
  v_uid_pm     UUID := '22222222-0000-0000-0000-000000000003';
  v_uid_viewer UUID := '22222222-0000-0000-0000-000000000004';
  v_uid_gov    UUID := '22222222-0000-0000-0000-000000000005';

  -- Hachage bcrypt du mot de passe Demo2025!
  v_hash TEXT := crypt('Demo2025!', gen_salt('bf'));
  v_now  TIMESTAMPTZ := NOW();
BEGIN

  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', v_uid_admin,
     'authenticated', 'authenticated',
     'admin@ingi-synertran.com', v_hash, v_now,
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Super","last_name":"Admin"}',
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000', v_uid_ahmed,
     'authenticated', 'authenticated',
     'ahmed.benali@total.dz', v_hash, v_now,
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Ahmed","last_name":"Benali"}',
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000', v_uid_pm,
     'authenticated', 'authenticated',
     'pm@aramco-dz.com', v_hash, v_now,
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Khalid","last_name":"Al-Rashid"}',
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000', v_uid_viewer,
     'authenticated', 'authenticated',
     'viewer@startup.dz', v_hash, v_now,
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Lydia","last_name":"Meziane"}',
     FALSE, v_now, v_now, '', '', '', ''),

    ('00000000-0000-0000-0000-000000000000', v_uid_gov,
     'authenticated', 'authenticated',
     'gov@ministere-industrie.dz', v_hash, v_now,
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Rachid","last_name":"Boukhezzar"}',
     FALSE, v_now, v_now, '', '', '', '');

  RAISE NOTICE 'auth.users créés (5 comptes).';
END $$;

-- =============================================================================
-- ÉTAPE 6 — Création des identités (provider email)
-- Détection automatique de la version du schéma auth.identities
-- =============================================================================
DO $$
DECLARE
  v_uid_admin  UUID := '22222222-0000-0000-0000-000000000001';
  v_uid_ahmed  UUID := '22222222-0000-0000-0000-000000000002';
  v_uid_pm     UUID := '22222222-0000-0000-0000-000000000003';
  v_uid_viewer UUID := '22222222-0000-0000-0000-000000000004';
  v_uid_gov    UUID := '22222222-0000-0000-0000-000000000005';
  v_now        TIMESTAMPTZ := NOW();
  has_provider_id BOOLEAN;
BEGIN

  -- Détecter si la colonne provider_id existe (GoTrue ≥ v2.68)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name   = 'identities'
      AND column_name  = 'provider_id'
  ) INTO has_provider_id;

  RAISE NOTICE 'Schéma auth.identities : provider_id présent = %', has_provider_id;

  IF has_provider_id THEN
    -- ── Nouveau schéma Supabase (GoTrue ≥ v2.68) ────────────────────────────
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES
      (v_uid_admin::TEXT,  v_uid_admin,  v_uid_admin::TEXT,
       jsonb_build_object('sub', v_uid_admin::TEXT,  'email', 'admin@ingi-synertran.com',   'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_ahmed::TEXT,  v_uid_ahmed,  v_uid_ahmed::TEXT,
       jsonb_build_object('sub', v_uid_ahmed::TEXT,  'email', 'ahmed.benali@total.dz',       'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_pm::TEXT,     v_uid_pm,     v_uid_pm::TEXT,
       jsonb_build_object('sub', v_uid_pm::TEXT,     'email', 'pm@aramco-dz.com',             'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_viewer::TEXT, v_uid_viewer, v_uid_viewer::TEXT,
       jsonb_build_object('sub', v_uid_viewer::TEXT, 'email', 'viewer@startup.dz',            'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_gov::TEXT,    v_uid_gov,    v_uid_gov::TEXT,
       jsonb_build_object('sub', v_uid_gov::TEXT,    'email', 'gov@ministere-industrie.dz',   'email_verified', true),
       'email', v_now, v_now, v_now);

    RAISE NOTICE 'auth.identities insérés (nouveau schéma avec provider_id).';

  ELSE
    -- ── Ancien schéma Supabase (GoTrue < v2.68) ──────────────────────────────
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES
      (v_uid_admin::TEXT,  v_uid_admin,
       jsonb_build_object('sub', v_uid_admin::TEXT,  'email', 'admin@ingi-synertran.com',   'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_ahmed::TEXT,  v_uid_ahmed,
       jsonb_build_object('sub', v_uid_ahmed::TEXT,  'email', 'ahmed.benali@total.dz',       'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_pm::TEXT,     v_uid_pm,
       jsonb_build_object('sub', v_uid_pm::TEXT,     'email', 'pm@aramco-dz.com',             'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_viewer::TEXT, v_uid_viewer,
       jsonb_build_object('sub', v_uid_viewer::TEXT, 'email', 'viewer@startup.dz',            'email_verified', true),
       'email', v_now, v_now, v_now),

      (v_uid_gov::TEXT,    v_uid_gov,
       jsonb_build_object('sub', v_uid_gov::TEXT,    'email', 'gov@ministere-industrie.dz',   'email_verified', true),
       'email', v_now, v_now, v_now);

    RAISE NOTICE 'auth.identities insérés (ancien schéma sans provider_id).';
  END IF;
END $$;

-- =============================================================================
-- ÉTAPE 7 — Création des profils dans public.users
-- Note : Le super_admin (admin) a tenant_id NULL = accès global
-- =============================================================================
DO $$
DECLARE
  v_uid_admin  UUID := '22222222-0000-0000-0000-000000000001';
  v_uid_ahmed  UUID := '22222222-0000-0000-0000-000000000002';
  v_uid_pm     UUID := '22222222-0000-0000-0000-000000000003';
  v_uid_viewer UUID := '22222222-0000-0000-0000-000000000004';
  v_uid_gov    UUID := '22222222-0000-0000-0000-000000000005';

  v_tenant_ingi    UUID := '11111111-0000-0000-0000-000000000001';
  v_tenant_total   UUID := '11111111-0000-0000-0000-000000000002';
  v_tenant_aramco  UUID := '11111111-0000-0000-0000-000000000003';
  v_tenant_startup UUID := '11111111-0000-0000-0000-000000000004';
  v_tenant_gov     UUID := '11111111-0000-0000-0000-000000000005';
BEGIN

  INSERT INTO public.users (
    id, tenant_id, email,
    first_name, last_name,
    role, mfa_enabled, status
  ) VALUES
    -- Super Admin : tenant_id = NULL (accès global, bypass toutes les vérifications)
    (v_uid_admin,  v_tenant_ingi,    'admin@ingi-synertran.com',   'Super',  'Admin',       'super_admin',     FALSE, 'active'),
    (v_uid_ahmed,  v_tenant_total,   'ahmed.benali@total.dz',       'Ahmed',  'Benali',      'tenant_admin',    FALSE, 'active'),
    (v_uid_pm,     v_tenant_aramco,  'pm@aramco-dz.com',            'Khalid', 'Al-Rashid',   'project_manager', FALSE, 'active'),
    (v_uid_viewer, v_tenant_startup, 'viewer@startup.dz',           'Lydia',  'Meziane',     'viewer',          FALSE, 'active'),
    (v_uid_gov,    v_tenant_gov,     'gov@ministere-industrie.dz',  'Rachid', 'Boukhezzar',  'tenant_admin',    FALSE, 'active');

  RAISE NOTICE 'public.users créés (5 profils).';
END $$;

-- =============================================================================
-- ÉTAPE 8 — VÉRIFICATION FINALE
-- Ce SELECT doit retourner exactement 5 lignes avec email_confirme = true
-- =============================================================================
SELECT
  au.email,
  pu.first_name || ' ' || pu.last_name   AS nom,
  pu.role,
  t.name                                  AS tenant,
  t.subscription_plan                     AS plan,
  au.email_confirmed_at IS NOT NULL       AS email_confirme,
  pu.status
FROM auth.users au
JOIN public.users pu  ON pu.id = au.id
LEFT JOIN public.tenants t ON t.id = pu.tenant_id
WHERE au.email IN (
  'admin@ingi-synertran.com',
  'ahmed.benali@total.dz',
  'pm@aramco-dz.com',
  'viewer@startup.dz',
  'gov@ministere-industrie.dz'
)
ORDER BY au.created_at;

-- =============================================================================
-- RÉSULTAT ATTENDU (5 lignes) :
--
--  email                              | nom               | role             | tenant                   | plan       | email_confirme | status
-- ------------------------------------+-------------------+------------------+--------------------------+------------+----------------+--------
--  admin@ingi-synertran.com           | Super Admin       | super_admin      | INGI Synertran           | government | true           | active
--  ahmed.benali@total.dz              | Ahmed Benali      | tenant_admin     | Total Energies DZ        | enterprise | true           | active
--  pm@aramco-dz.com                   | Khalid Al-Rashid  | project_manager  | Aramco DZ                | pro        | true           | active
--  viewer@startup.dz                  | Lydia Meziane     | viewer           | StartupDZ                | starter    | true           | active
--  gov@ministere-industrie.dz         | Rachid Boukhezzar | tenant_admin     | Ministère de l'Industrie | government | true           | active
-- =============================================================================


-- =============================================================================
-- ÉTAPE 9 — VÉRIFICATION DES POLITIQUES RLS
-- Doit retourner au moins 5 politiques créées
-- =============================================================================
SELECT
  tablename,
  policyname,
  cmd     AS operation,
  qual    AS condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'tenants')
ORDER BY tablename, policyname;

-- =============================================================================
-- GUIDE DE DÉPANNAGE
-- =============================================================================
-- ❌ "relation auth.users does not exist"
--    → Vous n'avez pas les droits postgres. Exécuter depuis le SQL Editor
--      du dashboard Supabase (onglet SQL Editor), PAS depuis un client externe.
--
-- ❌ "column billing_cycle does not exist" à l'ÉTAPE 4
--    → L'ALTER TABLE de l'ÉTAPE 0 n'a pas été exécuté.
--      Exécuter l'ÉTAPE 0 séparément d'abord.
--
-- ❌ "duplicate key value violates unique constraint users_pkey"
--    → Un compte avec le même UUID existe déjà.
--      Relancer depuis le début (l'ÉTAPE 3 nettoie les anciens comptes).
--
-- ❌ "violates foreign key constraint users_tenant_id_fkey"
--    → Les tenants n'ont pas été créés avant les users.
--      Vérifier que l'ÉTAPE 4 s'est exécutée sans erreur.
--
-- ⚠️  La vérification retourne 5 lignes mais la connexion échoue quand même
--    → Vérifier dans Supabase Dashboard → Authentication → Users que les 5
--      comptes sont bien listés avec email confirmé (pas de pending email).
--    → Vérifier que la connexion email est activée :
--      Authentication → Providers → Email → doit être ON
--
-- ⚠️  Connexion OK mais dashboard affiche page blanche / redirection infinie
--    → Les politiques RLS n'ont pas été créées correctement.
--      Exécuter séparément la section ÉTAPE 1 et vérifier les NOTICE.
-- =============================================================================
