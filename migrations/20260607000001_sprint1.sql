-- Sprint 1 Migration: Create missing tables and enable RLS

-- talent_applications
CREATE TABLE IF NOT EXISTS public.talent_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.subcontracting_projects(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT,
  proposal TEXT NOT NULL,
  estimated_cost TEXT,
  timeline TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- procurement_rfqs
CREATE TABLE IF NOT EXISTS public.procurement_rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_min TEXT,
  budget_max TEXT,
  deadline DATE NOT NULL,
  required_certifications TEXT[],
  local_content_target INTEGER,
  status TEXT DEFAULT 'draft',
  submissions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- procurement_submissions
CREATE TABLE IF NOT EXISTS public.procurement_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  rfq_id UUID REFERENCES public.procurement_rfqs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_passports(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  technical_proposal TEXT NOT NULL,
  commercial_offer TEXT NOT NULL,
  delivery_timeline TEXT NOT NULL,
  local_content_rate INTEGER,
  score INTEGER,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- contact_requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.talent_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: talent_applications
CREATE POLICY "talent_applications_select" ON public.talent_applications
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "talent_applications_insert" ON public.talent_applications
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "talent_applications_update" ON public.talent_applications
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "talent_applications_delete" ON public.talent_applications
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies: procurement_rfqs
CREATE POLICY "procurement_rfqs_select" ON public.procurement_rfqs
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "procurement_rfqs_insert" ON public.procurement_rfqs
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "procurement_rfqs_update" ON public.procurement_rfqs
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "procurement_rfqs_delete" ON public.procurement_rfqs
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies: procurement_submissions
CREATE POLICY "procurement_submissions_select" ON public.procurement_submissions
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "procurement_submissions_insert" ON public.procurement_submissions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "procurement_submissions_update" ON public.procurement_submissions
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "procurement_submissions_delete" ON public.procurement_submissions
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies: notifications (user-scoped)
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies: contact_requests (public insert, admin select)
CREATE POLICY "contact_requests_insert" ON public.contact_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_requests_select" ON public.contact_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('super_admin', 'tenant_admin'))
  );

-- RLS Policies: audit_logs
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
