-- Add thumbnail column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_thumbnail ON projects(thumbnail) WHERE thumbnail IS NOT NULL;

-- Update existing projects to have a default thumbnail placeholder
UPDATE projects 
SET thumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE4MCA5MEgxNDBMMTYwIDEyMFoiIGZpbGw9IiMwMGZmODgiLz4KPHN2Zz4K'
WHERE thumbnail IS NULL;
