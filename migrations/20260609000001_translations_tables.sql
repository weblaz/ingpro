-- Migration: ensure translations, tenant_language_settings, user_language_preferences exist
-- Safe to run on both old and new projects (IF NOT EXISTS)

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Translations table
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translation_key TEXT NOT NULL,
  translation_value TEXT NOT NULL,
  category TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, language_code, translation_key)
);

CREATE INDEX IF NOT EXISTS idx_translations_tenant_id ON public.translations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_translations_language_code ON public.translations(language_code);

-- Tenant language settings table
CREATE TABLE IF NOT EXISTS public.tenant_language_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  default_language TEXT DEFAULT 'fr',
  enabled_languages TEXT[] DEFAULT ARRAY['fr', 'en'],
  auto_translate BOOLEAN DEFAULT false,
  rtl_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User language preferences table
CREATE TABLE IF NOT EXISTS public.user_language_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_language_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate cleanly (idempotent)
DROP POLICY IF EXISTS "Users can view translations in their tenant" ON public.translations;
DROP POLICY IF EXISTS "Public can view global translations" ON public.translations;
DROP POLICY IF EXISTS "Users can view language settings in their tenant" ON public.tenant_language_settings;
DROP POLICY IF EXISTS "Users can view their own language preferences" ON public.user_language_preferences;
DROP POLICY IF EXISTS "Users can insert their own language preferences" ON public.user_language_preferences;
DROP POLICY IF EXISTS "Users can update their own language preferences" ON public.user_language_preferences;

-- Allow anyone (including unauthenticated) to read global translations (tenant_id IS NULL)
CREATE POLICY "Public can view global translations" ON public.translations
  FOR SELECT USING (tenant_id IS NULL);

-- Allow authenticated users to also read their tenant's translations
CREATE POLICY "Users can view translations in their tenant" ON public.translations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Tenant language settings: authenticated users only
CREATE POLICY "Users can view language settings in their tenant" ON public.tenant_language_settings
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- User language preferences
CREATE POLICY "Users can view their own language preferences" ON public.user_language_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own language preferences" ON public.user_language_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own language preferences" ON public.user_language_preferences
  FOR UPDATE USING (user_id = auth.uid());
