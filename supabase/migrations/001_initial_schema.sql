-- ============================================================================
-- RANTAU — INITIAL DATABASE SCHEMA, RLS POLICIES, RPC & SEED DATA
-- Versi: 1.0 (Full-Stack MVP)
-- Database: PostgreSQL (Supabase)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES (1:1 dengan auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- 2. BUSINESS_PROFILES (1:1 dengan profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_stage TEXT NOT NULL CHECK (business_stage IN ('not_started', 'starting', 'running')),
  industry_category TEXT NOT NULL,
  product_description TEXT NOT NULL,
  target_customer TEXT NOT NULL,
  operational_location TEXT NOT NULL,
  estimated_capital TEXT NOT NULL,
  business_goals TEXT NOT NULL,
  main_challenges TEXT NOT NULL,
  prior_experience TEXT NOT NULL DEFAULT 'Belum ada pengalaman bisnis sebelumnya',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_profiles_select_own"
  ON public.business_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "business_profiles_insert_own"
  ON public.business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "business_profiles_update_own"
  ON public.business_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "business_profiles_delete_own"
  ON public.business_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. SUBSCRIPTIONS (1:1 dengan profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL DEFAULT 'starter' CHECK (plan_tier IN ('starter', 'growth', 'max')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_delete_own"
  ON public.subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. USAGE_RECORDS (N:1 dengan profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL CHECK (feature_key IN ('roadmap_generation', 'ai_assistant_message')),
  usage_date DATE NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE,
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, feature_key, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_usage_records_user_date ON public.usage_records(user_id, usage_date);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_records_select_own"
  ON public.usage_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "usage_records_insert_own"
  ON public.usage_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_records_update_own"
  ON public.usage_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_records_delete_own"
  ON public.usage_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. ROADMAPS (N:1 dengan profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_stage TEXT NOT NULL CHECK (business_stage IN ('not_started', 'starting', 'running')),
  industry_category TEXT NOT NULL,
  target_customer TEXT NOT NULL,
  operational_location TEXT NOT NULL,
  estimated_capital TEXT NOT NULL,
  input_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  business_summary TEXT NOT NULL,
  problem_opportunity_analysis TEXT NOT NULL,
  target_market_analysis TEXT NOT NULL,
  validation_or_evaluation TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  business_model_revenue TEXT NOT NULL,
  capital_cost_estimation TEXT NOT NULL,
  marketing_acquisition_strategy TEXT NOT NULL,
  operational_plan TEXT NOT NULL,
  risks_and_mitigation JSONB NOT NULL DEFAULT '[]'::JSONB,
  next_priority_actions JSONB NOT NULL DEFAULT '[]'::JSONB,
  disclaimer_note TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id_created ON public.roadmaps(user_id, created_at DESC);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmaps_select_own"
  ON public.roadmaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "roadmaps_insert_own"
  ON public.roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmaps_update_own"
  ON public.roadmaps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmaps_delete_own"
  ON public.roadmaps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. ROADMAP_STAGES (N:1 dengan roadmaps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roadmap_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_duration TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_stages_roadmap_id ON public.roadmap_stages(roadmap_id, stage_order);

ALTER TABLE public.roadmap_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmap_stages_select_own"
  ON public.roadmap_stages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "roadmap_stages_insert_own"
  ON public.roadmap_stages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmap_stages_update_own"
  ON public.roadmap_stages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmap_stages_delete_own"
  ON public.roadmap_stages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. ROADMAP_TASKS (N:1 dengan roadmap_stages dan roadmaps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.roadmap_stages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_duration TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  success_indicator TEXT NOT NULL,
  dependency TEXT NOT NULL DEFAULT 'Tidak ada',
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap_id ON public.roadmap_tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_stage_id ON public.roadmap_tasks(stage_id, task_order);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_user_id ON public.roadmap_tasks(user_id);

ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmap_tasks_select_own"
  ON public.roadmap_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "roadmap_tasks_insert_own"
  ON public.roadmap_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmap_tasks_update_own"
  ON public.roadmap_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmap_tasks_delete_own"
  ON public.roadmap_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. AI_CONVERSATIONS (N:1 dengan profiles, opsional N:1 dengan roadmaps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id, updated_at DESC);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_conversations_select_own"
  ON public.ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "ai_conversations_insert_own"
  ON public.ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_conversations_update_own"
  ON public.ai_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_conversations_delete_own"
  ON public.ai_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 9. AI_MESSAGES (N:1 dengan ai_conversations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id, created_at ASC);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_messages_select_own"
  ON public.ai_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "ai_messages_insert_own"
  ON public.ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_messages_update_own"
  ON public.ai_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_messages_delete_own"
  ON public.ai_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 10. FORUM_CATEGORIES (Master kategori diskusi komunitas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_categories_select_all"
  ON public.forum_categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================================================
-- 11. FORUM_POSTS (N:1 dengan profiles dan forum_categories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes_count INTEGER NOT NULL DEFAULT 0 CHECK (upvotes_count >= 0),
  comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_category_created ON public.forum_posts(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_posts_select_authenticated"
  ON public.forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_posts_insert_own"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_posts_update_own"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_posts_delete_own"
  ON public.forum_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ============================================================================
-- 12. FORUM_COMMENTS (N:1 dengan forum_posts dan profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON public.forum_comments(post_id, created_at ASC);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_comments_select_authenticated"
  ON public.forum_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_comments_insert_own"
  ON public.forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_comments_update_own"
  ON public.forum_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_comments_delete_own"
  ON public.forum_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ============================================================================
-- 13. FORUM_VOTES (Upvote pengguna pada diskusi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_votes_post_user ON public.forum_votes(post_id, user_id);

ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_votes_select_authenticated"
  ON public.forum_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_votes_insert_own"
  ON public.forum_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_votes_delete_own"
  ON public.forum_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 14. MENTORS (Profil mentor beserta penanda is_demo_data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role_headline TEXT NOT NULL,
  expertise_tags TEXT[] NOT NULL DEFAULT '{}',
  experience_summary TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL DEFAULT 5,
  consultation_language TEXT NOT NULL DEFAULT 'Bahasa Indonesia',
  session_duration_minutes INTEGER NOT NULL DEFAULT 45,
  is_demo_data BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mentors_select_authenticated"
  ON public.mentors FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 15. MENTOR_AVAILABILITY (Slot jadwal ketersediaan mentor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, slot_start)
);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_slot ON public.mentor_availability(mentor_id, slot_start ASC);

ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mentor_availability_select_authenticated"
  ON public.mentor_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mentor_availability_update_authenticated"
  ON public.mentor_availability FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 16. CONSULTATION_BOOKINGS (Pemesanan jadwal konsultasi oleh pengguna Max)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE RESTRICT,
  availability_id UUID NOT NULL REFERENCES public.mentor_availability(id) ON DELETE RESTRICT,
  business_topic TEXT NOT NULL,
  question_notes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  meeting_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mencegah double booking pada slot ketersediaan yang sama apabila status bukan cancelled
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking_per_slot
  ON public.consultation_bookings(availability_id)
  WHERE (status <> 'cancelled');

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user_id ON public.consultation_bookings(user_id, created_at DESC);

ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consultation_bookings_select_own"
  ON public.consultation_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "consultation_bookings_insert_own"
  ON public.consultation_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consultation_bookings_update_own"
  ON public.consultation_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consultation_bookings_delete_own"
  ON public.consultation_bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS: Auto-create Profile & Default Subscription ('starter') on Auth SignUp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan_tier, status)
  VALUES (NEW.id, 'starter', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- RPC: Atomic Quota Check & Increment (WIB / Asia/Jakarta Timezone)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_and_increment_quota(
  p_user_id UUID,
  p_feature_key TEXT,
  p_daily_limit INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_used INTEGER,
  daily_limit INTEGER,
  remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE;
  v_used INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized quota operation';
  END IF;

  INSERT INTO public.usage_records (user_id, feature_key, usage_date, used_count)
  VALUES (p_user_id, p_feature_key, v_today, 0)
  ON CONFLICT (user_id, feature_key, usage_date) DO NOTHING;

  SELECT used_count INTO v_used
  FROM public.usage_records
  WHERE user_id = p_user_id
    AND feature_key = p_feature_key
    AND usage_date = v_today
  FOR UPDATE;

  IF v_used >= p_daily_limit THEN
    RETURN QUERY SELECT FALSE, v_used, p_daily_limit, 0;
  ELSE
    UPDATE public.usage_records
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND feature_key = p_feature_key
      AND usage_date = v_today
    RETURNING used_count INTO v_used;

    RETURN QUERY SELECT TRUE, v_used, p_daily_limit, GREATEST(0, p_daily_limit - v_used);
  END IF;
END;
$$;

-- ============================================================================
-- RPC: Sync Forum Comment & Vote Counters
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_forum_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_forum_comment_change ON public.forum_comments;
CREATE TRIGGER on_forum_comment_change
  AFTER INSERT OR DELETE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_forum_comment_count();

CREATE OR REPLACE FUNCTION public.handle_forum_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts
    SET upvotes_count = upvotes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts
    SET upvotes_count = GREATEST(0, upvotes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_forum_vote_change ON public.forum_votes;
CREATE TRIGGER on_forum_vote_change
  AFTER INSERT OR DELETE ON public.forum_votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_forum_vote_count();

-- ============================================================================
-- SEED DATA: Forum Categories & Demo Mentors (is_demo_data = true)
-- ============================================================================
INSERT INTO public.forum_categories (slug, name, description, sort_order)
VALUES
  ('ide-bisnis-validasi', 'Ide Bisnis & Validasi', 'Diskusi seputar riset pasar awal, uji coba produk, dan mencari 10 pembeli pertama.', 1),
  ('pemasaran-penjualan', 'Pemasaran & Penjualan', 'Strategi konten organik, promosi lokal, akuisisi pelanggan, dan retensi pembeli.', 2),
  ('modal-keuangan', 'Modal & Keuangan', 'Perhitungan modal awal, HPP, penetapan harga jual, dan pengelolaan arus kas usaha.', 3),
  ('operasional-tim', 'Operasional & Tim', 'Manajemen stok bahan baku, SOP harian, pemilihan supplier, dan perekrutan staf awal.', 4),
  ('pengembangan-usaha', 'Pengembangan Usaha', 'Evaluasi bisnis stagnan, ekspansi cabang, kemitraan, dan peningkatan kapasitas usaha.', 5)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  v_mentor1 UUID := '11111111-1111-4111-8111-111111111101';
  v_mentor2 UUID := '11111111-1111-4111-8111-111111111102';
  v_mentor3 UUID := '11111111-1111-4111-8111-111111111103';
  v_mentor4 UUID := '11111111-1111-4111-8111-111111111104';
BEGIN
  INSERT INTO public.mentors (
    id, full_name, initials, role_headline, expertise_tags,
    experience_summary, years_of_experience, consultation_language,
    session_duration_minutes, is_demo_data
  )
  VALUES
    (
      v_mentor1,
      'Arif Pratama, MBA',
      'AP',
      'Praktisi F&B & Konsultan Operasional UMKM',
      ARRAY['Kuliner & F&B', 'Perhitungan HPP', 'SOP Operasional', 'Validasi Pasar'],
      'Berpengalaman 9 tahun membangun jaringan kedai kopi dan katering harian di Jawa Barat. Fokus mendampingi perintis usaha kuliner menghitung modal awal yang realistis dan menyusun standar operasional dapur.',
      9,
      'Bahasa Indonesia',
      45,
      TRUE
    ),
    (
      v_mentor2,
      'Dina Kusumawardhani',
      'DK',
      'Brand Strategist & Spesialis Pertumbuhan D2C Lokal',
      ARRAY['Pemasaran Digital', 'Strategi Konten', 'Positioning Brand', 'Retensi Pelanggan'],
      'Mendampingi lebih dari 60 brand fesyen dan kerajinan lokal beralih dari penjualan lingkaran pertemanan ke akuisisi pelanggan organik yang konsisten melalui marketplace dan media sosial.',
      7,
      'Bahasa Indonesia',
      45,
      TRUE
    ),
    (
      v_mentor3,
      'Bima Hendrawan, CFA',
      'BH',
      'Penasihat Keuangan UMKM & Manajemen Arus Kas',
      ARRAY['Modal & Arus Kas', 'Struktur Harga', 'Evaluasi Profitabilitas', 'Ekspansi Usaha'],
      'Eks analis keuangan ritel yang kini fokus membantu pemilik usaha jasa dan perdagangan mendiagnosis kebocoran biaya operasional serta menyusun rencana ekspansi cabang berbasis kas sehat.',
      11,
      'Bahasa Indonesia',
      45,
      TRUE
    ),
    (
      v_mentor4,
      'Saraswati Putri',
      'SP',
      'Mentor Bisnis Jasa, B2B Lokal & Kemitraan',
      ARRAY['Bisnis Jasa', 'Penjualan B2B', 'Negosiasi Klien', 'Manajemen Tim Kecil'],
      'Pendiri agensi layanan kebersihan dan perawatan gedung skala UMKM. Berpengalaman membimbing usaha berbasis jasa mendapatkan kontrak pelanggan berulang dan mengelola tim lapangan.',
      8,
      'Bahasa Indonesia',
      45,
      TRUE
    )
  ON CONFLICT (id) DO NOTHING;

  -- Buat slot ketersediaan masa depan untuk setiap mentor demo
  INSERT INTO public.mentor_availability (mentor_id, slot_start, slot_end, is_booked)
  VALUES
    (v_mentor1, DATE_TRUNC('day', NOW()) + INTERVAL '2 days 10 hours', DATE_TRUNC('day', NOW()) + INTERVAL '2 days 10 hours 45 minutes', FALSE),
    (v_mentor1, DATE_TRUNC('day', NOW()) + INTERVAL '3 days 14 hours', DATE_TRUNC('day', NOW()) + INTERVAL '3 days 14 hours 45 minutes', FALSE),
    (v_mentor1, DATE_TRUNC('day', NOW()) + INTERVAL '5 days 16 hours', DATE_TRUNC('day', NOW()) + INTERVAL '5 days 16 hours 45 minutes', FALSE),
    (v_mentor2, DATE_TRUNC('day', NOW()) + INTERVAL '2 days 13 hours', DATE_TRUNC('day', NOW()) + INTERVAL '2 days 13 hours 45 minutes', FALSE),
    (v_mentor2, DATE_TRUNC('day', NOW()) + INTERVAL '4 days 10 hours', DATE_TRUNC('day', NOW()) + INTERVAL '4 days 10 hours 45 minutes', FALSE),
    (v_mentor2, DATE_TRUNC('day', NOW()) + INTERVAL '6 days 15 hours', DATE_TRUNC('day', NOW()) + INTERVAL '6 days 15 hours 45 minutes', FALSE),
    (v_mentor3, DATE_TRUNC('day', NOW()) + INTERVAL '3 days 09 hours', DATE_TRUNC('day', NOW()) + INTERVAL '3 days 09 hours 45 minutes', FALSE),
    (v_mentor3, DATE_TRUNC('day', NOW()) + INTERVAL '4 days 15 hours', DATE_TRUNC('day', NOW()) + INTERVAL '4 days 15 hours 45 minutes', FALSE),
    (v_mentor3, DATE_TRUNC('day', NOW()) + INTERVAL '7 days 11 hours', DATE_TRUNC('day', NOW()) + INTERVAL '7 days 11 hours 45 minutes', FALSE),
    (v_mentor4, DATE_TRUNC('day', NOW()) + INTERVAL '2 days 16 hours', DATE_TRUNC('day', NOW()) + INTERVAL '2 days 16 hours 45 minutes', FALSE),
    (v_mentor4, DATE_TRUNC('day', NOW()) + INTERVAL '5 days 10 hours', DATE_TRUNC('day', NOW()) + INTERVAL '5 days 10 hours 45 minutes', FALSE),
    (v_mentor4, DATE_TRUNC('day', NOW()) + INTERVAL '6 days 13 hours', DATE_TRUNC('day', NOW()) + INTERVAL '6 days 13 hours 45 minutes', FALSE)
  ON CONFLICT (mentor_id, slot_start) DO NOTHING;
END $$;

