-- ============================================================
-- Migration 002: Row Level Security Policies
-- Delta SJEC Virtual Workspace
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: get current user's department
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_department()
RETURNS TEXT AS $$
  SELECT department FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- HELPER FUNCTION: get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- USERS policies
-- ============================================================
-- Any authenticated user can read user profiles (needed for joining)
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile only
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- PROJECTS policies
-- ============================================================
-- Members see projects in their department or 'all'
-- Heads see everything
CREATE POLICY "projects_select"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'head'
    OR 'all' = ANY(target_departments)
    OR current_user_department() = ANY(target_departments)
  );

-- Only heads can insert projects
CREATE POLICY "projects_insert_head"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (current_user_role() = 'head');

-- Only heads can update projects (own posts)
CREATE POLICY "projects_update_head"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (current_user_role() = 'head' AND posted_by = auth.uid())
  WITH CHECK (current_user_role() = 'head' AND posted_by = auth.uid());

-- Only heads can delete projects (own posts)
CREATE POLICY "projects_delete_head"
  ON public.projects FOR DELETE
  TO authenticated
  USING (current_user_role() = 'head' AND posted_by = auth.uid());

-- ============================================================
-- PROJECT_FILES policies
-- ============================================================
-- Same visibility as the parent project
CREATE POLICY "project_files_select"
  ON public.project_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (
          current_user_role() = 'head'
          OR 'all' = ANY(p.target_departments)
          OR current_user_department() = ANY(p.target_departments)
        )
    )
  );

-- Only heads can upload files
CREATE POLICY "project_files_insert_head"
  ON public.project_files FOR INSERT
  TO authenticated
  WITH CHECK (current_user_role() = 'head');

-- Only heads can delete files (own projects)
CREATE POLICY "project_files_delete_head"
  ON public.project_files FOR DELETE
  TO authenticated
  USING (
    current_user_role() = 'head'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.posted_by = auth.uid()
    )
  );

-- ============================================================
-- COMMENTS policies
-- ============================================================
-- Any authenticated user who can see the project can see comments
CREATE POLICY "comments_select"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (
          current_user_role() = 'head'
          OR 'all' = ANY(p.target_departments)
          OR current_user_department() = ANY(p.target_departments)
        )
    )
  );

-- Any authenticated user can comment
CREATE POLICY "comments_insert"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only edit their own comments
CREATE POLICY "comments_update_own"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own comments
CREATE POLICY "comments_delete_own"
  ON public.comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- REACTIONS policies
-- ============================================================
CREATE POLICY "reactions_select"
  ON public.reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (
          current_user_role() = 'head'
          OR 'all' = ANY(p.target_departments)
          OR current_user_department() = ANY(p.target_departments)
        )
    )
  );

CREATE POLICY "reactions_insert"
  ON public.reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete_own"
  ON public.reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- ANNOUNCEMENTS policies
-- ============================================================
CREATE POLICY "announcements_select"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'head'
    OR 'all' = ANY(target_departments)
    OR current_user_department() = ANY(target_departments)
  );

CREATE POLICY "announcements_insert_head"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (current_user_role() = 'head');

CREATE POLICY "announcements_update_head"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (current_user_role() = 'head' AND posted_by = auth.uid())
  WITH CHECK (current_user_role() = 'head' AND posted_by = auth.uid());

CREATE POLICY "announcements_delete_head"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (current_user_role() = 'head' AND posted_by = auth.uid());

-- ============================================================
-- LOGIN_SESSIONS policies
-- ============================================================
-- Heads can see all sessions; members only their own
CREATE POLICY "login_sessions_select"
  ON public.login_sessions FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'head'
    OR user_id = auth.uid()
  );

-- Users can only insert their own session
CREATE POLICY "login_sessions_insert_own"
  ON public.login_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own session (logout)
CREATE POLICY "login_sessions_update_own"
  ON public.login_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
