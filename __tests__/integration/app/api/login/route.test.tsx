import prisma from "@/utils/database";
import { POST } from '@/app/api/login/route';

beforeEach(async () => {
    const deleteUsers = prisma.user.deleteMany()
    await prisma.$transaction([deleteUsers])
})

afterAll(async () => {
    await prisma.$disconnect()
})

it('should reset attempt count and update modified for user successfully login in with 3 attempts', async () => {
    // Arrange
    const mockUser = {
        firstname: 'Jodie',
        lastname: 'Lu',
        email: 'jodielu0508@gmail.com',
        password: '$2b$10$iRcAvsnene1l4VNXXnQLXeiviWV.czqJbbxCHEHNu4LHuOH0JCqSa',
        userLocked: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        loginAttempts: 2,
        attemptAt: new Date(),
    };
    
    await prisma.user.createMany({
        data: [mockUser],
    })

    const mockReqest = {} as any as Request;
    mockReqest.json = jest.fn().mockReturnValue({
        username: mockUser.email,
        password: "1234",
    });

    const currentUser = await prisma.user.findUnique({
        where: {
            email: mockUser.email
        }
    })

    // Act
    await POST(mockReqest);

    // Assert
    const updatedUser = await prisma.user.findUnique({
        where: {
            email: mockUser.email
        }
    })

    expect(updatedUser?.id).toEqual(currentUser?.id)
    expect(updatedUser?.firstname).toEqual(currentUser?.firstname)
    expect(updatedUser?.lastname).toEqual(currentUser?.lastname)
    expect(updatedUser?.email).toEqual(currentUser?.email)
    expect(updatedUser?.password).toEqual(currentUser?.password)
    expect(updatedUser?.loginAttempts).toEqual(0)
    expect(updatedUser?.attemptAt).toEqual(null)
    expect(updatedUser?.createdAt).toEqual(currentUser?.createdAt)
    expect(updatedUser?.modifiedAt).not.toEqual(currentUser?.modifiedAt)
    expect(updatedUser?.userLocked).toEqual(currentUser?.userLocked)
})

it('should unlock the user after 5 minutes passed since last attempt when password is correct', async () => {
    // Arrange
    const mockUser = {
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
    
    await prisma.user.createMany({
        data: [mockUser],
    })

    const mockReqest = {} as any as Request;
    mockReqest.json = jest.fn().mockReturnValue({
        username: mockUser.email,
        password: "1234",
    });

    const currentUser = await prisma.user.findUnique({
        where: {
            email: mockUser.email
        }
    })

    // Act
    await POST(mockReqest);

    // Assert
    const updatedUser = await prisma.user.findUnique({
        where: {
            email: mockUser.email
        }
    })

    expect(updatedUser?.id).toEqual(currentUser?.id)
    expect(updatedUser?.firstname).toEqual(currentUser?.firstname)
    expect(updatedUser?.lastname).toEqual(currentUser?.lastname)
    expect(updatedUser?.email).toEqual(currentUser?.email)
    expect(updatedUser?.password).toEqual(currentUser?.password)
    expect(updatedUser?.loginAttempts).toEqual(0)
    expect(updatedUser?.attemptAt).toEqual(null)
    expect(updatedUser?.createdAt).toEqual(currentUser?.createdAt)
    expect(updatedUser?.modifiedAt).not.toEqual(currentUser?.modifiedAt)
    expect(updatedUser?.userLocked).toEqual(false)
})

it('should lock the user when user failed to input correct password three times in 5 minutes', async () => {
    // Arrange
    const mockUser = {
        firstname: 'Jodie',
        lastname: 'Lu',
        email: 'jodielu0508@gmail.com',
        password: '$2b$10$iRcAvsnene1l4VNXXnQLXeiviWV.czqJbbxCHEHNu4LHuOH0JCqSa',
        userLocked: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        loginAttempts: 2,
        attemptAt: new Date(),
    };
    
    await prisma.user.createMany({
        data: [mockUser],
    })

    const mockReqest = {} as any as Request;
    mockReqest.json = jest.fn().mockReturnValue({
        username: mockUser.email,
        password: "12345", // Wrong password
    });

    const currentUser = await prisma.user.findUnique({
        where: {
            email: mockUser.email
        }
    })

    // Act
    await POST(mockReqest);

    // Assert
    const updatedUser = await prisma.user.findUnique({
        where: {
            email: mockUser.email
        }
    })

    expect(updatedUser?.id).toEqual(currentUser?.id)
    expect(updatedUser?.firstname).toEqual(currentUser?.firstname)
    expect(updatedUser?.lastname).toEqual(currentUser?.lastname)
    expect(updatedUser?.email).toEqual(currentUser?.email)
    expect(updatedUser?.password).toEqual(currentUser?.password)
    expect(updatedUser?.loginAttempts).toEqual(3)
    expect(updatedUser?.attemptAt).not.toEqual(currentUser?.attemptAt)
    expect(updatedUser?.createdAt).toEqual(currentUser?.createdAt)
    expect(updatedUser?.modifiedAt).not.toEqual(currentUser?.modifiedAt)
    expect(updatedUser?.userLocked).toEqual(true)
})
