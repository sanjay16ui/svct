export const requireAuth = (req, res, next) => {
  let user = null
  try {
    user = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null
  } catch {
    user = null
  }
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })
  req.user = user
  next()
}

export const requireAdmin = (req, res, next) => {
  let user = null
  try {
    user = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null
  } catch {
    user = null
  }
  if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access only' })
  req.user = user
  next()
}
