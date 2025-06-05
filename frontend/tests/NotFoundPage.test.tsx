import { render, screen } from '@testing-library/react';
import NotFoundPage from '../src/pages/NotFoundPage';

test('renders not found message', () => {
  render(<NotFoundPage />);
  expect(screen.getByText('Page not found.')).toBeInTheDocument();
});
