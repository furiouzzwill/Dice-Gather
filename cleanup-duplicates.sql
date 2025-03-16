-- This SQL script will help clean up duplicate profiles
-- Run this in your Supabase SQL Editor

-- First, let's identify any duplicate profiles
SELECT id, COUNT(*) 
FROM profiles 
GROUP BY id 
HAVING COUNT(*) > 1;

-- If you find duplicates, you can delete them and keep only the most recent one
-- Replace 'your_user_id' with the actual user ID that has duplicates
DELETE FROM profiles 
WHERE id = 'your_user_id' 
AND created_at < (
  SELECT MAX(created_at) 
  FROM profiles 
  WHERE id = 'your_user_id'
);

-- Alternatively, you can delete all profiles for a specific user
-- and let the app create a fresh one
DELETE FROM profiles WHERE id = 'your_user_id';

