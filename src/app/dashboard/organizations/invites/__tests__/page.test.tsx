import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrganizationInvitesPage from '../page'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock toast
const mockToast = jest.fn()
jest.mock('@/components/toast-provider', () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock organization service
const mockGetPendingInvites = jest.fn()
const mockAcceptInvite = jest.fn()
const mockDeclineInvite = jest.fn()
jest.mock('@/services/organization.service', () => ({
  __esModule: true,
  default: {
    getPendingInvites: (...args: any[]) => mockGetPendingInvites(...args),
    acceptInvite: (...args: any[]) => mockAcceptInvite(...args),
    declineInvite: (...args: any[]) => mockDeclineInvite(...args),
  },
}))

const mockInvites = [
  {
    id: 1,
    organization_id: 100,
    organization_name: 'Acme Corp',
    organization_tier: 'business' as const,
    role: 'member' as const,
    invited_by_email: 'admin@acme.com',
    invited_at: '2026-02-02T10:00:00Z',
    status: 'pending' as const,
  },
  {
    id: 2,
    organization_id: 200,
    organization_name: 'Tech Startup',
    organization_tier: 'pro' as const,
    role: 'admin' as const,
    invited_by_email: 'ceo@techstartup.com',
    invited_at: '2026-02-03T14:30:00Z',
    status: 'pending' as const,
  },
]

describe('OrganizationInvitesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading state', () => {
    it('shows loading spinner while fetching invites', () => {
      mockGetPendingInvites.mockImplementation(
        () => new Promise(() => {}) // never resolves
      )
      render(<OrganizationInvitesPage />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no pending invites', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({ invites: [], total: 0 })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('No pending invitations')).toBeInTheDocument()
      })
      expect(
        screen.getByText("You'll see organization invitations here when someone invites you")
      ).toBeInTheDocument()
    })
  })

  describe('Displaying invites', () => {
    it('renders invite cards with organization details', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({
        invites: mockInvites,
        total: 2,
      })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })
      expect(screen.getByText('Tech Startup')).toBeInTheDocument()
    })

    it('shows invited by email', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({
        invites: mockInvites,
        total: 2,
      })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText(/admin@acme.com/)).toBeInTheDocument()
      })
      expect(screen.getByText(/ceo@techstartup.com/)).toBeInTheDocument()
    })

    it('shows tier badges', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({
        invites: mockInvites,
        total: 2,
      })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Business')).toBeInTheDocument()
      })
      expect(screen.getByText('Pro')).toBeInTheDocument()
    })

    it('shows role badges', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({
        invites: mockInvites,
        total: 2,
      })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Member')).toBeInTheDocument()
      })
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    it('shows accept and decline buttons for each invite', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({
        invites: mockInvites,
        total: 2,
      })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        const acceptButtons = screen.getAllByRole('button', { name: /accept/i })
        const declineButtons = screen.getAllByRole('button', { name: /decline/i })
        expect(acceptButtons).toHaveLength(2)
        expect(declineButtons).toHaveLength(2)
      })
    })
  })

  describe('Accepting invites', () => {
    it('calls organizationService.acceptInvite with correct id', async () => {
      mockGetPendingInvites
        .mockResolvedValueOnce({ invites: mockInvites, total: 2 })
        .mockResolvedValueOnce({ invites: [], total: 0 })
      mockAcceptInvite.mockResolvedValueOnce({ message: 'Accepted' })

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const acceptButtons = screen.getAllByRole('button', { name: /accept/i })
      await userEvent.click(acceptButtons[0])

      await waitFor(() => {
        expect(mockAcceptInvite).toHaveBeenCalledWith(1)
      })
    })

    it('shows success toast after accepting', async () => {
      mockGetPendingInvites
        .mockResolvedValueOnce({ invites: mockInvites, total: 2 })
        .mockResolvedValueOnce({ invites: [], total: 0 })
      mockAcceptInvite.mockResolvedValueOnce({ message: 'Accepted' })

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const acceptButtons = screen.getAllByRole('button', { name: /accept/i })
      await userEvent.click(acceptButtons[0])

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Invitation accepted',
            variant: 'success',
          })
        )
      })
    })

    it('redirects to organizations page after accepting', async () => {
      mockGetPendingInvites
        .mockResolvedValueOnce({ invites: mockInvites, total: 2 })
        .mockResolvedValueOnce({ invites: [], total: 0 })
      mockAcceptInvite.mockResolvedValueOnce({ message: 'Accepted' })

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const acceptButtons = screen.getAllByRole('button', { name: /accept/i })
      await userEvent.click(acceptButtons[0])

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/organizations')
      })
    })

    it('shows error toast when accept fails', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({
        invites: mockInvites,
        total: 2,
      })
      mockAcceptInvite.mockRejectedValueOnce(new Error('Network error'))

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const acceptButtons = screen.getAllByRole('button', { name: /accept/i })
      await userEvent.click(acceptButtons[0])

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to accept invitation',
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('Declining invites', () => {
    it('calls organizationService.declineInvite with correct id', async () => {
      mockGetPendingInvites
        .mockResolvedValueOnce({ invites: mockInvites, total: 2 })
        .mockResolvedValueOnce({ invites: [mockInvites[1]], total: 1 })
      mockDeclineInvite.mockResolvedValueOnce({ message: 'Declined' })

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const declineButtons = screen.getAllByRole('button', { name: /decline/i })
      await userEvent.click(declineButtons[0])

      await waitFor(() => {
        expect(mockDeclineInvite).toHaveBeenCalledWith(1)
      })
    })

    it('shows success toast after declining', async () => {
      mockGetPendingInvites
        .mockResolvedValueOnce({ invites: mockInvites, total: 2 })
        .mockResolvedValueOnce({ invites: [mockInvites[1]], total: 1 })
      mockDeclineInvite.mockResolvedValueOnce({ message: 'Declined' })

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const declineButtons = screen.getAllByRole('button', { name: /decline/i })
      await userEvent.click(declineButtons[0])

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Invitation declined',
            variant: 'success',
          })
        )
      })
    })

    it('reloads invites after declining', async () => {
      mockGetPendingInvites
        .mockResolvedValueOnce({ invites: mockInvites, total: 2 })
        .mockResolvedValueOnce({ invites: [mockInvites[1]], total: 1 })
      mockDeclineInvite.mockResolvedValueOnce({ message: 'Declined' })

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const declineButtons = screen.getAllByRole('button', { name: /decline/i })
      await userEvent.click(declineButtons[0])

      await waitFor(() => {
        // Should have called getPendingInvites twice: initial load + after decline
        expect(mockGetPendingInvites).toHaveBeenCalledTimes(2)
      })
    })

    it('shows error toast when decline fails', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({
        invites: mockInvites,
        total: 2,
      })
      mockDeclineInvite.mockRejectedValueOnce(new Error('Server error'))

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const declineButtons = screen.getAllByRole('button', { name: /decline/i })
      await userEvent.click(declineButtons[0])

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to decline invitation',
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('Error handling', () => {
    it('shows error toast when loading invites fails', async () => {
      mockGetPendingInvites.mockRejectedValueOnce(new Error('Failed to load'))

      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to load invitations',
            variant: 'destructive',
          })
        )
      })
    })

    it('does not show backend pending notice after API integration', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({ invites: [], total: 0 })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(screen.getByText('No pending invitations')).toBeInTheDocument()
      })

      expect(screen.queryByText('Backend Integration Pending')).not.toBeInTheDocument()
    })
  })

  describe('Page header', () => {
    it('renders page title and description', async () => {
      mockGetPendingInvites.mockResolvedValueOnce({ invites: [], total: 0 })
      render(<OrganizationInvitesPage />)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Organization Invitations' })
        ).toBeInTheDocument()
      })
      expect(
        screen.getByText('Accept or decline invitations to join organizations')
      ).toBeInTheDocument()
    })
  })
})
