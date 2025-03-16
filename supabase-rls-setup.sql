-- Enable Row Level Security on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to select any profile
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Create a policy that allows users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create a policy that allows users to delete their own profile
CREATE POLICY "Users can delete own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- Enable RLS on other tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for games table
CREATE POLICY "Games are viewable by everyone" 
ON games FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own games" 
ON games FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their own games" 
ON games FOR UPDATE 
USING (auth.uid() = host_id);

CREATE POLICY "Users can delete their own games" 
ON games FOR DELETE 
USING (auth.uid() = host_id);

-- Create policies for reservations table
CREATE POLICY "Users can view their own reservations" 
ON reservations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reservations" 
ON reservations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" 
ON reservations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations" 
ON reservations FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for friends table
CREATE POLICY "Users can view their own friends" 
ON friends FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert their own friends" 
ON friends FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friends" 
ON friends FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friends" 
ON friends FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for messages table
CREATE POLICY "Users can view their own messages" 
ON messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages" 
ON messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" 
ON messages FOR UPDATE 
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" 
ON messages FOR DELETE 
USING (auth.uid() = sender_id);

