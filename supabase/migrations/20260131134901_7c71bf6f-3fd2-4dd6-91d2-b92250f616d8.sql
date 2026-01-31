-- Create table to store processed virtual try-on results with raw data
CREATE TABLE public.virtual_tryon_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID,
  session_id UUID REFERENCES public.tryon_sessions(id) ON DELETE CASCADE,
  
  -- Customer image data
  customer_image_url TEXT,
  customer_image_base64 TEXT,
  
  -- Product/clothing data
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_url TEXT,
  product_images TEXT[] NOT NULL DEFAULT '{}',
  product_name TEXT,
  product_category TEXT,
  
  -- AI analysis results
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('live_photo', 'ecom_tryon')),
  detected_features JSONB DEFAULT '{}',
  ai_comment TEXT,
  match_score INTEGER,
  
  -- Processed result
  processed_image_url TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Raw data for future reprocessing
  raw_request_data JSONB DEFAULT '{}',
  raw_response_data JSONB DEFAULT '{}',
  
  -- Metadata
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_virtual_tryon_store ON public.virtual_tryon_results(store_id);
CREATE INDEX idx_virtual_tryon_session ON public.virtual_tryon_results(session_id);
CREATE INDEX idx_virtual_tryon_saved ON public.virtual_tryon_results(is_saved) WHERE is_saved = true;

-- Enable RLS
ALTER TABLE public.virtual_tryon_results ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Store members can view their store try-on results" 
ON public.virtual_tryon_results 
FOR SELECT 
USING (
  store_id IN (SELECT store_id FROM public.user_roles WHERE user_id = auth.uid())
  OR store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

CREATE POLICY "Store members can create try-on results" 
ON public.virtual_tryon_results 
FOR INSERT 
WITH CHECK (
  store_id IN (SELECT store_id FROM public.user_roles WHERE user_id = auth.uid())
  OR store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

CREATE POLICY "Store members can update try-on results" 
ON public.virtual_tryon_results 
FOR UPDATE 
USING (
  store_id IN (SELECT store_id FROM public.user_roles WHERE user_id = auth.uid())
  OR store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

CREATE POLICY "Store members can delete try-on results" 
ON public.virtual_tryon_results 
FOR DELETE 
USING (
  store_id IN (SELECT store_id FROM public.user_roles WHERE user_id = auth.uid())
  OR store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_virtual_tryon_results_updated_at
BEFORE UPDATE ON public.virtual_tryon_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();