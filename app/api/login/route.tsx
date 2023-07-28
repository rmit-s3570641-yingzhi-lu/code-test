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

export async function POST(request: Request) {
  const body: LoginRequest = await request.json();

  const user = await prisma.user.findFirst({
    where: {
      email: body.username,
    },
  });

  if(!user){
    // User Not Found, as user not found 
    return new Response(JSON.stringify({ message: "Username doesn't exists." }), { status: 400 });
  }

  if (user) {
    const currentAttemptTime = new Date();
    var currentLoginAttempts = user.loginAttempts;

    const retryIntervalInSeconds = 5*60;
    const diffSeconds = moment(currentAttemptTime).diff(moment(user.attemptAt), "seconds");

    // If user is locked and 5 minutes have passed since last attempt, unlock user
    if(user.userLocked){
      if(user.attemptAt && diffSeconds > retryIntervalInSeconds){
        console.log("Resetting user's login attempts and unlocking user after 5 minutes");
        currentLoginAttempts = 0;
        await resetAttempts(user.id, null, currentLoginAttempts, false);
      }else{
        return new Response(JSON.stringify(
          { 
            message: "User is locked. Please try again after " + (retryIntervalInSeconds-diffSeconds) + " second(s)."
          }), 
          { 
            status: 423 
          });
      }
    }

    const isPasswordMatch = await bcrypt.compare(body.password, user.password);
    if (!isPasswordMatch) {
      // If user is not locked but failed, increment login attempts, lock user if 3 attempts have been made
      const newLoginAttempt = currentLoginAttempts + 1;
      const totalAllowedAttempts = 3;
      await resetAttempts(user.id, currentAttemptTime, newLoginAttempt, newLoginAttempt >= totalAllowedAttempts);

      const error = (totalAllowedAttempts - newLoginAttempt) === 0 
            ? "User is locked. Please try again after " + (retryIntervalInSeconds-diffSeconds) + " second(s)."
            : "Invalid Password! " + (totalAllowedAttempts - newLoginAttempt) + " attempt(s) left.";
            
      return new Response(JSON.stringify({ message: error}), { status: 400 });
    }
  }

  // If user is found and password matches, reset login attempts
  await resetAttempts(user.id, null, 0, false);

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

async function resetAttempts(id : string, attemptAt : Date | null, loginAttempts : number, userLocked : boolean) {
  await prisma.user.update({
    where: {
      id: id
    },
    data: {
      attemptAt: attemptAt,
      modifiedAt: new Date(),
      loginAttempts: loginAttempts,
      userLocked: userLocked
    }
  });
}
