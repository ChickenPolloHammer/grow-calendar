// Fases como proporciones del ciclo total (0.0 – 1.0)
// Permite escalar a cualquier duración: 60 días, 90 días, 140 días...
export const PHASE_RATIOS = {
  seedling:  { label: 'Plántula',      color: '#7eb88a', start: 0.00, end: 0.10 },
  veg:       { label: 'Vegetativo',    color: '#4a7c59', start: 0.10, end: 0.40 },
  preflower: { label: 'Pre-floración', color: '#d4820a', start: 0.40, end: 0.50 },
  flower:    { label: 'Floración',     color: '#c76b2a', start: 0.50, end: 0.80 },
  ripening:  { label: 'Maduración',    color: '#8b4513', start: 0.80, end: 0.90 },
  flush:     { label: 'Lavado',        color: '#3a7ca8', start: 0.90, end: 1.00 },
};

export const BASE_TOTAL_WEEKS = 20; // fallback sin fechas

// Construye el mapa de fases en semanas absolutas para un ciclo dado
export function buildScaledPhases(totalWeeks) {
  const tw = Math.max(4, totalWeeks || BASE_TOTAL_WEEKS);
  const result = {};
  for (const [key, ratio] of Object.entries(PHASE_RATIOS)) {
    const startW = Math.max(1, Math.round(ratio.start * tw) + 1);
    const endW   = Math.min(tw, Math.round(ratio.end * tw));
    const weeks  = [];
    for (let w = startW; w <= endW; w++) weeks.push(w);
    if (weeks.length === 0) weeks.push(startW); // garantizar al menos 1 semana
    result[key] = { ...ratio, weeks };
  }
  return result;
}

export function getPhaseForWeek(week, phases) {
  const ph = phases || buildScaledPhases(BASE_TOTAL_WEEKS);
  for (const [key, phase] of Object.entries(ph)) {
    if (phase.weeks.includes(week)) return { key, ...phase };
  }
  return null;
}

// -------------------------------------------------------------------
// Programa base en RATIOS (0.0 – 1.0 dentro del ciclo)
// El usuario edita nombres y dosis; la posición en el ciclo es automática
// -------------------------------------------------------------------
export const DEFAULT_SCHEDULE_BASE = [
  { ratio: 0.00, products: [] },
  { ratio: 0.05, products: [{ name: 'Grow A+B', dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.10, products: [{ name: 'Grow A+B', dose: 1,   unit: 'ml/L' }, { name: 'Estimulador raíz', dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.15, products: [{ name: 'Grow A+B', dose: 1.5, unit: 'ml/L' }, { name: 'Estimulador raíz', dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.20, products: [{ name: 'Grow A+B', dose: 2,   unit: 'ml/L' }, { name: 'Vitaminas',        dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.25, products: [{ name: 'Grow A+B', dose: 2,   unit: 'ml/L' }, { name: 'Vitaminas',        dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.30, products: [{ name: 'Grow A+B', dose: 2,   unit: 'ml/L' }, { name: 'PK Booster',       dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.35, products: [{ name: 'Grow A+B', dose: 1.5, unit: 'ml/L' }, { name: 'PK Booster',       dose: 1,   unit: 'ml/L' }] },
  { ratio: 0.40, products: [{ name: 'Bloom A+B', dose: 1.5, unit: 'ml/L' }, { name: 'PK Booster',      dose: 1,   unit: 'ml/L' }] },
  { ratio: 0.45, products: [{ name: 'Bloom A+B', dose: 2,   unit: 'ml/L' }, { name: 'PK Booster',      dose: 1.5, unit: 'ml/L' }] },
  { ratio: 0.50, products: [{ name: 'Bloom A+B', dose: 2,   unit: 'ml/L' }, { name: 'PK Booster',      dose: 2,   unit: 'ml/L' }, { name: 'Estimulador flor', dose: 1, unit: 'ml/L' }] },
  { ratio: 0.58, products: [{ name: 'Bloom A+B', dose: 2,   unit: 'ml/L' }, { name: 'PK Booster',      dose: 2,   unit: 'ml/L' }, { name: 'Estimulador flor', dose: 1, unit: 'ml/L' }] },
  { ratio: 0.65, products: [{ name: 'Bloom A+B', dose: 2,   unit: 'ml/L' }, { name: 'PK Booster',      dose: 2.5, unit: 'ml/L' }, { name: 'Estimulador flor', dose: 1, unit: 'ml/L' }] },
  { ratio: 0.70, products: [{ name: 'Bloom A+B', dose: 1.5, unit: 'ml/L' }, { name: 'PK Booster',      dose: 2,   unit: 'ml/L' }] },
  { ratio: 0.75, products: [{ name: 'Bloom A+B', dose: 1,   unit: 'ml/L' }, { name: 'PK Booster',      dose: 1,   unit: 'ml/L' }] },
  { ratio: 0.80, products: [{ name: 'Bloom A+B', dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.85, products: [{ name: 'Bloom A+B', dose: 0.5, unit: 'ml/L' }] },
  { ratio: 0.90, products: [] },
  { ratio: 0.95, products: [] },
  { ratio: 1.00, products: [] },
];

// Convierte el programa base (ratios) a semanas absolutas para el ciclo real
// Evita colisiones: si dos ratios caen en la misma semana, los productos se fusionan
export function buildScheduleForCycle(totalWeeks, customBase) {
  const base = customBase || DEFAULT_SCHEDULE_BASE;
  const tw = Math.max(4, totalWeeks || BASE_TOTAL_WEEKS);

  const weekMap = {};
  base.forEach(entry => {
    const week = Math.max(1, Math.min(tw, Math.round(entry.ratio * tw) || 1));
    if (!weekMap[week]) weekMap[week] = [];
    // Fusionar productos si hay colisión de semana
    entry.products.forEach(p => {
      const existing = weekMap[week].find(x => x.name === p.name);
      if (!existing) weekMap[week].push({ ...p });
    });
  });

  const result = [];
  for (let w = 1; w <= tw; w++) {
    result.push({ week: w, products: weekMap[w] || [] });
  }
  return result;
}

// Fallback de 20 semanas para cuando no hay fechas configuradas
export const DEFAULT_SCHEDULE = buildScheduleForCycle(BASE_TOTAL_WEEKS);
