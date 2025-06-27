import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

const SECRET = process.env.PATHAO_WEBHOOK_SECRET!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Verify the integration check call
  if (req.method === 'POST' && req.body.event === 'webhook_integration') {
    res.setHeader('X-Pathao-Merchant-Webhook-Integration-Secret', SECRET)
    return res.status(202).json({ status: 'success' })
  }

  // 2) Verify signature if provided (optional)
  // const signature = req.headers['x-pathao-signature'] as string
  // const hash = crypto.createHmac('sha256', SECRET).update(JSON.stringify(req.body)).digest('hex')
  // if (signature !== hash) return res.status(401).end()

  // 3) Handle real events
  const { event, consignment_id, status, ...rest } = req.body

  switch (event) {
    case 'Order Created':
      // mark order in DB as “created”
      break
    case 'Delivered':
      // update DB to delivered
      break
    // …and so on
    default:
      console.warn('Unhandled Pathao event:', event)
  }

  // Ack
  res.setHeader('X-Pathao-Merchant-Webhook-Integration-Secret', SECRET)
  return res.status(202).json({ status: 'received' })
}
