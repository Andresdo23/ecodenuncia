import { expect, test } from 'vitest';
import { truncarTexto } from './formatters';

test('truncarTexto deve retornar "N/A" se o texto for nulo', () => {
  expect(truncarTexto(null, 10)).toBe("N/A");
});

test('truncarTexto não deve alterar textos curtos', () => {
  const texto = "Oi";
  expect(truncarTexto(texto, 10)).toBe("Oi");
});

test('truncarTexto deve adicionar reticências em textos longos', () => {
  const texto = "Este texto é muito longo para caber na tabela";
  const limite = 10;
  expect(truncarTexto(texto, limite)).toBe("Este texto...");
});