export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  details: {
    pearlType: string
    pearlSize: string
    pearlColor: string
    clasp?: string
    length?: string
    setting?: string
    closure?: string
    size?: string
  }
  inStock: boolean
} 