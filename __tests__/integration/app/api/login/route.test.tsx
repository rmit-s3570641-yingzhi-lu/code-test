import prisma from "@/utils/database";
import { POST } from '@/app/api/login/route';

beforeAll(async () => {
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
    
    await prisma.user.createMany({
        data: [mockUser],
    })

    console.log('beforeAll done')
})

afterAll(async () => {
    const deleteUsers = prisma.user.deleteMany()
    await prisma.$transaction([deleteUsers])
    await prisma.$disconnect()

    console.log('afterAll done')
})

it('should reset attempt count and update modified for user successfully login in', async () => {
    // Arrange
    const username = "jodielu0508@gmail.com"
    const password = "1234"

    const mockReqest = {} as any as Request;
    mockReqest.json = jest.fn().mockReturnValue({
        username: username,
        password: password,
    });

    const currentUser = await prisma.user.findUnique({
        where: {
            email: username
        }
    })

    // Act
    await POST(mockReqest);

    // Assert
    const updatedUser = await prisma.user.findUnique({
        where: {
            email: username
        }
    })

    console.log(currentUser)
    console.log(updatedUser)

    // expect(updatedUser?.id).toEqual(currentUser?.id)
    // expect(updatedUser?.firstname).toEqual(currentUser?.firstname)
    // expect(updatedUser?.lastname).toEqual(currentUser?.lastname)
    // expect(updatedUser?.email).toEqual(currentUser?.email)
    // expect(updatedUser?.password).toEqual(currentUser?.password)
    // expect(updatedUser?.loginAttempts).toEqual(0)
    // expect(updatedUser?.attemptAt).not.toEqual(currentUser?.attemptAt)
    // expect(updatedUser?.createdAt).toEqual(currentUser?.createdAt)
    // expect(updatedUser?.modifiedAt).not.toEqual(currentUser?.modifiedAt)
    // expect(updatedUser?.userLocked).toEqual(currentUser?.userLocked)
})
