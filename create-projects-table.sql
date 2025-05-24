-- Function to create the projects table if it doesn't exist
CREATE OR REPLACE FUNCTION create_projects_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'projects'
  ) THEN
    -- Create the projects table
    CREATE TABLE public.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      html TEXT,
      css TEXT,
      js TEXT,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can view public projects" ON projects FOR SELECT USING (is_public = true);
    CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);
  END IF;
END;
$$;
