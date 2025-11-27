import mongoose from 'mongoose'
import env from '#start/env'

const defaultUri = 'mongodb://127.0.0.1:27017/adonis_app'
const mongoUri = env.get('MONGO_URI') || defaultUri

let isConnected = false

export default (async function connectMongodb() {
  try {
    if (isConnected) return mongoose
    await mongoose.connect(mongoUri, {
      dbName: env.get('DB_DATABASE') || undefined,
      // useNewUrlParser, useUnifiedTopology not required on mongoose v7+
    } as mongoose.ConnectOptions)
    // Ensure model files are loaded and registered on the default mongoose instance
    try {
      // import models via the package.json import-map alias
      // do not include the .js extension here to match other imports
      await import('#models/company')
      await import('#models/user')
      // @ts-ignore - import-map alias may not be known to TypeScript
      await import('#models/application')
    } catch (e) {
      // non-fatal: models may already be imported elsewhere
    }
    isConnected = true
    console.log('✔️  MongoDB connected')
    return mongoose
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    // do not crash the process; let Adonis handle termination if needed
    return Promise.reject(err)
  }
})()
