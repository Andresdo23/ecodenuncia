export const truncarTexto = (texto, limite) => {
  if (!texto) return "N/A";
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + "...";
};