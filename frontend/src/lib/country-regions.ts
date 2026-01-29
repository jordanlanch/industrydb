/**
 * Country grouping by geographic region
 * Used for organized country selection in filters
 */

export const POPULAR_COUNTRIES = [
  'US', // United States
  'GB', // United Kingdom
  'DE', // Germany
  'ES', // Spain
  'FR', // France
  'IT', // Italy
  'CA', // Canada
  'AU', // Australia
  'NL', // Netherlands
  'BR', // Brazil
  'MX', // Mexico
  'JP', // Japan
]

export interface CountryRegion {
  id: string
  name: string
  icon: string
  countries: string[]
}

export const COUNTRY_REGIONS: CountryRegion[] = [
  {
    id: 'americas',
    name: 'Americas',
    icon: '🌎',
    countries: [
      'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC',
      'GT', 'CU', 'HT', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR',
      'PA', 'UY', 'JM', 'TT', 'GY', 'SR', 'BZ', 'BS', 'BB', 'GD',
      'LC', 'VC', 'AG', 'DM', 'KN', 'AW', 'BM', 'KY', 'VG', 'VI',
      'GP', 'MQ', 'PR', 'GL', 'PM', 'MF', 'BQ', 'CW', 'SX',
    ],
  },
  {
    id: 'europe',
    name: 'Europe',
    icon: '🌍',
    countries: [
      'GB', 'DE', 'FR', 'ES', 'IT', 'PT', 'NL', 'BE', 'CH', 'AT',
      'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'GR', 'BG',
      'SK', 'IE', 'HR', 'SI', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY',
      'IS', 'LI', 'MC', 'AD', 'SM', 'VA', 'RS', 'BA', 'MK', 'AL',
      'XK', 'ME', 'MD', 'UA', 'BY', 'RU', 'GE', 'AM', 'AZ', 'TR',
    ],
  },
  {
    id: 'asia',
    name: 'Asia Pacific',
    icon: '🌏',
    countries: [
      'JP', 'CN', 'KR', 'SG', 'IN', 'TH', 'MY', 'ID', 'PH', 'VN',
      'HK', 'TW', 'MO', 'BD', 'PK', 'LK', 'NP', 'MM', 'KH', 'LA',
      'BN', 'TL', 'MN', 'KZ', 'UZ', 'TM', 'KG', 'TJ', 'AF', 'IR',
      'IQ', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'YE', 'JO', 'LB',
      'SY', 'IL', 'PS', 'AU', 'NZ', 'FJ', 'PG', 'NC', 'PF', 'GU',
      'AS', 'MP', 'FM', 'MH', 'PW', 'WS', 'TO', 'VU', 'SB', 'KI',
    ],
  },
  {
    id: 'africa',
    name: 'Africa',
    icon: '🌍',
    countries: [
      'ZA', 'EG', 'NG', 'KE', 'MA', 'TN', 'GH', 'ET', 'TZ', 'UG',
      'DZ', 'SD', 'AO', 'MZ', 'MG', 'CM', 'CI', 'NE', 'BF', 'ML',
      'MW', 'ZM', 'ZW', 'SN', 'SO', 'TD', 'GN', 'RW', 'BJ', 'BI',
      'TG', 'SL', 'LY', 'LR', 'MR', 'CF', 'ER', 'GM', 'BW', 'GA',
      'NA', 'LS', 'GQ', 'MU', 'SZ', 'DJ', 'KM', 'CV', 'ST', 'SC',
      'RE', 'YT', 'EH',
    ],
  },
  {
    id: 'oceania',
    name: 'Oceania',
    icon: '🌏',
    countries: [
      'AU', 'NZ', 'FJ', 'PG', 'NC', 'PF', 'GU', 'AS', 'MP', 'FM',
      'MH', 'PW', 'WS', 'TO', 'VU', 'SB', 'KI', 'NR', 'TV', 'NU',
      'CK', 'TK', 'WF', 'PN',
    ],
  },
]

/**
 * Get region for a specific country code
 */
export function getCountryRegion(countryCode: string): CountryRegion | undefined {
  return COUNTRY_REGIONS.find((region) =>
    region.countries.includes(countryCode.toUpperCase())
  )
}

/**
 * Check if country is in popular list
 */
export function isPopularCountry(countryCode: string): boolean {
  return POPULAR_COUNTRIES.includes(countryCode.toUpperCase())
}
