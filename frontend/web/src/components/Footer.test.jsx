import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import React from 'react';
import Footer from './Footer'; // Importa o seu componente

test('Footer deve renderizar o texto de direitos autorais', () => {
  // 1. Renderiza o componente num "navegador falso" (jsdom)
  render(<Footer />);

  // 2. Procura pelo texto na tela
  const textoCopyright = screen.getByText(/2025 EcoDenúncia/i);

  // 3. Verifica se ele existe no documento
  expect(textoCopyright).toBeInTheDocument();
});