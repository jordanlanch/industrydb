import organizationService from '../organization.service'
import { apiClient } from '@/lib/api-client'
import type {
  Organization,
  OrganizationMember,
  CreateOrganizationRequest,
} from '../organization.service'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const mockOrg: Organization = {
  id: 1,
  name: 'Acme Corp',
  slug: 'acme-corp',
  owner_id: 100,
  subscription_tier: 'pro',
  usage_limit: 2000,
  usage_count: 150,
  last_reset_at: '2026-01-01T00:00:00Z',
  active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const mockMember: OrganizationMember = {
  id: 10,
  organization_id: 1,
  user_id: 200,
  role: 'member',
  status: 'active',
  joined_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
  edges: {
    user: { id: 200, name: 'Jane Smith', email: 'jane@example.com' },
  },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('organizationService', () => {
  describe('createOrganization', () => {
    it('sends POST to /organizations with correct data', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockOrg })

      const createReq: CreateOrganizationRequest = {
        name: 'Acme Corp',
        slug: 'acme-corp',
        tier: 'pro',
      }
      const result = await organizationService.createOrganization(createReq)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizations', createReq)
      expect(result).toEqual(mockOrg)
    })
  })

  describe('listOrganizations', () => {
    it('calls GET /organizations and returns list', async () => {
      const response = { organizations: [mockOrg], total: 1 }
      mockedApiClient.get.mockResolvedValueOnce({ data: response })

      const result = await organizationService.listOrganizations()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizations')
      expect(result.organizations).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('returns empty list when user has no organizations', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: { organizations: [], total: 0 } })

      const result = await organizationService.listOrganizations()

      expect(result.organizations).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('getOrganization', () => {
    it('calls GET /organizations/:id', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockOrg })

      const result = await organizationService.getOrganization(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizations/1')
      expect(result).toEqual(mockOrg)
    })
  })

  describe('updateOrganization', () => {
    it('sends PATCH to /organizations/:id with update data', async () => {
      const updated = { ...mockOrg, name: 'Acme Corp v2' }
      mockedApiClient.patch.mockResolvedValueOnce({ data: updated })

      const result = await organizationService.updateOrganization(1, { name: 'Acme Corp v2' })

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/organizations/1', {
        name: 'Acme Corp v2',
      })
      expect(result.name).toBe('Acme Corp v2')
    })
  })

  describe('deleteOrganization', () => {
    it('sends DELETE to /organizations/:id', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({})

      await organizationService.deleteOrganization(1)

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/organizations/1')
    })
  })

  describe('listMembers', () => {
    it('calls GET /organizations/:id/members', async () => {
      const response = { members: [mockMember], total: 1 }
      mockedApiClient.get.mockResolvedValueOnce({ data: response })

      const result = await organizationService.listMembers(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/organizations/1/members')
      expect(result.members).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe('inviteMember', () => {
    it('sends POST to /organizations/:id/invite', async () => {
      const inviteResponse = {
        message: 'Invitation sent',
        member: mockMember,
      }
      mockedApiClient.post.mockResolvedValueOnce({ data: inviteResponse })

      const result = await organizationService.inviteMember(1, {
        email: 'jane@example.com',
        role: 'member',
      })

      expect(mockedApiClient.post).toHaveBeenCalledWith('/organizations/1/invite', {
        email: 'jane@example.com',
        role: 'member',
      })
      expect(result.message).toBe('Invitation sent')
    })
  })

  describe('removeMember', () => {
    it('sends DELETE to /organizations/:id/members/:userId', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({})

      await organizationService.removeMember(1, 200)

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/organizations/1/members/200')
    })
  })

  describe('updateMemberRole', () => {
    it('sends PATCH to /organizations/:id/members/:userId', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({})

      await organizationService.updateMemberRole(1, 200, { role: 'admin' })

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/organizations/1/members/200', {
        role: 'admin',
      })
    })
  })

  describe('generateSlug', () => {
    it('converts name to lowercase slug', () => {
      expect(organizationService.generateSlug('Acme Corp')).toBe('acme-corp')
    })

    it('replaces special characters with hyphens', () => {
      expect(organizationService.generateSlug('My Company & Partners!')).toBe(
        'my-company-partners'
      )
    })

    it('trims leading and trailing hyphens', () => {
      expect(organizationService.generateSlug('--test--')).toBe('test')
    })

    it('handles multiple consecutive special characters', () => {
      expect(organizationService.generateSlug('foo   bar   baz')).toBe('foo-bar-baz')
    })

    it('handles empty string', () => {
      expect(organizationService.generateSlug('')).toBe('')
    })
  })
})
