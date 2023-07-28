import { POST } from '@/app/api/login/route';
import prisma from '@/utils/database';
import { signJwtAccessToken } from '@/utils/jwt';

// Arrange
const mockAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

jest.mock('@/utils/database', () => ({
  user: {
    findFirst: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('@/utils/jwt', () => ({
  signJwtAccessToken: jest.fn(() => mockAccessToken),
}));

// Act & Assert
describe('Login endpoint', () => {
  const mockRequest = (body) => ({
    json: async () => body,
  });

  it('should return 200 OK with user information and access token on successful login', async () => {

    const mockUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      password: '$2b$10$h7.MhTlrRDlXq1Jit74bFeIK9lzmWVt5wXzpjUHO.Ji4KxDkVJlRi',
    };

    require('@/utils/database').user.findFirst.mockResolvedValue(mockUser);
    require('bcrypt').compare.mockResolvedValue(true);

    const request = mockRequest({
      username: 'jodielu0508@gmail.com',
      password: '1234',
    });
    const response = await POST(request);

    const expectedResponse = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      accessToken: mockAccessToken,
    };

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expectedResponse);
  });

  it('should return 400 Bad Request on invalid username or password', async () => {

    require('@/utils/database').user.findFirst.mockResolvedValue(null);
    require('bcrypt').compare.mockResolvedValue(false);

    const request = mockRequest({
      username: 'jodielu0508@gmail.com',
      password: '4567',
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Invalid username or password' });
  });
});
