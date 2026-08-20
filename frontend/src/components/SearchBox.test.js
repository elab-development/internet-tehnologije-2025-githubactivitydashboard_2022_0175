import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from './SearchBox';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SearchBox', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('poziva setUsername pri unosu teksta', () => {
    const setUsername = jest.fn();
    render(<SearchBox username="" setUsername={setUsername} />);

    fireEvent.change(screen.getByPlaceholderText(/Enter @username/i), { target: { value: 'torvalds' } });

    expect(setUsername).toHaveBeenCalledWith('torvalds');
  });

  it('navigira na /repo/ kada unos sadrži kosu crtu', () => {
    render(<SearchBox username="facebook/react" setUsername={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /go/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/repo/facebook/react');
  });

  it('navigira na /user/ i uklanja @ iz unosa', () => {
    render(<SearchBox username="  @torvalds " setUsername={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /go/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/user/torvalds');
  });

  it('pokreće pretragu na Enter', () => {
    render(<SearchBox username="torvalds" setUsername={() => {}} />);

    fireEvent.keyDown(screen.getByPlaceholderText(/Enter @username/i), { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/user/torvalds');
  });

  it('ne navigira kada je unos prazan', () => {
    render(<SearchBox username="" setUsername={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /go/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});