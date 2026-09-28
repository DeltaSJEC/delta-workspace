-- ============================================================
-- Migration 005: Security hardening and data validation
-- Apply after migrations 001–004.
-- ============================================================

-- Never trust user-controlled Auth metadata for authorization. Accounts created
-- outside a controlled admin process always start as members.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, department, is_club_wide)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'member',
    'Mechanical',
    FALSE
  );
  RETURN NEW;
END;
$$;

-- These helpers are the shared authorization boundary for project content.
CREATE OR REPLACE FUNCTION public.current_user_department()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT department FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.can_access_project(target_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = target_project_id
      AND (
        public.current_user_role() = 'head'
        OR 'all' = ANY(p.target_departments)
        OR public.current_user_department() = ANY(p.target_departments)
      )
  );
$$;

-- Profiles are administered through Supabase/admin tooling. The application has
-- no profile-edit screen, so removing direct updates prevents role escalation.
DROP POLICY IF EXISTS "users_update_own" ON public.users;

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert_visible_project"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_access_project(project_id));

DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own_visible_project"
  ON public.comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.can_access_project(project_id))
  WITH CHECK (user_id = auth.uid() AND public.can_access_project(project_id));

DROP POLICY IF EXISTS "reactions_insert" ON public.reactions;
CREATE POLICY "reactions_insert_visible_project"
  ON public.reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_access_project(project_id));

DROP POLICY IF EXISTS "member_submissions_select" ON public.member_submissions;
CREATE POLICY "member_submissions_select"
  ON public.member_submissions FOR SELECT TO authenticated
  USING (
    submitted_by = auth.uid()
    OR (public.current_user_role() = 'head' AND public.can_access_project(project_id))
  );

DROP POLICY IF EXISTS "member_submissions_insert" ON public.member_submissions;
CREATE POLICY "member_submissions_insert_visible_project"
  ON public.member_submissions FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'member'
    AND submitted_by = auth.uid()
    AND public.can_access_project(project_id)
    AND (storage.foldername(storage_path))[1] = project_id::text
    AND (storage.foldername(storage_path))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "project_files_insert_head" ON public.project_files;
CREATE POLICY "project_files_insert_owner"
  ON public.project_files FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'head'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.posted_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "projects_insert_head" ON public.projects;
CREATE POLICY "projects_insert_owner"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'head' AND posted_by = auth.uid());

DROP POLICY IF EXISTS "announcements_insert_head" ON public.announcements;
CREATE POLICY "announcements_insert_owner"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'head' AND posted_by = auth.uid());

-- Project files must be associated with a visible project record. Uploads are
-- restricted to the head who owns the project, and deletes follow the same rule.
DROP POLICY IF EXISTS "storage_project_files_insert" ON storage.objects;
CREATE POLICY "storage_project_files_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-files'
    AND public.current_user_role() = 'head'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.posted_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "storage_project_files_select" ON storage.objects;
CREATE POLICY "storage_project_files_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1
      FROM public.project_files f
      WHERE f.storage_path = name
        AND public.can_access_project(f.project_id)
    )
  );

DROP POLICY IF EXISTS "storage_project_files_delete" ON storage.objects;
CREATE POLICY "storage_project_files_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-files'
    AND public.current_user_role() = 'head'
    AND EXISTS (
      SELECT 1
      FROM public.project_files f
      JOIN public.projects p ON p.id = f.project_id
      WHERE f.storage_path = name AND p.posted_by = auth.uid()
    )
  );

-- Submission objects are private to their author and the heads permitted to
-- review the linked project. Path segments bind an upload to its project/user.
DROP POLICY IF EXISTS "storage_member_submissions_insert" ON storage.objects;
CREATE POLICY "storage_member_submissions_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'member-submissions'
    AND public.current_user_role() = 'member'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND public.can_access_project(p.id)
    )
  );

DROP POLICY IF EXISTS "storage_member_submissions_select" ON storage.objects;
CREATE POLICY "storage_member_submissions_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'member-submissions'
    AND EXISTS (
      SELECT 1 FROM public.member_submissions s
      WHERE s.storage_path = name
        AND (
          s.submitted_by = auth.uid()
          OR (public.current_user_role() = 'head' AND public.can_access_project(s.project_id))
        )
    )
  );

DROP POLICY IF EXISTS "storage_member_submissions_delete" ON storage.objects;
CREATE POLICY "storage_member_submissions_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'member-submissions'
    AND EXISTS (
      SELECT 1
      FROM public.member_submissions s
      LEFT JOIN public.projects p ON p.id = s.project_id
      WHERE s.storage_path = name
        AND (
          s.submitted_by = auth.uid()
          OR (public.current_user_role() = 'head' AND p.posted_by = auth.uid())
        )
    )
  );

-- Server-side validation backs up the client-side upload and form validation.
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_title_length;
ALTER TABLE public.projects ADD CONSTRAINT projects_title_length
  CHECK (char_length(title) BETWEEN 1 AND 120) NOT VALID;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_description_length;
ALTER TABLE public.projects ADD CONSTRAINT projects_description_length
  CHECK (char_length(description) BETWEEN 1 AND 5000) NOT VALID;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_text_length;
ALTER TABLE public.comments ADD CONSTRAINT comments_text_length
  CHECK (char_length(text) BETWEEN 1 AND 1000) NOT VALID;
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_title_length;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_title_length
  CHECK (char_length(title) BETWEEN 1 AND 160) NOT VALID;
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_body_length;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_body_length
  CHECK (char_length(body) BETWEEN 1 AND 5000) NOT VALID;
ALTER TABLE public.project_files DROP CONSTRAINT IF EXISTS project_files_size_limit;
ALTER TABLE public.project_files ADD CONSTRAINT project_files_size_limit
  CHECK (size_bytes BETWEEN 1 AND 52428800) NOT VALID;
ALTER TABLE public.member_submissions DROP CONSTRAINT IF EXISTS member_submissions_size_limit;
ALTER TABLE public.member_submissions ADD CONSTRAINT member_submissions_size_limit
  CHECK (size_bytes BETWEEN 1 AND 52428800) NOT VALID;
ALTER TABLE public.member_submissions DROP CONSTRAINT IF EXISTS member_submissions_note_length;
ALTER TABLE public.member_submissions ADD CONSTRAINT member_submissions_note_length
  CHECK (char_length(note) <= 200) NOT VALID;

-- Session analytics are derived by the database, not supplied by the browser.
CREATE OR REPLACE FUNCTION public.normalize_login_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.login_time := NOW();
    NEW.logout_time := NULL;
    NEW.duration_seconds := NULL;
  ELSE
    NEW.user_id := OLD.user_id;
    NEW.login_time := OLD.login_time;
    NEW.logout_time := NOW();
    NEW.duration_seconds := GREATEST(0, EXTRACT(EPOCH FROM (NEW.logout_time - OLD.login_time))::INTEGER);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_login_session ON public.login_sessions;
CREATE TRIGGER normalize_login_session
  BEFORE INSERT OR UPDATE ON public.login_sessions
  FOR EACH ROW EXECUTE FUNCTION public.normalize_login_session();
