// User types
export interface User {
  id: number
  email: string
  name: string
  subscription_tier: 'free' | 'starter' | 'pro' | 'business'
  usage_count: number
  usage_limit: number
  email_verified: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Lead types
export interface Lead {
  id: number
  name: string
  industry: string
  sub_niche?: string
  specialties?: string[]
  cuisine_type?: string
  sport_type?: string
  tattoo_style?: string
  country: string
  city: string
  phone?: string
  email?: string
  website?: string
  address?: string
  latitude?: number
  longitude?: number
  verified: boolean
  quality_score: number
  created_at: string
}

export interface LeadSearchRequest {
  industry?: string
  country?: string
  city?: string
  has_email?: boolean
  has_phone?: boolean
  verified?: boolean
  page?: number
  limit?: number
}

export interface LeadListResponse {
  data: Lead[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters: Record<string, any>
}

export interface LeadPreviewResponse {
  estimated_count: number
  with_email_count: number
  with_email_pct: number
  with_phone_count: number
  with_phone_pct: number
  verified_count: number
  verified_pct: number
  quality_score_avg: number
}

// Export types
export interface ExportRequest {
  format: 'csv' | 'excel'
  filters?: LeadSearchRequest
  max_leads?: number
}

export interface Export {
  id: number
  status: 'pending' | 'processing' | 'ready' | 'failed'
  format: 'csv' | 'excel'
  lead_count: number
  file_url?: string
  expires_at?: string
  created_at: string
  error_message?: string
}

// Usage types
export interface UsageInfo {
  usage_count: number
  usage_limit: number
  remaining: number
  reset_at: string
  tier: string
}

// Billing types
export interface PricingTier {
  name: string
  price: number
  leads_limit: number
  description: string
  features: string[]
}

export interface PricingResponse {
  tiers: PricingTier[]
}

export interface CheckoutRequest {
  tier: 'starter' | 'pro' | 'business'
}

export interface CheckoutResponse {
  session_id: string
  url: string
  expires_at: number
}

export interface CustomerPortalResponse {
  url: string
}

// Error types
export interface ErrorResponse {
  error: string
  message?: string
}

// Industry types
export interface Industry {
  id: string
  name: string
  category: string
  icon: string
  osm_primary_tag: string
  osm_additional_tags: string[]
  description: string
  active: boolean
  sort_order: number
}

export interface IndustryWithCount {
  id: string
  name: string
  category: string
  icon: string
  description: string
  lead_count: number
  countries: string[]
}

export interface IndustriesWithLeadsResponse {
  industries: IndustryWithCount[]
  total: number
}

export interface IndustryCategory {
  id: string
  name: string
  icon: string
  description: string
  industries: Industry[]
}

export interface IndustriesResponse {
  categories: IndustryCategory[]
  total: number
}

// Sub-niche types
export interface SubNiche {
  id: string
  name: string
  icon: string
  description: string
  count: number
  popular: boolean
}

export interface SubNicheResponse {
  industry: string
  has_sub_niches: boolean
  sub_niche_label: string
  sub_niches: SubNiche[]
  total_count: number
}

// Statistics types
export type QualityTier = 'excellent' | 'good' | 'fair' | 'poor'

export interface CompletenessInfo {
  count: number
  percentage: number
}

export interface QualityDistribution {
  high: number
  medium: number
  low: number
}

export interface LeadStatistics {
  totalResults: number
  avgQualityScore: number
  verifiedCount: number
  verifiedPercentage: number
  completeProfiles: number
  qualityDistribution: QualityDistribution
  completeness: {
    email: CompletenessInfo
    phone: CompletenessInfo
    website: CompletenessInfo
    address: CompletenessInfo
  }
}
