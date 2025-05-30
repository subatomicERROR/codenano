-- Drop reel-related tables if they exist
DROP TABLE IF EXISTS public.saved_reels CASCADE;
DROP TABLE IF EXISTS public.reels CASCADE;

-- Enhanced Users Profile System
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    github_username TEXT,
    twitter_username TEXT,
    location TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_pro BOOLEAN DEFAULT false,
    total_projects INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Enhanced Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    html TEXT DEFAULT '',
    css TEXT DEFAULT '',
    js TEXT DEFAULT '',
    files JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    framework TEXT DEFAULT 'html',
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100)
);

-- Project Likes System
CREATE TABLE IF NOT EXISTS public.project_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, project_id)
);

-- Project Views Analytics
CREATE TABLE IF NOT EXISTS public.project_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Saved Projects
CREATE TABLE IF NOT EXISTS public.saved_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, project_id)
);

-- Project Comments System
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000)
);

-- Project Forks System
CREATE TABLE IF NOT EXISTS public.project_forks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    forked_project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(original_project_id, forked_project_id)
);

-- Enhanced Project Versions
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT,
    content JSONB NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(project_id, version_number)
);

-- User Followers System
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Collections System
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50)
);

-- Collection Items
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(collection_id, project_id)
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_view_count ON public.projects(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_like_count ON public.projects(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_project ON public.project_likes(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON public.project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_created_at ON public.project_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_projects_user_id ON public.saved_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_forks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Projects
CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Project Likes
CREATE POLICY "Anyone can view project likes" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like projects" ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Project Views
CREATE POLICY "Project views are viewable by project owners" ON public.project_views FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can insert project views" ON public.project_views FOR INSERT WITH CHECK (true);

-- RLS Policies for Saved Projects
CREATE POLICY "Users can view their own saved projects" ON public.saved_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save projects" ON public.saved_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their saved projects" ON public.saved_projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Comments
CREATE POLICY "Comments are viewable by everyone" ON public.project_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.project_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.project_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.project_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Follows
CREATE POLICY "Follows are viewable by everyone" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for Collections
CREATE POLICY "Public collections are viewable by everyone" ON public.collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Collection Items
CREATE POLICY "Collection items follow collection visibility" ON public.collection_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND (is_public = true OR user_id = auth.uid()))
);
CREATE POLICY "Collection owners can manage items" ON public.collection_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);

-- Functions for updating counters
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'project_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.projects SET like_count = like_count + 1 WHERE id = NEW.project_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.projects SET like_count = like_count - 1 WHERE id = OLD.project_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'project_views' THEN
        UPDATE public.projects SET view_count = view_count + 1 WHERE id = NEW.project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_like_count ON public.project_likes;
CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON public.project_likes
    FOR EACH ROW EXECUTE FUNCTION update_project_stats();

DROP TRIGGER IF EXISTS trigger_update_view_count ON public.project_views;
CREATE TRIGGER trigger_update_view_count
    AFTER INSERT ON public.project_views
    FOR EACH ROW EXECUTE FUNCTION update_project_stats();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles 
        SET total_projects = (SELECT COUNT(*) FROM public.projects WHERE user_id = NEW.user_id)
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles 
        SET total_projects = (SELECT COUNT(*) FROM public.projects WHERE user_id = OLD.user_id)
        WHERE id = OLD.user_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user stats
DROP TRIGGER IF EXISTS trigger_update_user_stats ON public.projects;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();
