## Overview
This is a project with latest Nextjs app router and serverless api. It is a simple website that allows user to login and register.

Only login functionality is implemented with UI, the register functionality is implemented with API.

Login API generates the JWT token upon login.The JWT token is encrypted with a secret key and the token is valid for 30 days. The JWT token is required for calling the get user endpoint.

Project is using MongoDB as the database. The database can be hosted on MongoDB Atlas, but it can be run locally as well using docker compose.

Implemented with a databse based user locking machanism. If a user tries to login with wrong password 3 times, the user will be locked for maximum 5 minutes.

## Tech Stack
NextJs, MongoDB, Docker, Docker Compose, Typescript, TailwindCSS, Jest, React Testing Library, Prisma

## Configuration
At .env file <br>
```DATABASE_URL``` : Mongodb connection URL <br>
```SECRET_KEY``` : A long string to encrypt/decrypt the JWT token

## Getting Started
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Here is a gif shows how the website works<br>
![Alt text](demo.gif)

## Run with Docker
```bash
docker-compose up
```

## To DOs
1. All docker related configuration has not be tested throughly
2. Integration Test is not working properly, still needs further troubleshooting about the database connection in docker container
3. Implement logging machanism
4. Implement a better error handling machanism
5. Implement API middleware to validate the JWT token for all the protected endpoints
6. Implement API middleware to handle the rate limiting to stop brute force attack
7. Deploy to cloud using Google/Azure/Vercel
