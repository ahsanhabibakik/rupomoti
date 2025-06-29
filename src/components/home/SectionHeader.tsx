'use client'

import { motion } from 'framer-motion'
import { 
  Crown, 
  Diamond, 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Users, 
  BookOpen, 
  Star,
  Gift,
  Award,
  ShoppingBag
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const iconMap = {
  crown: Crown,
  diamond: Diamond,
  sparkles: Sparkles,
  trendingUp: TrendingUp,
  heart: Heart,
  users: Users,
  bookOpen: BookOpen,
  star: Star,
  gift: Gift,
  award: Award,
  shoppingBag: ShoppingBag,
}

interface SectionHeaderProps {
  icon: keyof typeof iconMap
  badge: string
  title: string
  subtitle: string
  badgeColor?: string
  iconColor?: string
}

export function SectionHeader({ 
  icon, 
  badge, 
  title, 
  subtitle, 
  badgeColor = "from-orange-500 to-red-500",
  iconColor = "text-orange-500"
}: SectionHeaderProps) {
  const Icon = iconMap[icon]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 mb-4 ${iconColor}`}
      >
        <Icon className="w-8 h-8" />
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <Badge className={`bg-gradient-to-r ${badgeColor} text-white border-0 text-sm px-4 py-1.5 font-medium`}>
          {badge}
        </Badge>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
      >
        {title}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>

      {/* Decorative Line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto mt-6 rounded-full"
      />
    </motion.div>
  )
}
