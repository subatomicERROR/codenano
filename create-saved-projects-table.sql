-- Create a function to create the saved_projects table if it doesn't exist
CREATE OR REPLACE FUNCTION create_saved_projects_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'saved_projects'
  ) THEN
    -- Create the saved_projects table
    CREATE TABLE public.saved_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, project_id)
    );

    -- Enable RLS
    ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY select_own_saved_projects ON saved_projects
      FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY insert_own_saved_projects ON saved_projects
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY delete_own_saved_projects ON saved_projects
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END;
$$;
