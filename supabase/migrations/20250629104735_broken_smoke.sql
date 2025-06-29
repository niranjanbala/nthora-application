-- Add is_demo column to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE questions ADD COLUMN is_demo boolean DEFAULT false;
  END IF;
END $$;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_questions_is_demo ON questions (is_demo);

-- Migrate existing demo questions to questions table
INSERT INTO questions (
  id,
  asker_id,
  title,
  content,
  primary_tags,
  secondary_tags,
  expected_answer_type,
  urgency_level,
  ai_summary,
  visibility_level,
  is_anonymous,
  is_sensitive,
  status,
  view_count,
  response_count,
  helpful_votes,
  created_at,
  updated_at,
  expires_at,
  is_demo
)
SELECT 
  id,
  id as asker_id, -- Use demo question id as asker_id for consistency
  title,
  content,
  primary_tags,
  secondary_tags,
  expected_answer_type::answer_type,
  urgency_level::urgency_level,
  ai_summary,
  visibility_level::visibility_level,
  is_anonymous,
  is_sensitive,
  status::question_status,
  view_count,
  response_count,
  helpful_votes,
  created_at,
  updated_at,
  expires_at,
  true as is_demo
FROM demo_questions
ON CONFLICT (id) DO UPDATE SET
  is_demo = true,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  primary_tags = EXCLUDED.primary_tags,
  secondary_tags = EXCLUDED.secondary_tags,
  expected_answer_type = EXCLUDED.expected_answer_type,
  urgency_level = EXCLUDED.urgency_level,
  ai_summary = EXCLUDED.ai_summary,
  visibility_level = EXCLUDED.visibility_level,
  is_anonymous = EXCLUDED.is_anonymous,
  is_sensitive = EXCLUDED.is_sensitive,
  status = EXCLUDED.status,
  view_count = EXCLUDED.view_count,
  response_count = EXCLUDED.response_count,
  helpful_votes = EXCLUDED.helpful_votes,
  updated_at = EXCLUDED.updated_at,
  expires_at = EXCLUDED.expires_at;

-- Add RLS policy for demo questions (public read access)
CREATE POLICY "Allow public read for demo questions"
  ON questions
  FOR SELECT
  TO anon, authenticated
  USING (is_demo = true);

-- Update existing policies to exclude demo questions from regular user queries
DROP POLICY IF EXISTS "Users can view network activity feed" ON questions;
CREATE POLICY "Users can view network activity feed"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    is_demo = false AND (
      (asker_id = uid()) OR 
      (asker_id IN (SELECT get_network_user_ids.user_id FROM get_network_user_ids(uid(), 2) get_network_user_ids(user_id, degree))) OR 
      (EXISTS (SELECT 1 FROM question_matches WHERE ((question_matches.question_id = questions.id) AND (question_matches.expert_id = uid()))))
    )
  );

DROP POLICY IF EXISTS "Users can view questions they're matched to or asked" ON questions;
CREATE POLICY "Users can view questions they're matched to or asked"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    is_demo = false AND (
      (asker_id = uid()) OR 
      (EXISTS (SELECT 1 FROM question_matches WHERE ((question_matches.question_id = questions.id) AND (question_matches.expert_id = uid())))) OR 
      (EXISTS (SELECT 1 FROM question_forwards WHERE ((question_forwards.question_id = questions.id) AND (question_forwards.forwarded_to = uid()))))
    )
  );