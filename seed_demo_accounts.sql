-- =============================================================================
-- INGI SYNERTRAN — Script d'insertion des comptes démo
-- Version : 1.0 | Date : 09 Juin 2026
--
-- INSTRUCTIONS D'EXÉCUTION :
-- 1. Ouvrir le SQL Editor dans le dashboard Supabase
--    https://supabase.com/dashboard/project/tmetsumieelatardviin/sql/new
-- 2. Coller l'intégralité de ce script
-- 3. Cliquer sur "Run" (ou Ctrl+Enter)
-- 4. Vérifier le message "Success. No rows returned" sur chaque section
--
-- COMPTES CRÉÉS :
--   admin@ingi-synertran.com   / Demo2025!  → super_admin    / Government
--   ahmed.benali@total.dz      / Demo2025!  → tenant_admin   / Enterprise
--   pm@aramco-dz.com           / Demo2025!  → project_manager/ Pro
--   viewer@startup.dz          / Demo2025!  → viewer         / Starter
--   gov@ministere-industrie.dz / Demo2025!  → tenant_admin   / Government
-- =============================================================================

-- Activer pgcrypto pour le hachage bcrypt (déjà activé par défaut sur Supabase)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- ÉTAPE 0 — Nettoyage préalable (idempotent — safe à relancer)
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
  v_uid UUID;
BEGIN
  FOREACH v_email IN ARRAY v_emails LOOP
    SELECT id INTO v_uid FROM auth.users WHERE email = v_email;
    IF v_uid IS NOT NULL THEN
      DELETE FROM auth.identities WHERE user_id = v_uid;
      DELETE FROM auth.sessions WHERE user_id = v_uid;
      DELETE FROM public.users WHERE id = v_uid;
      DELETE FROM auth.users WHERE id = v_uid;
      RAISE NOTICE 'Compte existant supprimé : %', v_email;
    END IF;
  END LOOP;

  -- Supprimer les tenants de démo s'ils existent déjà
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
-- ÉTAPE 1 — Création des Tenants
-- =============================================================================
DO $$
DECLARE
  v_tenant_ingi    UUID := '11111111-0000-0000-0000-000000000001';
  v_tenant_total   UUID := '11111111-0000-0000-0000-000000000002';
  v_tenant_aramco  UUID := '11111111-0000-0000-0000-000000000003';
  v_tenant_startup UUID := '11111111-0000-0000-0000-000000000004';
  v_tenant_gov     UUID := '11111111-0000-0000-0000-000000000005';
BEGIN

  INSERT INTO public.tenants (id, name, slug, subscription_plan, subscription_status, created_at, updated_at)
  VALUES
    (v_tenant_ingi,    'INGI Synertran',          'ingi-synertran-internal',  'government', 'active', NOW(), NOW()),
    (v_tenant_total,   'Total Energies DZ',        'total-energies-dz',        'enterprise', 'active', NOW(), NOW()),
    (v_tenant_aramco,  'Aramco DZ',                'aramco-dz',                'pro',        'active', NOW(), NOW()),
    (v_tenant_startup, 'StartupDZ',                'startup-dz',               'starter',    'active', NOW(), NOW()),
    (v_tenant_gov,     'Ministère de l''Industrie','ministere-industrie-dz',   'government', 'active', NOW(), NOW());

  RAISE NOTICE 'Tenants créés avec succès.';
END $$;

-- =============================================================================
-- ÉTAPE 2 — Création des utilisateurs Supabase Auth
-- =============================================================================
DO $$
DECLARE
  -- UUIDs fixes pour reproductibilité
  v_uid_admin  UUID := '22222222-0000-0000-0000-000000000001';
  v_uid_ahmed  UUID := '22222222-0000-0000-0000-000000000002';
  v_uid_pm     UUID := '22222222-0000-0000-0000-000000000003';
  v_uid_viewer UUID := '22222222-0000-0000-0000-000000000004';
  v_uid_gov    UUID := '22222222-0000-0000-0000-000000000005';

  v_password_hash TEXT := crypt('Demo2025!', gen_salt('bf'));
  v_now TIMESTAMPTZ := NOW();
BEGIN

  -- Insérer dans auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) VALUES
    -- 1. Super Admin
    (
      '00000000-0000-0000-0000-000000000000',
      v_uid_admin, 'authenticated', 'authenticated',
      'admin@ingi-synertran.com', v_password_hash,
      v_now, v_now,
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Super","last_name":"Admin"}',
      FALSE,
      v_now, v_now, '', '', '', ''
    ),
    -- 2. Tenant Admin Total DZ
    (
      '00000000-0000-0000-0000-000000000000',
      v_uid_ahmed, 'authenticated', 'authenticated',
      'ahmed.benali@total.dz', v_password_hash,
      v_now, v_now,
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Ahmed","last_name":"Benali"}',
      FALSE,
      v_now, v_now, '', '', '', ''
    ),
    -- 3. Chef de Projet Aramco
    (
      '00000000-0000-0000-0000-000000000000',
      v_uid_pm, 'authenticated', 'authenticated',
      'pm@aramco-dz.com', v_password_hash,
      v_now, v_now,
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Khalid","last_name":"Al-Rashid"}',
      FALSE,
      v_now, v_now, '', '', '', ''
    ),
    -- 4. Viewer Starter
    (
      '00000000-0000-0000-0000-000000000000',
      v_uid_viewer, 'authenticated', 'authenticated',
      'viewer@startup.dz', v_password_hash,
      v_now, v_now,
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Lydia","last_name":"Meziane"}',
      FALSE,
      v_now, v_now, '', '', '', ''
    ),
    -- 5. Admin Gouvernement
    (
      '00000000-0000-0000-0000-000000000000',
      v_uid_gov, 'authenticated', 'authenticated',
      'gov@ministere-industrie.dz', v_password_hash,
      v_now, v_now,
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Rachid","last_name":"Boukhezzar"}',
      FALSE,
      v_now, v_now, '', '', '', ''
    );

  RAISE NOTICE 'Utilisateurs auth.users créés.';
END $$;

-- =============================================================================
-- ÉTAPE 3 — Création des identités (provider email)
-- Nécessaire pour que Supabase Auth reconnaisse le mode de connexion
-- =============================================================================
DO $$
DECLARE
  v_uid_admin  UUID := '22222222-0000-0000-0000-000000000001';
  v_uid_ahmed  UUID := '22222222-0000-0000-0000-000000000002';
  v_uid_pm     UUID := '22222222-0000-0000-0000-000000000003';
  v_uid_viewer UUID := '22222222-0000-0000-0000-000000000004';
  v_uid_gov    UUID := '22222222-0000-0000-0000-000000000005';
  v_now TIMESTAMPTZ := NOW();
BEGIN

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES
    (
      v_uid_admin::TEXT, v_uid_admin, v_uid_admin::TEXT,
      jsonb_build_object('sub', v_uid_admin::TEXT, 'email', 'admin@ingi-synertran.com', 'email_verified', TRUE),
      'email', v_now, v_now, v_now
    ),
    (
      v_uid_ahmed::TEXT, v_uid_ahmed, v_uid_ahmed::TEXT,
      jsonb_build_object('sub', v_uid_ahmed::TEXT, 'email', 'ahmed.benali@total.dz', 'email_verified', TRUE),
      'email', v_now, v_now, v_now
    ),
    (
      v_uid_pm::TEXT, v_uid_pm, v_uid_pm::TEXT,
      jsonb_build_object('sub', v_uid_pm::TEXT, 'email', 'pm@aramco-dz.com', 'email_verified', TRUE),
      'email', v_now, v_now, v_now
    ),
    (
      v_uid_viewer::TEXT, v_uid_viewer, v_uid_viewer::TEXT,
      jsonb_build_object('sub', v_uid_viewer::TEXT, 'email', 'viewer@startup.dz', 'email_verified', TRUE),
      'email', v_now, v_now, v_now
    ),
    (
      v_uid_gov::TEXT, v_uid_gov, v_uid_gov::TEXT,
      jsonb_build_object('sub', v_uid_gov::TEXT, 'email', 'gov@ministere-industrie.dz', 'email_verified', TRUE),
      'email', v_now, v_now, v_now
    );

  RAISE NOTICE 'Identités auth créées.';
END $$;

-- =============================================================================
-- ÉTAPE 4 — Création des profils dans public.users
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
  v_now TIMESTAMPTZ := NOW();
BEGIN

  INSERT INTO public.users (
    id, tenant_id, email,
    first_name, last_name, role,
    mfa_enabled, created_at, updated_at
  ) VALUES
    (v_uid_admin,  v_tenant_ingi,    'admin@ingi-synertran.com',   'Super',  'Admin',       'super_admin',      FALSE, v_now, v_now),
    (v_uid_ahmed,  v_tenant_total,   'ahmed.benali@total.dz',       'Ahmed',  'Benali',      'tenant_admin',     FALSE, v_now, v_now),
    (v_uid_pm,     v_tenant_aramco,  'pm@aramco-dz.com',            'Khalid', 'Al-Rashid',   'project_manager',  FALSE, v_now, v_now),
    (v_uid_viewer, v_tenant_startup, 'viewer@startup.dz',           'Lydia',  'Meziane',     'viewer',           FALSE, v_now, v_now),
    (v_uid_gov,    v_tenant_gov,     'gov@ministere-industrie.dz',  'Rachid', 'Boukhezzar',  'tenant_admin',     FALSE, v_now, v_now);

  RAISE NOTICE 'Profils public.users créés.';
END $$;

-- =============================================================================
-- ÉTAPE 5 — Vérification finale
-- =============================================================================
SELECT
  u.email,
  p.first_name || ' ' || p.last_name AS nom,
  p.role,
  t.name AS tenant,
  t.subscription_plan AS plan,
  u.email_confirmed_at IS NOT NULL AS email_confirme,
  u.created_at
FROM auth.users u
JOIN public.users p ON p.id = u.id
JOIN public.tenants t ON t.id = p.tenant_id
WHERE u.email IN (
  'admin@ingi-synertran.com',
  'ahmed.benali@total.dz',
  'pm@aramco-dz.com',
  'viewer@startup.dz',
  'gov@ministere-industrie.dz'
)
ORDER BY u.created_at;

-- =============================================================================
-- RÉSULTAT ATTENDU :
-- ┌─────────────────────────────────────┬───────────────────┬──────────────────┬────────────────────────────┬────────────┬────────────────┐
-- │ email                               │ nom               │ role             │ tenant                     │ plan       │ email_confirme │
-- ├─────────────────────────────────────┼───────────────────┼──────────────────┼────────────────────────────┼────────────┼────────────────┤
-- │ admin@ingi-synertran.com            │ Super Admin       │ super_admin      │ INGI Synertran             │ government │ true           │
-- │ ahmed.benali@total.dz               │ Ahmed Benali      │ tenant_admin     │ Total Energies DZ          │ enterprise │ true           │
-- │ pm@aramco-dz.com                    │ Khalid Al-Rashid  │ project_manager  │ Aramco DZ                  │ pro        │ true           │
-- │ viewer@startup.dz                   │ Lydia Meziane     │ viewer           │ StartupDZ                  │ starter    │ true           │
-- │ gov@ministere-industrie.dz          │ Rachid Boukhezzar │ tenant_admin     │ Ministère de l'Industrie   │ government │ true           │
-- └─────────────────────────────────────┴───────────────────┴──────────────────┴────────────────────────────┴────────────┴────────────────┘
-- =============================================================================

-- =============================================================================
-- EN CAS D'ERREUR :
--
-- ❌ "column provider_id does not exist" dans auth.identities
--    → Votre version de Supabase n'a pas provider_id, remplacer par :
--      id (text), user_id, identity_data, provider (sans provider_id)
--
-- ❌ "permission denied for table users" sur auth.users
--    → Vous n'êtes pas en mode service_role. Exécuter depuis l'onglet
--      SQL Editor du dashboard Supabase (pas via un client JS).
--
-- ❌ "duplicate key value" sur tenants ou users
--    → Le script a déjà été exécuté. L'ÉTAPE 0 (nettoyage) n'a pas
--      supprimé toutes les entrées. Nettoyer manuellement :
--      DELETE FROM public.tenants WHERE slug LIKE '%-dz' OR slug LIKE 'ingi-%';
--
-- ❌ Le login fonctionne mais user.tenant est null dans l'application
--    → Vérifier que la colonne tenant_id dans public.users n'a pas de
--      contrainte NOT NULL manquante, et que le profil est bien inséré.
-- =============================================================================
