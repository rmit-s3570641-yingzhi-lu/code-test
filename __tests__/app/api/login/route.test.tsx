import { POST } from '@/app/api/login/route';
import { prismaMock } from '@/mocks/database';

const mockAccessToken = 'mocked-access-token';
jest.mock('bcrypt', () => ({
  compare: jest.fn()
}))

jest.mock('@/utils/jwt', () => ({
   signJwtAccessToken: jest.fn(() => mockAccessToken),
}))

const mockReqest = {} as any as Request;
mockReqest.json = jest.fn().mockReturnValue({
  username: 'jodielu0508@gmail.com',
  password: '1234',
});

describe("LoginAPI", () => {
  it('should return 400 Bad Request when username not found.', async () => {
    //Arrange
    prismaMock.user.findFirst.mockResolvedValue(null);

    // Act
    const response = await POST(mockReqest);
    const json = await response.json();

    // Assert
    expect(response.status).toEqual(400);
    expect(json.message).toEqual("Username doesn't exists.");
  });

  it('should return 400 Bad Request when password is wrong', async () => {
    //Arrange
    const mockUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      password: 'secure-password',
      userLocked: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
      loginAttempts: 0,
      attemptAt: null
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);
    require('bcrypt').compare.mockResolvedValue(false);

    // Act
    const response = await POST(mockReqest);
    const json = await response.json();

    // Assert
    expect(response.status).toEqual(400);
    expect(json.message).toContain("Invalid Password");
  });

  it('should return 200 when user is not locked and password is correct', async () => {
    //Arrange
    const mockUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      password: '$2b$10$iRcAvsnene1l4VNXXnQLXeiviWV.czqJbbxCHEHNu4LHuOH0JCqSa',
      userLocked: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
      loginAttempts: 0,
      attemptAt: null
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);
    require('bcrypt').compare.mockResolvedValue(true);

    const expectUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      accessToken: mockAccessToken
    }

    // Act
    const response = await POST(mockReqest);
    const json = await response.json();
    console.log(json)

    // Assert
    expect(response.status).toEqual(200);
    expect(json.id).toEqual(expectUser.id);
    expect(json.firstname).toEqual(expectUser.firstname);
    expect(json.lastname).toEqual(expectUser.lastname);
    expect(json.email).toEqual(expectUser.email);
    expect(json.accessToken).toEqual(expectUser.accessToken);
  });

  it('should return 423 Locked when user is locked but attempt login with correct password', async () => {
    //Arrange
    const mockUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      password: '$2b$10$iRcAvsnene1l4VNXXnQLXeiviWV.czqJbbxCHEHNu4LHuOH0JCqSa',
      loginAttempts: 3,
      userLocked: true,
      attemptAt: new Date(Date.now() - 5000), // assume tried 5 seconds ago
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);
    require('bcrypt').compare.mockResolvedValue(true);

    // Act
    const response = await POST(mockReqest);
    const json = await response.json();

    // Assert
    expect(response.status).toEqual(423);
    expect(json.message).toContain("User is locked.")
  });

  it('should return 423 Locked when user attemps 3rd times in 5 minutes', async () => {
    //Arrange
    const mockUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      password: '$2b$10$iRcAvsnene1l4VNXXnQLXeiviWV.czqJbbxCHEHNu4LHuOH0JCqSa',
      loginAttempts: 2, // Has tried twice
      userLocked: false,
      attemptAt: new Date(Date.now() - 5000), // assume tried 5 seconds ago
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);
    require('bcrypt').compare.mockResolvedValue(false); // Failed again this time

    // Act
    const response = await POST(mockReqest);
    const json = await response.json();

    // Assert
    expect(response.status).toEqual(423);
    expect(json.message).toContain("User is locked.")
  });

  it('should return 200 OK with correct password attempt when 5 minutes passed for a locked user', async () => {
    //Arrange
    const mockUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      password: '$2b$10$iRcAvsnene1l4VNXXnQLXeiviWV.czqJbbxCHEHNu4LHuOH0JCqSa',
      loginAttempts: 3,
      userLocked: true, // user is locked
      attemptAt: new Date(Date.now() - 6 * 60 * 1000), // assume tried 6 minutes ago, should login success this time
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);
    require('bcrypt').compare.mockResolvedValue(true);

    const expectUser = {
      id: '1',
      firstname: 'Jodie',
      lastname: 'Lu',
      email: 'jodielu0508@gmail.com',
      accessToken: mockAccessToken
    }

    // Act
    const response = await POST(mockReqest);
    const json = await response.json();

    // Assert
    expect(response.status).toEqual(200);
    expect(json.id).toEqual(expectUser.id);
    expect(json.firstname).toEqual(expectUser.firstname);
    expect(json.lastname).toEqual(expectUser.lastname);
    expect(json.email).toEqual(expectUser.email);
    expect(json.accessToken).toEqual(expectUser.accessToken);
  });
})
