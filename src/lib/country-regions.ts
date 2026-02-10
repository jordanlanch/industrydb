export interface Region {
  code: string
  name: string
}

export interface CountryRegions {
  [countryCode: string]: Region[]
}

// Popular countries by lead count (top 12 from data coverage)
export const POPULAR_COUNTRIES = [
  'NL', // Netherlands - 6,033 leads
  'AT', // Austria - 3,091 leads
  'DE', // Germany - 2,970 leads
  'TW', // Taiwan - 2,786 leads
  'TR', // Turkey - 2,574 leads
  'HU', // Hungary - 2,291 leads
  'CL', // Chile - 2,281 leads
  'IE', // Ireland - 2,259 leads
  'CH', // Switzerland - 2,254 leads
  'AR', // Argentina - 2,030 leads
  'US', // United States
  'GB', // United Kingdom
]

// Regions/continents for grouping countries
export interface CountryRegion {
  name: string
  code: string
  countries: string[]
}

export const COUNTRY_REGIONS: CountryRegion[] = [
  {
    name: 'Europe',
    code: 'EU',
    countries: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'NO', 'IS', 'UA', 'RS', 'BA', 'AL', 'MK', 'ME', 'XK', 'BY', 'MD', 'RU', 'TR'],
  },
  {
    name: 'North America',
    code: 'NA',
    countries: ['US', 'CA', 'MX'],
  },
  {
    name: 'South America',
    code: 'SA',
    countries: ['AR', 'BR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR'],
  },
  {
    name: 'Asia',
    code: 'AS',
    countries: ['CN', 'JP', 'KR', 'IN', 'TW', 'HK', 'SG', 'MY', 'TH', 'ID', 'PH', 'VN', 'PK', 'BD', 'LK', 'NP', 'AE', 'SA', 'IL', 'IQ', 'IR', 'JO', 'LB', 'KW', 'QA', 'OM', 'BH', 'YE', 'KZ', 'UZ', 'TM', 'KG', 'TJ', 'AF', 'MM', 'KH', 'LA', 'MN'],
  },
  {
    name: 'Oceania',
    code: 'OC',
    countries: ['AU', 'NZ', 'FJ', 'PG', 'WS', 'TO', 'VU', 'SB', 'KI', 'FM', 'PW', 'MH', 'NR', 'TV'],
  },
  {
    name: 'Africa',
    code: 'AF',
    countries: ['ZA', 'NG', 'EG', 'KE', 'MA', 'GH', 'TZ', 'ET', 'UG', 'DZ', 'TN', 'SN', 'CI', 'CM', 'AO', 'ZW', 'ZM', 'BW', 'MZ', 'NA', 'MW', 'RW', 'MU', 'MG', 'SD', 'LY', 'ML', 'BF', 'NE', 'TD', 'SO', 'ER', 'DJ'],
  },
]

export const countryRegions: CountryRegions = {
  US: [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ],
  CA: [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
  ],
  GB: [
    { code: 'ENG', name: 'England' },
    { code: 'SCT', name: 'Scotland' },
    { code: 'WLS', name: 'Wales' },
    { code: 'NIR', name: 'Northern Ireland' },
  ],
  AU: [
    { code: 'NSW', name: 'New South Wales' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' },
  ],
  DE: [
    { code: 'BW', name: 'Baden-Wurttemberg' },
    { code: 'BY', name: 'Bavaria' },
    { code: 'BE', name: 'Berlin' },
    { code: 'BB', name: 'Brandenburg' },
    { code: 'HB', name: 'Bremen' },
    { code: 'HH', name: 'Hamburg' },
    { code: 'HE', name: 'Hesse' },
    { code: 'NI', name: 'Lower Saxony' },
    { code: 'MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'NW', name: 'North Rhine-Westphalia' },
    { code: 'RP', name: 'Rhineland-Palatinate' },
    { code: 'SL', name: 'Saarland' },
    { code: 'SN', name: 'Saxony' },
    { code: 'ST', name: 'Saxony-Anhalt' },
    { code: 'SH', name: 'Schleswig-Holstein' },
    { code: 'TH', name: 'Thuringia' },
  ],
}

export function getRegionsByCountry(countryCode: string): Region[] {
  return countryRegions[countryCode] || []
}

export function getRegionName(countryCode: string, regionCode: string): string {
  const regions = getRegionsByCountry(countryCode)
  const region = regions.find((r) => r.code === regionCode)
  return region ? region.name : regionCode
}
