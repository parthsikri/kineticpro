-- Run once in the Supabase SQL editor using an administrator account.
-- The app now performs every storage operation server-side with the service-role key.
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Remove the insecure policies created by the previous setup endpoint.
DROP POLICY IF EXISTS "Allow anon uploads to thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads of thumbnails" ON storage.objects;
