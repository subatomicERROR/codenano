-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_projects table for collections
CREATE TABLE IF NOT EXISTS saved_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own profile
CREATE POLICY select_own_profile ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY update_own_profile ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY insert_own_profile ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy for anyone to view profiles (for public pages)
CREATE POLICY select_all_profiles ON profiles
  FOR SELECT
  USING (true);

-- Create RLS policies for saved_projects
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own saved projects
CREATE POLICY select_own_saved_projects ON saved_projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own saved projects
CREATE POLICY insert_own_saved_projects ON saved_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own saved projects
CREATE POLICY delete_own_saved_projects ON saved_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
