/*
  # Add Response Source Type

  1. Changes
    - Create a new enum type `response_source_type` with values 'human' and 'agentic_human'
    - Add a new column `source_type` to the `question_responses` table
    - Add a new column `quality_level` to the `question_responses` table for agentic responses

  2. Security
    - No changes to RLS policies needed as this is just adding columns to existing table
*/

-- Create response source type enum
CREATE TYPE response_source_type AS ENUM ('human', 'agentic_human');

-- Add source_type column to question_responses table
ALTER TABLE question_responses 
ADD COLUMN IF NOT EXISTS source_type response_source_type DEFAULT 'human';

-- Add quality_level column to question_responses table
-- This will be used to track the quality level of agentic responses
ALTER TABLE question_responses
ADD COLUMN IF NOT EXISTS quality_level text;

-- Add comment to document the columns
COMMENT ON COLUMN question_responses.source_type IS 'Indicates whether the response is from a human or an AI agent mimicking a human';
COMMENT ON COLUMN question_responses.quality_level IS 'For agentic responses, indicates the quality level (low, medium, high)';