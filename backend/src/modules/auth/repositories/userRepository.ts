import prisma from '../../../config/database';
import { User } from '@ai-english-speaker/shared';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserWithPassword {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user !== null;
}

