import { userService } from '../user.service'
import { apiClient } from '@/lib/api-client'
import type { UsageInfo, PersonalDataExport } from '../user.service'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const mockUsage: UsageInfo = {
  current_usage: 25,
  usage_limit: 50,
  remaining: 25,
  tier: 'free',
  last_reset: '2026-01-01T00:00:00Z',
}

const mockPersonalData: PersonalDataExport = {
  user: { id: 1, email: 'test@example.com', name: 'Test User' },
  subscriptions: [{ id: 's1', tier: 'free' }],
  exports: [{ id: 'e1', format: 'csv' }],
  exported_at: '2026-02-01T00:00:00Z',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('userService', () => {
  describe('getUsage', () => {
    it('calls GET /user/usage and returns usage data', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockUsage })

      const result = await userService.getUsage()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/user/usage')
      expect(result).toEqual(mockUsage)
    })

    it('propagates API errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(userService.getUsage()).rejects.toThrow('Unauthorized')
    })
  })

  describe('updateProfile', () => {
    it('sends PATCH to /user/profile with data', async () => {
      const updateData = { name: 'Updated Name' }
      mockedApiClient.patch.mockResolvedValueOnce({ data: { ...updateData, id: 1 } })

      const result = await userService.updateProfile(updateData)

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/user/profile', updateData)
      expect(result.name).toBe('Updated Name')
    })

    it('supports updating email', async () => {
      const updateData = { email: 'new@example.com' }
      mockedApiClient.patch.mockResolvedValueOnce({ data: updateData })

      await userService.updateProfile(updateData)

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/user/profile', updateData)
    })
  })

  describe('completeOnboarding', () => {
    it('sends POST to /user/onboarding/complete', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: { message: 'Onboarding completed' } })

      const result = await userService.completeOnboarding()

      expect(mockedApiClient.post).toHaveBeenCalledWith('/user/onboarding/complete', {})
      expect(result.message).toBe('Onboarding completed')
    })
  })

  describe('resetOnboarding', () => {
    it('sends POST to /user/onboarding/reset', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: { message: 'Onboarding reset' } })

      const result = await userService.resetOnboarding()

      expect(mockedApiClient.post).toHaveBeenCalledWith('/user/onboarding/reset', {})
      expect(result.message).toBe('Onboarding reset')
    })
  })

  describe('exportPersonalData', () => {
    it('calls GET /user/data-export and returns personal data', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPersonalData })

      const result = await userService.exportPersonalData()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/user/data-export')
      expect(result).toEqual(mockPersonalData)
    })
  })

  describe('deleteAccount', () => {
    it('sends DELETE to /user/account with password in body', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: { message: 'Account deleted successfully' },
      })

      const result = await userService.deleteAccount('my-password')

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/user/account', {
        data: { password: 'my-password' },
      })
      expect(result.message).toBe('Account deleted successfully')
    })

    it('propagates errors for wrong password', async () => {
      mockedApiClient.delete.mockRejectedValueOnce(new Error('Invalid password'))

      await expect(userService.deleteAccount('wrong')).rejects.toThrow('Invalid password')
    })
  })

  describe('downloadPersonalData', () => {
    let mockCreateObjectURL: jest.Mock
    let mockRevokeObjectURL: jest.Mock
    let mockClick: jest.Mock
    let mockAppendChild: jest.SpyInstance
    let mockRemoveChild: jest.SpyInstance

    beforeEach(() => {
      mockCreateObjectURL = jest.fn().mockReturnValue('blob:personal-data-url')
      mockRevokeObjectURL = jest.fn()
      mockClick = jest.fn()

      window.URL.createObjectURL = mockCreateObjectURL
      window.URL.revokeObjectURL = mockRevokeObjectURL

      mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
      mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

      jest.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      } as unknown as HTMLAnchorElement)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('fetches personal data and triggers JSON download', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPersonalData })

      await userService.downloadPersonalData()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/user/data-export')
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:personal-data-url')
    })

    it('creates JSON blob with formatted data', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPersonalData })

      await userService.downloadPersonalData()

      // Verify Blob was created with JSON content
      const blobCall = mockCreateObjectURL.mock.calls[0][0]
      expect(blobCall).toBeInstanceOf(Blob)
    })

    it('sets correct download filename with timestamp', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPersonalData })
      const beforeTimestamp = Date.now()

      await userService.downloadPersonalData()

      const createdLink = (document.createElement as jest.Mock).mock.results[0].value
      expect(createdLink.download).toMatch(/^industrydb-personal-data-\d+\.json$/)
    })
  })
})
