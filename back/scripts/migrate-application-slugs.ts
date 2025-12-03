#!/usr/bin/env node
/**
 * Migration script to add slug field to existing applications
 * Run with: npm run migrate:slugs
 */

import mongoose from 'mongoose'

const MONGODB_URL = process.env.MONGO_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/portfolio'

async function migrate() {
  console.log('Connecting to MongoDB...')
  try {
    await mongoose.connect(MONGODB_URL)
    console.log('✓ Connected to MongoDB')

    // Dynamic imports to avoid TypeScript resolution issues during build
    const { default: Application } = await import('../app/mongodb/models/application.js')
    const { default: Company } = await import('../app/mongodb/models/company.js')
    const { generateUniqueApplicationSlug } = await import('../app/utils/slugGenerator.js')

    console.log('\nStarting application slug migration...')

    // Find all applications without a slug
    const applicationsWithoutSlug = await Application.find({ slug: { $exists: false } })

    console.log(`Found ${applicationsWithoutSlug.length} applications without slug\n`)

    let successCount = 0
    let errorCount = 0

    for (const app of applicationsWithoutSlug) {
      try {
        // Fetch the company to get its name
        const company = await Company.findById((app as any).company).lean()
        if (!company || !(company as any).name) {
          console.warn(`⚠ Skipping application ${(app as any)._id}: company not found or has no name`)
          errorCount++
          continue
        }

        // Generate slug
        const slug = await generateUniqueApplicationSlug((company as any).name)

        // Update application with slug
        await Application.findByIdAndUpdate((app as any)._id, { slug })
        console.log(`✓ Application ${(app as any)._id.toString().slice(0, 8)}... -> slug: ${slug}`)
        successCount++
      } catch (err) {
        console.error(`✗ Error migrating application ${(app as any)._id}:`, err)
        errorCount++
      }
    }

    console.log(`\n✓ Migration complete!`)
    console.log(`  ✓ Success: ${successCount}`)
    console.log(`  ✗ Errors: ${errorCount}`)

    await mongoose.disconnect()
    console.log('✓ Disconnected from MongoDB')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

migrate()
