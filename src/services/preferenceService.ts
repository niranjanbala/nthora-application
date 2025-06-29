import { supabase } from '../lib/supabase';

export interface UserPreferences {
  networkFeed?: {
    maxDegree?: number;
    filterType?: 'all' | 'questions' | 'answers';
    filterDegree?: number | null;
    sortOrder?: 'newest' | 'popular' | 'relevant';
    showTags?: string[];
    hideTags?: string[];
    autoRefresh?: boolean;
    refreshInterval?: number;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    questionMatches?: boolean;
    responses?: boolean;
    mentions?: boolean;
    networkActivity?: boolean;
  };
  privacy?: {
    defaultVisibility?: 'first_degree' | 'second_degree' | 'third_degree';
    defaultAnonymous?: boolean;
    allowProfileView?: 'everyone' | 'connections' | 'nobody';
  };
  expertise?: {
    defaultMaxQuestionsPerWeek?: number;
    autoDetectSkills?: boolean;
    showConfidenceScores?: boolean;
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  networkFeed: {
    maxDegree: 2,
    filterType: 'all',
    filterDegree: null,
    sortOrder: 'newest',
    showTags: [],
    hideTags: [],
    autoRefresh: false,
    refreshInterval: 5 // minutes
  },
  notifications: {
    email: true,
    push: true,
    questionMatches: true,
    responses: true,
    mentions: true,
    networkActivity: true
  },
  privacy: {
    defaultVisibility: 'first_degree',
    defaultAnonymous: false,
    allowProfileView: 'everyone'
  },
  expertise: {
    defaultMaxQuestionsPerWeek: 10,
    autoDetectSkills: true,
    showConfidenceScores: true
  }
};

/**
 * Get user preferences from Supabase
 * @param userId Optional user ID (defaults to current user)
 * @returns User preferences or default preferences if none exist
 */
export async function getPreferences(userId?: string): Promise<UserPreferences> {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('No authenticated user found');
        return DEFAULT_PREFERENCES;
      }
      userId = user.user.id;
    }

    // Get preferences from database
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no record found, return defaults
      if (error.code === 'PGRST116') {
        return DEFAULT_PREFERENCES;
      }
      console.error('Error fetching preferences:', error);
      return DEFAULT_PREFERENCES;
    }

    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_PREFERENCES,
      ...data.preferences
    };
  } catch (error) {
    console.error('Error in getPreferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update user preferences in Supabase
 * @param newPreferences New preferences to save
 * @param userId Optional user ID (defaults to current user)
 * @returns Success status and error message if applicable
 */
export async function updatePreferences(
  newPreferences: Partial<UserPreferences>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Not authenticated' };
      }
      userId = user.user.id;
    }

    // Get current preferences
    const currentPreferences = await getPreferences(userId);
    
    // Deep merge the new preferences with current ones
    const mergedPreferences = deepMerge(currentPreferences, newPreferences);

    // Upsert preferences
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences: mergedPreferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updatePreferences:', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}

/**
 * Deep merge two objects
 * @param target Target object
 * @param source Source object to merge into target
 * @returns Merged object
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Check if value is an object
 * @param item Value to check
 * @returns True if object, false otherwise
 */
function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}