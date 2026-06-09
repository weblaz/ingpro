-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  country TEXT,
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'trial',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'viewer',
  permissions JSONB,
  mfa_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company_passports table
CREATE TABLE IF NOT EXISTS public.company_passports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  legal_name TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  country TEXT NOT NULL,
  industry TEXT NOT NULL,
  employee_count TEXT,
  year_established INTEGER,
  technical_capabilities TEXT,
  certifications TEXT[],
  local_content_rate INTEGER,
  trust_score INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create digital_identities table
CREATE TABLE IF NOT EXISTS public.digital_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  identity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  industry TEXT,
  job_title TEXT,
  experience TEXT,
  skills TEXT[],
  certifications TEXT[],
  projects_count INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  qr_code TEXT,
  blockchain_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subcontracting_projects table
CREATE TABLE IF NOT EXISTS public.subcontracting_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  project_title TEXT NOT NULL,
  project_type TEXT NOT NULL,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  budget TEXT NOT NULL,
  deadline TEXT NOT NULL,
  description TEXT NOT NULL,
  required_certifications TEXT[],
  local_content_required INTEGER,
  status TEXT DEFAULT 'open',
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_applications table
CREATE TABLE IF NOT EXISTS public.project_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.subcontracting_projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_passports(id) ON DELETE CASCADE,
  proposal TEXT,
  estimated_cost TEXT,
  timeline TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create talents table
CREATE TABLE IF NOT EXISTS public.talents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  job_title TEXT NOT NULL,
  experience TEXT NOT NULL,
  industry TEXT NOT NULL,
  skills TEXT NOT NULL,
  certifications TEXT,
  availability TEXT NOT NULL,
  projects_count INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trainings table
CREATE TABLE IF NOT EXISTS public.trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  training_title TEXT NOT NULL,
  training_type TEXT NOT NULL,
  industry TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  language TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled INTEGER DEFAULT 0,
  price TEXT NOT NULL,
  start_date TEXT NOT NULL,
  description TEXT NOT NULL,
  prerequisites TEXT,
  certification TEXT,
  instructor TEXT,
  rating NUMERIC(3,2),
  reviews_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create training_enrollments table
CREATE TABLE IF NOT EXISTS public.training_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled',
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create local_content_projects table
CREATE TABLE IF NOT EXISTS public.local_content_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  company TEXT NOT NULL,
  country TEXT NOT NULL,
  industry TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  budget TEXT NOT NULL,
  local_content_rate INTEGER NOT NULL,
  target_rate INTEGER NOT NULL,
  local_spending TEXT,
  local_jobs INTEGER,
  local_suppliers INTEGER,
  status TEXT DEFAULT 'compliant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create esg_indicators table
CREATE TABLE IF NOT EXISTS public.esg_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.local_content_projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  metric TEXT NOT NULL,
  value TEXT NOT NULL,
  trend TEXT,
  target TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create supplier_scores table
CREATE TABLE IF NOT EXISTS public.supplier_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_passports(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  quality_score INTEGER,
  delivery_score INTEGER,
  compliance_score INTEGER,
  financial_score INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create talent_scores table
CREATE TABLE IF NOT EXISTS public.talent_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  talent_id UUID REFERENCES public.talents(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  skills_score INTEGER,
  experience_score INTEGER,
  certifications_score INTEGER,
  performance_score INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create demo_requests table
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  sector TEXT NOT NULL,
  country TEXT NOT NULL,
  company_size TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create translations table
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

-- Create tenant_language_settings table
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

-- Create user_language_preferences table
CREATE TABLE IF NOT EXISTS public.user_language_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_company_passports_tenant_id ON public.company_passports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_digital_identities_tenant_id ON public.digital_identities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subcontracting_projects_tenant_id ON public.subcontracting_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_tenant_id ON public.project_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_project_id ON public.project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_talents_tenant_id ON public.talents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trainings_tenant_id ON public.trainings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_tenant_id ON public.training_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_local_content_projects_tenant_id ON public.local_content_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_esg_indicators_tenant_id ON public.esg_indicators(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_scores_tenant_id ON public.supplier_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_talent_scores_tenant_id ON public.talent_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_translations_tenant_id ON public.translations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_translations_language_code ON public.translations(language_code);

-- Enable Row Level Security on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcontracting_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_content_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_language_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for users
CREATE POLICY "Users can view users in their tenant" ON public.users
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can insert users in their tenant" ON public.users
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users 
      WHERE id = auth.uid() AND role IN ('super_admin', 'tenant_admin')
    )
  );

-- RLS Policies for company_passports
CREATE POLICY "Users can view company passports in their tenant" ON public.company_passports
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert company passports in their tenant" ON public.company_passports
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update company passports in their tenant" ON public.company_passports
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for digital_identities
CREATE POLICY "Users can view digital identities in their tenant" ON public.digital_identities
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert digital identities in their tenant" ON public.digital_identities
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for subcontracting_projects
CREATE POLICY "Users can view projects in their tenant" ON public.subcontracting_projects
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert projects in their tenant" ON public.subcontracting_projects
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for project_applications
CREATE POLICY "Users can view applications in their tenant" ON public.project_applications
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert applications in their tenant" ON public.project_applications
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for talents
CREATE POLICY "Users can view talents in their tenant" ON public.talents
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert talents in their tenant" ON public.talents
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for trainings
CREATE POLICY "Users can view trainings in their tenant" ON public.trainings
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert trainings in their tenant" ON public.trainings
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for training_enrollments
CREATE POLICY "Users can view enrollments in their tenant" ON public.training_enrollments
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert enrollments in their tenant" ON public.training_enrollments
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for local_content_projects
CREATE POLICY "Users can view local content projects in their tenant" ON public.local_content_projects
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert local content projects in their tenant" ON public.local_content_projects
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for esg_indicators
CREATE POLICY "Users can view ESG indicators in their tenant" ON public.esg_indicators
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert ESG indicators in their tenant" ON public.esg_indicators
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for supplier_scores
CREATE POLICY "Users can view supplier scores in their tenant" ON public.supplier_scores
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for talent_scores
CREATE POLICY "Users can view talent scores in their tenant" ON public.talent_scores
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for demo_requests (public access)
CREATE POLICY "Anyone can insert demo requests" ON public.demo_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view demo requests" ON public.demo_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for translations
CREATE POLICY "Users can view translations in their tenant" ON public.translations
  FOR SELECT USING (
    tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for tenant_language_settings
CREATE POLICY "Users can view language settings in their tenant" ON public.tenant_language_settings
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policies for user_language_preferences
CREATE POLICY "Users can view their own language preferences" ON public.user_language_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own language preferences" ON public.user_language_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own language preferences" ON public.user_language_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- Create function to calculate company trust score
CREATE OR REPLACE FUNCTION calculate_company_trust_score(company_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  cert_count INTEGER;
  project_count INTEGER;
BEGIN
  -- Base score
  score := 50;
  
  -- Add points for certifications
  SELECT array_length(certifications, 1) INTO cert_count
  FROM company_passports WHERE id = company_id;
  score := score + COALESCE(cert_count * 5, 0);
  
  -- Add points for completed projects
  SELECT COUNT(*) INTO project_count
  FROM project_applications 
  WHERE company_id = company_id AND status = 'completed';
  score := score + (project_count * 3);
  
  -- Cap at 100
  IF score > 100 THEN
    score := 100;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_passports_updated_at BEFORE UPDATE ON public.company_passports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_identities_updated_at BEFORE UPDATE ON public.digital_identities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcontracting_projects_updated_at BEFORE UPDATE ON public.subcontracting_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_content_projects_updated_at BEFORE UPDATE ON public.local_content_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;