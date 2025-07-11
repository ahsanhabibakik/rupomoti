# Critical Prisma Import Paths

This report identifies the critical Prisma imports that need to be fixed for the migration.

## API Routes (Critical)

These are API routes that need to be converted to use Mongoose:

      6 src/app/api/admin/products/[id]/landing-page/[action]/route.ts:      const updatedProduct = await prisma.product.update({
      4 src/app/api/admin/reports/route.ts:        prisma.order.count({
      3 src/app/api/categories/route-prisma-backup.ts:    const user = await prisma.user.findUnique({
      3 src/app/api/admin/reports/route.ts:          prisma.user.count({
      3 src/app/api/admin/products/[id]/landing-page/route.ts:    const updatedProduct = await prisma.product.update({
      3 src/app/api/admin/coupons/route.ts:    await prisma.auditLog.create({
      3 src/app/api/account/two-factor/route.ts:      await prisma.user.update({
      2 src/app/api/test-edge/route.ts:    await prisma.$disconnect()
      2 src/app/api/settings/route.ts:    let settings = await prisma.userSetting.findUnique({
      2 src/app/api/settings/route.ts:      settings = await prisma.userSetting.create({
      2 src/app/api/payment-methods/route.ts:    const existingPaymentMethod = await prisma.userPaymentMethod.findFirst({
      2 src/app/api/orders/[orderId]/route.ts:    const updatedOrder = await prisma.order.update({
      2 src/app/api/orders/[orderId]/route.ts:          await prisma.user.update({
      2 src/app/api/categories/route-prisma-backup.ts:    const existingCategory = await prisma.category.findUnique({
      2 src/app/api/categories/route-prisma-backup.ts:      const parentCategory = await prisma.category.findUnique({
      2 src/app/api/categories/[id]/route.ts:    const user = await prisma.user.findUnique({
      2 src/app/api/admin/reports/route.ts:        prisma.product.findMany({
      2 src/app/api/admin/reports/route.ts:        prisma.product.count({
      2 src/app/api/admin/reports/route.ts:        prisma.orderItem.groupBy({
      2 src/app/api/admin/reports/route.ts:          const products = await prisma.product.findMany({

## Auth Related Files (Critical)

These authentication files need to be updated to use Mongoose:


## Files with Most Prisma Imports

These files have the most Prisma imports and should be prioritized:

     24 src/app/api/admin/reports/route.ts
     20 src/lib/db.ts
     15 src/app/api/categories/route-prisma-backup.ts
     14 src/app/api/admin/coupons/route.ts
     13 src/app/api/admin/products/route.ts
     12 src/app/api/admin/products/[id]/landing-page/[action]/route.ts
     11 src/lib/stock-manager.ts
     11 src/lib/returns.ts
     11 src/lib/prisma-init.ts
     11 src/app/api/admin/categories/route.ts
     10 src/app/api/admin/users/route.ts
     10 src/app/api/admin/orders/route-new.ts
     10 src/app/api/admin/media/route.ts
     10 src/app/api/admin/debug/route.ts
      9 src/lib/inventory.ts
      9 src/app/api/test-db/route.ts
      9 src/app/api/categories/[id]/route.ts
      8 src/lib/prisma.ts
      8 src/app/api/products/stock/route.ts
      8 src/app/api/orders/route.ts

## Type Imports from Prisma

These files are importing types from @prisma/client:

      1 src/lib/stock-manager.ts:import { PrismaClient } from '@prisma/client';
      1 src/lib/shipping.ts:import { PrismaClient } from '@prisma/client'
      1 src/lib/search-utils.ts:import { Product } from '@prisma/client'
      1 src/lib/returns.ts:import { PrismaClient } from '@prisma/client'
      1 src/lib/prisma-init.ts:import { PrismaClient } from '@prisma/client'
      1 src/lib/prisma.ts:import { PrismaClient } from '@prisma/client'
      1 src/lib/order-tracking.ts:import { PrismaClient } from '@prisma/client'
      1 src/lib/optimized-stock-manager.ts:import { PrismaClient } from '@prisma/client';
      1 src/lib/inventory.ts:import { PrismaClient } from '@prisma/client'
      1 src/lib/db.ts:import { PrismaClient } from '@prisma/client'
      1 src/lib/actions/order-actions.ts:import { Prisma } from "@prisma/client";
      1 src/lib/actions/order-actions.ts:import { OrderStatus } from "@prisma/client";
      1 src/components/admin/ShipNowButton.tsx:import { Order } from '@prisma/client';
      1 src/components/admin/NewsletterClient.tsx:import { NewsletterSubscription, NewsletterTag } from '@prisma/client'
      1 src/app/shop/page.tsx:import { Category } from '@prisma/client'
      1 src/app/products/[slug]/_components/add-to-cart-button.tsx:import { Product } from '@prisma/client'
      1 src/app/product/[slug]/_components/product-landing-page.tsx:import { type Prisma } from '@prisma/client'
      1 src/app/product/[slug]/_components/product-details.tsx:import { type Prisma } from '@prisma/client'
      1 src/app/product/[slug]/_components/add-to-cart-button.tsx:import { type Prisma } from '@prisma/client'
      1 src/app/new-arrivals/page.tsx:import { PrismaClient } from '@prisma/client'

## Direct Prisma Client Usage

These files directly use the Prisma client and need to be converted to Mongoose:

      6 src/app/api/admin/products/[id]/landing-page/[action]/route.ts:      const updatedProduct = await prisma.product.update({
      4 src/app/api/admin/reports/route.ts:        prisma.order.count({
      3 src/app/api/categories/route-prisma-backup.ts:    const user = await prisma.user.findUnique({
      3 src/app/api/admin/reports/route.ts:          prisma.user.count({
      3 src/app/api/admin/products/[id]/landing-page/route.ts:    const updatedProduct = await prisma.product.update({
      3 src/app/api/admin/coupons/route.ts:    await prisma.auditLog.create({
      3 src/app/api/account/two-factor/route.ts:      await prisma.user.update({
      2 src/lib/stock-manager.ts:    return await prisma.product.findMany({
      2 src/lib/stock-manager.ts:    const transaction = await prisma.$transaction(async (tx) => {
      2 src/lib/stock-manager.ts:      const product = await prisma.product.findUnique({
      2 src/lib/shipping.ts:      const order = await prisma.order.update({
      2 src/lib/returns.ts:    return await prisma.returnRequest.findMany({
      2 src/lib/order-tracking.ts:      const order = await prisma.order.findUnique({
      2 src/app/api/test-edge/route.ts:    await prisma.$disconnect()
      2 src/app/api/settings/route.ts:    let settings = await prisma.userSetting.findUnique({
      2 src/app/api/settings/route.ts:      settings = await prisma.userSetting.create({
      2 src/app/api/payment-methods/route.ts:    const existingPaymentMethod = await prisma.userPaymentMethod.findFirst({
      2 src/app/api/orders/[orderId]/route.ts:    const updatedOrder = await prisma.order.update({
      2 src/app/api/orders/[orderId]/route.ts:          await prisma.user.update({
      2 src/app/api/categories/route-prisma-backup.ts:    const existingCategory = await prisma.category.findUnique({

## Total Files with Prisma Imports

Total number of files containing Prisma imports:

110

