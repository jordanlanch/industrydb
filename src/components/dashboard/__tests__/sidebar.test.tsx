import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../sidebar';

// Mocks
const mockPush = jest.fn();
const mockPathname = jest.fn().mockReturnValue('/dashboard/leads');

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Database: (props: any) => <svg data-testid="icon-database" {...props} />,
  FileDown: (props: any) => <svg data-testid="icon-filedown" {...props} />,
  Activity: (props: any) => <svg data-testid="icon-activity" {...props} />,
  Building2: (props: any) => <svg data-testid="icon-building2" {...props} />,
  Settings: (props: any) => <svg data-testid="icon-settings" {...props} />,
  LogOut: (props: any) => <svg data-testid="icon-logout" {...props} />,
  Key: (props: any) => <svg data-testid="icon-key" {...props} />,
  ChevronLeft: (props: any) => <svg data-testid="icon-chevron-left" {...props} />,
  ChevronRight: (props: any) => <svg data-testid="icon-chevron-right" {...props} />,
  Shield: (props: any) => <svg data-testid="icon-shield" {...props} />,
  BookOpen: (props: any) => <svg data-testid="icon-bookopen" {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/organization/organization-switcher', () => ({
  OrganizationSwitcher: () => <div data-testid="org-switcher">OrgSwitcher</div>,
}));

const mockLogout = jest.fn();
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  subscription_tier: 'pro' as const,
  role: 'user' as const,
  usage_count: 100,
  usage_limit: 2000,
  email_verified: true,
  created_at: '2026-01-01',
};

jest.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

describe('Sidebar', () => {
  const defaultProps = {
    isOpen: true,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard/leads');
    mockUser.role = 'user' as any;
    mockUser.subscription_tier = 'pro' as any;
  });

  describe('Navigation Links', () => {
    test('renders all navigation links when open', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Exports')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Organizations')).toBeInTheDocument();
      expect(screen.getByText('API Keys')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('renders correct hrefs for navigation links', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByLabelText('Leads page')).toHaveAttribute('href', '/dashboard/leads');
      expect(screen.getByLabelText('Exports page')).toHaveAttribute('href', '/dashboard/exports');
      expect(screen.getByLabelText('Analytics page')).toHaveAttribute('href', '/dashboard/analytics');
      expect(screen.getByLabelText('Organizations page')).toHaveAttribute('href', '/dashboard/organizations');
      expect(screen.getByLabelText('API Keys page')).toHaveAttribute('href', '/dashboard/api-keys');
      expect(screen.getByLabelText('Settings page')).toHaveAttribute('href', '/dashboard/settings');
    });

    test('renders icons with aria-hidden', () => {
      render(<Sidebar {...defaultProps} />);

      const icons = screen.getAllByTestId(/^icon-/);
      const hiddenIcons = icons.filter((icon) => icon.getAttribute('aria-hidden') === 'true');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Active Link Highlighting', () => {
    test('marks active link with aria-current="page"', () => {
      mockPathname.mockReturnValue('/dashboard/leads');
      render(<Sidebar {...defaultProps} />);

      const leadsLink = screen.getByLabelText('Leads page');
      expect(leadsLink).toHaveAttribute('aria-current', 'page');
    });

    test('does not mark inactive links with aria-current', () => {
      mockPathname.mockReturnValue('/dashboard/leads');
      render(<Sidebar {...defaultProps} />);

      const settingsLink = screen.getByLabelText('Settings page');
      expect(settingsLink).not.toHaveAttribute('aria-current');
    });

    test('highlights active link with primary background', () => {
      mockPathname.mockReturnValue('/dashboard/leads');
      render(<Sidebar {...defaultProps} />);

      const leadsLink = screen.getByLabelText('Leads page');
      expect(leadsLink.className).toContain('bg-primary');
    });

    test('highlights nested routes as active', () => {
      mockPathname.mockReturnValue('/dashboard/settings/billing');
      render(<Sidebar {...defaultProps} />);

      const settingsLink = screen.getByLabelText('Settings page');
      expect(settingsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Collapsed State', () => {
    test('hides link text when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Leads')).not.toBeInTheDocument();
      expect(screen.queryByText('Exports')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    test('shows title attributes on links when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      const leadsLink = screen.getByLabelText('Leads page');
      expect(leadsLink).toHaveAttribute('title', 'Leads');
    });

    test('shows abbreviated logo when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(screen.getByText('IDB')).toBeInTheDocument();
      expect(screen.queryByText('IndustryDB')).not.toBeInTheDocument();
    });

    test('shows full logo when open', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(screen.getByText('IndustryDB')).toBeInTheDocument();
    });

    test('hides user info when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    });

    test('hides organization switcher when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('org-switcher')).not.toBeInTheDocument();
    });

    test('shows organization switcher when open', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(screen.getByTestId('org-switcher')).toBeInTheDocument();
    });
  });

  describe('Toggle Button', () => {
    test('calls onToggle when toggle button is clicked', () => {
      const onToggle = jest.fn();
      render(<Sidebar isOpen={true} onToggle={onToggle} />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test('shows "Collapse sidebar" label when open', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    });

    test('shows "Expand sidebar" label when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    test('renders logout button', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByLabelText('Logout from account')).toBeInTheDocument();
    });

    test('calls logout and redirects when logout button is clicked', () => {
      render(<Sidebar {...defaultProps} />);

      const logoutButtons = screen.getAllByLabelText('Logout from account');
      fireEvent.click(logoutButtons[0]);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('User Info', () => {
    test('displays user name and email when open', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    test('displays subscription tier', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText('pro')).toBeInTheDocument();
      expect(screen.getByText('plan')).toBeInTheDocument();
    });
  });

  describe('Admin Panel Link', () => {
    test('shows admin panel link for admin users', () => {
      mockUser.role = 'admin' as any;
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByLabelText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('shows admin panel link for superadmin users', () => {
      mockUser.role = 'superadmin' as any;
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByLabelText('Admin Panel')).toBeInTheDocument();
    });

    test('does not show admin panel link for regular users', () => {
      mockUser.role = 'user' as any;
      render(<Sidebar {...defaultProps} />);

      expect(screen.queryByLabelText('Admin Panel')).not.toBeInTheDocument();
    });

    test('admin panel link points to /admin', () => {
      mockUser.role = 'admin' as any;
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByLabelText('Admin Panel')).toHaveAttribute('href', '/admin');
    });
  });

  describe('API Docs Link', () => {
    test('shows API docs link for business tier users', () => {
      mockUser.subscription_tier = 'business' as any;
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByLabelText('API Documentation (opens in new tab)')).toBeInTheDocument();
      expect(screen.getByText('API Docs')).toBeInTheDocument();
    });

    test('does not show API docs link for non-business tier users', () => {
      mockUser.subscription_tier = 'pro' as any;
      render(<Sidebar {...defaultProps} />);

      expect(screen.queryByText('API Docs')).not.toBeInTheDocument();
    });

    test('API docs link opens in new tab', () => {
      mockUser.subscription_tier = 'business' as any;
      render(<Sidebar {...defaultProps} />);

      const apiDocsLink = screen.getByLabelText('API Documentation (opens in new tab)');
      expect(apiDocsLink).toHaveAttribute('target', '_blank');
      expect(apiDocsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Accessibility', () => {
    test('aside has aria-label for main navigation', () => {
      render(<Sidebar {...defaultProps} />);

      const aside = screen.getByRole('complementary');
      expect(aside).toHaveAttribute('aria-label', 'Main navigation');
    });

    test('nav has aria-label for dashboard navigation', () => {
      render(<Sidebar {...defaultProps} />);

      const nav = screen.getByRole('navigation', { name: 'Dashboard navigation' });
      expect(nav).toBeInTheDocument();
    });

    test('user info region has aria-label', () => {
      render(<Sidebar {...defaultProps} />);

      const region = screen.getByRole('region', { name: 'User information' });
      expect(region).toBeInTheDocument();
    });
  });
});
