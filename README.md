<<<<<<< HEAD
# Rupomoti E-Commerce Platform

## Overview
Rupomoti is a modern, premium jewelry e-commerce platform built with Next.js 14, Prisma, and MongoDB. It features a robust admin panel, seamless user experience, and a visually rich, jewelry-themed design.
=======
# Rupomoti - Jewelry E-commerce

A modern e-commerce platform for jewelry built with Next.js 14, TypeScript, Redux Toolkit, and Tailwind CSS.
>>>>>>> 81f1253cb8fb303049983703593359d0e3eff39f

---

<<<<<<< HEAD
## Table of Contents
1. [Core Features](#core-features)
2. [Admin Panel Features](#admin-panel-features)
3. [User-Facing Features](#user-facing-features)
4. [UI/UX & Theming](#uiux--theming)
5. [Notifications & Feedback](#notifications--feedback)
6. [Technical Details](#technical-details)
7. [Planned/Upcoming Features](#plannedupcoming-features)
8. [Developer Notes](#developer-notes)

---

## Core Features
### 1. Product Catalog
- Browse products by category, best sellers, new arrivals, and search.
- Product cards display image, name, price, and quick actions.
- Product detail page with gallery, description, price, and add-to-cart.

### 2. Categories
- Products are organized into categories (e.g., Necklaces, Rings, Earrings).
- Category pages show all products in that category.

### 3. Shopping Cart
- Add, remove, and update product quantities.
- Cart persists across sessions (local storage or user account).
- Cart summary with subtotal, discounts, and checkout button.

### 4. Checkout & Orders
- Secure checkout with address, shipping, and payment options.
- Order summary and confirmation.
- Order history for logged-in users.

### 5. User Accounts
- Registration, login, and password reset.
- Account dashboard: view orders, manage addresses, update profile.
- Account icon in navbar for quick access.

### 6. Homepage
- Premium jewelry-themed hero slider with text overlays.
- Featured categories and products.
- Testimonials, about section, newsletter signup, and more.

---

## Admin Panel Features
### 1. Dashboard
- Sales analytics, order stats, product/category counts.
- Visual charts for sales, top products, and order statuses.
- Health check for database and third-party integrations.

### 2. Product Management (CRUD)
- Add, edit, delete products.
- Upload multiple images with live preview.
- Set price, stock, category, description, and featured status.
- Toggle product visibility.

### 3. Category Management (CRUD)
- Add, edit, delete categories.
- Upload category images with preview.
- Set category descriptions.

### 4. Order Management
- View all orders with filters (status, date).
- Update order status (Pending, Processing, Shipped, Delivered, Cancelled).
- View order details, customer info, and items.
- Integrate with Steadfast API for shipment creation, tracking, and cancellation.

### 5. Customer Management
- View all registered customers.
- View customer order history and details.

### 6. Media Management
- Upload, preview, and delete images and media assets.
- Organize media for use in products, categories, and homepage.

### 7. Coupon Management
- Create, edit, delete discount coupons.
- Set coupon type (percentage/fixed), value, usage limits, and validity dates.

### 8. Settings
- Manage site-wide settings (branding, contact info, etc.).

---

## User-Facing Features
### 1. Responsive Design
- Fully responsive for mobile, tablet, and desktop.
- Modern, visually appealing layouts.

### 2. Search & Filtering
- Search bar in navbar for products.
- Filter products by category, price, and more.

### 3. Wishlist (Planned)
- Users can add products to a wishlist for later.

### 4. Newsletter Signup
- Collect emails for marketing.

### 5. Contact & About Pages
- Informational pages about the brand and contact form.

---

## UI/UX & Theming
### 1. Theme
- Premium jewelry-inspired palette: gold, deep blue, black, white, and accent colors.
- Consistent use of brand colors across all components.

### 2. Components
- Modern cards, buttons, modals, and forms.
- Skeleton loaders for data fetching.
- Empty states with illustrations and helpful messages.

### 3. Navigation
- Top navbar with logo, menu, search, cart, and account icon.
- Sidebar navigation in admin panel.

### 4. Homepage
- Hero slider with text overlays and call-to-action.
- Featured categories and products.
- Testimonials, about, and newsletter sections.

---

## Notifications & Feedback
### 1. Toast Notifications
- Success, error, and info toasts for all user and admin actions (CRUD, login, checkout, etc.).
- Consistent, non-intrusive feedback.

### 2. Modals & Dialogs
- Used for CRUD actions, confirmations, and previews.

### 3. Loading States
- Spinners and skeletons for all async actions.

### 4. Error Handling
- Friendly error messages for all failures (network, validation, etc.).
- No blank screens or crashes.

---

## Technical Details
### 1. Stack
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** MongoDB Atlas
- **Auth:** NextAuth.js
- **Image Storage:** Local or cloud (configurable)
- **3rd Party:** Steadfast API for shipping

### 2. Code Structure
- `/src/app` - All Next.js app routes (pages, API, admin)
- `/src/components` - Reusable UI components
- `/src/lib` - Utility libraries (prisma, auth, etc.)
- `/prisma` - Prisma schema and migrations

### 3. Environment Variables
- `.env` for database, auth, and API keys

### 4. Deployment
- Vercel or any Node.js-compatible host

---

## Planned/Upcoming Features
- Wishlist & Favorites
- Product Reviews & Ratings
- Advanced Filtering & Sorting
- Blog/Content Section
- Multi-language Support
- Advanced Analytics
- Push Notifications
- Gift Cards & Loyalty Points

---

## Developer Notes
- **CRUD:** All admin sections support full CRUD with modals, validation, and toasts.
- **Image Uploads:** All image fields support live preview before upload.
- **Empty States:** All lists and tables show friendly empty states if no data.
- **Error Handling:** All API and UI errors are caught and shown to the user.
- **Theming:** Update `tailwind.config.js` to change brand colors.
- **Extensibility:** Easily add new sections or features by following the existing component and API patterns.

---

## Example: Toast Notification Usage
- **On Success:**  `showToast.success('Product created successfully!')`
- **On Error:**  `showToast.error('Failed to update order.')`
- **On Info:**  `showToast.info('Loading data...')`

---

## Example: Image Upload with Preview
- Select an image file in the form.
- Preview is shown instantly before saving.
- On save, image is uploaded and URL is stored in the database.

---

## Example: CRUD Flow (Product)
1. **Create:** Click "Add Product" → Fill form → Upload images → Submit → Success toast.
2. **Read:** Products table shows all products, paginated.
3. **Update:** Click "Edit" on a product → Update fields/images → Submit → Success toast.
4. **Delete:** Click "Delete" → Confirm in modal → Success toast.

---

## Example: Empty State
- If no products exist:  "No products found. Click 'Add Product' to get started!" (with illustration)

---

## Example: Error Handling
- If API fails:  "Failed to fetch orders. Please try again later." (with error toast)

---

## Example: Homepage Sections
- **Hero Slider:** Premium images, text overlays, CTA button.
- **Featured Categories:** Grid of top categories.
- **Featured Products:** Carousel or grid.
- **Testimonials:** Customer reviews.
- **About:** Brand story.
- **Newsletter:** Signup form.

---

## Example: Theme Colors
- **Primary:** Gold (`#D4AF37`)
- **Secondary:** Deep Blue (`#1A237E`)
- **Accent:** Black, White, Soft Gray

---

## Contribution & Customization
- Update theme in `tailwind.config.js`.
- Add new features by creating new components and API routes.
- Follow existing patterns for consistency.

---

**This documentation will grow as features are added. For any new feature, document:**
- What it does
- How it works (user/admin)
- Where to find it in the codebase
- How to customize or extend it
=======
- Modern UI with Tailwind CSS and shadcn/ui
- Cart functionality with Redux Toolkit and Redux Persist
- Authentication with NextAuth.js
- Responsive design
- Product search and filtering
- Wishlist functionality
- Admin dashboard
- Toast notifications with Sonner
>>>>>>> 81f1253cb8fb303049983703593359d0e3eff39f

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
