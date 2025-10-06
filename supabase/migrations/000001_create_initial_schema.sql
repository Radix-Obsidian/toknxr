-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table (equivalent to Organization)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contact_email TEXT
);

-- Create profiles table (equivalent to User)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL
);

-- Create projects table (equivalent to Project)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create ai_services table (equivalent to AIService)
CREATE TABLE ai_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  token_cost_per_unit DECIMAL(10,4) NOT NULL,
  unit_type TEXT NOT NULL,
  description TEXT,
  api_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interactions table (equivalent to TokenUsage)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ai_service_id UUID NOT NULL REFERENCES ai_services(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL,
  cost_in_cents INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_details TEXT,
  response_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table (equivalent to Alert)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  unit TEXT NOT NULL,
  period TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key to profiles after organizations is created
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_owner_user_id ON projects(owner_user_id);
CREATE INDEX idx_interactions_project_id ON interactions(project_id);
CREATE INDEX idx_interactions_ai_service_id ON interactions(ai_service_id);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_project_id ON alerts(project_id);
CREATE INDEX idx_alerts_status ON alerts(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic example - users can only see their own data)
-- For profiles: users can view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- For organizations: users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.organization_id = organizations.id AND profiles.id = auth.uid())
);

-- For projects: users can view projects in their organizations
CREATE POLICY "Users can view projects in their organizations" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.organization_id = projects.organization_id AND profiles.id = auth.uid())
);

-- For ai_services: public read, authenticated write
CREATE POLICY "Anyone can view AI services" ON ai_services FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage AI services" ON ai_services FOR ALL USING (auth.role() = 'authenticated');

-- For interactions: users can view interactions from their projects
CREATE POLICY "Users can view interactions from their projects" ON interactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = interactions.project_id AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.organization_id = projects.organization_id AND profiles.id = auth.uid()))
);

-- For alerts: users can view their own alerts
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_services_updated_at BEFORE UPDATE ON ai_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();