-- ============================================================
-- Migration 003: Storage Setup
-- Delta SJEC Virtual Workspace
-- ============================================================

-- Create the project-files storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  FALSE,
  52428800,  -- 50MB limit
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

-- ============================================================
-- Storage RLS policies
-- ============================================================

-- Only heads can upload files
CREATE POLICY "storage_project_files_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-files'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'head'
  );

-- Authenticated users can view/download files
CREATE POLICY "storage_project_files_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'project-files');

-- Heads can delete their files
CREATE POLICY "storage_project_files_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-files'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'head'
  );
