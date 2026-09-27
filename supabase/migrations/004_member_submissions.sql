-- ============================================================
-- Migration 004: Member Submissions
-- Delta SJEC Virtual Workspace
-- Members can upload their work against a project.
-- Heads can see all submissions; members only see their own.
-- ============================================================

-- ── Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.member_submissions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  submitted_by  UUID        NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  storage_path  TEXT        NOT NULL,
  filename      TEXT        NOT NULL,
  file_type     TEXT        NOT NULL,
  size_bytes    BIGINT      NOT NULL,
  note          TEXT        DEFAULT '',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_member_submissions_project_id
  ON public.member_submissions(project_id);

CREATE INDEX IF NOT EXISTS idx_member_submissions_submitted_by
  ON public.member_submissions(submitted_by);

CREATE INDEX IF NOT EXISTS idx_member_submissions_submitted_at
  ON public.member_submissions(submitted_at DESC);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.member_submissions ENABLE ROW LEVEL SECURITY;

-- Heads see all submissions for projects they can access.
-- Members see ONLY their own submissions.
CREATE POLICY "member_submissions_select"
  ON public.member_submissions FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'head'
    OR submitted_by = auth.uid()
  );

-- Any authenticated member can submit (one file per insert).
CREATE POLICY "member_submissions_insert"
  ON public.member_submissions FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- Members can delete their own submissions.
CREATE POLICY "member_submissions_delete_own"
  ON public.member_submissions FOR DELETE
  TO authenticated
  USING (submitted_by = auth.uid());

-- Heads can delete any submission on their projects.
CREATE POLICY "member_submissions_delete_head"
  ON public.member_submissions FOR DELETE
  TO authenticated
  USING (
    current_user_role() = 'head'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.posted_by = auth.uid()
    )
  );

-- ── Storage bucket for member submissions ───────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-submissions',
  'member-submissions',
  FALSE,
  52428800,  -- 50 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Any authenticated user can upload to member-submissions bucket
CREATE POLICY "storage_member_submissions_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'member-submissions');

-- Users can view/download files in member-submissions
CREATE POLICY "storage_member_submissions_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'member-submissions');

-- Users can delete their own uploads; heads can delete any
CREATE POLICY "storage_member_submissions_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'member-submissions');
