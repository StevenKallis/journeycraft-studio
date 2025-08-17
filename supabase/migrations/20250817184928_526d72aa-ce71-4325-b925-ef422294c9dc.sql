-- Create packages table
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration TEXT NOT NULL,
  location TEXT NOT NULL,
  max_guests INTEGER NOT NULL,
  images TEXT[] DEFAULT '{}',
  pdfs TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies for packages (admin only for now)
CREATE POLICY "Admins can manage packages" 
ON public.packages 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create policies for news (admin only for now)
CREATE POLICY "Admins can manage news" 
ON public.news 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create public read policies
CREATE POLICY "Anyone can view published packages" 
ON public.packages 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Anyone can view published news" 
ON public.news 
FOR SELECT 
USING (status = 'published');

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('package-files', 'package-files', true);

-- Create storage policies
CREATE POLICY "Package files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'package-files');

CREATE POLICY "Admins can upload package files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'package-files' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update package files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'package-files' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete package files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'package-files' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();