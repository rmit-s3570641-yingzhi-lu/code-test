import { signJwtAccessToken } from "@/utils/jwt";
import prisma from "@/utils/database";
import * as bcrypt from "bcrypt";
import moment from "moment";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  accessToken: string;
}

const genericLoginErrorMessage = "Invalid username or password";

export async function POST(request: Request) {
  const body: LoginRequest = await request.json();

  const user = await prisma.user.findFirst({
    where: {
      email: body.username,
    },
  });

  if(!user){
    // User Not Found, as user not found 
    return new Response(JSON.stringify({ message: genericLoginErrorMessage }), { status: 400 });
  }

  if (user) {
    const currentAttemptTime = new Date();
    var currentLoginAttempts = user.loginAttempts;

    // If user is locked and 5 minutes have passed since last attempt, unlock user
    if(user.userLocked){
      if(user.attemptAt && (moment(currentAttemptTime).diff(moment(user.attemptAt), "seconds") > 5*60)){
        console.log("Resetting user's login attempts and unlocking user after 5 minutes");
        currentLoginAttempts = 0;
        await prisma.user.update({
          where: {
            id: user.id
          }, 
          data: {
            attemptAt: null,
            modifiedAt: new Date(),
            loginAttempts: currentLoginAttempts,
            userLocked: false
          }
        });
      }else{
        return new Response(JSON.stringify(
          { 
            message: "User is locked. Please wait for 5 minutes before try again." 
          }), 
          { 
            status: 423 
          });
      }
    }

    const isPasswordMatch = await bcrypt.compare(body.password, user.password);
    if (!isPasswordMatch) {
      // If user is not locked but failed, increment login attempts, lock user if 3 attempts have been made
      await prisma.user.update({
        where: {
          id: user.id
        }
        , data: {
          attemptAt: currentAttemptTime,
          modifiedAt: new Date(),
          loginAttempts: currentLoginAttempts + 1,
          userLocked: currentLoginAttempts + 1 >= 3 ? true : false
        }
      });
      return new Response(JSON.stringify({ message: genericLoginErrorMessage }), { status: 400 });
    }
  }

  // Sign the JWT token without password and return to client
  const { password, ...userWithoutPass } = user;
  const result: LoginResponse = {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    accessToken: signJwtAccessToken(userWithoutPass),
  };

  return new Response(JSON.stringify(result), { status: 200 });
}