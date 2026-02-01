'use client';

import { useTranslations } from 'next-intl';
import { Database, Globe, Building2, Users } from 'lucide-react';

const stats = [
  {
    id: 'leads',
    value: '82,740+',
    icon: Database,
  },
  {
    id: 'countries',
    value: '184',
    icon: Globe,
  },
  {
    id: 'industries',
    value: '20+',
    icon: Building2,
  },
  {
    id: 'users',
    value: '1,000+',
    icon: Users,
  },
];

export function HeroStats() {
  const t = useTranslations('landing.stats');

  return (
    <section className="py-16 bg-white border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(stat.id)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HeroStats;
