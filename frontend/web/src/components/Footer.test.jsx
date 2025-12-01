import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Footer from './Footer';

test('Footer deve renderizar o texto de direitos autorais', () => {
  render(<Footer />);
  const textoCopyright = screen.getByText(/2025 EcoDenúncia/i);
  expect(textoCopyright).toBeInTheDocument();
});