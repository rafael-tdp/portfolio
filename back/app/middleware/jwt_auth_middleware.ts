import jwt from 'jsonwebtoken'
import env from '#start/env'
import User from '../../app/mongodb/models/user.js'

const JWT_SECRET = env.get('APP_KEY') || 'change_me'

export async function verifyAuth(ctx: any) {
  const req = ctx.request
  const authHeader = req.header ? req.header('authorization') : req.headers?.authorization
  if (!authHeader) {
    const res = ctx.response
    return res.unauthorized ? res.unauthorized({ error: 'Missing Authorization header' }) : res.status(401).send({ error: 'Missing Authorization header' })
  }

  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(payload.sub).select('-password').lean()
    if (!user) {
      return ctx.response.unauthorized({ error: 'User not found' })
    }
    // attach user to context for controllers to use
    ctx.request.user = user
    return null
  } catch (err) {
    return ctx.response.unauthorized({ error: 'Invalid token' })
  }
}
