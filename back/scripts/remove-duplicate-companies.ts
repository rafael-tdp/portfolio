#!/usr/bin/env node
/**
 * Script to find and remove duplicate companies
 * Keeps the company with the most applications and merges applications from duplicates
 * Run with: npm run remove:duplicate-companies
 */

import mongoose from 'mongoose'

const MONGODB_URL = process.env.MONGO_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/portfolio'

async function removeDuplicates() {
  console.log('Connecting to MongoDB...')
  try {
    await mongoose.connect(MONGODB_URL)
    console.log('✓ Connected to MongoDB')

    // Dynamic imports
    const { default: Application } = await import('../app/mongodb/models/application.js')
    const { default: Company } = await import('../app/mongodb/models/company.js')

    console.log('\nFinding duplicate companies...')

    // Find all companies
    const allCompanies = await Company.find().lean()
    console.log(`Total companies: ${allCompanies.length}`)

    // Group companies by name (case-insensitive)
    const companiesByName: { [key: string]: any[] } = {}
    for (const company of allCompanies) {
      const normalizedName = (company as any).name.toLowerCase().trim()
      if (!companiesByName[normalizedName]) {
        companiesByName[normalizedName] = []
      }
      companiesByName[normalizedName].push(company)
    }

    // Find duplicates
    const duplicates = Object.entries(companiesByName)
      .filter(([, companies]) => companies.length > 1)
      .sort((a, b) => b[1].length - a[1].length)

    console.log(`\nFound ${duplicates.length} companies with duplicates:\n`)

    let totalMerged = 0
    let totalDeleted = 0

    for (const [name, companies] of duplicates) {
      console.log(`\n📋 "${name}" - ${companies.length} duplicates`)

      // Find which company has the most applications
      const companiesWithCounts = await Promise.all(
        companies.map(async (company) => {
          const count = await Application.countDocuments({ company: (company as any)._id })
          return { company, count }
        })
      )

      // Sort by application count (descending)
      companiesWithCounts.sort((a, b) => b.count - a.count)

      const mainCompany = companiesWithCounts[0].company
      const duplicateCompanies = companiesWithCounts.slice(1)

      console.log(`  ✓ Main: ${mainCompany.name} (${companiesWithCounts[0].count} applications)`)

      // Merge applications from duplicates to main company
      for (const { company: duplicateCompany, count } of duplicateCompanies) {
        console.log(`    - Merging: ${duplicateCompany.name} (${count} applications)`)

        // Update all applications from duplicate to main company
        await Application.updateMany(
          { company: (duplicateCompany as any)._id },
          { company: (mainCompany as any)._id }
        )

        // Delete the duplicate company
        await Company.findByIdAndDelete((duplicateCompany as any)._id)
        console.log(`    ✓ Deleted: ${duplicateCompany.name}`)

        totalMerged += count
        totalDeleted++
      }
    }

    console.log(`\n✓ Duplicate removal complete!`)
    console.log(`  ✓ Companies deleted: ${totalDeleted}`)
    console.log(`  ✓ Applications reassigned: ${totalMerged}`)

    await mongoose.disconnect()
    console.log('✓ Disconnected from MongoDB')
  } catch (err) {
    console.error('Script failed:', err)
    process.exit(1)
  }
}

removeDuplicates()
