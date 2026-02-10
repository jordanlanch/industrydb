export interface LeadStats {
  total: number
  withEmail: number
  withPhone: number
  withWebsite: number
  verified: number
  averageQualityScore: number
}

export interface LeadStatsResponse {
  stats: LeadStats
  byIndustry: Record<string, number>
  byCountry: Record<string, number>
}

export interface CompletenessResult {
  filledFields: number
  totalFields: number
  percentage: number
}

export function calculateCompleteness(lead: {
  email?: string | null
  phone?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
}): CompletenessResult {
  const fields = ['email', 'phone', 'website', 'address', 'city']
  let filledFields = 0

  fields.forEach((field) => {
    const value = lead[field as keyof typeof lead]
    if (value && value.length > 0) {
      filledFields++
    }
  })

  const totalFields = fields.length
  const percentage = Math.round((filledFields / totalFields) * 100)

  return {
    filledFields,
    totalFields,
    percentage,
  }
}

export function formatQualityScore(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

export function getQualityScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export function getQualityScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100'
  if (score >= 60) return 'bg-blue-100'
  if (score >= 40) return 'bg-yellow-100'
  return 'bg-red-100'
}

export function formatLeadCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// Quality tier configuration
export type QualityTier = 'excellent' | 'good' | 'fair' | 'poor'

interface QualityTierConfig {
  label: string
  bgColor: string
  textColor: string
  barColor: string
}

const qualityTierConfigs: Record<QualityTier, QualityTierConfig> = {
  excellent: {
    label: 'Excellent',
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    barColor: 'bg-green-500',
  },
  good: {
    label: 'Good',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    barColor: 'bg-blue-500',
  },
  fair: {
    label: 'Fair',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    barColor: 'bg-yellow-500',
  },
  poor: {
    label: 'Poor',
    bgColor: 'bg-red-500',
    textColor: 'text-red-700',
    barColor: 'bg-red-500',
  },
}

export function getQualityTier(score: number): QualityTier {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

export function getQualityTierConfig(tier: QualityTier): QualityTierConfig {
  return qualityTierConfigs[tier]
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-blue-500'
  if (percentage >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}
