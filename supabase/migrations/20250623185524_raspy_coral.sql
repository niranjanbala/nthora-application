/*
  # Network Activity Feed and Skill Inference System

  1. New Functions
    - `get_network_user_ids` - Get user IDs within specified network degrees
    - `update_user_expertise_from_response_quality` - Auto-add skills based on answer quality
    - `calculate_skill_confidence` - Calculate confidence score for auto-added skills

  2. New Triggers
    - `on_response_quality_update` - Trigger skill updates when response quality changes

  3. New Views
    - `network_activity_feed` - Optimized view for network activity

  4. Security
    - RLS policies for network activity access
*/

-- Function to get user IDs within specified network degrees
CREATE OR REPLACE FUNCTION get_network_user_ids(
  current_user_id uuid,
  max_degree integer DEFAULT 2
)
RETURNS TABLE(user_id uuid, degree integer) AS $$
BEGIN
  -- Return users within the specified network degrees
  RETURN QUERY
  WITH RECURSIVE network_traverse AS (
    -- Base case: direct connections (1st degree)
    SELECT 
      CASE 
        WHEN uc.user_id = current_user_id THEN uc.connected_user_id
        ELSE uc.user_id
      END as user_id,
      1 as degree
    FROM user_connections uc
    WHERE uc.user_id = current_user_id OR uc.connected_user_id = current_user_id
    
    UNION
    
    -- Recursive case: 2nd degree connections
    SELECT DISTINCT
      CASE 
        WHEN uc.user_id = nt.user_id THEN uc.connected_user_id
        ELSE uc.user_id
      END as user_id,
      nt.degree + 1
    FROM network_traverse nt
    JOIN user_connections uc ON (uc.user_id = nt.user_id OR uc.connected_user_id = nt.user_id)
    WHERE nt.degree < max_degree
    AND CASE 
      WHEN uc.user_id = nt.user_id THEN uc.connected_user_id
      ELSE uc.user_id
    END != current_user_id
    AND CASE 
      WHEN uc.user_id = nt.user_id THEN uc.connected_user_id
      ELSE uc.user_id
    END NOT IN (SELECT user_id FROM network_traverse)
  )
  SELECT DISTINCT nt.user_id, nt.degree
  FROM network_traverse nt
  WHERE nt.user_id != current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate skill confidence based on answer quality
CREATE OR REPLACE FUNCTION calculate_skill_confidence(
  helpful_votes integer,
  unhelpful_votes integer,
  quality_score decimal DEFAULT NULL,
  questions_answered integer DEFAULT 1
)
RETURNS decimal AS $$
DECLARE
  base_confidence decimal := 0.3;
  vote_ratio decimal;
  quality_bonus decimal := 0.0;
  experience_bonus decimal;
BEGIN
  -- Calculate vote ratio (helpful vs total votes)
  IF (helpful_votes + unhelpful_votes) > 0 THEN
    vote_ratio := helpful_votes::decimal / (helpful_votes + unhelpful_votes);
  ELSE
    vote_ratio := 0.5; -- Neutral if no votes
  END IF;
  
  -- Quality score bonus (if available)
  IF quality_score IS NOT NULL THEN
    quality_bonus := (quality_score - 0.5) * 0.2; -- Scale quality score impact
  END IF;
  
  -- Experience bonus (diminishing returns)
  experience_bonus := LEAST(0.2, questions_answered * 0.05);
  
  -- Calculate final confidence (capped at 0.95)
  RETURN LEAST(0.95, base_confidence + (vote_ratio * 0.4) + quality_bonus + experience_bonus);
END;
$$ LANGUAGE plpgsql;

-- Function to update user expertise from response quality
CREATE OR REPLACE FUNCTION update_user_expertise_from_response_quality(
  response_id_param uuid
)
RETURNS void AS $$
DECLARE
  response_record record;
  question_record record;
  tag text;
  new_confidence decimal;
BEGIN
  -- Get response details
  SELECT 
    qr.responder_id,
    qr.helpful_votes,
    qr.unhelpful_votes,
    qr.quality_score,
    qr.question_id
  INTO response_record
  FROM question_responses qr
  WHERE qr.id = response_id_param;
  
  IF response_record.responder_id IS NULL THEN
    RETURN; -- Response not found
  END IF;
  
  -- Get question tags
  SELECT primary_tags, secondary_tags
  INTO question_record
  FROM questions
  WHERE id = response_record.question_id;
  
  -- Process primary tags (higher weight)
  FOREACH tag IN ARRAY question_record.primary_tags
  LOOP
    -- Calculate confidence for this skill
    SELECT calculate_skill_confidence(
      response_record.helpful_votes,
      response_record.unhelpful_votes,
      response_record.quality_score,
      COALESCE((SELECT questions_answered FROM user_expertise 
                WHERE user_id = response_record.responder_id 
                AND expertise_tag = tag), 0) + 1
    ) INTO new_confidence;
    
    -- Only add skill if confidence is above threshold (0.4)
    IF new_confidence >= 0.4 THEN
      INSERT INTO user_expertise (
        user_id,
        expertise_tag,
        confidence_score,
        questions_answered,
        helpful_responses,
        is_available,
        max_questions_per_week
      ) VALUES (
        response_record.responder_id,
        tag,
        new_confidence,
        1,
        CASE WHEN response_record.helpful_votes > response_record.unhelpful_votes THEN 1 ELSE 0 END,
        true,
        5 -- Conservative default for auto-added skills
      )
      ON CONFLICT (user_id, expertise_tag)
      DO UPDATE SET
        questions_answered = user_expertise.questions_answered + 1,
        helpful_responses = user_expertise.helpful_responses + 
          CASE WHEN response_record.helpful_votes > response_record.unhelpful_votes THEN 1 ELSE 0 END,
        confidence_score = new_confidence,
        updated_at = now();
    END IF;
  END LOOP;
  
  -- Process secondary tags (lower weight)
  FOREACH tag IN ARRAY question_record.secondary_tags
  LOOP
    -- Calculate confidence for this skill (reduced weight for secondary tags)
    SELECT calculate_skill_confidence(
      response_record.helpful_votes,
      response_record.unhelpful_votes,
      response_record.quality_score * 0.7, -- Reduce impact for secondary tags
      COALESCE((SELECT questions_answered FROM user_expertise 
                WHERE user_id = response_record.responder_id 
                AND expertise_tag = tag), 0) + 1
    ) INTO new_confidence;
    
    -- Only add skill if confidence is above threshold (0.5 for secondary tags)
    IF new_confidence >= 0.5 THEN
      INSERT INTO user_expertise (
        user_id,
        expertise_tag,
        confidence_score,
        questions_answered,
        helpful_responses,
        is_available,
        max_questions_per_week
      ) VALUES (
        response_record.responder_id,
        tag,
        new_confidence,
        1,
        CASE WHEN response_record.helpful_votes > response_record.unhelpful_votes THEN 1 ELSE 0 END,
        true,
        3 -- More conservative for secondary tags
      )
      ON CONFLICT (user_id, expertise_tag)
      DO UPDATE SET
        questions_answered = user_expertise.questions_answered + 1,
        helpful_responses = user_expertise.helpful_responses + 
          CASE WHEN response_record.helpful_votes > response_record.unhelpful_votes THEN 1 ELSE 0 END,
        confidence_score = new_confidence,
        updated_at = now();
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for response quality updates
CREATE OR REPLACE FUNCTION trigger_update_expertise_from_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if quality-related fields changed
  IF (OLD.helpful_votes != NEW.helpful_votes OR 
      OLD.unhelpful_votes != NEW.unhelpful_votes OR 
      OLD.quality_score != NEW.quality_score OR
      OLD.is_marked_helpful != NEW.is_marked_helpful) THEN
    
    PERFORM update_user_expertise_from_response_quality(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_response_quality_update ON question_responses;
CREATE TRIGGER on_response_quality_update
  AFTER UPDATE ON question_responses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_expertise_from_response();

-- Create optimized view for network activity feed
CREATE OR REPLACE VIEW network_activity_feed AS
SELECT 
  'question' as activity_type,
  q.id as activity_id,
  q.asker_id as user_id,
  up.full_name as user_name,
  up.avatar_url,
  q.title,
  q.content,
  NULL as response_content,
  q.primary_tags as tags,
  q.view_count,
  q.response_count,
  q.helpful_votes,
  q.status,
  q.created_at,
  q.updated_at
FROM questions q
JOIN user_profiles up ON q.asker_id = up.id
WHERE q.status = 'active'

UNION ALL

SELECT 
  'response' as activity_type,
  qr.id as activity_id,
  qr.responder_id as user_id,
  up.full_name as user_name,
  up.avatar_url,
  q.title,
  q.content,
  qr.content as response_content,
  q.primary_tags as tags,
  q.view_count,
  q.response_count,
  qr.helpful_votes,
  q.status,
  qr.created_at,
  qr.updated_at
FROM question_responses qr
JOIN questions q ON qr.question_id = q.id
JOIN user_profiles up ON qr.responder_id = up.id;

-- Add RLS policy for network activity feed access
CREATE POLICY "Users can view network activity feed"
  ON questions FOR SELECT
  TO authenticated
  USING (
    asker_id = auth.uid() OR
    asker_id IN (
      SELECT user_id FROM get_network_user_ids(auth.uid(), 2)
    ) OR
    EXISTS (
      SELECT 1 FROM question_matches 
      WHERE question_id = questions.id AND expert_id = auth.uid()
    )
  );

-- Function to get network activity feed for a user
CREATE OR REPLACE FUNCTION get_network_activity_feed(
  current_user_id uuid,
  max_degree integer DEFAULT 2,
  limit_count integer DEFAULT 50
)
RETURNS TABLE(
  activity_type text,
  activity_id uuid,
  user_id uuid,
  user_name text,
  avatar_url text,
  title text,
  content text,
  response_content text,
  tags text[],
  view_count integer,
  response_count integer,
  helpful_votes integer,
  status question_status,
  created_at timestamptz,
  updated_at timestamptz,
  network_degree integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    naf.activity_type,
    naf.activity_id,
    naf.user_id,
    naf.user_name,
    naf.avatar_url,
    naf.title,
    naf.content,
    naf.response_content,
    naf.tags,
    naf.view_count,
    naf.response_count,
    naf.helpful_votes,
    naf.status,
    naf.created_at,
    naf.updated_at,
    COALESCE(nu.degree, 0) as network_degree
  FROM network_activity_feed naf
  LEFT JOIN get_network_user_ids(current_user_id, max_degree) nu ON naf.user_id = nu.user_id
  WHERE naf.user_id = current_user_id OR nu.user_id IS NOT NULL
  ORDER BY naf.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;