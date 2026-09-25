import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('offers login and signup before opening the dashboard', () => {
  render(<App />);

  expect(screen.getByText(/smarthome supermarket/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
  expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
});

test('shows the status message in a dismissible alert box', () => {
  render(<App />);

  const strip = screen.getByRole('region', { name: /store status/i });
  expect(strip).toBeInTheDocument();
  expect(screen.getByText(/ready for the next customer\./i)).toBeInTheDocument();

  const closeButton = screen.getByRole('button', { name: /close message/i });
  fireEvent.click(closeButton);

  expect(screen.queryByText(/ready for the next customer\./i)).not.toBeInTheDocument();
  expect(screen.getByRole('region', { name: /store status/i })).toBeInTheDocument();
});
