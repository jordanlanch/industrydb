import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrganizationSwitcher } from '../organization-switcher';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Building2: (props: any) => <svg data-testid="icon-building2" {...props} />,
  Loader2: (props: any) => <svg data-testid="icon-loader" {...props} />,
  Plus: (props: any) => <svg data-testid="icon-plus" {...props} />,
  ChevronDown: (props: any) => <svg data-testid="icon-chevron-down" {...props} />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

// Mock organization context
const mockSwitchOrganization = jest.fn();
const mockContextValues = {
  currentOrganization: null as any,
  organizations: [] as any[],
  organizationsLoading: false,
  switchOrganization: mockSwitchOrganization,
};

jest.mock('@/contexts/organization.context', () => ({
  useOrganization: () => mockContextValues,
}));

const mockOrganizations = [
  {
    id: 1,
    name: 'Acme Corp',
    slug: 'acme-corp',
    owner_id: 100,
    subscription_tier: 'business',
    usage_count: 5000,
    usage_limit: 10000,
    created_at: '2026-01-01',
    updated_at: '2026-01-15',
  },
  {
    id: 2,
    name: 'Beta Inc',
    slug: 'beta-inc',
    owner_id: 100,
    subscription_tier: 'pro',
    usage_count: 800,
    usage_limit: 2000,
    created_at: '2026-01-05',
    updated_at: '2026-01-20',
  },
  {
    id: 3,
    name: 'Free Team',
    slug: 'free-team',
    owner_id: 200,
    subscription_tier: 'free',
    usage_count: 20,
    usage_limit: 50,
    created_at: '2026-01-10',
    updated_at: '2026-01-10',
  },
];

describe('OrganizationSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContextValues.currentOrganization = null;
    mockContextValues.organizations = mockOrganizations;
    mockContextValues.organizationsLoading = false;
  });

  describe('Loading State', () => {
    test('shows loading spinner when organizations are loading', () => {
      mockContextValues.organizationsLoading = true;

      render(<OrganizationSwitcher />);

      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Personal Account (Default)', () => {
    test('shows personal value when no organization is selected', () => {
      render(<OrganizationSwitcher />);

      // SelectValue renders the raw value "personal" from the Select context
      expect(screen.getByText('personal')).toBeInTheDocument();
    });

    test('shows building icon for personal account', () => {
      render(<OrganizationSwitcher />);

      expect(screen.getByTestId('icon-building2')).toBeInTheDocument();
    });

    test('shows "Personal Account" and "Individual workspace" in dropdown', () => {
      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Individual workspace')).toBeInTheDocument();
    });
  });

  describe('Organization List', () => {
    test('renders organization names in dropdown', () => {
      render(<OrganizationSwitcher />);

      // Open dropdown
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Beta Inc')).toBeInTheDocument();
      expect(screen.getByText('Free Team')).toBeInTheDocument();
    });

    test('renders organization tier badges', () => {
      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    test('renders usage counts for organizations', () => {
      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('5,000/10,000 leads')).toBeInTheDocument();
      expect(screen.getByText('800/2,000 leads')).toBeInTheDocument();
      expect(screen.getByText('20/50 leads')).toBeInTheDocument();
    });

    test('renders organization initials', () => {
      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('F')).toBeInTheDocument();
    });

    test('shows "Organizations" section header', () => {
      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Organizations')).toBeInTheDocument();
    });

    test('does not show Organizations section when empty', () => {
      mockContextValues.organizations = [];

      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.queryByText('Organizations')).not.toBeInTheDocument();
    });
  });

  describe('Switching Organizations', () => {
    test('calls switchOrganization with null when personal account is selected', () => {
      mockContextValues.currentOrganization = mockOrganizations[0];

      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Click "Personal Account" option
      const personalOption = screen.getByText('Individual workspace').closest('div[class]');
      if (personalOption) fireEvent.click(personalOption);

      expect(mockSwitchOrganization).toHaveBeenCalledWith(null);
    });

    test('calls switchOrganization with org ID when organization is selected', () => {
      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Click on Acme Corp org item
      const acmeItem = screen.getByText('Acme Corp').closest('div[class*="cursor-pointer"]');
      if (acmeItem) fireEvent.click(acmeItem);

      expect(mockSwitchOrganization).toHaveBeenCalledWith(1);
    });
  });

  describe('Selected Organization Display', () => {
    test('shows selected organization initial in trigger', () => {
      mockContextValues.currentOrganization = mockOrganizations[0];

      render(<OrganizationSwitcher />);

      expect(screen.getByText('A')).toBeInTheDocument();
    });

    test('shows selected organization id as select value', () => {
      mockContextValues.currentOrganization = mockOrganizations[0];

      render(<OrganizationSwitcher />);

      // The SelectValue component renders the value (org id) as text
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('shows selected organization name in dropdown', () => {
      mockContextValues.currentOrganization = mockOrganizations[0];

      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  describe('Create Organization', () => {
    test('shows "Create Organization" button when showCreateButton is true', () => {
      render(<OrganizationSwitcher showCreateButton={true} />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Create Organization')).toBeInTheDocument();
    });

    test('does not show "Create Organization" button when showCreateButton is false', () => {
      render(<OrganizationSwitcher showCreateButton={false} />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.queryByText('Create Organization')).not.toBeInTheDocument();
    });

    test('navigates to create page when "Create Organization" is clicked', () => {
      render(<OrganizationSwitcher showCreateButton={true} />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const createOption = screen.getByText('Create Organization').closest('div[class*="cursor-pointer"]');
      if (createOption) fireEvent.click(createOption);

      expect(mockPush).toHaveBeenCalledWith('/dashboard/organizations/new');
    });
  });

  describe('Tier Badge Colors', () => {
    test('renders correct badge colors for different tiers', () => {
      render(<OrganizationSwitcher />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const badges = screen.getAllByTestId('badge');
      const businessBadge = badges.find((b) => b.textContent === 'Business');
      const proBadge = badges.find((b) => b.textContent === 'Pro');
      const freeBadge = badges.find((b) => b.textContent === 'Free');

      expect(businessBadge?.className).toContain('bg-green-100');
      expect(proBadge?.className).toContain('bg-purple-100');
      expect(freeBadge?.className).toContain('bg-gray-100');
    });
  });
});
