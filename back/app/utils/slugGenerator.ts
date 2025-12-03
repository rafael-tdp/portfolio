import { nanoid } from 'nanoid'
import Application from '../mongodb/models/application.js'

/**
 * Generate a unique slug for an application based on company name and nanoid
 * Format: {company-name}-{random}
 */
export function generateApplicationSlug(companyName: string): string {
  const baseSlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
  return `${baseSlug}-${nanoid(6)}`
}

/**
 * Generate and ensure a unique slug exists in the database
 * Will retry if slug already exists
 */
export async function generateUniqueApplicationSlug(companyName: string): Promise<string> {
  let slug = generateApplicationSlug(companyName)
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Check if slug already exists
    const existing = await Application.findOne({ slug })
    if (!existing) {
      return slug
    }
    // Slug exists, generate a new one
    slug = generateApplicationSlug(companyName)
    attempts++
  }

  throw new Error(`Failed to generate unique slug after ${maxAttempts} attempts`)
}
