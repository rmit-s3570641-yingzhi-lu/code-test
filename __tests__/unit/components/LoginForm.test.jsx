import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../../../components/LoginForm";
import { server } from '../../../mocks/server';
import { rest } from 'msw';

describe("LoginForm", () => {
  it("should enter username and password and click on login button", async () => {
    render(<LoginForm />);
    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });
    expect(loginButton).toBeDisabled();
    await userEvent.type(usernameInput, "test");
    await userEvent.type(passwordInput, "test");
    expect(loginButton).toBeEnabled();
    await userEvent.click(loginButton);
    await waitFor(() => {
        expect(screen.getByText('Success Logging In')).toBeInTheDocument();
    });
  });

  it('should login user and display error message', async () => {
    server.use(
      rest.post('/api/login', (req, res, ctx) => {
        return res(
            ctx.status(423),
            ctx.json({ message: 'User is locked' }))
      })
    );
    render(<LoginForm />);
    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });
    expect(loginButton).toBeDisabled();
    await userEvent.type(usernameInput, "test");
    await userEvent.type(passwordInput, "test");
    expect(loginButton).toBeEnabled();
    await userEvent.click(loginButton);
    await waitFor(() => {
        expect(screen.getByText('User is locked')).toBeInTheDocument();
    });
  });
});
