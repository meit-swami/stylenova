-- Create storage bucket for store assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for store assets
CREATE POLICY "Anyone can view store assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-assets');

CREATE POLICY "Authenticated users can upload store assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'store-assets');

CREATE POLICY "Users can update their own store assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own store assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);