CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  companyId UUID REFERENCES companies(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium',
  metadata JSONB
);