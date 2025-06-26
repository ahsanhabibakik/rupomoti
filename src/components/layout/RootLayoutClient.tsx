'use client'

import { Navbar } from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { selectIsCartDrawerOpen, setCartDrawerOpen } from "@/redux/slices/uiSlice"
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const isCartOpen = useAppSelector(selectIsCartDrawerOpen)
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  const variants = {
    hidden: { opacity: 0, filter: 'blur(4px)', scale: 0.98 },
    enter: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: { opacity: 0, filter: 'blur(4px)', scale: 0.98 },
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <div className="relative flex min-h-screen flex-col">
        {!isAdmin && <Navbar />}
        
        <main className="flex-1">
          {isAdmin ? (
            <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
              {children}
            </ErrorBoundary>
          ) : (
            <AnimatePresence
              mode="wait"
              initial={false}
              onExitComplete={() => window.scrollTo(0, 0)}
            >
              <motion.div
                key={pathname}
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
              >
                <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
                  {children}
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
        
        {!isAdmin && <Footer />}
        <CartDrawer open={isCartOpen} onOpenChange={(open) => dispatch(setCartDrawerOpen(open))} />
      </div>
    </ErrorBoundary>
  )
} 