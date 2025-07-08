/**
 * Environment variable validation and configuration
 */

function validateEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue
  if (!value) {
    console.warn(`Warning: Environment variable ${name} is not set`)
    return ''
  }
  return value
}

export const env = {
  // Database
  DATABASE_URL: validateEnvVar('DATABASE_URL'),
  
  // NextAuth
  NEXTAUTH_URL: validateEnvVar('NEXTAUTH_URL', 'http://localhost:3000'),
  NEXTAUTH_SECRET: validateEnvVar('NEXTAUTH_SECRET'),
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Optional services
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Courier services
  PATHAO_CLIENT_ID: process.env.PATHAO_CLIENT_ID,
  PATHAO_CLIENT_SECRET: process.env.PATHAO_CLIENT_SECRET,
  STEADFAST_API_KEY: process.env.STEADFAST_API_KEY,
  STEADFAST_SECRET_KEY: process.env.STEADFAST_SECRET_KEY,
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
}

// Validate critical environment variables in production
if (typeof window === 'undefined' && env.NODE_ENV === 'production') {
  const criticalVars = ['DATABASE_URL', 'NEXTAUTH_SECRET']
  
  for (const varName of criticalVars) {
    if (!env[varName as keyof typeof env]) {
      console.error(`Critical environment variable ${varName} is missing in production`)
    }
  }
}
