import React, { useState } from 'react';
import { DEFAULT_SCHEDULE_BASE } from '../fertSchedule';

// El editor trabaja sobre el scheduleBase (ratios + productos)
// y muestra la semana real equivalente según el ciclo del usuario
export default function ScheduleEditor({ scheduleBase, scaledSchedule, totalCycleWeeks, phases, onSave, onClose }) {
  const [localBase, setLocalBase] = useState(
    (scheduleBase || DEFAULT_SCHEDULE_BASE).map(s => ({ ...s, products: s.products.map(p => ({ ...p })) }))
  );

  function updateProduct(baseIdx, prodIdx, field, value) {
    setLocalBase(prev => prev.map((entry, ei) =>
      ei === baseIdx
        ? { ...entry, products: entry.products.map((p, pi) => pi === prodIdx ? { ...p, [field]: value } : p) }
        : entry
    ));
  }

  function addProduct(baseIdx) {
    setLocalBase(prev => prev.map((entry, ei) =>
      ei === baseIdx
        ? { ...entry, products: [...entry.products, { name: '', dose: 1, unit: 'ml/L' }] }
        : entry
    ));
  }

  function removeProduct(baseIdx, prodIdx) {
    setLocalBase(prev => prev.map((entry, ei) =>
      ei === baseIdx
        ? { ...entry, products: entry.products.filter((_, pi) => pi !== prodIdx) }
        : entry
    ));
  }

  // Agrupar entradas del programa base por fase
  const phasesList = phases ? Object.values(phases) : [];

  function getPhaseForRatio(ratio) {
    for (const phase of phasesList) {
      const phaseStart = phase.weeks[0] / totalCycleWeeks;
      const phaseEnd = (phase.weeks[phase.weeks.length - 1] + 1) / totalCycleWeeks;
      if (ratio >= phaseStart - 0.01 && ratio < phaseEnd + 0.01) return phase;
    }
    return null;
  }

  // Calcular la semana real que corresponde a cada entrada del base
  function getRealWeek(ratio) {
    return Math.max(1, Math.min(totalCycleWeeks, Math.round(ratio * totalCycleWeeks) || 1));
  }

  // Agrupar las entradas base por fase
  const grouped = {};
  localBase.forEach((entry, idx) => {
    const phase = getPhaseForRatio(entry.ratio);
    const key = phase ? phase.label : 'Sin fase';
    if (!grouped[key]) grouped[key] = { phase, entries: [] };
    grouped[key].entries.push({ ...entry, idx });
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,46,26,0.5)',
      zIndex: 2000, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '20px 12px',
    }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 680, height: 'fit-content', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid #ede9e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1a2e1a' }}>
              Programa de fertilización
            </span>
            <div style={{ fontSize: 12, color: '#7a7060', marginTop: 2 }}>
              {totalCycleWeeks === 20
                ? 'Sin fechas configuradas — ciclo base de 20 semanas (~140 días)'
                : `Ciclo de ${totalCycleWeeks} semanas — ajustado a tu ciclo real`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#7a7060', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '12px 24px', maxHeight: '75vh', overflowY: 'auto' }}>
          {Object.entries(grouped).map(([phaseName, { phase, entries }]) => (
            <div key={phaseName} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {phase && <div style={{ width: 10, height: 10, borderRadius: '50%', background: phase.color }} />}
                <span style={{ fontWeight: 600, color: '#1a2e1a', fontSize: 14 }}>{phaseName}</span>
                {phase && (
                  <span style={{ fontSize: 12, color: '#7a7060' }}>
                    S{phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]}
                  </span>
                )}
              </div>

              {entries.map(({ idx, ratio, products }) => {
                const realWeek = getRealWeek(ratio);
                return (
                  <div key={idx} style={{ marginBottom: 8, paddingLeft: 18, borderLeft: `2px solid ${phase ? phase.color + '40' : '#ede9e2'}` }}>
                    <div style={{ fontSize: 12, color: '#7a7060', marginBottom: 4, fontWeight: 500 }}>
                      Semana {realWeek}
                    </div>
                    {products.map((prod, pi) => (
                      <div key={pi} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                        <input
                          value={prod.name}
                          onChange={e => updateProduct(idx, pi, 'name', e.target.value)}
                          placeholder="Nombre del producto"
                          style={{ flex: 2, padding: '5px 8px', borderRadius: 5, border: '0.5px solid #d8d2c8', fontSize: 13 }}
                        />
                        <input
                          type="number" min="0" step="0.1"
                          value={prod.dose}
                          onChange={e => updateProduct(idx, pi, 'dose', parseFloat(e.target.value))}
                          style={{ width: 70, padding: '5px 8px', borderRadius: 5, border: '0.5px solid #d8d2c8', fontSize: 13 }}
                        />
                        <select
                          value={prod.unit}
                          onChange={e => updateProduct(idx, pi, 'unit', e.target.value)}
                          style={{ padding: '5px 6px', borderRadius: 5, border: '0.5px solid #d8d2c8', fontSize: 12 }}
                        >
                          <option>ml/L</option>
                          <option>g/L</option>
                          <option>ml</option>
                          <option>g</option>
                        </select>
                        <button
                          onClick={() => removeProduct(idx, pi)}
                          style={{ background: 'none', border: 'none', color: '#c76b2a', fontSize: 16, padding: '0 4px', cursor: 'pointer' }}
                        >×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => addProduct(idx)}
                      style={{ fontSize: 12, color: '#4a7c59', background: 'none', border: 'none', marginTop: 2, cursor: 'pointer' }}
                    >+ Añadir producto</button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '0.5px solid #ede9e2', display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 6, border: '0.5px solid #d8d2c8', background: '#fff', color: '#7a7060', fontSize: 14, cursor: 'pointer' }}
          >Cancelar</button>
          <button
            onClick={() => { onSave(localBase); onClose(); }}
            style={{ flex: 2, padding: '10px', borderRadius: 6, border: 'none', background: '#4a7c59', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >Guardar programa</button>
        </div>
      </div>
    </div>
  );
}
