/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  // MongoDB
  MONGO_URI: Env.schema.string.optional(),

  // Google AI
  GOOGLE_API_KEY: Env.schema.string.optional(),

  // Google Cloud Storage
  GCS_PROJECT_ID: Env.schema.string.optional(),
  GCS_BUCKET_NAME: Env.schema.string.optional(),
  GCS_KEY_FILE: Env.schema.string.optional(),
  GCS_CREDENTIALS: Env.schema.string.optional(),
})
