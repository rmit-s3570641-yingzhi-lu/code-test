import "@testing-library/jest-dom/extend-expect";
import { server } from "./mocks/server.js";
import 'whatwg-fetch';

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks(); // Clear useRouter mock between tests
});
afterAll(() => server.close());
