import { POST } from '@/app/api/login/route';
import { prismaMock } from '@/mocks/database';

// Arrange
const mockAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

test('should return 200 OK with user information and access token on successful login', async () => {
  //Arrange
  prismaMock.user.findFirst.mockResolvedValue(null);

  const mockRequest = {
    username: 'jodielu0508@gmail.com',
    password: '1234',
  } as any as Request
  
  const response = await POST(mockRequest);

  const expectedResponse = {
    message : "Username doesn't exists."
  };

  expect(response.status).toBe(400);
  expect(await response.json()).toEqual(expectedResponse);
})

