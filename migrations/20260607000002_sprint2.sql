-- Consultants table
CREATE TABLE IF NOT EXISTS public.consultants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  expertise TEXT NOT NULL,
  specializations TEXT[],
  daily_rate TEXT,
  availability TEXT DEFAULT 'available',
  years_experience INTEGER DEFAULT 0,
  certifications TEXT[],
  languages TEXT[],
  bio TEXT,
  portfolio_url TEXT,
  trust_score INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Experts table
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  domain TEXT NOT NULL,
  specialization TEXT NOT NULL,
  institution TEXT,
  publications_count INTEGER DEFAULT 0,
  daily_rate TEXT,
  availability TEXT DEFAULT 'available',
  certifications TEXT[],
  languages TEXT[],
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User favorites
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for consultants
CREATE POLICY "consultants_select_all" ON public.consultants FOR SELECT USING (true);
CREATE POLICY "consultants_insert" ON public.consultants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "consultants_update" ON public.consultants FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "consultants_delete" ON public.consultants FOR DELETE USING (created_by = auth.uid());

-- RLS policies for experts
CREATE POLICY "experts_select_all" ON public.experts FOR SELECT USING (true);
CREATE POLICY "experts_insert" ON public.experts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "experts_update" ON public.experts FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "experts_delete" ON public.experts FOR DELETE USING (created_by = auth.uid());

-- RLS policies for user_favorites
CREATE POLICY "favorites_select_own" ON public.user_favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "favorites_insert_own" ON public.user_favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "favorites_delete_own" ON public.user_favorites FOR DELETE USING (user_id = auth.uid());
