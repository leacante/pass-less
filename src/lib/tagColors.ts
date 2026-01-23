// 10 colores compatibles con el tema de la aplicación
export const TAG_COLORS = [
  '#4ade80', // Verde (accent-green)
  '#6ee7b7', // Mint (accent-mint)
  '#60a5fa', // Azul (accent-blue)
  '#fbbf24', // Amarillo (accent-yellow)
  '#f97316', // Naranja
  '#ec4899', // Rosa
  '#a78bfa', // Púrpura
  '#14b8a6', // Teal
  '#84cc16', // Lima
  '#f43f5e', // Rojo-rosa
] as const;

export function getRandomTagColor(): string {
  const randomIndex = Math.floor(Math.random() * TAG_COLORS.length);
  return TAG_COLORS[randomIndex];
}
