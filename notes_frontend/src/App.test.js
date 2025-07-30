import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NotesApp title in header', () => {
  render(<App />);
  expect(screen.getByText(/NotesApp/i)).toBeInTheDocument();
});
