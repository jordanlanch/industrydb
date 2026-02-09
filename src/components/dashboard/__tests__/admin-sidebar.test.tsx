import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSidebar } from '../admin-sidebar';

// Mocks
const mockPush = jest.fn();
const mockPathname = jest.fn().mockReturnValue('/admin');

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

jest.mock('lucide-react', () => ({
  LayoutDashboard: (props: any) => <svg data-testid="icon-layout-dashboard" {...props} />,
  Users: (props: any) => <svg data-testid="icon-users" {...props} />,
  Database: (props: any) => <svg data-testid="icon-database" {...props} />,
  Settings: (props: any) => <svg data-testid="icon-settings" {...props} />,
  LogOut: (props: any) => <svg data-testid="icon-logout" {...props} />,
  ChevronLeft: (props: any) => <svg data-testid="icon-chevron-left" {...props} />,
  ChevronRight: (props: any) => <svg data-testid="icon-chevron-right" {...props} />,
  Shield: (props: any) => <svg data-testid="icon-shield" {...props} />,
}));

const mockLogout = jest.fn();
const mockUser: any = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  subscription_tier: 'business',
  role: 'admin',
  usage_count: 500,
  usage_limit: 10000,
  email_verified: true,
  created_at: '2026-01-01',
};

jest.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

describe('AdminSidebar', () => {
  const defaultProps = {
    isOpen: true,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/admin');
    mockUser.role = 'admin';
  });

  describe('Navigation Links', () => {
    test('renders admin navigation links when open', () => {
      render(<AdminSidebar {...defaultProps} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('renders correct hrefs for admin links', () => {
      render(<AdminSidebar {...defaultProps} />);

      expect(screen.getByLabelText('Dashboard page')).toHaveAttribute('href', '/admin');
      expect(screen.getByLabelText('Users page')).toHaveAttribute('href', '/admin/users');
      expect(screen.getByLabelText('Leads page')).toHaveAttribute('href', '/dashboard/leads');
      expect(screen.getByLabelText('Settings page')).toHaveAttribute('href', '/admin/settings');
    });

    test('renders "Back to Dashboard" link', () => {
      render(<AdminSidebar {...defaultProps} />);

      const backLink = screen.getByText('Back to Dashboard');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Active Link Highlighting', () => {
    test('marks active link with aria-current="page"', () => {
      mockPathname.mockReturnValue('/admin');
      render(<AdminSidebar {...defaultProps} />);

      const dashboardLink = screen.getByLabelText('Dashboard page');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    test('marks users link as active on /admin/users', () => {
      mockPathname.mockReturnValue('/admin/users');
      render(<AdminSidebar {...defaultProps} />);

      const usersLink = screen.getByLabelText('Users page');
      expect(usersLink).toHaveAttribute('aria-current', 'page');
    });

    test('does not mark inactive links', () => {
      mockPathname.mockReturnValue('/admin');
      render(<AdminSidebar {...defaultProps} />);

      const usersLink = screen.getByLabelText('Users page');
      expect(usersLink).not.toHaveAttribute('aria-current');
    });

    test('highlights active link with bg-gray-800', () => {
      mockPathname.mockReturnValue('/admin');
      render(<AdminSidebar {...defaultProps} />);

      const dashboardLink = screen.getByLabelText('Dashboard page');
      expect(dashboardLink.className).toContain('bg-gray-800');
    });
  });

  describe('User Info', () => {
    test('displays admin user name and email when open', () => {
      render(<AdminSidebar {...defaultProps} />);

      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    test('displays "Admin" role badge for admin users', () => {
      mockUser.role = 'admin';
      render(<AdminSidebar {...defaultProps} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    test('displays "Super Admin" role badge for superadmin users', () => {
      mockUser.role = 'superadmin';
      render(<AdminSidebar {...defaultProps} />);

      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });

    test('hides user info when collapsed', () => {
      render(<AdminSidebar {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
      expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    test('hides link text when collapsed', () => {
      render(<AdminSidebar {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    test('shows title attributes on links when collapsed', () => {
      render(<AdminSidebar {...defaultProps} isOpen={false} />);

      const dashboardLink = screen.getByLabelText('Dashboard page');
      expect(dashboardLink).toHaveAttribute('title', 'Dashboard');
    });

    test('hides "Admin Panel" text and shows only Shield icon when collapsed', () => {
      render(<AdminSidebar {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('icon-shield')).toBeInTheDocument();
    });
  });

  describe('Toggle Button', () => {
    test('calls onToggle when toggle button is clicked', () => {
      const onToggle = jest.fn();
      render(<AdminSidebar isOpen={true} onToggle={onToggle} />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test('shows "Expand sidebar" label when collapsed', () => {
      render(<AdminSidebar {...defaultProps} isOpen={false} />);

      expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    test('renders logout button', () => {
      render(<AdminSidebar {...defaultProps} />);

      expect(screen.getByLabelText('Logout')).toBeInTheDocument();
    });

    test('calls logout and redirects on click', () => {
      render(<AdminSidebar {...defaultProps} />);

      const logoutButton = screen.getByLabelText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('shows "Logout" text when open', () => {
      render(<AdminSidebar {...defaultProps} />);

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('hides "Logout" text when collapsed', () => {
      render(<AdminSidebar {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('Dark Theme', () => {
    test('sidebar has dark background class', () => {
      render(<AdminSidebar {...defaultProps} />);

      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('bg-gray-900');
    });

    test('sidebar has white text', () => {
      render(<AdminSidebar {...defaultProps} />);

      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('text-white');
    });
  });

  describe('Accessibility', () => {
    test('aside has aria-label for admin navigation', () => {
      render(<AdminSidebar {...defaultProps} />);

      const aside = screen.getByRole('complementary');
      expect(aside).toHaveAttribute('aria-label', 'Admin navigation');
    });

    test('nav has aria-label', () => {
      render(<AdminSidebar {...defaultProps} />);

      const nav = screen.getByRole('navigation', { name: 'Admin navigation' });
      expect(nav).toBeInTheDocument();
    });

    test('icons have aria-hidden attribute', () => {
      render(<AdminSidebar {...defaultProps} />);

      const icons = screen.getAllByTestId(/^icon-/);
      const hiddenIcons = icons.filter((icon) => icon.getAttribute('aria-hidden') === 'true');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });
});
