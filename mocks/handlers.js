import { rest } from 'msw';

export const handlers = [
  rest.get('/api/login', (req, res, ctx) => {
    return res(
        ctx.status(200),
        ctx.json([{ id: 1, firstName: 'Jodie', lastName: 'Lu', email:'test@gmail.com', accessToken: '123' }]))
  }),
  rest.post('/api/auth', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
];