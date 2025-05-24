-- Function to create the reels table if it doesn't exist
CREATE OR REPLACE FUNCTION create_reels_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'reels'
  ) THEN
    -- Create the reels table
    CREATE TABLE public.reels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      thumbnail_url TEXT,
      aspect_ratio TEXT NOT NULL DEFAULT 'portrait',
      html TEXT,
      css TEXT,
      js TEXT,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view own reels" ON reels FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can view public reels" ON reels FOR SELECT USING (is_public = true);
    CREATE POLICY "Users can insert own reels" ON reels FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own reels" ON reels FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own reels" ON reels FOR DELETE USING (auth.uid() = user_id);
  END IF;
END;
$$;
