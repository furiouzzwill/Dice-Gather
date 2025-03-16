-- IMPORTANT: This is for development only!
-- Disable Row Level Security on the profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- If you have other tables with RLS issues, disable them too
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE friends DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

