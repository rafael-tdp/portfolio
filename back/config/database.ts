// Minimal database configuration for Adonis compatibility.
// The app uses MongoDB via Mongoose, not Lucid ORM.
// This config is kept to prevent runtime errors in Adonis internals.

const dbConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: './tmp/sqlite.db',
      },
      useNullAsDefault: true,
    },
  },
}

export default dbConfig