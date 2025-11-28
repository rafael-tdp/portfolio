import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../../mongodb/models/user.js'
import env from '#start/env'

const JWT_SECRET = env.get('APP_KEY') || 'change_me'
const TOKEN_EXPIRY = '14d' // 2 weeks

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const { email, password, fullName } = request.only(['email', 'password', 'fullName'])
    if (!email || !password) {
      return response.badRequest({ error: 'email and password are required' })
    }

    const existing = await User.findOne({ email }).lean()
    if (existing) return response.conflict({ error: 'User already exists' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hash, fullName })

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
    return response.created({ user: { id: user._id, email: user.email, fullName: user.fullName }, token })
  }

  public async login({ request, response }: HttpContextContract) {
    const { email, password } = request.only(['email', 'password'])
    if (!email || !password) return response.badRequest({ error: 'email and password required' })

    const user = await User.findOne({ email })
    if (!user) return response.unauthorized({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password || '')
    if (!valid) return response.unauthorized({ error: 'Invalid credentials' })

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
    return response.ok({ user: { id: user._id, email: user.email, fullName: user.fullName }, token })
  }

  public async me({ request, response }: HttpContextContract) {
    const authHeader = request.header('authorization')
    if (!authHeader) return response.unauthorized({ error: 'Missing Authorization header' })
    const token = authHeader.replace('Bearer ', '')
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any
      const user = await User.findById(payload.sub).select('-password')
      if (!user) return response.unauthorized({ error: 'User not found' })
      return response.ok({ user })
    } catch (err) {
      return response.unauthorized({ error: 'Invalid token' })
    }
  }
}
