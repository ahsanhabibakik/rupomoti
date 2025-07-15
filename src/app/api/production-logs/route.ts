import { NextResponse } from 'next/server'

// Production-ready logging utility
class ProductionLogger {
  static log(level: 'info' | 'error' | 'warn' | 'debug', message: string, data?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      environment: process.env.NODE_ENV,
      url: process.env.VERCEL_URL || 'local'
    }
    
    // Console log for Vercel logs
    console.log(JSON.stringify(logEntry))
    
    return logEntry
  }
  
  static info(message: string, data?: Record<string, unknown>) {
    return this.log('info', message, data)
  }
  
  static error(message: string, data?: Record<string, unknown>) {
    return this.log('error', message, data)
  }
}

// API endpoint for viewing logs
export async function GET() {
  try {
    ProductionLogger.info('Log viewer accessed')
    
    return NextResponse.json({
      message: 'Check Vercel Function Logs for detailed logging',
      instructions: [
        '1. Go to Vercel Dashboard',
        '2. Select your project (rupomoti)',
        '3. Go to Functions tab',
        '4. Click on any function',
        '5. View Logs section'
      ]
    })
  } catch (error) {
    ProductionLogger.error('Log viewer error', { error })
    return NextResponse.json({ error: 'Failed to access log viewer' }, { status: 500 })
  }
}
