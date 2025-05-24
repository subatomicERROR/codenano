-- Create project versions table for version history
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add foreign key constraint
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own project versions
CREATE POLICY "Users can view their own project versions"
  ON project_versions
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to insert their own project versions
CREATE POLICY "Users can insert their own project versions"
  ON project_versions
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_saved_at ON project_versions(saved_at);
