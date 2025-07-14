# 📦 Prisma + Next.js + Vercel Deployment Guide
## 📚 Table of Contents

- [Common Errors](#-common-errors-on-vercel)
- [Fix Guide](#-full-fix-guide)
- [Environment Variables Setup](#5-environment-variables-in-vercel)
- [Database Suggestions](#6-use-a-persistent-db-not-sqlite)
- [Prisma Client Setup](#7-setup-libprismats)
- [Folder Structure Example](#8-folder-structure-example)
- [Final Checklist](#9-final-checklist)
- [Deployment Commands](#-deploy)
- [Local Testing](#-local-test-before-push)
- [Bonus Tips](#-bonus-tips)
- [Contributing](#-contributing)

This README covers all common Prisma + Next.js issues when deploying on **Vercel** and how to fix them step-by-step.

---

## 🚫 Common Errors on Vercel - ✨ Updated 2025

- `PrismaClientInitializationError`
- `Error: Cannot find module '.prisma/client/index.js'`
- `Query engine library for current platform not found`
- `Prisma Client is unable to run in Edge Runtime`
- **🆕 NEW**: `Query Engine for runtime "rhel-openssl-3.0.x" not found` ← **Most common 2025 error**

---

## ✅ Full Fix Guide

### 1. Install Prisma & Client as Production Dependencies - ✨ 2025 Critical

```bash
# Move these to dependencies, NOT devDependencies
npm install prisma @prisma/client
# OR
pnpm add prisma @prisma/client
```

> ⚠️ **Critical**: Don't put them in `devDependencies`! Vercel needs them in production.

**Fix package.json structure:**
```json
{
  "dependencies": {
    "prisma": "^6.11.1",
    "@prisma/client": "^6.11.1"
  },
  "devDependencies": {
    // Other dev deps, but NOT Prisma
  }
}
```

---

### 2. Add Postinstall Script in `package.json`

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

### 3. Update `schema.prisma` - ✨ 2025 Updated

✅ Use Binary Targets for Vercel Engine Compatibility (Updated for latest runtimes):

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "rhel-openssl-1.1.x", "debian-openssl-3.0.x", "debian-openssl-1.1.x", "linux-musl", "linux-arm64-openssl-3.0.x"]
}
```

> ⚠️ **Critical Fix for 2025**: The `rhel-openssl-3.0.x` target is now required for Vercel's updated infrastructure!

---

### 4. Avoid Edge Runtime for Prisma

In your API route or server file:

```ts
export const config = {
  runtime: 'nodejs', // ✅ Not edge
};
```

---

### 5. Environment Variables in Vercel

Go to **Vercel > Project > Settings > Environment Variables**:

| Name              | Example Value                                |
|-------------------|-----------------------------------------------|
| `DATABASE_URL`    | `postgresql://user:pass@host:5432/dbname`     |
| `NEXT_PUBLIC_API` | `https://yourdomain.vercel.app/api`          |

---

### 6. Use a Persistent DB (not SQLite)

SQLite doesn't work well on serverless. Use:

✅ [Neon](https://neon.tech)  
✅ [PlanetScale](https://planetscale.com)  
✅ [Railway](https://railway.app)

---

### 7. Setup `lib/prisma.ts`

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

### 8. Folder Structure Example

```
/prisma/schema.prisma
/lib/prisma.ts
/app/api/...
```

---

### 9. Final Checklist

- [x] Installed Prisma & Client in dependencies  
- [x] Added `postinstall` script  
- [x] Updated `schema.prisma` with `binaryTargets`  
- [x] Avoided edge runtime in API routes  
- [x] Set proper environment variables in Vercel  
- [x] Using external DB (Postgres, etc)

---

## ✅ Deploy

```bash
git add .
git commit -m "fix: prisma vercel deployment setup"
git push
```

---

## 🧪 Local Test Before Push

```bash
npx prisma generate
npx prisma validate
```

---

## 📌 Bonus Tips

- Use `.env.local` for local and Vercel env vars separately.
- Use Vercel logs to debug (`Deployments > View Functions Logs`)
- Avoid deploying with `vercel --prod` until local works.

---

## 🔧 2025 Specific Optimizations

### Performance Improvements

**1. Next.js Config Optimizations:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@prisma/client'],
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
}
```

**2. Force Node.js Runtime for API Routes:**
```typescript
// Add to any API route using Prisma
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

**3. Vercel Function Configuration:**
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  }
}
```

---

## 🚨 Troubleshooting 2025 Issues

### Issue: `rhel-openssl-3.0.x` Error
**Solution:** Update your binary targets in `schema.prisma`:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "debian-openssl-3.0.x"]
}
```

### Issue: Prisma in devDependencies
**Solution:** Move to dependencies in `package.json`:
```bash
pnpm remove -D @prisma/client prisma
pnpm add @prisma/client prisma
```

### Issue: Missing postinstall script
**Solution:** Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## 📊 Deployment Success Checklist 2025

- [ ] ✅ Prisma packages in `dependencies` (not devDependencies)
- [ ] ✅ Binary targets include `rhel-openssl-3.0.x`
- [ ] ✅ `postinstall` script added to package.json
- [ ] ✅ API routes use `runtime = 'nodejs'`
- [ ] ✅ Vercel functions configured for Node.js 20.x
- [ ] ✅ Environment variables set in Vercel dashboard
- [ ] ✅ External database (MongoDB/PostgreSQL) configured
- [ ] ✅ Local build passes before deployment

---

## 🛡️ Production Optimization

### Database Connection Optimization
```typescript
// lib/prisma.ts - Optimized for Vercel
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Error Handling Template
```typescript
// API route error handling
export async function GET() {
  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API_ERROR]:', error)
    
    if (error instanceof Error && error.message.includes('Query engine')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: 'Prisma engine issue' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🤝 Contributing

Found a new Prisma + Vercel issue or have a better fix?

📚 **Helpful Links:**
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel Example: https://github.com/prisma/prisma-examples/tree/latest/deployment-platforms/vercel

We welcome contributions! Here's how you can help:

### 🐛 Found a Bug or Error?

1. Open an [Issue](https://github.com/your-username/your-repo/issues)  
2. Describe the error, steps to reproduce, and your fix (if any)

### 💡 Want to Improve the Guide?

1. Fork the repo  
2. Create a new branch  
   ```bash
   git checkout -b fix/my-new-tip
   ```  
3. Make your changes to `README.md`  
4. Commit & Push  
   ```bash
   git commit -m "docs: added fix for [your-topic]"
   git push origin fix/my-new-tip
   ```  
5. Create a Pull Request

---

### 📝 Contribution Rules

- Keep explanations clear and beginner-friendly  
- Use proper markdown formatting  
- Add comments or references (if needed)  
- Only submit tested fixes!

---

🔐 All contributions will be reviewed and merged as appropriate.

Thank you for helping improve this guide! 🙏