import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('prikazuje glavni naslov i slogan', () => {
    render(<Header />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/GITHUB ACTIVITY/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/DASHBOARD/i);
    expect(screen.getByText(/Transparent Analytics/i)).toBeInTheDocument();
  });
});