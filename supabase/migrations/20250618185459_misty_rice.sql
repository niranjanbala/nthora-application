/*
  # AI Question Routing System

  1. New Tables
    - `questions` - User questions with AI analysis
    - `question_matches` - AI-generated expert matches
    - `question_responses` - Expert responses and interactions
    - `user_expertise` - Detailed expertise profiles with validation
    - `expertise_endorsements` - Peer endorsements for expertise
    - `question_forwards` - Forwarding chain tracking

  2. Security
    - RLS policies for privacy-focused visibility
    - Network-aware access controls
    - Forwarding chain permissions

  3. AI Integration
    - Question parsing and tagging
    - Expert matching algorithms
    - Response quality tracking
*/

-- Question status and types
CREATE TYPE question_status AS ENUM ('active', 'answered', 'closed', 'forwarded');
CREATE TYPE answer_type AS ENUM ('tactical', 'strategic', 'resource', 'introduction', 'brainstorming');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE visibility_level AS ENUM ('first_degree', 'second_degree', 'third_degree', 'public');

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asker_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  
  -- AI Analysis Results
  primary_tags text[] DEFAULT '{}',
  secondary_tags text[] DEFAULT '{}',
  expected_answer_type answer_type,
  urgency_level urgency_level DEFAULT 'medium',
  ai_summary text,
  
  -- Privacy & Visibility
  visibility_level visibility_level DEFAULT 'first_degree',
  is_anonymous boolean DEFAULT false,
  is_sensitive boolean DEFAULT false,
  
  -- Status & Metrics
  status question_status DEFAULT 'active',
  view_count integer DEFAULT 0,
  response_count integer DEFAULT 0,
  helpful_votes integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- User expertise profiles
CREATE TABLE IF NOT EXISTS user_expertise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_tag text NOT NULL,
  confidence_score decimal(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  
  -- Validation metrics
  questions_answered integer DEFAULT 0,
  helpful_responses integer DEFAULT 0,
  endorsement_count integer DEFAULT 0,
  response_rate decimal(3,2) DEFAULT 0.0,
  avg_response_time interval,
  
  -- Activity tracking
  last_active timestamptz DEFAULT now(),
  is_available boolean DEFAULT true,
  max_questions_per_week integer DEFAULT 10,
  current_week_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, expertise_tag)
);

-- Expert matches for questions
CREATE TABLE IF NOT EXISTS question_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  expert_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Matching algorithm results
  match_score decimal(4,3), -- 0.000 to 1.000
  match_reasons jsonb, -- Detailed scoring breakdown
  
  -- Match factors
  tag_relevance_score decimal(3,2),
  expertise_confidence decimal(3,2),
  response_history_score decimal(3,2),
  activity_score decimal(3,2),
  network_distance integer, -- 1st, 2nd, 3rd degree
  
  -- Status tracking
  is_notified boolean DEFAULT false,
  notified_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- Question responses
CREATE TABLE IF NOT EXISTS question_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  responder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  content text NOT NULL,
  response_type answer_type,
  
  -- Quality metrics
  helpful_votes integer DEFAULT 0,
  unhelpful_votes integer DEFAULT 0,
  is_marked_helpful boolean DEFAULT false,
  quality_score decimal(3,2),
  
  -- Visibility in forwarding chain
  visible_to uuid[] DEFAULT '{}', -- User IDs who can see this response
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expertise endorsements
CREATE TABLE IF NOT EXISTS expertise_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endorsed_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_tag text NOT NULL,
  
  endorsement_reason text,
  strength integer CHECK (strength >= 1 AND strength <= 5) DEFAULT 3,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(endorser_id, endorsed_user_id, expertise_tag)
);

-- Question forwarding chain
CREATE TABLE IF NOT EXISTS question_forwards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  forwarded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  forwarded_to uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  forward_reason text,
  network_degree integer, -- How many degrees away the forwarded_to user is
  
  created_at timestamptz DEFAULT now()
);

-- User network connections (simplified - in practice would integrate with existing connections)
CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_strength decimal(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  connection_type text, -- 'colleague', 'friend', 'professional', etc.
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, connected_user_id)
);

-- Indexes for performance
CREATE INDEX idx_questions_asker_status ON questions(asker_id, status);
CREATE INDEX idx_questions_tags ON questions USING GIN(primary_tags);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_status_expires ON questions(status, expires_at);

CREATE INDEX idx_user_expertise_user_tag ON user_expertise(user_id, expertise_tag);
CREATE INDEX idx_user_expertise_tag_confidence ON user_expertise(expertise_tag, confidence_score DESC);
CREATE INDEX idx_user_expertise_available ON user_expertise(is_available, last_active DESC);

CREATE INDEX idx_question_matches_question ON question_matches(question_id);
CREATE INDEX idx_question_matches_expert ON question_matches(expert_id);
CREATE INDEX idx_question_matches_score ON question_matches(match_score DESC);

CREATE INDEX idx_question_responses_question ON question_responses(question_id);
CREATE INDEX idx_question_responses_responder ON question_responses(responder_id);

CREATE INDEX idx_user_connections_user ON user_connections(user_id);
CREATE INDEX idx_user_connections_connected ON user_connections(connected_user_id);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expertise_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_forwards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Users can view questions they're matched to or asked"
  ON questions FOR SELECT
  TO authenticated
  USING (
    asker_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM question_matches 
      WHERE question_id = questions.id AND expert_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM question_forwards 
      WHERE question_id = questions.id AND forwarded_to = auth.uid()
    )
  );

CREATE POLICY "Members can create questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    asker_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('member', 'admin')
    )
  );

CREATE POLICY "Askers can update their own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (asker_id = auth.uid());

-- RLS Policies for user_expertise
CREATE POLICY "Users can manage their own expertise"
  ON user_expertise FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can view others' expertise for matching"
  ON user_expertise FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('member', 'admin')
    )
  );

-- RLS Policies for question_matches
CREATE POLICY "Users can view their own matches"
  ON question_matches FOR SELECT
  TO authenticated
  USING (expert_id = auth.uid());

-- RLS Policies for question_responses
CREATE POLICY "Users can view responses to questions they can see"
  ON question_responses FOR SELECT
  TO authenticated
  USING (
    responder_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM questions 
      WHERE id = question_responses.question_id AND asker_id = auth.uid()
    ) OR
    auth.uid() = ANY(visible_to)
  );

CREATE POLICY "Users can create responses to questions they're matched to"
  ON question_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    responder_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM question_matches 
      WHERE question_id = question_responses.question_id AND expert_id = auth.uid()
    )
  );

-- Function to calculate network distance between users
CREATE OR REPLACE FUNCTION calculate_network_distance(user1_id uuid, user2_id uuid)
RETURNS integer AS $$
DECLARE
  distance integer;
BEGIN
  -- Direct connection (1st degree)
  IF EXISTS (
    SELECT 1 FROM user_connections 
    WHERE (user_id = user1_id AND connected_user_id = user2_id)
    OR (user_id = user2_id AND connected_user_id = user1_id)
  ) THEN
    RETURN 1;
  END IF;
  
  -- 2nd degree connection
  IF EXISTS (
    SELECT 1 FROM user_connections uc1
    JOIN user_connections uc2 ON uc1.connected_user_id = uc2.user_id
    WHERE uc1.user_id = user1_id AND uc2.connected_user_id = user2_id
  ) THEN
    RETURN 2;
  END IF;
  
  -- 3rd degree connection (simplified - could be expanded)
  IF EXISTS (
    SELECT 1 FROM user_connections uc1
    JOIN user_connections uc2 ON uc1.connected_user_id = uc2.user_id
    JOIN user_connections uc3 ON uc2.connected_user_id = uc3.user_id
    WHERE uc1.user_id = user1_id AND uc3.connected_user_id = user2_id
  ) THEN
    RETURN 3;
  END IF;
  
  -- No connection found
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to find expert matches for a question
CREATE OR REPLACE FUNCTION find_expert_matches(
  question_id_param uuid,
  max_matches integer DEFAULT 5
)
RETURNS TABLE(
  expert_id uuid,
  match_score decimal,
  match_reasons jsonb
) AS $$
DECLARE
  question_record record;
  expert_record record;
  calculated_score decimal;
  score_breakdown jsonb;
BEGIN
  -- Get question details
  SELECT * INTO question_record FROM questions WHERE id = question_id_param;
  
  IF question_record.id IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;
  
  -- Find potential experts based on expertise tags
  FOR expert_record IN
    SELECT DISTINCT 
      ue.user_id,
      ue.expertise_tag,
      ue.confidence_score,
      ue.questions_answered,
      ue.helpful_responses,
      ue.response_rate,
      ue.is_available,
      ue.current_week_count,
      ue.max_questions_per_week
    FROM user_expertise ue
    WHERE ue.expertise_tag = ANY(question_record.primary_tags || question_record.secondary_tags)
    AND ue.is_available = true
    AND ue.current_week_count < ue.max_questions_per_week
    AND ue.user_id != question_record.asker_id
  LOOP
    -- Calculate match score (simplified algorithm)
    calculated_score := 0.0;
    score_breakdown := '{}'::jsonb;
    
    -- Tag relevance (30% weight)
    IF expert_record.expertise_tag = ANY(question_record.primary_tags) THEN
      calculated_score := calculated_score + (0.3 * expert_record.confidence_score);
      score_breakdown := score_breakdown || jsonb_build_object('tag_match', 'primary');
    ELSIF expert_record.expertise_tag = ANY(question_record.secondary_tags) THEN
      calculated_score := calculated_score + (0.15 * expert_record.confidence_score);
      score_breakdown := score_breakdown || jsonb_build_object('tag_match', 'secondary');
    END IF;
    
    -- Response history (25% weight)
    IF expert_record.questions_answered > 0 THEN
      calculated_score := calculated_score + (0.25 * LEAST(expert_record.helpful_responses::decimal / expert_record.questions_answered, 1.0));
    END IF;
    
    -- Response rate (20% weight)
    calculated_score := calculated_score + (0.2 * expert_record.response_rate);
    
    -- Availability (15% weight)
    calculated_score := calculated_score + (0.15 * (1.0 - (expert_record.current_week_count::decimal / expert_record.max_questions_per_week)));
    
    -- Network distance (10% weight) - simplified
    calculated_score := calculated_score + 0.1; -- Assume 1st degree for now
    
    -- Only return matches above threshold
    IF calculated_score >= 0.3 THEN
      RETURN QUERY SELECT 
        expert_record.user_id,
        calculated_score,
        score_breakdown;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to create question with AI analysis
CREATE OR REPLACE FUNCTION create_question_with_analysis(
  asker_id_param uuid,
  title_param text,
  content_param text,
  primary_tags_param text[] DEFAULT '{}',
  secondary_tags_param text[] DEFAULT '{}',
  expected_answer_type_param answer_type DEFAULT 'tactical',
  urgency_param urgency_level DEFAULT 'medium',
  visibility_param visibility_level DEFAULT 'first_degree',
  is_anonymous_param boolean DEFAULT false,
  is_sensitive_param boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  new_question_id uuid;
  expert_match record;
BEGIN
  -- Create the question
  INSERT INTO questions (
    asker_id, title, content, primary_tags, secondary_tags,
    expected_answer_type, urgency_level, visibility_level,
    is_anonymous, is_sensitive
  ) VALUES (
    asker_id_param, title_param, content_param, primary_tags_param, secondary_tags_param,
    expected_answer_type_param, urgency_param, visibility_param,
    is_anonymous_param, is_sensitive_param
  ) RETURNING id INTO new_question_id;
  
  -- Find and create expert matches
  FOR expert_match IN
    SELECT * FROM find_expert_matches(new_question_id, 5)
  LOOP
    INSERT INTO question_matches (
      question_id, expert_id, match_score, match_reasons,
      tag_relevance_score, expertise_confidence, network_distance
    ) VALUES (
      new_question_id, expert_match.expert_id, expert_match.match_score, expert_match.match_reasons,
      0.8, 0.7, 1 -- Simplified scores
    );
  END LOOP;
  
  RETURN new_question_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update expertise based on successful responses
CREATE OR REPLACE FUNCTION update_expertise_from_response(
  user_id_param uuid,
  question_id_param uuid,
  was_helpful boolean
)
RETURNS void AS $$
DECLARE
  question_tags text[];
  tag text;
BEGIN
  -- Get question tags
  SELECT primary_tags || secondary_tags INTO question_tags
  FROM questions WHERE id = question_id_param;
  
  -- Update expertise for each relevant tag
  FOREACH tag IN ARRAY question_tags
  LOOP
    INSERT INTO user_expertise (user_id, expertise_tag, questions_answered, helpful_responses)
    VALUES (user_id_param, tag, 1, CASE WHEN was_helpful THEN 1 ELSE 0 END)
    ON CONFLICT (user_id, expertise_tag)
    DO UPDATE SET
      questions_answered = user_expertise.questions_answered + 1,
      helpful_responses = user_expertise.helpful_responses + CASE WHEN was_helpful THEN 1 ELSE 0 END,
      confidence_score = LEAST(1.0, user_expertise.confidence_score + 0.05),
      updated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update question updated_at
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_expertise_updated_at
  BEFORE UPDATE ON user_expertise
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_responses_updated_at
  BEFORE UPDATE ON question_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();