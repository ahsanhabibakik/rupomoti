import type { NextApiRequest, NextApiResponse } from 'next'

const COURIER_WEBHOOK_TOKEN = process.env.COURIER_WEBHOOK_TOKEN // Store securely

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')

  if (token !== COURIER_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Process webhook payload here
  // Example: update order status, log event, etc.
  // req.body contains the webhook data

  res.status(200).json({ success: true })
} 