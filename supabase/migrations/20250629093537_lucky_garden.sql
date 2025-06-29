/*
  # Update question_responses RLS policy for demo questions

  1. Changes
     - Modify the INSERT policy for question_responses to allow responses to demo questions
     - This enables users to interact with demo content for a better product experience
  
  2. Security
     - Maintains existing security for real questions
     - Adds specific condition to allow responses to demo questions
*/

-- Check if the policy exists before dropping
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'question_responses' AND policyname = 'Users can create responses to questions they''re matched to') THEN
    DROP POLICY "Users can create responses to questions they're matched to" ON question_responses;
  END IF;
END $$;

-- Create updated policy that allows responses to both matched questions and demo questions
CREATE POLICY "Users can create responses to questions they're matched to or demo questions"
  ON question_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (responder_id = auth.uid()) AND 
    (
      -- Original condition: User is matched to the question
      EXISTS (
        SELECT 1
        FROM question_matches
        WHERE question_matches.question_id = question_responses.question_id
        AND question_matches.expert_id = auth.uid()
      )
      OR
      -- New condition: The question is a demo question
      EXISTS (
        SELECT 1
        FROM demo_questions
        WHERE demo_questions.id = question_responses.question_id
      )
    )
  );