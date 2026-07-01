import { createMessageLimiter } from '../src/middleware/rateLimiter.js'

describe('messageLimiter', () => {
  let socket, next, mockRedis, messageLimiter

  beforeEach(() => {
    mockRedis = {
      incr: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
    }
    messageLimiter = createMessageLimiter(mockRedis)
    socket = { userId: 'test-user-id', emit: jest.fn() }
    next = jest.fn()
  })

  test('calls next() when under the rate limit', async () => {
    mockRedis.incr.mockResolvedValue(1)
    mockRedis.expire.mockResolvedValue(1)

    await messageLimiter(socket, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(socket.emit).not.toHaveBeenCalled()
  })

  test('blocks and emits error when rate limit is exceeded', async () => {
    mockRedis.incr.mockResolvedValue(6)
    mockRedis.ttl.mockResolvedValue(8)

    await messageLimiter(socket, next)

    expect(next).not.toHaveBeenCalled()
    expect(socket.emit).toHaveBeenCalledWith('error', expect.objectContaining({
      message: expect.stringContaining('Too many messages')
    }))
  })

  test('fails open when Redis throws an error', async () => {
    mockRedis.incr.mockRejectedValue(new Error('Redis connection lost'))

    await messageLimiter(socket, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})