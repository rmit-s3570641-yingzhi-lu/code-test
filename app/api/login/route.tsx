import { signJwtAccessToken } from "@/utils/jwt";
import prisma from "@/utils/database";
import * as bcrypt from "bcrypt";

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

  const isPasswordMatch = user && (await bcrypt.compare(body.password, user.password));
  if(!isPasswordMatch){
    return new Response(JSON.stringify({ message: "Invalid username or password" }), {  status: 400,});
  }
    
  // Sign the JWT token without password and return to client
  const { password, ...userWithoutPass } = user;
  const result : LoginResponse = {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    accessToken: signJwtAccessToken(userWithoutPass),
  };

  return new Response(JSON.stringify(result), { status: 200 });
}