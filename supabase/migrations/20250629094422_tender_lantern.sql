/*
  # Add foreign key relationship for question_responses

  1. Changes
     - Add foreign key relationship between question_responses.responder_id and user_profiles.id
     - This fixes the error when trying to join these tables in queries
*/

-- Check if the foreign key already exists before trying to add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'question_responses_responder_id_fkey_profiles' 
    AND table_name = 'question_responses'
  ) THEN
    -- Add foreign key from question_responses.responder_id to user_profiles.id
    ALTER TABLE IF EXISTS question_responses
    ADD CONSTRAINT question_responses_responder_id_fkey_profiles
    FOREIGN KEY (responder_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;