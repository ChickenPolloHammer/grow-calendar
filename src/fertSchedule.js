// Semanas desde germinación -> productos y dosis recomendadas
// El usuario puede personalizar sus productos en la config
// Por defecto usamos nombres genéricos adaptables

export const PHASES = {
  seedling: { label: 'Plántula', color: '#7eb88a', weeks: [1, 2] },
  veg: { label: 'Vegetativo', color: '#4a7c59', weeks: [3, 4, 5, 6, 7, 8] },
  preflower: { label: 'Pre-floración', color: '#d4820a', weeks: [9, 10] },
  flower: { label: 'Floración', color: '#c76b2a', weeks: [11, 12, 13, 14, 15, 16] },
  ripening: { label: 'Maduración', color: '#8b4513', weeks: [17, 18] },
  flush: { label: 'Lavado', color: '#3a7ca8', weeks: [19, 20] },
};

export function getPhaseForWeek(week) {
  for (const [key, phase] of Object.entries(PHASES)) {
    if (phase.weeks.includes(week)) return { key, ...phase };
  }
  return null;
}

// Programa de fertilización por defecto (ml/L o g/L)
// El usuario puede editar los nombres de productos y dosis
export const DEFAULT_SCHEDULE = [
  { week: 1, products: [] },
  { week: 2, products: [{ name: 'Grow A+B', dose: 0.5, unit: 'ml/L' }] },
  { week: 3, products: [{ name: 'Grow A+B', dose: 1, unit: 'ml/L' }, { name: 'Estimulador raíz', dose: 0.5, unit: 'ml/L' }] },
  { week: 4, products: [{ name: 'Grow A+B', dose: 1.5, unit: 'ml/L' }, { name: 'Estimulador raíz', dose: 0.5, unit: 'ml/L' }] },
  { week: 5, products: [{ name: 'Grow A+B', dose: 2, unit: 'ml/L' }, { name: 'Vitaminas', dose: 0.5, unit: 'ml/L' }] },
  { week: 6, products: [{ name: 'Grow A+B', dose: 2, unit: 'ml/L' }, { name: 'Vitaminas', dose: 0.5, unit: 'ml/L' }] },
  { week: 7, products: [{ name: 'Grow A+B', dose: 2, unit: 'ml/L' }, { name: 'PK Booster', dose: 0.5, unit: 'ml/L' }] },
  { week: 8, products: [{ name: 'Grow A+B', dose: 1.5, unit: 'ml/L' }, { name: 'PK Booster', dose: 1, unit: 'ml/L' }] },
  { week: 9, products: [{ name: 'Bloom A+B', dose: 1.5, unit: 'ml/L' }, { name: 'PK Booster', dose: 1, unit: 'ml/L' }] },
  { week: 10, products: [{ name: 'Bloom A+B', dose: 2, unit: 'ml/L' }, { name: 'PK Booster', dose: 1.5, unit: 'ml/L' }] },
  { week: 11, products: [{ name: 'Bloom A+B', dose: 2, unit: 'ml/L' }, { name: 'PK Booster', dose: 2, unit: 'ml/L' }, { name: 'Estimulador flor', dose: 1, unit: 'ml/L' }] },
  { week: 12, products: [{ name: 'Bloom A+B', dose: 2, unit: 'ml/L' }, { name: 'PK Booster', dose: 2, unit: 'ml/L' }, { name: 'Estimulador flor', dose: 1, unit: 'ml/L' }] },
  { week: 13, products: [{ name: 'Bloom A+B', dose: 2, unit: 'ml/L' }, { name: 'PK Booster', dose: 2.5, unit: 'ml/L' }, { name: 'Estimulador flor', dose: 1, unit: 'ml/L' }] },
  { week: 14, products: [{ name: 'Bloom A+B', dose: 1.5, unit: 'ml/L' }, { name: 'PK Booster', dose: 2, unit: 'ml/L' }] },
  { week: 15, products: [{ name: 'Bloom A+B', dose: 1, unit: 'ml/L' }, { name: 'PK Booster', dose: 1, unit: 'ml/L' }] },
  { week: 16, products: [{ name: 'Bloom A+B', dose: 0.5, unit: 'ml/L' }] },
  { week: 17, products: [{ name: 'Bloom A+B', dose: 0.5, unit: 'ml/L' }] },
  { week: 18, products: [] },
  { week: 19, products: [] },
  { week: 20, products: [] },
];
