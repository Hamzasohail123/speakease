import prisma from '../../../config/database';
import { UserProfile } from '@ai-english-speaker/shared';

export interface CreateProfileData {
  userId: string;
  bio?: string;
  goals?: string[];
}

export interface UpdateProfileData {
  bio?: string;
  goals?: string[];
  documents?: string[];
}

/**
 * Create a user profile
 */
export async function createProfile(data: CreateProfileData): Promise<UserProfile> {
  const profile = await prisma.userProfile.create({
    data: {
      userId: data.userId,
      bio: data.bio,
      goals: data.goals || [],
      documents: [],
    },
    select: {
      id: true,
      userId: true,
      bio: true,
      goals: true,
      documents: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...profile,
    bio: profile.bio ?? undefined,
  };
}

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      bio: true,
      goals: true,
      documents: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!profile) return null;

  return {
    ...profile,
    bio: profile.bio ?? undefined,
  };
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile> {
  const profile = await prisma.userProfile.update({
    where: { userId },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.goals !== undefined && { goals: data.goals }),
      ...(data.documents !== undefined && { documents: data.documents }),
    },
    select: {
      id: true,
      userId: true,
      bio: true,
      goals: true,
      documents: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...profile,
    bio: profile.bio ?? undefined,
  };
}

/**
 * Check if profile exists for user
 */
export async function profileExists(userId: string): Promise<boolean> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  return profile !== null;
}

/**
 * Create or update profile (upsert)
 */
export async function upsertProfile(
  userId: string,
  data: CreateProfileData
): Promise<UserProfile> {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.goals !== undefined && { goals: data.goals }),
    },
    create: {
      userId: data.userId,
      bio: data.bio,
      goals: data.goals || [],
      documents: [],
    },
    select: {
      id: true,
      userId: true,
      bio: true,
      goals: true,
      documents: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...profile,
    bio: profile.bio ?? undefined,
  };
}

