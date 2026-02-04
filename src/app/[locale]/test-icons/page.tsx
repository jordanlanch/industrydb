/**
 * Icon Test Page
 * Visual test of all industry and category icons
 */
'use client'

import { IndustryIcon, IndustryBadge, CategoryBadge } from '@/components/industry-icon'
import { industryIcons, categoryIcons } from '@/lib/industry-icons'

export default function TestIconsPage() {
  const industries = [
    { id: 'restaurant', name: 'Restaurants' },
    { id: 'cafe', name: 'Cafes' },
    { id: 'bar', name: 'Bars' },
    { id: 'bakery', name: 'Bakeries' },
    { id: 'tattoo', name: 'Tattoo Studios' },
    { id: 'beauty', name: 'Beauty Salons' },
    { id: 'barber', name: 'Barber Shops' },
    { id: 'spa', name: 'Spas' },
    { id: 'nail_salon', name: 'Nail Salons' },
    { id: 'gym', name: 'Gyms' },
    { id: 'dentist', name: 'Dentists' },
    { id: 'pharmacy', name: 'Pharmacies' },
    { id: 'massage', name: 'Massage Therapy' },
    { id: 'car_repair', name: 'Car Repair' },
    { id: 'car_wash', name: 'Car Wash' },
    { id: 'car_dealer', name: 'Car Dealers' },
    { id: 'clothing', name: 'Clothing Stores' },
    { id: 'convenience', name: 'Convenience Stores' },
    { id: 'lawyer', name: 'Lawyers' },
    { id: 'accountant', name: 'Accountants' },
  ]

  const categories = [
    { id: 'food_beverage', name: 'Food & Beverage' },
    { id: 'personal_care', name: 'Personal Care & Beauty' },
    { id: 'health_wellness', name: 'Health & Wellness' },
    { id: 'automotive', name: 'Automotive' },
    { id: 'retail', name: 'Retail' },
    { id: 'professional', name: 'Professional Services' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            IndustryDB Icon System
          </h1>
          <p className="text-lg text-gray-600">
            Professional icons powered by Lucide React
          </p>
        </div>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <IndustryIcon
                    categoryId={category.id}
                    size="xl"
                    showBackground
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">{category.id}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <CategoryBadge
                    categoryId={category.id}
                    categoryName={category.name}
                    size="sm"
                  />
                  <CategoryBadge
                    categoryId={category.id}
                    categoryName={category.name}
                    size="md"
                  />
                  <CategoryBadge
                    categoryId={category.id}
                    categoryName={category.name}
                    size="lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Industries */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Industries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry) => (
              <div
                key={industry.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <IndustryIcon
                    industryId={industry.id}
                    size="lg"
                    showBackground
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {industry.name}
                    </h3>
                    <p className="text-xs text-gray-500">{industry.id}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20">Sizes:</span>
                    <div className="flex items-center gap-2">
                      <IndustryIcon industryId={industry.id} size="xs" />
                      <IndustryIcon industryId={industry.id} size="sm" />
                      <IndustryIcon industryId={industry.id} size="md" />
                      <IndustryIcon industryId={industry.id} size="lg" />
                      <IndustryIcon industryId={industry.id} size="xl" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <IndustryBadge
                      industryId={industry.id}
                      industryName={industry.name}
                      size="sm"
                      variant="default"
                    />
                    <IndustryBadge
                      industryId={industry.id}
                      industryName={industry.name}
                      size="sm"
                      variant="outline"
                    />
                    <IndustryBadge
                      industryId={industry.id}
                      industryName={industry.name}
                      size="sm"
                      variant="solid"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Usage Examples
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Simple Icon
              </h3>
              <div className="flex items-center gap-4">
                <IndustryIcon industryId="restaurant" size="md" />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  &lt;IndustryIcon industryId=&quot;restaurant&quot; size=&quot;md&quot; /&gt;
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Icon with Background
              </h3>
              <div className="flex items-center gap-4">
                <IndustryIcon
                  industryId="gym"
                  size="lg"
                  showBackground
                />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  &lt;IndustryIcon industryId=&quot;gym&quot; size=&quot;lg&quot; showBackground /&gt;
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Industry Badge
              </h3>
              <div className="flex items-center gap-4">
                <IndustryBadge
                  industryId="tattoo"
                  industryName="Tattoo Studios"
                  variant="default"
                />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  &lt;IndustryBadge industryId=&quot;tattoo&quot; industryName=&quot;Tattoo Studios&quot; /&gt;
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Category Badge
              </h3>
              <div className="flex items-center gap-4">
                <CategoryBadge
                  categoryId="food_beverage"
                  categoryName="Food & Beverage"
                />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  &lt;CategoryBadge categoryId=&quot;food_beverage&quot; categoryName=&quot;Food & Beverage&quot; /&gt;
                </code>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Icons by{' '}
            <a
              href="https://lucide.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Lucide
            </a>
            {' '} • Replaced emoji system with professional icons
          </p>
        </div>
      </div>
    </div>
  )
}
