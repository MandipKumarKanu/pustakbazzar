// client/src/tests/PrimaryBtn.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrimaryBtn from '../components/PrimaryBtn'; // Adjust path

describe('PrimaryBtn Component', () => {
  it('should render the button with the given name', () => {
    render(<PrimaryBtn name="Click Me" />);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('should apply additional styles if provided', () => {
    render(<PrimaryBtn name="Styled Button" style="custom-style" />);
    const buttonElement = screen.getByRole('button', { name: /Styled Button/i });
    expect(buttonElement).toHaveClass('custom-style');
  });

  // it('should be disabled if disabled prop is true', () => {
  //   render(<PrimaryBtn name="Disabled Button" disabled={true} />);
  //   const buttonElement = screen.getByRole('button', { name: /Disabled Button/i });
  //   expect(buttonElement).toBeDisabled();
  // });
});
