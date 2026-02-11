import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
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

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

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
  X: (props: any) => <svg data-testid="icon-x" {...props} />,
  LayoutDashboard: (props: any) => <svg data-testid="icon-layout-dashboard" {...props} />,
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

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <div>Select Value</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@/contexts/organization.context', () => ({
  useOrganization: () => ({
    currentOrganization: null,
    organizations: [],
    organizationsLoading: false,
    switchOrganization: jest.fn(),
  }),
}));

jest.mock('@/components/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
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

// Helper: get the desktop sidebar (aria-label="Main navigation")
function getDesktop() {
  return within(screen.getByLabelText('Main navigation'));
}

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
      const desktop = getDesktop();

      expect(desktop.getByText('leads')).toBeInTheDocument();
      expect(desktop.getByText('exports')).toBeInTheDocument();
      expect(desktop.getByText('analytics')).toBeInTheDocument();
      expect(desktop.getByText('organizations')).toBeInTheDocument();
      expect(desktop.getByText('apiKeys')).toBeInTheDocument();
      expect(desktop.getByText('settings')).toBeInTheDocument();
    });

    test('renders correct hrefs for navigation links', () => {
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.getByLabelText('leads page')).toHaveAttribute('href', '/dashboard/leads');
      expect(desktop.getByLabelText('exports page')).toHaveAttribute('href', '/dashboard/exports');
      expect(desktop.getByLabelText('analytics page')).toHaveAttribute('href', '/dashboard/analytics');
      expect(desktop.getByLabelText('organizations page')).toHaveAttribute('href', '/dashboard/organizations');
      expect(desktop.getByLabelText('apiKeys page')).toHaveAttribute('href', '/dashboard/api-keys');
      expect(desktop.getByLabelText('settings page')).toHaveAttribute('href', '/dashboard/settings');
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
      const desktop = getDesktop();

      const leadsLink = desktop.getByLabelText('leads page');
      expect(leadsLink).toHaveAttribute('aria-current', 'page');
    });

    test('does not mark inactive links with aria-current', () => {
      mockPathname.mockReturnValue('/dashboard/leads');
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      const settingsLink = desktop.getByLabelText('settings page');
      expect(settingsLink).not.toHaveAttribute('aria-current');
    });

    test('highlights active link with primary background', () => {
      mockPathname.mockReturnValue('/dashboard/leads');
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      const leadsLink = desktop.getByLabelText('leads page');
      expect(leadsLink.className).toContain('bg-primary');
    });

    test('highlights nested routes as active', () => {
      mockPathname.mockReturnValue('/dashboard/settings');
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      const settingsLink = desktop.getByLabelText('settings page');
      expect(settingsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Collapsed State', () => {
    test('hides link text in desktop sidebar when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);
      const desktop = getDesktop();

      expect(desktop.queryByText('leads')).not.toBeInTheDocument();
      expect(desktop.queryByText('exports')).not.toBeInTheDocument();
      expect(desktop.queryByText('settings')).not.toBeInTheDocument();
    });

    test('shows title attributes on links when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);
      const desktop = getDesktop();

      const leadsLink = desktop.getByLabelText('leads page');
      expect(leadsLink).toHaveAttribute('title', 'leads');
    });

    test('shows abbreviated logo when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);
      const desktop = getDesktop();

      expect(desktop.getByText('IDB')).toBeInTheDocument();
      expect(desktop.queryByText('IndustryDB')).not.toBeInTheDocument();
    });

    test('shows full logo when open', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);
      const desktop = getDesktop();

      expect(desktop.getByText('IndustryDB')).toBeInTheDocument();
    });

    test('hides user info in desktop sidebar when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);
      const desktop = getDesktop();

      expect(desktop.queryByText('John Doe')).not.toBeInTheDocument();
      expect(desktop.queryByText('john@example.com')).not.toBeInTheDocument();
    });

    test('hides organization switcher in desktop sidebar when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);
      const desktop = getDesktop();

      expect(desktop.queryByTestId('org-switcher')).not.toBeInTheDocument();
    });

    test('shows organization switcher when open', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);
      const desktop = getDesktop();

      expect(desktop.getByTestId('org-switcher')).toBeInTheDocument();
    });
  });

  describe('Toggle Button', () => {
    test('calls onToggle when toggle button is clicked', () => {
      const onToggle = jest.fn();
      render(<Sidebar isOpen={true} onToggle={onToggle} />);

      const toggleButton = screen.getByLabelText('collapseSidebar');
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test('shows collapse label when open', () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(screen.getByLabelText('collapseSidebar')).toBeInTheDocument();
    });

    test('shows expand label when collapsed', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(screen.getByLabelText('expandSidebar')).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    test('renders logout button', () => {
      render(<Sidebar {...defaultProps} />);

      const logoutButtons = screen.getAllByLabelText('logout');
      expect(logoutButtons.length).toBeGreaterThan(0);
    });

    test('calls logout and redirects when logout button is clicked', () => {
      render(<Sidebar {...defaultProps} />);

      const logoutButtons = screen.getAllByLabelText('logout');
      fireEvent.click(logoutButtons[0]);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('User Info', () => {
    test('displays user name and email when open', () => {
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.getByText('John Doe')).toBeInTheDocument();
      expect(desktop.getByText('john@example.com')).toBeInTheDocument();
    });

    test('displays subscription plan key', () => {
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      // t('plan', { tier: 'pro' }) returns 'plan' with the mock
      expect(desktop.getByText('plan')).toBeInTheDocument();
    });
  });

  describe('Admin Panel Link', () => {
    test('shows admin panel link for admin users', () => {
      mockUser.role = 'admin' as any;
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.getByLabelText('adminPanel')).toBeInTheDocument();
      expect(desktop.getByText('adminPanel')).toBeInTheDocument();
    });

    test('shows admin panel link for superadmin users', () => {
      mockUser.role = 'superadmin' as any;
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.getByLabelText('adminPanel')).toBeInTheDocument();
    });

    test('does not show admin panel link for regular users', () => {
      mockUser.role = 'user' as any;
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.queryByLabelText('adminPanel')).not.toBeInTheDocument();
    });

    test('admin panel link points to /admin', () => {
      mockUser.role = 'admin' as any;
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.getByLabelText('adminPanel')).toHaveAttribute('href', '/admin');
    });
  });

  describe('API Docs Link', () => {
    test('shows API docs link for business tier users', () => {
      mockUser.subscription_tier = 'business' as any;
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.getByLabelText('apiDocs (opens in new tab)')).toBeInTheDocument();
      expect(desktop.getByText('apiDocs')).toBeInTheDocument();
    });

    test('does not show API docs link for non-business tier users', () => {
      mockUser.subscription_tier = 'pro' as any;
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      expect(desktop.queryByText('apiDocs')).not.toBeInTheDocument();
    });

    test('API docs link opens in new tab', () => {
      mockUser.subscription_tier = 'business' as any;
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      const apiDocsLink = desktop.getByLabelText('apiDocs (opens in new tab)');
      expect(apiDocsLink).toHaveAttribute('target', '_blank');
      expect(apiDocsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Accessibility', () => {
    test('desktop aside has aria-label for main navigation', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });

    test('desktop nav has aria-label for dashboard navigation', () => {
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      const nav = desktop.getByRole('navigation', { name: 'Dashboard navigation' });
      expect(nav).toBeInTheDocument();
    });

    test('user info region has aria-label', () => {
      render(<Sidebar {...defaultProps} />);
      const desktop = getDesktop();

      const region = desktop.getByRole('region', { name: 'User information' });
      expect(region).toBeInTheDocument();
    });
  });
});
