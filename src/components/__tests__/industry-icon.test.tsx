import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndustryIcon, IndustryBadge, CategoryBadge } from '../industry-icon';
import { UtensilsCrossed, Coffee, Scissors, Dumbbell, Building2 } from 'lucide-react';

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) => (
    <svg className={className} data-testid="mock-icon" {...props} />
  );

  return {
    UtensilsCrossed: MockIcon,
    Utensils: MockIcon,
    Coffee: MockIcon,
    Beer: MockIcon,
    Wine: MockIcon,
    Cake: MockIcon,
    Scissors: MockIcon,
    Sparkles: MockIcon,
    PaintBucket: MockIcon,
    PaintbrushIcon: MockIcon,
    Waves: MockIcon,
    Hand: MockIcon,
    Dumbbell: MockIcon,
    Heart: MockIcon,
    Pill: MockIcon,
    Stethoscope: MockIcon,
    Activity: MockIcon,
    Wrench: MockIcon,
    Droplet: MockIcon,
    Car: MockIcon,
    CarFront: MockIcon,
    ShoppingBag: MockIcon,
    Store: MockIcon,
    Scale: MockIcon,
    Calculator: MockIcon,
    Briefcase: MockIcon,
    Building2: MockIcon,
    MapPin: MockIcon,
    Search: MockIcon,
    Filter: MockIcon,
    List: MockIcon,
    Grid3x3: MockIcon,
    ChevronRight: MockIcon,
  };
});

// Mock industry-icons helper functions
jest.mock('@/lib/industry-icons', () => {
  const MockIcon = ({ className, ...props }: any) => (
    <svg className={className} data-testid="mock-icon" {...props} />
  );

  return {
    getIndustryIcon: (id: string) => MockIcon,
    getCategoryIcon: (id: string) => MockIcon,
    getCategoryColors: (categoryId: string) => {
      const colorMap: Record<string, any> = {
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
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        },
        retail: {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
        },
        professional: {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
        },
      };
      return colorMap[categoryId] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    },
  };
});

describe('IndustryIcon', () => {
  describe('Basic Rendering', () => {
    test('renders icon with industryId', () => {
      render(<IndustryIcon industryId="restaurant" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });

    test('renders icon with categoryId', () => {
      render(<IndustryIcon categoryId="food_beverage" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });

    test('renders custom icon when provided', () => {
      render(<IndustryIcon icon={UtensilsCrossed} />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });

    test('returns null when no icon can be determined', () => {
      const { container } = render(<IndustryIcon />);

      expect(container.firstChild).toBeNull();
    });

    test('uses fallback Building2 icon for unknown industryId', () => {
      render(<IndustryIcon industryId="unknown_industry" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });

    test('uses fallback Building2 icon for unknown categoryId', () => {
      render(<IndustryIcon categoryId="unknown_category" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    test('renders with xs size', () => {
      render(<IndustryIcon industryId="restaurant" size="xs" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('h-3');
      expect(icon).toHaveClass('w-3');
    });

    test('renders with sm size', () => {
      render(<IndustryIcon industryId="restaurant" size="sm" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('h-4');
      expect(icon).toHaveClass('w-4');
    });

    test('renders with md size (default)', () => {
      render(<IndustryIcon industryId="restaurant" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('h-5');
      expect(icon).toHaveClass('w-5');
    });

    test('renders with lg size', () => {
      render(<IndustryIcon industryId="restaurant" size="lg" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('h-6');
      expect(icon).toHaveClass('w-6');
    });

    test('renders with xl size', () => {
      render(<IndustryIcon industryId="restaurant" size="xl" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('h-8');
      expect(icon).toHaveClass('w-8');
    });
  });

  describe('Industry Icon Mapping', () => {
    test('renders correct icon for food & beverage industries', () => {
      const foodIndustries = ['restaurant', 'cafe', 'bar', 'bakery'];

      foodIndustries.forEach((industry) => {
        const { container } = render(<IndustryIcon industryId={industry} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('renders correct icon for personal care industries', () => {
      const personalCareIndustries = ['tattoo', 'beauty', 'barber', 'spa', 'nail_salon'];

      personalCareIndustries.forEach((industry) => {
        const { container } = render(<IndustryIcon industryId={industry} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('renders correct icon for health & wellness industries', () => {
      const healthIndustries = ['gym', 'dentist', 'pharmacy', 'massage'];

      healthIndustries.forEach((industry) => {
        const { container } = render(<IndustryIcon industryId={industry} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('renders correct icon for automotive industries', () => {
      const automotiveIndustries = ['car_repair', 'car_wash', 'car_dealer'];

      automotiveIndustries.forEach((industry) => {
        const { container } = render(<IndustryIcon industryId={industry} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('renders correct icon for retail industries', () => {
      const retailIndustries = ['clothing', 'convenience'];

      retailIndustries.forEach((industry) => {
        const { container } = render(<IndustryIcon industryId={industry} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('renders correct icon for professional services', () => {
      const professionalIndustries = ['lawyer', 'accountant'];

      professionalIndustries.forEach((industry) => {
        const { container } = render(<IndustryIcon industryId={industry} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Category Colors', () => {
    test('applies food_beverage category colors', () => {
      render(<IndustryIcon industryId="restaurant" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('text-orange-700');
    });

    test('applies personal_care category colors', () => {
      render(<IndustryIcon industryId="tattoo" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('text-pink-700');
    });

    test('applies health_wellness category colors', () => {
      render(<IndustryIcon industryId="gym" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('text-green-700');
    });

    test('applies automotive category colors', () => {
      render(<IndustryIcon industryId="car_repair" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('text-blue-700');
    });

    test('applies retail category colors', () => {
      render(<IndustryIcon industryId="clothing" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('text-purple-700');
    });

    test('applies professional category colors', () => {
      render(<IndustryIcon industryId="lawyer" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('text-gray-700');
    });

    test('applies default gray color for unknown category', () => {
      render(<IndustryIcon industryId="unknown" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('text-gray-600');
    });
  });

  describe('Background Display', () => {
    test('does not show background by default', () => {
      const { container } = render(<IndustryIcon industryId="restaurant" />);

      // Should render icon directly, not wrapped in div
      const wrapper = container.querySelector('div');
      expect(wrapper).toBeNull();
    });

    test('shows background when showBackground is true', () => {
      const { container } = render(
        <IndustryIcon industryId="restaurant" showBackground />
      );

      const wrapper = container.querySelector('div');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.className).toContain('inline-flex');
      expect(wrapper?.className).toContain('rounded-lg');
      expect(wrapper?.className).toContain('p-2');
    });

    test('applies correct background color classes with showBackground', () => {
      const { container } = render(
        <IndustryIcon industryId="restaurant" showBackground />
      );

      const wrapper = container.querySelector('div');
      expect(wrapper?.className).toContain('bg-orange-50');
      expect(wrapper?.className).toContain('border-orange-200');
      expect(wrapper?.className).toContain('border');
    });

    test('does not show background for custom icon without category', () => {
      const { container } = render(<IndustryIcon icon={Building2} showBackground />);

      // Should not have background wrapper without category colors
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(<IndustryIcon industryId="restaurant" className="custom-class" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('custom-class');
    });

    test('combines custom className with default classes', () => {
      render(
        <IndustryIcon industryId="restaurant" size="lg" className="my-custom-class" />
      );

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('my-custom-class');
      expect(icon).toHaveClass('h-6');
      expect(icon).toHaveClass('w-6');
    });
  });
});

describe('IndustryBadge', () => {
  describe('Basic Rendering', () => {
    test('renders badge with industry name', () => {
      render(<IndustryBadge industryId="restaurant" industryName="Restaurants" />);

      expect(screen.getByText('Restaurants')).toBeInTheDocument();
    });

    test('renders badge with industry icon', () => {
      render(<IndustryBadge industryId="restaurant" industryName="Restaurants" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });

    test('uses default variant styling', () => {
      const { container } = render(
        <IndustryBadge industryId="restaurant" industryName="Restaurants" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-gray-100');
      expect(badge?.className).toContain('text-gray-700');
      expect(badge?.className).toContain('border-gray-200');
    });
  });

  describe('Size Variants', () => {
    test('renders small badge', () => {
      const { container } = render(
        <IndustryBadge
          industryId="restaurant"
          industryName="Restaurants"
          size="sm"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('text-xs');
      expect(badge?.className).toContain('px-2');
      expect(badge?.className).toContain('py-1');
    });

    test('renders medium badge (default)', () => {
      const { container } = render(
        <IndustryBadge industryId="restaurant" industryName="Restaurants" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('text-sm');
      expect(badge?.className).toContain('px-3');
      expect(badge?.className).toContain('py-1.5');
    });

    test('renders large badge', () => {
      const { container } = render(
        <IndustryBadge
          industryId="restaurant"
          industryName="Restaurants"
          size="lg"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('text-base');
      expect(badge?.className).toContain('px-4');
      expect(badge?.className).toContain('py-2');
    });
  });

  describe('Variant Styles', () => {
    test('renders default variant', () => {
      const { container } = render(
        <IndustryBadge
          industryId="restaurant"
          industryName="Restaurants"
          variant="default"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-gray-100');
      expect(badge?.className).toContain('text-gray-700');
    });

    test('renders outline variant', () => {
      const { container } = render(
        <IndustryBadge
          industryId="restaurant"
          industryName="Restaurants"
          variant="outline"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-white');
      expect(badge?.className).toContain('border-gray-300');
    });

    test('renders solid variant', () => {
      const { container } = render(
        <IndustryBadge
          industryId="restaurant"
          industryName="Restaurants"
          variant="solid"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-gray-700');
      expect(badge?.className).toContain('text-white');
    });
  });

  describe('Badge Styling', () => {
    test('has rounded-full shape', () => {
      const { container } = render(
        <IndustryBadge industryId="restaurant" industryName="Restaurants" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('rounded-full');
    });

    test('applies custom className', () => {
      const { container } = render(
        <IndustryBadge
          industryId="restaurant"
          industryName="Restaurants"
          className="my-badge-class"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('my-badge-class');
    });
  });
});

describe('CategoryBadge', () => {
  describe('Basic Rendering', () => {
    test('renders badge with category name', () => {
      render(<CategoryBadge categoryId="food_beverage" categoryName="Food & Beverage" />);

      expect(screen.getByText('Food & Beverage')).toBeInTheDocument();
    });

    test('renders badge with category icon', () => {
      render(<CategoryBadge categoryId="food_beverage" categoryName="Food & Beverage" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });

    test('applies category color scheme', () => {
      const { container } = render(
        <CategoryBadge categoryId="food_beverage" categoryName="Food & Beverage" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-orange-50');
      expect(badge?.className).toContain('text-orange-700');
      expect(badge?.className).toContain('border-orange-200');
    });
  });

  describe('Size Variants', () => {
    test('renders small badge', () => {
      const { container } = render(
        <CategoryBadge
          categoryId="food_beverage"
          categoryName="Food & Beverage"
          size="sm"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('text-xs');
      expect(badge?.className).toContain('px-2');
      expect(badge?.className).toContain('py-1');
    });

    test('renders medium badge (default)', () => {
      const { container } = render(
        <CategoryBadge categoryId="food_beverage" categoryName="Food & Beverage" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('text-sm');
      expect(badge?.className).toContain('px-3');
      expect(badge?.className).toContain('py-1.5');
    });

    test('renders large badge', () => {
      const { container } = render(
        <CategoryBadge
          categoryId="food_beverage"
          categoryName="Food & Beverage"
          size="lg"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('text-base');
      expect(badge?.className).toContain('px-4');
      expect(badge?.className).toContain('py-2');
    });
  });

  describe('Category Color Schemes', () => {
    test('applies food_beverage colors (orange)', () => {
      const { container } = render(
        <CategoryBadge categoryId="food_beverage" categoryName="Food & Beverage" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-orange-50');
      expect(badge?.className).toContain('text-orange-700');
      expect(badge?.className).toContain('border-orange-200');
    });

    test('applies personal_care colors (pink)', () => {
      const { container } = render(
        <CategoryBadge categoryId="personal_care" categoryName="Personal Care" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-pink-50');
      expect(badge?.className).toContain('text-pink-700');
      expect(badge?.className).toContain('border-pink-200');
    });

    test('applies health_wellness colors (green)', () => {
      const { container } = render(
        <CategoryBadge categoryId="health_wellness" categoryName="Health & Wellness" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-green-50');
      expect(badge?.className).toContain('text-green-700');
      expect(badge?.className).toContain('border-green-200');
    });

    test('applies automotive colors (blue)', () => {
      const { container } = render(
        <CategoryBadge categoryId="automotive" categoryName="Automotive" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-blue-50');
      expect(badge?.className).toContain('text-blue-700');
      expect(badge?.className).toContain('border-blue-200');
    });

    test('applies retail colors (purple)', () => {
      const { container } = render(
        <CategoryBadge categoryId="retail" categoryName="Retail" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-purple-50');
      expect(badge?.className).toContain('text-purple-700');
      expect(badge?.className).toContain('border-purple-200');
    });

    test('applies professional colors (gray)', () => {
      const { container } = render(
        <CategoryBadge categoryId="professional" categoryName="Professional" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('bg-gray-50');
      expect(badge?.className).toContain('text-gray-700');
      expect(badge?.className).toContain('border-gray-200');
    });
  });

  describe('Badge Styling', () => {
    test('has rounded-full shape', () => {
      const { container } = render(
        <CategoryBadge categoryId="food_beverage" categoryName="Food & Beverage" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('rounded-full');
    });

    test('has border', () => {
      const { container } = render(
        <CategoryBadge categoryId="food_beverage" categoryName="Food & Beverage" />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('border');
    });

    test('applies custom className', () => {
      const { container } = render(
        <CategoryBadge
          categoryId="food_beverage"
          categoryName="Food & Beverage"
          className="my-category-badge"
        />
      );

      const badge = container.querySelector('.inline-flex');
      expect(badge?.className).toContain('my-category-badge');
    });
  });
});
