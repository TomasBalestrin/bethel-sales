-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'closer');

-- Create participant_color enum
CREATE TYPE public.participant_color AS ENUM ('rosa', 'preto', 'azul_claro', 'dourado', 'laranja');

-- Create opportunity_qualification enum
CREATE TYPE public.opportunity_qualification AS ENUM ('super', 'medio', 'baixo');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USER ROLES TABLE (separate from profiles for security)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Webhook imported data
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  faturamento DECIMAL(12,2),
  nicho TEXT,
  instagram TEXT,
  -- Credenciamento por dia
  credenciou_dia1 BOOLEAN DEFAULT false,
  credenciou_dia2 BOOLEAN DEFAULT false,
  credenciou_dia3 BOOLEAN DEFAULT false,
  -- Manual data
  funil_origem TEXT,
  closer_vendeu_id UUID REFERENCES public.profiles(id),
  mentorado_convidou TEXT,
  acompanhante TEXT,
  is_oportunidade BOOLEAN DEFAULT false,
  vezes_chamado INTEGER DEFAULT 0 CHECK (vezes_chamado >= 0 AND vezes_chamado <= 4),
  cor participant_color,
  qualificacao opportunity_qualification,
  -- Metadata
  webhook_data JSONB,
  imported_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CLOSER ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE public.closer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  closer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(participant_id, closer_id)
);

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  closer_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT,
  valor_total DECIMAL(12,2) NOT NULL,
  valor_entrada DECIMAL(12,2),
  forma_negociacao TEXT,
  sale_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DISC FORMS TABLE
-- ============================================
CREATE TABLE public.disc_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  form_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- ============================================
-- DISC RESPONSES TABLE
-- ============================================
CREATE TABLE public.disc_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.disc_forms(id) ON DELETE CASCADE NOT NULL,
  responses JSONB NOT NULL,
  -- IA Analysis
  disc_profile TEXT,
  disc_description TEXT,
  sales_insights TEXT,
  objecoes TEXT,
  contorno_objecoes TEXT,
  exemplos_fechamento TEXT,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Check if current user is closer
CREATE OR REPLACE FUNCTION public.is_closer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'closer')
$$;

-- Get current user's profile id
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Check if closer is assigned to participant
CREATE OR REPLACE FUNCTION public.is_assigned_to_participant(_participant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.closer_assignments ca
    JOIN public.profiles p ON p.id = ca.closer_id
    WHERE ca.participant_id = _participant_id
      AND p.user_id = auth.uid()
  )
$$;

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disc_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disc_responses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================
-- RLS POLICIES - USER ROLES
-- ============================================
CREATE POLICY "Users can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin());

-- ============================================
-- RLS POLICIES - PRODUCTS
-- ============================================
CREATE POLICY "Everyone can view products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin());

-- ============================================
-- RLS POLICIES - PARTICIPANTS
-- ============================================
CREATE POLICY "Admins can do anything with participants" ON public.participants
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Closers can view assigned participants" ON public.participants
  FOR SELECT TO authenticated USING (public.is_assigned_to_participant(id));

CREATE POLICY "Closers can update assigned participants" ON public.participants
  FOR UPDATE TO authenticated USING (public.is_assigned_to_participant(id));

-- ============================================
-- RLS POLICIES - CLOSER ASSIGNMENTS
-- ============================================
CREATE POLICY "Admins can manage assignments" ON public.closer_assignments
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Closers can view their assignments" ON public.closer_assignments
  FOR SELECT TO authenticated 
  USING (closer_id = public.get_current_profile_id());

-- ============================================
-- RLS POLICIES - SALES
-- ============================================
CREATE POLICY "Admins can manage all sales" ON public.sales
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Closers can view own sales" ON public.sales
  FOR SELECT TO authenticated 
  USING (closer_id = public.get_current_profile_id());

CREATE POLICY "Closers can create sales for assigned participants" ON public.sales
  FOR INSERT TO authenticated 
  WITH CHECK (
    closer_id = public.get_current_profile_id() 
    AND public.is_assigned_to_participant(participant_id)
  );

-- ============================================
-- RLS POLICIES - DISC FORMS
-- ============================================
CREATE POLICY "Admins can manage forms" ON public.disc_forms
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Closers can view forms for assigned participants" ON public.disc_forms
  FOR SELECT TO authenticated 
  USING (public.is_assigned_to_participant(participant_id));

CREATE POLICY "Closers can create forms for assigned participants" ON public.disc_forms
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_assigned_to_participant(participant_id));

-- Allow anonymous access to forms via token (for form submission)
CREATE POLICY "Anyone can view form by token" ON public.disc_forms
  FOR SELECT TO anon USING (true);

-- ============================================
-- RLS POLICIES - DISC RESPONSES
-- ============================================
CREATE POLICY "Admins can manage responses" ON public.disc_responses
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Closers can view responses for assigned participants" ON public.disc_responses
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.disc_forms df
      WHERE df.id = form_id
      AND public.is_assigned_to_participant(df.participant_id)
    )
  );

-- Allow anonymous to submit responses
CREATE POLICY "Anyone can submit responses" ON public.disc_responses
  FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();