# Rupomoti - Pearl Jewelry E-commerce

A modern e-commerce platform for pearl jewelry built with Next.js, TypeScript, and Prisma.

## Features

- User authentication with email/password and Google OAuth
- Product catalog with categories
- Shopping cart functionality
- Order management
- User reviews and ratings
- Wishlist functionality
- Responsive design

## Tech Stack

- Next.js 15
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js
- Tailwind CSS 4
- Framer Motion

## Prerequisites

- Node.js 18+
- PostgreSQL
- Google OAuth credentials (for Google Sign-in)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rupomoti.git
cd rupomoti
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rupomoti"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
rupomoti/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── (auth)/
│   │   └── (shop)/
│   ├── components/
│   ├── lib/
│   └── middleware.ts
├── public/
├── .env
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Steadfast Courier](https://steadfast.com.bd/)
- [Cloudinary](https://cloudinary.com/)
- [Prisma](https://www.prisma.io/)

  
