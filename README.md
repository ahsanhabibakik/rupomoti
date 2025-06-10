# Rupomoti - Jewelry E-commerce

A modern e-commerce platform for jewelry built with Next.js 14, TypeScript, Redux Toolkit, and Tailwind CSS.

## Features

- Modern UI with Tailwind CSS and shadcn/ui
- Cart functionality with Redux Toolkit and Redux Persist
- Authentication with NextAuth.js
- Responsive design
- Product search and filtering
- Wishlist functionality
- Admin dashboard
- Toast notifications with Sonner

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

3. Create a `.env.local` file with the following variables:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                  # Next.js app directory
├── components/          # React components
│   ├── cart/           # Cart-related components
│   ├── layout/         # Layout components
│   ├── products/       # Product-related components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── redux/              # Redux store and slices
    ├── hooks.ts        # Redux hooks
    ├── store.ts        # Redux store configuration
    └── slices/         # Redux slices
```

## Technologies Used

- Next.js 14
- TypeScript
- Redux Toolkit
- Redux Persist
- NextAuth.js
- Tailwind CSS
- shadcn/ui
- Sonner
- React Hook Form
- Zod

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
