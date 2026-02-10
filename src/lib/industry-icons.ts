import {
  Scissors,
  Dumbbell,
  Utensils,
  Coffee,
  Car,
  Briefcase,
  Stethoscope,
  ShoppingBag,
  Wrench,
  Heart,
  Sparkles,
  PaintBucket,
  Wine,
  Cake,
  CarFront,
  Scale,
  Calculator,
  Pill,
  Store,
  type LucideIcon,
} from 'lucide-react'

// Re-export LucideIcon type for components
export type { LucideIcon } from 'lucide-react'

export interface IndustryConfig {
  id: string
  name: string
  icon: LucideIcon
  color: string
  description: string
}

export const industries: IndustryConfig[] = [
  {
    id: 'tattoo',
    name: 'Tattoo Studios',
    icon: PaintBucket,
    color: 'purple',
    description: 'Tattoo parlors and body art studios',
  },
  {
    id: 'beauty',
    name: 'Beauty Salons',
    icon: Sparkles,
    color: 'pink',
    description: 'Hair salons and beauty services',
  },
  {
    id: 'barber',
    name: 'Barber Shops',
    icon: Scissors,
    color: 'blue',
    description: 'Traditional and modern barber shops',
  },
  {
    id: 'nail_salon',
    name: 'Nail Salons',
    icon: Heart,
    color: 'red',
    description: 'Nail care and manicure services',
  },
  {
    id: 'spa',
    name: 'Spas',
    icon: Heart,
    color: 'teal',
    description: 'Day spas and wellness centers',
  },
  {
    id: 'massage',
    name: 'Massage Therapy',
    icon: Heart,
    color: 'green',
    description: 'Massage and bodywork services',
  },
  {
    id: 'gym',
    name: 'Gyms & Fitness',
    icon: Dumbbell,
    color: 'orange',
    description: 'Fitness centers and gyms',
  },
  {
    id: 'dentist',
    name: 'Dentists',
    icon: Stethoscope,
    color: 'cyan',
    description: 'Dental clinics and orthodontists',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacies',
    icon: Pill,
    color: 'green',
    description: 'Pharmacies and drugstores',
  },
  {
    id: 'restaurant',
    name: 'Restaurants',
    icon: Utensils,
    color: 'red',
    description: 'Restaurants and dining establishments',
  },
  {
    id: 'cafe',
    name: 'Cafes',
    icon: Coffee,
    color: 'brown',
    description: 'Coffee shops and cafes',
  },
  {
    id: 'bar',
    name: 'Bars',
    icon: Wine,
    color: 'purple',
    description: 'Bars and pubs',
  },
  {
    id: 'bakery',
    name: 'Bakeries',
    icon: Cake,
    color: 'yellow',
    description: 'Bakeries and pastry shops',
  },
  {
    id: 'car_repair',
    name: 'Car Repair',
    icon: Wrench,
    color: 'gray',
    description: 'Auto repair and mechanic shops',
  },
  {
    id: 'car_wash',
    name: 'Car Wash',
    icon: Car,
    color: 'blue',
    description: 'Car wash services',
  },
  {
    id: 'car_dealer',
    name: 'Car Dealers',
    icon: CarFront,
    color: 'slate',
    description: 'Car dealerships',
  },
  {
    id: 'lawyer',
    name: 'Lawyers',
    icon: Scale,
    color: 'indigo',
    description: 'Law firms and attorneys',
  },
  {
    id: 'accountant',
    name: 'Accountants',
    icon: Calculator,
    color: 'emerald',
    description: 'Accounting and tax services',
  },
  {
    id: 'clothing',
    name: 'Clothing Stores',
    icon: ShoppingBag,
    color: 'rose',
    description: 'Clothing and fashion retail',
  },
  {
    id: 'convenience',
    name: 'Convenience Stores',
    icon: Store,
    color: 'amber',
    description: 'Convenience stores and mini-marts',
  },
]

export function getIndustryById(id: string): IndustryConfig | undefined {
  return industries.find((i) => i.id === id)
}

export function getIndustryName(id: string): string {
  const industry = getIndustryById(id)
  return industry ? industry.name : id
}

export function getIndustryIcon(id: string): LucideIcon {
  const industry = getIndustryById(id)
  return industry ? industry.icon : Briefcase
}

export function getIndustryColor(id: string): string {
  const industry = getIndustryById(id)
  return industry ? industry.color : 'gray'
}

// Category colors and icons (for category badges)
interface CategoryColors {
  bg: string
  text: string
  border: string
}

const categoryColorsMap: Record<string, CategoryColors> = {
  food_beverage: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  personal_care: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  health_wellness: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  automotive: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  retail: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  professional: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
}

const categoryIconsMap: Record<string, LucideIcon> = {
  food_beverage: Utensils,
  personal_care: Sparkles,
  health_wellness: Heart,
  automotive: Car,
  retail: ShoppingBag,
  professional: Briefcase,
}

export function getCategoryColors(categoryId: string): CategoryColors {
  return categoryColorsMap[categoryId] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  }
}

export function getCategoryIcon(categoryId: string): LucideIcon {
  return categoryIconsMap[categoryId] || Briefcase
}
