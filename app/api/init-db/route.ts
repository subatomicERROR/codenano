import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerClient()

  try {
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create profiles table if it doesn't exist
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username TEXT UNIQUE,
        name TEXT,
        avatar_url TEXT,
        banner_url TEXT,
        bio TEXT,
        website_url TEXT,
        github_url TEXT,
        twitter_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Set up Row Level Security
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy'
        ) THEN
          CREATE POLICY profiles_select_policy ON profiles FOR SELECT USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy'
        ) THEN
          CREATE POLICY profiles_insert_policy ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_policy'
        ) THEN
          CREATE POLICY profiles_update_policy ON profiles FOR UPDATE USING (auth.uid() = id);
        END IF;
      END
      $$;
    `

    // Create projects table if it doesn't exist
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title TEXT,
        description TEXT,
        html TEXT,
        css TEXT,
        js TEXT,
        thumbnail_url TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        stars INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Set up Row Level Security
      ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_select_policy'
        ) THEN
          CREATE POLICY projects_select_policy ON projects FOR SELECT USING (
            is_public OR auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_insert_policy'
        ) THEN
          CREATE POLICY projects_insert_policy ON projects FOR INSERT WITH CHECK (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_update_policy'
        ) THEN
          CREATE POLICY projects_update_policy ON projects FOR UPDATE USING (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_delete_policy'
        ) THEN
          CREATE POLICY projects_delete_policy ON projects FOR DELETE USING (
            auth.uid() = user_id
          );
        END IF;
      END
      $$;
    `

    // Create saved_projects table if it doesn't exist
    const createSavedProjectsTable = `
      CREATE TABLE IF NOT EXISTS saved_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, project_id)
      );

      -- Set up Row Level Security
      ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'saved_projects' AND policyname = 'saved_projects_select_policy'
        ) THEN
          CREATE POLICY saved_projects_select_policy ON saved_projects FOR SELECT USING (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'saved_projects' AND policyname = 'saved_projects_insert_policy'
        ) THEN
          CREATE POLICY saved_projects_insert_policy ON saved_projects FOR INSERT WITH CHECK (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'saved_projects' AND policyname = 'saved_projects_delete_policy'
        ) THEN
          CREATE POLICY saved_projects_delete_policy ON saved_projects FOR DELETE USING (
            auth.uid() = user_id
          );
        END IF;
      END
      $$;
    `

    // Create reels table if it doesn't exist
    const createReelsTable = `
      CREATE TABLE IF NOT EXISTS reels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title TEXT,
        description TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        html TEXT,
        css TEXT,
        js TEXT,
        aspect_ratio TEXT DEFAULT 'portrait',
        platform TEXT DEFAULT 'instagram',
        quality TEXT DEFAULT 'high',
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Set up Row Level Security
      ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'reels' AND policyname = 'reels_select_policy'
        ) THEN
          CREATE POLICY reels_select_policy ON reels FOR SELECT USING (
            is_public OR auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'reels' AND policyname = 'reels_insert_policy'
        ) THEN
          CREATE POLICY reels_insert_policy ON reels FOR INSERT WITH CHECK (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'reels' AND policyname = 'reels_update_policy'
        ) THEN
          CREATE POLICY reels_update_policy ON reels FOR UPDATE USING (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'reels' AND policyname = 'reels_delete_policy'
        ) THEN
          CREATE POLICY reels_delete_policy ON reels FOR DELETE USING (
            auth.uid() = user_id
          );
        END IF;
      END
      $$;
    `

    // Create posts table if it doesn't exist
    const createPostsTable = `
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title TEXT,
        description TEXT,
        image_url TEXT,
        thumbnail_url TEXT,
        html TEXT,
        css TEXT,
        js TEXT,
        aspect_ratio TEXT DEFAULT 'portrait',
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Set up Row Level Security
      ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_select_policy'
        ) THEN
          CREATE POLICY posts_select_policy ON posts FOR SELECT USING (
            is_public OR auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_insert_policy'
        ) THEN
          CREATE POLICY posts_insert_policy ON posts FOR INSERT WITH CHECK (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_update_policy'
        ) THEN
          CREATE POLICY posts_update_policy ON posts FOR UPDATE USING (
            auth.uid() = user_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_delete_policy'
        ) THEN
          CREATE POLICY posts_delete_policy ON posts FOR DELETE USING (
            auth.uid() = user_id
          );
        END IF;
      END
      $$;
    `

    // Create followers table if it doesn't exist
    const createFollowersTable = `
      CREATE TABLE IF NOT EXISTS followers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      );

      -- Set up Row Level Security
      ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'followers' AND policyname = 'followers_select_policy'
        ) THEN
          CREATE POLICY followers_select_policy ON followers FOR SELECT USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'followers' AND policyname = 'followers_insert_policy'
        ) THEN
          CREATE POLICY followers_insert_policy ON followers FOR INSERT WITH CHECK (
            auth.uid() = follower_id
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'followers' AND policyname = 'followers_delete_policy'
        ) THEN
          CREATE POLICY followers_delete_policy ON followers FOR DELETE USING (
            auth.uid() = follower_id
          );
        END IF;
      END
      $$;
    `

    // Create function to create user profile on signup
    const createProfileFunction = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
        VALUES (
          NEW.id,
          NEW.email,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
          NOW(),
          NOW()
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    // Create trigger for new user signup
    const createProfileTrigger = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
        ) THEN
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        END IF;
      END
      $$;
    `

    // Execute all SQL statements
    await supabase.rpc("exec_sql", { sql: createProfilesTable })
    await supabase.rpc("exec_sql", { sql: createProjectsTable })
    await supabase.rpc("exec_sql", { sql: createSavedProjectsTable })
    await supabase.rpc("exec_sql", { sql: createReelsTable })
    await supabase.rpc("exec_sql", { sql: createPostsTable })
    await supabase.rpc("exec_sql", { sql: createFollowersTable })
    await supabase.rpc("exec_sql", { sql: createProfileFunction })
    await supabase.rpc("exec_sql", { sql: createProfileTrigger })

    // Create profile for current user if it doesn't exist
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", session.user.id).limit(1)

    if (!existingProfile || existingProfile.length === 0) {
      await supabase.from("profiles").insert({
        id: session.user.id,
        username: session.user.email,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error: any) {
    console.error("Database initialization error:", error)

    // Try alternative approach if RPC fails
    try {
      const supabase = createServerClient()

      // Create tables directly
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT UNIQUE,
          name TEXT,
          avatar_url TEXT,
          banner_url TEXT,
          bio TEXT,
          website_url TEXT,
          github_url TEXT,
          twitter_url TEXT,
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      await supabase.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          title TEXT,
          description TEXT,
          html TEXT,
          css TEXT,
          js TEXT,
          thumbnail_url TEXT,
          is_public BOOLEAN DEFAULT FALSE,
          stars INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      await supabase.query(`
        CREATE TABLE IF NOT EXISTS saved_projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, project_id)
        );
      `)

      await supabase.query(`
        CREATE TABLE IF NOT EXISTS reels (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          title TEXT,
          description TEXT,
          video_url TEXT,
          thumbnail_url TEXT,
          html TEXT,
          css TEXT,
          js TEXT,
          aspect_ratio TEXT DEFAULT 'portrait',
          platform TEXT DEFAULT 'instagram',
          quality TEXT DEFAULT 'high',
          is_public BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      return NextResponse.json({ success: true, message: "Database initialized with fallback method" })
    } catch (fallbackError: any) {
      console.error("Fallback initialization error:", fallbackError)
      return NextResponse.json({ error: error.message || "Failed to initialize database" }, { status: 500 })
    }
  }
}
