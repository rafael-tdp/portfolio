// This file used to be a Lucid model. After migrating to MongoDB we
// re-export the Mongoose model so any imports of `app/models/user` keep
// working during the migration.
import User from '../mongodb/models/user.js'
export default User