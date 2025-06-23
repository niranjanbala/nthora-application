import { supabase } from '../lib/supabase';

export interface NetworkActivity {
  activity_type: 'question' | 'response';
  activity_id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  title: string;
  content: string;
  response_content?: string;
  tags: string[];
  view_count: number;
  response_count: number;
  helpful_votes: number;
  status: string;
  created_at: string;
  updated_at: string;
  network_degree: number;
}

export interface NetworkUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  expertise_areas: string[];
  network_degree: number;
  mutual_connections: number;
}

/**
 * Get network activity feed for the current user
 * Shows questions and answers from users in the network up to specified degree
 */
export async function getNetworkActivityFeed(
  maxDegree: number = 2,
  limit: number = 50
): Promise<NetworkActivity[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase.rpc(
      'get_network_activity_feed',
      {
        current_user_id: user.user.id,
        max_degree: maxDegree,
        limit_count: limit
      }
    );

    if (error) {
      console.error('Error fetching network activity feed:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNetworkActivityFeed:', error);
    return [];
  }
}

/**
 * Get users within the specified network degrees
 */
export async function getNetworkUsers(
  maxDegree: number = 2,
  limit: number = 50
): Promise<NetworkUser[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    // First get the network user IDs
    const { data: networkUserIds, error: networkError } = await supabase.rpc(
      'get_network_user_ids',
      {
        current_user_id: user.user.id,
        max_degree: maxDegree
      }
    );

    if (networkError) {
      console.error('Error fetching network user IDs:', networkError);
      return [];
    }

    if (!networkUserIds || networkUserIds.length === 0) {
      return [];
    }

    // Then get the user profiles for those IDs
    const userIds = networkUserIds.map(u => u.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, full_name, avatar_url, expertise_areas')
      .in('id', userIds)
      .limit(limit);

    if (profilesError) {
      console.error('Error fetching network user profiles:', profilesError);
      return [];
    }

    // Create a map of user_id to degree
    const degreeMap = new Map(networkUserIds.map(u => [u.user_id, u.degree]));

    // Calculate mutual connections (simplified - in a real app this would be more complex)
    const mutualConnectionsMap = new Map();
    networkUserIds.forEach(u => {
      // For this example, we'll use a simple formula based on degree
      // In a real app, you'd query the actual mutual connections
      const mutualCount = u.degree === 1 ? 
        Math.floor(Math.random() * 10) + 3 : // 1st degree: 3-12 mutual connections
        Math.floor(Math.random() * 5) + 1;   // 2nd degree: 1-5 mutual connections
      
      mutualConnectionsMap.set(u.user_id, mutualCount);
    });

    // Combine the data
    return (profiles || []).map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      expertise_areas: profile.expertise_areas || [],
      network_degree: degreeMap.get(profile.id) || 0,
      mutual_connections: mutualConnectionsMap.get(profile.id) || 0
    }));
  } catch (error) {
    console.error('Error in getNetworkUsers:', error);
    return [];
  }
}

/**
 * Get auto-detected skills for the current user
 * These are skills inferred from high-quality answers
 */
export async function getAutoDetectedSkills(): Promise<{
  skill: string;
  confidence: number;
  questions_answered: number;
  helpful_votes: number;
  is_user_added: boolean;
}[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from('user_expertise')
      .select('*')
      .eq('user_id', user.user.id)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('Error fetching auto-detected skills:', error);
      return [];
    }

    return (data || []).map(skill => ({
      skill: skill.expertise_tag,
      confidence: skill.confidence_score,
      questions_answered: skill.questions_answered,
      helpful_votes: skill.helpful_responses,
      is_user_added: skill.questions_answered === 0 // If questions_answered is 0, it was manually added
    }));
  } catch (error) {
    console.error('Error in getAutoDetectedSkills:', error);
    return [];
  }
}

/**
 * Remove an auto-detected skill
 */
export async function removeAutoDetectedSkill(
  skillTag: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('user_expertise')
      .delete()
      .eq('user_id', user.user.id)
      .eq('expertise_tag', skillTag);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to remove skill' };
  }
}

/**
 * Update auto-detected skill settings
 */
export async function updateAutoDetectedSkill(
  skillTag: string,
  isAvailable: boolean = true,
  maxQuestionsPerWeek: number = 5
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('user_expertise')
      .update({
        is_available: isAvailable,
        max_questions_per_week: maxQuestionsPerWeek,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.user.id)
      .eq('expertise_tag', skillTag);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update skill' };
  }
}