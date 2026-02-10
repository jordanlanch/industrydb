'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { locales, localeNames, localeFlags } from '@/i18n';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export function LanguageSwitcher({ variant = 'light', compact = false }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/(en|es|fr)/, '');

    // Navigate to new locale
    // If path is empty, default to root
    const newPath = `/${newLocale}${pathWithoutLocale || ''}`;
    router.push(newPath);
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className={`${compact ? 'w-full justify-center' : 'w-[140px]'} ${variant === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-200' : ''}`}>
        {compact ? (
          <span>{localeFlags[locale as keyof typeof localeFlags]}</span>
        ) : (
          <>
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue placeholder={`${localeFlags[locale as keyof typeof localeFlags]} ${localeNames[locale as keyof typeof localeNames]}`} />
          </>
        )}
      </SelectTrigger>
      <SelectContent className={variant === 'dark' ? 'border-gray-700 bg-gray-800' : ''}>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            <div className="flex items-center gap-2">
              <span>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
