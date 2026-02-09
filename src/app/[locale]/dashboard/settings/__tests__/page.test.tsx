import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SettingsPage from '../page'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: any) => {
      const translations: Record<string, string> = {
        title: 'Settings',
        subtitle: 'Manage your account settings and preferences',
        'profile.title': 'Profile Information',
        'profile.description': 'Your personal details',
        'profile.name': 'Name',
        'profile.email': 'Email',
        'profile.currentPlan': 'Current Plan',
        'profile.usageThisMonth': 'Usage This Month',
        'profile.remainingLeads': 'Remaining Leads',
        'billing.title': 'Billing & Subscription',
        'billing.description': 'Manage your subscription plan',
        'billing.currentPlan': `You are on the ${params?.tier || 'free'} plan`,
        'billing.manageBilling': 'Manage Billing',
        'billing.manageBillingDesc': 'Manage your subscription, payment methods, and billing history.',
        'billing.loading': 'Loading...',
        'billing.freePlanMsg': 'You are on the free plan. Upgrade for more features.',
        'privacy.title': 'Privacy & Data',
        'privacy.description': 'Manage your personal data and account',
        'privacy.export.title': 'Export Your Data',
        'privacy.export.description': 'Download all your personal data in JSON format (GDPR Article 15).',
        'privacy.export.button': 'Download My Data (GDPR)',
        'privacy.export.downloading': 'Downloading...',
        'privacy.delete.title': 'Delete Account',
        'privacy.delete.description': 'Permanently delete your account and all associated data.',
        'privacy.delete.button': 'Delete Account',
        'plans.title': 'Available Plans',
        'plans.current': 'Current',
        'plans.perMonth': '/month',
        'plans.upgrade': 'Upgrade',
        'plans.redirecting': 'Redirecting...',
        'plans.managePlan': 'Manage Plan',
        'deleteDialog.title': 'Delete Account',
        'deleteDialog.description': 'This action cannot be undone. All your data will be permanently deleted.',
        'deleteDialog.passwordLabel': 'Enter your password to confirm',
        'deleteDialog.passwordPlaceholder': 'Your password',
        'deleteDialog.whatDeleted': 'The following will be deleted:',
        'deleteDialog.items.profile': 'Your profile and personal information',
        'deleteDialog.items.usage': 'Your usage history and logs',
        'deleteDialog.items.subscription': 'Your subscription and billing data',
        'deleteDialog.items.exports': 'All your exported files',
        'deleteDialog.cancel': 'Cancel',
        'deleteDialog.deleting': 'Deleting...',
        'deleteDialog.deleteButton': 'Delete My Account',
        'toast.upgradeFailed': 'Upgrade Failed',
        'toast.billingError': 'Billing Error',
        'toast.exportSuccess': 'Data Exported',
        'toast.exportSuccessDesc': 'Your personal data has been downloaded.',
        'toast.exportFailed': 'Export Failed',
        'toast.deletionSuccess': 'Account Deleted',
        'toast.deletionSuccessDesc': 'Your account has been successfully deleted.',
        'toast.deletionFailed': 'Deletion Failed',
        'toast.passwordRequired': 'Password Required',
        'toast.passwordRequiredDesc': 'Please enter your password to confirm deletion.',
      }
      return translations[key] || key
    }
    t.rich = t
    return t
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CreditCard: (props: any) => <svg data-testid="credit-card-icon" {...props} />,
  User: (props: any) => <svg data-testid="user-icon" {...props} />,
  Check: (props: any) => <svg data-testid="check-icon" {...props} />,
  Download: (props: any) => <svg data-testid="download-icon" {...props} />,
  Shield: (props: any) => <svg data-testid="shield-icon" {...props} />,
  AlertTriangle: (props: any) => <svg data-testid="alert-icon" {...props} />,
  BarChart3: (props: any) => <svg data-testid="bar-chart-icon" {...props} />,
  TrendingUp: (props: any) => <svg data-testid="trending-icon" {...props} />,
  Activity: (props: any) => <svg data-testid="activity-icon" {...props} />,
  RefreshCw: (props: any) => <svg data-testid="refresh-icon" {...props} />,
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} />
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}))

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  DialogFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}))

// Mock chart components
jest.mock('@/components/usage-chart', () => ({
  UsageChart: ({ title }: any) => <div data-testid="usage-chart">{title}</div>,
  UsageDataPoint: {},
}))

jest.mock('@/components/usage-breakdown-chart', () => ({
  UsageBreakdownChart: ({ title }: any) => <div data-testid="usage-breakdown-chart">{title}</div>,
  UsageBreakdown: {},
}))

// Mock toast provider
const mockToast = jest.fn()
jest.mock('@/components/toast-provider', () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock auth store
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  subscription_tier: 'pro' as const,
  role: 'user' as const,
  usage_count: 150,
  usage_limit: 2000,
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
}
jest.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({ user: mockUser }),
}))

// Mock services
const mockGetPricing = jest.fn()
const mockCreateCheckout = jest.fn()
const mockCreatePortalSession = jest.fn()
jest.mock('@/services/billing.service', () => ({
  billingService: {
    getPricing: (...args: any[]) => mockGetPricing(...args),
    createCheckout: (...args: any[]) => mockCreateCheckout(...args),
    createPortalSession: (...args: any[]) => mockCreatePortalSession(...args),
  },
}))

const mockExportPersonalData = jest.fn()
const mockDeleteAccount = jest.fn()
const mockResetOnboarding = jest.fn()
jest.mock('@/services/user.service', () => ({
  userService: {
    exportPersonalData: (...args: any[]) => mockExportPersonalData(...args),
    deleteAccount: (...args: any[]) => mockDeleteAccount(...args),
    resetOnboarding: (...args: any[]) => mockResetOnboarding(...args),
  },
}))

const mockGetDailyUsage = jest.fn()
const mockGetActionBreakdown = jest.fn()
jest.mock('@/services/analytics.service', () => ({
  __esModule: true,
  default: {
    getDailyUsage: (...args: any[]) => mockGetDailyUsage(...args),
    getActionBreakdown: (...args: any[]) => mockGetActionBreakdown(...args),
  },
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetPricing.mockResolvedValue({
      tiers: [
        {
          name: 'free',
          price: 0,
          leads_limit: 50,
          description: 'Basic access',
          features: ['50 leads/month'],
        },
        {
          name: 'starter',
          price: 49,
          leads_limit: 500,
          description: 'Small business',
          features: ['500 leads/month', 'Phone numbers'],
        },
        {
          name: 'pro',
          price: 149,
          leads_limit: 2000,
          description: 'Growing teams',
          features: ['2000 leads/month', 'Email addresses'],
        },
      ],
    })
    mockGetDailyUsage.mockResolvedValue({
      daily_usage: [
        { date: '2026-01-01', search: 10, export: 5, total: 15 },
      ],
    })
    mockGetActionBreakdown.mockResolvedValue({
      breakdown: [
        { action: 'search', count: 100, percentage: 60 },
        { action: 'export', count: 50, percentage: 30 },
        { action: 'api', count: 20, percentage: 10 },
      ],
    })
  })

  describe('Rendering', () => {
    it('renders page title and subtitle', async () => {
      render(<SettingsPage />)

      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument()
    })

    it('renders profile section with user name and email', async () => {
      render(<SettingsPage />)

      expect(screen.getByText('Profile Information')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    it('renders current plan badge', async () => {
      render(<SettingsPage />)

      expect(screen.getByText('pro')).toBeInTheDocument()
    })

    it('renders usage statistics', async () => {
      render(<SettingsPage />)

      // Shows usage_count / usage_limit
      expect(screen.getByText('150 / 2000')).toBeInTheDocument()
      // Remaining (1850) appears in both profile card and usage stats card
      expect(screen.getAllByText('1850').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Billing section', () => {
    it('renders billing section with current plan for paid users', async () => {
      render(<SettingsPage />)

      expect(screen.getByText('Billing & Subscription')).toBeInTheDocument()
      expect(screen.getByText('Manage Billing')).toBeInTheDocument()
    })

    it('renders pricing tiers after loading', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Available Plans')).toBeInTheDocument()
        expect(screen.getByText('$0')).toBeInTheDocument()
        expect(screen.getByText('$49')).toBeInTheDocument()
        expect(screen.getByText('$149')).toBeInTheDocument()
      })
    })

    it('shows Current badge for user current plan', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Current')).toBeInTheDocument()
      })
    })

    it('shows upgrade button for non-current paid tiers', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Upgrade')).toBeInTheDocument()
      })
    })
  })

  describe('Privacy & Data section', () => {
    it('renders GDPR export button', async () => {
      render(<SettingsPage />)

      expect(screen.getByText('Download My Data (GDPR)')).toBeInTheDocument()
    })

    it('calls exportPersonalData when download button is clicked', async () => {
      mockExportPersonalData.mockResolvedValueOnce({ user: {}, exported_at: '2026-01-01' })

      render(<SettingsPage />)

      fireEvent.click(screen.getByText('Download My Data (GDPR)'))

      await waitFor(() => {
        expect(mockExportPersonalData).toHaveBeenCalled()
      })
    })

    it('shows success toast after successful data export', async () => {
      mockExportPersonalData.mockResolvedValueOnce({ user: {}, exported_at: '2026-01-01' })

      render(<SettingsPage />)

      fireEvent.click(screen.getByText('Download My Data (GDPR)'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Data Exported',
          })
        )
      })
    })

    it('renders delete account button', async () => {
      render(<SettingsPage />)

      expect(screen.getByText('Delete Account', { selector: 'button' })).toBeInTheDocument()
    })

    it('shows delete confirmation dialog with password input when delete button is clicked', async () => {
      render(<SettingsPage />)

      // Click the delete button in the privacy section
      fireEvent.click(screen.getByLabelText('Delete Account'))

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument()
        expect(screen.getByText('Enter your password to confirm')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
      })
    })

    it('calls deleteAccount with password when confirmed', async () => {
      mockDeleteAccount.mockResolvedValueOnce({ message: 'Account deleted' })

      render(<SettingsPage />)

      // Open delete dialog
      fireEvent.click(screen.getByLabelText('Delete Account'))

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument()
      })

      // Type password
      fireEvent.change(screen.getByPlaceholderText('Your password'), {
        target: { value: 'mypassword123' },
      })

      // Click delete confirmation button
      fireEvent.click(screen.getByText('Delete My Account'))

      await waitFor(() => {
        expect(mockDeleteAccount).toHaveBeenCalledWith('mypassword123')
      })
    })

    it('disables delete confirmation when no password entered', async () => {
      render(<SettingsPage />)

      // Open delete dialog
      fireEvent.click(screen.getByLabelText('Delete Account'))

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument()
      })

      // Delete My Account button should be disabled without password
      expect(screen.getByText('Delete My Account')).toBeDisabled()
    })
  })

  describe('Analytics section', () => {
    it('loads analytics data on mount', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(mockGetDailyUsage).toHaveBeenCalledWith(30)
        expect(mockGetActionBreakdown).toHaveBeenCalledWith(30)
      })
    })

    it('renders usage chart and breakdown chart after loading', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('usage-chart')).toBeInTheDocument()
        expect(screen.getByTestId('usage-breakdown-chart')).toBeInTheDocument()
      })
    })

    it('renders auto-refresh toggle', async () => {
      render(<SettingsPage />)

      expect(screen.getByText('Auto-refresh (30s)')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('renders refresh button for analytics', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument()
      })
    })
  })

  describe('Restart Tutorial', () => {
    it('renders restart tutorial button', async () => {
      render(<SettingsPage />)

      // "Restart Tutorial" appears as both heading and button text
      const elements = screen.getAllByText('Restart Tutorial')
      expect(elements.length).toBeGreaterThanOrEqual(1)
      // Verify the button specifically exists
      expect(screen.getByLabelText('Restart Tutorial')).toBeInTheDocument()
    })
  })

  describe('Upgrade flow', () => {
    it('shows error toast when upgrade fails', async () => {
      mockCreateCheckout.mockRejectedValueOnce({ message: 'Payment failed' })

      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Available Plans')).toBeInTheDocument()
      })

      const upgradeButtons = screen.getAllByText('Upgrade')
      fireEvent.click(upgradeButtons[0])

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Upgrade Failed',
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('Manage billing', () => {
    it('shows error toast when manage billing fails', async () => {
      mockCreatePortalSession.mockRejectedValueOnce({ message: 'Billing error' })

      render(<SettingsPage />)

      fireEvent.click(screen.getByText('Manage Billing'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Billing Error',
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('Restart tutorial flow', () => {
    it('calls resetOnboarding and shows toast', async () => {
      mockResetOnboarding.mockResolvedValueOnce(undefined)

      render(<SettingsPage />)

      fireEvent.click(screen.getByLabelText('Restart Tutorial'))

      await waitFor(() => {
        expect(mockResetOnboarding).toHaveBeenCalled()
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Tutorial Reset',
          })
        )
      })
    })

    it('shows error toast when restart tutorial fails', async () => {
      mockResetOnboarding.mockRejectedValueOnce({ message: 'Reset failed' })

      render(<SettingsPage />)

      fireEvent.click(screen.getByLabelText('Restart Tutorial'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to restart tutorial',
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('Analytics error', () => {
    it('handles analytics load failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockGetDailyUsage.mockRejectedValueOnce(new Error('API error'))
      mockGetActionBreakdown.mockRejectedValueOnce(new Error('API error'))

      render(<SettingsPage />)

      await waitFor(() => {
        // Should still render the page without crashing
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Error handling', () => {
    it('shows toast on export data failure', async () => {
      mockExportPersonalData.mockRejectedValueOnce(new Error('Network error'))

      render(<SettingsPage />)

      fireEvent.click(screen.getByText('Download My Data (GDPR)'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Export Failed',
            variant: 'destructive',
          })
        )
      })
    })

    it('shows toast when delete account fails', async () => {
      mockDeleteAccount.mockRejectedValueOnce(new Error('Delete failed'))

      render(<SettingsPage />)

      // Open delete dialog
      fireEvent.click(screen.getByLabelText('Delete Account'))

      // Enter password
      const passwordInput = screen.getByPlaceholderText('Your password')
      fireEvent.change(passwordInput, { target: { value: 'mypassword' } })

      // Click delete
      fireEvent.click(screen.getByText('Delete My Account'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Deletion Failed',
            variant: 'destructive',
          })
        )
      })
    })
  })

})
