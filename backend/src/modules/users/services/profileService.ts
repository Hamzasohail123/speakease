import { UserProfile, ERROR_MESSAGES } from '@ai-english-speaker/shared';
import {
  createProfile,
  getProfileByUserId,
  updateProfile,
  profileExists,
  upsertProfile,
  UpdateProfileData,
} from '../repositories/profileRepository';
import { UpdateProfileInput, UpdateContextInput } from '../validators/profileValidators';
import { AppError } from '../../../middleware/errorHandler';

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  let profile = await getProfileByUserId(userId);

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await createProfile({
      userId,
      bio: undefined,
      goals: [],
    });
  }

  return profile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserProfile> {
  const exists = await profileExists(userId);

  if (!exists) {
    // Create profile if it doesn't exist
    return await createProfile({
      userId,
      bio: input.bio,
      goals: input.goals,
    });
  }

  // Update existing profile
  const updateData: UpdateProfileData = {
    ...(input.bio !== undefined && { bio: input.bio }),
    ...(input.goals !== undefined && { goals: input.goals }),
  };

  return await updateProfile(userId, updateData);
}

/**
 * Update user context (bio and goals)
 */
export async function updateUserContext(
  userId: string,
  input: UpdateContextInput
): Promise<UserProfile> {
  // Upsert profile (create if doesn't exist, update if exists)
  return await upsertProfile(userId, {
    userId,
    bio: input.bio,
    goals: input.goals,
  });
}

/**
 * Add document to profile (future feature)
 */
export async function addDocumentToProfile(
  userId: string,
  documentUrl: string,
  documentName: string
): Promise<UserProfile> {
  const profile = await getProfileByUserId(userId);

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  // Add document to documents array
  const updatedDocuments = [...(profile.documents || []), documentUrl];

  return await updateProfile(userId, {
    documents: updatedDocuments,
  });
}

