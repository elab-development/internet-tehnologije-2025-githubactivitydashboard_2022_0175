import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

function fillAndSubmit(username = 'una', password = 'tajna') {
  fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: username } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));
}

describe('Login', () => {
  afterEach(() => jest.restoreAllMocks());

  it('šalje POST na /api/auth/login sa unetim podacima', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ role: 'user', username: 'una', user_id: 7 }),
    });
    render(<Login onLoginSuccess={() => {}} />);

    fillAndSubmit();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/\/api\/auth\/login$/);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ username: 'una', password: 'tajna' });
  });

  it('pri uspehu poziva onLoginSuccess sa role, username, user_id i token-om', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ role: 'admin', username: 'una', user_id: 7, token: 'jwt-token-123' }),
    });
    const onLoginSuccess = jest.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    fillAndSubmit();

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith('admin', 'una', 7, 'jwt-token-123'));
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it('prikazuje grešku sa servera pri neuspešnom loginu', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });
    const onLoginSuccess = jest.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    fillAndSubmit('una', 'pogresna');

    expect(await screen.findByText(/Error: Invalid credentials/i)).toBeInTheDocument();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('prikazuje poruku kada server nije dostupan', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));
    render(<Login />);

    fillAndSubmit();

    expect(await screen.findByText(/Server is not available/i)).toBeInTheDocument();
  });
});