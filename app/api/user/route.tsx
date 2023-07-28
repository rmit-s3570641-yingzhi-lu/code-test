import prisma from "@/utils/database";
import { verifyJwt } from "@/utils/jwt"
import * as bcrypt from "bcrypt";

interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

// Create User in Database
export async function POST(request: Request) {
    const body: CreateUserRequest = await request.json();

    const userExists = await prisma.user.findUnique({
        where: {
            email: body.email,
        },
    });

    if(userExists) {
        return new Response(JSON.stringify({ message: "User already exists" }), {
            status: 400,
        });
    }

    const user = await prisma.user.create({
        data: {
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            password: await bcrypt.hash(body.password, 10),
        },
    });

    const {password, ...userWithoutPassword} = user;

    return new Response(JSON.stringify(userWithoutPassword), {
        status: 200,
    });
}

// Sample GET method to use the JWT token
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
  
    // Attribute validation
    if(email === null) {
      return new Response("Email is required", {status: 400});
    }
  
    // Validate JWT token
    const accessToken = request.headers.get("authorization");
    if(accessToken === null) {
      return new Response(JSON.stringify({error: "unauthorized",}),{status: 401});
    }
    
    const decodedToken = verifyJwt(accessToken);
    if (decodedToken === null) {
      return new Response(JSON.stringify({error: "unauthorized",}),{status: 401});
    }

    if(decodedToken.email !== email) {
      return new Response(JSON.stringify({ message: "Invalid Token"}), {status:400});
    }
  
    const userExists = await prisma.user.findUnique({
      where: { email: email }
    });
  
    if (!userExists) {
      return new Response(JSON.stringify({ message: "User Not Found" }), {
        status: 404,
      });
    }
  
    const {password, ...userWithoutPassword} = userExists; 
    
    return new Response(JSON.stringify(userWithoutPassword), {
      status: 200,
    });
  }